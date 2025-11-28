import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { errorHandler, notFound } from './middleware/errorHandler';
import env from './config/env';
import logger from './config/logger';

// Routes (to be implemented)
// import authRoutes from './routes/auth.routes';
// import userRoutes from './routes/user.routes';
// import examRoutes from './routes/exam.routes';

const app: Application = express();

// Security middleware
app.use(helmet());

// CORS
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP request logger
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(
    morgan('combined', {
      stream: {
        write: (message: string) => logger.info(message.trim()),
      },
    })
  );
}

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS),
  max: parseInt(env.RATE_LIMIT_MAX_REQUESTS),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
  });
});

// API Routes
const API_PREFIX = `/api/${env.API_VERSION}`;

// TODO: Uncomment when routes are implemented
// app.use(`${API_PREFIX}/auth`, authRoutes);
// app.use(`${API_PREFIX}/users`, userRoutes);
// app.use(`${API_PREFIX}/exams`, examRoutes);

// Welcome route
app.get('/', (_req, res) => {
  res.json({
    message: 'Welcome to LIMONCG English Exam Platform API',
    version: env.API_VERSION,
    docs: `${API_PREFIX}/docs`,
  });
});

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

export default app;
