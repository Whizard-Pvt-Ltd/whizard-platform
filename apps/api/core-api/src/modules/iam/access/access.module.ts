/**
 * IAM Access Admin Module for Core API
 *
 * This module handles administrative access control management endpoints.
 * It provides functionality for:
 * - Role assignment and revocation
 * - Direct permission grants and revocations
 * - Access control list (ACL) management
 *
 * The module acts as an HTTP adapter layer for access control administration,
 * delegating to domain-level command handlers from the identity-access context.
 */
import { getOrCreateAppLogger } from '@whizard/shared-infrastructure';
import { registerIamAccessAdminRoutes } from './routes';
import type { FastifyInstanceLike } from '../shared/request-context';

/**
 * Dependencies required by the IAM Access Admin module.
 * Each dependency represents a command handler for access control operations.
 */
export interface IamAccessAdminModuleDependencies {
  /** Assigns a role to a user within a tenant context */
  readonly assignRole: {
    execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }>;
  };

  /** Revokes a role from a user within a tenant context */
  readonly revokeRole: {
    execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }>;
  };

  /** Grants a specific permission to a user (direct permission assignment) */
  readonly grantPermission: {
    execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }>;
  };

  /** Revokes a specific permission from a user */
  readonly revokePermission: {
    execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }>;
  };
}

/**
 * Registers the IAM Access Admin module with the Fastify application.
 *
 * This function:
 * 1. Creates a logger for the access admin module
 * 2. Registers all access control routes under the /iam/access prefix
 * 3. Passes command handler dependencies to route handlers
 *
 * @param app - Fastify application instance
 * @param deps - Command handler dependencies for access control workflows
 *
 * @example
 * ```typescript
 * await registerIamAccessAdminModule(fastify, {
 *   assignRole: assignRoleHandler,
 *   revokeRole: revokeRoleHandler,
 *   // ... other handlers
 * });
 * // Routes are now available at:
 * // POST /iam/access/roles/assign
 * // POST /iam/access/roles/revoke
 * // etc.
 * ```
 */
export const registerIamAccessAdminModule = async (
  app: FastifyInstanceLike,
  deps: IamAccessAdminModuleDependencies
): Promise<void> => {
  // Create a child logger for this module using the Core API singleton
  const logger = getOrCreateAppLogger({ service: 'core-api' }).child({ component: 'iam-access-admin-module' });

  logger.debug('Registering IAM Access Admin module', { prefix: '/iam/access' });

  // Register routes within their own scope with the /iam/access prefix
  await app.register((scope: FastifyInstanceLike) => {
    logger.debug('Registering IAM Access Admin routes');
    registerIamAccessAdminRoutes(scope, deps);
    logger.info('IAM Access Admin routes registered successfully');
  }, { prefix: '/iam/access' });

  logger.info('IAM Access Admin module registered successfully');
};
