import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import { ApiError } from '../utils/ApiError';
import { hashPassword, comparePassword } from '../utils/password';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';
import prisma from '../config/database';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, fullName, role, department, phone } = req.body;
  const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existingUser) throw ApiError.conflict('Email đã được sử dụng');

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email: email.toLowerCase(), passwordHash, fullName, role: role || 'SALES', department, phone },
    select: { id: true, email: true, fullName: true, role: true, department: true, phone: true, createdAt: true },
  });

  const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.role as any);
  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  });
  sendSuccess(res, { user, accessToken, refreshToken }, 'Đăng ký thành công', 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true, email: true, passwordHash: true, fullName: true, role: true, department: true, phone: true, avatar: true, isActive: true },
  });

  if (!user) throw ApiError.unauthorized('Email hoặc mật khẩu không đúng');
  if (!user.isActive) throw ApiError.forbidden('Tài khoản đã bị vô hiệu hóa');

  const isMatch = await comparePassword(password, user.passwordHash);
  if (!isMatch) throw ApiError.unauthorized('Email hoặc mật khẩu không đúng');

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.role as any);
  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  });

  const { passwordHash: _, ...userOut } = user;
  sendSuccess(res, { user: userOut, accessToken, refreshToken }, 'Đăng nhập thành công');
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw ApiError.badRequest('Refresh token is required');

  verifyRefreshToken(refreshToken);
  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken }, include: { user: true } });
  if (!stored || stored.expiresAt < new Date()) throw ApiError.unauthorized('Invalid or expired refresh token');

  const { accessToken, refreshToken: newRefresh } = generateTokens(stored.user.id, stored.user.email, stored.user.role as any);
  await prisma.refreshToken.delete({ where: { token: refreshToken } });
  await prisma.refreshToken.create({
    data: { token: newRefresh, userId: stored.user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  });
  sendSuccess(res, { accessToken, refreshToken: newRefresh }, 'Token refreshed');
});

export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { refreshToken } = req.body;
  if (refreshToken) await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  sendSuccess(res, null, 'Đăng xuất thành công');
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, email: true, fullName: true, role: true, department: true, phone: true, avatar: true, isActive: true, lastLoginAt: true, createdAt: true },
  });
  if (!user) throw ApiError.notFound('User not found');
  sendSuccess(res, user);
});

export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { fullName, phone, department } = req.body;
  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: { fullName, phone, department },
    select: { id: true, email: true, fullName: true, role: true, department: true, phone: true, avatar: true },
  });
  sendSuccess(res, user, 'Cập nhật thông tin thành công');
});

export const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { passwordHash: true } });
  if (!user) throw ApiError.notFound('User not found');
  const isMatch = await comparePassword(currentPassword, user.passwordHash);
  if (!isMatch) throw ApiError.badRequest('Mật khẩu hiện tại không đúng');
  await prisma.user.update({ where: { id: req.user!.id }, data: { passwordHash: await hashPassword(newPassword) } });
  sendSuccess(res, null, 'Đổi mật khẩu thành công');
});
