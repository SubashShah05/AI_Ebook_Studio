import Book from '../models/Book.js';
import Chapter from '../models/Chapter.js';
import BookShare from '../models/BookShare.js';
import Workspace from '../models/Workspace.js';
import WorkspaceMember from '../models/WorkspaceMember.js';
import { generateChapterContent } from '../services/geminiService.js';
import { logAIUsage } from '../middleware/usageMiddleware.js';

// Helper to construct query for books accessible to this user
export const getAccessibleBookQuery = async (userId) => {
  const sharedBookIds = await BookShare.find({ userId }).distinct('bookId');
  const memberships = await WorkspaceMember.find({ userId }).populate('workspaceId');
  const workspaceOwners = memberships.map(m => m.workspaceId ? m.workspaceId.owner : null).filter(Boolean);

  return {
    $or: [
      { owner: userId },
      { _id: { $in: sharedBookIds } },
      { owner: { $in: workspaceOwners } }
    ]
  };
};

export const getBooks = async (req, res) => {
  try {
    const baseQuery = await getAccessibleBookQuery(req.user._id);
    const books = await Book.find(baseQuery).sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBookById = async (req, res) => {
  try {
    const book = req.book || await Book.findOne({ _id: req.params.id });
    if (!book) return res.status(404).json({ message: 'Book not found' });
    const chapters = await Chapter.find({ bookId: book._id }).sort({ order: 1 });
    res.json({ ...book.toObject(), chapters });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createBook = async (req, res) => {
  const { title, subtitle, description, topic, genre, targetAudience, writingTone, language, chapterCount } = req.body;
  try {
    const book = await Book.create({
      title,
      subtitle: subtitle || '',
      description: description || '',
      topic: topic || '',
      genre: genre || '',
      targetAudience: targetAudience || '',
      writingTone: writingTone || '',
      language: language || 'English',
      chapterCount: chapterCount || 0,
      author: req.user.name,
      owner: req.user._id,
      status: 'draft'
    });
    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOutline = async (req, res) => {
  const { chapters } = req.body;
  try {
    const book = req.book || await Book.findById(req.params.bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    
    await Chapter.deleteMany({ bookId: book._id });
    const createdChapters = [];
    for (let i = 0; i < chapters.length; i++) {
      const ch = await Chapter.create({
        bookId: book._id,
        title: chapters[i].title,
        description: chapters[i].description,
        order: i + 1,
        status: 'pending'
      });
      createdChapters.push(ch);
    }
    
    book.chapterCount = createdChapters.length;
    await book.save();
    
    res.json(createdChapters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const generateBook = async (req, res) => {
  try {
    const book = req.book || await Book.findById(req.params.bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    
    book.status = 'generating';
    await book.save();
    
    res.status(202).json({ message: 'Generation started' });
    
    // Background generation loop
    setTimeout(async () => {
      try {
        const chapters = await Chapter.find({ bookId: book._id }).sort({ order: 1 });
        
        for (const chapter of chapters) {
          // Re-fetch book to check status
          const currentBook = await Book.findById(book._id);
          if (currentBook.status !== 'generating') {
            break; // Cancelled
          }
          
          if (chapter.status === 'completed') continue;
          
          chapter.status = 'generating';
          await chapter.save();
          
          try {
            const previousChapters = await Chapter.find({ bookId: book._id, order: { $lt: chapter.order }, status: 'completed' }).sort({ order: -1 });
            let sequenceContext = '';
            if (previousChapters.length > 0) {
              sequenceContext = `Context: Previous chapters built: ${previousChapters.slice(0, 2).map(c => c.title).join(', ')}.`;
            }

            const markdown = await generateChapterContent(currentBook, chapter, sequenceContext);
            chapter.markdownContent = markdown;
            chapter.status = 'completed';
            chapter.wordCount = markdown.split(/\s+/).length;
            await chapter.save();
            await logAIUsage(currentBook.owner, 'chapter_generation', currentBook._id, chapter._id);
          } catch (err) {
            chapter.status = 'failed';
            await chapter.save();
          }
        }
        
        const remainingUnfinished = await Chapter.countDocuments({ bookId: book._id, status: { $ne: 'completed' } });
        const finalBook = await Book.findById(book._id);
        if (finalBook.status === 'generating') {
          finalBook.status = remainingUnfinished === 0 ? 'ready' : 'failed';
          await finalBook.save();
        }
      } catch (err) {
        console.error("Background Generation Error:", err);
      }
    }, 0);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const cancelGeneration = async (req, res) => {
  try {
    const book = req.book || await Book.findById(req.params.bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    
    book.status = 'draft';
    await book.save();
    res.json({ message: 'Generation cancelled' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBook = async (req, res) => {
  try {
    const book = req.book || await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    book.title = req.body.title || book.title;
    book.subtitle = req.body.subtitle !== undefined ? req.body.subtitle : book.subtitle;
    book.author = req.body.author || book.author;
    book.description = req.body.description !== undefined ? req.body.description : book.description;
    book.genre = req.body.genre !== undefined ? req.body.genre : book.genre;
    book.targetAudience = req.body.targetAudience !== undefined ? req.body.targetAudience : book.targetAudience;
    book.writingTone = req.body.writingTone !== undefined ? req.body.writingTone : book.writingTone;
    book.language = req.body.language !== undefined ? req.body.language : book.language;
    if (req.body.projectId !== undefined) {
      book.projectId = req.body.projectId || null;
    }
    if (req.file) {
      book.coverImage = `/uploads/${req.file.filename}`;
    }

    const updatedBook = await book.save();
    res.json(updatedBook);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBook = async (req, res) => {
  try {
    const book = req.book || await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    await Chapter.deleteMany({ bookId: book._id });
    await book.deleteOne();
    res.json({ message: 'Book and associated chapters deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};