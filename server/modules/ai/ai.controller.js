import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse  from '../../utils/ApiResponse.js';
import * as aiService from './ai.service.js';

/**
 * POST /api/v1/ai/chat
 * Body: { messages: [{ role: 'user' | 'assistant', content: string }] }
 */
export const chat = asyncHandler(async (req, res) => {
  const data = await aiService.chatWithAssistant(req.body.messages);
  res.json(new ApiResponse(200, data, 'AI cavabı hazırdır.'));
});
