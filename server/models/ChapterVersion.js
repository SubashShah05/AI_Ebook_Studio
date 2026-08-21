import mongoose from 'mongoose';

const chapterVersionSchema = new mongoose.Schema({
  chapterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter', required: true, index: true },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  versionNumber: { type: Number, required: true },
  content: { type: String, required: true },
  wordCount: { type: Number, default: 0 },
  source: { type: String, enum: ['manual', 'autosave', 'ai', 'restore'], default: 'manual' },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

// Compound index for timeline listing
chapterVersionSchema.index({ chapterId: 1, createdAt: -1 });

export default mongoose.model('ChapterVersion', chapterVersionSchema);
