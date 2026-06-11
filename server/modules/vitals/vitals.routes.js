import { Router } from 'express';
import * as vitalsController from './vitals.controller.js';
import { validateRecordVitals } from './vitals.validator.js';
import validate     from '../../middleware/validate.middleware.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize    from '../../middleware/rbac.middleware.js';
import { requirePatientOwnership } from '../../middleware/patientOwnership.middleware.js';

const router = Router();

router.use(authenticate);

// Specific sub-paths must come before parameterized ones
router.get('/patient/:patientId/latest', authorize('ADMIN', 'DOCTOR', 'NURSE', 'PATIENT'), requirePatientOwnership('params.patientId'), vitalsController.getLatestVitals);
router.get('/patient/:patientId/trend',  authorize('ADMIN', 'DOCTOR', 'NURSE', 'PATIENT'), requirePatientOwnership('params.patientId'), vitalsController.getVitalsTrend);
router.get('/patient/:patientId',        authorize('ADMIN', 'DOCTOR', 'NURSE'),             vitalsController.getPatientVitalsHistory);
router.get('/visit/:visitId',            authorize('ADMIN', 'DOCTOR', 'NURSE'),             vitalsController.getVitalsByVisit);

router.post('/', authorize('DOCTOR', 'NURSE'), validateRecordVitals, validate, vitalsController.recordVitals);

export default router;
