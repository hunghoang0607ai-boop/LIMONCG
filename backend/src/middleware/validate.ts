import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { ApiError } from '../utils/ApiError';

/**
 * Validate request data against Zod schema
 */
export const validate = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw ApiError.badRequest('Validation failed');
      }
      next(error);
    }
  };
};

/**
 * Common validation schemas
 */
export const schemas = {
  // Auth schemas
  register: z.object({
    body: z.object({
      email: z.string().email('Invalid email address'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
      fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    }),
  }),

  login: z.object({
    body: z.object({
      email: z.string().email('Invalid email address'),
      password: z.string().min(1, 'Password is required'),
    }),
  }),

  refreshToken: z.object({
    body: z.object({
      refreshToken: z.string().min(1, 'Refresh token is required'),
    }),
  }),

  forgotPassword: z.object({
    body: z.object({
      email: z.string().email('Invalid email address'),
    }),
  }),

  resetPassword: z.object({
    body: z.object({
      token: z.string().min(1, 'Token is required'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
    }),
  }),

  // User schemas
  updateProfile: z.object({
    body: z.object({
      fullName: z.string().min(2).optional(),
      phone: z.string().optional(),
      country: z.string().optional(),
      dateOfBirth: z.string().optional(),
    }),
  }),

  changePassword: z.object({
    body: z.object({
      currentPassword: z.string().min(1, 'Current password is required'),
      newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    }),
  }),
};
