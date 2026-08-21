import express from 'express';
import { exportDocx, exportMarkdown, getExportData, logExportActivity } from '../controllers/exportController.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkBookAccess } from '../middleware/permissionMiddleware.js';

const router = express.Router();
router.use(protect);

// GET export metadata - viewer+ can access
router.get('/:bookId', checkBookAccess('viewer'), getExportData);

// Log exports (PDF client-side) - viewer+ can log their own export
router.post('/:bookId/log', checkBookAccess('viewer'), logExportActivity);

// Server-side exports - viewer+ can download
router.get('/:bookId/docx', checkBookAccess('viewer'), exportDocx);
router.get('/:bookId/markdown', checkBookAccess('viewer'), exportMarkdown);

export default router;
