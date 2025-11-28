import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Environment variables schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  API_VERSION: z.string().default('v1'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  REDIS_URL: z.string().default('redis://localhost:6379'),
  REDIS_PASSWORD: z.string().optional(),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('1h'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  EMAIL_HOST: z.string().optional(),
  EMAIL_PORT: z.string().optional(),
  EMAIL_USER: z.string().optional(),
  EMAIL_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().optional(),

  FRONTEND_URL: z.string().url().default('http://localhost:3000'),

  MAX_FILE_SIZE: z.string().default('10485760'), // 10MB
  UPLOAD_DIR: z.string().default('./uploads'),

  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  BCRYPT_ROUNDS: z.string().default('10'),
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),

  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

// Validate environment variables
const validateEnv = () => {
  try {
    const parsed = envSchema.parse(process.env);
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
};

export const env = validateEnv();

export default env;
