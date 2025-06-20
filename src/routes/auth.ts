import { Router } from 'express';
import { googleAuth } from '../controllers/authController';

const router = Router();

/**
 * @route   POST /auth/
 * @desc    Authenticate user with Google ID token
 */
router.post('/', googleAuth);

export default router; 