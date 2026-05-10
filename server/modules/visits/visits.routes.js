import { Router } from 'express';
import * as visitsController from './visits.controller.js';
import { validateCreateVisit, validateCloseVisit } from './visits.validator.js';
import validate from '../../middleware/validate.middleware.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/rbac.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/', authorize('DOCTOR'), validateCreateVisit, validate, visitsController.createVisit);
router.get('/patient/:patientId', authorize('DOCTOR', 'NURSE', 'ADMIN'), visitsController.getPatientVisits);
router.get('/:id', visitsController.getVisitById);
router.patch('/:id/close', authorize('DOCTOR'), validateCloseVisit, validate, visitsController.closeVisit);

export default router;
