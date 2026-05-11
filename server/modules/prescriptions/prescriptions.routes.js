import { Router } from 'express';
import * as prescriptionsController from './prescriptions.controller.js';
import { validateCreatePrescription } from './prescriptions.validator.js';
import validate     from '../../middleware/validate.middleware.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize    from '../../middleware/rbac.middleware.js';

const router = Router();

router.use(authenticate);

// Sub-paths before /:id
router.get('/visit/:visitId',     authorize('ADMIN', 'DOCTOR', 'NURSE', 'PATIENT'), prescriptionsController.getPrescriptionsByVisit);
router.get('/patient/:patientId', authorize('ADMIN', 'DOCTOR', 'NURSE', 'PATIENT'), prescriptionsController.getPatientPrescriptions);

router.post('/', authorize('DOCTOR'), validateCreatePrescription, validate, prescriptionsController.createPrescription);
router.get('/:id', authorize('ADMIN', 'DOCTOR', 'NURSE', 'PATIENT'), prescriptionsController.getPrescriptionById);

export default router;
