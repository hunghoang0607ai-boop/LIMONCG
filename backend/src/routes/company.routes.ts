import { Router } from 'express';
import { getCompanies, getCompany, createCompany, updateCompany, deleteCompany } from '../controllers/company.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', getCompanies);
router.post('/', createCompany);
router.get('/:id', getCompany);
router.put('/:id', updateCompany);
router.delete('/:id', deleteCompany);

export default router;
