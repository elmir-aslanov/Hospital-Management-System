import { Router } from 'express';
import * as ctrl from './blogPosts.controller.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/rbac.middleware.js';
import { uploadImage } from '../../middleware/upload.middleware.js';

const router = Router();

// ── Public ─────────────────────────────────────────────────────────────────────
router.get('/',            ctrl.getAll);
router.get('/categories',  ctrl.getCategories);

// ── Admin ──────────────────────────────────────────────────────────────────────
router.get('/admin/all',
  authenticate, authorize('ADMIN', 'SUPER_ADMIN'),
  ctrl.getAdminAll
);

router.get('/:slug',   ctrl.getOne);

router.post('/',
  authenticate, authorize('ADMIN', 'SUPER_ADMIN'),
  ctrl.create
);

router.put('/:id',
  authenticate, authorize('ADMIN', 'SUPER_ADMIN'),
  ctrl.update
);

router.delete('/:id',
  authenticate, authorize('ADMIN', 'SUPER_ADMIN'),
  ctrl.remove
);

router.post('/:id/image',
  authenticate, authorize('ADMIN', 'SUPER_ADMIN'),
  uploadImage,
  ctrl.uploadCover
);

export default router;
