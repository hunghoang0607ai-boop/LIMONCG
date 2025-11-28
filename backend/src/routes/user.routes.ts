import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
  getUserStatistics,
  getAllUsers,
  getUserById,
  updateUserRole,
  addCredits,
  deleteUser,
} from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate, schemas } from '../middleware/validate';
import { UserRole } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Student routes
router.get('/me', getProfile);
router.put('/me', validate(schemas.updateProfile), updateProfile);
router.put('/me/password', validate(schemas.changePassword), changePassword);
router.get('/me/statistics', getUserStatistics);

// Admin routes
router.get('/', authorize(UserRole.ADMIN), getAllUsers);
router.get('/:id', authorize(UserRole.ADMIN), getUserById);
router.put('/:id/role', authorize(UserRole.ADMIN), updateUserRole);
router.post('/:id/credits', authorize(UserRole.ADMIN), addCredits);
router.delete('/:id', authorize(UserRole.ADMIN), deleteUser);

export default router;
