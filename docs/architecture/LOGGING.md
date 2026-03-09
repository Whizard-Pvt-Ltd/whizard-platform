# Logging Infrastructure Guide

## Overview

The Whizard Platform uses a centralized logging infrastructure built on [Pino](https://getpino.io/), a high-performance JSON logger for Node.js. This guide explains how to use logging throughout the platform and how to configure it for different environments.

## Table of Contents

- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Usage Patterns](#usage-patterns)
- [Log Levels](#log-levels)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Architecture

### Design Principles

1. **Singleton Pattern**: One logger instance per application (BFF, Core API, Workers)
2. **Child Loggers**: Component-specific loggers that inherit from the application logger
3. **Structured Logging**: All logs include contextual metadata (service, component, env)
4. **Sensitive Data Redaction**: Automatic removal of passwords, tokens, and credentials
5. **Environment-Aware**: Different formatting for development vs. production

### Components

```
libs/shared/infrastructure/src/logging.ts
├── AppLogger (interface)
├── PinoAppLogger (implementation)
├── createAppLogger() - Create new logger instance
├── getOrCreateAppLogger() - Get/create singleton logger
└── createPinoLoggerOptions() - Generate Pino configuration
```

## Quick Start

### Basic Usage

```typescript
import { getOrCreateAppLogger } from '@whizard/shared-infrastructure';

// Get the singleton logger for your application
const logger = getOrCreateAppLogger({ service: 'bff' });

// Log messages at different levels
logger.info('User logged in successfully', { userId: '123', sessionId: 'abc' });
logger.warn('Rate limit approaching', { currentRequests: 95, limit: 100 });
logger.error('Database connection failed', { error: err.message });
logger.debug('Processing request', { requestId: 'xyz', payload: data });
```

### Component-Specific Logging

```typescript
import { getOrCreateAppLogger } from '@whizard/shared-infrastructure';

// Create a child logger for a specific component
const authLogger = getOrCreateAppLogger({ service: 'bff' })
  .child({ component: 'auth' });

const accessLogger = getOrCreateAppLogger({ service: 'bff' })
  .child({ component: 'access' });

// All logs from authLogger will include { component: 'auth' }
authLogger.info('Authentication attempt', { loginId: 'user@example.com' });

// All logs from accessLogger will include { component: 'access' }
accessLogger.info('Permission check', { userId: '123', permission: 'IAM.READ' });
```

## Configuration

### Environment Variables

Configure logging behavior through environment variables in your `.env` file:

```bash
# Runtime environment (affects log formatting)
# Options: development, staging, production
NODE_ENV="development"

# Log level threshold
# Options: debug, info, warn, error
LOG_LEVEL="info"
```

### Log Level Hierarchy

Messages are only logged if they meet or exceed the configured `LOG_LEVEL`:

```
debug → info → warn → error
  ↑       ↑      ↑      ↑
 Most          Least
Verbose       Verbose
```

**Example**: If `LOG_LEVEL="info"`, then:
- ✅ `info`, `warn`, and `error` messages are logged
- ❌ `debug` messages are suppressed

### Recommended Settings by Environment

| Environment | NODE_ENV | LOG_LEVEL | Rationale |
|-------------|----------|-----------|-----------|
| **Local Development** | `development` | `debug` | See all details for debugging |
| **Staging** | `staging` | `info` | General flow without excessive detail |
| **Production** | `production` | `info` or `warn` | Balance observability with performance |

### Log Format by Environment

**Development (NODE_ENV=development)**:
```
[10:30:45] INFO (bff/auth): User logged in successfully
  userId: "123"
  sessionId: "abc-def"
```
- Human-readable timestamps
- Pretty-printed with colors
- Easy to scan during local development

**Production (NODE_ENV=production)**:
```json
{"level":30,"time":1678964245000,"service":"bff","component":"auth","userId":"123","sessionId":"abc-def","msg":"User logged in successfully"}
```
- JSON format for log aggregation systems (Datadog, Splunk, ELK)
- Efficient parsing and querying
- Minimal overhead

## Usage Patterns

### Application Bootstrap

```typescript
// apps/api/bff/src/server.ts
import { getOrCreateAppLogger, createPinoLoggerOptions } from '@whizard/shared-infrastructure';

// Get singleton logger for bootstrap phase
const bootstrapLogger = getOrCreateAppLogger({ service: 'bff' })
  .child({ component: 'bootstrap' });

bootstrapLogger.info('Starting BFF server', { port: 3000, host: '0.0.0.0' });

// Configure Fastify with Pino HTTP logger
const fastify = Fastify({
  logger: createPinoLoggerOptions({ service: 'bff', component: 'http' })
});
```

### Module Registration

```typescript
// apps/api/bff/src/modules/iam/auth/auth.module.ts
import { getOrCreateAppLogger } from '@whizard/shared-infrastructure';

export const registerIamAuthModule = async (app, deps) => {
  const logger = getOrCreateAppLogger({ service: 'bff' })
    .child({ component: 'iam-auth-module' });

  logger.debug('Registering IAM Auth module', { prefix: '/iam/auth' });

  await app.register((scope) => {
    logger.debug('Registering IAM Auth routes');
    registerIamAuthRoutes(scope, deps);
    logger.info('IAM Auth routes registered successfully');
  }, { prefix: '/iam/auth' });

  logger.info('IAM Auth module registered successfully');
};
```

### Domain/Application Layer

```typescript
// libs/contexts/identity-access/src/application/command-handlers/authenticate-with-password.handler.ts
import type { AppLogger } from '@whizard/shared-infrastructure';

export class AuthenticateWithPasswordHandler {
  constructor(
    // ... other dependencies
    private readonly logger: Pick<AppLogger, 'info' | 'warn'>
  ) {}

  async execute(command) {
    this.logger.info('auth.login.attempt', {
      actorUserAccountId: command.request.actorUserAccountId,
      loginId: maskLoginId(loginId)
    });

    // ... authentication logic

    this.logger.info('auth.login.succeeded', {
      userAccountId: userAccount.id.value,
      sessionId: sessionResult.sessionId
    });
  }
}
```

### Error Logging

```typescript
// Log errors with context
try {
  await performOperation();
} catch (error) {
  logger.error('Operation failed', {
    error: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
    operationId: '123',
    userId: 'user-456'
  });
  throw error;
}
```

## Log Levels

### debug

**When to use**: Detailed technical information useful during development and troubleshooting.

```typescript
logger.debug('Processing user request', {
  requestId: 'abc-123',
  payload: requestData,
  headers: sanitizedHeaders
});

logger.debug('Cache hit', { key: 'user:123', ttl: 3600 });
```

**Examples**:
- Function entry/exit with parameters
- Cache hits/misses
- Detailed state information
- Query execution details

### info

**When to use**: General application flow and business events. This is the default recommended level.

```typescript
logger.info('User authentication succeeded', {
  userId: '123',
  sessionId: 'abc',
  authMethod: 'password'
});

logger.info('Module registered successfully', {
  moduleName: 'iam-auth',
  routeCount: 5
});
```

**Examples**:
- User authentication/authorization events
- Business process milestones
- Service startup/shutdown
- Module/plugin registration
- Successful API calls

### warn

**When to use**: Potentially harmful situations that don't prevent the application from functioning.

```typescript
logger.warn('Rate limit approaching', {
  userId: '123',
  currentRequests: 95,
  limit: 100
});

logger.warn('Deprecated API usage', {
  endpoint: '/api/v1/users',
  deprecatedSince: '2024-01-01',
  replacement: '/api/v2/users'
});
```

**Examples**:
- Authentication failures
- Rate limiting
- Deprecated feature usage
- Configuration issues that have fallbacks
- Resource utilization warnings

### error

**When to use**: Error events that might still allow the application to continue.

```typescript
logger.error('Database query failed', {
  error: err.message,
  stack: err.stack,
  query: 'SELECT * FROM users WHERE id = $1',
  params: [userId]
});

logger.error('External API call failed', {
  error: err.message,
  service: 'payment-gateway',
  endpoint: '/api/charges',
  statusCode: 500
});
```

**Examples**:
- Database connection failures
- External API errors
- Unhandled exceptions
- Critical business rule violations
- System resource exhaustion

## Best Practices

### DO ✅

1. **Use structured logging with context objects**
   ```typescript
   // Good
   logger.info('User logged in', { userId: '123', ip: '192.168.1.1' });

   // Bad
   logger.info(`User 123 logged in from 192.168.1.1`);
   ```

2. **Mask sensitive data**
   ```typescript
   // Good
   logger.info('Login attempt', { loginId: maskLoginId('user@example.com') });
   // Logs: { loginId: 'us***@example.com' }

   // Bad
   logger.info('Login attempt', { password: 'secretPass123' });
   ```

3. **Use consistent event names**
   ```typescript
   // Good - dotted namespace
   logger.info('auth.login.attempt', { ... });
   logger.info('auth.login.succeeded', { ... });
   logger.warn('auth.login.failed', { ... });

   // Bad - inconsistent naming
   logger.info('trying to login', { ... });
   logger.info('Login Success!!', { ... });
   ```

4. **Include correlation IDs for request tracking**
   ```typescript
   logger.info('Processing request', {
     requestId: 'abc-123',
     userId: '456',
     operation: 'createOrder'
   });
   ```

5. **Log at appropriate levels**
   - Don't log everything at `info` level
   - Use `debug` for detailed technical info
   - Use `warn` for recoverable issues
   - Use `error` for actual errors

6. **Create child loggers for components**
   ```typescript
   // Good - component context is automatically included
   const authLogger = rootLogger.child({ component: 'auth' });
   authLogger.info('Processing login');
   // Logs: { service: 'bff', component: 'auth', msg: 'Processing login' }
   ```

### DON'T ❌

1. **Don't log sensitive data (passwords, tokens, credit cards)**
   ```typescript
   // Never do this!
   logger.info('User credentials', { password: user.password });
   logger.info('Auth header', { authorization: req.headers.authorization });
   ```

2. **Don't use console.log/console.error**
   ```typescript
   // Bad
   console.log('User logged in');

   // Good
   logger.info('User logged in', { userId: '123' });
   ```

3. **Don't log in tight loops without sampling**
   ```typescript
   // Bad - logs 10,000 times
   for (let i = 0; i < 10000; i++) {
     logger.debug('Processing item', { index: i });
   }

   // Good - sample every 100th iteration
   for (let i = 0; i < 10000; i++) {
     if (i % 100 === 0) {
       logger.debug('Processing batch', { startIndex: i, batchSize: 100 });
     }
   }
   ```

4. **Don't log entire large objects**
   ```typescript
   // Bad
   logger.info('User data', { user: entireUserObjectWith50Fields });

   // Good
   logger.info('User data', { userId: user.id, email: user.email });
   ```

5. **Don't create new logger instances unnecessarily**
   ```typescript
   // Bad - creates new logger on every request
   app.get('/users', (req, res) => {
     const logger = createAppLogger({ service: 'bff' });
     logger.info('Request received');
   });

   // Good - use singleton
   const logger = getOrCreateAppLogger({ service: 'bff' });
   app.get('/users', (req, res) => {
     logger.info('Request received');
   });
   ```

## Sensitive Data Redaction

The logging infrastructure automatically redacts the following fields:

- `password`, `passwordHash`
- `authorization` headers
- `cookie`, `set-cookie` headers
- `accessToken`, `refreshToken`

These fields are replaced with `[REDACTED]` in log output.

**Example**:
```typescript
logger.info('User login', {
  email: 'user@example.com',
  password: 'secret123',  // Will be redacted
  sessionId: 'abc-def'
});

// Output:
// { email: 'user@example.com', password: '[REDACTED]', sessionId: 'abc-def', msg: 'User login' }
```

## Troubleshooting

### Logs not appearing

1. **Check LOG_LEVEL** - Ensure it's set to include the log level you're using
   ```bash
   # If LOG_LEVEL="warn", debug and info logs won't appear
   LOG_LEVEL="debug"  # Change to see all logs
   ```

2. **Check NODE_ENV** - Verify it matches your expectations
   ```bash
   echo $NODE_ENV
   ```

3. **Verify logger is instantiated**
   ```typescript
   const logger = getOrCreateAppLogger({ service: 'your-service' });
   logger.info('Test log message');
   ```

### Logs appearing in wrong format

- **Pretty-printed in production?** Check `NODE_ENV`:
  ```bash
  NODE_ENV="production"  # Should output JSON
  ```

- **JSON in development?** Check `NODE_ENV`:
  ```bash
  NODE_ENV="development"  # Should output pretty-printed
  ```

### Performance issues from excessive logging

1. **Increase LOG_LEVEL** in production:
   ```bash
   LOG_LEVEL="warn"  # Only log warnings and errors
   ```

2. **Remove debug logs** from hot code paths

3. **Use sampling** for high-frequency events

### Sensitive data appearing in logs

1. Check the `REDACT_PATHS` array in `libs/shared/infrastructure/src/logging.ts`
2. Add additional fields to redact if needed:
   ```typescript
   const REDACT_PATHS = [
     'password',
     'passwordHash',
     'ssn',  // Add custom fields
     'creditCard',
     // ...
   ];
   ```

## Additional Resources

- [Pino Documentation](https://getpino.io/)
- [Structured Logging Best Practices](https://www.honeycomb.io/blog/structured-logging-and-your-team)
- [12-Factor App: Logs](https://12factor.net/logs)

## Need Help?

If you encounter issues with logging:

1. Check this guide first
2. Review existing logging usage in the codebase
3. Consult the Pino documentation
4. Ask the team in the #platform-engineering channel
