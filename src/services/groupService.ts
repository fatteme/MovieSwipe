import mongoose from 'mongoose';
import { Group, IPopulatedGroup } from '../models/Group';
import { IUser, User } from '../models/User';
import { Genre } from '../models/Genre';
import { logger } from '../utils/logger';

export interface CreateGroupData {
  ownerId: string;
}

export class GroupService {
  private getGroup(groupId: string): Promise<IPopulatedGroup | null> {
    return Group.findById(groupId)
      .populate<{ owner: IUser }>('owner', 'name email')
      .populate<{ members: IUser[] }>('members', 'name email');
  }

  private generateInvitationCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const code = Array(8).fill(0).map(() => chars.charAt(Math.floor(Math.random() * chars.length)));
    return code.join('');
  }

  async createGroup(data: CreateGroupData): Promise<IPopulatedGroup> {
    try {
      const owner = await User.findById(data.ownerId);
      if (!owner) {
        throw new Error('User not found');
      }

      let invitationCode = '';
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

      if (!isUnique || !invitationCode) {
        throw new Error('Failed to generate unique invitation code');
      }

      const group = new Group({
        owner: data.ownerId,
        members: [data.ownerId],
        invitationCode: invitationCode
      });

      await group.save();

      logger.info(`Group created by user ${data.ownerId}`);

      const populatedGroup = await Group.findById(group._id)
        .populate('owner', 'name email')
        .populate('members', 'name email') as IPopulatedGroup | null;
      
      if (!populatedGroup) {
        throw new Error('Failed to retrieve created group');
      }

      return populatedGroup;

    } catch (error) {
      logger.error('Error creating group:', error);
      throw error;
    }
  }

  async getGroupById(groupId: string, includePreferences: boolean = false): Promise<IPopulatedGroup | null> {
    try {
      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(groupId)) {
        throw new Error('Invalid group id');
      }

      const group = await this.getGroup(groupId);

      if (!group) {
        throw new Error('Group not found');
      }

      if (includePreferences) {
        // Populate preferences with genre details
        const preferencesWithGenres: { [key: string]: any[] } = {};
        
        for (const [memberId, genreIds] of group.preferences.entries()) {
          if (genreIds && genreIds.length > 0) {
            const genres = await Genre.find({ _id: { $in: genreIds } }).select('_id name tmdbId');
            preferencesWithGenres[memberId] = genres;
          } else {
            preferencesWithGenres[memberId] = [];
          }
        }
        
        // Add populated preferences to the group object
        (group as any).preferencesWithGenres = preferencesWithGenres;
      }

      return group;
    } catch (error) {
      logger.error('Error fetching group:', error);
      throw error;
    }
  }

  async getUserGroups(userId: mongoose.Types.ObjectId): Promise<IPopulatedGroup[]> {
    try {
      return await Group.find({ members: userId })
        .populate<{ owner: IUser }>('owner', 'name email')
        .populate<{ members: IUser[] }>('members', 'name email');
    } catch (error) {
      logger.error('Error fetching user groups:', error);
      throw error;
    }
  }

  async joinGroup(invitationCode: string, userId: mongoose.Types.ObjectId): Promise<IPopulatedGroup> {
    try {
      const group = await Group.findOne({ invitationCode });
      if (!group) {
        throw new Error('Invalid invitation code');
      }

      if (group.members.includes(userId)) {
        throw new Error('User is already a member of this group');
      }

      group.members.push(userId);
      await group.save();

      const populatedGroup = await this.getGroup(group._id.toString());
      
      if (!populatedGroup) {
        throw new Error('Failed to retrieve updated group');
      }

      logger.info(`User ${userId} joined group ${group._id}`);
      return populatedGroup;
    } catch (error) {
      logger.error('Error joining group:', error);
      throw error;
    }
  }

  async updateMemberPreferences(groupId: string, userId: string, genreIds: string[]): Promise<IPopulatedGroup> {
    try {
      const group = await Group.findById(groupId);
      if (!group) {
        throw new Error('Group not found');
      }

      if (!group.members.includes(new mongoose.Types.ObjectId(userId))) {
        throw new Error('User is not a member of this group');
      }

      genreIds.forEach(id => {
        group.preferences.set(id, [...(group.preferences.get(id) || []), new mongoose.Types.ObjectId(userId)]);
      });

      await group.save();

      const populatedGroup = await this.getGroup(group._id.toString());
      
      if (!populatedGroup) {
        throw new Error('Failed to retrieve updated group');
      }

      logger.info(`User ${userId} updated preferences for group ${group._id}`);
      return populatedGroup;
    } catch (error) {
      logger.error('Error updating member preferences:', error);
      throw error;
    }
  }
}

export const groupService = new GroupService(); 