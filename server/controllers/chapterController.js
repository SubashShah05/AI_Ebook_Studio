
import Chapter from '../models/Chapter.js';
import Book from '../models/Book.js';

// 1. Get All Chapters by Book ID
export const getChaptersByBook = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.bookId, owner: req.user._id });
    if (!book) return res.status(404).json({ message: 'Unauthorized or book not found' });

    const chapters = await Chapter.find({ bookId: req.params.bookId }).sort({ order: 1 });
    res.json(chapters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Get Single Chapter Details by ID (Yeh missing tha jiski wajah se error aa raha tha)
export const getChapterById = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });
    
    return res.status(200).json(chapter); 
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 3. Create a New Chapter
export const createChapter = async (req, res) => {
  const { title, description, bookId, markdownContent } = req.body;
  try {
    const book = await Book.findOne({ _id: bookId, owner: req.user._id });
    if (!book) return res.status(404).json({ message: 'Book verification failed' });

    const count = await Chapter.countDocuments({ bookId });
    const chapter = await Chapter.create({
      bookId,
      title,
      description,
      markdownContent: markdownContent || '',
      order: count
    });
    res.status(201).json(chapter);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Update Chapter Attributes
export const updateChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });

    const book = await Book.findOne({ _id: chapter.bookId, owner: req.user._id });
    if (!book) return res.status(401).json({ message: 'Unauthorized access' });

    chapter.title = req.body.title || chapter.title;
    chapter.description = req.body.description !== undefined ? req.body.description : chapter.description;
    chapter.markdownContent = req.body.markdownContent !== undefined ? req.body.markdownContent : chapter.markdownContent;
    
    if (typeof req.body.order === 'number') {
      chapter.order = req.body.order;
    }

    const updated = await chapter.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. Delete Chapter and Auto-Decrement Order Indexing
export const deleteChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });

    const book = await Book.findOne({ _id: chapter.bookId, owner: req.user._id });
    if (!book) return res.status(401).json({ message: 'Unauthorized' });

    const { bookId, order: deletedOrder } = chapter;
    await chapter.deleteOne();

    // Reorder remaining chapters
    await Chapter.updateMany(
      { bookId, order: { $gt: deletedOrder } },
      { $inc: { order: -1 } }
    );

    res.json({ message: 'Chapter removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 6. Bulk Reordering Coordinates
export const reorderChapters = async (req, res) => {
  const { orders } = req.body; 
  try {
    if (!orders || !Array.isArray(orders)) return res.status(400).json({ message: 'Invalid ordering payload' });
    
    const bulkOps = orders.map(item => ({
      updateOne: {
        filter: { _id: item.id },
        update: { order: item.order }
      }
    }));

    await Chapter.bulkWrite(bulkOps);
    res.json({ message: 'Order state updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};