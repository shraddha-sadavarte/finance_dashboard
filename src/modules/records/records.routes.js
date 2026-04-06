import { Router } from 'express';
import authenticate from '../../middleware/auth.js';
import authorize from '../../middleware/rbac.js';
import {
  createRecord,
  getAllRecords,
  getMyRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
} from './records.controller.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Any logged in user 
router.get('/my', getMyRecords);

// ADMIN + ANALYST 
router.get('/',    authorize('ADMIN', 'ANALYST'), getAllRecords);
router.get('/:id', authorize('ADMIN', 'ANALYST'), getRecordById);

// ADMIN only 
router.post('/',      authorize('ADMIN'), createRecord);
router.patch('/:id',  authorize('ADMIN'), updateRecord);
router.delete('/:id', authorize('ADMIN'), deleteRecord);

export default router;