import { createClient } from 'redis';
import logger from './logger';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  password: process.env.REDIS_PASSWORD || undefined,
});

redisClient.on('error', (err) => {
  logger.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  logger.info('Redis connected successfully');
});

redisClient.on('ready', () => {
  logger.info('Redis is ready to accept commands');
});

redisClient.on('reconnecting', () => {
  logger.warn('Redis reconnecting...');
});

// Connect to Redis
export const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    throw error;
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  if (redisClient.isOpen) {
    await redisClient.quit();
    logger.info('Redis disconnected');
  }
});

export default redisClient;
