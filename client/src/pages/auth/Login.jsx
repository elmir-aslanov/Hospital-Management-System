/* eslint-disable */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { requestOtp, verifyOtp } from '../../api/authApi';
import OTPInput from '../../components/ui/OTPInput';

const FONT = "'Source Sans 3', 'Raleway', sans-serif";
const TEAL = '#00848e';

function roleToRoute(role = '') {
  switch (role.toUpperCase()) {
    case 'PATIENT':                              return '/patient';
    case 'ADMIN': case 'SUPER_ADMIN':            return '/dashboard';
    case 'DOCTOR':                               return '/dashboard';
    case 'NURSE': case 'RECEPTIONIST':
    case 'LAB_TECHNICIAN':                       return '/dashboard';
    default:                                     return '/';
  }
}

const inputBase = {
  width: '100%', padding: '13px 16px',
  border: '1.5px solid #e2e8f0', borderRadius: '10px',
  fontSize: '15px', fontFamily: FONT, color: '#1a2b4a',
  background: '#fff', outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.18s, box-shadow 0.18s',
};

function focusIn(e) {
  e.target.style.borderColor = TEAL;
  e.target.style.boxShadow = '0 0 0 3px rgba(0,132,142,0.1)';
}
function focusOut(e) {
  e.target.style.borderColor = '#e2e8f0';
  e.target.style.boxShadow = 'none';
}

const FEATURES = null; // replaced by t() in component

