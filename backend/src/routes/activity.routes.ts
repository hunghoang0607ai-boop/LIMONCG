import { Router } from 'express';
import { getActivities, getActivity, createActivity, updateActivity, deleteActivity } from '../controllers/activity.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', getActivities);
router.post('/', createActivity);
router.get('/:id', getActivity);
router.put('/:id', updateActivity);
router.delete('/:id', deleteActivity);

export default router;
