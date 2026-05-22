/* eslint-disable */
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../../api/axios';

const FONT = "'Source Sans 3', 'Raleway', sans-serif";
const TEAL = '#00848e';
const NAVY = '#0a1628';

const inputBase = {
  width: '100%', padding: '13px 16px',
  border: '1.5px solid #e2e8f0', borderRadius: '10px',
  fontSize: '15px', fontFamily: FONT, color: '#1a2b4a',
  background: '#fff', outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.18s, box-shadow 0.18s',
};

function focusIn(e)  { e.target.style.borderColor = TEAL; e.target.style.boxShadow = '0 0 0 3px rgba(0,132,142,0.1)'; }
function focusOut(e) { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }

function Label({ children }) {
  return (
    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#4a5568', marginBottom: '6px', fontFamily: FONT }}>
      {children}
    </label>
  );
}

function maskEmail(email) {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  return local.slice(0, 3) + '***@' + domain;
}

export default function Register() {
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  const [form, setForm]           = useState({ firstName: '', lastName: '', age: '', idCode: '', email: '', password: '' });
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [otpModal, setOtpModal]   = useState(false);
  const [otp, setOtp]             = useState(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError]   = useState('');

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { firstName, lastName, age, idCode, email, password } = form;

    if (!firstName.trim() || !lastName.trim() || !age || !idCode.trim() || !email.trim() || !password.trim()) {
      toast.warning('Zəhmət olmasa bütün sahələri doldurun.');
      return;
    }
    const ageNum = Number(age);
    if (ageNum < 1 || ageNum > 120) {
      toast.warning('Yaş 1–120 arasında olmalıdır.');
      return;
    }
    if (idCode.trim().length < 5) {
      toast.warning('Şəxsiyyət vəsiqəsi kodu ən az 5 simvol olmalıdır.');
      return;
    }
    if (password.length < 6) {
      toast.warning('Şifrə ən az 6 simvol olmalıdır.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', {
        fullName: `${firstName.trim()} ${lastName.trim()}`,
        email: email.trim(),
        password,
        role: 'PATIENT',
        age: ageNum,
        idCode: idCode.trim(),
      });
      await api.post('/auth/request-email-otp', { email: email.trim() });
      setOtpModal(true);
      toast.success('Hesab yaradıldı! E-poçtunuzu yoxlayın.');
    } catch (err) {
      const status = err?.response?.status;
      if (status === 409)      toast.error('Bu e-poçt artıq qeydiyyatdan keçib.');
      else if (status === 400) toast.error(err?.response?.data?.message || 'Məlumatlar yanlışdır.');
      else                     toast.error('Serverlə əlaqə xətası. Bir az sonra yenidən cəhd edin.');
    } finally {
      setLoading(false);
    }
  };

  /* ── OTP input handling ── */
  function handleOtpChange(i, val) {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[i] = digit;
    setOtp(next);
    if (digit && i < 5) inputRefs.current[i + 1]?.focus();
  }

  function handleOtpKeyDown(i, e) {
    if (e.key === 'Backspace') {
      if (otp[i]) {
        const next = [...otp]; next[i] = ''; setOtp(next);
      } else if (i > 0) {
        inputRefs.current[i - 1]?.focus();
      }
    }
  }

  function handleOtpPaste(e) {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
    const next = [...otp];
    digits.forEach((d, idx) => { next[idx] = d; });
    setOtp(next);
    const focusIdx = Math.min(digits.length, 5);
    inputRefs.current[focusIdx]?.focus();
  }

  /* ── Verify OTP ── */
  const handleVerifyOtp = async () => {
    const code = otp.join('');
    if (code.length < 6) { setOtpError('6 rəqəmli kodu daxil edin.'); return; }
    setOtpLoading(true);
    setOtpError('');
    try {
      const res = await api.post('/auth/verify-email-otp', { email: form.email.trim(), otp: code });
      const { accessToken, user } = res.data.data;
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      window.dispatchEvent(new Event('storage'));
      toast.success('Qeydiyyat tamamlandı! Xoş gəldiniz.');
      navigate('/patient');
    } catch (err) {
      setOtpError(err?.response?.data?.message || 'Kod yanlışdır və ya müddəti bitib.');
    } finally {
      setOtpLoading(false);
    }
  };

  /* ── Resend OTP ── */
  const resendOtp = async () => {
    try {
      await api.post('/auth/request-email-otp', { email: form.email.trim() });
      toast.success('Kod yenidən göndərildi.');
      setOtp(['', '', '', '', '', '']);
      setOtpError('');
      inputRefs.current[0]?.focus();
    } catch {
      toast.error('Kod göndərilmədi. Bir az sonra yenidən cəhd edin.');
    }
  };

  return (
    <>
      <div style={{ height: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', overflow: 'hidden', fontFamily: FONT }}>

        {/* ── LEFT ── */}
        <div style={{ background: 'linear-gradient(145deg, #0a1628 0%, #00848e 100%)', padding: '48px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100vh', boxSizing: 'border-box', position: 'relative', overflow: 'hidden' }}>

          {/* Decorative circles */}
          <div style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -60, left: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />

          {/* TOP */}
          <div>
            {/* Back button */}
            <div onClick={() => navigate('/')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.65)', fontSize: '13px', cursor: 'pointer', fontFamily: FONT }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.65)'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Ana səhifəyə qayıt
            </div>

            {/* Image card */}
            <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.4)', position: 'relative', marginTop: 24 }}>
              <img
                src="/emeliyyat_sekli.png"
                alt=""
                style={{ width: '100%', height: 'calc(100vh - 200px)', objectFit: 'cover', objectPosition: 'center center', display: 'block' }}
                onError={e => e.currentTarget.style.display = 'none'}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)' }} />
              <div style={{ position: 'absolute', bottom: 14, left: 16 }}>
                <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: FONT }}>Peşəkar Tibbi Komanda</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2, fontFamily: FONT }}>Aslan Medical Center</div>
              </div>
            </div>
          </div>

          {/* BOTTOM */}
          <div>
            {/* Feature pills */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
              {['✓ Onlayn Randevu', '✓ Tibbi Qeydlər', '✓ 24/7 Dəstək'].map(p => (
                <span key={p} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 20, padding: '6px 14px', color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 600, fontFamily: FONT }}>{p}</span>
              ))}
            </div>

            {/* Contact */}
            <a href="tel:+994508363694" style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'rgba(255,255,255,0.5)', fontSize: 13, textDecoration: 'none', fontFamily: FONT, marginBottom: 6 }}>📞 +994 50 836 36 94</a>
            <a href="mailto:info@aslanmedical.az" style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'rgba(255,255,255,0.5)', fontSize: 13, textDecoration: 'none', fontFamily: FONT }}>✉ info@aslanmedical.az</a>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div style={{ background: '#fff', padding: '48px 52px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto', height: '100vh', boxSizing: 'border-box' }}>
          <div style={{ width: '100%', maxWidth: '420px' }}>

            <h2 style={{ fontSize: '28px', fontWeight: 800, color: NAVY, margin: '0 0 4px', fontFamily: FONT }}>Hesab Yaradın</h2>
            <p style={{ fontSize: '13px', color: TEAL, fontWeight: 700, margin: '0 0 24px', letterSpacing: '0.3px', fontFamily: FONT }}>Aslan Medical Center</p>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>

                {/* Row 1 */}
                <div>
                  <Label>Ad</Label>
                  <input type="text" placeholder="Adınız" value={form.firstName} onChange={set('firstName')} style={inputBase} onFocus={focusIn} onBlur={focusOut} autoComplete="given-name" />
                </div>
                <div>
                  <Label>Soyad</Label>
                  <input type="text" placeholder="Soyadınız" value={form.lastName} onChange={set('lastName')} style={inputBase} onFocus={focusIn} onBlur={focusOut} autoComplete="family-name" />
                </div>

                {/* Row 2 */}
                <div>
                  <Label>Yaş</Label>
                  <input type="number" placeholder="25" min={1} max={120} value={form.age} onChange={set('age')} style={inputBase} onFocus={focusIn} onBlur={focusOut} />
                </div>
                <div>
                  <Label>Şəxsiyyət vəsiqəsi kodu</Label>
                  <input type="text" placeholder="AZE123456789" value={form.idCode} onChange={set('idCode')} style={inputBase} onFocus={focusIn} onBlur={focusOut} autoComplete="off" />
                </div>

                {/* Row 3 — full width */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <Label>E-poçt ünvanı</Label>
                  <input type="email" placeholder="siz@example.com" value={form.email} onChange={set('email')} style={inputBase} onFocus={focusIn} onBlur={focusOut} autoComplete="email" />
                </div>

                {/* Row 4 — full width */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <Label>Şifrə</Label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPass ? 'text' : 'password'}
                      placeholder="Ən az 6 simvol"
                      value={form.password}
                      onChange={set('password')}
                      style={{ ...inputBase, paddingRight: '46px' }}
                      onFocus={focusIn} onBlur={focusOut}
                      autoComplete="new-password"
                    />
                    <button type="button" onClick={() => setShowPass(v => !v)}
                      style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#a0aec0', lineHeight: 0, padding: 0 }}>
                      {showPass
                        ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                    </button>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={loading}
                style={{ width: '100%', marginTop: '20px', padding: '14px', background: loading ? '#7ec8cc' : TEAL, color: '#fff', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 700, fontFamily: FONT, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 4px 14px rgba(0,132,142,0.35)' }}>
                {loading ? 'Yüklənir…' : 'Qeydiyyatdan Keç →'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#718096', fontFamily: FONT }}>
              Artıq hesabınız var?{' '}
              <span onClick={() => navigate('/login')} style={{ color: TEAL, fontWeight: 600, cursor: 'pointer' }}>Daxil olun</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── OTP MODAL ── */}
      {otpModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 40, maxWidth: 420, width: '90%', boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}>

            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <img src="/logo.png" alt="logo" style={{ height: 40, marginBottom: 16 }} onError={e => e.currentTarget.style.display = 'none'} />
              <p style={{ fontSize: 12, fontWeight: 700, color: TEAL, letterSpacing: '1.5px', textTransform: 'uppercase', margin: '0 0 12px', fontFamily: FONT }}>
                Addım 2/2 — E-poçt təsdiqi
              </p>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: NAVY, margin: '0 0 8px', fontFamily: FONT }}>E-poçtunuzu təsdiqləyin</h3>
              <p style={{ fontSize: 13, color: '#718096', margin: 0, fontFamily: FONT }}>
                Kod göndərildi: <strong>{maskEmail(form.email)}</strong>
              </p>
            </div>

            {/* 6-box OTP */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 24 }} onPaste={handleOtpPaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => inputRefs.current[i] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(i, e)}
                  style={{
                    width: 46, height: 54, textAlign: 'center', fontSize: 22, fontWeight: 700,
                    border: '2px solid #e2e8f0', borderRadius: 10, outline: 'none', fontFamily: FONT,
                    color: NAVY, transition: 'border-color 0.18s, box-shadow 0.18s', boxSizing: 'border-box',
                  }}
                  onFocus={e => { e.target.style.borderColor = TEAL; e.target.style.boxShadow = '0 0 0 3px rgba(0,132,142,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                />
              ))}
            </div>

            {otpError && (
              <p style={{ color: '#dc2626', fontSize: 13, textAlign: 'center', marginBottom: 12, fontFamily: FONT }}>
                {otpError}
              </p>
            )}

            <button
              onClick={handleVerifyOtp}
              disabled={otpLoading}
              style={{ width: '100%', padding: '14px', background: otpLoading ? '#7ec8cc' : TEAL, color: '#fff', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: otpLoading ? 'not-allowed' : 'pointer', fontFamily: FONT, boxShadow: otpLoading ? 'none' : '0 4px 14px rgba(0,132,142,0.3)' }}>
              {otpLoading ? 'Yüklənir…' : 'Təsdiqlə'}
            </button>

            <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#718096', fontFamily: FONT }}>
              Kodu almadınız?{' '}
              <span onClick={resendOtp} style={{ color: TEAL, fontWeight: 600, cursor: 'pointer' }}>
                Yenidən göndər
              </span>
            </p>
          </div>
        </div>
      )}

      <style>{`@media(max-width:768px){div[style*="gridTemplateColumns: 1fr 1fr"]{grid-template-columns:1fr!important}}`}</style>
    </>
  );
}
