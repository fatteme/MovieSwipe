import { Router } from 'express';
import { googleAuth, refreshToken } from '../controllers/authController';

const router = Router();

/**
 * @route   POST /auth/
 * @desc    Authenticate user with Google ID token
 */
router.post('/', googleAuth);

/**
 * @route   POST /auth/refresh
 * @desc    Refresh JWT access token using a refresh token
 */
router.post('/refresh', refreshToken);

export default router; 