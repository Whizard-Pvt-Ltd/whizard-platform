/**
 * Stack Auth Fastify Plugin
 *
 * Middleware that verifies Stack Auth JWT tokens and populates request context.
 *
 * Flow:
 * 1. Extract JWT from Authorization header (Bearer token)
 * 2. Verify token using Stack Auth JWKS
 * 3. Sync user to local database (if not exists)
 * 4. Set X-Actor-User-Account-Id header for downstream handlers
 *
 * This plugin runs as a preHandler hook on all routes, allowing individual
 * routes to skip authentication using skipStackAuth option.
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import {
  StackAuthTokenVerifierGateway,
  loadStackAuthConfig,
  type StackAuthUser,
  type StackAuthVerifierConfig
} from '@whizard/identity-access';
import {
  StackAuthUserSyncService,
  loadStackAuthUserSyncConfig,
  PrismaUserAccountRepository
} from '@whizard/identity-access';
import { getOrCreateAppLogger } from '@whizard/shared-logging';

const logger = getOrCreateAppLogger({ service: 'core-api' }).child({ component: 'stack-auth-plugin' });

// Extend Fastify route options to include skipStackAuth flag
declare module 'fastify' {
  interface FastifyContextConfig {
    skipStackAuth?: boolean;
  }
}

/**
 * Stack Auth Plugin
 *
 * Adds a preHandler hook that verifies Stack Auth tokens on all routes.
 * Routes can opt-out by setting config.skipStackAuth = true
 */
async function stackAuthPlugin(fastify: FastifyInstance) {
  // Initialize Stack Auth token verifier
  const stackAuthConfig = loadStackAuthConfig();
  const verifierConfig: StackAuthVerifierConfig = {
    projectId: stackAuthConfig.projectId,
    secretServerKey: stackAuthConfig.secretServerKey
  };
  const tokenVerifier = new StackAuthTokenVerifierGateway(verifierConfig);

  // Initialize user sync service
  const syncConfig = loadStackAuthUserSyncConfig();
  const userAccountRepository = new PrismaUserAccountRepository();
  const userSyncService = new StackAuthUserSyncService(userAccountRepository, syncConfig);

  logger.info('Stack Auth plugin initialized', {
    projectId: stackAuthConfig.projectId
  });

  // Add preHandler hook to all routes
  fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    // Skip authentication for certain routes
    if (request.routeOptions.config.skipStackAuth === true) {
      logger.debug('Skipping Stack Auth verification for route', { url: request.url });
      return;
    }

    // Extract Authorization header
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      logger.warn('Missing Authorization header', { url: request.url });
      return reply.status(401).send({
        success: false,
        error: {
          code: 'UNAUTHENTICATED',
          message: 'Missing Authorization header'
        }
      });
    }

    // Extract Bearer token
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (!match) {
      logger.warn('Invalid Authorization header format', { url: request.url });
      return reply.status(401).send({
        success: false,
        error: {
          code: 'UNAUTHENTICATED',
          message: 'Invalid Authorization header format. Expected: Bearer <token>'
        }
      });
    }

    const accessToken = match[1];

    try {
      // Verify token with Stack Auth
      logger.debug('Verifying Stack Auth token', { url: request.url });
      const stackAuthUser: StackAuthUser = await tokenVerifier.verifyToken(accessToken);

      logger.debug('Stack Auth token verified', {
        userId: stackAuthUser.userId,
        email: stackAuthUser.email,
        url: request.url
      });

      // Sync user to local database
      const localUser = await userSyncService.syncUser(stackAuthUser);

      logger.debug('User synced to local database', {
        userId: localUser.id.value,
        tenantId: localUser.tenant.tenantId,
        tenantType: localUser.tenant.tenantType,
        stackAuthUserId: stackAuthUser.userId
      });

      // Set request context headers for downstream handlers
      // These headers are used by authorizationPreHandler and business logic
      request.headers['x-actor-user-account-id'] = localUser.id.value;
      request.headers['x-tenant-type'] = localUser.tenant.tenantType;
      request.headers['x-tenant-id'] = localUser.tenant.tenantId;

      // Bind userId and tenantId to the per-request logger so all subsequent
      // log calls on this request automatically carry this context
      request.log = request.log.child({
        userId: localUser.id.value,
        tenantId: localUser.tenant.tenantId
      });

      // TODO: Fetch user permissions from database and set X-Permissions header
      // For now, grant minimal permissions
      request.headers['x-permissions'] = '';

      logger.debug('Request context set from Stack Auth user', {
        userId: localUser.id.value,
        tenantId: localUser.tenant.tenantId,
        tenantType: localUser.tenant.tenantType
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Token verification failed';
      logger.error('Stack Auth token verification failed', {
        error: errorMessage,
        url: request.url,
        requestId: request.headers['x-request-id'] ? String(request.headers['x-request-id']) : undefined
      });

      return reply.status(401).send({
        success: false,
        error: {
          code: 'UNAUTHENTICATED',
          message: errorMessage
        }
      });
    }
  });

  logger.info('Stack Auth preHandler hook registered');
}

/**
 * Export as fastify-plugin to ensure it runs in the parent scope
 */
export default fp(stackAuthPlugin, {
  name: 'stack-auth',
  fastify: '5.x'
});
