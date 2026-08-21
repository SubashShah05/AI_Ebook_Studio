import mongoose from 'mongoose';

const bookShareSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  role: { type: String, enum: ['editor', 'viewer'], default: 'viewer' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

bookShareSchema.index({ bookId: 1, userId: 1 }, { unique: true });

export default mongoose.model('BookShare', bookShareSchema);
