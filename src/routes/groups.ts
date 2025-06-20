import { Router } from 'express';
import { createGroup, getGroupById, getUserGroups, joinGroup } from '../controllers/groupController';

const router = Router();

/**
 * @route   POST /groups/
 * @desc    Create a new group
 */
router.post('/', createGroup);

/**
 * @route   POST /groups/join
 * @desc    Join a group using invitation code
 */
router.post('/join', joinGroup);

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