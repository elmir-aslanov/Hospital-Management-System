import { Router } from 'express';
import { getDashboardStats } from './dashboard.controller.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize    from '../../middleware/rbac.middleware.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Admin dashboard statistics
 */

/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     summary: Get aggregated dashboard statistics
 *     tags: [Dashboard]
 *     description: Returns counts for patients, doctors, appointments, wards, beds, and recent activity.
 *     responses:
 *       200:
 *         description: Dashboard stats object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalPatients:
 *                   type: integer
 *                 totalDoctors:
 *                   type: integer
 *                 todayAppointments:
 *                   type: integer
 *                 availableBeds:
 *                   type: integer
 *                 occupiedBeds:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/stats',
  authorize('ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'RECEPTIONIST'),
  getDashboardStats
);

export default router;
