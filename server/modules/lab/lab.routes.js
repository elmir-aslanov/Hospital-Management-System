import { Router }  from 'express';
import * as ctrl    from './lab.controller.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize    from '../../middleware/rbac.middleware.js';
import { requirePatientOwnershipForModel } from '../../middleware/patientOwnership.middleware.js';
import { uploadDocument } from '../../middleware/upload.middleware.js';
import LabOrder from '../../models/LabOrder.model.js';

const router = Router();
router.use(authenticate);

// Summary
router.get('/summary',                    authorize('ADMIN','SUPER_ADMIN','DOCTOR','LAB_TECHNICIAN'),               ctrl.getLabSummary);

// Orders
router.get('/orders',                     authorize('ADMIN','SUPER_ADMIN','DOCTOR','LAB_TECHNICIAN','NURSE'),       ctrl.getOrders);
router.post('/orders',                    authorize('ADMIN','SUPER_ADMIN','DOCTOR'),                                ctrl.createOrder);
router.get('/orders/:id',                 authorize('ADMIN','SUPER_ADMIN','DOCTOR','LAB_TECHNICIAN'),               ctrl.getOrderById);
router.patch('/orders/:id/status',        authorize('ADMIN','SUPER_ADMIN','LAB_TECHNICIAN'),                        ctrl.updateOrderStatus);
router.delete('/orders/:id',              authorize('ADMIN','SUPER_ADMIN'),                                         ctrl.deleteOrder);

// Results
router.post('/results',                   authorize('ADMIN','SUPER_ADMIN','LAB_TECHNICIAN'),                        ctrl.createResult);
router.get('/results/order/:orderId',     authorize('ADMIN','SUPER_ADMIN','DOCTOR','LAB_TECHNICIAN','PATIENT'),     requirePatientOwnershipForModel(LabOrder, { idParam: 'orderId' }), ctrl.getResultByOrder);
router.get('/results/patient/:patientId', authorize('ADMIN','SUPER_ADMIN','DOCTOR','LAB_TECHNICIAN'),               ctrl.getPatientResults);
router.patch('/results/:id/verify',       authorize('ADMIN','SUPER_ADMIN','DOCTOR'),                                ctrl.verifyResult);
router.patch('/results/:id',              authorize('ADMIN','SUPER_ADMIN','LAB_TECHNICIAN'),                        ctrl.updateResult);
router.post('/results/:id/attachment',    authorize('ADMIN','SUPER_ADMIN','LAB_TECHNICIAN'), uploadDocument,        ctrl.uploadResultAttachment);

export default router;
