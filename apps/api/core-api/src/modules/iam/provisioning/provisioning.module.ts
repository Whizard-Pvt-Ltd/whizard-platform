/**
 * IAM Provisioning Module for Core API
 *
 * This module handles user provisioning and lifecycle management endpoints.
 * It provides functionality for:
 * - Inviting users to tenants
 * - Automatic provisioning from SSO/SCIM
 * - Access suspension and reactivation
 * - User deprovisioning
 *
 * The module acts as an HTTP adapter layer for administrative provisioning operations,
 * delegating to domain-level command handlers from the identity-access context.
 */
import { getOrCreateAppLogger } from '@whizard/shared-logging';
import type { FastifyInstanceLike } from '../shared/request-context';
import { registerIamProvisioningRoutes } from './routes';

/**
 * Dependencies required by the IAM Provisioning module.
 * Each dependency represents a command handler for user lifecycle operations.
 */
export interface IamProvisioningModuleDependencies {
  /** Invites a new user to join a tenant organization */
  readonly inviteUserToTenant: {
    execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }>;
  };

  /** Automatically provisions user access from SSO/SCIM identity provider */
  readonly provisionAccessFromSso: {
    execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }>;
  };

  /** Suspends a user's provisioned access (temporary deactivation) */
  readonly suspendProvisionedAccess: {
    execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }>;
  };

  /** Reactivates a previously suspended user's access */
  readonly reactivateProvisionedAccess: {
    execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }>;
  };

  /** Permanently deprovisions a user's access (account deletion) */
  readonly deprovisionAccess: {
    execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }>;
  };
}

/**
 * Registers the IAM Provisioning module with the Fastify application.
 *
 * This function:
 * 1. Creates a logger for the provisioning module
 * 2. Registers all provisioning-related routes under the /iam/provisioning prefix
 * 3. Passes command handler dependencies to route handlers
 *
 * @param app - Fastify application instance
 * @param deps - Command handler dependencies for provisioning workflows
 *
 * @example
 * ```typescript
 * await registerIamProvisioningModule(fastify, {
 *   inviteUserToTenant: inviteHandler,
 *   provisionAccessFromSso: provisionHandler,
 *   // ... other handlers
 * });
 * // Routes are now available at:
 * // POST /iam/provisioning/invite
 * // POST /iam/provisioning/sso
 * // etc.
 * ```
 */
export const registerIamProvisioningModule = async (
  app: FastifyInstanceLike,
  deps: IamProvisioningModuleDependencies
): Promise<void> => {
  // Create a child logger for this module using the Core API singleton
  const logger = getOrCreateAppLogger({ service: 'core-api' }).child({ component: 'iam-provisioning-module' });

  logger.debug('Registering IAM Provisioning module', { prefix: '/iam/provisioning' });

  // Register routes within their own scope with the /iam/provisioning prefix
  await app.register((scope: FastifyInstanceLike) => {
    logger.debug('Registering IAM Provisioning routes');
    registerIamProvisioningRoutes(scope, deps);
    logger.info('IAM Provisioning routes registered successfully');
  }, { prefix: '/iam/provisioning' });

  logger.info('IAM Provisioning module registered successfully');
};
