import { Router } from 'express';
import * as dischargeController from './discharge.controller.js';
import { validateCreateDischargeSummary } from './discharge.validator.js';
import validate     from '../../middleware/validate.middleware.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize    from '../../middleware/rbac.middleware.js';

const router = Router();

router.use(authenticate);

// /visit/:visitId before /:id
router.get('/visit/:visitId', authorize('ADMIN', 'DOCTOR', 'NURSE', 'PATIENT'), dischargeController.getDischargeSummaryByVisit);

router.post('/', authorize('DOCTOR'), validateCreateDischargeSummary, validate, dischargeController.createDischargeSummary);

router.get('/:id',     authorize('ADMIN', 'DOCTOR', 'NURSE', 'PATIENT'), dischargeController.getDischargeSummaryById);
router.get('/:id/pdf', authorize('ADMIN', 'DOCTOR', 'NURSE', 'PATIENT'), dischargeController.downloadPDF);

export default router;
