export const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const sendOTP = async (phone, otp) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📱 OTP for ${phone}: ${otp}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return { success: true };
  }

  // Production: send real SMS via Twilio
  try {
    const { default: twilio } = await import('twilio');
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    await client.messages.create({
      body: `Aslan Medical Clinic - Doğrulama kodunuz: ${otp}. 5 dəqiqə ərzində istifadə edin.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });
    return { success: true };
  } catch (error) {
    console.error('SMS send error:', error.message);
    return { success: false, error: error.message };
  }
};
