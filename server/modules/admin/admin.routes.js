import { Router }               from 'express';
import authenticate             from '../../middleware/auth.middleware.js';
import authorize                from '../../middleware/rbac.middleware.js';
import { getStats, getRecentAppointments, getHealth } from './admin.controller.js';

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN', 'SUPER_ADMIN'));

router.get('/stats',        getStats);
router.get('/appointments', getRecentAppointments);
router.get('/health',       getHealth);

export default router;
