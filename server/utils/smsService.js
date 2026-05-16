/**
 * Provider-independent SMS service.
 * Switch providers by setting SMS_PROVIDER in .env:
 *   SMS_PROVIDER=twilio   → Twilio
 *   SMS_PROVIDER=custom   → any HTTP-based local AZ provider
 *   SMS_PROVIDER=console  → dev/test only (no real SMS)
 *
 * To add a new provider: add an entry to PROVIDERS below and set SMS_PROVIDER.
 */

const isDev = process.env.NODE_ENV === 'development';

// ── Console adapter (dev / fallback) ──────────────────────────────────────

const consoleProvider = async (phone, message) => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📱 SMS → ${phone}`);
  console.log(`   ${message}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  return { success: true };
};

// ── Twilio adapter ─────────────────────────────────────────────────────────

const twilioProvider = async (phone, message) => {
  const { default: twilio } = await import('twilio');
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
  const msg = await client.messages.create({
    body: message,
    from: process.env.TWILIO_FROM_NUMBER,
    to:   phone,
  });
  return { success: true, sid: msg.sid };
};

// ── Custom HTTP adapter (local AZ SMS providers) ────────────────────────────
// Set SMS_CUSTOM_URL, SMS_CUSTOM_API_KEY, SMS_CUSTOM_SENDER in .env

const customProvider = async (phone, message) => {
  const response = await fetch(process.env.SMS_CUSTOM_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.SMS_CUSTOM_API_KEY}`,
    },
    body: JSON.stringify({
      to:      phone,
      from:    process.env.SMS_CUSTOM_SENDER,
      message,
    }),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Custom SMS provider error: ${err}`);
  }
  return { success: true };
};

// ── Provider registry ──────────────────────────────────────────────────────

const PROVIDERS = {
  console: consoleProvider,
  twilio:  twilioProvider,
  custom:  customProvider,
};

// ── Public API ─────────────────────────────────────────────────────────────

export const sendSms = async (phone, message) => {
  const providerKey = process.env.SMS_PROVIDER || 'console';

  if (!isDev && providerKey === 'console') {
    throw new Error('SMS_PROVIDER must be set to "twilio" or "custom" in production.');
  }

  const provider = PROVIDERS[providerKey] || consoleProvider;

  try {
    return await provider(phone, message);
  } catch (error) {
    console.error(`[smsService] ${providerKey} failed:`, error.message);
    return { success: false, error: error.message };
  }
};

export const buildOtpMessage = (otp) =>
  `Aslan Medical Clinic - Doğrulama kodunuz: ${otp}. 5 dəqiqə ərzində etibarlıdır. Kodu heç kimlə paylaşmayın.`;
