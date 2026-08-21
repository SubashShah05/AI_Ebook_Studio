import Book from '../models/Book.js';
import Chapter from '../models/Chapter.js';
import Activity from '../models/Activity.js';
import User from '../models/User.js';
import { PLANS } from '../config/plans.js';

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch total books
    const totalBooks = await Book.countDocuments({ owner: userId });

    // Fetch user's books to get IDs
    const books = await Book.find({ owner: userId }).select('_id');
    const bookIds = books.map(b => b._id);

    // Fetch total chapters for user's books
    const chapters = await Chapter.find({ bookId: { $in: bookIds } }).select('markdownContent');
    const totalChapters = chapters.length;

    // Approximate total words generated
    let totalWords = 0;
    chapters.forEach(ch => {
      if (ch.markdownContent) {
        totalWords += ch.markdownContent.trim().split(/\s+/).length;
      }
    });

    // Fetch recent books (limit 4)
    const recentBooks = await Book.find({ owner: userId })
      .sort({ updatedAt: -1 })
      .limit(4);

    // Fetch AI limits and used
    const user = await User.findById(userId);
    const plan = user?.plan || 'free';
    const aiLimit = PLANS[plan]?.maxAiGenerations || 20;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const aiUsed = await Activity.countDocuments({
      userId,
      type: 'ai_usage',
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    });

    // Fetch recent activities (limit 5)
    const recentActivities = await Activity.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalBooks,
      totalChapters,
      totalWords,
      recentBooks,
      plan,
      aiLimit,
      aiUsed,
      recentActivities
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
