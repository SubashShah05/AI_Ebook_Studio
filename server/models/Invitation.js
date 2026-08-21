import mongoose from 'mongoose';

const invitationSchema = new mongoose.Schema({
  email: { type: String, required: true, trim: true, lowercase: true, index: true },
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['admin', 'editor', 'viewer'], default: 'viewer' },
  tokenHash: { type: String, required: true, index: true },
  status: { type: String, enum: ['pending', 'accepted', 'revoked'], default: 'pending' },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

export default mongoose.model('Invitation', invitationSchema);
