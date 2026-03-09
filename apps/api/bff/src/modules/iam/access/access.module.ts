/**
 * IAM Access Module for BFF
 *
 * This module handles all access control and user information endpoints for the BFF layer.
 * It provides functionality for:
 * - User profile retrieval
 * - Access grant queries (permissions and roles)
 * - Tenant membership management
 * - Session management and revocation
 *
 * The module acts as a thin HTTP adapter layer that delegates to domain-level
 * query and command handlers from the identity-access context.
 */
import { getOrCreateAppLogger } from '@whizard/shared-infrastructure';
import { registerIamAccessRoutes } from './routes';
import type { FastifyInstanceLike } from '../shared/request-context';

/**
 * Dependencies required by the IAM Access module.
 * Each dependency represents a query or command handler from the application layer.
 */
export interface IamAccessModuleDependencies {
  /** Retrieves the current user's profile information */
  readonly getCurrentUserProfile: {
    execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }>;
  };

  /** Retrieves the current user's access grants (permissions, roles) */
  readonly getMyAccessGrants: {
    execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }>;
  };

  /** Retrieves all tenant memberships for the current user */
  readonly getTenantMemberships: {
    execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }>;
  };

  /** Retrieves all active sessions for the current user */
  readonly getMySessions: {
    execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }>;
  };

  /** Revokes all sessions for the current user (logout from all devices) */
  readonly revokeAllSessions: {
    execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }>;
  };
}

/**
 * Registers the IAM Access module with the Fastify application.
 *
 * This function:
 * 1. Creates a logger for the access module
 * 2. Registers all access-related routes under the /iam prefix
 * 3. Passes query and command handler dependencies to route handlers
 *
 * @param app - Fastify application instance
 * @param deps - Query and command handler dependencies for access workflows
 *
 * @example
 * ```typescript
 * await registerIamAccessModule(fastify, {
 *   getCurrentUserProfile: profileHandler,
 *   getMyAccessGrants: grantsHandler,
 *   // ... other handlers
 * });
 * // Routes are now available at:
 * // GET /iam/me
 * // GET /iam/me/access-grants
 * // etc.
 * ```
 */
export const registerIamAccessModule = async (
  app: FastifyInstanceLike,
  deps: IamAccessModuleDependencies
): Promise<void> => {
  // Create a child logger for this module using the BFF singleton
  const logger = getOrCreateAppLogger({ service: 'bff' }).child({ component: 'iam-access-module' });

  logger.debug('Registering IAM Access module', { prefix: '/iam' });

  // Register routes within their own scope with the /iam prefix
  await app.register((scope: FastifyInstanceLike) => {
    logger.debug('Registering IAM Access routes');
    registerIamAccessRoutes(scope, deps);
    logger.info('IAM Access routes registered successfully');
  }, { prefix: '/iam' });

  logger.info('IAM Access module registered successfully');
};
