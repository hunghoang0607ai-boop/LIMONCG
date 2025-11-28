import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendError } from '../utils/response';
import { verifyWebhookSignature } from '../services/payment.service';
import prisma from '../config/database';
import logger from '../config/logger';
import Stripe from 'stripe';

/**
 * @desc    Handle Stripe webhook events
 * @route   POST /api/v1/webhooks/stripe
 * @access  Public (Stripe only)
 */
export const handleStripeWebhook = asyncHandler(async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;

  if (!signature) {
    return sendError(res, 'Missing stripe-signature header', 400);
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = verifyWebhookSignature(req.body, signature);
  } catch (error: any) {
    logger.error('Webhook signature verification failed:', error);
    return sendError(res, 'Webhook signature verification failed', 400);
  }

  logger.info('Stripe webhook event received:', {
    type: event.type,
    id: event.id,
  });

  // Handle different event types
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;

    case 'checkout.session.async_payment_succeeded':
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;

    case 'checkout.session.async_payment_failed':
      await handleCheckoutFailed(event.data.object as Stripe.Checkout.Session);
      break;

    case 'charge.refunded':
      await handleChargeRefunded(event.data.object as Stripe.Charge);
      break;

    default:
      logger.info('Unhandled webhook event type:', event.type);
  }

  sendSuccess(res, { received: true });
});

/**
 * Handle successful checkout completion
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { client_reference_id, id: sessionId, metadata } = session;

  if (!client_reference_id || !metadata) {
    logger.error('Missing client_reference_id or metadata in checkout session');
    return;
  }

  const userId = client_reference_id;
  const credits = parseInt(metadata.credits);
  const packageId = metadata.packageId;

  try {
    // Find payment order
    const order = await prisma.paymentOrder.findFirst({
      where: {
        externalPaymentId: sessionId,
        userId,
      },
    });

    if (!order) {
      logger.error('Payment order not found:', { sessionId, userId });
      return;
    }

    // Check if already processed
    if (order.paymentStatus === 'COMPLETED') {
      logger.info('Payment already processed:', sessionId);
      return;
    }

    // Get user's current credits
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    if (!user) {
      logger.error('User not found:', userId);
      return;
    }

    const newBalance = user.credits + credits;

    // Start transaction
    await prisma.$transaction([
      // Update payment order
      prisma.paymentOrder.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'COMPLETED',
          paidAt: new Date(),
        },
      }),

      // Add credits to user
      prisma.user.update({
        where: { id: userId },
        data: { credits: newBalance },
      }),

      // Create transaction record
      prisma.creditTransaction.create({
        data: {
          userId,
          amount: credits,
          transactionType: 'PURCHASE',
          referenceId: order.id,
          description: `Purchased ${credits} credits (${packageId} package)`,
          balanceAfter: newBalance,
        },
      }),
    ]);

    logger.info('Credits added successfully:', {
      userId,
      credits,
      newBalance,
      orderId: order.id,
    });
  } catch (error) {
    logger.error('Error processing checkout completion:', error);
    throw error;
  }
}

/**
 * Handle failed checkout
 */
async function handleCheckoutFailed(session: Stripe.Checkout.Session) {
  const { id: sessionId } = session;

  try {
    // Update payment order status
    await prisma.paymentOrder.updateMany({
      where: {
        externalPaymentId: sessionId,
        paymentStatus: 'PENDING',
      },
      data: {
        paymentStatus: 'FAILED',
      },
    });

    logger.info('Payment marked as failed:', sessionId);
  } catch (error) {
    logger.error('Error handling checkout failure:', error);
  }
}

/**
 * Handle charge refund
 */
async function handleChargeRefunded(charge: Stripe.Charge) {
  const { payment_intent } = charge;

  if (!payment_intent) {
    logger.error('Missing payment_intent in charge refund event');
    return;
  }

  try {
    // Find order by payment intent (you may need to store this)
    // For now, we'll just log it
    logger.info('Charge refunded:', {
      paymentIntent: payment_intent,
      amount: charge.amount_refunded,
    });

    // In production, you would:
    // 1. Find the order by payment intent
    // 2. Update order status to REFUNDED
    // 3. Deduct credits from user
    // 4. Create refund transaction record
  } catch (error) {
    logger.error('Error handling charge refund:', error);
  }
}
