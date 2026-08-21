import Book from '../models/Book.js';
import BookShare from '../models/BookShare.js';
import User from '../models/User.js';
import { getBookAccessRoleHelper } from '../middleware/permissionMiddleware.js';

// Helper to check if current user is owner or admin of the book
const checkBookAdmin = async (bookId, userId) => {
  const book = await Book.findById(bookId);
  if (!book) return false;
  const role = await getBookAccessRoleHelper(book, userId);
  return ['owner', 'admin'].includes(role);
};

// 1. Get all shares for a book
export const getBookShares = async (req, res) => {
  try {
    const isAdmin = await checkBookAdmin(req.params.bookId, req.user._id);
    if (!isAdmin) return res.status(403).json({ message: 'Access denied' });

    const shares = await BookShare.find({ bookId: req.params.bookId })
      .populate('userId', 'name email');
    res.json(shares);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Share book directly with a user email
export const shareBook = async (req, res) => {
  const { email, role } = req.body;
  if (!email || !role) return res.status(400).json({ message: 'Email and role are required' });
  if (!['editor', 'viewer'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role selection' });
  }

  try {
    const isAdmin = await checkBookAdmin(req.params.bookId, req.user._id);
    if (!isAdmin) return res.status(403).json({ message: 'Access denied' });

    // Lookup user by email
    const targetUser = await User.findOne({ email: email.toLowerCase() });
    if (!targetUser) return res.status(404).json({ message: 'User with this email not found' });

    // Check if user is the book owner
    const book = await Book.findById(req.params.bookId);
    if (book.owner.toString() === targetUser._id.toString()) {
      return res.status(400).json({ message: 'User is the owner of this book' });
    }

    // Upsert direct book share
    const share = await BookShare.findOneAndUpdate(
      { bookId: req.params.bookId, userId: targetUser._id },
      { role, createdBy: req.user._id },
      { new: true, upsert: true }
    ).populate('userId', 'name email');

    res.json({ message: 'Book shared successfully', share });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Revoke book sharing access
export const revokeBookShare = async (req, res) => {
  try {
    const isAdmin = await checkBookAdmin(req.params.bookId, req.user._id);
    if (!isAdmin) return res.status(403).json({ message: 'Access denied' });

    await BookShare.findOneAndDelete({ 
      bookId: req.params.bookId, 
      userId: req.params.targetUserId 
    });

    res.json({ message: 'Sharing access revoked successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
