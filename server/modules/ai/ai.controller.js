import { randomUUID } from 'node:crypto';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse  from '../../utils/ApiResponse.js';
import logger from '../../utils/logger.js';
import * as aiService from './ai.service.js';

/**
 * POST /api/v1/ai/chat
 * Body: { messages: [{ role: 'user' | 'assistant', content: string }] }
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

const writeEvent = (res, event, data) => {
  if (!res.writableEnded) res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
};

export const streamChat = async (req, res, next) => {
  let streamStarted = false;
  try {
    const input = aiService.validateStreamingInput(req.body);
    const ownerKey = getOwnerKey(req, res);
    const abortController = new AbortController();
    req.on('aborted', () => abortController.abort());

    res.status(200);
    res.set({
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    res.flushHeaders();
    streamStarted = true;

    await aiService.streamAssistantResponse({
      ownerKey,
      input,
      signal: abortController.signal,
      emit: (event, data) => writeEvent(res, event, data),
    });
    res.end();
  } catch (error) {
    if (!streamStarted) return next(error);
    if (!res.writableEnded) {
      const code = error.code
        || (error.statusCode === 409 ? 'AI_BUSY' : error.statusCode === 400 ? 'AI_INVALID_REQUEST' : 'AI_UNAVAILABLE');
      logger.error(`[AI] stream error: ${error.message}`);
      writeEvent(res, 'error', { code });
      res.end();
    }
  }
};

export const reset = asyncHandler(async (req, res) => {
  aiService.resetStreamingConversation(getOwnerKey(req, res), req.body?.conversationId);
  res.json(new ApiResponse(200, {}, 'Conversation reset.'));
});
