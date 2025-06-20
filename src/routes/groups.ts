import { Router } from 'express';
import { createGroup, joinGroup, getUserGroups, getGroupById } from '../controllers/groupController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all group routes
router.use(authenticateToken);

/**
 * @route   POST /groups/
 * @desc    Create a new group
 * @access  Private
 */
router.post('/', createGroup);

/**
 * @route   POST /groups/join
 * @desc    Join a group using invitation code
 * @access  Private
 */
router.post('/join', joinGroup);

/**
 * @route   GET /groups/
 * @desc    Get all groups for the authenticated user
 * @access  Private
 */
router.get('/', getUserGroups);

/**
 * @route   GET /groups/:groupId
 * @desc    Get a specific group by ID (user must be a member)
 * @access  Private
 */
router.get('/:groupId', getGroupById);

export default router; 