import { Router } from 'express';
import * as prescriptionsController from './prescriptions.controller.js';
import { validateCreatePrescription, validatePrescriptionParam } from './prescriptions.validator.js';
import validate from '../../middleware/validate.middleware.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/rbac.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/', authorize('DOCTOR'), validateCreatePrescription, validate, prescriptionsController.createPrescription);
router.get('/visit/:visitId', authorize('DOCTOR', 'NURSE', 'PATIENT'), prescriptionsController.getPrescriptionsByVisit);
router.get('/patient/:patientId', authorize('DOCTOR', 'NURSE', 'ADMIN', 'PATIENT'), prescriptionsController.getPrescriptionsByPatient);
router.get('/:id', validatePrescriptionParam, validate, prescriptionsController.getPrescriptionById);

export default router;
