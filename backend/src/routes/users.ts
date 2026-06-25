import { Router } from 'express';
import { getUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, authorize('SUPER_ADMIN'), getUsers);
router.get('/:id', authenticate, authorize('SUPER_ADMIN'), getUserById);
router.post('/', authenticate, authorize('SUPER_ADMIN'), createUser);
router.put('/:id', authenticate, authorize('SUPER_ADMIN'), updateUser);
router.delete('/:id', authenticate, authorize('SUPER_ADMIN'), deleteUser);

export default router;
