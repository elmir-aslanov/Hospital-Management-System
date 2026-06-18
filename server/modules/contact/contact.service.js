import { resolveMx } from 'dns/promises';
import mongoose       from 'mongoose';
import ContactMessage from '../../models/ContactMessage.model.js';
import PriceList      from '../../models/PriceList.model.js';
import ApiError       from '../../utils/ApiError.js';
import { createNotification } from '../notifications/notifications.service.js';
import User      from '../../models/User.model.js';
import sendEmail from '../../utils/sendEmail.js';

// ── helpers ──────────────────────────────────────────────────────────────────

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
  <p style="font-size:15px;font-weight:700;color:#071B3B;margin:0 0 16px;">Yeni Müraciət</p>
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

  // Per-email rate limit: max 5 submissions per hour
  const recentCount = await ContactMessage.countDocuments({
    email:     normalizedEmail,
    createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) },
  });
  if (recentCount >= 5) {
    throw new ApiError(429, 'Bu e-poçtdan həddindən artıq müraciət gəldi. Bir az sonra cəhd edin.');
  }

  const displayName = fullName.trim();

  const contactMsg = await ContactMessage.create({
    fullName:          displayName,
    name:              displayName,
    email:             normalizedEmail,
    message:           message.trim(),
    consentAccepted:   !!consentAccepted,
    consentAcceptedAt: consentAccepted ? new Date() : undefined,
  });

  // Notify admins in-app (fire-and-forget)
  try {
    const admins = await User.find({ role: { $in: ['ADMIN', 'SUPER_ADMIN', 'RECEPTIONIST'] }, isActive: true }).select('_id');
    await Promise.all(admins.map(a => createNotification({
      userId:  a._id,
      title:   'Yeni müraciət',
      message: `${displayName} tərəfindən yeni müraciət daxil oldu.`,
      type:    'general',
      link:    '/admin/muraciet',
    })));
  } catch (_) {}

  // Email admin inbox (fire-and-forget)
  try {
    const adminEmail = process.env.SMTP_ADMIN_INBOX || process.env.SMTP_USER;
    if (adminEmail) {
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5174';
      await sendEmail({
        to:      adminEmail,
        subject: `Yeni müraciət: ${displayName}`,
        html:    adminNotificationHtml({ fullName: displayName, email: normalizedEmail, message: message.trim(), clientUrl }),
      });
    }
  } catch (_) {}

  return { id: contactMsg._id };
};

export const submitHomeService = async ({ fullName, phone, email, address, preferredDate, preferredTimeRange, note, consentAccepted, priceListId }) => {
  if (!mongoose.Types.ObjectId.isValid(priceListId)) throw new ApiError(400, 'Yanlış xidmət identifikatoru.');

  const test = await PriceList.findOne({ _id: priceListId, isActive: true });
  if (!test) throw new ApiError(404, 'Test tapılmadı.');
  if (!test.homeServiceAvailable) throw new ApiError(400, 'Bu test üçün ev xidməti mövcud deyil.');

  const normalizedEmail = email?.trim() ? email.trim().toLowerCase() : '';
  const normalizedPhone = phone.trim();

  // Per-contact rate limit: max 5 home-service requests per hour (by phone, and by email if given)
  const recentCount = await ContactMessage.countDocuments({
    requestType: 'home_service',
    createdAt:   { $gte: new Date(Date.now() - 60 * 60 * 1000) },
    $or: [
      { phone: normalizedPhone },
      ...(normalizedEmail ? [{ email: normalizedEmail }] : []),
    ],
  });
  if (recentCount >= 5) {
    throw new ApiError(429, 'Həddindən artıq müraciət göndərildi. Bir az sonra cəhd edin.');
  }

  const displayName = fullName.trim();

  const contactMsg = await ContactMessage.create({
    fullName:           displayName,
    name:                displayName,
    email:               normalizedEmail,
    phone:               normalizedPhone,
    address:             address.trim(),
    preferredDate:       preferredDate ? new Date(preferredDate) : null,
    preferredTimeRange:  preferredTimeRange?.trim() || '',
    message:             note?.trim() || '',
    requestType:         'home_service',
    consentAccepted:     !!consentAccepted,
    consentAcceptedAt:   consentAccepted ? new Date() : undefined,
    service: {
      priceListId: test._id,
      name:        test.name,
      code:        test.serviceCode || '',
      price:       test.price,
      currency:    test.currency || 'AZN',
    },
  });

  // Notify admins in-app (fire-and-forget)
  try {
    const admins = await User.find({ role: { $in: ['ADMIN', 'SUPER_ADMIN', 'RECEPTIONIST'] }, isActive: true }).select('_id');
    await Promise.all(admins.map(a => createNotification({
      userId:  a._id,
      title:   'Yeni ev xidməti müraciəti',
      message: `${displayName} "${test.name}" testi üçün ev xidməti sifariş etdi.`,
      type:    'general',
      link:    '/admin/muraciet',
    })));
  } catch (_) {}

  // Email admin inbox (fire-and-forget)
  try {
    const adminEmail = process.env.SMTP_ADMIN_INBOX || process.env.SMTP_USER;
    if (adminEmail) {
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5174';
      const summary = [
        `Test: ${test.name} (${test.serviceCode || '—'})`,
        `Qiymət: ${test.price} ${test.currency || 'AZN'}`,
        `Telefon: ${normalizedPhone}`,
        `Ünvan: ${address.trim()}`,
        preferredDate       ? `Tarix: ${new Date(preferredDate).toLocaleDateString('az-AZ')}` : null,
        preferredTimeRange  ? `Vaxt aralığı: ${preferredTimeRange.trim()}` : null,
        note?.trim()        ? `Qeyd: ${note.trim()}` : null,
      ].filter(Boolean).join('\n');
      await sendEmail({
        to:      adminEmail,
        subject: `Yeni ev xidməti müraciəti: ${displayName}`,
        html:    adminNotificationHtml({ fullName: displayName, email: normalizedEmail || '—', message: summary, clientUrl }),
      });
    }
  } catch (_) {}

  return { id: contactMsg._id };
};

export const getAll = ({ status } = {}) => {
  const filter = {};
  if (status) filter.status = status;
  return ContactMessage
    .find(filter)
    .populate('replies.repliedBy', 'fullName email')
    .sort({ createdAt: -1 })
    .lean();
};

export const markRead = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, 'Etibarsız ID');
  const doc = await ContactMessage.findByIdAndUpdate(id, { status: 'read' }, { new: true });
  if (!doc) throw new ApiError(404, 'Message not found');
  return doc;
};

export const markReplied = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, 'Etibarsız ID');
  const doc = await ContactMessage.findByIdAndUpdate(id, { status: 'replied' }, { new: true });
  if (!doc) throw new ApiError(404, 'Message not found');
  return doc;
};

export const updateStatus = async (id, status) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, 'Etibarsız ID');
  if (!['new', 'read', 'replied'].includes(status)) throw new ApiError(400, 'Yanlış status.');
  const doc = await ContactMessage.findByIdAndUpdate(id, { status }, { new: true });
  if (!doc) throw new ApiError(404, 'Message not found');
  return doc;
};

export const sendReply = async (id, { subject, message, adminUser }) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, 'Etibarsız ID');
  if (!message?.trim())             throw new ApiError(400, 'Mesaj boş ola bilməz.');
  if (message.trim().length > 5000) throw new ApiError(400, 'Mesaj çox uzundur (maks. 5000 simvol).');

  const contact = await ContactMessage.findById(id);
  if (!contact) throw new ApiError(404, 'Müraciət tapılmadı.');

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
