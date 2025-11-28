import { Router } from 'express';
import {
  register,
  login,
  logout,
  refreshToken,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  getCurrentUser,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate, schemas } from '../middleware/validate';

const router = Router();

// Public routes
router.post('/register', validate(schemas.register), register);
router.post('/login', validate(schemas.login), login);
router.post('/refresh-token', validate(schemas.refreshToken), refreshToken);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/forgot-password', validate(schemas.forgotPassword), forgotPassword);
router.post('/reset-password', validate(schemas.resetPassword), resetPassword);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getCurrentUser);

export default router;
