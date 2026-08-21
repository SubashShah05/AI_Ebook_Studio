
import express from 'express';
import { 
  getChaptersByBook, 
  createChapter, 
  updateChapter, 
  deleteChapter, 
  reorderChapters,
  getChapterById 
} from '../controllers/chapterController.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkBookAccess } from '../middleware/permissionMiddleware.js';

const router = express.Router();
router.use(protect);

// 1. Static/Explicit routes ko sabse PEHLE rakhein
router.post('/reorder', reorderChapters);
router.route('/').post(checkBookAccess('editor'), createChapter);
router.route('/book/:bookId').get(checkBookAccess('viewer'), getChaptersByBook);

// 2. Dynamic id route ko hamesha sabse AAKHIRI mein rakhein 
router.route('/:id')
  .get(checkBookAccess('viewer'), getChapterById)
  .put(checkBookAccess('editor'), updateChapter)
  .delete(checkBookAccess('editor'), deleteChapter);

export default router;