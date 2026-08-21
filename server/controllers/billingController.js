import User from '../models/User.js';
import Book from '../models/Book.js';
import Chapter from '../models/Chapter.js';
import Activity from '../models/Activity.js';
import { PLANS } from '../config/plans.js';

export const getBillingStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    // Current billing/usage period (this calendar month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Calculate actual usage for limits comparison
    const totalBooks = await Book.countDocuments({ owner: userId, isArchived: false });
    
    const aiUsed = await Activity.countDocuments({
      userId,
      type: 'ai_usage',
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const exportsUsed = await Activity.countDocuments({
      userId,
      type: 'export_created',
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const plan = user?.plan || 'free';
    const planLimits = PLANS[plan] || PLANS.free;

    res.json({
      plan,
      subscriptionStatus: user?.subscriptionStatus || 'none',
      subscriptionPeriodEnd: user?.subscriptionPeriodEnd,
      usage: {
        books: { used: totalBooks, limit: planLimits.maxBooks },
        aiGenerations: { used: aiUsed, limit: planLimits.maxAiGenerations },
        exports: { used: exportsUsed, limit: planLimits.maxExports }
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Safe mockup/development checkout flow
export const checkout = async (req, res) => {
  const { plan } = req.body;
  if (!['pro', 'business', 'free'].includes(plan)) {
    return res.status(400).json({ message: 'Invalid plan option selected' });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Simulate verified purchase transition
    user.plan = plan;
    user.subscriptionStatus = plan === 'free' ? 'none' : 'active';
    user.subscriptionId = plan === 'free' ? '' : 'sub_mock_' + Date.now();
    user.subscriptionPeriodEnd = plan === 'free' ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 Days renewal
    await user.save();

    res.json({
      message: `Successfully upgraded to ${plan.toUpperCase()} (Development Mode)`,
      user: {
        plan: user.plan,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionPeriodEnd: user.subscriptionPeriodEnd
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel subscription simulation
export const cancelSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.subscriptionStatus = 'canceled'; // Canceled retains access until subscriptionPeriodEnd
    await user.save();

    res.json({
      message: 'Subscription canceled at period end.',
      subscriptionStatus: user.subscriptionStatus
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Stripe Webhook placeholder template
export const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  // Note: Webhook signature checks should verify payloads from payment providers
  // We log and return 200/400 safely depending on webhook secret presence
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!endpointSecret) {
    console.warn('STRIPE_WEBHOOK_SECRET environment variable is missing. Webhook signature skipped.');
    return res.json({ received: true, note: 'Webhook skipped signature verification in dev mode.' });
  }

  try {
    // Conceptual Stripe webhook event signature verification would happen here:
    // const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    res.json({ received: true });
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};
