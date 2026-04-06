import { Router } from 'express';
import authenticate from '../../middleware/auth.js';
import authorize from '../../middleware/rbac.js';
import { getAllUsers, getUserById, getMe, updateUserRole, updateUserStatus, deleteUser } from './users.controller.js';

const router = Router();

// All routes require authentication so instead of writing with every route, apply it once
router.use(authenticate);

//Own profile — any logged in user 
router.get('/me', getMe);

//Admin only routes 
router.get('/',          authorize('ADMIN'), getAllUsers);
router.get('/:id',       authorize('ADMIN'), getUserById);
router.patch('/:id/role',   authorize('ADMIN'), updateUserRole);
router.patch('/:id/status', authorize('ADMIN'), updateUserStatus);
router.delete('/:id',    authorize('ADMIN'), deleteUser);

export default router;