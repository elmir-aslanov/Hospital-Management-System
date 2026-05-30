import { Router }  from 'express';
import * as ctrl    from './billing.controller.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize    from '../../middleware/rbac.middleware.js';

const router = Router();
router.use(authenticate);

router.get('/summary',            authorize('ADMIN', 'SUPER_ADMIN', 'RECEPTIONIST'),           ctrl.getBillingSummary);
router.get('/',                   authorize('ADMIN', 'SUPER_ADMIN', 'RECEPTIONIST'),           ctrl.getInvoices);
router.post('/',                  authorize('ADMIN', 'SUPER_ADMIN', 'RECEPTIONIST'),           ctrl.createInvoice);
router.get('/patient/:patientId', authorize('ADMIN', 'SUPER_ADMIN', 'RECEPTIONIST', 'PATIENT'), ctrl.getPatientPayments);
router.get('/:id',                authorize('ADMIN', 'SUPER_ADMIN', 'RECEPTIONIST', 'PATIENT'), ctrl.getInvoiceById);
router.patch('/:id/status',       authorize('ADMIN', 'SUPER_ADMIN', 'RECEPTIONIST'),           ctrl.updateInvoiceStatus);
router.post('/payments',          authorize('ADMIN', 'SUPER_ADMIN', 'RECEPTIONIST'),           ctrl.addPayment);

export default router;
