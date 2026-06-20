import { Router }  from 'express';
import * as ctrl    from './departments.controller.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize    from '../../middleware/rbac.middleware.js';

const router = Router();

// ── Public — no auth ───────────────────────────────────────────────────────────
// Must filter isActive — this is the public-facing listing, unlike /admin/all below.
router.get('/', ctrl.getPublic);

// ── Protected — ADMIN only ─────────────────────────────────────────────────────
// Must be registered BEFORE /:slug so the static path wins
router.get('/admin/all', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), ctrl.getAll);

router.post('/',    authenticate, authorize('ADMIN', 'SUPER_ADMIN'), ctrl.create);
router.put('/:id',  authenticate, authorize('ADMIN', 'SUPER_ADMIN'), ctrl.update);
router.delete('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), ctrl.remove);

// ── Dynamic slug — public, must come after all static paths ───────────────────
router.get('/:slug', ctrl.getBySlug);

export default router;
