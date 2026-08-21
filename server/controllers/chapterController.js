
import Chapter from '../models/Chapter.js';
import Book from '../models/Book.js';
import Activity from '../models/Activity.js';
import ChapterVersion from '../models/ChapterVersion.js';

// 1. Get All Chapters by Book ID
export const getChaptersByBook = async (req, res) => {
  try {
    const book = req.book || await Book.findById(req.params.bookId);
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
    const book = req.book || await Book.findById(bookId);
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

    const book = req.book || await Book.findById(chapter.bookId);
    if (!book) return res.status(401).json({ message: 'Unauthorized access' });

    const oldWordCount = chapter.markdownContent ? chapter.markdownContent.split(/\s+/).length : 0;

    // Auto-versioning checkpoint logic before re-assignment
    if (req.body.markdownContent !== undefined && req.body.markdownContent !== chapter.markdownContent) {
      const lastVersion = await ChapterVersion.findOne({ chapterId: chapter._id })
        .sort({ versionNumber: -1 });

      const nextVerNumber = lastVersion ? lastVersion.versionNumber + 1 : 1;
      const currentContent = req.body.markdownContent;
      const currentWords = currentContent ? currentContent.trim().split(/\s+/).length : 0;

      let shouldCreateVersion = false;
      let source = req.body.versionSource || 'autosave';

      if (['manual', 'ai', 'restore'].includes(source)) {
        shouldCreateVersion = true;
      } else {
        // Autosave threshold validation: time elapsed > 5 mins OR word delta > 100
        if (!lastVersion) {
          shouldCreateVersion = true;
        } else {
          const timeSinceLast = Date.now() - new Date(lastVersion.createdAt).getTime();
          const wordDiff = Math.abs(currentWords - lastVersion.wordCount);
          if (timeSinceLast > 300000 || wordDiff > 100) {
            shouldCreateVersion = true;
          }
        }
      }

      if (shouldCreateVersion) {
        await ChapterVersion.create({
          chapterId: chapter._id,
          bookId: book._id,
          userId: req.user._id,
          versionNumber: nextVerNumber,
          content: currentContent,
          wordCount: currentWords,
          source
        });

        // Enforce 15 versions retention
        const count = await ChapterVersion.countDocuments({ chapterId: chapter._id });
        if (count > 15) {
          const oldestToKeep = await ChapterVersion.find({ chapterId: chapter._id })
            .sort({ versionNumber: -1 })
            .skip(14)
            .select('_id');
          if (oldestToKeep.length > 0) {
            const oldestIds = oldestToKeep.map(v => v._id);
            await ChapterVersion.deleteMany({
              chapterId: chapter._id,
              _id: { $in: oldestIds }
            });
          }
        }
      }
    }

    chapter.title = req.body.title || chapter.title;
    chapter.description = req.body.description !== undefined ? req.body.description : chapter.description;
    chapter.markdownContent = req.body.markdownContent !== undefined ? req.body.markdownContent : chapter.markdownContent;
    
    const newWordCount = chapter.markdownContent ? chapter.markdownContent.split(/\s+/).length : 0;
    chapter.wordCount = newWordCount;

    if (typeof req.body.order === 'number') {
      chapter.order = req.body.order;
    }

    const updated = await chapter.save();

    if (req.body.markdownContent !== undefined && newWordCount > oldWordCount) {
      const addedWords = newWordCount - oldWordCount;
      await Activity.create({
        userId: req.user._id,
        type: 'writing_activity',
        bookId: chapter.bookId,
        chapterId: chapter._id,
        metadata: { wordCount: addedWords }
      });
    }

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

    const book = req.book || await Book.findById(chapter.bookId);
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
    if (!orders || !Array.isArray(orders) || orders.length === 0) return res.status(400).json({ message: 'Invalid ordering payload' });
    
    // Resolve book and verify permissions
    const firstChapter = await Chapter.findById(orders[0].id);
    if (!firstChapter) return res.status(404).json({ message: 'Chapter not found' });

    const book = await Book.findById(firstChapter.bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const { getBookAccessRoleHelper } = await import('../middleware/permissionMiddleware.js');
    const role = await getBookAccessRoleHelper(book, req.user._id);
    const rolesHierarchy = { owner: 4, admin: 3, editor: 2, viewer: 1 };
    if ((rolesHierarchy[role] || 0) < 2) {
      return res.status(403).json({ message: 'Access denied. EDITOR level access required.' });
    }

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