import { Router }   from 'express';
import * as ctrl     from './settings.controller.js';
import authenticate  from '../../middleware/auth.middleware.js';
import authorize     from '../../middleware/rbac.middleware.js';

const router = Router();

// Public — anyone can read clinic info
router.get('/', ctrl.getSettings);

// Protected — admin only
router.put('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), ctrl.updateSettings);

export default router;
