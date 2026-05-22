/* eslint-disable */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { requestEmailOtp, verifyEmailOtp } from '../../api/authApi';
import OTPInput from '../../components/ui/OTPInput';

const FONT = "'Source Sans 3', 'Raleway', sans-serif";
const TEAL = '#00848e';
const NAVY = '#0a1628';

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
  const navigate = useNavigate();

  const [step,       setStep]       = useState('input');
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
      <div style={{ height: '100vh', display: 'grid', gridTemplateColumns: '45% 55%', overflow: 'hidden', fontFamily: FONT }}>

        {/* ── LEFT — Form ── */}
        <div style={{ background: '#fff', padding: '0 52px', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100vh', boxSizing: 'border-box', overflow: 'hidden', position: 'relative' }}>

          <div style={{ maxWidth: 400, width: '100%' }}>

            {/* Logo + name */}
            <div style={{ marginBottom: 32 }}>
              <img src="/logo.png" height={38} alt="Aslan Medical" style={{ marginRight: 10, verticalAlign: 'middle' }} onError={e => e.currentTarget.style.display = 'none'} />
              <span style={{ fontSize: 18, fontWeight: 800, color: NAVY, fontFamily: FONT, verticalAlign: 'middle' }}>Aslan Medical</span>
            </div>

            {/* STEP 1 */}
            {step === 'input' && (
              <>
                <h2 style={{ fontSize: 26, fontWeight: 800, color: NAVY, margin: '0 0 4px', fontFamily: FONT }}>Xoş gəldiniz</h2>
                <p style={{ fontSize: 14, color: '#718096', margin: '0 0 28px', fontFamily: FONT }}>E-poçt ünvanınızı daxil edin</p>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4a5568', marginBottom: 6, fontFamily: FONT }}>E-poçt ünvanı</label>
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
                  style={{ width: '100%', padding: '14px', background: loading ? '#7ec8cc' : TEAL, color: '#fff', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700, fontFamily: FONT, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 4px 14px rgba(0,132,142,0.35)', transition: 'background 0.2s' }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#006b74'; }}
                  onMouseLeave={e => { if (!loading) e.currentTarget.style.background = TEAL; }}
                >
                  {loading ? 'Göndərilir…' : 'Kodu Göndər'}
                </button>

                <div style={{ marginTop: 24, borderTop: '1px solid #e2e8f0' }} />
                <p style={{ fontSize: 13, color: '#718096', textAlign: 'center', marginTop: 16, fontFamily: FONT }}>
                  Hesabınız yoxdur?{' '}
                  <span onClick={() => navigate('/register')} style={{ color: TEAL, fontWeight: 700, cursor: 'pointer' }}>Qeydiyyat</span>
                </p>
              </>
            )}

            {/* STEP 2 */}
            {step === 'otp' && (
              <>
                <h2 style={{ fontSize: 26, fontWeight: 800, color: NAVY, margin: '0 0 4px', fontFamily: FONT }}>Kodu daxil edin</h2>
                <p style={{ fontSize: 14, color: '#718096', margin: '0 0 24px', fontFamily: FONT }}>{maskEmail(email)} ünvanına göndərildi</p>
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
                  style={{ background: 'none', border: 'none', color: '#718096', cursor: 'pointer', fontSize: 13, fontFamily: FONT, display: 'block', margin: '12px auto 0' }}
                >
                  ← E-poçtu dəyiş
                </button>
              </>
            )}
          </div>

          {/* Back link — absolute bottom */}
          <div
            onClick={() => navigate('/')}
            style={{ position: 'absolute', bottom: 24, left: 52, color: '#9ca3af', fontSize: 13, cursor: 'pointer', textDecoration: 'none', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 6 }}
            onMouseEnter={e => e.currentTarget.style.color = NAVY}
            onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Ana səhifəyə qayıt
          </div>
        </div>

        {/* ── RIGHT — Image ── */}
        <div className="login-right" style={{ position: 'relative', overflow: 'hidden', height: '100vh' }}>

          <img src="/login.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }} onError={e => e.currentTarget.style.display = 'none'} />

          {/* Dark overlay */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(10,22,40,0.6) 100%)' }} />

          {/* Text overlay */}
          <div style={{ position: 'absolute', top: 48, left: 48, right: 48, color: '#fff' }}>
            <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.3, fontFamily: FONT }}>
              Sağlamlığınız —<br />
              <span style={{ color: '#4DD0E1' }}>Bizim Prioritetimiz.</span>
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 12, maxWidth: 320, lineHeight: 1.7, fontFamily: FONT }}>
              Pasiyent portalına daxil olaraq randevu alın, tibbi qeydlərinizi izləyin.
            </p>
          </div>

          {/* Feature pills */}
          <div style={{ position: 'absolute', bottom: 48, left: 48, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {['✓ Onlayn Randevu', '✓ Tibbi Qeydlər', '✓ Reseptlər'].map(p => (
              <span key={p} style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, padding: '8px 16px', color: '#fff', fontSize: 12, fontWeight: 600, fontFamily: FONT }}>
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .login-right { display: none !important; }
          div[style*="gridTemplateColumns"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
