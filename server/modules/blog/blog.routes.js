import { Router }  from 'express';
import * as ctrl    from './blog.controller.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize    from '../../middleware/rbac.middleware.js';
import { uploadImage } from '../../middleware/upload.middleware.js';

const router = Router();

// ── Public ─────────────────────────────────────────────────────────────────────
router.get('/',           ctrl.getPublished);
router.get('/:slug',      ctrl.getBySlug);

// ── Admin ──────────────────────────────────────────────────────────────────────
router.use(authenticate);
router.use(authorize('ADMIN', 'SUPER_ADMIN'));

router.get('/admin/all',  ctrl.getAll);
router.post('/',          ctrl.create);
router.put('/:id',        ctrl.update);
router.delete('/:id',     ctrl.remove);
router.post('/:id/image', uploadImage, ctrl.uploadCover);

export default router;
