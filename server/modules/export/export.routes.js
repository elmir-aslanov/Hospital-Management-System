import { Router } from 'express';
import * as exportController from './export.controller.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize    from '../../middleware/rbac.middleware.js';

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN', 'SUPER_ADMIN'));

router.get('/patients',     exportController.exportPatients);
router.get('/appointments', exportController.exportAppointments);
router.get('/inventory',    exportController.exportInventory);
router.get('/audit-log',    exportController.exportAuditLog);

export default router;
