import { Router }               from 'express';
import authenticate             from '../../middleware/auth.middleware.js';
import { getStats, getRecentAppointments } from './admin.controller.js';

const router = Router();

router.use(authenticate);

router.get('/stats',        getStats);
router.get('/appointments', getRecentAppointments);

export default router;
