import rateLimit from 'express-rate-limit';

// Global limiter applied to every request
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

// Stricter limiter for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
});

export const aiChatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id
    ? `user:${req.user.id}`
    : `anonymous:${req.cookies?.aslan_ai_session || req.socket.remoteAddress || 'unknown'}`,
  message: { success: false, code: 'AI_RATE_LIMITED', message: 'Too many AI requests. Please try again later.' },
});

// Public lab result lookup — limit guessing of protocol/FIN combinations
export const labLookupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Çox sayda cəhd. Zəhmət olmasa bir az sonra yenidən cəhd edin.' },
});
