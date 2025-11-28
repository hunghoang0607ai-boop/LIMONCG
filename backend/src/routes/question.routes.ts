import { Router } from 'express';
import {
  getQuestionById,
  updateQuestion,
  deleteQuestion,
} from '../controllers/question.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

// All routes require authentication and Teacher/Admin role
router.use(authenticate);
router.use(authorize(UserRole.TEACHER, UserRole.ADMIN));

router.get('/:id', getQuestionById);
router.put('/:id', updateQuestion);
router.delete('/:id', deleteQuestion);

export default router;
