import { Router } from 'express';
import {
  getCreditPackages,
  getCreditBalance,
  getTransactions,
  purchaseCredits,
  verifyPayment,
  deductCredits,
  getAllOrders,
  issueRefund,
} from '../controllers/credit.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

// Public routes
router.get('/packages', getCreditPackages);

// Protected routes
router.use(authenticate);

router.get('/balance', getCreditBalance);
router.get('/transactions', getTransactions);
router.post('/purchase', purchaseCredits);
router.get('/verify/:sessionId', verifyPayment);
router.post('/deduct', deductCredits);

// Admin routes
router.get('/orders', authorize(UserRole.ADMIN), getAllOrders);
router.post('/refund/:orderId', authorize(UserRole.ADMIN), issueRefund);

export default router;
