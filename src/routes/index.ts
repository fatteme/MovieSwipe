import { Router } from 'express';
import authRoutes from './auth';
import groupRoutes from './groups';
import movieRoutes from './movies';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use('/auth', authRoutes);
router.use('/groups', authenticateToken, groupRoutes);
router.use('/movies', authenticateToken, movieRoutes);

export default router; 