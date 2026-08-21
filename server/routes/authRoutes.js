import express from 'express';
import { registerUser, loginUser, completeOnboarding, updateSettings, updatePassword } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/onboarding', protect, completeOnboarding);
router.put('/settings', protect, updateSettings);
router.put('/password', protect, updatePassword);

export default router;