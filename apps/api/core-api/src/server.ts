import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { startCoreApi } from './main';

const PORT = parseInt(process.env.CORE_API_PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';

async function bootstrap() {
  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport:
        process.env.NODE_ENV === 'development'
          ? {
              target: 'pino-pretty',
              options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
                colorize: true
              }
            }
          : undefined
    }
  });

  // Register security plugins
  await fastify.register(helmet, {
    contentSecurityPolicy: process.env.NODE_ENV === 'production'
  });

  await fastify.register(cors, {
    origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:4200'],
    credentials: true
  });

  // Health check endpoint
  fastify.get('/health', async () => ({
    status: 'ok',
    service: 'core-api',
    timestamp: new Date().toISOString()
  }));

  // Root endpoint
  fastify.get('/', async () => ({
    service: 'Whizard Platform - Core API',
    version: '0.1.0',
    endpoints: {
      health: '/health',
      admin: {
        iam: '/admin/iam/*'
      }
    }
  }));

  // Register IAM admin routes
  try {
    await startCoreApi(fastify);
    fastify.log.info('IAM Admin runtime registered successfully');
  } catch (error) {
    fastify.log.error('Failed to register IAM Admin runtime:', error);
    throw error;
  }

  // Start server
  try {
    await fastify.listen({ port: PORT, host: HOST });
    fastify.log.info(`🚀 Core API server running at http://${HOST}:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }

  // Graceful shutdown
  const signals = ['SIGINT', 'SIGTERM'];
  signals.forEach((signal) => {
    process.on(signal, async () => {
      fastify.log.info(`Received ${signal}, closing server gracefully...`);
      await fastify.close();
      process.exit(0);
    });
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start Core API server:', err);
  process.exit(1);
});
