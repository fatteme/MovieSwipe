import { Router } from 'express';
import authRoutes from './auth';
import groupRoutes from './groups';
import genreRoutes from './genres';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use('/auth', authRoutes);
router.use('/groups', authenticateToken, groupRoutes);
router.use('/genres', genreRoutes);

export default router; 