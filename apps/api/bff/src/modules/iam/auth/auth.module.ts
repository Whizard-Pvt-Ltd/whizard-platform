/**
 * IAM Authentication Module for BFF
 *
 * This module handles all authentication-related HTTP endpoints for the BFF layer.
 * It orchestrates authentication workflows including:
 * - Password-based authentication
 * - Multi-factor authentication (MFA) challenges
 * - Session refresh and management
 * - Logout functionality
 *
 * The module acts as a thin HTTP adapter layer that delegates to domain-level
 * command handlers from the identity-access context.
 */
import { getOrCreateAppLogger } from '@whizard/shared-logging';
import { registerIamAuthRoutes } from './routes';
import type { FastifyInstanceLike } from '../shared/request-context';

/**
 * Dependencies required by the IAM Auth module.
 * Each dependency represents a command handler from the application layer.
 */
export interface IamAuthModuleDependencies {
  /** Authenticates a user with username/email and password */
  readonly authenticateWithPassword: {
    execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }>;
  };

  /** Initiates a multi-factor authentication challenge */
  readonly startMfaChallenge: {
    execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }>;
  };

  /** Verifies a multi-factor authentication response */
  readonly verifyMfaChallenge: {
    execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }>;
  };

  /** Refreshes an existing session using a refresh token */
  readonly refreshSession: {
    execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }>;
  };

  /** Logs out the current session */
  readonly logoutSession: {
    execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }>;
  };
}

/**
 * Registers the IAM Authentication module with the Fastify application.
 *
 * This function:
 * 1. Creates a logger for the auth module
 * 2. Registers all authentication-related routes under the /iam/auth prefix
 * 3. Passes command handler dependencies to route handlers
 *
 * @param app - Fastify application instance
 * @param deps - Command handler dependencies for authentication workflows
 *
 * @example
 * ```typescript
 * await registerIamAuthModule(fastify, {
 *   authenticateWithPassword: authenticateHandler,
 *   startMfaChallenge: mfaStartHandler,
 *   // ... other handlers
 * });
 * // Routes are now available at:
 * // POST /iam/auth/login
 * // POST /iam/auth/mfa/challenge
 * // etc.
 * ```
 */
export const registerIamAuthModule = async (
  app: FastifyInstanceLike,
  deps: IamAuthModuleDependencies
): Promise<void> => {
  // Create a child logger for this module using the BFF singleton
  const logger = getOrCreateAppLogger({ service: 'bff' }).child({ component: 'iam-auth-module' });

  logger.debug('Registering IAM Auth module', { prefix: '/iam/auth' });

  // Register routes within their own scope with the /iam/auth prefix
  await app.register((scope: FastifyInstanceLike) => {
    logger.debug('Registering IAM Auth routes');
    registerIamAuthRoutes(scope, deps);
    logger.info('IAM Auth routes registered successfully');
  }, { prefix: '/iam/auth' });

  logger.info('IAM Auth module registered successfully');
};
