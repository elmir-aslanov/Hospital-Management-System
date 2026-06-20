import { Router } from 'express';
import * as inventoryController from './inventory.controller.js';
import { validateAddMedicine, validateStockUpdate, validateDispenseMedicine } from './inventory.validator.js';
import validate     from '../../middleware/validate.middleware.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize    from '../../middleware/rbac.middleware.js';

const router = Router();
router.use(authenticate);

// /low-stock and /stats before /:id
router.get('/medicines/low-stock', authorize('ADMIN', 'NURSE'),                          inventoryController.getLowStockMedicines);
router.get('/stats',               authorize('ADMIN'),                                    inventoryController.getInventoryStats);
router.post('/dispense',           authorize('ADMIN', 'NURSE'), validateDispenseMedicine, validate, inventoryController.dispenseMedicines);
router.get('/dispense/queue',      authorize('ADMIN', 'NURSE'),                            inventoryController.getPendingDispenseQueue);
router.get('/dispense/:prescriptionId', authorize('ADMIN', 'NURSE', 'DOCTOR'),              inventoryController.getPrescriptionDispenseDetail);

router.post('/medicines',          authorize('ADMIN'), validateAddMedicine, validate,     inventoryController.addMedicine);
router.get('/medicines',           authorize('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'), inventoryController.getMedicines);

router.get('/medicines/:id',             authorize('ADMIN', 'DOCTOR', 'NURSE'),  inventoryController.getMedicineById);
router.put('/medicines/:id',             authorize('ADMIN'),                      inventoryController.updateMedicine);
router.post('/medicines/:id/stock-in',   authorize('ADMIN'), validateStockUpdate, validate, inventoryController.stockIn);
router.post('/medicines/:id/stock-out',  authorize('ADMIN', 'NURSE'), validateStockUpdate, validate, inventoryController.stockOut);
router.get('/medicines/:id/transactions',authorize('ADMIN'),                      inventoryController.getStockTransactions);

export default router;
