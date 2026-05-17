import nodemailer from 'nodemailer';

export const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ── Email OTP ──────────────────────────────────────────────────────────────

// Use EMAIL_* vars, fall back to SMTP_* vars (shared mail config)
const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com',
  port:   parseInt(process.env.EMAIL_PORT || process.env.SMTP_PORT || '587'),
  secure: (process.env.EMAIL_SECURE || process.env.SMTP_SECURE || 'false') === 'true',
  auth: {
    user: process.env.EMAIL_USER || process.env.SMTP_USER,
    pass: process.env.EMAIL_PASS || process.env.SMTP_PASS,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error('Email connection error:', error.message);
  } else {
    console.log('Email server ready ✅');
  }
});

export const sendEmailOTP = async (email, otp) => {
  try {
    await transporter.sendMail({
      from:    process.env.EMAIL_FROM || `Aslan Medical Clinic <${process.env.EMAIL_USER}>`,
      to:      email,
      subject: 'Aslan Medical Clinic — Doğrulama Kodu',
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
        <body style="margin:0;padding:0;background:#f0f4f8;font-family:Arial,sans-serif">
          <div style="max-width:520px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
            <div style="background:linear-gradient(135deg,#0a1628 0%,#00848e 100%);padding:32px;text-align:center">
              <h1 style="color:white;margin:0;font-size:24px;font-weight:800">Aslan Medical Clinic</h1>
              <p style="color:rgba(255,255,255,0.75);margin:8px 0 0;font-size:13px">Doğrulama Kodu</p>
            </div>
            <div style="padding:40px 36px">
              <p style="color:#2d3748;font-size:15px;line-height:1.7;margin:0 0 24px">
                Salam! Aslan Medical Clinic pasiyent portalına giriş üçün doğrulama kodunuz:
              </p>
              <div style="background:#f8fafc;border:2px dashed #00848e;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px">
                <div style="font-size:42px;font-weight:800;letter-spacing:8px;color:#00848e;font-family:monospace">${otp}</div>
                <p style="color:#718096;font-size:12px;margin:8px 0 0">Bu kod <strong>5 dəqiqə</strong> ərzində etibarlıdır</p>
              </div>
              <div style="background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.2);border-radius:8px;padding:12px 16px;margin:0 0 24px">
                <p style="color:#92400e;font-size:13px;margin:0">⚠️ Bu kodu heç kimlə paylaşmayın. Aslan Medical Clinic heç vaxt sizdən OTP kodu istəməz.</p>
              </div>
              <p style="color:#a0aec0;font-size:12px;margin:0;line-height:1.6">Əgər bu sorğunu siz göndərməmisinizsə, bu emaili nəzərə almayın.</p>
            </div>
            <div style="background:#f8fafc;padding:20px 36px;border-top:1px solid #e2e8f0;text-align:center">
              <p style="color:#a0aec0;font-size:12px;margin:0">© 2025 Aslan Medical Clinic · Bakı, Azərbaycan</p>
              <p style="color:#a0aec0;font-size:12px;margin:4px 0 0">📞 +994 50 836 36 94 · ✉️ info@aslanmedical.az</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error('Email OTP error:', error.message);
    return { success: false, error: error.message };
  }
};

// ── SMS OTP ────────────────────────────────────────────────────────────────

export const sendSmsOTP = async (phone, otp) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📱 SMS OTP for ${phone}: ${otp}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return { success: true };
  }

  try {
    const { default: twilio } = await import('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    await client.messages.create({
      body: `Aslan Medical Clinic - Kodunuz: ${otp}. 5 deqiqe erzinde istifade edin.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to:   phone,
    });
    return { success: true };
  } catch (error) {
    console.error('SMS OTP error:', error.message);
    return { success: false, error: error.message };
  }
};
