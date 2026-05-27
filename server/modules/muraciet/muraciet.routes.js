import { Router }    from 'express';
import { create, getAll } from './muraciet.controller.js';
import authenticate  from '../../middleware/auth.middleware.js';
import authorize     from '../../middleware/rbac.middleware.js';

const router = Router();

router.post('/', create);
router.get('/',  authenticate, authorize('SUPER_ADMIN', 'ADMIN'), getAll);

export default router;
