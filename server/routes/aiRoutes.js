import express from 'express';
import { generateOutlineController, generateChapterContentController, processAIAssistController } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkAILimit } from '../middleware/usageMiddleware.js';
import { checkBookAccess } from '../middleware/permissionMiddleware.js';

const router = express.Router();
router.use(protect);

// Outline generation - no specific book context required (book creation flow)
router.post('/outline', checkAILimit, generateOutlineController);

// Chapter AI generation - requires at least editor access on the book (chapterId in body)
router.post('/chapter-write', checkAILimit, checkBookAccess('editor'), generateChapterContentController);

// AI Assist - requires at least editor access on the book (bookId in body)
router.post('/assist', checkAILimit, checkBookAccess('editor'), processAIAssistController);

export default router;