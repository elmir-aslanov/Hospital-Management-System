import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse  from '../../utils/ApiResponse.js';
import ApiError     from '../../utils/ApiError.js';
import { authLimiter } from '../../middleware/rateLimiter.middleware.js';
import * as ctrl from './ai.controller.js';

const router = Router();

/**
 * @swagger
 * /api/v1/ai/chat:
 *   post:
 *     summary: Chat with the Aslan Medical Center AI assistant
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - messages
 *             properties:
 *               messages:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: [user, assistant]
 *                     content:
 *                       type: string
 *                 example:
 *                   - role: user
 *                     content: "Randevu necə ala bilərəm?"
 *     responses:
 *       200:
 *         description: AI assistant response
 *       400:
 *         description: Invalid messages payload
 */
router.post('/chat', authLimiter, ctrl.chat);

const FALLBACK = (name) =>
  `Salam, ${name || 'hörmətli pasiyent'}! Hal-hazırda AI xidmətimizdə texniki problem yaranıb. ` +
  `Sualınız üçün +994 50 836 36 94 nömrəsinə zəng edə və ya info@aslanmedical.az ünvanına ` +
  `email göndərə bilərsiniz. Aslan Medical Clinic komandası sizə kömək etməkdən məmnun olar.`;

/**
 * @swagger
 * /api/v1/ai/medical-consult:
 *   post:
 *     summary: Get AI medical advice
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Baş ağrısı, qızdırma"
 *               name:
 *                 type: string
 *                 example: "Əli"
 *     responses:
 *       200:
 *         description: AI medical advice
 *       400:
 *         description: Message is missing or too long
 */
router.post('/medical-consult', authLimiter, asyncHandler(async (req, res) => {
  const { message, name } = req.body;

  if (!message || message.trim().length < 3) {
    throw new ApiError(400, 'Zəhmət olmasa sualınızı daxil edin.');
  }
  if (message.length > 1000) {
    throw new ApiError(400, 'Mesaj çox uzundur. Maksimum 1000 simvol.');
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey || apiKey === 'your_claude_api_key_here') {
    return res.status(200).json(new ApiResponse(200, {
      response: FALLBACK(name),
    }, 'Fallback cavab.'));
  }

  try {
    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 800,
      system: [
        `Sən Aslan Medical Clinic-in rəsmi AI tibbi köməkçisidir.`,
        `Adın: Aslan AI.`,
        `Dil: Yalnız Azərbaycan dilində cavab ver.`,
        `Ton: Professional, mehriban, aydın.`,
        `Qaydalar:`,
        `1. Dəqiq tibbi diaqnoz QOYMA.`,
        `2. Ümumi tibbi məlumat ver.`,
        `3. Həmişə həkimə müraciəti tövsiyə et.`,
        `4. Cavab 3-5 cümlə olsun.`,
        `5. Başlanğıc: "Salam, ${name || 'hörmətli pasiyent'}!"`,
        `6. Son cümlə: həmişə həkimə müraciət tövsiyəsi olsun.`,
        `7. Təcili vəziyyətdə: dərhal təcili yardım çağırmağı söylə.`,
        `Klinika: Aslan Medical Clinic, Bakı, +994 50 836 36 94.`,
      ].join(' '),
      messages: [{ role: 'user', content: message.trim() }],
    });

    const aiText = response.content[0]?.text ?? FALLBACK(name);

    console.log(`[AI] Consult — ${name || 'anon'}: "${message.substring(0, 60)}..."`);

    res.json(new ApiResponse(200, { response: aiText }, 'AI cavabı hazırdır.'));

  } catch (error) {
    console.error('[AI] Anthropic SDK error:', error.message);
    res.status(200).json(new ApiResponse(200, { response: FALLBACK(name) }));
  }
}));

export default router;
