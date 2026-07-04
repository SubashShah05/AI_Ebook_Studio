
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

const router = express.Router();
router.use(protect);

// 1. Static/Explicit routes ko sabse PEHLE rakhein
router.post('/reorder', reorderChapters);
router.route('/').post(createChapter);
router.route('/book/:bookId').get(getChaptersByBook);

// 2. Dynamic id route ko hamesha sabse AAKHIRI mein rakhein 
router.route('/:id')
  .get(getChapterById)     // Yeh line aapki puraani file mein missing thi
  .put(updateChapter)
  .delete(deleteChapter);

export default router;