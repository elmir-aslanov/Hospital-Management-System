import { Router } from 'express';
import {
  getAppointmentAnalytics,
  getTopDoctorsHandler,
  getMonthlyPatientCountHandler,
  getAppointmentStatusHandler,
  getSpecializationDemandHandler,
} from './analytics.controller.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize    from '../../middleware/rbac.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/appointments',        authorize('ADMIN', 'SUPER_ADMIN'),                getAppointmentAnalytics);
router.get('/appointments/status', authorize('ADMIN', 'SUPER_ADMIN'),                getAppointmentStatusHandler);
router.get('/doctors/top',         authorize('ADMIN', 'SUPER_ADMIN', 'DOCTOR'),      getTopDoctorsHandler);
router.get('/patients/monthly',    authorize('ADMIN', 'SUPER_ADMIN'),                getMonthlyPatientCountHandler);
router.get('/specializations',     authorize('ADMIN', 'SUPER_ADMIN'),                getSpecializationDemandHandler);

export default router;
