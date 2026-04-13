import { Response } from 'express';
import { AuthRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import prisma from '../config/database';

export const getDashboardStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalContacts, newContactsThisMonth, newContactsLastMonth,
    totalDeals, totalDealsValue,
    wonDealsThisMonth, wonDealsValueThisMonth,
    activeTasks, overdueTasks,
    activeProjects,
    recentActivities,
    dealsByStage,
    contactsByStatus,
    tasksByStatus,
  ] = await Promise.all([
    prisma.contact.count(),
    prisma.contact.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.contact.count({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
    prisma.deal.count({ where: { stage: { notIn: ['CLOSED_WON', 'CLOSED_LOST'] } } }),
    prisma.deal.aggregate({ where: { stage: { notIn: ['CLOSED_LOST'] } }, _sum: { value: true } }),
    prisma.deal.count({ where: { stage: 'CLOSED_WON', updatedAt: { gte: startOfMonth } } }),
    prisma.deal.aggregate({ where: { stage: 'CLOSED_WON', updatedAt: { gte: startOfMonth } }, _sum: { value: true } }),
    prisma.task.count({ where: { status: { in: ['TODO', 'IN_PROGRESS'] } } }),
    prisma.task.count({ where: { status: { in: ['TODO', 'IN_PROGRESS'] }, dueDate: { lt: now } } }),
    prisma.project.count({ where: { status: { in: ['PLANNING', 'IN_PROGRESS'] } } }),
    prisma.activity.findMany({
      select: { id: true, type: true, subject: true, createdAt: true, createdBy: { select: { fullName: true } }, contact: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.deal.groupBy({ by: ['stage'], _count: true, _sum: { value: true } }),
    prisma.contact.groupBy({ by: ['status'], _count: true }),
    prisma.task.groupBy({ by: ['status'], _count: true }),
  ]);

  sendSuccess(res, {
    overview: {
      totalContacts,
      contactGrowth: newContactsLastMonth > 0 ? Math.round(((newContactsThisMonth - newContactsLastMonth) / newContactsLastMonth) * 100) : 100,
      activePipelineDeals: totalDeals,
      pipelineValue: totalDealsValue._sum.value || 0,
      wonDealsThisMonth,
      revenueThisMonth: wonDealsValueThisMonth._sum.value || 0,
      activeTasks,
      overdueTasks,
      activeProjects,
    },
    dealsByStage: dealsByStage.map(d => ({ stage: d.stage, count: d._count, value: d._sum.value || 0 })),
    contactsByStatus: contactsByStatus.map(c => ({ status: c.status, count: c._count })),
    tasksByStatus: tasksByStatus.map(t => ({ status: t.status, count: t._count })),
    recentActivities,
  });
});

export const getTeamMembers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const users = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true, fullName: true, email: true, role: true, department: true, avatar: true },
    orderBy: { fullName: 'asc' },
  });
  sendSuccess(res, users);
});
