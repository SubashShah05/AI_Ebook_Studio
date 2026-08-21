import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true }, // 'writing_activity', 'ai_usage', 'export_created'
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', default: null },
  chapterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter', default: null },
  metadata: {
    wordCount: { type: Number },
    format: { type: String }, // 'pdf', 'md', 'docx'
    action: { type: String } // 'outline', 'chapter_generation', 'rewrite', 'improve', etc.
  }
}, { timestamps: true });

activitySchema.index({ userId: 1, createdAt: -1 });
activitySchema.index({ userId: 1, type: 1, createdAt: -1 });

export default mongoose.model('Activity', activitySchema);
