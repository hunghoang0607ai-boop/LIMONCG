import { Response } from 'express';
import { AuthRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import { ApiError } from '../utils/ApiError';
import prisma from '../config/database';

const projectSelect = {
  id: true, name: true, description: true, status: true, budget: true, spent: true,
  startDate: true, endDate: true, tags: true, createdAt: true, updatedAt: true,
  company: { select: { id: true, name: true } },
  manager: { select: { id: true, fullName: true, email: true } },
  _count: { select: { tasks: true } },
};

export const getProjects = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = '1', limit = '20', status, companyId, managerId, search } = req.query as any;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where: any = {};
  if (status) where.status = status;
  if (companyId) where.companyId = companyId;
  if (managerId) where.managerId = managerId;
  if (search) where.name = { contains: search, mode: 'insensitive' };

  const [projects, total] = await Promise.all([
    prisma.project.findMany({ where, select: projectSelect, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' } }),
    prisma.project.count({ where }),
  ]);

  sendSuccess(res, { data: projects, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) } });
});

export const getProject = asyncHandler(async (req: AuthRequest, res: Response) => {
  const project = await prisma.project.findUnique({
    where: { id: req.params.id },
    select: {
      ...projectSelect,
      tasks: {
        select: { id: true, title: true, status: true, priority: true, dueDate: true, assignedTo: { select: { id: true, fullName: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
  if (!project) throw ApiError.notFound('Project không tồn tại');
  sendSuccess(res, project);
});

export const createProject = asyncHandler(async (req: AuthRequest, res: Response) => {
  const project = await prisma.project.create({
    data: { ...req.body, managerId: req.body.managerId || req.user!.id },
    select: projectSelect,
  });
  sendSuccess(res, project, 'Tạo project thành công', 201);
});

export const updateProject = asyncHandler(async (req: AuthRequest, res: Response) => {
  const existing = await prisma.project.findUnique({ where: { id: req.params.id } });
  if (!existing) throw ApiError.notFound('Project không tồn tại');
  const project = await prisma.project.update({ where: { id: req.params.id }, data: req.body, select: projectSelect });
  sendSuccess(res, project, 'Cập nhật thành công');
});

export const deleteProject = asyncHandler(async (req: AuthRequest, res: Response) => {
  const existing = await prisma.project.findUnique({ where: { id: req.params.id } });
  if (!existing) throw ApiError.notFound('Project không tồn tại');
  await prisma.project.delete({ where: { id: req.params.id } });
  sendSuccess(res, null, 'Xóa thành công');
});
