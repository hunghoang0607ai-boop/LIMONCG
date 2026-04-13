import { Response } from 'express';
import { AuthRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import { ApiError } from '../utils/ApiError';
import prisma from '../config/database';

const companySelect = {
  id: true, name: true, industry: true, website: true, phone: true, email: true,
  address: true, city: true, country: true, size: true, revenue: true, notes: true,
  logoUrl: true, createdAt: true, updatedAt: true,
  _count: { select: { contacts: true, deals: true, projects: true } },
};

export const getCompanies = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = '1', limit = '20', search, industry, size } = req.query as any;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where: any = {};
  if (search) where.OR = [
    { name: { contains: search, mode: 'insensitive' } },
    { email: { contains: search, mode: 'insensitive' } },
    { industry: { contains: search, mode: 'insensitive' } },
  ];
  if (industry) where.industry = industry;
  if (size) where.size = size;

  const [companies, total] = await Promise.all([
    prisma.company.findMany({ where, select: companySelect, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' } }),
    prisma.company.count({ where }),
  ]);

  sendSuccess(res, { data: companies, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) } });
});

export const getCompany = asyncHandler(async (req: AuthRequest, res: Response) => {
  const company = await prisma.company.findUnique({
    where: { id: req.params.id },
    select: {
      ...companySelect,
      contacts: { select: { id: true, firstName: true, lastName: true, jobTitle: true, email: true, status: true }, take: 10 },
      deals: { select: { id: true, title: true, value: true, stage: true, currency: true }, take: 10 },
      projects: { select: { id: true, name: true, status: true, startDate: true, endDate: true }, take: 10 },
    },
  });
  if (!company) throw ApiError.notFound('Công ty không tồn tại');
  sendSuccess(res, company);
});

export const createCompany = asyncHandler(async (req: AuthRequest, res: Response) => {
  const company = await prisma.company.create({ data: req.body, select: companySelect });
  sendSuccess(res, company, 'Tạo công ty thành công', 201);
});

export const updateCompany = asyncHandler(async (req: AuthRequest, res: Response) => {
  const existing = await prisma.company.findUnique({ where: { id: req.params.id } });
  if (!existing) throw ApiError.notFound('Công ty không tồn tại');
  const company = await prisma.company.update({ where: { id: req.params.id }, data: req.body, select: companySelect });
  sendSuccess(res, company, 'Cập nhật thành công');
});

export const deleteCompany = asyncHandler(async (req: AuthRequest, res: Response) => {
  const existing = await prisma.company.findUnique({ where: { id: req.params.id } });
  if (!existing) throw ApiError.notFound('Công ty không tồn tại');
  await prisma.company.delete({ where: { id: req.params.id } });
  sendSuccess(res, null, 'Xóa thành công');
});
