import { Router }   from 'express';
import * as ctrl     from './pricelist.controller.js';
import authenticate  from '../../middleware/auth.middleware.js';
import authorize     from '../../middleware/rbac.middleware.js';

const router = Router();

// Public — patients and doctors can view prices
router.get('/',    ctrl.getPrices);
router.get('/:id', ctrl.getPriceById);

// Protected — admin only
router.use(authenticate);
router.post('/',      authorize('ADMIN', 'SUPER_ADMIN'), ctrl.createPrice);
router.put('/:id',    authorize('ADMIN', 'SUPER_ADMIN'), ctrl.updatePrice);
router.delete('/:id', authorize('ADMIN', 'SUPER_ADMIN'), ctrl.deletePrice);

export default router;
