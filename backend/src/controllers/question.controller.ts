import { Response } from 'express';
import { AuthRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import { ApiError } from '../utils/ApiError';
import prisma from '../config/database';

/**
 * @desc    Get all questions for an exam
 * @route   GET /api/v1/exams/:examId/questions
 * @access  Private (Students see questions without answers)
 */
export const getQuestionsByExam = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { examId } = req.params;
  const { includeAnswers } = req.query;

  // Check if exam exists
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
  });

  if (!exam) {
    throw ApiError.notFound('Exam not found');
  }

  const questions = await prisma.question.findMany({
    where: { examId },
    orderBy: { orderIndex: 'asc' },
  });

  // Hide correct answers for students
  if (!req.user || !['ADMIN', 'TEACHER'].includes(req.user.role)) {
    const questionsWithoutAnswers = questions.map((q) => {
      const { correctAnswer, explanation, ...rest } = q;

      // For MCQ, hide isCorrect flag in options
      if (q.options) {
        const options = Array.isArray(q.options)
          ? q.options.map((opt: any) => {
              const { isCorrect, ...optRest } = opt;
              return optRest;
            })
          : q.options;
        return { ...rest, options };
      }

      return rest;
    });

    sendSuccess(res, questionsWithoutAnswers);
    return;
  }

  // Teachers/Admins see everything
  sendSuccess(res, questions);
});

/**
 * @desc    Get single question
 * @route   GET /api/v1/questions/:id
 * @access  Private/Teacher/Admin
 */
export const getQuestionById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const question = await prisma.question.findUnique({
    where: { id },
    include: {
      exam: {
        select: {
          id: true,
          title: true,
          createdById: true,
        },
      },
    },
  });

  if (!question) {
    throw ApiError.notFound('Question not found');
  }

  sendSuccess(res, question);
});

/**
 * @desc    Create new question
 * @route   POST /api/v1/exams/:examId/questions
 * @access  Private/Teacher/Admin
 */
export const createQuestion = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { examId } = req.params;
  const {
    section,
    questionType,
    questionText,
    mediaUrl,
    mediaType,
    options,
    correctAnswer,
    explanation,
    points,
    orderIndex,
  } = req.body;

  // Check if exam exists and user has access
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
  });

  if (!exam) {
    throw ApiError.notFound('Exam not found');
  }

  if (exam.createdById !== req.user!.id && req.user!.role !== 'ADMIN') {
    throw ApiError.forbidden('You do not have permission to add questions to this exam');
  }

  // Get next order index if not provided
  let finalOrderIndex = orderIndex;
  if (finalOrderIndex === undefined) {
    const lastQuestion = await prisma.question.findFirst({
      where: { examId },
      orderBy: { orderIndex: 'desc' },
    });
    finalOrderIndex = lastQuestion ? lastQuestion.orderIndex + 1 : 0;
  }

  const question = await prisma.question.create({
    data: {
      examId,
      section,
      questionType,
      questionText,
      mediaUrl,
      mediaType,
      options: options || null,
      correctAnswer,
      explanation,
      points: points || 1,
      orderIndex: finalOrderIndex,
    },
  });

  // Update exam's total questions count
  await prisma.exam.update({
    where: { id: examId },
    data: {
      totalQuestions: {
        increment: 1,
      },
    },
  });

  sendSuccess(res, question, 'Question created successfully', 201);
});

/**
 * @desc    Update question
 * @route   PUT /api/v1/questions/:id
 * @access  Private/Teacher/Admin
 */
export const updateQuestion = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const {
    section,
    questionType,
    questionText,
    mediaUrl,
    mediaType,
    options,
    correctAnswer,
    explanation,
    points,
    orderIndex,
  } = req.body;

  // Check if question exists and get exam
  const existingQuestion = await prisma.question.findUnique({
    where: { id },
    include: {
      exam: true,
    },
  });

  if (!existingQuestion) {
    throw ApiError.notFound('Question not found');
  }

  // Check ownership
  if (
    existingQuestion.exam.createdById !== req.user!.id &&
    req.user!.role !== 'ADMIN'
  ) {
    throw ApiError.forbidden('You do not have permission to update this question');
  }

  const updateData: any = {};
  if (section !== undefined) updateData.section = section;
  if (questionType !== undefined) updateData.questionType = questionType;
  if (questionText !== undefined) updateData.questionText = questionText;
  if (mediaUrl !== undefined) updateData.mediaUrl = mediaUrl;
  if (mediaType !== undefined) updateData.mediaType = mediaType;
  if (options !== undefined) updateData.options = options;
  if (correctAnswer !== undefined) updateData.correctAnswer = correctAnswer;
  if (explanation !== undefined) updateData.explanation = explanation;
  if (points !== undefined) updateData.points = points;
  if (orderIndex !== undefined) updateData.orderIndex = orderIndex;

  const question = await prisma.question.update({
    where: { id },
    data: updateData,
  });

  sendSuccess(res, question, 'Question updated successfully');
});

