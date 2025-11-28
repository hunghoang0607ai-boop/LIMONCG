import { Response } from 'express';
import { AuthRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import { ApiError } from '../utils/ApiError';
import prisma from '../config/database';

/**
 * @desc    Get all exams
 * @route   GET /api/v1/exams
 * @access  Public
 */
export const getAllExams = asyncHandler(async (req: AuthRequest, res: Response) => {
  const {
    page = 1,
    limit = 10,
    category,
    difficultyLevel,
    isDemo,
    isPlacementTest,
    search,
  } = req.query;

  const where: any = {
    isPublished: true, // Only published exams for public
  };

  // Admin/Teacher can see unpublished exams
  if (req.user && ['ADMIN', 'TEACHER'].includes(req.user.role)) {
    delete where.isPublished;
  }

  if (category) where.category = category;
  if (difficultyLevel) where.difficultyLevel = difficultyLevel;
  if (isDemo !== undefined) where.isDemo = isDemo === 'true';
  if (isPlacementTest !== undefined) where.isPlacementTest = isPlacementTest === 'true';
  if (search) {
    where.OR = [
      { title: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  const [exams, total] = await Promise.all([
    prisma.exam.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        _count: {
          select: {
            questions: true,
            examAttempts: true,
          },
        },
      },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.exam.count({ where }),
  ]);

  sendSuccess(res, {
    data: exams,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
});

/**
 * @desc    Get single exam by ID
 * @route   GET /api/v1/exams/:id
 * @access  Public
 */
export const getExamById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      _count: {
        select: {
          questions: true,
          examAttempts: true,
        },
      },
    },
  });

  if (!exam) {
    throw ApiError.notFound('Exam not found');
  }

  // Check if user has access
  if (!exam.isPublished && (!req.user || !['ADMIN', 'TEACHER'].includes(req.user.role))) {
    throw ApiError.forbidden('This exam is not yet published');
  }

  sendSuccess(res, exam);
});

/**
 * @desc    Create new exam
 * @route   POST /api/v1/exams
 * @access  Private/Teacher/Admin
 */
export const createExam = asyncHandler(async (req: AuthRequest, res: Response) => {
  const {
    category,
    title,
    description,
    difficultyLevel,
    durationMinutes,
    creditCost,
    isDemo,
    isPlacementTest,
    passingScore,
    thumbnail,
    instructions,
  } = req.body;

  const exam = await prisma.exam.create({
    data: {
      category,
      title,
      description,
      difficultyLevel,
      durationMinutes,
      creditCost: creditCost || 0,
      isDemo: isDemo || false,
      isPlacementTest: isPlacementTest || false,
      passingScore: passingScore || 60,
      thumbnail,
      instructions,
      isPublished: false, // Draft by default
      totalQuestions: 0,
      createdById: req.user!.id,
    },
    include: {
      createdBy: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  });

  sendSuccess(res, exam, 'Exam created successfully', 201);
});

/**
 * @desc    Update exam
 * @route   PUT /api/v1/exams/:id
 * @access  Private/Teacher/Admin
 */
export const updateExam = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const {
    category,
    title,
    description,
    difficultyLevel,
    durationMinutes,
    creditCost,
    isDemo,
    isPlacementTest,
    passingScore,
    thumbnail,
    instructions,
    isPublished,
  } = req.body;

  // Check if exam exists
  const existingExam = await prisma.exam.findUnique({
    where: { id },
  });

  if (!existingExam) {
    throw ApiError.notFound('Exam not found');
  }

  // Only creator or admin can update
  if (
    existingExam.createdById !== req.user!.id &&
    req.user!.role !== 'ADMIN'
  ) {
    throw ApiError.forbidden('You do not have permission to update this exam');
  }

  const updateData: any = {};
  if (category !== undefined) updateData.category = category;
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (difficultyLevel !== undefined) updateData.difficultyLevel = difficultyLevel;
  if (durationMinutes !== undefined) updateData.durationMinutes = durationMinutes;
  if (creditCost !== undefined) updateData.creditCost = creditCost;
  if (isDemo !== undefined) updateData.isDemo = isDemo;
  if (isPlacementTest !== undefined) updateData.isPlacementTest = isPlacementTest;
  if (passingScore !== undefined) updateData.passingScore = passingScore;
  if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
  if (instructions !== undefined) updateData.instructions = instructions;
  if (isPublished !== undefined) updateData.isPublished = isPublished;

  const exam = await prisma.exam.update({
    where: { id },
    data: updateData,
    include: {
      createdBy: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      _count: {
        select: {
          questions: true,
        },
      },
    },
  });

  sendSuccess(res, exam, 'Exam updated successfully');
});

/**
 * @desc    Delete exam
 * @route   DELETE /api/v1/exams/:id
 * @access  Private/Admin
 */
export const deleteExam = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      _count: {
        select: { examAttempts: true },
      },
    },
  });

  if (!exam) {
    throw ApiError.notFound('Exam not found');
  }

  // Don't delete exams with attempts
  if (exam._count.examAttempts > 0) {
    throw ApiError.badRequest(
      'Cannot delete exam with existing attempts. Consider unpublishing instead.'
    );
  }

  await prisma.exam.delete({
    where: { id },
  });

  sendSuccess(res, null, 'Exam deleted successfully');
});

/**
 * @desc    Publish/Unpublish exam
 * @route   PATCH /api/v1/exams/:id/publish
 * @access  Private/Teacher/Admin
 */
export const togglePublish = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { isPublished } = req.body;

  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      _count: { select: { questions: true } },
    },
  });

  if (!exam) {
    throw ApiError.notFound('Exam not found');
  }

  // Check ownership
  if (exam.createdById !== req.user!.id && req.user!.role !== 'ADMIN') {
    throw ApiError.forbidden('You do not have permission to publish this exam');
  }

  // Must have questions to publish
  if (isPublished && exam._count.questions === 0) {
    throw ApiError.badRequest('Cannot publish exam without questions');
  }

  const updatedExam = await prisma.exam.update({
    where: { id },
    data: { isPublished },
  });

  sendSuccess(
    res,
    updatedExam,
    `Exam ${isPublished ? 'published' : 'unpublished'} successfully`
  );
});

/**
 * @desc    Get exam statistics
 * @route   GET /api/v1/exams/:id/statistics
 * @access  Private/Teacher/Admin
 */
export const getExamStatistics = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const exam = await prisma.exam.findUnique({
    where: { id },
  });

  if (!exam) {
    throw ApiError.notFound('Exam not found');
  }

  // Get statistics
  const [totalAttempts, completedAttempts, averageScore] = await Promise.all([
    prisma.examAttempt.count({
      where: { examId: id },
    }),
    prisma.examAttempt.count({
      where: { examId: id, status: 'COMPLETED' },
    }),
    prisma.examAttempt.aggregate({
      where: {
        examId: id,
        status: 'COMPLETED',
        percentage: { not: null },
      },
      _avg: { percentage: true },
    }),
  ]);

  // Get recent attempts
  const recentAttempts = await prisma.examAttempt.findMany({
    where: { examId: id },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
    orderBy: { startedAt: 'desc' },
    take: 10,
  });

  sendSuccess(res, {
    totalAttempts,
    completedAttempts,
    averageScore: averageScore._avg.percentage || 0,
    recentAttempts,
  });
});
