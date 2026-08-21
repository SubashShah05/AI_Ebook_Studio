import express from 'express';
import { getBooks, getBookById, createBook, updateBook, deleteBook, generateBook, cancelGeneration, updateOutline } from '../controllers/bookController.js';
import { duplicateBook, archiveBook, restoreBook, updateBookCover, assignToProject, getBooksManaged } from '../controllers/bookManageController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import { checkAILimit } from '../middleware/usageMiddleware.js';
import { getBookShares, shareBook, revokeBookShare } from '../controllers/shareController.js';
import { checkBookAccess } from '../middleware/permissionMiddleware.js';

const router = express.Router();
router.use(protect);

// Core book CRUD
router.route('/').get(getBooks).post(createBook);
router.route('/:id')
  .get(checkBookAccess('viewer'), getBookById)
  .put(checkBookAccess('editor'), upload.single('coverImage'), updateBook)
  .delete(checkBookAccess('owner'), deleteBook);

// AI Generation
router.post('/:bookId/generate', checkBookAccess('editor'), checkAILimit, generateBook);
router.post('/:bookId/cancel', checkBookAccess('editor'), cancelGeneration);
router.put('/:bookId/outline', checkBookAccess('editor'), updateOutline);

// Phase 8: Book management actions
router.get('/manage/list', getBooksManaged);
router.post('/:id/duplicate', checkBookAccess('editor'), duplicateBook);
router.put('/:id/archive', checkBookAccess('editor'), archiveBook);
router.put('/:id/restore', checkBookAccess('editor'), restoreBook);
router.put('/:id/cover', checkBookAccess('editor'), updateBookCover);
router.put('/:id/assign-project', checkBookAccess('editor'), assignToProject);

// Sharing permissions
router.get('/:bookId/shares', checkBookAccess('admin'), getBookShares);
router.post('/:bookId/share', checkBookAccess('admin'), shareBook);
router.delete('/:bookId/share/:targetUserId', checkBookAccess('admin'), revokeBookShare);

export default router;