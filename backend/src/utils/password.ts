import bcrypt from 'bcrypt';
import env from '../config/env';

/**
 * Hash password
 */
export const hashPassword = async (password: string): Promise<string> => {
  const rounds = parseInt(env.BCRYPT_ROUNDS);
  return bcrypt.hash(password, rounds);
};

/**
 * Compare password with hash
 */
export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
