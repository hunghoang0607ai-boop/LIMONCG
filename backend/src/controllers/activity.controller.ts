import { Response } from 'express';
import { AuthRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import { ApiError } from '../utils/ApiError';
import prisma from '../config/database';

const activitySelect = {
  id: true, type: true, subject: true, description: true, scheduledAt: true,
  completedAt: true, duration: true, createdAt: true, updatedAt: true,
  contact: { select: { id: true, firstName: true, lastName: true } },
  deal: { select: { id: true, title: true } },
  createdBy: { select: { id: true, fullName: true, email: true } },
};

export const getActivities = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = '1', limit = '20', type, contactId, dealId, createdById, search } = req.query as any;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where: any = {};
  if (type) where.type = type;
  if (contactId) where.contactId = contactId;
  if (dealId) where.dealId = dealId;
  if (createdById) where.createdById = createdById;
  if (search) where.subject = { contains: search, mode: 'insensitive' };

  const [activities, total] = await Promise.all([
    prisma.activity.findMany({ where, select: activitySelect, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' } }),
    prisma.activity.count({ where }),
  ]);

  sendSuccess(res, { data: activities, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) } });
});

export const getActivity = asyncHandler(async (req: AuthRequest, res: Response) => {
  const activity = await prisma.activity.findUnique({ where: { id: req.params.id }, select: activitySelect });
  if (!activity) throw ApiError.notFound('Activity không tồn tại');
  sendSuccess(res, activity);
});

export const createActivity = asyncHandler(async (req: AuthRequest, res: Response) => {
  const activity = await prisma.activity.create({
    data: { ...req.body, createdById: req.user!.id },
    select: activitySelect,
  });
  sendSuccess(res, activity, 'Tạo activity thành công', 201);
});

export const updateActivity = asyncHandler(async (req: AuthRequest, res: Response) => {
  const existing = await prisma.activity.findUnique({ where: { id: req.params.id } });
  if (!existing) throw ApiError.notFound('Activity không tồn tại');
  const activity = await prisma.activity.update({ where: { id: req.params.id }, data: req.body, select: activitySelect });
  sendSuccess(res, activity, 'Cập nhật thành công');
});

export const deleteActivity = asyncHandler(async (req: AuthRequest, res: Response) => {
  const existing = await prisma.activity.findUnique({ where: { id: req.params.id } });
  if (!existing) throw ApiError.notFound('Activity không tồn tại');
  await prisma.activity.delete({ where: { id: req.params.id } });
  sendSuccess(res, null, 'Xóa thành công');
});
