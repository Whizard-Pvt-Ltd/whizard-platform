#!/usr/bin/env bash
set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "================================================"
echo "Start All Development Servers"
echo "================================================"

# Check if .env exists
if [ ! -f .env ]; then
  echo -e "${RED}[ERROR] .env file not found${NC}"
  echo "Please copy .env.example to .env and configure it"
  exit 1
fi

# Load environment
source .env

# Create logs directory if it doesn't exist
mkdir -p logs

echo ""
echo "Starting services in the following order:"
echo "  1. PostgreSQL (assumed running)"
echo "  2. Core API (port 3001)"
echo "  3. BFF (port 3000)"
echo "  4. Angular Admin Portal (port 4200)"
echo ""

# Array to track PIDs for cleanup
PIDS=()

# Function to kill all background jobs on exit
cleanup() {
  echo ""
  echo -e "${YELLOW}Shutting down all servers...${NC}"

  # Kill all tracked PIDs
  for pid in "${PIDS[@]}"; do
    if kill -0 "$pid" 2>/dev/null; then
      echo "  Stopping process $pid..."
      kill "$pid" 2>/dev/null || true
    fi
  done

  # Kill any remaining background jobs
  jobs -p | xargs -r kill 2>/dev/null || true

  echo -e "${GREEN}All servers stopped${NC}"
  exit
}
trap cleanup EXIT INT TERM

# Function to check if a port is in use
check_port() {
  local port=$1
  if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
    return 0  # Port is in use
  else
    return 1  # Port is free
  fi
}

# Function to wait for port to be listening
wait_for_port() {
  local port=$1
  local timeout=$2
  local service_name=$3
  local elapsed=0

  while [ $elapsed -lt $timeout ]; do
    if check_port $port; then
      return 0
    fi
    sleep 0.5
    elapsed=$((elapsed + 1))
  done

  echo -e "${RED}  ✗ $service_name failed to start (timeout waiting for port $port)${NC}"
  return 1
}

# Function to check if process is still running
check_process() {
  local pid=$1
  if kill -0 "$pid" 2>/dev/null; then
    return 0
  else
    return 1
  fi
}

# Function to show last few lines of log on failure
show_error_log() {
  local log_file=$1
  local service_name=$2

  echo -e "${RED}Last 10 lines of $service_name log:${NC}"
  echo "----------------------------------------"
  tail -n 10 "$log_file" 2>/dev/null || echo "No log file found"
  echo "----------------------------------------"
  echo -e "${YELLOW}Full log: tail -f $log_file${NC}"
}

# Check if PostgreSQL is accessible
echo -e "${BLUE}[1/5] Checking PostgreSQL...${NC}"
if command -v psql &> /dev/null; then
  if psql "${DATABASE_URL}" -c "SELECT 1" &>/dev/null; then
    echo -e "${GREEN}  ✓ PostgreSQL is running and accessible${NC}"
  else
    echo -e "${RED}  ✗ Cannot connect to PostgreSQL${NC}"
    echo "  Please ensure PostgreSQL is running on port 5432"
    exit 1
  fi
else
  echo -e "${YELLOW}  ⚠ psql not installed - skipping connection check${NC}"
fi

# Check if required ports are available
echo ""
echo -e "${BLUE}[2/5] Checking port availability...${NC}"
PORTS_NEEDED=(3000 3001 4200)
PORTS_IN_USE=()

for port in "${PORTS_NEEDED[@]}"; do
  if check_port $port; then
    PORTS_IN_USE+=($port)
    echo -e "${RED}  ✗ Port $port is already in use${NC}"
    # Show which process is using the port
    PID=$(lsof -ti:$port | head -1)
    if [ -n "$PID" ]; then
      PROCESS=$(ps -p $PID -o comm= 2>/dev/null || echo "unknown")
      echo -e "${YELLOW}    Process: $PROCESS (PID: $PID)${NC}"
      echo -e "${YELLOW}    To kill: kill -9 $PID${NC}"
    fi
  fi
done

