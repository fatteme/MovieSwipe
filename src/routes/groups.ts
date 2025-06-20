import { Router } from 'express';
import { createGroup, getGroupById, getUserGroups } from '../controllers/groupController';

const router = Router();

/**
 * @route   POST /groups/
 * @desc    Create a new group
 */
router.post('/', createGroup);

/**
 * @route   GET /groups/:groupId
 * @desc    Get a specific group by ID (user must be a member)
 */
router.get('/:groupId', getGroupById);

/**
 * @route   GET /groups
 * @desc    Get all user's groups
 */
router.get('/', getUserGroups);



export default router; 