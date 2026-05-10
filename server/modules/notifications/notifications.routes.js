import { Router } from 'express';
import * as notificationsController from './notifications.controller.js';
import authenticate from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', notificationsController.getMyNotifications);
router.patch('/mark-read', notificationsController.markAllRead);

export default router;
