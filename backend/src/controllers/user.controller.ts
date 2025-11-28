import { Response } from 'express';
import { AuthRequest, UserRole } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import { ApiError } from '../utils/ApiError';
import { hashPassword, comparePassword } from '../utils/password';
import prisma from '../config/database';

/**
 * @desc    Get user profile
 * @route   GET /api/v1/users/me
 * @access  Private
 */
export const getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
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

/**
 * @desc    Update user profile
 * @route   PUT /api/v1/users/me
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { fullName, phone, country, dateOfBirth, avatar } = req.body;

  const updateData: any = {};

  if (fullName !== undefined) updateData.fullName = fullName;
  if (phone !== undefined) updateData.phone = phone;
  if (country !== undefined) updateData.country = country;
  if (avatar !== undefined) updateData.avatar = avatar;
  if (dateOfBirth !== undefined) {
    updateData.dateOfBirth = new Date(dateOfBirth);
  }

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: updateData,
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
      updatedAt: true,
    },
  });

  sendSuccess(res, user, 'Profile updated successfully');
});

/**
 * @desc    Change password
 * @route   PUT /api/v1/users/me/password
 * @access  Private
 */
export const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
  });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Verify current password
  const isPasswordValid = await comparePassword(currentPassword, user.passwordHash);

  if (!isPasswordValid) {
    throw ApiError.unauthorized('Current password is incorrect');
  }

  // Hash new password
  const passwordHash = await hashPassword(newPassword);

  // Update password
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  // Delete all refresh tokens (force re-login on all devices)
  await prisma.refreshToken.deleteMany({
    where: { userId: user.id },
  });

  sendSuccess(res, null, 'Password changed successfully. Please login again.');
});

/**
 * @desc    Get user statistics
 * @route   GET /api/v1/users/me/statistics
 * @access  Private
 */
export const getUserStatistics = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  // Get exam attempts count
  const totalExamsTaken = await prisma.examAttempt.count({
    where: {
      userId,
      status: 'COMPLETED',
    },
  });

  // Get average score
  const attempts = await prisma.examAttempt.findMany({
    where: {
      userId,
      status: 'COMPLETED',
      percentage: { not: null },
    },
    select: {
      percentage: true,
    },
  });

  const averageScore =
    attempts.length > 0
      ? attempts.reduce((sum, att) => sum + (att.percentage || 0), 0) / attempts.length
      : null;

  // Get recent attempts
  const recentAttempts = await prisma.examAttempt.findMany({
    where: { userId },
    orderBy: { startedAt: 'desc' },
    take: 5,
    include: {
      exam: {
        select: {
          id: true,
          title: true,
          category: true,
        },
      },
    },
  });

  // Get credit balance
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  });

  sendSuccess(res, {
    totalExamsTaken,
    averageScore: averageScore ? Math.round(averageScore * 10) / 10 : null,
    recentAttempts,
    credits: user?.credits || 0,
  });
});

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/v1/users
 * @access  Private/Admin
 */
export const getAllUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 10, search, role } = req.query;

  const where: any = {};

  if (search) {
    where.OR = [
      { email: { contains: search as string, mode: 'insensitive' } },
      { fullName: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  if (role) {
    where.role = role;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
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
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  sendSuccess(res, {
    data: users,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
});

/**
 * @desc    Get user by ID (Admin only)
 * @route   GET /api/v1/users/:id
 * @access  Private/Admin
 */
export const getUserById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
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
      _count: {
        select: {
          examAttempts: true,
          creditTransactions: true,
        },
      },
    },
  });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  sendSuccess(res, user);
});

/**
 * @desc    Update user role (Admin only)
 * @route   PUT /api/v1/users/:id/role
 * @access  Private/Admin
 */
export const updateUserRole = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!Object.values(UserRole).includes(role)) {
    throw ApiError.badRequest('Invalid role');
  }

  const user = await prisma.user.update({
    where: { id },
    data: { role },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
    },
  });

  sendSuccess(res, user, 'User role updated successfully');
});

/**
 * @desc    Add credits to user (Admin only)
 * @route   POST /api/v1/users/:id/credits
 * @access  Private/Admin
 */
export const addCredits = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { amount, description } = req.body;

  if (!amount || amount <= 0) {
    throw ApiError.badRequest('Amount must be greater than 0');
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: { credits: true },
  });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const newBalance = user.credits + amount;

  // Update user credits
  await prisma.user.update({
    where: { id },
    data: { credits: newBalance },
  });

  // Create transaction record
  await prisma.creditTransaction.create({
    data: {
      userId: id,
      amount,
      transactionType: 'ADMIN_ADJUSTMENT',
      description: description || 'Credits added by admin',
      balanceAfter: newBalance,
    },
  });

  sendSuccess(res, { credits: newBalance }, 'Credits added successfully');
});

/**
 * @desc    Delete user (Admin only)
 * @route   DELETE /api/v1/users/:id
 * @access  Private/Admin
 */
export const deleteUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  // Don't allow deleting own account
  if (id === req.user!.id) {
    throw ApiError.badRequest('You cannot delete your own account');
  }

  await prisma.user.delete({
    where: { id },
  });

  sendSuccess(res, null, 'User deleted successfully');
});
