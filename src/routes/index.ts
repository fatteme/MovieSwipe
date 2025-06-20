import { Router } from 'express';
import authRoutes from './auth';
import groupRoutes from './groups';

const router = Router();

router.use('/auth', authRoutes);
router.use('/groups', groupRoutes);

export default router; 