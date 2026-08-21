import express from 'express';
import { getOverviewAnalytics, getWritingAnalytics, getActivityFeed } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/overview', getOverviewAnalytics);
router.get('/writing', getWritingAnalytics);
router.get('/activity', getActivityFeed);

export default router;
