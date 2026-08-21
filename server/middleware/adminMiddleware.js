import SecurityEvent from '../models/SecurityEvent.js';

/**
 * requireAdmin - Middleware that enforces admin role.
 * Must run AFTER protect (req.user is set).
 */
export const requireAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  if (req.user.role !== 'admin') {
    // Log the attempt
    try {
      await SecurityEvent.create({
        type: 'admin_access_denied',
        userId: req.user._id,
        email: req.user.email,
        ip: req.ip || req.headers['x-forwarded-for'] || 'unknown',
        severity: 'medium',
        metadata: { path: req.originalUrl, method: req.method }
      });
    } catch (err) {
      // Non-blocking
    }
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }

  next();
};
