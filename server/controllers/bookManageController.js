import Book from '../models/Book.js';
import Chapter from '../models/Chapter.js';
import { getAccessibleBookQuery } from './bookController.js';

export const duplicateBook = async (req, res) => {
  try {
    const original = req.book || await Book.findById(req.params.id);
    if (!original) return res.status(404).json({ message: 'Book not found' });

    const newBook = await Book.create({
      title: `${original.title} Copy`,
      subtitle: original.subtitle,
      author: original.author,
      description: original.description,
      topic: original.topic,
      genre: original.genre,
      targetAudience: original.targetAudience,
      writingTone: original.writingTone,
      language: original.language,
      chapterCount: original.chapterCount,
      coverStyle: original.coverStyle,
      coverAuthor: original.coverAuthor,
      status: 'draft',
      owner: req.user._id
    });

    // Copy chapters in order
    const originalChapters = await Chapter.find({ bookId: original._id }).sort({ order: 1 });
    for (const ch of originalChapters) {
      await Chapter.create({
        bookId: newBook._id,
        title: ch.title,
        description: ch.description,
        markdownContent: ch.markdownContent,
        order: ch.order,
        status: ch.status === 'generating' ? 'pending' : ch.status,
        wordCount: ch.wordCount
      });
    }

    res.status(201).json(newBook);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const archiveBook = async (req, res) => {
  try {
    const book = req.book || await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    book.isArchived = true;
    await book.save();
    res.json({ message: 'Book archived', book });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const restoreBook = async (req, res) => {
  try {
    const book = req.book || await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    book.isArchived = false;
    await book.save();
    res.json({ message: 'Book restored', book });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBookCover = async (req, res) => {
  try {
    const book = req.book || await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    const { coverStyle, coverAuthor, title, subtitle } = req.body;
    if (coverStyle !== undefined) book.coverStyle = coverStyle;
    if (coverAuthor !== undefined) book.coverAuthor = coverAuthor;
    if (title !== undefined) book.title = title;
    if (subtitle !== undefined) book.subtitle = subtitle;
    await book.save();
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const assignToProject = async (req, res) => {
  try {
    const book = req.book || await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    book.projectId = req.body.projectId || null;
    await book.save();
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBooksManaged = async (req, res) => {
  try {
    const { archived, status, search, sort, projectId } = req.query;
    
    const baseQuery = await getAccessibleBookQuery(req.user._id);
    const query = { ...baseQuery };

    // Archive filter
    if (archived === 'true') {
      query.isArchived = true;
    } else {
      query.isArchived = false;
    }

    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // Project filter
    if (projectId) {
      query.projectId = projectId;
    }

    let books = await Book.find(query).sort({ updatedAt: -1 }).populate('projectId', 'name color');

    // Server-side text search
    if (search && search.trim()) {
      const searchLower = search.toLowerCase();
      books = books.filter(b =>
        b.title.toLowerCase().includes(searchLower) ||
        (b.description || '').toLowerCase().includes(searchLower) ||
        (b.genre || '').toLowerCase().includes(searchLower)
      );
    }

    // Sorting
    if (sort === 'alphabetical') {
      books.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === 'oldest') {
      books.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sort === 'newest') {
      books.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    // default is 'recent' (updatedAt -1) which MongoDB query already handles

    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
