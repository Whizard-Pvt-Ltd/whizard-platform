import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { startBff } from './main';

const PORT = parseInt(process.env.BFF_PORT || '3000', 10);
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
    origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
    credentials: true
  });

  // Health check endpoint
  fastify.get('/health', async () => ({
    status: 'ok',
    service: 'bff',
    timestamp: new Date().toISOString()
  }));

  // Root endpoint
  fastify.get('/', async () => ({
    service: 'Whizard Platform - BFF',
    version: '0.1.0',
    endpoints: {
      health: '/health',
      auth: '/auth/*',
      access: '/access/*'
    }
  }));

  // Register IAM routes
  try {
    await startBff(fastify);
    fastify.log.info('IAM BFF runtime registered successfully');
  } catch (error) {
    fastify.log.error('Failed to register IAM BFF runtime:', error);
    throw error;
  }

  // Start server
  try {
    await fastify.listen({ port: PORT, host: HOST });
    fastify.log.info(`🚀 BFF server running at http://${HOST}:${PORT}`);
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
  console.error('Failed to start BFF server:', err);
  process.exit(1);
});
