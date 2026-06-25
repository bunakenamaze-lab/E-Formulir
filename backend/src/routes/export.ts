import { Router } from 'express';
import { exportToExcel, exportToCSV } from '../controllers/exportController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/:formId/excel', authenticate, exportToExcel);
router.get('/:formId/csv', authenticate, exportToCSV);

export default router;
