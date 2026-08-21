import Book from '../models/Book.js';
import BookShare from '../models/BookShare.js';
import Workspace from '../models/Workspace.js';
import WorkspaceMember from '../models/WorkspaceMember.js';
import Chapter from '../models/Chapter.js';
import ChapterVersion from '../models/ChapterVersion.js';

// Helper to resolve bookId from any request context (params, body, query, chapterId, versionId)
export const resolveBookId = async (req) => {
  let bookId = req.params.bookId || req.body.bookId || req.query.bookId;
  if (bookId) return bookId;

  const chapterId = req.params.chapterId || req.body.chapterId || req.query.chapterId;
  if (chapterId) {
    const chapter = await Chapter.findById(chapterId);
    if (chapter) return chapter.bookId;
  }

  const versionId = req.params.versionId || req.body.versionId || req.query.versionId;
  if (versionId) {
    const version = await ChapterVersion.findById(versionId);
    if (version) return version.bookId;
  }

  const id = req.params.id;
  if (id) {
    // Check if ID is a Book
    const bookExists = await Book.exists({ _id: id });
    if (bookExists) return id;

    // Check if ID is a Chapter
    const chapter = await Chapter.findById(id);
    if (chapter) return chapter.bookId;

    // Check if ID is a Version
    const version = await ChapterVersion.findById(id);
    if (version) return version.bookId;
  }

  return null;
};

// Helper to get access role of a user for a given book
export const getBookAccessRoleHelper = async (book, userId) => {
  if (!book || !userId) return null;

  // 1. Direct ownership
  if (book.owner.toString() === userId.toString()) {
    return 'owner';
  }

  let currentRole = null;

  // 2. Direct book share override
  const directShare = await BookShare.findOne({ bookId: book._id, userId });
  if (directShare) {
    currentRole = directShare.role;
  }

  // 3. Workspace level role inheritance
  if (!currentRole) {
    const ownerWorkspace = await Workspace.findOne({ owner: book.owner });
    if (ownerWorkspace) {
      const workspaceMember = await WorkspaceMember.findOne({ 
        workspaceId: ownerWorkspace._id, 
        userId 
      });
      if (workspaceMember) {
        // Workspace 'owner' behaves as 'admin' in members' workspaces
        currentRole = workspaceMember.role === 'owner' ? 'admin' : workspaceMember.role;
      }
    }
  }

  return currentRole;
};

export const checkBookAccess = (requiredRole = 'viewer') => {
  return async (req, res, next) => {
    try {
      const bookId = await resolveBookId(req);
      if (!bookId) return res.status(400).json({ message: 'Book ID is required for access checks' });

      const book = await Book.findById(bookId);
      if (!book) return res.status(404).json({ message: 'Book not found' });

      const userId = req.user._id;
      const currentRole = await getBookAccessRoleHelper(book, userId);

      if (!currentRole) {
        return res.status(403).json({ message: 'Access denied. You do not have permissions for this book.' });
      }

      // Role hierarchy calculation
      const rolesHierarchy = { owner: 4, admin: 3, editor: 2, viewer: 1 };
      const userPower = rolesHierarchy[currentRole] || 0;
      const requiredPower = rolesHierarchy[requiredRole] || 1;

      if (userPower < requiredPower) {
        return res.status(403).json({ message: `Access denied. ${requiredRole.toUpperCase()} level access required.` });
      }

      req.book = book;
      req.bookRole = currentRole;
      next();
    } catch (error) {
      res.status(500).json({ message: 'Error checking permission: ' + error.message });
    }
  };
};
