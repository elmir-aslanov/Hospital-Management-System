import { Router } from 'express';
import * as shiftsController from './shifts.controller.js';
import { validateCreateShift, validateUpdateShiftStatus } from './shifts.validator.js';
import validate     from '../../middleware/validate.middleware.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize    from '../../middleware/rbac.middleware.js';

const router = Router();
router.use(authenticate);

// /today and /my before /:id
router.get('/today',            authorize('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'), shiftsController.getTodayShifts);
router.get('/my',               authorize('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'), shiftsController.getMyShifts);
router.get('/weekly/:userId',   authorize('ADMIN', 'DOCTOR', 'NURSE'),                 shiftsController.getWeeklySchedule);

router.post('/',                authorize('ADMIN', 'SUPER_ADMIN'), validateCreateShift, validate, shiftsController.createShift);
router.get('/',                 authorize('ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'LAB_TECHNICIAN'), shiftsController.getShifts);
router.patch('/:id/status',     authorize('ADMIN', 'SUPER_ADMIN'), validateUpdateShiftStatus, validate, shiftsController.updateShiftStatus);

export default router;
