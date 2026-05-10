import { Router } from 'express';
import * as patientsController from './patients.controller.js';
import { validateCreatePatient, validateUpdatePatient } from './patients.validator.js';
import validate from '../../middleware/validate.middleware.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/rbac.middleware.js';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize('ADMIN', 'RECEPTIONIST'),
  validateCreatePatient, validate,
  patientsController.createPatient
);

router.get(
  '/',
  authorize('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'),
  patientsController.getPatients
);

router.get(
  '/search',
  authorize('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'),
  patientsController.searchPatients
);

router.get(
  '/:id',
  authorize('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PATIENT'),
  patientsController.getPatientById
);

router.put(
  '/:id',
  authorize('ADMIN', 'RECEPTIONIST'),
  validateUpdatePatient, validate,
  patientsController.updatePatient
);

router.get(
  '/:id/medical-history',
  authorize('ADMIN', 'DOCTOR', 'NURSE'),
  patientsController.getMedicalHistory
);

export default router;
