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

router.use(authenticate);

// IMPORTANT: /search must be registered before /:id
router.get(
  '/search',
  authorize('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'),
  validateSearchPatient, validate,
  patientsController.searchPatients
);

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

router.post(
  '/:id/medical-history',
  authorize('ADMIN', 'DOCTOR'),
  patientsController.addMedicalHistory
);

router.get(
  '/:id/medical-history',
  authorize('ADMIN', 'DOCTOR', 'NURSE'),
  patientsController.getMedicalHistory
);

export default router;
