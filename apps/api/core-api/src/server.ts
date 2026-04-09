import { getOrCreateAppLogger, createPinoLoggerOptions } from '@whizard/shared-logging';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import multipart from '@fastify/multipart';
/**
 * Core API Server Bootstrap
 *
 * This file initializes and configures the Core API server, which provides
 * administrative and internal API endpoints for the platform. It provides:
 * - HTTP server setup with Fastify
 * - Security plugins (CORS, Helmet)
 * - Health check endpoints
 * - IAM administrative routes (user provisioning, federation, access control)
 * - Graceful shutdown handling
 *
 * Environment Variables:
 * - CORE_API_PORT: Server port (default: 3001)
 * - HOST: Server host (default: 0.0.0.0)
 * - CORS_ORIGIN: Allowed CORS origins (default: http://localhost:3000, http://localhost:4200)
 * - NODE_ENV: Runtime environment (development/staging/production)
 * - LOG_LEVEL: Logging level (debug/info/warn/error)
 */
import Fastify from 'fastify';
import { startCoreApi } from './main';
import { registerCollegeOperationsCoreApiRuntime } from './modules/college-operations/runtime';
import { registerCompanyOrganizationCoreApiRuntime } from './modules/company-organization/runtime';
import { registerInternshipHiringCoreApiRuntime } from './modules/internship-hiring/runtime';
import { registerWrcfCoreApiRuntime } from './modules/wrcf/runtime';
import stackAuthPlugin from './plugins/stack-auth.plugin';

