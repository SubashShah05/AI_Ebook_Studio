import express from 'express';
import { getBookShares, shareBook, revokeBookShare } from '../controllers/shareController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/:bookId/shares', getBookShares);
router.post('/:bookId/share', shareBook);
router.delete('/:bookId/share/:targetUserId', revokeBookShare);

export default router;
