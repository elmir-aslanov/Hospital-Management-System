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

router.use(authenticate);

// IMPORTANT: specific sub-paths registered before /:id
router.get(
  '/patient/:patientId',
  authorize('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT'),
  appointmentsController.getPatientAppointments
);

router.get(
  '/doctor/:doctorId',
  authorize('ADMIN', 'DOCTOR', 'RECEPTIONIST'),
  appointmentsController.getDoctorAppointments
);

router.post(
  '/',
  authorize('ADMIN', 'RECEPTIONIST', 'PATIENT'),
  validateCreateAppointment, validate,
  appointmentsController.createAppointment
);

router.get(
  '/',
  authorize('ADMIN', 'DOCTOR', 'RECEPTIONIST'),
  validateGetAppointments, validate,
  appointmentsController.getAppointments
);

router.get(
  '/:id',
  authorize('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PATIENT'),
  appointmentsController.getAppointmentById
);

router.patch(
  '/:id/status',
  authorize('ADMIN', 'DOCTOR', 'RECEPTIONIST'),
  validateUpdateStatus, validate,
  appointmentsController.updateAppointmentStatus
);

router.delete(
  '/:id',
  authorize('ADMIN', 'RECEPTIONIST'),
  appointmentsController.cancelAppointment
);

export default router;
