import { Response, NextFunction } from 'express';
import { AuthRequest, UserRole } from '../types';
import { verifyAccessToken } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import prisma from '../config/database';

/**
 * Verify JWT token and attach user to request
 */
export const authenticate = asyncHandler(
  async (req: AuthRequest, _res: Response, next: NextFunction) => {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('No token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      // Verify token
      const decoded = verifyAccessToken(token);

      // Check if user still exists
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          role: true,
          isEmailVerified: true,
        },
      });

      if (!user) {
        throw ApiError.unauthorized('User not found');
      }

      // Attach user to request
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
      };

      next();
    } catch (error) {
      throw ApiError.unauthorized('Invalid or expired token');
    }
  }
);

/**
 * Check if user has required role(s)
 */
export const authorize = (...roles: UserRole[]) => {
  return asyncHandler(async (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden('You do not have permission to access this resource');
    }

    next();
  });
};

/**
 * Check if email is verified
 */
export const requireEmailVerified = asyncHandler(
  async (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { isEmailVerified: true },
    });

    if (!user?.isEmailVerified) {
      throw ApiError.forbidden('Please verify your email address first');
    }

    next();
  }
);

/**
 * Optional authentication - doesn't throw error if no token
 */
export const optionalAuth = asyncHandler(
  async (req: AuthRequest, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);

    try {
      const decoded = verifyAccessToken(token);

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          role: true,
        },
      });

      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
        };
      }
    } catch (error) {
      // Ignore token errors for optional auth
    }

    next();
  }
);
