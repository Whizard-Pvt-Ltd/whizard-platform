/**
 * Shared Logging Module
 *
 * Provides centralized logging infrastructure for all Whizard Platform applications.
 */

export {
  createAppLogger,
  getOrCreateAppLogger,
  createPinoLoggerOptions,
  type AppLogger,
  type CreateAppLoggerOptions,
  type LogContext
} from './logging.js';
