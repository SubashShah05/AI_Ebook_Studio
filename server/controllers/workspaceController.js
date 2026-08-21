import crypto from 'crypto';
import Workspace from '../models/Workspace.js';
import WorkspaceMember from '../models/WorkspaceMember.js';
import Invitation from '../models/Invitation.js';
import User from '../models/User.js';
import Activity from '../models/Activity.js';

// Helper to secure-hash a token
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// 1. Get or auto-create user workspace
export const getOrCreateWorkspace = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check if user is a member of any workspace
    let memberRecord = await WorkspaceMember.findOne({ userId }).populate('workspaceId');
    
    if (!memberRecord) {
      // Create new personal workspace
      const workspaceName = `${req.user.name}'s Workspace`;
      const workspace = await Workspace.create({
        name: workspaceName,
        owner: userId
      });

      // Add user as owner member
      memberRecord = await WorkspaceMember.create({
        workspaceId: workspace._id,
        userId,
        role: 'owner'
      });

      // Populate workspaceId reference
      memberRecord.workspaceId = workspace;
    }

    res.json({
      workspace: memberRecord.workspaceId,
      role: memberRecord.role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Update Workspace Name
export const updateWorkspaceName = async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ message: 'Workspace name is required' });

  try {
    const userId = req.user._id;
    const memberRecord = await WorkspaceMember.findOne({ workspaceId: req.params.workspaceId, userId });

    if (!memberRecord || !['owner', 'admin'].includes(memberRecord.role)) {
      return res.status(403).json({ message: 'Unauthorized. Owner/Admin access required.' });
    }

    const workspace = await Workspace.findById(req.params.workspaceId);
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

    workspace.name = name.trim();
    await workspace.save();

    res.json(workspace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Get Members & Pending Invitations
export const getWorkspaceMembers = async (req, res) => {
  try {
    const userId = req.user._id;
    const isMember = await WorkspaceMember.findOne({ workspaceId: req.params.workspaceId, userId });
    if (!isMember) return res.status(403).json({ message: 'Access denied' });

    const members = await WorkspaceMember.find({ workspaceId: req.params.workspaceId })
      .populate('userId', 'name email preferredLanguage')
      .sort({ role: 1 });

    const invitations = await Invitation.find({ 
      workspaceId: req.params.workspaceId, 
      status: 'pending',
      expiresAt: { $gt: new Date() }
    });

    res.json({ members, invitations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Send Invitation
export const inviteMember = async (req, res) => {
  const { email, role } = req.body;
  if (!email || !role) return res.status(400).json({ message: 'Email and role are required' });
  if (!['admin', 'editor', 'viewer'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role selection' });
  }

  try {
    const userId = req.user._id;
    const senderMembership = await WorkspaceMember.findOne({ workspaceId: req.params.workspaceId, userId });

    if (!senderMembership || !['owner', 'admin'].includes(senderMembership.role)) {
      return res.status(403).json({ message: 'Owner or Admin status required to invite members' });
    }

    // Rate Limiting: Max 20 pending invitations
    const pendingCount = await Invitation.countDocuments({ 
      workspaceId: req.params.workspaceId, 
      status: 'pending' 
    });
    if (pendingCount >= 20) {
      return res.status(429).json({ message: 'Too many pending invitations. Revoke some before sending more.' });
    }

    // Check if user is already a member
    const targetUser = await User.findOne({ email: email.toLowerCase() });
    if (targetUser) {
      const alreadyMember = await WorkspaceMember.findOne({ 
        workspaceId: req.params.workspaceId, 
        userId: targetUser._id 
      });
      if (alreadyMember) {
        return res.status(400).json({ message: 'User is already a member of this workspace' });
      }
    }

    // Create secure random invite token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(token);

    // Expire invitation in 48 hours
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    const invite = await Invitation.create({
      email: email.toLowerCase(),
      workspaceId: req.params.workspaceId,
      invitedBy: userId,
      role,
      tokenHash,
      expiresAt
    });

    await Activity.create({
      userId,
      type: 'ai_usage', // Recycled activity structure or standard usage log
      metadata: { action: 'member_invited', email }
    });

    res.status(201).json({
      message: 'Invitation generated successfully',
      invitation: invite,
      inviteUrl: `/invite/${token}` // Raw token returned so client can display/copy link directly
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. Revoke Invitation
export const revokeInvitation = async (req, res) => {
  try {
    const userId = req.user._id;
    const invite = await Invitation.findById(req.params.inviteId);
    if (!invite) return res.status(404).json({ message: 'Invitation not found' });

    const senderMembership = await WorkspaceMember.findOne({ workspaceId: invite.workspaceId, userId });
    if (!senderMembership || !['owner', 'admin'].includes(senderMembership.role)) {
      return res.status(403).json({ message: 'Unauthorized to revoke invitations' });
    }

    invite.status = 'revoked';
    await invite.save();

    res.json({ message: 'Invitation revoked successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 6. Update Member Role
export const updateMemberRole = async (req, res) => {
  const { role } = req.body;
  if (!['admin', 'editor', 'viewer'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role selection' });
  }

  try {
    const userId = req.user._id;
    const senderMembership = await WorkspaceMember.findOne({ workspaceId: req.params.workspaceId, userId });

    if (!senderMembership || !['owner', 'admin'].includes(senderMembership.role)) {
      return res.status(403).json({ message: 'Only Workspace Owners or Admins can change member roles' });
    }

    const memberToUpdate = await WorkspaceMember.findOne({ 
      workspaceId: req.params.workspaceId, 
      userId: req.params.targetUserId 
    });
    if (!memberToUpdate) return res.status(404).json({ message: 'Member not found in workspace' });

    if (memberToUpdate.role === 'owner') {
      return res.status(400).json({ message: 'Cannot change Workspace Owner role' });
    }

    memberToUpdate.role = role;
    await memberToUpdate.save();

    res.json({ message: 'Member role updated successfully', member: memberToUpdate });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 7. Remove Member
export const removeMember = async (req, res) => {
  try {
    const userId = req.user._id;
    const senderMembership = await WorkspaceMember.findOne({ workspaceId: req.params.workspaceId, userId });

    if (!senderMembership || !['owner', 'admin'].includes(senderMembership.role)) {
      return res.status(403).json({ message: 'Unauthorized. Owner/Admin access required.' });
    }

    const memberToRemove = await WorkspaceMember.findOne({ 
      workspaceId: req.params.workspaceId, 
      userId: req.params.targetUserId 
    });
    if (!memberToRemove) return res.status(404).json({ message: 'Member not found in workspace' });

    if (memberToRemove.role === 'owner') {
      return res.status(400).json({ message: 'Cannot remove Workspace Owner' });
    }

    await memberToRemove.deleteOne();

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 8. Accept Invitation
export const acceptInvitation = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: 'Invitation token is required' });

  try {
    const tokenHash = hashToken(token);
    const invite = await Invitation.findOne({ tokenHash, status: 'pending' });

    if (!invite) return res.status(404).json({ message: 'Invalid or expired invitation token' });

    if (new Date() > invite.expiresAt) {
      invite.status = 'revoked';
      await invite.save();
      return res.status(400).json({ message: 'This invitation has expired' });
    }

    // Verify logged in user email matches invitation email
    if (invite.email !== req.user.email.toLowerCase()) {
      return res.status(403).json({ 
        message: `This invitation was sent to ${invite.email}. Please login with that account to accept.` 
      });
    }

    // Check if membership already exists
    const existingMember = await WorkspaceMember.findOne({ 
      workspaceId: invite.workspaceId, 
      userId: req.user._id 
    });

    if (existingMember) {
      invite.status = 'accepted';
      await invite.save();
      return res.status(400).json({ message: "You're already a member of this workspace" });
    }

    // Accept invitation
    invite.status = 'accepted';
    await invite.save();

    const member = await WorkspaceMember.create({
      workspaceId: invite.workspaceId,
      userId: req.user._id,
      role: invite.role
    });

    res.json({ 
      message: 'Invitation accepted successfully', 
      member 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
