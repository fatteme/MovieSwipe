import { Group, IGroup } from '../models/Group';
import { User, IUser } from '../models/User';
import { logger } from '../utils/logger';

export interface CreateGroupData {
  name: string;
  ownerId: string;
}

export interface GroupResult {
  group: IGroup;
}

export class GroupService {
  private generateInvitationCode(): string {
    // Generate a random 8-character alphanumeric code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async createGroup(data: CreateGroupData): Promise<GroupResult> {
    try {
      // Verify the owner exists
      const owner = await User.findById(data.ownerId);
      if (!owner) {
        throw new Error('Owner not found');
      }

      // Generate a unique invitation code
      let invitationCode: string;
      let isUnique = false;
      let attempts = 0;
      const maxAttempts = 10;

      while (!isUnique && attempts < maxAttempts) {
        invitationCode = this.generateInvitationCode();
        const existingGroup = await Group.findOne({ invitationCode });
        if (!existingGroup) {
          isUnique = true;
        }
        attempts++;
      }

      if (!isUnique) {
        throw new Error('Failed to generate unique invitation code');
      }

      // Create the group
      const group = new Group({
        name: data.name,
        owner: data.ownerId,
        members: [data.ownerId], // Owner is automatically added as first member
        invitationCode: invitationCode!
      });

      await group.save();

      logger.info(`Group created: ${group.name} by user ${data.ownerId}`);

      return { group };
    } catch (error) {
      logger.error('Error creating group:', error);
      throw error;
    }
  }

  async getGroupById(groupId: string): Promise<IGroup | null> {
    try {
      return await Group.findById(groupId)
        .populate('owner', 'name email')
        .populate('members', 'name email');
    } catch (error) {
      logger.error('Error fetching group:', error);
      throw error;
    }
  }

  async getGroupsByUser(userId: string): Promise<IGroup[]> {
    try {
      return await Group.find({ members: userId })
        .populate('owner', 'name email')
        .populate('members', 'name email');
    } catch (error) {
      logger.error('Error fetching user groups:', error);
      throw error;
    }
  }

  async joinGroupByInvitationCode(invitationCode: string, userId: string): Promise<GroupResult> {
    try {
      const group = await Group.findOne({ invitationCode });
      if (!group) {
        throw new Error('Invalid invitation code');
      }

      // Check if user is already a member
      if (group.members.includes(userId as any)) {
        throw new Error('User is already a member of this group');
      }

      // Add user to group
      group.members.push(userId as any);
      await group.save();

      logger.info(`User ${userId} joined group ${group.name}`);

      return { group };
    } catch (error) {
      logger.error('Error joining group:', error);
      throw error;
    }
  }

  async removeMemberFromGroup(groupId: string, ownerId: string, memberId: string): Promise<void> {
    try {
      const group = await Group.findById(groupId);
      if (!group) {
        throw new Error('Group not found');
      }

      // Only owner can remove members
      if (group.owner.toString() !== ownerId) {
        throw new Error('Only group owner can remove members');
      }

      // Cannot remove the owner
      if (group.owner.toString() === memberId) {
        throw new Error('Cannot remove group owner');
      }

      // Remove member from group
      group.members = group.members.filter(member => member.toString() !== memberId);
      await group.save();

      logger.info(`Member ${memberId} removed from group ${group.name}`);
    } catch (error) {
      logger.error('Error removing member from group:', error);
      throw error;
    }
  }
}

export const groupService = new GroupService(); 