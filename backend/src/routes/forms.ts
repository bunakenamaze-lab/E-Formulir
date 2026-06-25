import { Router } from 'express';
import {
  getForms, getFormById, createForm, updateForm, deleteForm,
  publishForm, duplicateForm, getFormQRCode, getTemplates,
  useTemplate, getPublicForm,
} from '../controllers/formController';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/public/:slug', optionalAuth, getPublicForm);

// Templates (public)
router.get('/templates', authenticate, getTemplates);
router.post('/templates/:id/use', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), useTemplate);

// Protected routes
router.get('/', authenticate, getForms);
router.get('/:id', authenticate, getFormById);
router.post('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), createForm);
router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), updateForm);
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), deleteForm);
router.patch('/:id/publish', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), publishForm);
router.post('/:id/duplicate', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), duplicateForm);
router.get('/:id/qrcode', authenticate, getFormQRCode);

export default router;
