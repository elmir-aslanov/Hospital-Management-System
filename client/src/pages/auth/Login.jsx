import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

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
  const { login: authLogin } = useAuth();

  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (!email || !password) { setError('Bütün sahələri doldurun'); return; }
    setError('');
    setLoading(true);
    fetch('http://localhost:5000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
      .then(r => r.json())
      .then(data => {
        const token = data.data?.accessToken;
        const user  = data.data?.user;
        if (token && user) {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          authLogin(token, user);
          const role = user.role?.toUpperCase();
          if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
            localStorage.setItem('adminToken', token);
            localStorage.setItem('adminUser', JSON.stringify(user));
            navigate('/admin/dashboard');
          } else if (role === 'DOCTOR') {
            localStorage.setItem('adminToken', token);
            localStorage.setItem('adminUser', JSON.stringify(user));
            navigate('/doctor/dashboard');
          } else if (['STAFF', 'SOBE_MUDURU', 'BAS_HEKIM'].includes(role)) {
            localStorage.setItem('adminToken', token);
            localStorage.setItem('adminUser', JSON.stringify(user));
            navigate('/admin/dashboard');
          } else {
            navigate('/');
          }
        } else {
          setError(data.message || 'E-poçt və ya şifrə yanlışdır');
        }
      })
      .catch(() => setError('Xəta baş verdi'))
      .finally(() => setLoading(false));
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

            <h2 style={{ fontSize: 28, fontWeight: 700, color: NAVY, margin: '0 0 4px', fontFamily: FONT }}>Xoş gəldiniz</h2>
            <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 28px', fontFamily: FONT }}>Hesabınıza daxil olun</p>

            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4a5568', marginBottom: 6, fontFamily: FONT }}>E-poçt ünvanı</label>
              <input
                type="email"
                placeholder="siz@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleLogin(); }}
                style={inputBase}
                onFocus={focusIn}
                onBlur={focusOut}
                autoComplete="email"
                autoFocus
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4a5568', marginBottom: 6, fontFamily: FONT }}>Şifrə</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleLogin(); }}
                  style={{ ...inputBase, paddingRight: 44 }}
                  onFocus={focusIn}
                  onBlur={focusOut}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex', alignItems: 'center' }}
                >
                  {showPassword ? (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && <p style={{ color: '#e53e3e', fontSize: 13, margin: '0 0 14px', fontFamily: FONT }}>{error}</p>}

            {/* Submit */}
            <button
              onClick={handleLogin}
              disabled={loading}
              style={{ width: '100%', padding: '14px', background: loading ? '#7ec8cc' : TEAL, color: '#fff', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700, fontFamily: FONT, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 4px 14px rgba(0,132,142,0.35)', transition: 'background 0.2s' }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#006b74'; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = loading ? '#7ec8cc' : TEAL; }}
            >
              {loading ? 'Yüklənir...' : 'Daxil ol'}
            </button>

            <div style={{ marginTop: 24, borderTop: '1px solid #e2e8f0' }} />
            <p style={{ fontSize: 13, color: '#718096', textAlign: 'center', marginTop: 16, fontFamily: FONT }}>
              Hesabınız yoxdur?{' '}
              <span onClick={() => navigate('/register')} style={{ color: TEAL, fontWeight: 700, cursor: 'pointer' }}>Qeydiyyat</span>
            </p>
          </div>

          {/* Back link */}
          <div
            onClick={() => navigate('/')}
            style={{ position: 'absolute', bottom: 24, left: 52, color: '#9ca3af', fontSize: 13, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 6 }}
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

          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(10,22,40,0.6) 100%)' }} />

          <div style={{ position: 'absolute', top: 48, left: 48, right: 48, color: '#fff' }}>
            <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.3, fontFamily: FONT }}>
              Sağlamlığınız —<br />
              <span style={{ color: '#4DD0E1' }}>Bizim Prioritetimiz.</span>
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 12, maxWidth: 320, lineHeight: 1.7, fontFamily: FONT }}>
              Pasiyent portalına daxil olaraq randevu alın, tibbi qeydlərinizi izləyin.
            </p>
          </div>

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
