import { Router } from 'express';
import * as visitsController from './visits.controller.js';
import { validateCreateVisit, validateUpdateVisit } from './visits.validator.js';
import validate     from '../../middleware/validate.middleware.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize    from '../../middleware/rbac.middleware.js';

const router = Router();

router.use(authenticate);

// Sub-paths before /:id
router.get('/patient/:patientId', authorize('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'), visitsController.getPatientVisits);
router.get('/doctor/:doctorId',   authorize('ADMIN', 'DOCTOR'), visitsController.getDoctorVisits);

router.post('/', authorize('ADMIN', 'DOCTOR'), validateCreateVisit, validate, visitsController.createVisit);

router.get('/:id',       authorize('ADMIN', 'DOCTOR', 'NURSE'), visitsController.getVisitById);
router.patch('/:id',     authorize('DOCTOR'), validateUpdateVisit, validate, visitsController.updateVisit);
router.patch('/:id/close', authorize('DOCTOR'), visitsController.closeVisit);

export default router;
