import { Response } from 'express';
import { AuthRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import { ApiError } from '../utils/ApiError';
import prisma from '../config/database';

const taskSelect = {
  id: true, title: true, description: true, priority: true, status: true, dueDate: true, createdAt: true, updatedAt: true,
  assignedTo: { select: { id: true, fullName: true, email: true } },
  contact: { select: { id: true, firstName: true, lastName: true } },
  deal: { select: { id: true, title: true } },
  project: { select: { id: true, name: true } },
};

export const getTasks = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = '1', limit = '20', status, priority, assignedToId, projectId, dealId, contactId, search } = req.query as any;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where: any = {};
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (assignedToId) where.assignedToId = assignedToId;
  if (projectId) where.projectId = projectId;
  if (dealId) where.dealId = dealId;
  if (contactId) where.contactId = contactId;
  if (search) where.title = { contains: search, mode: 'insensitive' };

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({ where, select: taskSelect, skip, take: parseInt(limit), orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }] }),
    prisma.task.count({ where }),
  ]);

  sendSuccess(res, { data: tasks, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) } });
});

export const getTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  const task = await prisma.task.findUnique({ where: { id: req.params.id }, select: taskSelect });
  if (!task) throw ApiError.notFound('Task không tồn tại');
  sendSuccess(res, task);
});

export const createTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  const task = await prisma.task.create({
    data: { ...req.body, assignedToId: req.body.assignedToId || req.user!.id },
    select: taskSelect,
  });
  sendSuccess(res, task, 'Tạo task thành công', 201);
});

export const updateTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  const existing = await prisma.task.findUnique({ where: { id: req.params.id } });
  if (!existing) throw ApiError.notFound('Task không tồn tại');
  const task = await prisma.task.update({ where: { id: req.params.id }, data: req.body, select: taskSelect });
  sendSuccess(res, task, 'Cập nhật thành công');
});

export const deleteTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  const existing = await prisma.task.findUnique({ where: { id: req.params.id } });
  if (!existing) throw ApiError.notFound('Task không tồn tại');
  await prisma.task.delete({ where: { id: req.params.id } });
  sendSuccess(res, null, 'Xóa thành công');
});
