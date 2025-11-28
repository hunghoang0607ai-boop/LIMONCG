import crypto from 'crypto';

/**
 * Generate random token for email verification, password reset, etc.
 */
export const generateRandomToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Generate email verification token
 */
export const generateEmailVerifyToken = (): string => {
  return generateRandomToken();
};

/**
 * Generate password reset token
 */
export const generatePasswordResetToken = (): string => {
  return generateRandomToken();
};
