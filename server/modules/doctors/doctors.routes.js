import { Router } from 'express';
import * as doctorsController from './doctors.controller.js';
import { validateCreateDoctor, validateUpdateSchedule } from './doctors.validator.js';
import validate from '../../middleware/validate.middleware.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/rbac.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/', authorize('ADMIN', 'SUPER_ADMIN'), validateCreateDoctor, validate, doctorsController.createDoctor);
router.get('/', doctorsController.getDoctors);
router.get('/:id', doctorsController.getDoctorById);
router.put('/:id', authorize('ADMIN', 'SUPER_ADMIN', 'DOCTOR'), doctorsController.updateDoctor);
router.get('/:id/schedule', doctorsController.getDoctorSchedule);
router.put('/:id/schedule', authorize('ADMIN', 'SUPER_ADMIN', 'DOCTOR'), validateUpdateSchedule, validate, doctorsController.updateDoctorSchedule);
router.get('/:id/availability', doctorsController.getDoctorAvailability);

export default router;
