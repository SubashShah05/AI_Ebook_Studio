import Chapter from '../models/Chapter.js';
import Book from '../models/Book.js';
import ChapterVersion from '../models/ChapterVersion.js';

import { getBookAccessRoleHelper } from '../middleware/permissionMiddleware.js';

const VERSION_RETENTION_LIMIT = 15;

// Helper to check user access to the chapter
const verifyChapterAccess = async (chapterId, userId, requiredRole = 'viewer') => {
  const chapter = await Chapter.findById(chapterId);
  if (!chapter) return null;
  const book = await Book.findById(chapter.bookId);
  if (!book) return null;

  const role = await getBookAccessRoleHelper(book, userId);
  if (!role) return null;

  // Role hierarchy calculation
  const rolesHierarchy = { owner: 4, admin: 3, editor: 2, viewer: 1 };
  const userPower = rolesHierarchy[role] || 0;
  const requiredPower = rolesHierarchy[requiredRole] || 1;

  if (userPower < requiredPower) return null;

  return { chapter, book, role };
};

// 1. Get all versions (metadata first, sorted by version number descending)
export const getVersions = async (req, res) => {
  try {
    const access = await verifyChapterAccess(req.params.chapterId, req.user._id, 'viewer');
    if (!access) return res.status(404).json({ message: 'Chapter not found or unauthorized' });

    // Exclude the heavy content field to keep response quick
    const versions = await ChapterVersion.find({ chapterId: req.params.chapterId })
      .select('-content')
      .sort({ versionNumber: -1 });

    res.json(versions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Get full content of a specific version
export const getVersionById = async (req, res) => {
  try {
    const version = await ChapterVersion.findById(req.params.versionId);
    if (!version) return res.status(404).json({ message: 'Version not found' });

    const access = await verifyChapterAccess(version.chapterId, req.user._id, 'viewer');
    if (!access) return res.status(401).json({ message: 'Unauthorized' });

    res.json(version);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Create a manual version checkpoint
export const createManualVersion = async (req, res) => {
  const { content, source } = req.body;
  if (content === undefined) return res.status(400).json({ message: 'Content is required to create a version' });

  try {
    const access = await verifyChapterAccess(req.params.chapterId, req.user._id, 'editor');
    if (!access) return res.status(404).json({ message: 'Chapter not found or unauthorized' });

    const { chapter, book } = access;

    // Get the latest version number
    const latestVersion = await ChapterVersion.findOne({ chapterId: chapter._id })
      .sort({ versionNumber: -1 });
    const nextVersionNum = latestVersion ? latestVersion.versionNumber + 1 : 1;

    // Create the version record
    const version = await ChapterVersion.create({
      chapterId: chapter._id,
      bookId: book._id,
      userId: req.user._id,
      versionNumber: nextVersionNum,
      content,
      wordCount: content ? content.trim().split(/\s+/).length : 0,
      source: source || 'manual'
    });

    // Enforce retention limit (Cleanup older versions)
    const count = await ChapterVersion.countDocuments({ chapterId: chapter._id });
    if (count > VERSION_RETENTION_LIMIT) {
      const oldestToKeep = await ChapterVersion.find({ chapterId: chapter._id })
        .sort({ versionNumber: -1 })
        .skip(VERSION_RETENTION_LIMIT - 1)
        .limit(1)
        .select('_id');
      if (oldestToKeep.length > 0) {
        await ChapterVersion.deleteMany({
          chapterId: chapter._id,
          _id: { $lt: oldestToKeep[0]._id }
        });
      }
    }

    res.status(201).json(version);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Safe restore a specific version
export const restoreVersion = async (req, res) => {
  try {
    const targetVersion = await ChapterVersion.findById(req.params.versionId);
    if (!targetVersion) return res.status(404).json({ message: 'Target version not found' });

    const access = await verifyChapterAccess(targetVersion.chapterId, req.user._id, 'editor');
    if (!access) return res.status(401).json({ message: 'Unauthorized' });

    const { chapter, book } = access;

    // Get latest version number for checkpoints
    const latestVersion = await ChapterVersion.findOne({ chapterId: chapter._id })
      .sort({ versionNumber: -1 });
    const currentVerNumber = latestVersion ? latestVersion.versionNumber : 0;

    // 1. Save current content as a backup version first before restoring
    await ChapterVersion.create({
      chapterId: chapter._id,
      bookId: book._id,
      userId: req.user._id,
      versionNumber: currentVerNumber + 1,
      content: chapter.markdownContent || '',
      wordCount: chapter.wordCount || 0,
      source: 'manual',
      metadata: { note: 'Backup before restoration' }
    });

    // 2. Replace chapter content with the target version's content
    chapter.markdownContent = targetVersion.content;
    chapter.wordCount = targetVersion.wordCount;
    await chapter.save();

    // 3. Create a new restore version event marker
    const restoreEventVersion = await ChapterVersion.create({
      chapterId: chapter._id,
      bookId: book._id,
      userId: req.user._id,
      versionNumber: currentVerNumber + 2,
      content: targetVersion.content,
      wordCount: targetVersion.wordCount,
      source: 'restore',
      metadata: { note: `Restored Version ${targetVersion.versionNumber}` }
    });

    res.json({
      message: 'Version restored successfully',
      chapter: {
        markdownContent: chapter.markdownContent,
        wordCount: chapter.wordCount
      },
      restoredVersion: restoreEventVersion
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
