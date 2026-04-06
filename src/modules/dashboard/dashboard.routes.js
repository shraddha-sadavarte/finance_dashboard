import { Router } from 'express';
import authenticate from '../../middleware/auth.js';
import authorize from '../../middleware/rbac.js';
import {
  getSummary,
  getCategoryBreakdown,
  getMonthlyTrends,
  getWeeklyTrends,
  getRecentActivity,
} from './dashboard.controller.js';

const router = Router();

// All dashboard routes require login
router.use(authenticate);

// Summary — VIEWER, ANALYST, ADMIN can all see this
router.get('/summary',
  authorize('VIEWER', 'ANALYST', 'ADMIN'),
  getSummary
);

// Recent activity — VIEWER, ANALYST, ADMIN
router.get('/recent',
  authorize('VIEWER', 'ANALYST', 'ADMIN'),
  getRecentActivity
);

// Category breakdown — ANALYST and ADMIN only
router.get('/categories',
  authorize('ANALYST', 'ADMIN'),
  getCategoryBreakdown
);

// Trends — ANALYST and ADMIN only
router.get('/trends/monthly',
  authorize('ANALYST', 'ADMIN'),
  getMonthlyTrends
);

router.get('/trends/weekly',
  authorize('ANALYST', 'ADMIN'),
  getWeeklyTrends
);

export default router;