import express from 'express';
import { getBooks, getBookById, createBook, updateBook, deleteBook } from '../controllers/bookController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();
router.use(protect);

router.route('/').get(getBooks).post(createBook);
router.route('/:id').get(getBookById).put(upload.single('coverImage'), updateBook).delete(deleteBook);

export default router;