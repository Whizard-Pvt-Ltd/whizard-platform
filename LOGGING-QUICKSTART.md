# Logging Quick Start Guide

## TL;DR

### Running Services

```bash
# Start all services (automatic log streaming)
pnpm dev:all

# The script will:
# ✅ Check ports are available
# ✅ Start services sequentially
# ✅ Health check each service
# ✅ Stream logs to your terminal
# ❌ Exit immediately if any service fails
```

### Viewing Logs

Logs are **automatically streamed** when you run `pnpm dev:all`, but you can also view them separately:

```bash
# View all logs together
tail -f logs/bff.log logs/core-api.log logs/angular.log

# View individual service logs
tail -f logs/bff.log
tail -f logs/core-api.log
tail -f logs/angular.log
```

### Setting Log Level

Edit `.env` to control verbosity:

```bash
# Show everything (development)
LOG_LEVEL="debug"

# Show info, warn, error (default)
LOG_LEVEL="info"

# Show only warnings and errors (production)
LOG_LEVEL="warn"
```

Then restart services: `pnpm dev:all`

## Common Issues

### Port Already in Use

The script will detect this and show you how to fix it:

```bash
[ERROR] Required ports are in use: 3000

Quick fix - kill all processes on these ports:
  kill -9 $(lsof -ti:3000 | tr '\n' ' ')
```

### Service Won't Start

The script automatically shows error logs:

```bash
[4/5] Starting BFF (port 3000)...
  ✗ BFF process died
Last 10 lines of BFF log:
----------------------------------------
[10:30:45] ERROR: Failed to connect to database
    error: "Connection refused"
----------------------------------------
```

**Next steps:**
1. Check the full log: `tail -f logs/bff.log`
2. Verify PostgreSQL is running: `pg_isready`
3. Check your `.env` configuration

### Too Many Logs

Reduce verbosity in `.env`:

```bash
LOG_LEVEL="warn"  # Only show warnings and errors
```

## Using Logs in Code

### Application Bootstrap

```typescript
import { getOrCreateAppLogger } from '@whizard/shared-infrastructure';

// Get singleton logger for your application
const logger = getOrCreateAppLogger({ service: 'bff' });

logger.info('Application started', { port: 3000 });
```

### Component-Specific Logging

```typescript
// Create child logger with component context
const authLogger = getOrCreateAppLogger({ service: 'bff' })
  .child({ component: 'auth' });

authLogger.info('User login attempt', { userId: '123' });
// Logs: { service: 'bff', component: 'auth', userId: '123', msg: 'User login attempt' }
```

### Logging in Handlers

```typescript
export class MyHandler {
  constructor(
    private readonly logger: AppLogger
  ) {}

  async execute(command: MyCommand) {
    this.logger.info('Processing command', { commandId: command.id });

    try {
      // ... do work
      this.logger.info('Command completed', { commandId: command.id });
    } catch (error) {
      this.logger.error('Command failed', {
        commandId: command.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }
}
```

## Log Levels

| Level | When to Use | Example |
|-------|-------------|---------|
| **debug** | Technical details during development | `logger.debug('Query execution', { sql, params })` |
| **info** | Normal application flow, business events | `logger.info('User logged in', { userId })` |
| **warn** | Potentially harmful situations | `logger.warn('Rate limit approaching', { count: 95 })` |
| **error** | Error events | `logger.error('Database connection failed', { error })` |

## Automatic Features

### Sensitive Data Redaction

These fields are automatically redacted from logs:
- `password`, `passwordHash`
- `authorization` headers
- `accessToken`, `refreshToken`
- `cookie`, `set-cookie`

```typescript
logger.info('User auth', {
  email: 'user@example.com',
  password: 'secret123'  // Automatically becomes '[REDACTED]'
});
```

### Structured Logging

All logs include context automatically:

```json
{
  "level": 30,
  "time": 1678964245000,
  "service": "bff",
  "component": "auth",
  "env": "development",
  "userId": "123",
  "msg": "User logged in"
}
```

### Environment-Aware Formatting

**Development** (NODE_ENV=development):
```
[10:30:45] INFO (bff/auth): User logged in
  userId: "123"
```

**Production** (NODE_ENV=production):
```json
{"level":30,"time":1678964245000,"service":"bff","component":"auth","userId":"123","msg":"User logged in"}
```

## Full Documentation

- **[Logging Infrastructure Guide](./docs/architecture/LOGGING.md)** - Complete implementation details
- **[Viewing Logs Guide](./docs/runbooks/VIEWING-LOGS.md)** - Comprehensive log viewing guide
- **[Environment Configuration](./.env)** - All configuration options

## Need Help?

1. Check this guide first
2. Review full documentation above
3. View example usage in `apps/api/bff/src/server.ts`
4. Ask the team in #platform-engineering
