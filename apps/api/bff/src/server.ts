import { getOrCreateAppLogger, createPinoLoggerOptions } from '@whizard/shared-logging';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
/**
 * BFF (Backend for Frontend) Server Bootstrap
 *
 * This file initializes and configures the BFF server, which acts as an API gateway
 * for frontend applications. It provides:
 * - HTTP server setup with Fastify
 * - Security plugins (CORS, Helmet)
 * - Health check endpoints
 * - IAM (Identity and Access Management) routes
 * - Graceful shutdown handling
 *
 * Environment Variables:
 * - BFF_PORT: Server port (default: 3000)
 * - HOST: Server host (default: 0.0.0.0)
 * - CORS_ORIGIN: Allowed CORS origin (default: http://localhost:4200)
 * - NODE_ENV: Runtime environment (development/staging/production)
 * - LOG_LEVEL: Logging level (debug/info/warn/error)
 */
import Fastify from 'fastify';
import { startBff } from './main';
import { registerCollegeOperationsBffModule } from './modules/college-operations/college-operations.bff.module';
import { registerWrcfBffModule } from './modules/wrcf/wrcf.module';

// Server configuration from environment variables
const PORT = parseInt(process.env.BFF_PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

// Get singleton logger for BFF application
// This logger instance will be reused across all BFF components via child loggers
const bootstrapLogger = getOrCreateAppLogger({ service: 'bff' }).child({ component: 'bootstrap' });

/**
 * Bootstraps the BFF server with all necessary configurations and plugins.
 *
 * Steps:
 * 1. Initialize Fastify with logging configuration
 * 2. Register security plugins (Helmet for security headers, CORS for cross-origin requests)
 * 3. Set up health check and informational endpoints
 * 4. Register IAM business logic routes
 * 5. Start listening for HTTP requests
 * 6. Set up graceful shutdown handlers
 */
async function bootstrap() {
  bootstrapLogger.info('Starting BFF server bootstrap', { port: PORT, host: HOST });

  // Initialize Fastify with Pino logger configured for HTTP request/response logging
  const fastify = Fastify({
    logger: createPinoLoggerOptions({ service: 'bff', component: 'http' })
  });

  bootstrapLogger.debug('Fastify instance created');

  // Register security plugins
  bootstrapLogger.debug('Registering security plugins');

  // Helmet adds security headers to HTTP responses
  await fastify.register(helmet, {
    contentSecurityPolicy: process.env.NODE_ENV === 'production'
  });
  bootstrapLogger.debug('Helmet security plugin registered');

  // CORS enables cross-origin requests from the frontend application
  const corsOriginEnv = process.env.CORS_ORIGIN || 'http://localhost:4200';
  const corsOrigins = corsOriginEnv.split(',').map(origin => origin.trim());
  await fastify.register(cors, {
    origin: corsOrigins,
    credentials: true
  });
  bootstrapLogger.debug('CORS plugin registered', { allowedOrigins: corsOrigins });

  // Health check endpoint - used by monitoring systems and load balancers
  // to verify the service is running and responsive
  fastify.get('/health', async () => {
    const response = {
      status: 'ok',
      service: 'bff',
      timestamp: new Date().toISOString()
    };
    fastify.log.debug(response, 'Health check requested');
    return response;
  });

  // Root endpoint - provides service information and available API endpoints
  fastify.get('/', async () => {
    const response = {
      service: 'Whizard Platform - BFF',
      version: '0.1.0',
      endpoints: {
        health: '/health',
        auth: '/auth/*',
        access: '/access/*'
      }
    };
    fastify.log.debug(response, 'Root endpoint requested');
    return response;
  });

  bootstrapLogger.debug('Health and info endpoints registered');

  // Register IAM routes (authentication, authorization, user management)
  bootstrapLogger.info('Registering IAM BFF runtime');
  try {
    await startBff(fastify);
    fastify.log.info('IAM BFF runtime registered successfully');
    bootstrapLogger.info('IAM BFF runtime registered successfully');
  } catch (error) {
    fastify.log.error({ error }, 'Failed to register IAM BFF runtime');
    bootstrapLogger.error('Failed to register IAM BFF runtime', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }

  // Register WRCF proxy routes
  bootstrapLogger.info('Registering WRCF BFF module');
  try {
    await registerWrcfBffModule(fastify);
    fastify.log.info('WRCF BFF module registered successfully');
    bootstrapLogger.info('WRCF BFF module registered successfully');
  } catch (error) {
    fastify.log.error({ error }, 'Failed to register WRCF BFF module');
    bootstrapLogger.error('Failed to register WRCF BFF module', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }

  // Register College Operations BFF module
  bootstrapLogger.info('Registering College Operations BFF module');
  try {
    await registerCollegeOperationsBffModule(fastify);
    bootstrapLogger.info('College Operations BFF module registered successfully');
  } catch (error) {
    bootstrapLogger.error('Failed to register College Operations BFF module', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }

  // Start server and listen for incoming requests
  bootstrapLogger.info('Starting HTTP server', { port: PORT, host: HOST });
  try {
    await fastify.listen({ port: PORT, host: HOST });
    const serverUrl = `http://${HOST}:${PORT}`;
    fastify.log.info(`BFF server running at ${serverUrl}`);
    bootstrapLogger.info('BFF server started successfully', { url: serverUrl });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    fastify.log.error({ error: err }, 'Failed to start listening for BFF server');
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
  bootstrapLogger.error('Fatal error during BFF server bootstrap', {
    error: err instanceof Error ? err.message : 'Unknown error',
    stack: err instanceof Error ? err.stack : undefined
  });
  process.exit(1);
});
