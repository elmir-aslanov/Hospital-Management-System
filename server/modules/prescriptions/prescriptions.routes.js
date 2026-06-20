import { Router } from 'express';
import * as prescriptionsController from './prescriptions.controller.js';
import {
  validateCreatePrescription,
  validatePrescriptionReason,
} from './prescriptions.validator.js';
import validate     from '../../middleware/validate.middleware.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize    from '../../middleware/rbac.middleware.js';
import {
  requirePatientOwnership,
  requirePatientOwnershipForModel,
} from '../../middleware/patientOwnership.middleware.js';
import Prescription from '../../models/Prescription.model.js';
import Visit from '../../models/Visit.model.js';

const router = Router();

router.use(authenticate);

// Sub-paths before /:id
router.get('/visit/:visitId',     authorize('ADMIN', 'SUPER_ADMIN', 'BAS_HEKIM', 'DOCTOR', 'NURSE', 'PATIENT'), requirePatientOwnershipForModel(Visit, { idParam: 'visitId' }), prescriptionsController.getPrescriptionsByVisit);
router.get('/patient/:patientId', authorize('ADMIN', 'SUPER_ADMIN', 'BAS_HEKIM', 'DOCTOR', 'NURSE', 'PATIENT'), requirePatientOwnership('params.patientId'), prescriptionsController.getPatientPrescriptions);

router.get('/', authorize('ADMIN', 'SUPER_ADMIN', 'BAS_HEKIM', 'DOCTOR'), prescriptionsController.getPrescriptions);
router.post('/', authorize('DOCTOR'), validateCreatePrescription, validate, prescriptionsController.createPrescription);
router.get('/:id', authorize('ADMIN', 'SUPER_ADMIN', 'BAS_HEKIM', 'DOCTOR', 'NURSE', 'PATIENT'), requirePatientOwnershipForModel(Prescription), prescriptionsController.getPrescriptionById);
router.patch('/:id/cancel', authorize('ADMIN', 'SUPER_ADMIN', 'DOCTOR'), validatePrescriptionReason, validate, prescriptionsController.cancelPrescription);
router.patch('/:id/archive', authorize('ADMIN', 'SUPER_ADMIN', 'DOCTOR'), validatePrescriptionReason, validate, prescriptionsController.archivePrescription);

// Backward-compatible endpoint: DELETE now performs a cancellation and never
// removes the medical record.
router.delete('/:id', authorize('ADMIN', 'SUPER_ADMIN', 'DOCTOR'), validatePrescriptionReason, validate, prescriptionsController.cancelPrescription);

export default router;
