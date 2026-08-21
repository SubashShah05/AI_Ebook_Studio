import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' },
  // Brute-force login protection
  loginAttempts: { type: Number, default: 0 },
  lockedUntil: { type: Date, default: null },
  onboardingCompleted: { type: Boolean, default: false },
  preferredGenre: { type: String, default: '' },
  targetAudience: { type: String, default: '' },
  writingStyle: { type: String, default: '' },
  preferredLanguage: { type: String, default: 'English' },
  plan: { type: String, enum: ['free', 'pro', 'business'], default: 'free' },
  subscriptionStatus: { type: String, enum: ['active', 'trialing', 'past_due', 'canceled', 'none'], default: 'none' },
  customerId: { type: String, default: '' },
  subscriptionId: { type: String, default: '' },
  subscriptionPeriodEnd: { type: Date, default: null },
  emailNotifications: { type: Boolean, default: true }
}, { timestamps: true });

// Indexes for admin queries
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ plan: 1 });
userSchema.index({ createdAt: -1 });

export default mongoose.model('User', userSchema);