import { Router } from 'express';
import { createGroup, getGroupById, getUserGroups, joinGroup, updateMemberPreferences } from '../controllers/groupController';

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
 * @route   POST /groups/:groupId/preferences
 * @desc    Update member preferences for a group
 */
router.post('/:groupId/preferences', updateMemberPreferences);

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