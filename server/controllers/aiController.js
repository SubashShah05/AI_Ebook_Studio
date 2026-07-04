
import { generateBookOutline, generateChapterContent } from '../services/geminiService.js';
import Book from '../models/Book.js';
import Chapter from '../models/Chapter.js';

export const generateOutlineController = async (req, res) => {
  const { topic } = req.body;
  if (!topic) return res.status(400).json({ message: 'Topic parameter required' });
  try {
    const outline = await generateBookOutline(topic);
    res.json(outline);
  } catch (error) {
    // MODIFIED: This passes the actual backend error array parameters safely to help debug
    res.status(500).json({ message: `AI Service Error: ${error.message}` });
  }
};

export const generateChapterContentController = async (req, res) => {
  const { chapterId } = req.body;
  try {
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) return res.status(404).json({ message: 'Chapter missing' });

    const book = await Book.findOne({ _id: chapter.bookId, owner: req.user._id });
    if (!book) return res.status(401).json({ message: 'Unauthorized access' });

    const previousChapters = await Chapter.find({ bookId: book._id, order: { $lt: chapter.order } }).sort({ order: -1 });
    let sequenceContext = '';
    if (previousChapters.length > 0) {
      sequenceContext = `Context: Previous chapters built: ${previousChapters.slice(0, 2).map(c => c.title).join(', ')}.`;
    }

    const markdown = await generateChapterContent(book.title, chapter.title, chapter.description, sequenceContext);
    
    chapter.markdownContent = markdown;
    await chapter.save();
    
    res.json({ markdownContent: markdown });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};