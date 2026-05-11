import { Router } from 'express';
import * as notificationsController from './notifications.controller.js';
import authenticate from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

// /read-all before /:id/read to prevent param collision
router.get('/',              notificationsController.getNotifications);
router.patch('/read-all',    notificationsController.markAllAsRead);
router.patch('/:id/read',    notificationsController.markAsRead);
router.delete('/:id',        notificationsController.deleteNotification);

export default router;
