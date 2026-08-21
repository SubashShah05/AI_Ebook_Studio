
import { generateBookOutline, generateChapterContent, processAIAssist } from '../services/geminiService.js';
import Book from '../models/Book.js';
import Chapter from '../models/Chapter.js';
import { logAIUsage } from '../middleware/usageMiddleware.js';

export const generateOutlineController = async (req, res) => {
  const { topic, title, description, genre, targetAudience, writingTone, language, chapterCount } = req.body;
  if (!topic) return res.status(400).json({ message: 'Topic parameter required' });
  try {
    const outline = await generateBookOutline(topic, title, description, genre, targetAudience, writingTone, language, chapterCount);
    await logAIUsage(req.user._id, 'outline');
    res.json(outline);
  } catch (error) {
    res.status(500).json({ message: `AI Service Error: ${error.message}` });
  }
};

export const generateChapterContentController = async (req, res) => {
  const { chapterId } = req.body;
  // Use book pre-loaded by checkBookAccess middleware
  const book = req.book;
  try {
    const chapter = await Chapter.findOne({ _id: chapterId, bookId: book._id });
    if (!chapter) return res.status(404).json({ message: 'Chapter missing or does not belong to this book' });

    const previousChapters = await Chapter.find({ bookId: book._id, order: { $lt: chapter.order }, status: 'completed' }).sort({ order: -1 });
    let sequenceContext = '';
    if (previousChapters.length > 0) {
      sequenceContext = `Context: Previous chapters built: ${previousChapters.slice(0, 2).map(c => c.title).join(', ')}.`;
    }

    const markdown = await generateChapterContent(book, chapter, sequenceContext);
    
    chapter.markdownContent = markdown;
    chapter.status = 'completed';
    chapter.wordCount = markdown.split(/\s+/).length;
    await chapter.save();
    
    await logAIUsage(req.user._id, 'chapter_generation', book._id, chapter._id);
    
    res.json({ markdownContent: markdown, status: chapter.status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const processAIAssistController = async (req, res) => {
  const { action, chapterId, selectedText, instruction, nearbyContext } = req.body;
  // book pre-loaded by checkBookAccess middleware
  const book = req.book;

  try {
    if (!action || !chapterId) {
      return res.status(400).json({ message: 'Missing required parameters (action, chapterId)' });
    }

    // Verify chapter exists and belongs to the book
    const chapter = await Chapter.findOne({ _id: chapterId, bookId: book._id });
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found or does not belong to this book' });
    }

    // Truncate selectedText if extremely large to save tokens/prevent abuse
    const safeSelectedText = selectedText ? selectedText.substring(0, 10000) : '';
    const safeNearbyContext = nearbyContext ? nearbyContext.substring(0, 5000) : '';

    const result = await processAIAssist(action, book, chapter, safeSelectedText, instruction, safeNearbyContext);
    await logAIUsage(req.user._id, action, book._id, chapterId);

    res.json({ result, action });
  } catch (error) {
    res.status(500).json({ message: `AI Service Error: ${error.message}` });
  }
};