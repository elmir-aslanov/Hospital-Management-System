import { randomUUID } from 'node:crypto';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse  from '../../utils/ApiResponse.js';
import * as aiService from './ai.service.js';

/**
 * POST /api/v1/ai/chat
 * Body: { message, locale, conversationId?, pageContext? }
 */
const SESSION_COOKIE = 'aslan_ai_session';

const getOwnerKey = (req, res) => {
  if (req.user?.id) return `user:${req.user.id}`;
  let sessionId = req.cookies?.[SESSION_COOKIE];
  if (!/^[a-f0-9-]{36}$/i.test(sessionId || '')) {
    sessionId = randomUUID();
    res.cookie(SESSION_COOKIE, sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/api/v1/ai',
    });
  }
  return `anonymous:${sessionId}`;
};

export const chat = async (req, res, next) => {
  try {
    const input = aiService.validateChatInput(req.body);
    const ownerKey = getOwnerKey(req, res);
    const abortController = new AbortController();
    req.on('aborted', () => abortController.abort());

    const result = await aiService.getAssistantResponse({
      ownerKey,
      input,
      signal: abortController.signal,
    });
    if (!res.writableEnded) {
      res.json(new ApiResponse(200, result, 'AI response is ready.'));
    }
  } catch (error) {
    if (req.aborted || res.writableEnded) return;
    next(error);
  }
};

export const reset = asyncHandler(async (req, res) => {
  aiService.resetConversation(getOwnerKey(req, res), req.body?.conversationId);
  res.json(new ApiResponse(200, {}, 'Conversation reset.'));
});
