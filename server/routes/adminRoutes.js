import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/adminMiddleware.js';
import {
  getPlatformStats,
  getUsers, getUserById, suspendUser, restoreUser, changeUserRole,
  getAdminBooks, archiveBook,
  getSubscriptions,
  getAdminAIUsage,
  getPlatformActivity,
  getSecurityEvents,
  getAuditLog,
  getSystemHealth,
} from '../controllers/adminController.js';
import {
  listTemplates, createTemplate, updateTemplate, archiveTemplate, restoreTemplate
} from '../controllers/adminTemplateController.js';

const router = express.Router();

// All admin routes require authentication + admin role
router.use(protect, requireAdmin);

// ── Dashboard ────────────────────────────────────────────────────────
router.get('/dashboard', getPlatformStats);

// ── Users ────────────────────────────────────────────────────────────
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/suspend', suspendUser);
router.put('/users/:id/restore', restoreUser);
router.put('/users/:id/role', changeUserRole);

// ── Books ────────────────────────────────────────────────────────────
router.get('/books', getAdminBooks);
router.put('/books/:id/archive', archiveBook);

// ── Subscriptions ────────────────────────────────────────────────────
router.get('/subscriptions', getSubscriptions);

// ── Templates ────────────────────────────────────────────────────────
router.get('/templates', listTemplates);
router.post('/templates', createTemplate);
router.put('/templates/:id', updateTemplate);
router.put('/templates/:id/archive', archiveTemplate);
router.put('/templates/:id/restore', restoreTemplate);

// ── AI Usage ────────────────────────────────────────────────────────
router.get('/ai-usage', getAdminAIUsage);

// ── Activity ────────────────────────────────────────────────────────
router.get('/activity', getPlatformActivity);

// ── Security Events ──────────────────────────────────────────────────
router.get('/security', getSecurityEvents);

// ── Audit Log ────────────────────────────────────────────────────────
router.get('/audit', getAuditLog);

// ── System Health ────────────────────────────────────────────────────
router.get('/system-health', getSystemHealth);

export default router;
