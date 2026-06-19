import Anthropic from '@anthropic-ai/sdk';
import ApiError  from '../../utils/ApiError.js';
import logger    from '../../utils/logger.js';

// Exact system prompt — do not change.
const SYSTEM_PROMPT =
  'Sən Aslan Medical Center-in AI köməkçisisən. Həmişə Azərbaycan ' +
  'dilində cavab ver. Yalnız aşağıdakı mövzularda kömək et: həkimlər, ' +
  'şöbələr, randevu almaq, iş saatları, ünvan, xidmətlər. Diaqnoz ' +
  'qoyma, dərman təyin etmə. Təcili tibbi vəziyyətdə həmişə 112 zəng ' +
  'etməyi tövsiyə et. Cavabları qısa və aydın ver.';

const FALLBACK_RESPONSE =
  'Hal-hazırda AI xidmətimizdə texniki problem yaranıb. Zəhmət olmasa ' +
  '+994 50 836 36 94 nömrəsinə zəng edin və ya info@aslanmedical.az ' +
  'ünvanına yazın.';

const VALID_ROLES = ['user', 'assistant'];
const MAX_MESSAGES = 30;
const MAX_MESSAGE_LENGTH = 2000;

const validateMessages = (messages) => {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new ApiError(400, 'Mesaj siyahısı tələb olunur.');
  }
  if (messages.length > MAX_MESSAGES) {
    throw new ApiError(400, 'Söhbət tarixçəsi çox uzundur.');
  }

  return messages.map((m) => {
    const role = m?.role;
    const content = String(m?.content ?? '').trim();
    if (!VALID_ROLES.includes(role)) {
      throw new ApiError(400, "Mesaj formatı düzgün deyil. 'role' yalnız 'user' və ya 'assistant' ola bilər.");
    }
    if (!content) throw new ApiError(400, 'Mesaj mətni boş ola bilməz.');
    if (content.length > MAX_MESSAGE_LENGTH) {
      throw new ApiError(400, `Mesaj çox uzundur. Maksimum ${MAX_MESSAGE_LENGTH} simvol.`);
    }
    return { role, content };
  });
};

export const chatWithAssistant = async (messages) => {
  const cleanMessages = validateMessages(messages);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === 'your_claude_api_key_here') {
    return { response: FALLBACK_RESPONSE };
  }

  try {
    const client = new Anthropic({ apiKey });

    const completion = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: cleanMessages,
    });

    const text = completion.content?.[0]?.text ?? FALLBACK_RESPONSE;
    return { response: text };
  } catch (err) {
    logger.error(`[AI] chat error: ${err.message}`);
    return { response: FALLBACK_RESPONSE };
  }
};
