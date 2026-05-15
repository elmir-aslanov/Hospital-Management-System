/* eslint-disable */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../../api/axios';

const FONT = "'Source Sans 3', 'Raleway', sans-serif";
const TEAL = '#00848e';

const TABS = [
  { key: 'patient', label: 'Pasiyent', icon: '🧑‍⚕️' },
  { key: 'doctor',  label: 'Həkim',    icon: '👨‍⚕️' },
  { key: 'admin',   label: 'Admin',    icon: '🔐' },
];

const FORM_TITLE = { patient: 'Pasiyent Girişi', doctor: 'Həkim Girişi', admin: 'Admin Girişi' };

const DAYS   = Array.from({ length: 31 }, (_, i) => i + 1);
const MONTHS = ['Yanvar','Fevral','Mart','Aprel','May','İyun','İyul','Avqust','Sentyabr','Oktyabr','Noyabr','Dekabr'];
const YEARS  = Array.from({ length: 71 }, (_, i) => 2005 - i);

/* ── Input wrapper with floating label ─────────────── */
function Field({ label, children }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{
        display: 'block', fontSize: '12px',
        color: '#718096', marginBottom: '6px',
        fontFamily: FONT, fontWeight: 500,
      }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '12px 16px',
  border: '1.5px solid #e2e8f0',
  borderRadius: '8px', fontSize: '15px',
  fontFamily: FONT, color: '#1a2b4a',
  background: '#fff', outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};

const selectStyle = {
  ...inputStyle,
  appearance: 'none', cursor: 'pointer',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23718096' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 14px center',
  paddingRight: '36px',
};

function focusIn(e)  { e.target.style.borderColor = TEAL; }
function focusOut(e) { e.target.style.borderColor = '#e2e8f0'; }

/* ── SVG Illustration ────────────────────────────────── */
function MedIllustration() {
  return (
    <svg viewBox="0 0 220 180" width="200" style={{ opacity: 0.85 }} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="30" width="140" height="120" rx="14" fill="#e8f4f8"/>
      <rect x="60" y="50" width="100" height="12" rx="6" fill="#b2dce8"/>
      <rect x="60" y="72" width="80" height="10" rx="5" fill="#cce8f0"/>
      <rect x="60" y="90" width="90" height="10" rx="5" fill="#cce8f0"/>
      <rect x="60" y="108" width="60" height="10" rx="5" fill="#cce8f0"/>
      <circle cx="155" cy="60" r="26" fill={TEAL} opacity="0.15"/>
      <circle cx="155" cy="54" r="11" fill={TEAL}/>
      <path d="M138 83c0-9.4 7.6-17 17-17s17 7.6 17 17" fill={TEAL}/>
      <rect x="80" y="128" width="60" height="8" rx="4" fill={TEAL} opacity="0.3"/>
    </svg>
  );
}

