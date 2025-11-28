import { Router } from 'express';
import {
  getAllExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
  togglePublish,
  getExamStatistics,
} from '../controllers/exam.controller';
import {
  getQuestionsByExam,
  createQuestion,
  bulkCreateQuestions,
  reorderQuestions,
} from '../controllers/question.controller';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

// Public routes (with optional auth for filtering)
router.get('/', optionalAuth, getAllExams);
router.get('/:id', optionalAuth, getExamById);

// Protected routes - Teacher/Admin
router.post('/', authenticate, authorize(UserRole.TEACHER, UserRole.ADMIN), createExam);
router.put('/:id', authenticate, authorize(UserRole.TEACHER, UserRole.ADMIN), updateExam);
router.delete('/:id', authenticate, authorize(UserRole.ADMIN), deleteExam);
router.patch(
  '/:id/publish',
  authenticate,
  authorize(UserRole.TEACHER, UserRole.ADMIN),
  togglePublish
);
router.get(
  '/:id/statistics',
  authenticate,
  authorize(UserRole.TEACHER, UserRole.ADMIN),
  getExamStatistics
);

// Question routes
router.get('/:examId/questions', authenticate, getQuestionsByExam);
router.post(
  '/:examId/questions',
  authenticate,
  authorize(UserRole.TEACHER, UserRole.ADMIN),
  createQuestion
);
router.post(
  '/:examId/questions/bulk',
  authenticate,
  authorize(UserRole.TEACHER, UserRole.ADMIN),
  bulkCreateQuestions
);
router.patch(
  '/:examId/questions/reorder',
  authenticate,
  authorize(UserRole.TEACHER, UserRole.ADMIN),
  reorderQuestions
);

export default router;
