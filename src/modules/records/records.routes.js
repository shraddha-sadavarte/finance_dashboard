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

router.use(authenticate);

// Any logged in user — view their own records
router.get('/my', getMyRecords);

// ANALYST + ADMIN — view all records
router.get('/',    authorize('ADMIN', 'ANALYST'), getAllRecords);
router.get('/:id', authorize('ADMIN', 'ANALYST'), getRecordById);

// ✅ Any logged in user can create, update, delete their OWN records
router.post('/',      createRecord);
router.patch('/:id',  updateRecord);
router.delete('/:id', deleteRecord);

export default router;