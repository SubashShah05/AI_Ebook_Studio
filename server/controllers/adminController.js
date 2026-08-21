import User from '../models/User.js';
import Book from '../models/Book.js';
import Chapter from '../models/Chapter.js';
import Activity from '../models/Activity.js';
import AuditLog from '../models/AuditLog.js';
import SecurityEvent from '../models/SecurityEvent.js';
import mongoose from 'mongoose';

// ─── Helper ───────────────────────────────────────────────────────────────────
const logAudit = async (adminId, action, targetType, targetId, metadata = {}, ip = '') => {
  try {
    await AuditLog.create({ adminId, action, targetType, targetId, metadata, ip });
  } catch (err) {
    console.error('Audit log failed:', err.message);
  }
};

const safeId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return id;
};

// ─── PLATFORM DASHBOARD ───────────────────────────────────────────────────────
export const getPlatformStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      adminUsers,
      totalBooks,
      totalChapters,
      totalAIGenerations,
      thisMonthAI,
      totalExports,
      freeUsers,
      proUsers,
      businessUsers,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'active' }),
      User.countDocuments({ status: 'suspended' }),
      User.countDocuments({ role: 'admin' }),
      Book.countDocuments({ isArchived: false }),
      Chapter.countDocuments(),
      Activity.countDocuments({ type: 'ai_usage' }),
      Activity.countDocuments({ type: 'ai_usage', createdAt: { $gte: startOfMonth } }),
      Activity.countDocuments({ type: 'export_created' }),
      User.countDocuments({ plan: 'free' }),
      User.countDocuments({ plan: 'pro' }),
      User.countDocuments({ plan: 'business' }),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email plan status createdAt'),
    ]);

    // Growth: new users in last 30 days
    const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    // Active subscriptions
    const activeSubscriptions = await User.countDocuments({
      subscriptionStatus: 'active',
      plan: { $ne: 'free' }
    });

    // AI usage by day (last 14 days)
    const aiByDay = await Activity.aggregate([
      {
        $match: {
          type: 'ai_usage',
          createdAt: { $gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      users: { total: totalUsers, active: activeUsers, suspended: suspendedUsers, admins: adminUsers, newThisMonth: newUsersThisMonth },
      plans: { free: freeUsers, pro: proUsers, business: businessUsers, activeSubscriptions },
      content: { books: totalBooks, chapters: totalChapters },
      ai: { total: totalAIGenerations, thisMonth: thisMonthAI, byDay: aiByDay },
      exports: { total: totalExports },
      recentUsers,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load platform stats.' });
  }
};

// ─── USER MANAGEMENT ─────────────────────────────────────────────────────────
export const getUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    // Whitelist allowed filter/sort fields to prevent injection
    const allowedStatuses = ['active', 'suspended'];
    const allowedPlans = ['free', 'pro', 'business'];
    const allowedRoles = ['user', 'admin'];
    const allowedSortFields = ['createdAt', 'name', 'email', 'plan'];

    const filter = {};

    if (req.query.status && allowedStatuses.includes(req.query.status)) {
      filter.status = req.query.status;
    }
    if (req.query.plan && allowedPlans.includes(req.query.plan)) {
      filter.plan = req.query.plan;
    }
    if (req.query.role && allowedRoles.includes(req.query.role)) {
      filter.role = req.query.role;
    }
    if (req.query.search) {
      const escaped = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { email: { $regex: escaped, $options: 'i' } }
      ];
    }

    const sortField = allowedSortFields.includes(req.query.sort) ? req.query.sort : 'createdAt';
    const sortDir = req.query.dir === 'asc' ? 1 : -1;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password -loginAttempts -lockedUntil')
        .sort({ [sortField]: sortDir })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter)
    ]);

    // Attach book count per user
    const userIds = users.map(u => u._id);
    const bookCounts = await Book.aggregate([
      { $match: { owner: { $in: userIds } } },
      { $group: { _id: '$owner', count: { $sum: 1 } } }
    ]);
    const bookCountMap = {};
    bookCounts.forEach(b => { bookCountMap[b._id.toString()] = b.count; });

    const enriched = users.map(u => ({
      ...u.toObject(),
      bookCount: bookCountMap[u._id.toString()] || 0
    }));

    res.json({
      users: enriched,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load users.' });
  }
};

