import { Router } from 'express';
import * as ctrl from './reports.controller.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize    from '../../middleware/rbac.middleware.js';

const router = Router();

// Clinical reports only — no billing/finance endpoints live here, so
// BAS_HEKIM gets full access to this module without any finance exposure.
router.use(authenticate);
router.use(authorize('ADMIN', 'SUPER_ADMIN', 'BAS_HEKIM'));

router.get('/summary',      ctrl.getSummary);
router.get('/appointments', ctrl.getAppointmentsReport);
router.get('/lab',          ctrl.getLabReport);
router.get('/documents',    ctrl.getDocumentsReport);
router.get('/doctors',      ctrl.getDoctorActivity);
router.get('/departments',  ctrl.getDepartmentActivity);

export default router;
