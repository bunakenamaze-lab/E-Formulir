import { Router } from 'express';
import { getFields, createField, updateField, deleteField, reorderFields, bulkUpdateFields } from '../controllers/fieldController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/:formId/fields', authenticate, getFields);
router.post('/:formId/fields', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), createField);
router.put('/:formId/fields/bulk', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), bulkUpdateFields);
router.put('/:formId/fields/reorder', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), reorderFields);
router.put('/:formId/fields/:fieldId', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), updateField);
router.delete('/:formId/fields/:fieldId', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), deleteField);

export default router;
