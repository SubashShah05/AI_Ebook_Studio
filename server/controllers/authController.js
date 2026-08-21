import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import SecurityEvent from '../models/SecurityEvent.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// Helper: log security event (non-blocking)
const logSecurityEvent = async (type, data = {}) => {
  try {
    await SecurityEvent.create({ type, ...data });
  } catch (err) {
    console.error('Failed to log security event:', err.message);
  }
};

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  // Basic input validation
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  try {
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword
    });

    res.status(201).json({
      message: 'Account created successfully. Continue to login to access your workspace.'
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  const userAgent = req.headers['user-agent'] || '';

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    // Unknown email - log generically but don't reveal it
    if (!user) {
      await logSecurityEvent('failed_login', {
        email: email.toLowerCase(),
        ip,
        userAgent,
        severity: 'low',
        metadata: { reason: 'user_not_found' }
      });
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check account lockout
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMs = user.lockedUntil - new Date();
      const remainingMins = Math.ceil(remainingMs / 60000);
      await logSecurityEvent('failed_login', {
        userId: user._id,
        email: user.email,
        ip,
        userAgent,
        severity: 'medium',
        metadata: { reason: 'account_locked', remainingMins }
      });
      return res.status(423).json({
        message: `Account temporarily locked due to too many failed attempts. Try again in ${remainingMins} minute(s).`
      });
    }

    // Check suspended
    if (user.status === 'suspended') {
      await logSecurityEvent('failed_login', {
        userId: user._id,
        email: user.email,
        ip,
        userAgent,
        severity: 'medium',
        metadata: { reason: 'account_suspended' }
      });
      return res.status(403).json({ message: 'Your account has been suspended. Please contact support.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      // Increment login attempts
      user.loginAttempts = (user.loginAttempts || 0) + 1;

      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
        user.loginAttempts = 0;
        await user.save();
        await logSecurityEvent('account_locked', {
          userId: user._id,
          email: user.email,
          ip,
          userAgent,
          severity: 'high',
          metadata: { attempts: MAX_LOGIN_ATTEMPTS }
        });
        return res.status(423).json({
          message: `Account locked for 15 minutes after ${MAX_LOGIN_ATTEMPTS} failed attempts.`
        });
      }

      await user.save();
      await logSecurityEvent('failed_login', {
        userId: user._id,
        email: user.email,
        ip,
        userAgent,
        severity: 'low',
        metadata: { attempt: user.loginAttempts }
      });

      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Successful login — reset attempts
    user.loginAttempts = 0;
    user.lockedUntil = null;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      plan: user.plan,
      onboardingCompleted: user.onboardingCompleted,
      emailNotifications: user.emailNotifications !== false, // default true
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
};

export const completeOnboarding = async (req, res) => {
  const { preferredGenre, targetAudience, writingStyle, preferredLanguage } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.onboardingCompleted = true;
    user.preferredGenre = preferredGenre || user.preferredGenre;
    user.targetAudience = targetAudience || user.targetAudience;
    user.writingStyle = writingStyle || user.writingStyle;
    user.preferredLanguage = preferredLanguage || user.preferredLanguage;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      plan: updatedUser.plan,
      onboardingCompleted: updatedUser.onboardingCompleted,
      token: generateToken(updatedUser._id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Onboarding update failed.' });
  }
};

export const updateSettings = async (req, res) => {
  const { emailNotifications } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (typeof emailNotifications === 'boolean') {
      user.emailNotifications = emailNotifications;
    }
    
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      plan: updatedUser.plan,
      onboardingCompleted: updatedUser.onboardingCompleted,
      emailNotifications: updatedUser.emailNotifications,
      token: generateToken(updatedUser._id)
    });
  } catch (err) {
    res.status(500).json({ message: 'Settings update failed.' });
  }
};

export const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current password and new password are required' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters' });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect current password' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update password' });
  }
};