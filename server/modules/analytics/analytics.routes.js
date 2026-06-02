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

/**
 * @swagger
 * /api/v1/analytics/appointments:
 *   get:
 *     summary: Get appointment analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Appointment analytics data
 *       401:
 *         description: Unauthorized
 */
router.get('/appointments',        authorize('ADMIN', 'SUPER_ADMIN'),                getAppointmentAnalytics);
router.get('/appointments/status', authorize('ADMIN', 'SUPER_ADMIN'),                getAppointmentStatusHandler);
router.get('/doctors/top',         authorize('ADMIN', 'SUPER_ADMIN', 'DOCTOR'),      getTopDoctorsHandler);

/**
 * @swagger
 * /api/v1/analytics/patients/monthly:
 *   get:
 *     summary: Get monthly patient growth
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Monthly patient data
 *       401:
 *         description: Unauthorized
 */
router.get('/patients/monthly',    authorize('ADMIN', 'SUPER_ADMIN'),                getMonthlyPatientCountHandler);
router.get('/specializations',     authorize('ADMIN', 'SUPER_ADMIN'),                getSpecializationDemandHandler);

export default router;
