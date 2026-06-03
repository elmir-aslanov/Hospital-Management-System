import { Router }   from 'express';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse  from '../../utils/ApiResponse.js';
import authenticate from '../../middleware/auth.middleware.js';
import * as svc     from './messages.service.js';

const router = Router();
router.use(authenticate);

router.get('/conversations', asyncHandler(async (req, res) => {
  const data = await svc.getConversations(req.user._id);
  res.json(new ApiResponse(200, data));
}));

router.get('/:userId', asyncHandler(async (req, res) => {
  const data = await svc.getConversation(req.user._id, req.params.userId, req.query.page, req.query.limit);
  res.json(new ApiResponse(200, data));
}));

router.post('/:userId', asyncHandler(async (req, res) => {
  const msg = await svc.sendMessage(req.user._id, req.params.userId, req.body.text);
  res.status(201).json(new ApiResponse(201, msg));
}));

router.patch('/:userId/read', asyncHandler(async (req, res) => {
  const { getConversationId } = await import('../../models/Message.model.js');
  const convId = getConversationId(req.user._id, req.params.userId);
  await svc.markRead(convId, req.user._id);
  res.json(new ApiResponse(200, null, 'Marked as read'));
}));

export default router;