if [ ${#PORTS_IN_USE[@]} -gt 0 ]; then
  echo ""
  echo -e "${RED}[ERROR] Required ports are in use: ${PORTS_IN_USE[*]}${NC}"
  echo "Please stop the processes using these ports and try again"
  echo ""
  echo "Quick fix - kill all processes on these ports:"
  echo "  kill -9 \$(lsof -ti:${PORTS_IN_USE[*]} | tr '\n' ' ')"
  exit 1
fi
echo -e "${GREEN}  ✓ All required ports are available${NC}"

# Start Core API
echo ""
echo -e "${BLUE}[3/5] Starting Core API (port 3001)...${NC}"
CORE_API_PORT=3001 pnpm tsx apps/api/core-api/src/server.ts > logs/core-api.log 2>&1 &
CORE_API_PID=$!
PIDS+=($CORE_API_PID)
echo "  Process started (PID: $CORE_API_PID)"

# Wait for Core API to start
if wait_for_port 3001 10 "Core API" && check_process $CORE_API_PID; then
  echo -e "${GREEN}  ✓ Core API started successfully${NC}"
  echo -e "${YELLOW}  Log: tail -f logs/core-api.log${NC}"
else
  if ! check_process $CORE_API_PID; then
    echo -e "${RED}  ✗ Core API process died${NC}"
    show_error_log "logs/core-api.log" "Core API"
  fi
  exit 1
fi

# Start BFF
echo ""
echo -e "${BLUE}[4/5] Starting BFF (port 3000)...${NC}"
BFF_PORT=3000 pnpm tsx apps/api/bff/src/server.ts > logs/bff.log 2>&1 &
BFF_PID=$!
PIDS+=($BFF_PID)
echo "  Process started (PID: $BFF_PID)"

# Wait for BFF to start
if wait_for_port 3000 10 "BFF" && check_process $BFF_PID; then
  echo -e "${GREEN}  ✓ BFF started successfully${NC}"
  echo -e "${YELLOW}  Log: tail -f logs/bff.log${NC}"
else
  if ! check_process $BFF_PID; then
    echo -e "${RED}  ✗ BFF process died${NC}"
    show_error_log "logs/bff.log" "BFF"
  fi
  exit 1
fi

# Start Angular
echo ""
echo -e "${BLUE}[5/5] Starting Angular Admin Portal (port 4200)...${NC}"
pnpm start:web-admin > logs/angular.log 2>&1 &
ANGULAR_PID=$!
PIDS+=($ANGULAR_PID)
echo "  Process started (PID: $ANGULAR_PID)"
echo -e "${YELLOW}  Angular build takes ~15-30 seconds...${NC}"

# Wait for Angular to start (it takes longer)
if wait_for_port 4200 60 "Angular"; then
  echo -e "${GREEN}  ✓ Angular started successfully${NC}"
  echo -e "${YELLOW}  Log: tail -f logs/angular.log${NC}"
else
  if ! check_process $ANGULAR_PID; then
    echo -e "${RED}  ✗ Angular process died${NC}"
    show_error_log "logs/angular.log" "Angular"
  else
    echo -e "${YELLOW}  ⚠ Angular is still starting (check logs)${NC}"
  fi
fi

echo ""
echo "================================================"
echo -e "${GREEN}[SUCCESS] All servers started!${NC}"
echo "================================================"
echo ""
echo -e "${BLUE}Services:${NC}"
echo "  Angular:  http://localhost:4200"
echo "  BFF:      http://localhost:3000"
echo "  Core API: http://localhost:3001"
echo ""
echo -e "${BLUE}View logs in real-time:${NC}"
echo "  tail -f logs/bff.log logs/core-api.log logs/angular.log"
echo ""
echo -e "${BLUE}Individual logs:${NC}"
echo "  tail -f logs/bff.log"
echo "  tail -f logs/core-api.log"
echo "  tail -f logs/angular.log"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"
echo "================================================"

# Keep script running and show combined logs
echo ""
echo -e "${BLUE}Streaming logs from all services (Ctrl+C to stop):${NC}"
echo "================================================"
tail -f logs/bff.log logs/core-api.log logs/angular.log
