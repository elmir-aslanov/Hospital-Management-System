import crypto         from 'crypto';
import { resolveMx } from 'dns/promises';
import mongoose       from 'mongoose';
import ContactMessage from '../../models/ContactMessage.model.js';
import ApiError       from '../../utils/ApiError.js';
import { createNotification } from '../notifications/notifications.service.js';
import User      from '../../models/User.model.js';
import sendEmail from '../../utils/sendEmail.js';

// ── helpers ──────────────────────────────────────────────────────────────────

const generateToken = () => {
  const raw  = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  return { raw, hash };
};

const hashToken = (raw) =>
  crypto.createHash('sha256').update(String(raw)).digest('hex');

const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('DNS timeout')), ms),
    ),
  ]);

const checkMxRecord = async (email) => {
  try {
    const domain  = email.split('@')[1];
    if (!domain) return false;
    const records = await withTimeout(resolveMx(domain), 5000);
    return Array.isArray(records) && records.length > 0;
  } catch {
    return true; // allow when DNS is unreachable
  }
};

const he = (str) =>
  String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const year = () => new Date().getFullYear();

// ── Email templates ───────────────────────────────────────────────────────────

const verificationHtml = ({ fullName, token, serverUrl }) => {
  const link = `${serverUrl}/api/v1/contact/verify-email?token=${token}`;
  return `<!DOCTYPE html>
<html lang="az">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>E-poçt Təsdiqləmə — Aslan Medical Center</title></head>
<body style="margin:0;padding:0;background:#f5f8fa;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f8fa;padding:32px 0;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08);">
<tr><td style="background:#071B3B;padding:28px 40px;text-align:center;">
  <div style="font-size:22px;font-weight:800;color:#fff;letter-spacing:.05em;">ASLAN MEDICAL CENTER</div>
  <div style="font-size:11px;color:#55C3CB;letter-spacing:.18em;margin-top:4px;">MÜASIR TİBBİ MƏRKƏZ</div>
</td></tr>
<tr><td style="padding:40px 40px 32px;">
  <p style="font-size:16px;font-weight:600;color:#071B3B;margin:0 0 12px;">Hörmətli ${he(fullName)},</p>
  <p style="font-size:14px;color:#4b5563;line-height:1.7;margin:0 0 24px;">
    Aslan Medical Center-ə müraciətiniz qəbul edildi. Mesajınızın göndərilməsini tamamlamaq üçün e-poçt ünvanınızı təsdiqləyin.
  </p>
  <div style="text-align:center;margin:28px 0;">
    <a href="${link}" style="display:inline-block;background:#00848e;color:#fff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 36px;border-radius:8px;letter-spacing:.04em;">E-poçtu Təsdiqlə</a>
  </div>
  <p style="font-size:12px;color:#9ca3af;line-height:1.6;margin:0 0 8px;">Bu link <strong>30 dəqiqə</strong> ərzində etibarlıdır. Link işləmirsə, aşağıdakı ünvanı brauzerinizə kopyalayın:</p>
  <div style="background:#f3f4f6;border-radius:6px;padding:10px 14px;font-size:11px;color:#6b7280;word-break:break-all;">${link}</div>
  <p style="font-size:12px;color:#9ca3af;margin:20px 0 0;">Əgər bu müraciəti siz etməmisinizsə, bu emaili nəzərə almayın.</p>
</td></tr>
<tr><td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
  <p style="font-size:11px;color:#9ca3af;margin:0;">© ${year()} Aslan Medical Center. Bütün hüquqlar qorunur.</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
};

const adminNotificationHtml = ({ fullName, email, message, clientUrl }) => `<!DOCTYPE html>
<html lang="az">
<head><meta charset="UTF-8"><title>Yeni Müraciət — Aslan Medical Center</title></head>
<body style="margin:0;padding:0;background:#f5f8fa;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f8fa;padding:32px 0;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;">
<tr><td style="background:#071B3B;padding:24px 40px;text-align:center;">
  <div style="font-size:18px;font-weight:800;color:#fff;">ASLAN MEDICAL CENTER — Admin</div>
</td></tr>
<tr><td style="padding:32px 40px;">
  <p style="font-size:15px;font-weight:700;color:#071B3B;margin:0 0 16px;">Yeni Doğrulanmış Müraciət</p>
  <table cellpadding="0" cellspacing="0" width="100%">
    <tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:12px;color:#94a3b8;">Ad Soyad</td><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;text-align:right;font-size:13px;font-weight:600;color:#334155;">${he(fullName)}</td></tr>
    <tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:12px;color:#94a3b8;">E-poçt</td><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;text-align:right;font-size:13px;font-weight:600;color:#334155;">${he(email)}</td></tr>
  </table>
  <div style="margin-top:20px;background:#f8fafc;border-radius:8px;padding:16px;font-size:13px;color:#334155;line-height:1.65;">${he(message)}</div>
  <div style="text-align:center;margin-top:24px;">
    <a href="${clientUrl}/admin/muraciet" style="display:inline-block;background:#00848e;color:#fff;text-decoration:none;font-size:13px;font-weight:700;padding:12px 28px;border-radius:8px;">Admin Panelə Keç</a>
  </div>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

const replyHtml = ({ recipientName, message }) => `<!DOCTYPE html>
<html lang="az">
<head><meta charset="UTF-8"><title>Cavab — Aslan Medical Center</title></head>
<body style="margin:0;padding:0;background:#f5f8fa;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f8fa;padding:32px 0;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08);">
<tr><td style="background:#071B3B;padding:28px 40px;text-align:center;">
  <div style="font-size:20px;font-weight:800;color:#fff;letter-spacing:.05em;">ASLAN MEDICAL CENTER</div>
</td></tr>
<tr><td style="padding:36px 40px;">
  <p style="font-size:15px;font-weight:600;color:#071B3B;margin:0 0 8px;">Hörmətli ${he(recipientName)},</p>
  <p style="font-size:13px;color:#6b7280;margin:0 0 24px;">Müraciətinizə cavab göndəririk.</p>
  <div style="background:#f8fafc;border-left:3px solid #00848e;border-radius:0 8px 8px 0;padding:16px 20px;font-size:14px;color:#334155;line-height:1.7;white-space:pre-wrap;">${he(message)}</div>
  <p style="font-size:12px;color:#9ca3af;margin:24px 0 0;line-height:1.6;">Suallarınız varsa, bizimlə əlaqə saxlayın.</p>
</td></tr>
<tr><td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
  <p style="font-size:11px;color:#9ca3af;margin:0;">© ${year()} Aslan Medical Center. Bütün hüquqlar qorunur.</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

// ── Service functions ─────────────────────────────────────────────────────────

export const submit = async ({ fullName, email, message, consentAccepted }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const hasMx = await checkMxRecord(normalizedEmail);
  if (!hasMx) throw new ApiError(400, 'E-poçt ünvanı etibarlı görünmür. Zəhmət olmasa doğru bir ünvan daxil edin.');

  // Per-email rate limit: max 3 unverified in last hour
  const recentCount = await ContactMessage.countDocuments({
    email:         normalizedEmail,
    emailVerified: false,
    createdAt:     { $gte: new Date(Date.now() - 60 * 60 * 1000) },
  });
  if (recentCount >= 3) {
    throw new ApiError(429, 'Bu e-poçtdan həddindən artıq müraciət gəldi. Bir az sonra cəhd edin.');
  }

  const { raw: verRaw, hash: verHash }   = generateToken();
  const { raw: mgtRaw, hash: mgtHash }   = generateToken();
  const verExpiresAt = new Date(Date.now() + 30 * 60 * 1000);  // 30 min
  const mgtExpiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
  const displayName  = fullName.trim();

  const serverUrl = process.env.SERVER_PUBLIC_URL || 'http://localhost:5000';

  // SMTP first — don't persist record if email cannot be sent
  let deliveryStatus = 'pending';
  const contactMsg = await ContactMessage.create({
    fullName:                        displayName,
    name:                            displayName,
    email:                           normalizedEmail,
    message:                         message.trim(),
    consentAccepted:                 !!consentAccepted,
    consentAcceptedAt:               consentAccepted ? new Date() : undefined,
    emailVerified:                   false,
    emailVerificationTokenHash:      verHash,
    emailVerificationExpiresAt:      verExpiresAt,
    verificationEmailDeliveryStatus: 'pending',
    managementTokenHash:             mgtHash,
    managementTokenExpiresAt:        mgtExpiresAt,
  });

  const sentAt = new Date();
  try {
    await sendEmail({
      to:      normalizedEmail,
      subject: 'Aslan Medical Center — E-poçt Təsdiqləmə',
      html:    verificationHtml({ fullName: displayName, token: verRaw, serverUrl }),
    });
    deliveryStatus = 'sent';
  } catch {
    deliveryStatus = 'failed';
  }

  await ContactMessage.updateOne({ _id: contactMsg._id }, {
    verificationEmailSentAt:         sentAt,
    verificationEmailDeliveryStatus: deliveryStatus,
  });

  return {
    id:              contactMsg._id,
    sentAt:          sentAt.toISOString(),
    managementToken: mgtRaw,
    email:           normalizedEmail,
  };
};

export const verifyEmail = async (rawToken) => {
  if (!rawToken) throw new ApiError(400, 'Token tələb olunur.');

  const hash = hashToken(rawToken);
  const msg  = await ContactMessage.findOne({ emailVerificationTokenHash: hash });

  if (!msg)             throw new ApiError(400, 'Token etibarsızdır.');
  if (msg.emailVerified) throw new ApiError(400, 'already-used');
  if (msg.emailVerificationExpiresAt < new Date()) throw new ApiError(400, 'expired');

  await ContactMessage.updateOne({ _id: msg._id }, {
    $set: {
      emailVerified:               true,
      emailVerifiedAt:             new Date(),
      status:                      'new',
      emailVerificationTokenHash:  '',
      managementTokenHash:         '', // invalidate management token after verification
      managementTokenExpiresAt:    null,
    },
  });

  // In-app notification
  try {
    const admins = await User.find({ role: { $in: ['ADMIN', 'SUPER_ADMIN', 'RECEPTIONIST'] }, isActive: true }).select('_id');
    await Promise.all(admins.map(a => createNotification({
      userId:  a._id,
      title:   'Yeni doğrulanmış müraciət',
      message: `${msg.fullName || msg.name || 'Naməlum'} tərəfindən yeni müraciət daxil oldu.`,
      type:    'general',
      link:    '/admin/muraciet',
    })));
  } catch (_) {}

  // Email notification to admin inbox
  try {
    const adminEmail = process.env.SMTP_ADMIN_INBOX || process.env.SMTP_USER;
    if (adminEmail) {
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5174';
      await sendEmail({
        to:      adminEmail,
        subject: `Yeni müraciət: ${msg.fullName || msg.name}`,
        html:    adminNotificationHtml({ fullName: msg.fullName || msg.name, email: msg.email, message: msg.message, clientUrl }),
      });
    }
  } catch (_) {}

  return msg;
};

export const resendVerification = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();

  const msg = await ContactMessage.findOne({ email: normalizedEmail, emailVerified: false }).sort({ createdAt: -1 });

  // Generic — don't reveal whether email exists
  if (!msg) return { sentAt: new Date().toISOString() };

  const now = Date.now();
  const lastSentMs = msg.verificationEmailSentAt?.getTime() || 0;

  // 60-second cooldown
  if (lastSentMs && now - lastSentMs < 60_000) {
    const retryAfter = Math.ceil((60_000 - (now - lastSentMs)) / 1000);
    const err = new ApiError(429, 'Yenidən göndərməzdən əvvəl bir az gözləyin.');
    err.retryAfter = retryAfter;
    throw err;
  }

  const windowStartMs = msg.resendWindowStart?.getTime() || 0;

  // 3 per 30-minute window
  if (windowStartMs && now - windowStartMs < 30 * 60_000 && msg.resendCount >= 3) {
    const retryAfter = Math.ceil((30 * 60_000 - (now - windowStartMs)) / 1000);
    const err = new ApiError(429, 'Qısa müddətdə həddindən artıq cəhd. Daha sonra yenidən cəhd edin.');
    err.retryAfter = retryAfter;
    throw err;
  }

  // 5 total per 24 hours (cumulative, lifetime of this record)
  if (msg.resendCount >= 5) {
    const err = new ApiError(429, 'Günlük yenidən göndərmə limiti dolub. Sabah yenidən cəhd edin.');
    err.retryAfter = 86400;
    throw err;
  }

  // Generate new token (replaces old — old link becomes invalid)
  const { raw, hash } = generateToken();
  const expiresAt     = new Date(Date.now() + 30 * 60 * 1000);
  const sentAt        = new Date();

  const serverUrl = process.env.SERVER_PUBLIC_URL || 'http://localhost:5000';
  const displayName = msg.fullName || msg.name || '';

  // SMTP first — only update DB if email succeeds (preserves old token on failure)
  try {
    await sendEmail({
      to:      normalizedEmail,
      subject: 'Aslan Medical Center — E-poçt Təsdiqləmə (Yenidən)',
      html:    verificationHtml({ fullName: displayName, token: raw, serverUrl }),
    });
  } catch {
    // Don't update anything — old token stays valid
    throw new ApiError(502, 'E-poçt göndərilmədi. Bir az sonra yenidən cəhd edin.');
  }

  const isNewWindow = !windowStartMs || (now - windowStartMs >= 30 * 60_000);
  await ContactMessage.updateOne({ _id: msg._id }, {
    $set: {
      emailVerificationTokenHash:      hash,
      emailVerificationExpiresAt:      expiresAt,
      verificationEmailSentAt:         sentAt,
      verificationEmailDeliveryStatus: 'sent',
      resendCount:       isNewWindow ? 1 : msg.resendCount + 1,
      resendWindowStart: isNewWindow ? sentAt : msg.resendWindowStart,
    },
  });

  return { sentAt: sentAt.toISOString() };
};

export const changeEmail = async ({ id, email, managementToken }) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, 'Etibarsız ID.');
  if (!email?.trim())          throw new ApiError(400, 'E-poçt tələb olunur.');
  if (!managementToken?.trim()) throw new ApiError(400, 'İdarəetmə tokeni tələb olunur.');

  const normalizedEmail = email.trim().toLowerCase();
  const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRx.test(normalizedEmail)) throw new ApiError(400, 'E-poçt formatı düzgün deyil.');

  const mgtHash = hashToken(managementToken);
  const msg = await ContactMessage.findById(id);

  if (!msg) throw new ApiError(404, 'Müraciət tapılmadı.');
  if (msg.emailVerified) throw new ApiError(400, 'E-poçt artıq doğrulanıb. Dəyişiklik mümkün deyil.');
  if (!msg.managementTokenHash || msg.managementTokenHash !== mgtHash) {
    throw new ApiError(403, 'Token etibarsızdır.');
  }
  if (!msg.managementTokenExpiresAt || msg.managementTokenExpiresAt < new Date()) {
    throw new ApiError(403, 'Token müddəti bitib.');
  }
  if (normalizedEmail === msg.email) {
    throw new ApiError(400, 'Yeni e-poçt mövcud e-poçt ünvanı ilə eynidir.');
  }

  // MX check on new email
  const hasMx = await checkMxRecord(normalizedEmail);
  if (!hasMx) throw new ApiError(400, 'E-poçt ünvanı etibarlı görünmür.');

  // Generate new verification token for the new email
  const { raw, hash } = generateToken();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
  const sentAt    = new Date();
  const serverUrl = process.env.SERVER_PUBLIC_URL || 'http://localhost:5000';
  const displayName = msg.fullName || msg.name || '';

  // SMTP first — don't update email in DB until we know mail was sent
  try {
    await sendEmail({
      to:      normalizedEmail,
      subject: 'Aslan Medical Center — E-poçt Təsdiqləmə',
      html:    verificationHtml({ fullName: displayName, token: raw, serverUrl }),
    });
  } catch {
    throw new ApiError(502, 'E-poçt göndərilmədi. Bir az sonra yenidən cəhd edin.');
  }

  await ContactMessage.updateOne({ _id: msg._id }, {
    $set: {
      email:                           normalizedEmail,
      emailVerificationTokenHash:      hash,
      emailVerificationExpiresAt:      expiresAt,
      verificationEmailSentAt:         sentAt,
      verificationEmailDeliveryStatus: 'sent',
      resendCount:                     0,
      resendWindowStart:               null,
    },
  });

  return { sentAt: sentAt.toISOString(), email: normalizedEmail };
};

export const getAll = ({ status } = {}) => {
  const filter = { emailVerified: true };
  if (status) filter.status = status;
  return ContactMessage
    .find(filter)
    .select('-emailVerificationTokenHash -managementTokenHash')
    .populate('replies.repliedBy', 'fullName email')
    .sort({ createdAt: -1 })
    .lean();
};

export const markRead = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, 'Etibarsız ID');
  const doc = await ContactMessage.findByIdAndUpdate(id, { status: 'read' }, { new: true })
    .select('-emailVerificationTokenHash -managementTokenHash');
  if (!doc) throw new ApiError(404, 'Message not found');
  return doc;
};

export const markReplied = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, 'Etibarsız ID');
  const doc = await ContactMessage.findByIdAndUpdate(id, { status: 'replied' }, { new: true })
    .select('-emailVerificationTokenHash -managementTokenHash');
  if (!doc) throw new ApiError(404, 'Message not found');
  return doc;
};

export const sendReply = async (id, { subject, message, adminUser }) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, 'Etibarsız ID');
  if (!message?.trim())              throw new ApiError(400, 'Mesaj boş ola bilməz.');
  if (message.trim().length > 5000)  throw new ApiError(400, 'Mesaj çox uzundur (maks. 5000 simvol).');

  const contact = await ContactMessage.findById(id)
    .select('-emailVerificationTokenHash -managementTokenHash');
  if (!contact)              throw new ApiError(404, 'Müraciət tapılmadı.');
  if (!contact.emailVerified) throw new ApiError(400, 'Bu müraciətin e-poçtu doğrulanmayıb.');

  const replySubject = subject?.trim() || 'Müraciətinizə cavab — Aslan Medical Center';
  const replyEntry   = {
    subject:        replySubject,
    message:        message.trim(),
    repliedBy:      adminUser._id,
    repliedAt:      new Date(),
    deliveryStatus: 'failed',
  };

  try {
    const info = await sendEmail({
      to:      contact.email,
      subject: replySubject,
      html:    replyHtml({ recipientName: contact.fullName || contact.name, message: message.trim() }),
    });
    replyEntry.deliveryStatus = 'sent';
    if (info?.messageId) replyEntry.emailMessageId = info.messageId;
  } catch (err) {
    replyEntry.deliveryError = err.message?.slice(0, 200) || 'Unknown error';
    contact.replies.push(replyEntry);
    await contact.save();
    throw new ApiError(502, `E-poçt göndərilmədi: ${err.message}`);
  }

  contact.replies.push(replyEntry);
  contact.status = 'replied';
  await contact.save();
  return contact;
};

export const remove = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, 'Etibarsız ID');
  const doc = await ContactMessage.findByIdAndDelete(id);
  if (!doc) throw new ApiError(404, 'Message not found');
};
