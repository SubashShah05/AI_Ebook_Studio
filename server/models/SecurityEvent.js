import mongoose from 'mongoose';

const securityEventSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      'failed_login',
      'account_locked',
      'account_unlocked',
      'suspicious_auth',
      'role_change',
      'account_suspended',
      'account_restored',
      'invalid_token',
      'admin_access_denied',
      'rate_limit_exceeded'
    ]
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  email: { type: String, default: '' }, // for failed logins where user may not exist
  ip: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
}, { timestamps: true });

// Indexes for security monitoring queries
securityEventSchema.index({ type: 1, createdAt: -1 });
securityEventSchema.index({ userId: 1, createdAt: -1 });
securityEventSchema.index({ createdAt: -1 });
securityEventSchema.index({ severity: 1, createdAt: -1 });

export default mongoose.model('SecurityEvent', securityEventSchema);
