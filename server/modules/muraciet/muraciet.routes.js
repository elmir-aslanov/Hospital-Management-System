import { Router }    from 'express';
import { create, getAll, markRead, updateStatus, deleteOne } from './muraciet.controller.js';
import authenticate  from '../../middleware/auth.middleware.js';
import authorize     from '../../middleware/rbac.middleware.js';

const router = Router();

router.post('/',             create);
router.get('/',              authenticate, authorize('SUPER_ADMIN', 'ADMIN'), getAll);
router.patch('/:id/read',   authenticate, authorize('SUPER_ADMIN', 'ADMIN'), markRead);
router.patch('/:id/status', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), updateStatus);
router.delete('/:id',       authenticate, authorize('SUPER_ADMIN', 'ADMIN'), deleteOne);

export default router;
