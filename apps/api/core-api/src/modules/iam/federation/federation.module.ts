/**
 * IAM Federation Module for Core API
 *
 * This module handles identity federation and SSO (Single Sign-On) configuration endpoints.
 * It provides functionality for:
 * - Creating and configuring identity providers (SAML, OIDC, etc.)
 * - Updating identity provider settings
 * - Managing SSO role mappings for automatic access provisioning
 *
 * The module acts as an HTTP adapter layer for federation configuration operations,
 * delegating to domain-level command handlers from the identity-access context.
 */
import { getOrCreateAppLogger } from '@whizard/shared-logging';
import type { FastifyInstanceLike } from '../shared/request-context';
import { registerIamFederationRoutes } from './routes';

/**
 * Dependencies required by the IAM Federation module.
 * Each dependency represents a command handler for identity provider operations.
 */
export interface IamFederationModuleDependencies {
  /** Creates a new identity provider configuration (SAML, OIDC, etc.) */
  readonly createIdentityProvider: {
    execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }>;
  };

  /** Updates an existing identity provider's configuration */
  readonly updateIdentityProvider: {
    execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }>;
  };

  /** Updates SSO role mapping rules for automatic access provisioning */
  readonly updateSsoRoleMapping: {
    execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }>;
  };
}

/**
 * Registers the IAM Federation module with the Fastify application.
 *
 * This function:
 * 1. Creates a logger for the federation module
 * 2. Registers all federation-related routes under the /iam/federation prefix
 * 3. Passes command handler dependencies to route handlers
 *
 * @param app - Fastify application instance
 * @param deps - Command handler dependencies for federation workflows
 *
 * @example
 * ```typescript
 * await registerIamFederationModule(fastify, {
 *   createIdentityProvider: createIdpHandler,
 *   updateIdentityProvider: updateIdpHandler,
 *   updateSsoRoleMapping: roleMappingHandler
 * });
 * // Routes are now available at:
 * // POST /iam/federation/identity-providers
 * // PUT /iam/federation/identity-providers/:id
 * // etc.
 * ```
 */
export const registerIamFederationModule = async (
  app: FastifyInstanceLike,
  deps: IamFederationModuleDependencies
): Promise<void> => {
  // Create a child logger for this module using the Core API singleton
  const logger = getOrCreateAppLogger({ service: 'core-api' }).child({ component: 'iam-federation-module' });

  logger.debug('Registering IAM Federation module', { prefix: '/iam/federation' });

  // Register routes within their own scope with the /iam/federation prefix
  await app.register((scope: FastifyInstanceLike) => {
    logger.debug('Registering IAM Federation routes');
    registerIamFederationRoutes(scope, deps);
    logger.info('IAM Federation routes registered successfully');
  }, { prefix: '/iam/federation' });

  logger.info('IAM Federation module registered successfully');
};