export const getUserById = async (req, res) => {
  try {
    const id = safeId(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid user ID' });

    const user = await User.findById(id).select('-password -loginAttempts -lockedUntil');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [bookCount, aiUsed, totalExports, recentActivity] = await Promise.all([
      Book.countDocuments({ owner: id }),
      Activity.countDocuments({ userId: id, type: 'ai_usage', createdAt: { $gte: startOfMonth } }),
      Activity.countDocuments({ userId: id, type: 'export_created' }),
      Activity.find({ userId: id })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('type metadata createdAt')
    ]);

    res.json({
      ...user.toObject(),
      stats: { bookCount, aiUsed, totalExports },
      recentActivity
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load user.' });
  }
};

export const suspendUser = async (req, res) => {
  try {
    const id = safeId(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid user ID' });

    if (id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot suspend your own account.' });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ message: 'Cannot suspend another admin.' });
    if (user.status === 'suspended') return res.status(400).json({ message: 'User is already suspended.' });

    user.status = 'suspended';
    await user.save();

    await logAudit(req.user._id, 'suspend_user', 'User', id,
      { targetEmail: user.email, targetName: user.name },
      req.ip
    );

    // Log security event
    await SecurityEvent.create({
      type: 'account_suspended',
      userId: id,
      email: user.email,
      ip: req.ip || '',
      severity: 'high',
      metadata: { suspendedBy: req.user._id, adminEmail: req.user.email }
    });

    res.json({ message: `Account for ${user.email} has been suspended.` });
  } catch (error) {
    res.status(500).json({ message: 'Failed to suspend user.' });
  }
};

export const restoreUser = async (req, res) => {
  try {
    const id = safeId(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid user ID' });

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.status === 'active') return res.status(400).json({ message: 'User is already active.' });

    user.status = 'active';
    user.loginAttempts = 0;
    user.lockedUntil = null;
    await user.save();

    await logAudit(req.user._id, 'restore_user', 'User', id,
      { targetEmail: user.email, targetName: user.name },
      req.ip
    );

    await SecurityEvent.create({
      type: 'account_restored',
      userId: id,
      email: user.email,
      ip: req.ip || '',
      severity: 'low',
      metadata: { restoredBy: req.user._id }
    });

    res.json({ message: `Account for ${user.email} has been restored.` });
  } catch (error) {
    res.status(500).json({ message: 'Failed to restore user.' });
  }
};

export const changeUserRole = async (req, res) => {
  try {
    const id = safeId(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid user ID' });

    const { role } = req.body;
    const allowedRoles = ['user', 'admin'];
    if (!role || !allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be "user" or "admin".' });
    }

    if (id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot change your own role.' });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const oldRole = user.role;
    if (oldRole === role) return res.status(400).json({ message: `User is already ${role}.` });

    user.role = role;
    await user.save();

    await logAudit(req.user._id, 'change_role', 'User', id,
      { targetEmail: user.email, oldRole, newRole: role },
      req.ip
    );

    await SecurityEvent.create({
      type: 'role_change',
      userId: id,
      email: user.email,
      ip: req.ip || '',
      severity: 'high',
      metadata: { changedBy: req.user._id, oldRole, newRole: role }
    });

    res.json({ message: `Role changed from ${oldRole} to ${role} for ${user.email}.` });
  } catch (error) {
    res.status(500).json({ message: 'Failed to change role.' });
  }
};

// ─── BOOK MANAGEMENT ─────────────────────────────────────────────────────────
export const getAdminBooks = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const allowedStatuses = ['draft', 'generating', 'ready', 'failed', 'archived'];
    const filter = {};

    if (req.query.status && allowedStatuses.includes(req.query.status)) {
      filter.status = req.query.status;
    }
    if (req.query.search) {
      const escaped = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.title = { $regex: escaped, $options: 'i' };
    }

    const [books, total] = await Promise.all([
      Book.find(filter)
        .populate('owner', 'name email plan')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-markdownContent'),
      Book.countDocuments(filter)
    ]);

    // Attach chapter counts
    const bookIds = books.map(b => b._id);
    const chapterCounts = await Chapter.aggregate([
      { $match: { bookId: { $in: bookIds } } },
      { $group: { _id: '$bookId', count: { $sum: 1 }, words: { $sum: '$wordCount' } } }
    ]);
    const chapterMap = {};
    chapterCounts.forEach(c => { chapterMap[c._id.toString()] = { count: c.count, words: c.words }; });

    const enriched = books.map(b => ({
      ...b.toObject(),
      chapterCount: chapterMap[b._id.toString()]?.count || 0,
      wordCount: chapterMap[b._id.toString()]?.words || 0,
    }));

    res.json({ books: enriched, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load books.' });
  }
};

export const archiveBook = async (req, res) => {
  try {
    const id = safeId(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid book ID' });

    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    book.isArchived = true;
    book.status = 'archived';
    await book.save();

    await logAudit(req.user._id, 'archive_book', 'Book', id,
      { bookTitle: book.title, ownerId: book.owner },
      req.ip
    );

    res.json({ message: `Book "${book.title}" archived.` });
  } catch (error) {
    res.status(500).json({ message: 'Failed to archive book.' });
  }
};

// ─── SUBSCRIPTIONS ────────────────────────────────────────────────────────────
export const getSubscriptions = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const allowedStatuses = ['active', 'trialing', 'past_due', 'canceled', 'none'];
    const filter = {};
    if (req.query.status && allowedStatuses.includes(req.query.status)) {
      filter.subscriptionStatus = req.query.status;
    }
    if (req.query.plan && ['free','pro','business'].includes(req.query.plan)) {
      filter.plan = req.query.plan;
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('name email plan subscriptionStatus subscriptionId subscriptionPeriodEnd createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter)
    ]);

    res.json({ subscriptions: users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load subscriptions.' });
  }
};

// ─── AI USAGE ────────────────────────────────────────────────────────────────
export const getAdminAIUsage = async (req, res) => {
  try {
    const days = Math.min(90, Math.max(1, parseInt(req.query.days) || 30));
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [
      totalGenerations,
      thisMonthGenerations,
      byDay,
      byAction,
      topUsers,
      failures,
    ] = await Promise.all([
      Activity.countDocuments({ type: 'ai_usage' }),
      Activity.countDocuments({ type: 'ai_usage', createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } }),
      Activity.aggregate([
        { $match: { type: 'ai_usage', createdAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Activity.aggregate([
        { $match: { type: 'ai_usage', createdAt: { $gte: since } } },
        { $group: { _id: '$metadata.action', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Activity.aggregate([
        { $match: { type: 'ai_usage', createdAt: { $gte: since } } },
        { $group: { _id: '$userId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $unwind: { path: '$user', preserveNullAndEmpty: true } },
        { $project: { _id: 1, count: 1, 'user.name': 1, 'user.email': 1, 'user.plan': 1 } }
      ]),
      Activity.countDocuments({ type: 'ai_usage', 'metadata.action': 'failed' }),
    ]);

    res.json({ totalGenerations, thisMonthGenerations, byDay, byAction, topUsers, failures, days });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load AI usage.' });
  }
};

// ─── ACTIVITY ────────────────────────────────────────────────────────────────
export const getPlatformActivity = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 30);
    const skip = (page - 1) * limit;

    const allowedTypes = ['ai_usage', 'writing_activity', 'export_created'];
    const filter = {};
    if (req.query.type && allowedTypes.includes(req.query.type)) {
      filter.type = req.query.type;
    }

    const [activities, total] = await Promise.all([
      Activity.find(filter)
        .populate('userId', 'name email plan')
        .populate('bookId', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-__v'),
      Activity.countDocuments(filter)
    ]);

    res.json({ activities, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load activity.' });
  }
};

// ─── SECURITY EVENTS ─────────────────────────────────────────────────────────
export const getSecurityEvents = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 30);
    const skip = (page - 1) * limit;

    const allowedTypes = [
      'failed_login', 'account_locked', 'account_unlocked', 'suspicious_auth',
      'role_change', 'account_suspended', 'account_restored', 'invalid_token',
      'admin_access_denied', 'rate_limit_exceeded'
    ];
    const allowedSeverities = ['low', 'medium', 'high', 'critical'];

    const filter = {};
    if (req.query.type && allowedTypes.includes(req.query.type)) {
      filter.type = req.query.type;
    }
    if (req.query.severity && allowedSeverities.includes(req.query.severity)) {
      filter.severity = req.query.severity;
    }

    const [events, total] = await Promise.all([
      SecurityEvent.find(filter)
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      SecurityEvent.countDocuments(filter)
    ]);

    res.json({ events, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load security events.' });
  }
};

// ─── AUDIT LOG ───────────────────────────────────────────────────────────────
export const getAuditLog = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 30);
    const skip = (page - 1) * limit;

    const allowedActions = [
      'suspend_user', 'restore_user', 'change_role', 'archive_book',
      'create_template', 'update_template', 'archive_template'
    ];
    const allowedTargetTypes = ['User', 'Book', 'Template'];

    const filter = {};
    if (req.query.action && allowedActions.includes(req.query.action)) {
      filter.action = req.query.action;
    }
    if (req.query.targetType && allowedTargetTypes.includes(req.query.targetType)) {
      filter.targetType = req.query.targetType;
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('adminId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      AuditLog.countDocuments(filter)
    ]);

    res.json({ logs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load audit log.' });
  }
};

// ─── SYSTEM HEALTH ───────────────────────────────────────────────────────────
export const getSystemHealth = async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected';

    // Simple DB ping
    let dbPing = 'ok';
    try {
      await mongoose.connection.db.admin().ping();
    } catch {
      dbPing = 'error';
    }

    const geminiConfigured = !!process.env.GEMINI_API_KEY;
    const stripeConfigured = !!process.env.STRIPE_SECRET_KEY;

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '14.0.0',
      services: {
        database: { status: dbStatus, ping: dbPing },
        ai: { status: geminiConfigured ? 'configured' : 'not_configured', provider: 'Google Gemini' },
        billing: { status: stripeConfigured ? 'configured' : 'mock_mode', provider: 'Stripe' },
      },
      // NOTE: Never expose actual keys, credentials, or connection strings
    });
  } catch (error) {
    res.status(500).json({ message: 'Health check failed.' });
  }
};
