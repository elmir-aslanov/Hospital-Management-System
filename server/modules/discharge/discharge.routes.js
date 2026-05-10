import { Router } from 'express';
import * as dischargeController from './discharge.controller.js';
import { validateCreateDischargeSummary, validateDischargeParam } from './discharge.validator.js';
import validate from '../../middleware/validate.middleware.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/rbac.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/', authorize('DOCTOR'), validateCreateDischargeSummary, validate, dischargeController.createDischargeSummary);
router.get('/:id', validateDischargeParam, validate, dischargeController.getDischargeSummaryById);
router.get('/:id/pdf', validateDischargeParam, validate, dischargeController.downloadPDF);

export default router;
