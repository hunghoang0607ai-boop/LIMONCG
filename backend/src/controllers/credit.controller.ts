import { Response } from 'express';
import { AuthRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import { ApiError } from '../utils/ApiError';
import prisma from '../config/database';
import { CREDIT_PACKAGES, getCreditPackage, calculatePrice } from '../config/creditPackages';
import { createCheckoutSession } from '../services/payment.service';

/**
 * @desc    Get all credit packages
 * @route   GET /api/v1/credits/packages
 * @access  Public
 */
export const getCreditPackages = asyncHandler(async (_req, res: Response) => {
  sendSuccess(res, CREDIT_PACKAGES);
});

/**
 * @desc    Get user credit balance
 * @route   GET /api/v1/credits/balance
 * @access  Private
 */
export const getCreditBalance = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { credits: true },
  });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  sendSuccess(res, { credits: user.credits });
});

/**
 * @desc    Get user transaction history
 * @route   GET /api/v1/credits/transactions
 * @access  Private
 */
export const getTransactions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 10 } = req.query;

  const [transactions, total] = await Promise.all([
    prisma.creditTransaction.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    }),
    prisma.creditTransaction.count({
      where: { userId: req.user!.id },
    }),
  ]);

  sendSuccess(res, {
    data: transactions,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
});

/**
 * @desc    Create checkout session for credit purchase
 * @route   POST /api/v1/credits/purchase
 * @access  Private
 */
export const purchaseCredits = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { packageId } = req.body;

  if (!packageId) {
    throw ApiError.badRequest('Package ID is required');
  }

  const pkg = getCreditPackage(packageId);
  if (!pkg) {
    throw ApiError.badRequest('Invalid package ID');
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, email: true },
  });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Create Stripe checkout session
  const session = await createCheckoutSession(user.id, packageId, user.email);

  // Create pending payment order
  await prisma.paymentOrder.create({
    data: {
      userId: user.id,
      amountUSD: calculatePrice(packageId),
      creditsPurchased: pkg.credits,
      paymentMethod: 'STRIPE',
      paymentStatus: 'PENDING',
      externalPaymentId: session.sessionId,
      metadata: {
        packageId,
        packageName: pkg.name,
      },
    },
  });

  sendSuccess(res, {
    sessionId: session.sessionId,
    url: session.url,
    package: pkg,
  });
});

/**
 * @desc    Verify payment and add credits
 * @route   GET /api/v1/credits/verify/:sessionId
 * @access  Private
 */
export const verifyPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { sessionId } = req.params;

  // Find payment order
  const order = await prisma.paymentOrder.findFirst({
    where: {
      externalPaymentId: sessionId,
      userId: req.user!.id,
    },
  });

  if (!order) {
    throw ApiError.notFound('Payment order not found');
  }

  // If already completed, return success
  if (order.paymentStatus === 'COMPLETED') {
    sendSuccess(res, {
      status: 'completed',
      credits: order.creditsPurchased,
    });
    return;
  }

  // Check with Stripe (simplified for now)
  // In production, this should verify with Stripe API

  sendSuccess(res, {
    status: order.paymentStatus.toLowerCase(),
    credits: order.creditsPurchased,
  });
});

/**
 * @desc    Deduct credits for exam unlock
 * @route   POST /api/v1/credits/deduct
 * @access  Private
 */
export const deductCredits = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { amount, examId, description } = req.body;

  if (!amount || amount <= 0) {
    throw ApiError.badRequest('Invalid amount');
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { credits: true },
  });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (user.credits < amount) {
    throw ApiError.badRequest('Insufficient credits');
  }

  const newBalance = user.credits - amount;

  // Update user credits
  await prisma.user.update({
    where: { id: req.user!.id },
    data: { credits: newBalance },
  });

  // Create transaction record
  await prisma.creditTransaction.create({
    data: {
      userId: req.user!.id,
      amount: -amount,
      transactionType: 'EXAM_UNLOCK',
      referenceId: examId,
      description: description || `Unlocked exam (${amount} credits)`,
      balanceAfter: newBalance,
    },
  });

  sendSuccess(res, {
    credits: newBalance,
    deducted: amount,
  });
});

/**
 * @desc    Get all payment orders (Admin)
 * @route   GET /api/v1/credits/orders
 * @access  Private/Admin
 */
export const getAllOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 10, status } = req.query;

  const where: any = {};
  if (status) {
    where.paymentStatus = status;
  }

  const [orders, total] = await Promise.all([
    prisma.paymentOrder.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    }),
    prisma.paymentOrder.count({ where }),
  ]);

  sendSuccess(res, {
    data: orders,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
});

/**
 * @desc    Issue refund (Admin)
 * @route   POST /api/v1/credits/refund/:orderId
 * @access  Private/Admin
 */
export const issueRefund = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { orderId } = req.params;
  const { reason } = req.body;

  const order = await prisma.paymentOrder.findUnique({
    where: { id: orderId },
    include: { user: true },
  });

  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  if (order.paymentStatus === 'REFUNDED') {
    throw ApiError.badRequest('Order already refunded');
  }

  if (order.paymentStatus !== 'COMPLETED') {
    throw ApiError.badRequest('Can only refund completed orders');
  }

  // Update order status
  await prisma.paymentOrder.update({
    where: { id: orderId },
    data: { paymentStatus: 'REFUNDED' },
  });

  // Deduct credits from user
  const newBalance = order.user.credits - order.creditsPurchased;
  await prisma.user.update({
    where: { id: order.userId },
    data: { credits: Math.max(0, newBalance) },
  });

  // Create refund transaction
  await prisma.creditTransaction.create({
    data: {
      userId: order.userId,
      amount: -order.creditsPurchased,
      transactionType: 'REFUND',
      referenceId: orderId,
      description: reason || 'Payment refunded',
      balanceAfter: Math.max(0, newBalance),
    },
  });

  sendSuccess(res, { message: 'Refund issued successfully' });
});
