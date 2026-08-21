import mongoose from 'mongoose';

const templateChapterSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  order: { type: Number, default: 0 }
}, { _id: false });

const templateSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  category: {
    type: String,
    enum: ['Business', 'Fiction', 'Self-Help', 'Educational', 'Technical', 'Marketing', 'Memoir', 'Children'],
    default: 'Educational'
  },
  genre: { type: String, default: '' },
  targetAudience: { type: String, default: '' },
  writingTone: { type: String, default: 'Professional' },
  chapterCount: { type: Number, default: 0 },
  chapters: [templateChapterSchema],
  tags: [{ type: String }],
  isPremium: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  usageCount: { type: Number, default: 0 }, // how many books used this template
}, { timestamps: true });

templateSchema.index({ category: 1, isArchived: 1 });
templateSchema.index({ isArchived: 1 });
templateSchema.index({ createdAt: -1 });

export default mongoose.model('Template', templateSchema);
