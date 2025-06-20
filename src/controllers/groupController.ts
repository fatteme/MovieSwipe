import { Request, Response } from 'express';
import { groupService, CreateGroupData, GroupResult } from '../services/groupService';
import { logger } from '../utils/logger';

// Extend Request interface to include user from auth middleware
export interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    googleId: string;
    email: string;
    name: string;
  };
}

export interface CreateGroupRequest extends AuthenticatedRequest {
  body: {
    name: string;
  };
}

export interface CreateGroupResponse {
  message: string;
  data?: GroupResult;
}

export interface JoinGroupRequest extends AuthenticatedRequest {
  body: {
    invitationCode: string;
  };
}

export interface JoinGroupResponse {
  message: string;
  data?: GroupResult;
}

export interface GetGroupsResponse {
  message: string;
  data?: any[];
}

export interface GetGroupResponse {
  message: string;
  data?: any;
}

export const createGroup = async (req: CreateGroupRequest, res: Response<CreateGroupResponse>) => {
  try {
    const { name } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        message: 'User not authenticated'
      });
    }

    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        message: 'Group name is required'
      });
    }

    if (name.length > 100) {
      return res.status(400).json({
        message: 'Group name must be 100 characters or less'
      });
    }

    const groupData: CreateGroupData = {
      name: name.trim(),
      ownerId: userId
    };

    const result = await groupService.createGroup(groupData);

    return res.status(201).json({
      message: 'Group created successfully',
      data: result
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

export const joinGroup = async (req: JoinGroupRequest, res: Response<JoinGroupResponse>) => {
  try {
    const { invitationCode } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        message: 'User not authenticated'
      });
    }

    if (!invitationCode || invitationCode.trim().length === 0) {
      return res.status(400).json({
        message: 'Invitation code is required'
      });
    }

    const result = await groupService.joinGroupByInvitationCode(invitationCode.trim(), userId);

    return res.status(200).json({
      message: 'Successfully joined group',
      data: result
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
        return res.status(400).json({
          message: 'You are already a member of this group'
        });
      }
    }

    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};

export const getUserGroups = async (req: AuthenticatedRequest, res: Response<GetGroupsResponse>) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        message: 'User not authenticated'
      });
    }

    const groups = await groupService.getGroupsByUser(userId);

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

export const getGroupById = async (req: AuthenticatedRequest, res: Response<GetGroupResponse>) => {
  try {
    const { groupId } = req.params;
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

    const group = await groupService.getGroupById(groupId);

    if (!group) {
      return res.status(404).json({
        message: 'Group not found'
      });
    }

    // Check if user is a member of the group
    const isMember = group.members.some(member => member._id.toString() === userId);
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