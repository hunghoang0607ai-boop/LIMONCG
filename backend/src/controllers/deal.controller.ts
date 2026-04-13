import { Response } from 'express';
import { AuthRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import { ApiError } from '../utils/ApiError';
import prisma from '../config/database';

const dealSelect = {
  id: true, title: true, value: true, currency: true, stage: true, probability: true,
  expectedCloseDate: true, notes: true, lostReason: true, createdAt: true, updatedAt: true,
  contact: { select: { id: true, firstName: true, lastName: true, email: true } },
  company: { select: { id: true, name: true } },
  assignedTo: { select: { id: true, fullName: true, email: true } },
};

export const getDeals = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = '1', limit = '50', stage, assignedToId, companyId, search } = req.query as any;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where: any = {};
  if (stage) where.stage = stage;
  if (assignedToId) where.assignedToId = assignedToId;
  if (companyId) where.companyId = companyId;
  if (search) where.title = { contains: search, mode: 'insensitive' };

  const [deals, total] = await Promise.all([
    prisma.deal.findMany({ where, select: dealSelect, skip, take: parseInt(limit), orderBy: { updatedAt: 'desc' } }),
    prisma.deal.count({ where }),
  ]);

  sendSuccess(res, { data: deals, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) } });
});

export const getDealsByStage = asyncHandler(async (req: AuthRequest, res: Response) => {
  const stages = ['PROSPECTING', 'QUALIFICATION', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'];
  const result: any = {};

  for (const stage of stages) {
    const deals = await prisma.deal.findMany({
      where: { stage: stage as any },
      select: dealSelect,
      orderBy: { updatedAt: 'desc' },
    });
    result[stage] = deals;
  }

  sendSuccess(res, result);
});

export const getDeal = asyncHandler(async (req: AuthRequest, res: Response) => {
  const deal = await prisma.deal.findUnique({
    where: { id: req.params.id },
    select: {
      ...dealSelect,
      activities: { select: { id: true, type: true, subject: true, completedAt: true, scheduledAt: true, createdBy: { select: { fullName: true } } }, orderBy: { createdAt: 'desc' } },
      tasks: { select: { id: true, title: true, status: true, priority: true, dueDate: true } },
    },
  });
  if (!deal) throw ApiError.notFound('Deal không tồn tại');
  sendSuccess(res, deal);
});

export const createDeal = asyncHandler(async (req: AuthRequest, res: Response) => {
  const deal = await prisma.deal.create({
    data: { ...req.body, assignedToId: req.body.assignedToId || req.user!.id },
    select: dealSelect,
  });
  sendSuccess(res, deal, 'Tạo deal thành công', 201);
});

export const updateDeal = asyncHandler(async (req: AuthRequest, res: Response) => {
  const existing = await prisma.deal.findUnique({ where: { id: req.params.id } });
  if (!existing) throw ApiError.notFound('Deal không tồn tại');
  const deal = await prisma.deal.update({ where: { id: req.params.id }, data: req.body, select: dealSelect });
  sendSuccess(res, deal, 'Cập nhật thành công');
});

export const updateDealStage = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { stage, probability, lostReason } = req.body;
  const existing = await prisma.deal.findUnique({ where: { id: req.params.id } });
  if (!existing) throw ApiError.notFound('Deal không tồn tại');
  const deal = await prisma.deal.update({
    where: { id: req.params.id },
    data: { stage, probability, lostReason },
    select: dealSelect,
  });
  sendSuccess(res, deal, 'Cập nhật giai đoạn thành công');
});

export const deleteDeal = asyncHandler(async (req: AuthRequest, res: Response) => {
  const existing = await prisma.deal.findUnique({ where: { id: req.params.id } });
  if (!existing) throw ApiError.notFound('Deal không tồn tại');
  await prisma.deal.delete({ where: { id: req.params.id } });
  sendSuccess(res, null, 'Xóa thành công');
});
