import express from 'express';
import { generateOutlineController, generateChapterContentController } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.post('/outline', generateOutlineController);
router.post('/chapter-write', generateChapterContentController);

export default router;