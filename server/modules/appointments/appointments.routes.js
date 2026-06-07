import { Router } from 'express';
import * as appointmentsController from './appointments.controller.js';
import {
  validateCreateAppointment,
  validateUpdateStatus,
  validateGetAppointments,
} from './appointments.validator.js';
import validate    from '../../middleware/validate.middleware.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize    from '../../middleware/rbac.middleware.js';

const router = Router();

// ── Public routes (no auth) ──────────────────────────────────────────────────
router.post('/public', appointmentsController.createPublicAppointment);

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Appointments
 *   description: Appointment booking and management
 */

/**
 * @swagger
 * /appointments/patient/{patientId}:
 *   get:
 *     summary: Get all appointments for a patient
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Patient's appointments list
 *       404:
 *         description: Patient not found
 */
router.get(
  '/patient/:patientId',
  authorize('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT'),
  appointmentsController.getPatientAppointments
);

/**
 * @swagger
 * /appointments/doctor/{doctorId}:
 *   get:
 *     summary: Get all appointments for a doctor
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Doctor's appointments list
 *       404:
 *         description: Doctor not found
 */
router.get(
  '/doctor/:doctorId',
  authorize('ADMIN', 'DOCTOR', 'RECEPTIONIST'),
  appointmentsController.getDoctorAppointments
);

/**
 * @swagger
 * /appointments:
 *   post:
 *     summary: Book a new appointment (with conflict detection)
 *     tags: [Appointments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [patientId, doctorId, date, startTime, endTime]
 *             properties:
 *               patientId:
 *                 type: string
 *               doctorId:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2026-05-20"
 *               startTime:
 *                 type: string
 *                 example: "10:00"
 *               endTime:
 *                 type: string
 *                 example: "10:30"
 *               reason:
 *                 type: string
 *     responses:
 *       201:
 *         description: Appointment created
 *       409:
 *         description: Time slot conflict detected
 *       400:
 *         description: Validation error
 */
router.post(
  '/',
  authorize('ADMIN', 'RECEPTIONIST', 'PATIENT'),
  validateCreateAppointment, validate,
  appointmentsController.createAppointment
);

/**
 * @swagger
 * /appointments:
 *   get:
 *     summary: Get all appointments (paginated, filterable)
 *     tags: [Appointments]
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [scheduled, completed, cancelled, no-show]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Paginated appointments list
 */
router.get(
  '/',
  authorize('ADMIN', 'DOCTOR', 'RECEPTIONIST'),
  validateGetAppointments, validate,
  appointmentsController.getAppointments
);

/**
 * @swagger
 * /appointments/{id}:
 *   get:
 *     summary: Get appointment by ID
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Appointment object
 *       404:
 *         description: Appointment not found
 */
router.get(
  '/:id',
  authorize('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PATIENT'),
  appointmentsController.getAppointmentById
);

/**
 * @swagger
 * /appointments/{id}/status:
 *   patch:
 *     summary: Update appointment status
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [scheduled, completed, cancelled, no-show]
 *     responses:
 *       200:
 *         description: Status updated
 *       400:
 *         description: Invalid status
 *       404:
 *         description: Appointment not found
 */
router.patch(
  '/:id/reschedule',
  authorize('ADMIN', 'SUPER_ADMIN', 'RECEPTIONIST'),
  appointmentsController.rescheduleAppointment
);

router.patch(
  '/:id/status',
  authorize('ADMIN', 'DOCTOR', 'RECEPTIONIST'),
  validateUpdateStatus, validate,
  appointmentsController.updateAppointmentStatus
);

/**
 * @swagger
 * /appointments/{id}:
 *   delete:
 *     summary: Cancel an appointment
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Appointment cancelled
 *       404:
 *         description: Appointment not found
 */
router.delete(
  '/:id',
  authorize('ADMIN', 'RECEPTIONIST'),
  appointmentsController.cancelAppointment
);

export default router;
