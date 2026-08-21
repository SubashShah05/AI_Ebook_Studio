import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: { type: String, default: 'General' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  color: { type: String, default: '#6366f1' }
}, { timestamps: true });

projectSchema.index({ owner: 1, createdAt: -1 });

export default mongoose.model('Project', projectSchema);
