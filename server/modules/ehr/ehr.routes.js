import { Router } from 'express';
import * as ehrController from './ehr.controller.js';
import { validateCreateRecord, validateEHRParam } from './ehr.validator.js';
import validate from '../../middleware/validate.middleware.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/rbac.middleware.js';

const router = Router();

// Public — no auth required
router.get('/patient-results', ehrController.getPatientResults);

router.use(authenticate);

// EHR (new)
router.get('/patient/:patientId/summary', authorize('ADMIN','SUPER_ADMIN','DOCTOR','NURSE'), ehrController.getEHRSummary);
router.get('/patient/:patientId',         authorize('ADMIN','SUPER_ADMIN','DOCTOR','NURSE','PATIENT'), ehrController.getPatientEHR);
router.post('/records',                   authorize('ADMIN','SUPER_ADMIN','DOCTOR'),         ehrController.addEHRRecord);
router.put('/records/:id',                authorize('ADMIN','SUPER_ADMIN','DOCTOR'),         ehrController.updateEHRRecord);
router.delete('/records/:id',             authorize('ADMIN','SUPER_ADMIN'),                  ehrController.deleteEHRRecord);

// Create a medical record (append-only — no DELETE route)
router.post('/', authorize('DOCTOR', 'LAB_TECHNICIAN'), validateCreateRecord, validate, ehrController.createRecord);

// Get all records for a patient
router.get('/patient/:patientId', authorize('ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'NURSE', 'PATIENT'), validateEHRParam, validate, ehrController.getRecordsByPatient);

// Get a single record
router.get('/:id', authorize('ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'NURSE'), ehrController.getRecordById);

export default router;
