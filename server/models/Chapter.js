import mongoose from 'mongoose';

const chapterSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  markdownContent: { type: String, default: '' },
  order: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model('Chapter', chapterSchema);