/**
 * Centralized Logging Infrastructure for Whizard Platform
 *
 * This module provides a unified logging solution based on Pino logger that can be used
 * across all applications and components in the platform.
 *
 * Key Features:
 * - Singleton pattern support for application-level loggers
 * - Component-level child loggers for contextual logging
 * - Automatic sensitive data redaction (passwords, tokens, etc.)
 * - Environment-aware configuration (dev vs production)
 * - Configurable log levels via LOG_LEVEL environment variable
 * - Structured logging with contextual metadata
 *
 * @example Basic Usage
 * ```typescript
 * // Create application logger (typically done once per application)
 * const appLogger = createAppLogger({ service: 'bff', component: 'bootstrap' });
 *
 * // Create child logger for specific component
 * const authLogger = appLogger.child({ component: 'auth' });
 * authLogger.info('User login attempt', { userId: '123', tenantId: 'abc' });
 * ```
 *
 * @example Singleton Usage
 * ```typescript
 * // Get or create singleton logger for an application
 * const bffLogger = getOrCreateAppLogger({ service: 'bff' });
 *
 * // Reuse the same logger instance with different component context
 * const authLogger = bffLogger.child({ component: 'auth' });
 * const accessLogger = bffLogger.child({ component: 'access' });
 * ```
 */
import pino, { type LoggerOptions } from 'pino';

/**
 * Context object for structured logging.
 * Can include any metadata relevant to the log entry (e.g., userId, tenantId, requestId).
 */
export type LogContext = Record<string, unknown>;

/**
 * Core logger interface used throughout the platform.
 * Provides standard log levels and child logger creation.
 */
export interface AppLogger {
  /**
   * Log debug-level messages (verbose technical details, useful during development)
   * @param message - Human-readable log message
   * @param context - Optional structured metadata
   */
  debug(message: string, context?: LogContext): void;

  /**
   * Log info-level messages (general application flow, business events)
   * @param message - Human-readable log message
   * @param context - Optional structured metadata
   */
  info(message: string, context?: LogContext): void;

  /**
   * Log warning-level messages (potentially harmful situations, deprecated usage)
   * @param message - Human-readable log message
   * @param context - Optional structured metadata
   */
  warn(message: string, context?: LogContext): void;

  /**
   * Log error-level messages (error events that might still allow the app to continue)
   * @param message - Human-readable log message
   * @param context - Optional structured metadata
   */
  error(message: string, context?: LogContext): void;

  /**
   * Create a child logger with additional context bindings.
   * Child loggers inherit all properties from the parent and add new context.
   *
   * @param bindings - Context to be added to all child logger messages
   * @returns New AppLogger instance with additional context
   *
   * @example
   * ```typescript
   * const parentLogger = createAppLogger({ service: 'bff' });
   * const childLogger = parentLogger.child({ component: 'auth', requestId: '123' });
   * childLogger.info('Processing request'); // Will include component and requestId
   * ```
   */
  child(bindings: LogContext): AppLogger;
}

/**
 * Configuration options for creating an application logger.
 */
export interface CreateAppLoggerOptions {
  /**
   * Service name identifier (e.g., 'bff', 'core-api', 'workers', 'admin-portal')
   * Used to identify which application generated the log.
   */
  service: string;

  /**
   * Component name within the service (e.g., 'auth', 'http', 'bootstrap')
   * Defaults to 'runtime' if not specified.
   */
  component?: string;

  /**
   * Log level threshold (e.g., 'debug', 'info', 'warn', 'error')
   * Falls back to LOG_LEVEL environment variable, then 'info'.
   * Only messages at this level or higher will be logged.
   */
  level?: string;

  /**
   * Runtime environment (e.g., 'development', 'staging', 'production')
   * Falls back to NODE_ENV environment variable, then 'development'.
   * Affects log formatting (pretty-print in dev, JSON in prod).
   */
  env?: string;
}

/**
 * Internal type representing a fully resolved logger configuration profile.
 */
type LoggerProfile = Required<CreateAppLoggerOptions>;

/**
 * Paths to sensitive fields that should be automatically redacted from logs.
 * These patterns protect against accidental logging of credentials and tokens.
 *
 * Supports both top-level fields and nested fields (with '*.' prefix).
 */
const REDACT_PATHS = [
  'password',
  'passwordHash',
  'authorization',
  'cookie',
  'set-cookie',
  'accessToken',
  'refreshToken',
  '*.password',
  '*.passwordHash',
  '*.authorization',
  '*.cookie',
  '*.set-cookie',
  '*.accessToken',
  '*.refreshToken'
];

/**
 * Implementation of AppLogger using Pino as the underlying logger.
 * Wraps Pino's logger instance to conform to our AppLogger interface.
 */
