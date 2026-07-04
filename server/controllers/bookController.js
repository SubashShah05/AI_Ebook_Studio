import Book from '../models/Book.js';
import Chapter from '../models/Chapter.js';

export const getBooks = async (req, res) => {
  try {
    const books = await Book.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBookById = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id, owner: req.user._id });
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createBook = async (req, res) => {
  const { title, subtitle, author } = req.body;
  try {
    const book = await Book.create({
      title,
      subtitle,
      author: author || req.user.name,
      owner: req.user._id
    });
    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBook = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id, owner: req.user._id });
    if (!book) return res.status(404).json({ message: 'Book not found' });

    book.title = req.body.title || book.title;
    book.subtitle = req.body.subtitle !== undefined ? req.body.subtitle : book.subtitle;
    book.author = req.body.author || book.author;
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
    const book = await Book.findOne({ _id: req.params.id, owner: req.user._id });
    if (!book) return res.status(404).json({ message: 'Book not found' });

    await Chapter.deleteMany({ bookId: book._id });
    await book.deleteOne();
    res.json({ message: 'Book and associated chapters deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};