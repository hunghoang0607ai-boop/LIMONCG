import { Router } from 'express';
import { getDashboardStats, getTeamMembers } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/stats', getDashboardStats);
router.get('/team', getTeamMembers);

export default router;
