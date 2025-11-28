import { Response } from 'express';
import { ApiResponse } from '../types';

/**
 * Send success response
 */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode = 200
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  return res.status(statusCode).json(response);
};

/**
 * Send error response
 */
export const sendError = (
  res: Response,
  error: string,
  statusCode = 500,
  errors?: any[]
): Response => {
  const response: ApiResponse = {
    success: false,
    error,
    errors,
  };
  return res.status(statusCode).json(response);
};
