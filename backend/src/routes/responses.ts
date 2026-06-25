import { Router } from 'express';
import {
  getResponses, getResponseById, submitResponse,
  updateResponse, deleteResponse, getResponseStats,
} from '../controllers/responseController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public submission route
router.post('/public/:slug/responses', submitResponse);

// Protected routes
router.get('/:formId/responses', authenticate, getResponses);
router.get('/:formId/responses/stats', authenticate, getResponseStats);
router.get('/:formId/responses/:responseId', authenticate, getResponseById);
router.put('/:formId/responses/:responseId', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), updateResponse);
router.delete('/:formId/responses/:responseId', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), deleteResponse);

export default router;
