# Viewing Application Logs

This guide explains how to view logs when running the Whizard Platform in different modes.

## Table of Contents

- [Development Mode (pnpm dev:all)](#development-mode-pnpm-devall)
- [Individual Services](#individual-services)
- [Log Formats](#log-formats)
- [Troubleshooting](#troubleshooting)

## Development Mode (pnpm dev:all)

When you run `pnpm dev:all`, the script provides an **improved developer experience** with:

### ✨ New Features (v2)

1. **✅ Port Availability Check** - Detects if ports 3000, 3001, 4200 are already in use
2. **✅ Sequential Startup with Health Checks** - Waits for each service to be ready before starting the next
3. **✅ Automatic Failure Detection** - Exits immediately if any service fails with error logs
4. **✅ Real-Time Log Streaming** - Shows all logs in your terminal automatically
5. **✅ Color-Coded Output** - Easy-to-read status messages

### What You'll See

When you run `pnpm dev:all`, you'll get **real-time feedback**:

```bash
================================================
Start All Development Servers
================================================

[1/5] Checking PostgreSQL...
  ✓ PostgreSQL is running and accessible

[2/5] Checking port availability...
  ✓ All required ports are available

[3/5] Starting Core API (port 3001)...
  Process started (PID: 12345)
  ✓ Core API started successfully
  Log: tail -f logs/core-api.log

[4/5] Starting BFF (port 3000)...
  Process started (PID: 12346)
  ✓ BFF started successfully
  Log: tail -f logs/bff.log

[5/5] Starting Angular Admin Portal (port 4200)...
  Process started (PID: 12347)
  Angular build takes ~15-30 seconds...
  ✓ Angular started successfully

================================================
[SUCCESS] All servers started!
================================================

Services:
  Angular:  http://localhost:4200
  BFF:      http://localhost:3000
  Core API: http://localhost:3001

Streaming logs from all services (Ctrl+C to stop):
================================================
==> logs/bff.log <==
[10:30:45] INFO (bff/bootstrap): BFF server started successfully

==> logs/core-api.log <==
[10:30:46] INFO (core-api/bootstrap): Core API server started successfully
```

### Automatic Failure Detection ❌

If a service fails to start (e.g., port already in use), the script will:

1. **Detect the failure** immediately
2. **Show the error logs** (last 10 lines)
3. **Exit with error code 1** (stops remaining services)

Example failure output:

```bash
[2/5] Checking port availability...
  ✗ Port 3000 is already in use
    Process: node (PID: 98765)
    To kill: kill -9 98765

[ERROR] Required ports are in use: 3000
Please stop the processes using these ports and try again

Quick fix - kill all processes on these ports:
  kill -9 $(lsof -ti:3000 | tr '\n' ' ')
```

Or if a service crashes after starting:

```bash
[4/5] Starting BFF (port 3000)...
  Process started (PID: 12346)
  ✗ BFF process died
Last 10 lines of BFF log:
----------------------------------------
[10:30:45] ERROR: Failed to start HTTP server
    error: "listen EADDRINUSE: address already in use 0.0.0.0:3000"
----------------------------------------
Full log: tail -f logs/bff.log
```

### Log File Locations

Logs are written to the `logs/` directory at the project root:

```
whizard-platform/
└── logs/
    ├── bff.log          # Backend for Frontend server logs
    ├── core-api.log     # Core API server logs
    └── angular.log      # Angular admin portal logs
```

### Viewing Logs in Real-Time

**Option 1: Watch all logs together (recommended)**
```bash
# View all three log files simultaneously
tail -f logs/bff.log logs/core-api.log logs/angular.log
```

This will show logs from all services with filenames as headers:
```
==> logs/bff.log <==
[10:30:45] INFO (bff/bootstrap): Starting BFF server bootstrap

==> logs/core-api.log <==
[10:30:46] INFO (core-api/bootstrap): Starting Core API server bootstrap

==> logs/angular.log <==
✔ Browser application bundle generation complete.
```

**Option 2: Watch individual logs**
```bash
# View only BFF logs
tail -f logs/bff.log

# View only Core API logs
tail -f logs/core-api.log

# View only Angular logs
tail -f logs/angular.log
```

**Option 3: Multi-pane terminal (tmux/iTerm2)**

If you use tmux or iTerm2, you can split your terminal into panes:

```bash
# Pane 1: BFF logs
tail -f logs/bff.log

# Pane 2: Core API logs (split terminal)
tail -f logs/core-api.log

# Pane 3: Angular logs (split terminal)
tail -f logs/angular.log
```

### Viewing Historical Logs

**View entire log file:**
```bash
cat logs/bff.log
less logs/bff.log  # With scrolling
```

**View last N lines:**
```bash
tail -n 50 logs/bff.log  # Last 50 lines
```

**Search logs:**
```bash
# Search for specific text
grep "error" logs/bff.log

# Search across all logs
grep -r "authentication" logs/

# Case-insensitive search
grep -i "failed" logs/bff.log
```

## Individual Services

When running services individually, logs appear directly in your terminal (stdout).

### Running BFF Only

```bash
pnpm dev:bff
```

Output appears directly in terminal:
```
[10:30:45] INFO (bff/bootstrap): Starting BFF server bootstrap
    port: 3000
    host: "0.0.0.0"
[10:30:45] DEBUG (bff/bootstrap): Fastify instance created
[10:30:45] INFO (bff/bootstrap): BFF server started successfully
    url: "http://0.0.0.0:3000"
```

### Running Core API Only

```bash
pnpm dev:core-api
```

Output appears directly in terminal:
```
[10:30:46] INFO (core-api/bootstrap): Starting Core API server bootstrap
    port: 3001
    host: "0.0.0.0"
[10:30:46] DEBUG (core-api/bootstrap): Fastify instance created
[10:30:46] INFO (core-api/bootstrap): Core API server started successfully
    url: "http://0.0.0.0:3001"
```

### Redirecting Individual Service Logs to Files

If you want to run a single service but save logs to a file:

```bash
# Run and save logs
pnpm dev:bff > my-bff-logs.txt 2>&1

# Run in background and save logs
pnpm dev:bff > logs/my-bff.log 2>&1 &

# View logs in real-time while saving
pnpm dev:bff 2>&1 | tee logs/my-bff.log
```

## Log Formats

### Development Environment (NODE_ENV=development)

**Pretty-printed format** with colors for easy reading:

```
[10:30:45] INFO (bff/auth): User login attempt
  actorUserAccountId: "system"
  tenantType: "SYSTEM"
  tenantId: "system"
  loginId: "us***@example.com"

[10:30:46] INFO (bff/auth): User login succeeded
  userAccountId: "cm9abc123"
  sessionId: "ses_xyz789"
```

### Production Environment (NODE_ENV=production)

**JSON format** for log aggregation systems:

```json
{"level":30,"time":1678964245000,"service":"bff","component":"auth","actorUserAccountId":"system","tenantType":"SYSTEM","tenantId":"system","loginId":"us***@example.com","msg":"User login attempt"}
{"level":30,"time":1678964246000,"service":"bff","component":"auth","userAccountId":"cm9abc123","sessionId":"ses_xyz789","msg":"User login succeeded"}
```

### Log Levels

Logs are color-coded in development mode:

- **DEBUG** (gray): Detailed technical information
- **INFO** (green): General application flow
- **WARN** (yellow): Potentially harmful situations
- **ERROR** (red): Error events

## Troubleshooting

### No logs appearing in files

**Check if services are running:**
```bash
ps aux | grep tsx
```

You should see processes like:
```
tsx apps/api/bff/src/server.ts
tsx apps/api/core-api/src/server.ts
```

**Check if log directory exists:**
```bash
ls -la logs/
```

If missing, create it:
```bash
mkdir -p logs
```

**Check file permissions:**
```bash
ls -la logs/
```

Ensure you have write permissions.

### Log files are empty

**Check for startup errors:**
```bash
# View the last few lines of each log
tail logs/bff.log
tail logs/core-api.log
```

**Check service status:**
```bash
# Check if ports are in use
lsof -i :3000  # BFF
lsof -i :3001  # Core API
lsof -i :4200  # Angular
```

### Services not starting

**View startup logs:**
```bash
# Try running services individually to see errors
pnpm dev:bff
pnpm dev:core-api
```

**Common issues:**
1. **Port already in use**: Another process is using the port
   ```bash
   # Kill process on port 3000
   kill -9 $(lsof -ti:3000)
   ```

2. **Database connection failed**: PostgreSQL not running
   ```bash
   # Check PostgreSQL status
   pg_isready
   ```

3. **Missing .env file**: Environment variables not configured
   ```bash
   # Copy example file
   cp .env.example .env
   ```

### Logs too verbose

**Reduce log level in .env:**
```bash
# Change from debug to info
LOG_LEVEL="info"

# Or only show warnings and errors
LOG_LEVEL="warn"
```

**Restart services after changing LOG_LEVEL:**
```bash
# Stop all services (Ctrl+C)
# Then restart
pnpm dev:all
```

### Want to see HTTP request logs

The Fastify HTTP logger automatically logs all incoming requests when LOG_LEVEL is set to "info" or "debug":

```
[10:30:47] INFO (bff/http): incoming request
  reqId: "req-1"
  req: {
    method: "POST",
    url: "/iam/auth/login",
    hostname: "localhost:3000"
  }

[10:30:47] INFO (bff/http): request completed
  reqId: "req-1"
  res: {
    statusCode: 200
  }
  responseTime: 45.2
```

### Searching for specific events

**Find all authentication attempts:**
```bash
grep "auth.login.attempt" logs/bff.log
```

**Find all errors:**
```bash
grep '"level":50' logs/bff.log  # Production JSON format
grep "ERROR" logs/bff.log        # Development format
```

**Find logs for specific user:**
```bash
grep "userAccountId.*cm9abc123" logs/bff.log
```

**Find logs within time range:**
```bash
# Development format (timestamp in HH:MM:SS)
grep "10:3[0-5]" logs/bff.log  # Between 10:30 and 10:35

# Production format (use jq for JSON parsing)
cat logs/bff.log | jq 'select(.time > 1678964245000)'
```

## Advanced: Log Analysis

### Using jq for JSON log parsing (Production)

Install jq: `brew install jq` (macOS) or `apt-get install jq` (Linux)

**Pretty-print JSON logs:**
```bash
cat logs/bff.log | jq '.'
```

**Filter by log level:**
```bash
# Only errors (level 50)
cat logs/bff.log | jq 'select(.level == 50)'

# Warnings and errors (level >= 40)
cat logs/bff.log | jq 'select(.level >= 40)'
```

**Extract specific fields:**
```bash
# Show only timestamps and messages
cat logs/bff.log | jq '{time, msg}'

# Show authentication events with user IDs
cat logs/bff.log | jq 'select(.msg | contains("auth")) | {msg, userAccountId, sessionId}'
```

### Log Rotation

For long-running development sessions, you might want to rotate logs:

**Manual rotation:**
```bash
# Archive current logs
mv logs/bff.log logs/bff-$(date +%Y%m%d-%H%M%S).log
mv logs/core-api.log logs/core-api-$(date +%Y%m%d-%H%M%S).log
mv logs/angular.log logs/angular-$(date +%Y%m%d-%H%M%S).log

# Restart services (new log files will be created)
pnpm dev:all
```

**Clean old logs:**
```bash
# Remove logs older than 7 days
find logs/ -name "*.log" -mtime +7 -delete
```

## Quick Reference

### Most Common Commands

```bash
# View all logs in real-time
tail -f logs/bff.log logs/core-api.log logs/angular.log

# View last 100 lines of BFF logs
tail -n 100 logs/bff.log

# Search for errors
grep -i error logs/*.log

# Check if services are running
ps aux | grep tsx

# Clear log files (while services are stopped)
> logs/bff.log
> logs/core-api.log
> logs/angular.log
```

### Keyboard Shortcuts

- `Ctrl+C`: Stop `tail -f` or kill services
- `q`: Quit `less` viewer
- `/`: Search in `less` viewer
- `Shift+G`: Jump to end of file in `less`
- `gg`: Jump to beginning of file in `less`

## Related Documentation

- [Logging Infrastructure Guide](./LOGGING.md) - Complete logging implementation guide
- [Environment Configuration](./.env) - Configuration options including LOG_LEVEL
