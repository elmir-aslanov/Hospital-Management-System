import { Router } from 'express';
import * as doctorsController from './doctors.controller.js';
import {
  validateCreateDoctor,
  validateUpdateDoctor,
  validateUpdateSchedule,
} from './doctors.validator.js';
import validate from '../../middleware/validate.middleware.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/rbac.middleware.js';
import { uploadDoctorImage } from '../../middleware/upload.middleware.js';

const router = Router();

// Public routes — no auth
router.get('/public',     doctorsController.getPublicDoctors);
router.get('/public/all', doctorsController.getAllPublicDoctors);
router.get('/public/:id', doctorsController.getPublicDoctorById);
router.get('/by-department/:departmentId', doctorsController.getDoctorsByDepartment);
router.get('/:id/public-slots', doctorsController.getDoctorAvailability);

/**
 * @swagger
 * tags:
 *   name: Doctors
 *   description: Doctor profiles and schedule management
 */

/**
 * @swagger
 * /doctors:
 *   get:
 *     summary: Get all doctors (public)
 *     tags: [Doctors]
 *     parameters:
 *       - in: query
 *         name: specialization
 *         schema:
 *           type: string
 *         description: Filter by specialization
 *     responses:
 *       200:
 *         description: List of doctor profiles
 */
router.get(
  '/',
  doctorsController.getDoctors
);

/**
 * @swagger
 * /doctors:
 *   post:
 *     summary: Create a new doctor profile
 *     tags: [Doctors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, specialization]
 *             properties:
 *               userId:
 *                 type: string
 *               specialization:
 *                 type: string
 *                 example: Cardiology
 *               licenseNumber:
 *                 type: string
 *               consultationFee:
 *                 type: number
 *     responses:
 *       201:
 *         description: Doctor profile created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — ADMIN only
 */
router.post(
  '/',
  authenticate, authorize('ADMIN'),
  uploadDoctorImage,
  validateCreateDoctor, validate,
  doctorsController.createDoctor
);

router.post(
  '/admin-create',
  authenticate, authorize('ADMIN', 'SUPER_ADMIN'),
  uploadDoctorImage,
  doctorsController.adminCreateDoctor
);

/**
 * @swagger
 * /doctors/{id}/schedule:
 *   get:
 *     summary: Get doctor's weekly schedule
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Schedule object with days and time slots
 *       404:
 *         description: Doctor not found
 */
router.get(
  '/:id/schedule',
  authenticate, authorize('ADMIN', 'DOCTOR', 'RECEPTIONIST'),
  doctorsController.getDoctorSchedule
);

/**
 * @swagger
 * /doctors/{id}/schedule:
 *   put:
 *     summary: Update doctor's schedule
 *     tags: [Doctors]
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
 *             properties:
 *               schedule:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     day:
 *                       type: string
 *                       example: Monday
 *                     startTime:
 *                       type: string
 *                       example: "09:00"
 *                     endTime:
 *                       type: string
 *                       example: "17:00"
 *     responses:
 *       200:
 *         description: Schedule updated
 *       404:
 *         description: Doctor not found
 */
router.put(
  '/:id/schedule',
  authenticate, authorize('ADMIN', 'DOCTOR'),
  validateUpdateSchedule, validate,
  doctorsController.updateDoctorSchedule
);

/**
 * @swagger
 * /doctors/{id}/availability:
 *   get:
 *     summary: Get available slots for a doctor on a given date
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: "2026-05-20"
 *     responses:
 *       200:
 *         description: Available time slots
 *       404:
 *         description: Doctor not found
 */
router.get(
  '/:id/availability',
  authenticate, authorize('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PATIENT'),
  doctorsController.getDoctorAvailability
);

/**
 * @swagger
 * /doctors/{id}:
 *   get:
 *     summary: Get doctor by ID
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Doctor profile
 *       404:
 *         description: Doctor not found
 */
router.get(
  '/:id',
  authenticate, authorize('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PATIENT'),
  doctorsController.getDoctorById
);

/**
 * @swagger
 * /doctors/{id}:
 *   put:
 *     summary: Update doctor profile
 *     tags: [Doctors]
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
 *             properties:
 *               specialization:
 *                 type: string
 *               consultationFee:
 *                 type: number
 *               bio:
 *                 type: string
 *     responses:
 *       200:
 *         description: Doctor updated
 *       404:
 *         description: Doctor not found
 */
router.put(
  '/:id',
  authenticate, authorize('ADMIN', 'DOCTOR'),
  uploadDoctorImage,
  validateUpdateDoctor, validate,
  doctorsController.updateDoctor
);

router.delete(
  '/:id',
  authenticate, authorize('ADMIN', 'SUPER_ADMIN'),
  doctorsController.deleteDoctor
);

export default router;
