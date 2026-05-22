/* eslint-disable */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { requestEmailOtp, verifyEmailOtp } from '../../api/authApi';
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

function maskEmail(email) {
  const [local, domain] = email.split('@');
  return local.slice(0, 3) + '***@' + domain;
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

export default function Login() {
  const navigate    = useNavigate();
  const { t }       = useTranslation();

  const [step,       setStep]       = useState('input'); // 'input' | 'otp'
  const [email,      setEmail]      = useState('');
  const [otpError,   setOtpError]   = useState('');
  const [loading,    setLoading]    = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [cooldown,   setCooldown]   = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleSendOTP = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.warning('Düzgün e-poçt ünvanı daxil edin.');
      return;
    }
    setLoading(true);
    try {
      await requestEmailOtp(email.trim());
      toast.success('OTP e-poçtunuza göndərildi');
      setStep('otp');
      setCooldown(60);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Kod göndərilmədi. Yenidən cəhd edin.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (code) => {
    setOtpLoading(true);
    setOtpError('');
    try {
      const res = await verifyEmailOtp(email.trim(), code);
      const { accessToken, user } = res.data.data;
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      window.dispatchEvent(new Event('storage'));
      toast.success(`Xoş gəldiniz, ${user.fullName || 'Pasiyent'}!`);
      navigate(roleToRoute(user.role));
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Kod yanlışdır və ya müddəti bitib.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (cooldown > 0) return;
    try {
      await requestEmailOtp(email.trim());
      toast.success('Yeni kod göndərildi.');
      setCooldown(60);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xəta baş verdi.');
    }
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
              {step === 'input' ? 'Addım 1/2 — E-poçt' : 'Addım 2/2 — Təsdiq'}
            </p>

            <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#0a1628', margin: '0 0 4px', fontFamily: FONT }}>
              {step === 'input' ? 'Hesabınıza daxil olun' : 'Kodu daxil edin'}
            </h2>
            <p style={{ fontSize: '14px', color: '#718096', margin: '0 0 24px', fontFamily: FONT }}>
              {step === 'input'
                ? 'Pasiyent portalına xoş gəldiniz'
                : `${maskEmail(email)} ünvanına göndərildi`}
            </p>

            {/* STEP 1 — Email input */}
            {step === 'input' && (
              <>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#4a5568', marginBottom: '6px', fontFamily: FONT }}>
                    E-poçt ünvanı
                  </label>
                  <input
                    type="email"
                    placeholder="siz@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSendOTP(); }}
                    style={inputBase}
                    onFocus={focusIn}
                    onBlur={focusOut}
                    autoComplete="email"
                    autoFocus
                  />
                </div>

                <button
                  onClick={handleSendOTP}
                  disabled={loading}
                  style={{
                    width: '100%', padding: '14px',
                    background: loading ? '#7ec8cc' : TEAL,
                    color: '#fff', border: 'none', borderRadius: '10px',
                    fontSize: '16px', fontWeight: 700, fontFamily: FONT,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'background 0.2s',
                    boxShadow: loading ? 'none' : '0 4px 14px rgba(0,132,142,0.35)',
                  }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#006b74'; }}
                  onMouseLeave={e => { if (!loading) e.currentTarget.style.background = TEAL; }}
                >
                  {loading ? 'Göndərilir…' : 'Kodu Göndər'}
                </button>

                <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: '#718096', fontFamily: FONT }}>
                  Hesabınız yoxdur?{' '}
                  <span
                    onClick={() => navigate('/register')}
                    style={{ color: '#00848e', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Qeydiyyat
                  </span>
                </p>
              </>
            )}

            {/* STEP 2 — OTP boxes */}
            {step === 'otp' && (
              <>
                <OTPInput
                  phone={email}
                  onComplete={handleVerifyOTP}
                  onResend={handleResendOTP}
                  loading={otpLoading}
                  error={otpError}
                  cooldown={cooldown}
                />
                <button
                  onClick={() => { setStep('input'); setOtpError(''); }}
                  style={{
                    background: 'none', border: 'none', color: '#718096',
                    cursor: 'pointer', fontSize: '13px', fontFamily: FONT,
                    display: 'block', margin: '12px auto 0',
                  }}
                >
                  ← E-poçtu dəyiş
                </button>
              </>
            )}

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
