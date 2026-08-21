import Book from '../models/Book.js';
import Chapter from '../models/Chapter.js';
import Activity from '../models/Activity.js';
import User from '../models/User.js';
import { PLANS } from '../config/plans.js';

export const getOverviewAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    // Overview stats
    const totalBooks = await Book.countDocuments({ owner: userId, isArchived: false });
    const completedBooks = await Book.countDocuments({ owner: userId, isArchived: false, status: 'ready' });
    
    // Find all book IDs owned by the user
    const books = await Book.find({ owner: userId });
    const bookIds = books.map(b => b._id);
    
    const totalChapters = await Chapter.countDocuments({
      bookId: { $in: bookIds }
    });
    
    // Total words
    const wordStats = await Chapter.aggregate([
      { $match: { bookId: { $in: bookIds } } },
      { $group: { _id: null, totalWords: { $sum: '$wordCount' }, avgWords: { $avg: '$wordCount' } } }
    ]);
    const totalWords = wordStats[0]?.totalWords || 0;
    const avgWordsPerChapter = Math.round(wordStats[0]?.avgWords || 0);

    // AI usage in current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    const user = await User.findById(userId);
    const plan = user?.plan || 'free';
    const aiLimit = PLANS[plan]?.maxAiGenerations || 20;

    const aiUsed = await Activity.countDocuments({
      userId,
      type: 'ai_usage',
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    });

    // Exports count
    const totalExports = await Activity.countDocuments({
      userId,
      type: 'export_created'
    });

    // Simple book detail analytics
    const bookAnalyticsList = await Promise.all(books.map(async (bk) => {
      const chs = await Chapter.find({ bookId: bk._id });
      const completed = chs.filter(c => c.status === 'completed').length;
      const totalWordsBk = chs.reduce((sum, c) => sum + (c.wordCount || 0), 0);
      const estReadTime = Math.ceil(totalWordsBk / 200);
      return {
        _id: bk._id,
        title: bk.title,
        status: bk.status,
        genre: bk.genre,
        chapterCount: chs.length,
        completedChapters: completed,
        totalWords: totalWordsBk,
        readingTime: estReadTime,
        updatedAt: bk.updatedAt
      };
    }));

    res.json({
      totalBooks,
      completedBooks,
      totalChapters,
      totalWords,
      avgWordsPerChapter,
      totalExports,
      plan,
      aiLimit,
      aiUsed,
      books: bookAnalyticsList
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWritingAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const days = parseInt(req.query.days) || 7;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const writingData = await Activity.aggregate([
      {
        $match: {
          userId,
          type: 'writing_activity',
          createdAt: { $gte: cutoffDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          words: { $sum: '$metadata.wordCount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(writingData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getActivityFeed = async (req, res) => {
  try {
    const userId = req.user._id;
    const activities = await Activity.find({ userId })
      .populate('bookId', 'title')
      .populate('chapterId', 'title')
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
