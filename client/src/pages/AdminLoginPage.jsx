import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BASE } from '../api/config.js'
import { saveAccessSession } from '../utils/authSession'

const FONT = "'Source Sans 3', 'Raleway', sans-serif"
const TEAL = '#1D8B95'
const DARK_TEAL = '#0E8F96'
const NAVY = '#0B1D34'
const MUTED = '#64748B'
const TABS = ['Admin', 'Staff', 'Həkim']

const ROLE_MAP = {
  Admin: ['ADMIN', 'SUPER_ADMIN'],
  Staff: ['NURSE', 'RECEPTIONIST', 'LAB_TECHNICIAN'],
  Həkim: ['DOCTOR'],
}

const ROLE_ERROR = {
  Admin: 'adminLogin.errors.adminRole',
  Staff: 'adminLogin.errors.staffRole',
  Həkim: 'adminLogin.errors.doctorRole',
}

const roleLabelKey = (role) => ({
  Admin: 'adminLogin.roles.admin',
  Staff: 'adminLogin.roles.staff',
  Həkim: 'adminLogin.roles.doctor',
}[role] || 'adminLogin.roles.staff')

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [selectedRole, setSelectedRole] = useState('Admin')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${BASE}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || t('adminLogin.errors.request'))

      const user = data.data.user
      const allowedRoles = ROLE_MAP[selectedRole]

      if (!allowedRoles.includes(user.role)) {
        setError(t(ROLE_ERROR[selectedRole]))
        setLoading(false)
        return
      }

      saveAccessSession(data.data.accessToken, user)
      localStorage.setItem('adminToken', data.data.accessToken)
      localStorage.setItem('adminUser', JSON.stringify(user))

      if (user.role === 'DOCTOR') {
        navigate('/doctor/dashboard')
      } else {
        navigate('/admin/dashboard')
      }
    } catch (err) {
      setError(Object.values(ROLE_ERROR).includes(err.message) ? t(err.message) : t('adminLogin.errors.generic'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-page" style={{ fontFamily: FONT }}>
      <button
        type="button"
        onClick={() => navigate('/')}
        className="admin-login-back"
      >
        <ArrowLeftIcon />
        {t('adminLogin.backHome')}
      </button>

      <div className="admin-login-bg-grid" />
      <div className="admin-login-bg-mark" />

      <main className="admin-login-card" aria-label={t('adminLogin.aria')}>
        <section className="admin-login-brand">
          <img src="/logo.png" alt="Aslan Medical Center" className="admin-login-logo" />

          <div>
            <h1>{t('adminLogin.welcomeTitle')}</h1>
            <p>{t('adminLogin.welcomeText')}</p>
          </div>

          <div className="admin-login-visual" aria-hidden="true">
            <div className="visual-shield">
              <ShieldIcon />
            </div>
            <div className="visual-id-card">
              <div className="visual-avatar">
                <UserIcon />
              </div>
              <div className="visual-lines">
                <span />
                <span />
                <span />
              </div>
            </div>
            <div className="visual-check">
              <CheckIcon />
            </div>
          </div>
        </section>

        <section className="admin-login-form-panel">
          <div className="admin-login-heading">
            <h2>{t('adminLogin.title')}</h2>
            <p>{t('adminLogin.subtitle')}</p>
          </div>

          <div className="admin-login-tabs" role="tablist" aria-label={t('adminLogin.roleAria')}>
            {TABS.map(tab => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={selectedRole === tab}
                onClick={() => { setSelectedRole(tab); setError(''); setEmail('') }}
                className={selectedRole === tab ? 'admin-login-tab active' : 'admin-login-tab'}
              >
                <UserSmallIcon />
                {t(roleLabelKey(tab))}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="admin-login-form">
            <label>
              <span>{t('adminLogin.emailLabel')}</span>
              <div className="admin-login-input-wrap">
                <MailIcon />
                <input
                  type="email"
                  placeholder={selectedRole === 'Admin' ? 'admin@aslanmedical.az' : t('adminLogin.emailPlaceholder')}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </label>

            <label>
              <span>{t('adminLogin.passwordLabel')}</span>
              <div className="admin-login-input-wrap">
                <LockIcon />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="admin-login-eye"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? t('adminLogin.hidePassword') : t('adminLogin.showPassword')}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </label>

            <div className="admin-login-options">
              <span />
              <button type="button" onClick={() => navigate('/forgot-password')}>
                {t('adminLogin.forgot')}
              </button>
            </div>

            {error && (
              <div className="admin-login-error" role="alert">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="admin-login-submit">
              <span>{loading ? t('adminLogin.loading') : t('adminLogin.submit')}</span>
              <ArrowRightIcon />
            </button>
          </form>

          {selectedRole === 'Admin' && (
            <div className="admin-login-security">
              <ShieldSmallIcon />
              {t('adminLogin.secure')}
            </div>
          )}
        </section>
      </main>

      <style>{`
        .admin-login-page {
          min-height: 100vh;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 72px 22px 40px;
          overflow: hidden;
          background:
            radial-gradient(circle at top left, rgba(29, 139, 149, 0.28), transparent 35%),
            radial-gradient(circle at bottom right, rgba(29, 139, 149, 0.18), transparent 40%),
            linear-gradient(135deg, #061426 0%, ${NAVY} 100%);
        }

        .admin-login-bg-grid {
          position: absolute;
          inset: 0;
          opacity: 0.16;
          background-image: radial-gradient(rgba(230, 247, 248, 0.7) 1px, transparent 1px);
          background-size: 20px 20px;
          mask-image: linear-gradient(90deg, black 0%, transparent 46%, transparent 100%);
          pointer-events: none;
        }

        .admin-login-bg-mark {
          position: absolute;
          right: -110px;
          top: 50px;
          width: 340px;
          height: 340px;
          border: 28px solid rgba(29, 139, 149, 0.08);
          border-radius: 50%;
          box-shadow: inset 0 0 0 34px rgba(255, 255, 255, 0.025);
          pointer-events: none;
        }

        .admin-login-bg-mark::after {
          content: '';
          position: absolute;
          inset: 70px;
          border: 16px solid rgba(255, 255, 255, 0.035);
          border-radius: 50%;
        }

        .admin-login-back {
          position: absolute;
          top: 22px;
          left: 24px;
          z-index: 3;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: none;
          background: transparent;
          color: rgba(255,255,255,0.78);
          font: 600 13px ${FONT};
          cursor: pointer;
          padding: 8px 0;
        }

        .admin-login-back svg {
          width: 16px;
          height: 16px;
          color: #6EE7F0;
        }

        .admin-login-back:hover {
          color: #fff;
        }

        .admin-login-card {
          position: relative;
          z-index: 2;
          width: min(960px, calc(100vw - 32px));
          min-height: 560px;
          display: grid;
          grid-template-columns: minmax(320px, 0.95fr) minmax(360px, 1.05fr);
          overflow: hidden;
          background: #fff;
          border: 1px solid rgba(230, 247, 248, 0.34);
          border-radius: 18px;
          box-shadow: 0 28px 80px rgba(0, 0, 0, 0.34), 0 0 0 8px rgba(29, 139, 149, 0.1);
        }

        .admin-login-brand {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
          padding: 58px 42px;
          text-align: center;
          background:
            radial-gradient(circle at 50% 70%, rgba(29, 139, 149, 0.16), transparent 36%),
            linear-gradient(180deg, #F8FDFF 0%, #EFFBFC 100%);
        }

        .admin-login-brand::after {
          content: '';
          position: absolute;
          left: 28px;
          right: 28px;
          bottom: 34px;
          height: 130px;
          opacity: 0.32;
          background-image: radial-gradient(rgba(29, 139, 149, 0.44) 1px, transparent 1px);
          background-size: 13px 13px;
          mask-image: linear-gradient(0deg, black 0%, transparent 100%);
          pointer-events: none;
        }

        .admin-login-logo {
          width: min(190px, 78%);
          height: auto;
          object-fit: contain;
        }

        .admin-login-brand h1 {
          margin: 0 0 8px;
          color: ${NAVY};
          font-size: 24px;
          line-height: 1.2;
          font-weight: 800;
          letter-spacing: 0;
        }

        .admin-login-brand p {
          margin: 0 auto;
          max-width: 260px;
          color: ${MUTED};
          font-size: 14px;
          line-height: 1.55;
        }

        .admin-login-visual {
          position: relative;
          width: min(300px, 100%);
          height: 220px;
          margin-top: 8px;
        }

        .visual-shield {
          position: absolute;
          left: 18px;
          top: 10px;
          width: 150px;
          height: 160px;
          color: rgba(29, 139, 149, 0.28);
          filter: drop-shadow(0 16px 28px rgba(29, 139, 149, 0.2));
        }

        .visual-shield svg {
          width: 100%;
          height: 100%;
        }

        .visual-id-card {
          position: absolute;
          right: 14px;
          bottom: 22px;
          width: 190px;
          min-height: 104px;
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          box-sizing: border-box;
          background: rgba(255, 255, 255, 0.78);
          border: 1px solid rgba(29, 139, 149, 0.16);
          border-radius: 16px;
          box-shadow: 0 18px 40px rgba(11, 29, 52, 0.12);
          backdrop-filter: blur(8px);
        }

        .visual-avatar {
          width: 56px;
          height: 56px;
          flex: 0 0 56px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #CFF5F6;
          color: ${TEAL};
        }

        .visual-avatar svg {
          width: 31px;
          height: 31px;
        }

        .visual-lines {
          display: grid;
          gap: 10px;
          flex: 1;
        }

        .visual-lines span {
          height: 7px;
          border-radius: 99px;
          background: #9FDDE1;
        }

        .visual-lines span:nth-child(2) {
          width: 80%;
        }

        .visual-lines span:nth-child(3) {
          width: 58%;
        }

        .visual-check {
          position: absolute;
          right: 2px;
          bottom: 16px;
          width: 54px;
          height: 54px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: linear-gradient(135deg, ${TEAL}, #27B3BB);
          color: #fff;
          box-shadow: 0 16px 34px rgba(29, 139, 149, 0.34);
        }

        .visual-check svg {
          width: 30px;
          height: 30px;
        }

        .admin-login-form-panel {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 58px 54px;
          background: #fff;
        }

        .admin-login-heading {
          text-align: center;
          margin-bottom: 28px;
        }

        .admin-login-heading h2 {
          margin: 0 0 8px;
          color: ${NAVY};
          font-size: 25px;
          line-height: 1.2;
          font-weight: 800;
          letter-spacing: 0;
        }

        .admin-login-heading p {
          margin: 0;
          color: ${MUTED};
          font-size: 14px;
          line-height: 1.4;
        }

        .admin-login-tabs {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 30px;
        }

        .admin-login-tab {
          min-height: 46px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          background: #fff;
          color: ${NAVY};
          font: 700 13px ${FONT};
          cursor: pointer;
          transition: background 0.16s, border-color 0.16s, color 0.16s, box-shadow 0.16s;
        }

        .admin-login-tab svg {
          width: 16px;
          height: 16px;
          color: ${TEAL};
        }

        .admin-login-tab.active {
          border-color: ${TEAL};
          background: ${TEAL};
          color: #fff;
          box-shadow: 0 10px 20px rgba(29, 139, 149, 0.22);
        }

        .admin-login-tab.active svg {
          color: #fff;
        }

        .admin-login-form {
          display: grid;
          gap: 18px;
        }

        .admin-login-form label {
          display: grid;
          gap: 7px;
          color: ${NAVY};
          font-size: 13px;
          font-weight: 700;
        }

        .admin-login-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .admin-login-input-wrap > svg {
          position: absolute;
          left: 14px;
          width: 18px;
          height: 18px;
          color: #94A3B8;
          pointer-events: none;
        }

        .admin-login-input-wrap input {
          width: 100%;
          height: 47px;
          box-sizing: border-box;
          border: 1px solid #DCE4EE;
          border-radius: 8px;
          background: #fff;
          color: ${NAVY};
          outline: none;
          padding: 0 44px;
          font: 600 14px ${FONT};
          transition: border-color 0.16s, box-shadow 0.16s;
        }

        .admin-login-input-wrap input::placeholder {
          color: #94A3B8;
          font-weight: 500;
        }

        .admin-login-input-wrap input:focus {
          border-color: ${TEAL};
          box-shadow: 0 0 0 4px rgba(29, 139, 149, 0.12);
        }

        .admin-login-eye {
          position: absolute;
          right: 12px;
          width: 32px;
          height: 32px;
          display: grid;
          place-items: center;
          border: none;
          background: transparent;
          color: #64748B;
          cursor: pointer;
          padding: 0;
        }

        .admin-login-eye svg {
          width: 18px;
          height: 18px;
        }

        .admin-login-eye:hover {
          color: ${TEAL};
        }

        .admin-login-options {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: -2px;
        }

        .admin-login-options button {
          border: none;
          background: transparent;
          color: ${TEAL};
          font: 700 13px ${FONT};
          cursor: pointer;
          padding: 0;
        }

        .admin-login-options button:hover {
          color: ${DARK_TEAL};
          text-decoration: underline;
        }

        .admin-login-error {
          border: 1px solid #FECACA;
          border-radius: 10px;
          background: #FEF2F2;
          color: #DC2626;
          padding: 11px 13px;
          font-size: 13px;
          font-weight: 700;
          line-height: 1.35;
        }

        .admin-login-submit {
          height: 52px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          border: none;
          border-radius: 9px;
          background: ${TEAL};
          color: #fff;
          font: 800 15px ${FONT};
          cursor: pointer;
          box-shadow: 0 14px 24px rgba(29, 139, 149, 0.24);
          transition: background 0.16s, transform 0.16s, box-shadow 0.16s, opacity 0.16s;
        }

        .admin-login-submit svg {
          width: 18px;
          height: 18px;
        }

        .admin-login-submit:hover:not(:disabled) {
          background: ${DARK_TEAL};
          transform: translateY(-1px);
          box-shadow: 0 17px 28px rgba(29, 139, 149, 0.28);
        }

        .admin-login-submit:disabled {
          cursor: not-allowed;
          opacity: 0.68;
          box-shadow: none;
        }

        .admin-login-security {
          margin-top: 30px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #94A3B8;
          font-size: 12px;
          font-weight: 600;
        }

        .admin-login-security svg {
          width: 15px;
          height: 15px;
        }

        @media (max-width: 820px) {
          .admin-login-page {
            align-items: flex-start;
            padding: 72px 16px 28px;
            overflow: auto;
          }

          .admin-login-card {
            width: min(560px, calc(100vw - 32px));
            grid-template-columns: 1fr;
            min-height: 0;
          }

          .admin-login-brand {
            padding: 34px 28px 28px;
            gap: 16px;
          }

          .admin-login-visual {
            height: 150px;
            max-width: 260px;
          }

          .visual-shield {
            width: 116px;
            height: 124px;
          }

          .visual-id-card {
            width: 170px;
            min-height: 86px;
            padding: 16px;
          }

          .visual-avatar {
            width: 46px;
            height: 46px;
            flex-basis: 46px;
          }

          .visual-check {
            width: 44px;
            height: 44px;
          }

          .admin-login-form-panel {
            padding: 34px 28px 36px;
          }
        }

        @media (max-width: 480px) {
          .admin-login-back {
            left: 18px;
          }

          .admin-login-card {
            width: 100%;
            border-radius: 16px;
          }

          .admin-login-brand {
            padding: 30px 20px 22px;
          }

          .admin-login-logo {
            width: 158px;
          }

          .admin-login-brand h1,
          .admin-login-heading h2 {
            font-size: 22px;
          }

          .admin-login-visual {
            display: none;
          }

          .admin-login-form-panel {
            padding: 30px 20px 32px;
          }

          .admin-login-tabs {
            gap: 8px;
          }

          .admin-login-tab {
            min-height: 42px;
            gap: 5px;
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  )
}

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  )
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-10 6L2 7" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="M14.12 14.12a3 3 0 0 1-4.24-4.24" />
      <path d="m1 1 22 22" />
    </svg>
  )
}

function UserSmallIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5Zm0 2c-3.34 0-8 1.68-8 5v1.5c0 .83.67 1.5 1.5 1.5h13c.83 0 1.5-.67 1.5-1.5V19c0-3.32-4.66-5-8-5Z" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 120 140" fill="none">
      <path d="M60 8 108 30v34c0 37-25 56-48 68C37 120 12 101 12 64V30L60 8Z" fill="currentColor" />
      <path d="M60 24 94 39v27c0 26-16 42-34 53-18-11-34-27-34-53V39l34-15Z" fill="rgba(255,255,255,0.42)" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function ShieldSmallIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}