// Server configuration from environment variables
const PORT = parseInt(process.env.CORE_API_PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';

// Get singleton logger for Core API application
// This logger instance will be reused across all Core API components via child loggers
const bootstrapLogger = getOrCreateAppLogger({ service: 'core-api' }).child({ component: 'bootstrap' });

/**
 * Bootstraps the Core API server with all necessary configurations and plugins.
 *
 * Steps:
 * 1. Initialize Fastify with logging configuration
 * 2. Register security plugins (Helmet for security headers, CORS for cross-origin requests)
 * 3. Set up health check and informational endpoints
 * 4. Register IAM administrative business logic routes
 * 5. Start listening for HTTP requests
 * 6. Set up graceful shutdown handlers
 */
async function bootstrap() {
  bootstrapLogger.info('Starting Core API server bootstrap', { port: PORT, host: HOST });

  // Initialize Fastify with Pino logger configured for HTTP request/response logging
  const fastify = Fastify({
    logger: createPinoLoggerOptions({ service: 'core-api', component: 'http' })
  });

  bootstrapLogger.debug('Fastify instance created');

  // Register security plugins
  bootstrapLogger.debug('Registering security plugins');

  // Helmet adds security headers to HTTP responses
  await fastify.register(helmet, {
    contentSecurityPolicy: process.env.NODE_ENV === 'production'
  });
  bootstrapLogger.debug('Helmet security plugin registered');

  // CORS enables cross-origin requests from the BFF and admin portal
  const corsOrigins = process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:4200'];
  await fastify.register(cors, {
    origin: corsOrigins,
    credentials: true
  });
  bootstrapLogger.debug('CORS plugin registered', {
    allowedOrigins: Array.isArray(corsOrigins) ? corsOrigins : [corsOrigins]
  });

  // Multipart support for file uploads
  await fastify.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } });
  bootstrapLogger.debug('Multipart plugin registered');

  // Register Stack Auth authentication plugin
  // This adds JWT token verification to all routes
  bootstrapLogger.debug('Registering Stack Auth authentication plugin');
  await fastify.register(stackAuthPlugin);
  bootstrapLogger.info('Stack Auth authentication plugin registered');

  // Health check endpoint - used by monitoring systems and load balancers
  // to verify the service is running and responsive
  fastify.get(
    '/health',
    { config: { skipStackAuth: true } },
    async () => {
      const response = {
        status: 'ok',
        service: 'core-api',
        timestamp: new Date().toISOString()
      };
      fastify.log.debug(response, 'Health check requested');
      return response;
    }
  );

  // Root endpoint - provides service information and available API endpoints
  fastify.get(
    '/',
    { config: { skipStackAuth: true } },
    async () => {
      const response = {
        service: 'Whizard Platform - Core API',
        version: '0.1.0',
        endpoints: {
          health: '/health',
          admin: {
            iam: '/admin/iam/*'
          }
        }
      };
      fastify.log.debug(response, 'Root endpoint requested');
      return response;
    }
  );

  bootstrapLogger.debug('Health and info endpoints registered');

  // Register IAM administrative routes (provisioning, federation, access control)
  bootstrapLogger.info('Registering IAM Admin runtime');
  try {
    await startCoreApi(fastify);
    fastify.log.info('IAM Admin runtime registered successfully');
    bootstrapLogger.info('IAM Admin runtime registered successfully');
  } catch (error) {
    fastify.log.error({ error }, 'Failed to register IAM Admin runtime');
    bootstrapLogger.error('Failed to register IAM Admin runtime', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }

  // Register WRCF routes (capability framework)
  bootstrapLogger.info('Registering WRCF runtime');
  try {
    await registerWrcfCoreApiRuntime(fastify);
    fastify.log.info('WRCF runtime registered successfully');
    bootstrapLogger.info('WRCF runtime registered successfully');
  } catch (error) {
    fastify.log.error({ error }, 'Failed to register WRCF runtime');
    bootstrapLogger.error('Failed to register WRCF runtime', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }

  // Register College Operations routes
  bootstrapLogger.info('Registering College Operations runtime');
  try {
    await registerCollegeOperationsCoreApiRuntime(fastify);
    bootstrapLogger.info('College Operations runtime registered successfully');
  } catch (error) {
    bootstrapLogger.error('Failed to register College Operations runtime', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }

  // Register Company Organization routes
  bootstrapLogger.info('Registering Company Organization runtime');
  try {
    await registerCompanyOrganizationCoreApiRuntime(fastify);
    bootstrapLogger.info('Company Organization runtime registered successfully');
  } catch (error) {
    bootstrapLogger.error('Failed to register Company Organization runtime', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }

  // Register Internship Hiring routes
  bootstrapLogger.info('Registering Internship Hiring runtime');
  try {
    await registerInternshipHiringCoreApiRuntime(fastify);
    bootstrapLogger.info('Internship Hiring runtime registered successfully');
  } catch (error) {
    bootstrapLogger.error('Failed to register Internship Hiring runtime', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }

  // Start server and listen for incoming requests
  bootstrapLogger.info('Starting HTTP server', { port: PORT, host: HOST });
  try {
    await fastify.listen({ port: PORT, host: HOST });
    const serverUrl = `http://${HOST}:${PORT}`;
    fastify.log.info(`Core API server running at ${serverUrl}`);
    bootstrapLogger.info('Core API server started successfully', { url: serverUrl });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    fastify.log.error({ error: err }, 'Failed to start listening for Core API server');
    bootstrapLogger.error('Failed to start HTTP server', { error: errorMessage, port: PORT, host: HOST });
    process.exit(1);
  }

  // Graceful shutdown handlers
  // These ensure the server closes cleanly when receiving termination signals
  const signals = ['SIGINT', 'SIGTERM'];
  signals.forEach((signal) => {
    process.on(signal, async () => {
      fastify.log.info(`Received ${signal}, closing server gracefully...`);
      bootstrapLogger.info('Received shutdown signal, initiating graceful shutdown', { signal });

      try {
        await fastify.close();
        bootstrapLogger.info('Server closed successfully');
        process.exit(0);
      } catch (error) {
        bootstrapLogger.error('Error during graceful shutdown', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        process.exit(1);
      }
    });
  });

  bootstrapLogger.info('Graceful shutdown handlers registered', { signals });
}

// Execute bootstrap and handle any unhandled errors
bootstrap().catch((err) => {
  bootstrapLogger.error('Fatal error during Core API server bootstrap', {
    error: err instanceof Error ? err.message : 'Unknown error',
    stack: err instanceof Error ? err.stack : undefined
  });
  process.exit(1);
});