export default function Login() {
  const navigate   = useNavigate();
  const { t }      = useTranslation();

  // OTP flow state
  const [step,       setStep]       = useState('input'); // 'input' | 'otp'
  const [otpMethod,  setOtpMethod]  = useState('phone'); // 'phone' | 'email'
  const [phone,      setPhone]      = useState('');
  const [email,      setEmail]      = useState('');
  const [otpError,   setOtpError]   = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [devOtp,     setDevOtp]     = useState('');

  const getPayload = () => otpMethod === 'phone'
    ? { type: 'phone', phone: '+994' + phone.replace(/\D/g, '') }
    : { type: 'email', email: email.trim() };

  const handleSendOTP = async () => {
    if (otpMethod === 'phone' && phone.replace(/\D/g, '').length !== 9) {
      toast.warning('9 rəqəmli nömrə daxil edin. (Məsələn: 50 836 36 94)');
      return;
    }
    if (otpMethod === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.warning('Düzgün email ünvanı daxil edin.');
      return;
    }
    const id = toast.loading('Kod göndərilir...');
    try {
      const result = await requestOtp(getPayload());
      toast.dismiss(id);
      if (result.devCode) {
        setDevOtp(result.devCode);
        toast.info(`DEV — Kod: ${result.devCode}`, { duration: 30000 });
      } else {
        const dest = otpMethod === 'phone' ? 'telefon nömrənizə' : 'email ünvanınıza';
        toast.success(`OTP kodu ${dest} göndərildi!`);
      }
      setStep('otp');
    } catch (err) {
      toast.dismiss(id);
      toast.error(err.response?.data?.message || 'Kod göndərilmədi. Yenidən cəhd edin.');
    }
  };

  const handleVerifyOTP = async (code) => {
    setOtpLoading(true);
    setOtpError('');
    try {
      const result = await verifyOtp({ ...getPayload(), code });
      localStorage.setItem('token', result.accessToken);
      localStorage.setItem('user', JSON.stringify(result.user));
      window.dispatchEvent(new Event('storage'));
      toast.success(`Xoş gəldiniz, ${result.user.fullName || 'Pasiyent'}!`);
      navigate('/patient');
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Kod yanlışdır və ya müddəti bitib.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      const result = await requestOtp(getPayload());
      if (result.devCode) setDevOtp(result.devCode);
      toast.success('Yeni kod göndərildi.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xəta baş verdi.');
    }
  };

  const resetToInput = () => {
    setStep('input');
    setOtpError('');
    setDevOtp('');
  };

  return (
    <>
      <div style={{
        height: '100vh',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        overflow: 'hidden',
        fontFamily: FONT,
      }}>

        {/* ══ LEFT — Visual side ══════════════════════════ */}
        <div className="login-left" style={{
          background: 'linear-gradient(145deg, #0a1628 0%, #00848e 100%)',
          padding: '48px 52px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          height: '100vh',
          boxSizing: 'border-box',
        }}>
          {/* Decorative circles */}
          <div style={{
            position: 'absolute', top: '-80px', right: '-80px',
            width: '320px', height: '320px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)', pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: '-60px', left: '-60px',
            width: '240px', height: '240px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)', pointerEvents: 'none',
          }} />

          {/* Back to homepage */}
          <div
            onClick={() => navigate('/')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'rgba(255,255,255,0.6)',
              fontSize: '13px',
              cursor: 'pointer',
              marginBottom: '24px',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.95)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            {t('login.backHome')}
          </div>

          {/* Logo */}
          <img
            src="/logo.png"
            alt="Aslan Medical Clinic"
            style={{
              height: '56px', width: 'auto',
              background: 'rgba(255,255,255,0.95)',
              borderRadius: '10px',
              padding: '8px 16px',
              marginBottom: '24px',
              alignSelf: 'flex-start',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }}
            onError={e => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextSibling.style.display = 'flex';
            }}
          />
          {/* Fallback logo text */}
          <div style={{
            display: 'none', alignItems: 'center', gap: '10px',
            marginBottom: '36px',
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '22px', fontWeight: 900,
            }}>+</div>
            <span style={{ color: '#fff', fontSize: '20px', fontWeight: 800 }}>
              Aslan Medical
            </span>
          </div>

          {/* Heading */}
          <h1 style={{
            fontSize: '42px', fontWeight: 800,
            lineHeight: 1.2, margin: 0, fontFamily: FONT,
          }}>
            <span style={{ color: '#ffffff', display: 'block' }}>{t('login.tagline1')}</span>
            <span style={{ color: '#4DD0E1', display: 'block' }}>{t('login.tagline2')}</span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: '16px', color: 'rgba(255,255,255,0.7)',
            lineHeight: 1.7, marginTop: '20px', fontFamily: FONT,
            maxWidth: '360px',
          }}>
            Pasiyent portalına daxil olaraq randevu alın,
            tibbi qeydlərinizi izləyin.
          </p>

          {/* Feature pills */}
          <div style={{
            display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '24px',
          }}>
            {[t('login.feature1'), t('login.feature2'), t('login.feature3')].map(f => (
              <div key={f} style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '20px', padding: '8px 16px',
                color: 'white', fontSize: '13px', fontFamily: FONT, fontWeight: 500,
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="#4DD0E1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {f}
              </div>
            ))}
          </div>

          {/* Contact info — pushed to bottom */}
          <div style={{ marginTop: 'auto', paddingTop: '28px' }}>
            <a href="tel:+994508363694" style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              color: 'rgba(255,255,255,0.5)', fontSize: '13px',
              textDecoration: 'none', fontFamily: FONT, marginBottom: '8px',
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.85)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 5.5 5.5l.76-.76a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 16.92z"/>
              </svg>
              +994 50 836 36 94
            </a>
            <a href="mailto:info@aslanmedical.az" style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              color: 'rgba(255,255,255,0.5)', fontSize: '13px',
              textDecoration: 'none', fontFamily: FONT,
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.85)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              info@aslanmedical.az
            </a>
          </div>
        </div>

        {/* ══ RIGHT — Form side ═══════════════════════════ */}
        <div style={{
          background: '#ffffff',
          padding: '48px 52px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          overflow: 'hidden',
          height: '100vh',
          boxSizing: 'border-box',
        }}>
          <div style={{ maxWidth: '400px', width: '100%' }}>

            {/* Small logo for branding */}
            <img
              src="/logo.png"
              alt="Aslan Medical"
              style={{ height: '44px', width: 'auto', marginBottom: '20px', display: 'block' }}
              onError={e => e.currentTarget.style.display = 'none'}
            />

            {/* Step indicator */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <div style={{ flex: 1, height: '3px', borderRadius: '2px', background: TEAL }} />
              <div style={{ flex: 1, height: '3px', borderRadius: '2px', background: step === 'otp' ? TEAL : '#e2e8f0', transition: 'background 0.3s' }} />
            </div>
            <p style={{ fontSize: '12px', color: '#718096', marginBottom: '16px', fontFamily: FONT }}>
              {step === 'input' ? 'Addım 1/2 — Əlaqə' : 'Addım 2/2 — Təsdiq'}
            </p>

            <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#0a1628', margin: '0 0 4px', fontFamily: FONT }}>
              {step === 'input' ? 'Hesabınıza daxil olun' : 'Kodu daxil edin'}
            </h2>
            <p style={{ fontSize: '14px', color: '#718096', margin: '0 0 24px', fontFamily: FONT }}>
              {step === 'input'
                ? 'Pasiyent portalına xoş gəldiniz'
                : otpMethod === 'phone'
                  ? `+994${phone} nömrəsinə göndərildi`
                  : `${email} ünvanına göndərildi`}
            </p>

            {/* DEV OTP banner */}
            {devOtp && step === 'otp' && (
              <div style={{
                background: 'rgba(245,158,11,0.08)', border: '1px solid #F59E0B',
                borderRadius: '10px', padding: '10px 14px', marginBottom: '20px',
                fontSize: '13px', color: '#92400e', textAlign: 'center', fontFamily: FONT,
              }}>
                🔧 DEV —{' '}
                <strong style={{ fontSize: '20px', letterSpacing: '4px', color: TEAL }}>{devOtp}</strong>
              </div>
            )}

            {/* STEP 1 — Method selector + input */}
            {step === 'input' && (
              <>
                {/* Method toggle */}
                <div style={{
                  display: 'flex', background: '#f0f4f8',
                  borderRadius: '10px', padding: '4px',
                  marginBottom: '20px', gap: '4px',
                }}>
                  {[
                    { value: 'phone', label: '📱 Telefon' },
                    { value: 'email', label: '✉️ Email' },
                  ].map(m => (
                    <button
                      key={m.value}
                      onClick={() => { setOtpMethod(m.value); setPhone(''); setEmail(''); setDevOtp(''); }}
                      style={{
                        flex: 1, padding: '9px', borderRadius: '8px', border: 'none',
                        background: otpMethod === m.value ? 'white' : 'transparent',
                        color: otpMethod === m.value ? TEAL : '#718096',
                        fontWeight: otpMethod === m.value ? 700 : 400,
                        cursor: 'pointer', fontSize: '13px', fontFamily: FONT,
                        boxShadow: otpMethod === m.value ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                        transition: 'all 0.2s',
                      }}
                    >{m.label}</button>
                  ))}
                </div>

                {/* Phone input */}
                {otpMethod === 'phone' && (
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#4a5568', marginBottom: '6px', fontFamily: FONT }}>
                      Telefon nömrəsi
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{
                        padding: '13px 12px', border: '1.5px solid #e2e8f0', borderRadius: '10px',
                        fontSize: '15px', color: '#4a5568', background: '#f8fafc',
                        whiteSpace: 'nowrap', fontFamily: FONT, flexShrink: 0,
                      }}>🇦🇿 +994</span>
                      <input
                        type="tel" placeholder="50 836 36 94"
                        value={phone}
                        onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                        maxLength={9}
                        onKeyDown={e => { if (e.key === 'Enter') handleSendOTP(); }}
                        style={{ ...inputBase, flex: 1 }}
                        onFocus={focusIn} onBlur={focusOut}
                        autoComplete="tel" autoFocus
                      />
                    </div>
                  </div>
                )}

                {/* Email input */}
                {otpMethod === 'email' && (
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#4a5568', marginBottom: '6px', fontFamily: FONT }}>
                      Email ünvanı
                    </label>
                    <input
                      type="email" placeholder="siz@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleSendOTP(); }}
                      style={inputBase}
                      onFocus={focusIn} onBlur={focusOut}
                      autoComplete="email" autoFocus
                    />
                  </div>
                )}

                <button
                  onClick={handleSendOTP}
                  style={{
                    width: '100%', padding: '14px', background: TEAL, color: '#fff',
                    border: 'none', borderRadius: '10px', fontSize: '16px',
                    fontWeight: 700, fontFamily: FONT, cursor: 'pointer',
                    transition: 'background 0.2s', boxShadow: '0 4px 14px rgba(0,132,142,0.35)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#006b74'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = TEAL; }}
                >
                  Kod Al
                </button>
              </>
            )}

            {/* STEP 2 — OTP boxes */}
            {step === 'otp' && (
              <>
                <OTPInput
                  phone={otpMethod === 'phone' ? '+994' + phone : email}
                  onComplete={handleVerifyOTP}
                  onResend={handleResendOTP}
                  loading={otpLoading}
                  error={otpError}
                />
                <button
                  onClick={resetToInput}
                  style={{
                    background: 'none', border: 'none', color: '#718096',
                    cursor: 'pointer', fontSize: '13px', fontFamily: FONT,
                    display: 'block', margin: '12px auto 0',
                  }}
                >
                  ← {otpMethod === 'phone' ? 'Nömrəni dəyiş' : 'Emaili dəyiş'}
                </button>
              </>
            )}

            {/* Staff login */}
            <p style={{
              textAlign: 'center', marginTop: '24px',
              fontSize: '12px', color: '#cbd5e0', fontFamily: FONT,
            }}>
              <span
                onClick={() => navigate('/staff-login')}
                style={{ cursor: 'pointer', color: '#a0aec0' }}
                onMouseEnter={e => e.currentTarget.style.color = '#718096'}
                onMouseLeave={e => e.currentTarget.style.color = '#a0aec0'}
              >{t('login.staffLogin')}</span>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .login-left { display: none !important; }
          div[style*="gridTemplateColumns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
