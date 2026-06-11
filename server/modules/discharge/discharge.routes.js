import { Router } from 'express';
import * as dischargeController from './discharge.controller.js';
import { validateCreateDischargeSummary } from './discharge.validator.js';
import validate     from '../../middleware/validate.middleware.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize    from '../../middleware/rbac.middleware.js';
import { requirePatientOwnershipForModel } from '../../middleware/patientOwnership.middleware.js';
import DischargeSummary from '../../models/DischargeSummary.model.js';
import Visit from '../../models/Visit.model.js';

const router = Router();

router.use(authenticate);

router.get('/',                   authorize('ADMIN','SUPER_ADMIN','DOCTOR','NURSE'), dischargeController.getAllDischarges);
router.get('/patient/:patientId', authorize('ADMIN','SUPER_ADMIN','DOCTOR','NURSE'), dischargeController.getDischargesByPatient);
// /visit/:visitId before /:id
router.get('/visit/:visitId', authorize('ADMIN', 'DOCTOR', 'NURSE', 'PATIENT'), requirePatientOwnershipForModel(Visit, { idParam: 'visitId' }), dischargeController.getDischargeSummaryByVisit);

router.post('/', authorize('DOCTOR'), validateCreateDischargeSummary, validate, dischargeController.createDischargeSummary);

router.get('/:id',     authorize('ADMIN', 'DOCTOR', 'NURSE', 'PATIENT'), requirePatientOwnershipForModel(DischargeSummary), dischargeController.getDischargeSummaryById);
router.get('/:id/pdf', authorize('ADMIN', 'DOCTOR', 'NURSE', 'PATIENT'), requirePatientOwnershipForModel(DischargeSummary), dischargeController.downloadPDF);

export default router;
