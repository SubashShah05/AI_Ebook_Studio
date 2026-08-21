import express from 'express';
import { getBillingStatus, checkout, cancelSubscription, stripeWebhook } from '../controllers/billingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Webhook endpoint must bypass raw/protect middleware if needed for payment signatures
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// Protected subscription routes
router.use(protect);
router.get('/status', getBillingStatus);
router.post('/checkout', checkout);
router.post('/cancel', cancelSubscription);

export default router;
