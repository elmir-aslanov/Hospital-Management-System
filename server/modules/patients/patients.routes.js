import { Router } from 'express';
import * as patientsController from './patients.controller.js';

import {
  validateCreatePatient,
  validateUpdatePatient,
  validateSearchPatient,
} from './patients.validator.js';
import validate from '../../middleware/validate.middleware.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/rbac.middleware.js';

const router = Router();

// Public — no auth required
router.get('/search-public', patientsController.searchPublic);

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Patients
 *   description: Patient management
 */

/**
 * @swagger
 * /patients/search:
 *   get:
 *     summary: Search patients by name, ID, or condition
 *     tags: [Patients]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: List of matching patients
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/admin-create',
  authorize('ADMIN', 'SUPER_ADMIN'),
  patientsController.adminCreatePatient
);

router.get(
  '/search',
  authorize('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'),
  validateSearchPatient, validate,
  patientsController.searchPatients
);

/**
 * @swagger
 * /patients:
 *   post:
 *     summary: Register a new patient
 *     tags: [Patients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, dateOfBirth, gender, phone]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Ali Həsənov
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: 1990-05-15
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               phone:
 *                 type: string
 *                 example: "+994501234567"
 *               bloodGroup:
 *                 type: string
 *                 example: A+
 *     responses:
 *       201:
 *         description: Patient registered, returns patient with auto-generated P-XXXX ID
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  authorize('ADMIN', 'RECEPTIONIST'),
  validateCreatePatient, validate,
  patientsController.createPatient
);

/**
 * @swagger
 * /patients:
 *   get:
 *     summary: Get all patients (paginated)
 *     tags: [Patients]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Paginated patient list
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  authorize('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'),
  patientsController.getPatients
);

/**
 * @swagger
 * /patients/{id}:
 *   get:
 *     summary: Get patient by ID
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient MongoDB ID
 *     responses:
 *       200:
 *         description: Patient object
 *       404:
 *         description: Patient not found
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/by-user/:userId',
  authorize('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PATIENT'),
  patientsController.getPatientByUserId
);

router.get(
  '/:id',
  authorize('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PATIENT'),
  patientsController.getPatientById
);

/**
 * @swagger
 * /patients/{id}:
 *   put:
 *     summary: Update patient profile
 *     tags: [Patients]
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
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Patient updated
 *       400:
 *         description: Validation error
 *       404:
 *         description: Patient not found
 */
router.put(
  '/:id',
  authorize('ADMIN', 'RECEPTIONIST'),
  validateUpdatePatient, validate,
  patientsController.updatePatient
);

/**
 * @swagger
 * /patients/{id}/medical-history:
 *   post:
 *     summary: Append medical history entry (immutable — append only)
 *     tags: [Patients]
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
 *               condition:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: History entry added
 *       404:
 *         description: Patient not found
 */
router.post(
  '/:id/medical-history',
  authorize('ADMIN', 'DOCTOR'),
  patientsController.addMedicalHistory
);

/**
 * @swagger
 * /patients/{id}/medical-history:
 *   get:
 *     summary: Get patient medical history
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Medical history entries array
 *       404:
 *         description: Patient not found
 */
router.get(
  '/:id/medical-history',
  authorize('ADMIN', 'DOCTOR', 'NURSE'),
  patientsController.getMedicalHistory
);

export default router;
