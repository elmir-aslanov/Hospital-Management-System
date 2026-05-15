/* eslint-disable */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';

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
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.warning('Zəhmət olmasa bütün sahələri doldurun.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email: email.trim(), password });
      const { user, accessToken } = data.data;

      if (user.role?.toUpperCase() !== 'PATIENT') {
        toast.error('Bu hesab üçün icazəniz yoxdur. Əməkdaş girişindən istifadə edin.');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      window.dispatchEvent(new Event('storage'));
      toast.success(`Xoş gəldiniz, ${user.fullName}!`);
      navigate(roleToRoute(user.role));
    } catch (err) {
      const status = err?.response?.status;
      if      (status === 404) toast.error('Bu e-poçtla hesab tapılmadı.');
      else if (status === 401) toast.error('Şifrə yanlışdır.');
      else if (status === 403) toast.error('Hesabınız deaktiv edilib. Klinikamızla əlaqə saxlayın.');
      else                     toast.error('Serverlə əlaqə xətası. Bir az sonra yenidən cəhd edin.');
    } finally {
      setLoading(false);
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

            {/* Title */}
            <h2 style={{
              fontSize: '28px', fontWeight: 800,
              color: '#0a1628', margin: '0 0 4px', fontFamily: FONT,
            }}>{t('login.title')}</h2>
            <p style={{
              fontSize: '15px', color: '#718096',
              margin: '0 0 24px', fontFamily: FONT,
            }}>{t('login.subtitle')}</p>

            <form onSubmit={handleSubmit}>

              {/* Email */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{
                  display: 'block', fontSize: '13px', fontWeight: 600,
                  color: '#4a5568', marginBottom: '6px', fontFamily: FONT,
                }}>{t('login.email')}</label>
                <input
                  type="email" placeholder="siz@example.com"
                  value={email} onChange={e => setEmail(e.target.value)}
                  style={inputBase} onFocus={focusIn} onBlur={focusOut}
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              <div style={{ marginBottom: '8px' }}>
                <label style={{
                  display: 'block', fontSize: '13px', fontWeight: 600,
                  color: '#4a5568', marginBottom: '6px', fontFamily: FONT,
                }}>Şifrə</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password} onChange={e => setPassword(e.target.value)}
                    style={{ ...inputBase, paddingRight: '46px' }}
                    onFocus={focusIn} onBlur={focusOut}
                    autoComplete="current-password"
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    style={{
                      position: 'absolute', right: '13px', top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none',
                      cursor: 'pointer', color: '#a0aec0',
                      lineHeight: 0, padding: 0, transition: 'color 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = TEAL}
                    onMouseLeave={e => e.currentTarget.style.color = '#a0aec0'}
                  >
                    {showPass
                      ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
              </div>

              {/* Forgot password */}
              <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                <span
                  onClick={() => navigate('/forgot-password')}
                  style={{
                    fontSize: '13px', color: TEAL, cursor: 'pointer',
                    fontFamily: FONT, fontWeight: 500,
                  }}
                  onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                >{t('login.forgot')}</span>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                style={{
                  width: '100%', padding: '14px',
                  background: loading ? '#7ec8cc' : TEAL,
                  color: '#fff', border: 'none', borderRadius: '10px',
                  fontSize: '16px', fontWeight: 700, fontFamily: FONT,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s, transform 0.15s',
                  boxShadow: loading ? 'none' : '0 4px 14px rgba(0,132,142,0.35)',
                }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = '#006b74'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                onMouseLeave={e => { e.currentTarget.style.background = loading ? '#7ec8cc' : TEAL; e.currentTarget.style.transform = 'none'; }}
              >
                {loading ? 'Yüklənir…' : t('login.submit')}
              </button>
            </form>

            {/* Divider */}
            <div style={{
              display: 'flex', alignItems: 'center',
              gap: '12px', margin: '20px 0',
            }}>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
              <span style={{ fontSize: '13px', color: '#a0aec0', fontFamily: FONT, whiteSpace: 'nowrap' }}>
                {t('login.or')}
              </span>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            </div>

            {/* Google button */}
            <button
              type="button"
              onClick={() => toast.info('Google ilə giriş tezliklə əlavə olunacaq.')}
              style={{
                width: '100%', padding: '13px',
                background: '#fff', color: '#3c4043',
                border: '1.5px solid #dadce0', borderRadius: '10px',
                fontSize: '15px', fontWeight: 600, fontFamily: FONT,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                transition: 'background 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f8f9fa'; e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {t('login.google')}
            </button>

            {/* Register */}
            <p style={{
              textAlign: 'center', marginTop: '16px',
              fontSize: '14px', color: '#718096', fontFamily: FONT,
            }}>
              {t('login.noAccount')}{' '}
              <span
                onClick={() => navigate('/register')}
                style={{ color: TEAL, fontWeight: 600, cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
              >{t('login.register')}</span>
            </p>

            {/* Staff login */}
            <p style={{
              textAlign: 'center', marginTop: '12px',
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
