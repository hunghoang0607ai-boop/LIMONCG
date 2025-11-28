import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';
import env from '../config/env';

/**
 * Generate access token
 */
export const generateAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

/**
 * Generate both access and refresh tokens
 */
export const generateTokens = (payload: JwtPayload) => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};
