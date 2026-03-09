/**
 * Shared Infrastructure Module
 *
 * Provides common infrastructure utilities used across all Whizard Platform applications:
 * - Logging: Centralized logging infrastructure with singleton support
 * - Database: Singleton Prisma client for database access
 */
import { PrismaClient } from '@prisma/client';

// Export logging utilities
export {
  createAppLogger,
  getOrCreateAppLogger,
  createPinoLoggerOptions,
  type AppLogger,
  type CreateAppLoggerOptions,
  type LogContext
} from './logging';

/**
 * Singleton Prisma client instance.
 * Ensures only one database connection pool is created per application.
 */
let prismaClient: PrismaClient | null = null;

/**
 * Gets or creates a singleton Prisma client instance.
 *
 * This ensures efficient connection pooling across the application.
 * Should be called instead of creating new PrismaClient instances directly.
 *
 * @returns The shared Prisma client instance
 *
 * @example
 * ```typescript
 * const prisma = getPrisma();
 * const users = await prisma.user.findMany();
 * ```
 */
export const getPrisma = (): PrismaClient => {
  if (!prismaClient) {
    prismaClient = new PrismaClient();
  }

  return prismaClient;
};
