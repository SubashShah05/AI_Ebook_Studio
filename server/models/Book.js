import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  author: { type: String, required: true },
  description: { type: String, default: '' },
  topic: { type: String, default: '' },
  genre: { type: String, default: '' },
  targetAudience: { type: String, default: '' },
  writingTone: { type: String, default: '' },
  language: { type: String, default: 'English' },
  status: { type: String, enum: ['draft', 'generating', 'ready', 'failed', 'archived'], default: 'draft' },
  chapterCount: { type: Number, default: 0 },
  coverImage: { type: String, default: '' },
  coverStyle: { type: String, default: 'modern' },
  coverAuthor: { type: String, default: '' },
  isArchived: { type: Boolean, default: false },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Indexes for common queries
bookSchema.index({ owner: 1, createdAt: -1 });
bookSchema.index({ owner: 1, isArchived: 1, status: 1 });
bookSchema.index({ projectId: 1 });

export default mongoose.model('Book', bookSchema);