import { Response } from 'express';
import { groupService} from '../services/groupService';
import { logger } from '../utils/logger';
import { Genre, IGroup, IPopulatedGroup } from '../models';
import { AuthenticatedRequest } from '../middleware/auth';


export interface CreateGroupRequest extends AuthenticatedRequest {
   body: {}
}

export interface JoinGroupRequest extends AuthenticatedRequest {
  body: {
    invitationCode: string;
  };
}

export interface UpdatePreferencesRequest extends AuthenticatedRequest {
  params: {
    groupId: string;
  };
  body: {
    genreIds: string[];
  };
}

export interface GroupResponse {
  message: string;
  data?: IGroup | IPopulatedGroup | IPopulatedGroup[];
}

export const createGroup = async (req: CreateGroupRequest, res: Response<GroupResponse>) => {
  try {
    const userId = req.user?._id.toString();

    if (!userId) {
      return res.status(401).json({
        message: 'User not authenticated'
      });
    }
    const group = await groupService.createGroup({ownerId: userId});

    return res.status(201).json({
      message: 'Group created successfully',
      data: group,
    });

  } catch (error) {
    logger.error('Create group error:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Owner not found') {
        return res.status(404).json({
          message: 'User not found'
        });
      }
      
      if (error.message === 'Failed to generate unique invitation code') {
        return res.status(500).json({
          message: 'Failed to create group. Please try again.'
        });
      }
    }

    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};
 
export const getGroupById = async (req: AuthenticatedRequest, res: Response<GroupResponse>) => {
  try {
    const { groupId } = req.params;
    const { includePreferences } = req.query;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        message: 'User not authenticated'
      });
    }

    if (!groupId) {
      return res.status(400).json({
        message: 'Group ID is required'
      });
    }

    const group = await groupService.getGroupById(groupId, includePreferences === 'true');

    if (!group) {
      return res.status(404).json({
        message: 'Group not found'
      });
    }

    const isMember = group.members.some(member => member._id.toString() === userId.toString());
    if (!isMember) {
      return res.status(403).json({
        message: 'Access denied. You are not a member of this group.'
      });
    }

    return res.status(200).json({
      message: 'Group retrieved successfully',
      data: group
    });

  } catch (error) {
    logger.error('Get group error:', error);
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
}; 

export const getUserGroups = async (req: AuthenticatedRequest, res: Response<GroupResponse>) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        message: 'User not authenticated'
      });
    }

    const groups = await groupService.getUserGroups(userId);

    return res.status(200).json({
      message: 'Groups retrieved successfully',
      data: groups
    });
  } catch (error) {   
    logger.error('Get user groups error:', error);
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};

export const joinGroup = async (req: JoinGroupRequest, res: Response<GroupResponse>) => {
  try {
    const userId = req.user?._id;
    const { invitationCode } = req.body;

    if (!userId) {
      return res.status(401).json({
        message: 'User not authenticated'
      });
    }

    if (!invitationCode) {
      return res.status(400).json({
        message: 'Invitation code is required'
      });
    }

    const group = await groupService.joinGroup(invitationCode, userId);

    return res.status(200).json({
      message: 'Successfully joined group',
      data: group
    });

  } catch (error) {
    logger.error('Join group error:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Invalid invitation code') {
        return res.status(404).json({
          message: 'Invalid invitation code'
        });
      }
      
      if (error.message === 'User is already a member of this group') {
        return res.status(409).json({
          message: 'You are already a member of this group'
        });
      }
    }

    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};

export const updateMemberPreferences = async (req: UpdatePreferencesRequest, res: Response<GroupResponse>) => {
  try {
    const { groupId } = req.params;
    const { genreIds } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        message: 'User not authenticated'
      });
    }

    if (!groupId) {
      return res.status(400).json({
        message: 'Group ID is required'
      });
    }

    if (!genreIds || !Array.isArray(genreIds)) {
      return res.status(400).json({
        message: 'Genre IDs array is required'
      });
    }

    const areGenresValid = genreIds.some(id => {
      const genre = Genre.findById(id);
      if(!genre){
        return false;
      }
      return true;
    });
    if (!areGenresValid) {
      return res.status(400).json({
        message: 'Invalid genre ID format'
      });
    }

    const group = await groupService.updateMemberPreferences(groupId, userId.toString(), genreIds);

    return res.status(200).json({
      message: 'Member preferences updated successfully',
      data: group
    });

  } catch (error) {
    logger.error('Update member preferences error:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Group not found') {
        return res.status(404).json({
          message: 'Group not found'
        });
      }
      
      if (error.message === 'User is not a member of this group') {
        return res.status(403).json({
          message: 'You are not a member of this group'
        });
      }

      if (error.message === 'Invalid genre IDs') {
        return res.status(400).json({
          message: 'One or more genre IDs are invalid'
        });
      }
    }

    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};