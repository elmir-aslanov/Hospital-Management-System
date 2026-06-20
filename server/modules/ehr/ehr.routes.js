import { Router } from 'express';
import * as ehrController from './ehr.controller.js';
import { validateCreateRecord, validateEHRParam } from './ehr.validator.js';
import validate from '../../middleware/validate.middleware.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/rbac.middleware.js';
import { requirePatientOwnership } from '../../middleware/patientOwnership.middleware.js';

const router = Router();

// Public — no auth required
router.get('/patient-results', ehrController.getPatientResults);

router.use(authenticate);

// EHR summary
router.get('/patient/:patientId/summary', authorize('ADMIN','SUPER_ADMIN','DOCTOR','NURSE'), ehrController.getEHRSummary);

// Get full EHR for a patient (single definition — was duplicated before)
router.get('/patient/:patientId', authorize('ADMIN','SUPER_ADMIN','DOCTOR','NURSE','PATIENT'), requirePatientOwnership('params.patientId'), validateEHRParam, validate, ehrController.getPatientEHR);

// Create a medical record (append-only)
router.post('/', authorize('DOCTOR', 'LAB_TECHNICIAN'), validateCreateRecord, validate, ehrController.createRecord);

// Add EHR record via dedicated endpoint
router.post('/records', authorize('ADMIN','SUPER_ADMIN','DOCTOR'), ehrController.addEHRRecord);
router.put('/records/:id',    authorize('ADMIN','SUPER_ADMIN','DOCTOR'), ehrController.updateEHRRecord);
router.patch('/records/:id/submit', authorize('ADMIN','SUPER_ADMIN','DOCTOR'), ehrController.submitEHRRecord);
router.delete('/records/:id', authorize('ADMIN','SUPER_ADMIN'),          ehrController.deleteEHRRecord);

// Doctor's own documents (Medical Documents panel) — must come before /:id
router.get('/my-records', authorize('DOCTOR'), ehrController.getMyRecords);

// Get a single record
router.get('/:id', authorize('ADMIN','SUPER_ADMIN','DOCTOR','NURSE'), ehrController.getRecordById);

export default router;
