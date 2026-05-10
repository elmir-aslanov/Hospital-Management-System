import { Router } from 'express';
import * as appointmentsController from './appointments.controller.js';
import { validateCreateAppointment, validateStatusUpdate } from './appointments.validator.js';
import validate from '../../middleware/validate.middleware.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/rbac.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/', authorize('RECEPTIONIST', 'PATIENT', 'ADMIN'), validateCreateAppointment, validate, appointmentsController.createAppointment);
router.get('/', authorize('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'NURSE'), appointmentsController.getAppointments);
router.get('/:id', appointmentsController.getAppointmentById);
router.patch('/:id/status', authorize('DOCTOR', 'RECEPTIONIST', 'ADMIN'), validateStatusUpdate, validate, appointmentsController.updateAppointmentStatus);
router.delete('/:id', authorize('ADMIN', 'RECEPTIONIST'), appointmentsController.cancelAppointment);

export default router;
