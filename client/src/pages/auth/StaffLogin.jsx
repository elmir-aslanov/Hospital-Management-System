/* eslint-disable */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
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

const TABS = [
  {
    key:          'doctor',
    label:        'Həkim',
    icon:         '👨‍⚕️',
    allowedRoles: ['DOCTOR'],
    btnBg:        TEAL,
    accentColor:  TEAL,
  },
  {
    key:          'nurse',
    label:        'Tibb Bacısı',
    icon:         '👩‍⚕️',
    allowedRoles: ['NURSE', 'RECEPTIONIST', 'LAB_TECHNICIAN'],
    btnBg:        '#2d7a6e',
    accentColor:  '#2d7a6e',
  },
  {
    key:          'admin',
    label:        'Admin',
    icon:         '🔐',
    allowedRoles: ['ADMIN', 'SUPER_ADMIN'],
    btnBg:        '#1a2b4a',
    accentColor:  '#3b5bdb',
  },
];

const inputBase = {
  width: '100%', padding: '12px 16px',
  border: '1.5px solid #2d3748', borderRadius: '10px',
  fontSize: '15px', fontFamily: FONT, color: '#e2e8f0',
  background: 'rgba(255,255,255,0.06)', outline: 'none',
  boxSizing: 'border-box', transition: 'border-color 0.18s, box-shadow 0.18s',
};

function focusIn(e, color)  {
  e.target.style.borderColor = color;
  e.target.style.boxShadow   = `0 0 0 3px ${color}28`;
}
function focusOut(e) {
  e.target.style.borderColor = '#2d3748';
  e.target.style.boxShadow   = 'none';
}

export default function StaffLogin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('doctor');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);

  const tab = TABS.find(t => t.key === activeTab);

  const switchTab = (key) => {
    setActiveTab(key);
    setEmail('');
    setPassword('');
    setShowPass(false);
  };

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

      if (!tab.allowedRoles.includes(user.role?.toUpperCase())) {
        toast.error(`Bu hesab üçün icazəniz yoxdur. (Hesab rolu: ${user.role})`);
        setLoading(false);
        return;
      }

      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      toast.success(`Xoş gəldiniz, ${user.fullName}!`);
      navigate(roleToRoute(user.role));
    } catch (err) {
      const status = err?.response?.status;
      if      (status === 404) toast.error('Bu e-poçtla hesab tapılmadı.');
      else if (status === 401) toast.error('Şifrə yanlışdır.');
      else if (status === 403) toast.error('Hesabınız deaktiv edilib. Administratorla əlaqə saxlayın.');
      else                     toast.error('Serverlə əlaqə xətası. Bir az sonra yenidən cəhd edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0a1628 0%, #0d2137 55%, #0a1a2e 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 16px', fontFamily: FONT,
    }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>

        {/* Back link */}
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.45)', fontSize: '13px',
            fontFamily: FONT, marginBottom: '32px', padding: 0,
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.85)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Ana səhifəyə qayıt
        </button>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            width: '46px', height: '46px', borderRadius: '12px',
            background: tab.btnBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '16px',
            boxShadow: `0 4px 16px ${tab.btnBg}55`,
            transition: 'background 0.3s, box-shadow 0.3s',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h1 style={{
            fontSize: '26px', fontWeight: 800,
            color: '#f7fafc', fontFamily: FONT, margin: '0 0 6px',
          }}>Əməkdaş Girişi</h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', fontFamily: FONT, margin: 0 }}>
            Aslan Medical Center — Daxili Portal
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px', padding: '36px 32px',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
        }}>

          {/* Tabs */}
          <div style={{
            display: 'flex', gap: '4px',
            background: 'rgba(0,0,0,0.25)',
            borderRadius: '12px', padding: '4px',
            marginBottom: '28px',
          }}>
            {TABS.map(t => (
              <button key={t.key}
                onClick={() => switchTab(t.key)}
                style={{
                  flex: 1,
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: '5px',
                  padding: '9px 8px', borderRadius: '9px',
                  border: 'none', cursor: 'pointer',
                  fontSize: '13px', fontWeight: 600, fontFamily: FONT,
                  background: activeTab === t.key ? t.btnBg : 'transparent',
                  color: activeTab === t.key ? '#fff' : 'rgba(255,255,255,0.45)',
                  transition: 'all 0.2s',
                  boxShadow: activeTab === t.key ? `0 2px 10px ${t.btnBg}66` : 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{ fontSize: '15px' }}>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>

            {/* Email */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block', fontSize: '13px', fontWeight: 600,
                color: 'rgba(255,255,255,0.6)', marginBottom: '6px', fontFamily: FONT,
              }}>E-poçt ünvanı</label>
              <input
                type="email" placeholder="email@aslanmedical.az"
                value={email} onChange={e => setEmail(e.target.value)}
                style={inputBase}
                onFocus={e => focusIn(e, tab.accentColor)}
                onBlur={focusOut}
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '10px' }}>
              <label style={{
                display: 'block', fontSize: '13px', fontWeight: 600,
                color: 'rgba(255,255,255,0.6)', marginBottom: '6px', fontFamily: FONT,
              }}>Şifrə</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                  style={{ ...inputBase, paddingRight: '46px' }}
                  onFocus={e => focusIn(e, tab.accentColor)}
                  onBlur={focusOut}
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  style={{
                    position: 'absolute', right: '13px', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    cursor: 'pointer', color: 'rgba(255,255,255,0.35)',
                    lineHeight: 0, padding: 0, transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
                >
                  {showPass
                    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div style={{ textAlign: 'right', marginBottom: '24px' }}>
              <span
                onClick={() => navigate('/forgot-password')}
                style={{
                  fontSize: '13px', color: tab.accentColor,
                  cursor: 'pointer', fontFamily: FONT, fontWeight: 500,
                }}
                onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
              >Şifrəni unutmusunuz?</span>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              style={{
                width: '100%', padding: '13px',
                background: loading ? '#555' : tab.btnBg,
                color: '#fff', border: 'none',
                borderRadius: '10px', fontSize: '15px',
                fontWeight: 700, fontFamily: FONT,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.2s, transform 0.15s',
                boxShadow: loading ? 'none' : `0 4px 14px ${tab.btnBg}55`,
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none'; }}
            >
              {loading ? 'Yüklənir…' : 'Daxil Ol'}
            </button>
          </form>

          {/* Patient login link */}
          <p style={{
            textAlign: 'center', marginTop: '24px',
            fontSize: '13px', color: 'rgba(255,255,255,0.3)', fontFamily: FONT,
          }}>
            Pasiyentsiniz?{' '}
            <span
              onClick={() => navigate('/login')}
              style={{ color: 'rgba(255,255,255,0.55)', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
            >Pasiyent girişi →</span>
          </p>
        </div>
      </div>
    </div>
  );
}