class PinoAppLogger implements AppLogger {
  constructor(private readonly logger: pino.Logger) {}

  debug(message: string, context?: LogContext): void {
    this.logger.debug(context ?? {}, message);
  }

  info(message: string, context?: LogContext): void {
    this.logger.info(context ?? {}, message);
  }

  warn(message: string, context?: LogContext): void {
    this.logger.warn(context ?? {}, message);
  }

  error(message: string, context?: LogContext): void {
    this.logger.error(context ?? {}, message);
  }

  child(bindings: LogContext): AppLogger {
    return new PinoAppLogger(this.logger.child(bindings));
  }
}

/**
 * Resolves logger configuration from options and environment variables.
 * Applies defaults for any missing configuration values.
 *
 * @param options - Partial logger configuration options
 * @returns Fully resolved logger profile with all required fields
 */
const resolveLoggerProfile = (options: CreateAppLoggerOptions): LoggerProfile => ({
  service: options.service,
  component: options.component ?? 'runtime',
  level: options.level ?? process.env.LOG_LEVEL ?? 'info',
  env: options.env ?? process.env.NODE_ENV ?? 'development'
});

/**
 * Creates Pino logger options from application logger configuration.
 *
 * Configuration includes:
 * - Log level filtering
 * - Base context fields (service, component, env)
 * - Sensitive data redaction
 * - Pretty-printing in development environments
 *
 * @param options - Application logger configuration
 * @returns Pino LoggerOptions ready for logger instantiation
 */
export const createPinoLoggerOptions = (options: CreateAppLoggerOptions): LoggerOptions => {
  const profile = resolveLoggerProfile(options);

  return {
    level: profile.level,
    base: {
      service: profile.service,
      component: profile.component,
      env: profile.env
    },
    redact: {
      paths: REDACT_PATHS,
      censor: '[REDACTED]'
    },
    transport:
      profile.env === 'development'
        ? {
            target: 'pino-pretty',
            options: {
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
              colorize: true
            }
          }
        : undefined
  };
};

/**
 * Creates a new AppLogger instance.
 *
 * This function creates a fresh logger instance each time it's called.
 * For application-level singleton loggers, consider using `getOrCreateAppLogger` instead.
 *
 * @param options - Logger configuration options
 * @returns New AppLogger instance
 *
 * @example
 * ```typescript
 * const logger = createAppLogger({
 *   service: 'bff',
 *   component: 'auth',
 *   level: 'debug'
 * });
 *
 * logger.info('Application started');
 * logger.debug('Detailed state information', { state: {...} });
 * ```
 */
export const createAppLogger = (options: CreateAppLoggerOptions): AppLogger => {
  const baseOptions = createPinoLoggerOptions(options);
  return new PinoAppLogger(pino(baseOptions));
};

/**
 * Singleton registry for application-level loggers.
 * Maps service names to their corresponding logger instances.
 *
 * This ensures only one logger instance per application/service,
 * which can then be reused with child loggers for different components.
 */
const loggerRegistry = new Map<string, AppLogger>();

/**
 * Gets an existing logger from the registry or creates a new one if it doesn't exist.
 *
 * This function implements the singleton pattern for application-level loggers.
 * Use this when you want to ensure all parts of an application share the same root logger.
 *
 * Benefits:
 * - Consistent base configuration across the application
 * - Memory efficiency (one logger instance per application)
 * - Easy to create component-specific child loggers
 *
 * @param options - Logger configuration options
 * @returns Existing or newly created AppLogger instance
 *
 * @example
 * ```typescript
 * // In BFF application bootstrap
 * const bffLogger = getOrCreateAppLogger({ service: 'bff' });
 *
 * // In BFF auth module
 * const authLogger = getOrCreateAppLogger({ service: 'bff' }).child({ component: 'auth' });
 *
 * // In BFF access module
 * const accessLogger = getOrCreateAppLogger({ service: 'bff' }).child({ component: 'access' });
 *
 * // All three share the same root logger but with different component context
 * ```
 */
export const getOrCreateAppLogger = (options: CreateAppLoggerOptions): AppLogger => {
  const { service } = options;

  // Check if logger already exists for this service
  const existingLogger = loggerRegistry.get(service);
  if (existingLogger) {
    return existingLogger;
  }

  // Create new logger and register it
  const newLogger = createAppLogger(options);
  loggerRegistry.set(service, newLogger);

  return newLogger;
};

/**
 * Clears the logger registry.
 * Primarily useful for testing to ensure clean state between test runs.
 *
 * @internal
 */
export const clearLoggerRegistry = (): void => {
  loggerRegistry.clear();
};
