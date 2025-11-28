import { Router } from 'express';
import { handleStripeWebhook } from '../controllers/webhook.controller';
import express from 'express';

const router = Router();

// Stripe webhook endpoint
// IMPORTANT: This route must use raw body, not JSON parsed body
router.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook
);

export default router;