/**
 * @desc    Delete question
 * @route   DELETE /api/v1/questions/:id
 * @access  Private/Teacher/Admin
 */
export const deleteQuestion = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const question = await prisma.question.findUnique({
    where: { id },
    include: {
      exam: true,
      _count: {
        select: { studentAnswers: true },
      },
    },
  });

  if (!question) {
    throw ApiError.notFound('Question not found');
  }

  // Check ownership
  if (question.exam.createdById !== req.user!.id && req.user!.role !== 'ADMIN') {
    throw ApiError.forbidden('You do not have permission to delete this question');
  }

  // Don't delete questions with student answers
  if (question._count.studentAnswers > 0) {
    throw ApiError.badRequest(
      'Cannot delete question with existing student answers'
    );
  }

  await prisma.question.delete({
    where: { id },
  });

  // Update exam's total questions count
  await prisma.exam.update({
    where: { id: question.examId },
    data: {
      totalQuestions: {
        decrement: 1,
      },
    },
  });

  sendSuccess(res, null, 'Question deleted successfully');
});

/**
 * @desc    Bulk create questions
 * @route   POST /api/v1/exams/:examId/questions/bulk
 * @access  Private/Teacher/Admin
 */
export const bulkCreateQuestions = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { examId } = req.params;
    const { questions } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      throw ApiError.badRequest('Questions array is required');
    }

    // Check if exam exists and user has access
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      throw ApiError.notFound('Exam not found');
    }

    if (exam.createdById !== req.user!.id && req.user!.role !== 'ADMIN') {
      throw ApiError.forbidden(
        'You do not have permission to add questions to this exam'
      );
    }

    // Get starting order index
    const lastQuestion = await prisma.question.findFirst({
      where: { examId },
      orderBy: { orderIndex: 'desc' },
    });
    let startOrderIndex = lastQuestion ? lastQuestion.orderIndex + 1 : 0;

    // Create questions
    const createdQuestions = await Promise.all(
      questions.map((q, index) =>
        prisma.question.create({
          data: {
            examId,
            section: q.section,
            questionType: q.questionType,
            questionText: q.questionText,
            mediaUrl: q.mediaUrl,
            mediaType: q.mediaType,
            options: q.options || null,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            points: q.points || 1,
            orderIndex: q.orderIndex !== undefined ? q.orderIndex : startOrderIndex + index,
          },
        })
      )
    );

    // Update exam's total questions count
    await prisma.exam.update({
      where: { id: examId },
      data: {
        totalQuestions: {
          increment: createdQuestions.length,
        },
      },
    });

    sendSuccess(res, createdQuestions, `${createdQuestions.length} questions created successfully`, 201);
  }
);

/**
 * @desc    Reorder questions
 * @route   PATCH /api/v1/exams/:examId/questions/reorder
 * @access  Private/Teacher/Admin
 */
export const reorderQuestions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { examId } = req.params;
  const { questionIds } = req.body; // Array of question IDs in new order

  if (!Array.isArray(questionIds)) {
    throw ApiError.badRequest('questionIds array is required');
  }

  // Check if exam exists and user has access
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
  });

  if (!exam) {
    throw ApiError.notFound('Exam not found');
  }

  if (exam.createdById !== req.user!.id && req.user!.role !== 'ADMIN') {
    throw ApiError.forbidden('You do not have permission to reorder questions');
  }

  // Update order indices
  await Promise.all(
    questionIds.map((questionId, index) =>
      prisma.question.update({
        where: { id: questionId },
        data: { orderIndex: index },
      })
    )
  );

  sendSuccess(res, null, 'Questions reordered successfully');
});
