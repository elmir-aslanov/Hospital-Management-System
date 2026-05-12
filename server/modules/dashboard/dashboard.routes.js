import { Router } from 'express';
import { getDashboardStats } from './dashboard.controller.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize    from '../../middleware/rbac.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/stats',
  authorize('ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'RECEPTIONIST'),
  getDashboardStats
);

export default router;
