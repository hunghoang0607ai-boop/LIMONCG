import Stripe from 'stripe';
import env from '../config/env';
import logger from '../config/logger';
import { getCreditPackage, calculatePrice } from '../config/creditPackages';

// Initialize Stripe (only if key is set)
const stripe = env.STRIPE_SECRET_KEY
  ? new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
    })
  : null;

/**
 * Create Stripe checkout session for credit purchase
 */
export const createCheckoutSession = async (
  userId: string,
  packageId: string,
  userEmail: string
): Promise<{ sessionId: string; url: string }> => {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  const pkg = getCreditPackage(packageId);
  if (!pkg) {
    throw new Error('Invalid package ID');
  }

  const price = calculatePrice(packageId);

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: pkg.name,
            description: `${pkg.credits} credits for LIMONCG platform`,
            images: ['https://limoncg.com/credit-icon.png'], // Replace with actual image
          },
          unit_amount: Math.round(price * 100), // Convert to cents
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${env.FRONTEND_URL}/credits/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.FRONTEND_URL}/credits/purchase`,
    customer_email: userEmail,
    client_reference_id: userId,
    metadata: {
      userId,
      packageId,
      credits: pkg.credits.toString(),
    },
  });

  if (!session.id || !session.url) {
    throw new Error('Failed to create checkout session');
  }

  logger.info('Stripe checkout session created:', {
    sessionId: session.id,
    userId,
    packageId,
  });

  return {
    sessionId: session.id,
    url: session.url,
  };
};

/**
 * Verify Stripe webhook signature
 */
export const verifyWebhookSignature = (
  payload: string | Buffer,
  signature: string
): Stripe.Event => {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  if (!env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('Stripe webhook secret is not configured');
  }

  try {
    return stripe.webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (error: any) {
    logger.error('Webhook signature verification failed:', error);
    throw new Error('Invalid webhook signature');
  }
};

/**
 * Retrieve checkout session
 */
export const getCheckoutSession = async (sessionId: string): Promise<Stripe.Checkout.Session> => {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  return await stripe.checkout.sessions.retrieve(sessionId);
};

/**
 * Create refund
 */
export const createRefund = async (
  paymentIntentId: string,
  amount?: number
): Promise<Stripe.Refund> => {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  const refundData: Stripe.RefundCreateParams = {
    payment_intent: paymentIntentId,
  };

  if (amount) {
    refundData.amount = Math.round(amount * 100); // Convert to cents
  }

  logger.info('Creating refund:', { paymentIntentId, amount });

  return await stripe.refunds.create(refundData);
};

/**
 * Test Stripe connection
 */
export const testStripeConnection = async (): Promise<boolean> => {
  if (!stripe) {
    return false;
  }

  try {
    await stripe.balance.retrieve();
    return true;
  } catch (error) {
    logger.error('Stripe connection test failed:', error);
    return false;
  }
};
