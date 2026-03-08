#!/usr/bin/env bash
set -euo pipefail

echo "================================================"
echo "Start All Development Servers"
echo "================================================"

# Check if .env exists
if [ ! -f .env ]; then
  echo "[ERROR] .env file not found"
  echo "Please copy .env.example to .env and configure it"
  exit 1
fi

# Load environment
source .env

echo ""
echo "Starting services in the following order:"
echo "  1. PostgreSQL (assumed running)"
echo "  2. Core API (port 3001)"
echo "  3. BFF (port 3000)"
echo "  4. Angular Admin Portal (port 4200)"
echo ""

# Function to kill all background jobs on exit
cleanup() {
  echo ""
  echo "Shutting down all servers..."
  jobs -p | xargs -r kill 2>/dev/null || true
  exit
}
trap cleanup EXIT INT TERM

# Check if PostgreSQL is accessible
echo "[1/4] Checking PostgreSQL..."
if command -v psql &> /dev/null; then
  if psql "${DATABASE_URL}" -c "SELECT 1" &>/dev/null; then
    echo "  ✓ PostgreSQL is running and accessible"
  else
    echo "  ✗ Cannot connect to PostgreSQL"
    echo "  Please ensure PostgreSQL is running on port 5432"
    exit 1
  fi
else
  echo "  ⚠ psql not installed - skipping connection check"
fi

echo ""
echo "[2/4] Starting Core API (port 3001)..."
(cd apps/api/core-api && PORT=3001 pnpm tsx src/server.ts) > logs/core-api.log 2>&1 &
CORE_API_PID=$!
echo "  ✓ Core API started (PID: $CORE_API_PID)"
sleep 2

echo ""
echo "[3/4] Starting BFF (port 3000)..."
(cd apps/api/bff && PORT=3000 pnpm tsx src/server.ts) > logs/bff.log 2>&1 &
BFF_PID=$!
echo "  ✓ BFF started (PID: $BFF_PID)"
sleep 2

echo ""
echo "[4/4] Starting Angular Admin Portal (port 4200)..."
pnpm start:web-admin > logs/angular.log 2>&1 &
ANGULAR_PID=$!
echo "  ✓ Angular started (PID: $ANGULAR_PID)"

echo ""
echo "================================================"
echo "[SUCCESS] All servers started!"
echo "================================================"
echo ""
echo "Services:"
echo "  Angular:  http://localhost:4200"
echo "  BFF:      http://localhost:3000"
echo "  Core API: http://localhost:3001"
echo ""
echo "Logs:"
echo "  tail -f logs/angular.log"
echo "  tail -f logs/bff.log"
echo "  tail -f logs/core-api.log"
echo ""
echo "Press Ctrl+C to stop all servers"
echo "================================================"

# Wait for all background processes
wait
