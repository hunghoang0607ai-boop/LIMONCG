import { Router } from 'express';
import { getDeals, getDealsByStage, getDeal, createDeal, updateDeal, updateDealStage, deleteDeal } from '../controllers/deal.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', getDeals);
router.get('/kanban', getDealsByStage);
router.post('/', createDeal);
router.get('/:id', getDeal);
router.put('/:id', updateDeal);
router.patch('/:id/stage', updateDealStage);
router.delete('/:id', deleteDeal);

export default router;
