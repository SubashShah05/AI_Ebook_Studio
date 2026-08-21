import express from 'express';
import { 
  getOrCreateWorkspace, updateWorkspaceName, getWorkspaceMembers, 
  inviteMember, revokeInvitation, updateMemberRole, removeMember, acceptInvitation 
} from '../controllers/workspaceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getOrCreateWorkspace);
router.put('/:workspaceId', updateWorkspaceName);
router.get('/:workspaceId/members', getWorkspaceMembers);
router.post('/:workspaceId/invitations', inviteMember);
router.delete('/invitations/:inviteId', revokeInvitation);
router.put('/:workspaceId/members/:targetUserId', updateMemberRole);
router.delete('/:workspaceId/members/:targetUserId', removeMember);
router.post('/accept', acceptInvitation);

export default router;
