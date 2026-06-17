import { Router }  from 'express';
import * as ctrl    from './services.controller.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize    from '../../middleware/rbac.middleware.js';

const router = Router();

// ── Public ─────────────────────────────────────────────────────────────────────
router.get('/', ctrl.getPublic);

// ── Admin — static path must come before dynamic /:slug ────────────────────────
router.get('/admin/all', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), ctrl.getAll);

router.post('/',    authenticate, authorize('ADMIN', 'SUPER_ADMIN'), ctrl.create);
router.put('/:id',  authenticate, authorize('ADMIN', 'SUPER_ADMIN'), ctrl.update);
router.delete('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), ctrl.remove);

// ── Dynamic slug — public, after all statics ────────────────────────────────────
router.get('/:slug', ctrl.getBySlug);

export default router;
