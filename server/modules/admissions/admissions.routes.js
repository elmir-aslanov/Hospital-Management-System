import { Router } from 'express';
import * as admissionsController from './admissions.controller.js';
import { validateAdmitPatient, validateDischarge } from './admissions.validator.js';
import validate from '../../middleware/validate.middleware.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/rbac.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/', authorize('ADMIN', 'DOCTOR'), validateAdmitPatient, validate, admissionsController.admitPatient);
router.get('/', authorize('ADMIN', 'DOCTOR', 'NURSE'), admissionsController.getAdmissions);
router.get('/:id', admissionsController.getAdmissionById);
router.patch('/:id/discharge', authorize('DOCTOR', 'ADMIN'), validateDischarge, validate, admissionsController.dischargePatient);

export default router;
