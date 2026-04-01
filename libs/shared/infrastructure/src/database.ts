/**
 * Database Infrastructure Module
 *
 * Provides singleton Prisma client for database access.
 * Separated from main index to avoid bundling Prisma in apps that don't need it.
 */
import { PrismaClient } from '@prisma/client';
type PrismaClientType = InstanceType<typeof PrismaClient>;

/**
 * Singleton Prisma client instance.
 * Ensures only one database connection pool is created per application.
 */
let prismaClient: PrismaClientType | null = null;

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
export const getPrisma = (): PrismaClientType => {
  if (!prismaClient) {
    prismaClient = new PrismaClient();
  }

  return prismaClient;
};
