import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import { ApiError } from '../utils/ApiError';
import { hashPassword, comparePassword } from '../utils/password';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';
import {
  generateEmailVerifyToken,
  generatePasswordResetToken,
} from '../utils/tokens';
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
} from '../services/email.service';
import prisma from '../config/database';

/**
 * @desc    Register new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, fullName } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    throw ApiError.conflict('Email already registered');
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Generate email verification token
  const emailVerifyToken = generateEmailVerifyToken();

  // Create user
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      passwordHash,
      fullName,
      emailVerifyToken,
      credits: 10, // Welcome bonus credits
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      credits: true,
      currentLevel: true,
      isEmailVerified: true,
      createdAt: true,
    },
  });

  // Send verification email
  try {
    await sendVerificationEmail(user.email, emailVerifyToken);
  } catch (error) {
    // Don't fail registration if email fails
    console.error('Failed to send verification email:', error);
  }

  sendSuccess(
    res,
    {
      user,
      message: 'Registration successful. Please check your email to verify your account.',
    },
    'Registration successful',
    201
  );
});

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Check password
  const isPasswordValid = await comparePassword(password, user.passwordHash);

  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Generate tokens
  const tokens = generateTokens({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  // Calculate expiration date (7 days from now)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // Store refresh token in database
  await prisma.refreshToken.create({
    data: {
      token: tokens.refreshToken,
      userId: user.id,
      expiresAt,
    },
  });

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  // Return user and tokens
  const userData = {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    credits: user.credits,
    currentLevel: user.currentLevel,
    isEmailVerified: user.isEmailVerified,
    avatar: user.avatar,
    createdAt: user.createdAt,
  };

  sendSuccess(res, {
    user: userData,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  });
});

/**
 * @desc    Refresh access token
 * @route   POST /api/v1/auth/refresh-token
 * @access  Public
 */
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    throw ApiError.badRequest('Refresh token is required');
  }

  // Verify refresh token
  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch (error) {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  // Check if refresh token exists in database
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!storedToken) {
    throw ApiError.unauthorized('Refresh token not found');
  }

  // Check if token is expired
  if (storedToken.expiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: { token } });
    throw ApiError.unauthorized('Refresh token expired');
  }

  // Generate new tokens
  const tokens = generateTokens({
    userId: decoded.userId,
    email: decoded.email,
    role: decoded.role,
  });

  // Delete old refresh token
  await prisma.refreshToken.delete({ where: { token } });

  // Store new refresh token
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.create({
    data: {
      token: tokens.refreshToken,
      userId: decoded.userId,
      expiresAt,
    },
  });

  sendSuccess(res, {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  });
});

/**
 * @desc    Logout user
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { refreshToken: token } = req.body;

  if (token) {
    // Delete refresh token from database
    await prisma.refreshToken.deleteMany({
      where: { token },
    });
  }

  sendSuccess(res, null, 'Logged out successfully');
});

/**
 * @desc    Verify email
 * @route   GET /api/v1/auth/verify-email/:token
 * @access  Public
 */
export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.params;

  // Find user with this token
  const user = await prisma.user.findFirst({
    where: { emailVerifyToken: token },
  });

  if (!user) {
    throw ApiError.badRequest('Invalid or expired verification token');
  }

  if (user.isEmailVerified) {
    throw ApiError.badRequest('Email already verified');
  }

  // Update user
  await prisma.user.update({
    where: { id: user.id },
    data: {
      isEmailVerified: true,
      emailVerifyToken: null,
    },
  });

  // Send welcome email
  try {
    await sendWelcomeEmail(user.email, user.fullName);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }

  sendSuccess(res, null, 'Email verified successfully');
});

/**
 * @desc    Resend verification email
 * @route   POST /api/v1/auth/resend-verification
 * @access  Public
 */
export const resendVerification = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (user.isEmailVerified) {
    throw ApiError.badRequest('Email already verified');
  }

  // Generate new token
  const emailVerifyToken = generateEmailVerifyToken();

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerifyToken },
  });

  // Send email
  await sendVerificationEmail(user.email, emailVerifyToken);

  sendSuccess(res, null, 'Verification email sent');
});

/**
 * @desc    Forgot password
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    // Don't reveal that user doesn't exist
    sendSuccess(res, null, 'If the email exists, a password reset link has been sent');
    return;
  }

  // Generate reset token
  const resetToken = generatePasswordResetToken();
  const resetExpires = new Date();
  resetExpires.setHours(resetExpires.getHours() + 1); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetExpires,
    },
  });

  // Send email
  try {
    await sendPasswordResetEmail(user.email, resetToken);
  } catch (error) {
    // Rollback token if email fails
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });
    throw ApiError.internal('Failed to send password reset email');
  }

  sendSuccess(res, null, 'Password reset email sent');
});

/**
 * @desc    Reset password
 * @route   POST /api/v1/auth/reset-password
 * @access  Public
 */
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body;

  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: token,
      resetPasswordExpires: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    throw ApiError.badRequest('Invalid or expired reset token');
  }

  // Hash new password
  const passwordHash = await hashPassword(password);

  // Update password and clear reset token
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    },
  });

  // Delete all refresh tokens (force re-login)
  await prisma.refreshToken.deleteMany({
    where: { userId: user.id },
  });

  sendSuccess(res, null, 'Password reset successful. Please login with your new password.');
});

/**
 * @desc    Get current user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getCurrentUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      credits: true,
      currentLevel: true,
      isEmailVerified: true,
      avatar: true,
      phone: true,
      country: true,
      dateOfBirth: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  sendSuccess(res, user);
});
