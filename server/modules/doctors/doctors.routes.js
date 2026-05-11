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

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize('ADMIN'),
  validateCreateDoctor, validate,
  doctorsController.createDoctor
);

router.get(
  '/',
  authorize('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PATIENT'),
  doctorsController.getDoctors
);

// /availability and /schedule must come before /:id to avoid param collision
router.get(
  '/:id/schedule',
  authorize('ADMIN', 'DOCTOR', 'RECEPTIONIST'),
  doctorsController.getDoctorSchedule
);

router.put(
  '/:id/schedule',
  authorize('ADMIN', 'DOCTOR'),
  validateUpdateSchedule, validate,
  doctorsController.updateDoctorSchedule
);

router.get(
  '/:id/availability',
  authorize('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PATIENT'),
  doctorsController.getDoctorAvailability
);

router.get(
  '/:id',
  authorize('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PATIENT'),
  doctorsController.getDoctorById
);

router.put(
  '/:id',
  authorize('ADMIN', 'DOCTOR'),
  validateUpdateDoctor, validate,
  doctorsController.updateDoctor
);

export default router;
