import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { sendError } from '../utils/response';
import logger from '../config/logger';
import { Prisma } from '@prisma/client';

/**
 * Error handling middleware
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  let error = err;

  // Log error
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        error = ApiError.conflict('A record with this value already exists');
        break;
      case 'P2025':
        error = ApiError.notFound('Record not found');
        break;
      default:
        error = ApiError.internal('Database error occurred');
    }
  }

  // Prisma validation errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    error = ApiError.badRequest('Invalid data provided');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = ApiError.unauthorized('Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    error = ApiError.unauthorized('Token expired');
  }

  // Multer errors
  if (err.name === 'MulterError') {
    error = ApiError.badRequest(`File upload error: ${err.message}`);
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    error = ApiError.badRequest(err.message);
  }

  // API Error
  if (error instanceof ApiError) {
    return sendError(res, error.message, error.statusCode);
  }

  // Default error
  return sendError(
    res,
    process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    500
  );
};

/**
 * Handle 404 errors
 */
export const notFound = (req: Request, _res: Response, next: NextFunction) => {
  const error = ApiError.notFound(`Route ${req.originalUrl} not found`);
  next(error);
};
