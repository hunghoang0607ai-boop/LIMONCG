import { Response } from 'express';
import { AuthRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import { ApiError } from '../utils/ApiError';
import prisma from '../config/database';

const contactSelect = {
  id: true, firstName: true, lastName: true, email: true, phone: true,
  jobTitle: true, status: true, source: true, notes: true, tags: true,
  linkedinUrl: true, avatarUrl: true, createdAt: true, updatedAt: true,
  company: { select: { id: true, name: true } },
  assignedTo: { select: { id: true, fullName: true, email: true } },
};

export const getContacts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = '1', limit = '20', search, status, source, companyId, assignedToId } = req.query as any;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where: any = {};
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (status) where.status = status;
  if (source) where.source = source;
  if (companyId) where.companyId = companyId;
  if (assignedToId) where.assignedToId = assignedToId;

  const [contacts, total] = await Promise.all([
    prisma.contact.findMany({ where, select: contactSelect, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' } }),
    prisma.contact.count({ where }),
  ]);

  sendSuccess(res, { data: contacts, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) } });
});

export const getContact = asyncHandler(async (req: AuthRequest, res: Response) => {
  const contact = await prisma.contact.findUnique({
    where: { id: req.params.id },
    select: {
      ...contactSelect,
      deals: { select: { id: true, title: true, value: true, stage: true, currency: true } },
      tasks: { select: { id: true, title: true, status: true, priority: true, dueDate: true } },
      activities: { select: { id: true, type: true, subject: true, completedAt: true, scheduledAt: true }, orderBy: { createdAt: 'desc' }, take: 10 },
    },
  });
  if (!contact) throw ApiError.notFound('Contact không tồn tại');
  sendSuccess(res, contact);
});

export const createContact = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { firstName, lastName, email, phone, jobTitle, status, source, companyId, assignedToId, notes, tags, linkedinUrl } = req.body;
  const contact = await prisma.contact.create({
    data: { firstName, lastName, email, phone, jobTitle, status, source, companyId, assignedToId: assignedToId || req.user!.id, notes, tags, linkedinUrl },
    select: contactSelect,
  });
  sendSuccess(res, contact, 'Tạo contact thành công', 201);
});

export const updateContact = asyncHandler(async (req: AuthRequest, res: Response) => {
  const existing = await prisma.contact.findUnique({ where: { id: req.params.id } });
  if (!existing) throw ApiError.notFound('Contact không tồn tại');

  const contact = await prisma.contact.update({
    where: { id: req.params.id },
    data: req.body,
    select: contactSelect,
  });
  sendSuccess(res, contact, 'Cập nhật thành công');
});

export const deleteContact = asyncHandler(async (req: AuthRequest, res: Response) => {
  const existing = await prisma.contact.findUnique({ where: { id: req.params.id } });
  if (!existing) throw ApiError.notFound('Contact không tồn tại');
  await prisma.contact.delete({ where: { id: req.params.id } });
  sendSuccess(res, null, 'Xóa thành công');
});
