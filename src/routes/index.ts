import { Router } from 'express';
import authRoutes from './auth';
import groupRoutes from './groups';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use('/auth', authRoutes);
router.use('/groups', authenticateToken, groupRoutes);

export default router; 