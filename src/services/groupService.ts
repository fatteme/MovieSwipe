import { Group, IGroup } from '../models/Group';
import { User } from '../models/User';
import { logger } from '../utils/logger';

export interface CreateGroupData {
  ownerId: string;
}

export class GroupService {
  private generateInvitationCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const code = Array(8).map(() => chars.charAt(Math.floor(Math.random() * chars.length)));
    return code.join('');
  }

  async createGroup(data: CreateGroupData): Promise<IGroup> {
    try {
      const owner = await User.findById(data.ownerId);
      if (!owner) {
        throw new Error('User not found');
      }

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

      const group = new Group({
        owner: data.ownerId,
        members: [data.ownerId],
        invitationCode: invitationCode!
      });

      await group.save();

      logger.info(`Group created by user ${data.ownerId}`);

      return group;
    } catch (error) {
      logger.error('Error creating group:', error);
      throw error;
    }
  }

  async getGroupById(groupId: string): Promise<IGroup | null> {
    try {
      return await Group.findById(groupId);
    } catch (error) {
      logger.error('Error fetching group:', error);
      throw error;
    }
  }
}

export const groupService = new GroupService(); 