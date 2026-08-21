import express from 'express';
import { getTemplates, getTemplateById } from '../controllers/templateController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/', getTemplates);
router.get('/:id', getTemplateById);

export default router;
