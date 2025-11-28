import app from './app';
import env from './config/env';
import logger from './config/logger';
import prisma from './config/database';
import { connectRedis } from './config/redis';

const PORT = parseInt(env.PORT) || 5000;

/**
 * Start the server
 */
const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('✅ Database connected successfully');

    // Connect to Redis
    await connectRedis();
    logger.info('✅ Redis connected successfully');

    // Start Express server
    app.listen(PORT, () => {
      logger.info(`🚀 Server is running on port ${PORT}`);
      logger.info(`🌍 Environment: ${env.NODE_ENV}`);
      logger.info(`📡 API: http://localhost:${PORT}/api/${env.API_VERSION}`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: Error) => {
  logger.error('Unhandled Rejection:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

// Start the server
startServer();
