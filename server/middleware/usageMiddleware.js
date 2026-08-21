import Activity from '../models/Activity.js';
import User from '../models/User.js';
import { PLANS } from '../config/plans.js';

// Check if user has reached their AI limit for the current calendar month
export const checkAILimit = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    const plan = user?.plan || 'free';
    const limit = PLANS[plan]?.maxAiGenerations || 20;

    // Calculate current month boundaries
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Count AI usage events in this calendar month
    const aiUsageCount = await Activity.countDocuments({
      userId,
      type: 'ai_usage',
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    });

    if (aiUsageCount >= limit) {
      return res.status(403).json({
        message: 'AI usage limit reached. Upgrade Plan',
        limit,
        used: aiUsageCount
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Error checking usage limits: ' + error.message });
  }
};

// Log AI usage event helper
export const logAIUsage = async (userId, action, bookId = null, chapterId = null) => {
  try {
    await Activity.create({
      userId,
      type: 'ai_usage',
      bookId,
      chapterId,
      metadata: { action }
    });
  } catch (err) {
    console.error('Failed to log AI activity:', err);
  }
};