/* ── Main Page ───────────────────────────────────────── */
export default function Login() {
  const navigate = useNavigate();
  const [role, setRole]         = useState('patient');
  const [loading, setLoading]   = useState(false);

  // Patient fields
  const [finCode, setFinCode]   = useState('');
  const [day, setDay]           = useState('');
  const [month, setMonth]       = useState('');
  const [year, setYear]         = useState('');

  // Doctor / Admin fields
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (role === 'patient') {
      if (!finCode.trim() || !day || !month || !year) {
        toast.warning('Zəhmət olmasa bütün məcburi sahələri doldurun.');
        return;
      }
    } else {
      if (!email.trim() || !password.trim()) {
        toast.warning('Zəhmət olmasa bütün məcburi sahələri doldurun.');
        return;
      }
    }

    const monthIndex = String(MONTHS.indexOf(month) + 1).padStart(2, '0');
    const payload = role === 'patient'
      ? { finCode: finCode.trim(), birthDate: `${year}-${monthIndex}-${String(day).padStart(2,'0')}`, role }
      : { email: email.trim(), password, role };

    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', payload);
      localStorage.setItem('token', data.data?.accessToken || data.token || '');
      localStorage.setItem('user', JSON.stringify(data.data?.user || data.user || {}));

      if (role === 'patient') {
        toast.success('Xoş gəldiniz!');
        navigate('/patient');
      } else if (role === 'doctor') {
        toast.success('Xoş gəldiniz, Dr.!');
        navigate('/dashboard/doctor');
      } else {
        toast.success('Admin panelinə xoş gəldiniz!');
        navigate('/dashboard');
      }
    } catch {
      toast.error('Məlumatlar yanlışdır.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#f0f4f8',
      padding: '40px 6vw', fontFamily: FONT,
    }}>

      {/* Breadcrumb */}
      <nav style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        fontSize: '14px', color: '#718096', marginBottom: '32px',
      }}>
        <span onClick={() => navigate('/')} style={{ cursor: 'pointer', fontSize: '16px' }}>🏠</span>
        <span>›</span>
        <span style={{ color: TEAL, fontWeight: 500 }}>Giriş</span>
      </nav>

      {/* Page title */}
      <h1 style={{
        fontSize: '36px', fontWeight: 700,
        color: TEAL, marginBottom: '8px', fontFamily: FONT,
      }}>Sistemə Giriş</h1>
      <p style={{ fontSize: '15px', color: '#718096', marginBottom: '40px', fontFamily: FONT }}>
        Rolunuzu seçin və sistemə daxil olun.
      </p>

      {/* Two-column layout */}
      <div style={{
        display: 'flex', gap: '28px', alignItems: 'flex-start',
        maxWidth: '1100px',
      }}>

        {/* ── LEFT — Login form card ──────────────────── */}
        <div style={{
          flex: '0 0 58%',
          background: '#fff', borderRadius: '16px',
          padding: '40px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        }}>

          {/* Role tabs */}
          <div style={{
            display: 'flex', gap: '8px',
            background: '#f0f4f8', borderRadius: '12px',
            padding: '6px', marginBottom: '32px',
          }}>
            {TABS.map(tab => (
              <button key={tab.key} onClick={() => setRole(tab.key)}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: '6px',
                  padding: '10px 24px', borderRadius: '8px',
                  border: 'none', cursor: 'pointer',
                  fontSize: '14px', fontWeight: 600, fontFamily: FONT,
                  background: role === tab.key ? TEAL : 'transparent',
                  color: role === tab.key ? '#fff' : '#4a5568',
                  transition: 'all 0.2s',
                  boxShadow: role === tab.key ? '0 2px 8px rgba(0,132,142,0.3)' : 'none',
                }}
              >
                <span>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>

          {/* Form title */}
          <h2 style={{
            fontSize: '22px', fontWeight: 700,
            color: TEAL, marginBottom: '28px', fontFamily: FONT,
          }}>{FORM_TITLE[role]}</h2>

          <form onSubmit={handleSubmit}>

            {/* ── PATIENT FIELDS ── */}
            {role === 'patient' && (
              <>
                <Field label="Ölkə">
                  <select style={selectStyle} defaultValue="Azərbaycan" onFocus={focusIn} onBlur={focusOut}>
                    <option>Azərbaycan</option>
                    <option>Türkiyə</option>
                    <option>Rusiya</option>
                  </select>
                </Field>

                <Field label="ŞV FİN kod">
                  <input
                    type="text" placeholder="ŞV FİN kod"
                    value={finCode} onChange={e => setFinCode(e.target.value)}
                    style={inputStyle} onFocus={focusIn} onBlur={focusOut}
                    maxLength={7}
                  />
                </Field>

                <Field label="Doğum tarixi">
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <select value={day} onChange={e => setDay(e.target.value)}
                      style={{ ...selectStyle, flex: 1 }} onFocus={focusIn} onBlur={focusOut}>
                      <option value="">Gün</option>
                      {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <select value={month} onChange={e => setMonth(e.target.value)}
                      style={{ ...selectStyle, flex: 1 }} onFocus={focusIn} onBlur={focusOut}>
                      <option value="">Ay</option>
                      {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <select value={year} onChange={e => setYear(e.target.value)}
                      style={{ ...selectStyle, flex: 1 }} onFocus={focusIn} onBlur={focusOut}>
                      <option value="">İl</option>
                      {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </Field>
              </>
            )}

            {/* ── DOCTOR / ADMIN FIELDS ── */}
            {(role === 'doctor' || role === 'admin') && (
              <>
                <Field label="E-poçt">
                  <input
                    type="email" placeholder="email@example.com"
                    value={email} onChange={e => setEmail(e.target.value)}
                    style={inputStyle} onFocus={focusIn} onBlur={focusOut}
                  />
                </Field>

                <Field label="Şifrə">
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPass ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password} onChange={e => setPassword(e.target.value)}
                      style={{ ...inputStyle, paddingRight: '48px' }}
                      onFocus={focusIn} onBlur={focusOut}
                    />
                    <button type="button" onClick={() => setShowPass(v => !v)}
                      style={{
                        position: 'absolute', right: '14px', top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none', border: 'none',
                        cursor: 'pointer', color: '#718096', lineHeight: 0, padding: 0,
                      }}>
                      {showPass
                        ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      }
                    </button>
                  </div>
                </Field>
              </>
            )}

            <button type="submit" disabled={loading}
              style={{
                width: '100%', padding: '14px',
                background: role === 'admin'
                  ? (loading ? '#334' : '#1a2b4a')
                  : (loading ? '#5aacb2' : TEAL),
                color: '#fff', border: 'none',
                borderRadius: '8px', fontSize: '16px',
                fontWeight: 700, fontFamily: FONT,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s, transform 0.15s',
                marginTop: '8px',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.9'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
            >
              {loading ? 'Yüklənir…' : role === 'admin' ? 'Admin Girişi' : 'Daxil Ol'}
            </button>
          </form>
        </div>

        {/* ── RIGHT — Info card ───────────────────────── */}
        <div style={{
          flex: 1,
          background: '#fff', borderRadius: '16px',
          padding: '40px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          display: 'flex', flexDirection: 'column', gap: '20px',
        }}>
          <h2 style={{
            fontSize: '22px', fontWeight: 700,
            color: TEAL, fontFamily: FONT, margin: 0,
          }}>Hesabınız yoxdur?</h2>

          <p style={{ fontSize: '14px', color: '#718096', lineHeight: 1.7, margin: 0, fontFamily: FONT }}>
            Qeydiyyatdan keçərək pasiyent portalına daxil ola
            və randevu ala bilərsiniz.
          </p>

          <button
            onClick={() => navigate('/register')}
            style={{
              display: 'inline-block', padding: '12px 24px',
              border: `2px solid ${TEAL}`, color: TEAL,
              background: 'transparent', borderRadius: '8px',
              fontSize: '14px', fontWeight: 700, fontFamily: FONT,
              cursor: 'pointer', transition: 'all 0.2s',
              alignSelf: 'flex-start',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = TEAL; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = TEAL; }}
          >
            İndi Qeydiyyatdan Keçin!
          </button>

          {/* Illustration */}
          <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
            <MedIllustration />
          </div>

          {/* Contact */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <a href="tel:+994508363694" style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              fontSize: '13px', color: '#718096', textDecoration: 'none',
              fontFamily: FONT, transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.color = TEAL}
              onMouseLeave={e => e.currentTarget.style.color = '#718096'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 5.5 5.5l.76-.76a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 16.92z"/>
              </svg>
              +994 50 836 36 94
            </a>
            <a href="mailto:info@aslanmedical.az" style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              fontSize: '13px', color: '#718096', textDecoration: 'none',
              fontFamily: FONT, transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.color = TEAL}
              onMouseLeave={e => e.currentTarget.style.color = '#718096'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              info@aslanmedical.az
            </a>
          </div>
        </div>
      </div>

      {/* Mobile styles */}
      <style>{`
        @media (max-width: 768px) {
          .login-cols { flex-direction: column !important; }
        }
      `}</style>
    </div>
  );
}
