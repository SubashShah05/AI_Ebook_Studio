import express from 'express';
import { getVersions, getVersionById, createManualVersion, restoreVersion } from '../controllers/versionController.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkBookAccess } from '../middleware/permissionMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/:chapterId/versions', checkBookAccess('viewer'), getVersions);
router.get('/versions/:versionId', checkBookAccess('viewer'), getVersionById);
router.post('/:chapterId/versions', checkBookAccess('editor'), createManualVersion);
router.post('/versions/:versionId/restore', checkBookAccess('editor'), restoreVersion);

export default router;
