import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'

const FONT = "'Source Sans 3', 'Raleway', sans-serif"
const TEAL = '#00848e'
const NAVY = '#0a1628'

function strengthOf(p) {
  if (p.length === 0) return null
  const strong = p.length >= 8 && /[^a-zA-Z0-9]/.test(p) && /[0-9]/.test(p)
  const medium = p.length >= 8
  if (strong) return { label: 'Güclü',  color: '#16a34a', width: '100%' }
  if (medium) return { label: 'Orta',   color: '#ea580c', width: '60%'  }
  return         { label: 'Zəif',   color: '#dc2626', width: '30%'  }
}

const EyeOpen = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)
const EyeOff = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

function Field({ label, children, hint }) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>
        {label}
      </label>
      {children}
      {hint && <p style={{ fontSize: 11, color: '#94a3b8', margin: '4px 0 0' }}>{hint}</p>}
    </div>
  )
}

function TextInput({ value, onChange, placeholder, disabled, style = {} }) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      style={{
        width: '100%', height: 42, padding: '0 14px',
        border: '1.5px solid #e2e8f0', borderRadius: 9,
        fontSize: 14, fontFamily: FONT, outline: 'none',
        boxSizing: 'border-box', transition: 'border-color 0.2s',
        background: disabled ? '#f8fafc' : 'white',
        color: disabled ? '#94a3b8' : 'inherit',
        cursor: disabled ? 'not-allowed' : 'text',
        ...style,
      }}
      onFocus={e => { if (!disabled) e.target.style.borderColor = TEAL }}
      onBlur={e => { e.target.style.borderColor = '#e2e8f0' }}
    />
  )
}

function PasswordInput({ value, onChange, placeholder, show, onToggle }) {
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: '100%', height: 42, padding: '0 42px 0 14px',
          border: '1.5px solid #e2e8f0', borderRadius: 9,
          fontSize: 14, fontFamily: FONT, outline: 'none',
          boxSizing: 'border-box', transition: 'border-color 0.2s',
        }}
        onFocus={e => (e.target.style.borderColor = TEAL)}
        onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
      />
      <button
        type="button"
        onClick={onToggle}
        style={{
          position: 'absolute', right: 12, top: '50%',
          transform: 'translateY(-50%)',
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#94a3b8', padding: 0, display: 'flex',
        }}
      >
        {show ? <EyeOff /> : <EyeOpen />}
      </button>
    </div>
  )
}

export default function UserProfilePage() {
  const navigate = useNavigate()

  const [tab, setTab]     = useState('profile')
  const [user, setUser]   = useState(null)
  const [loading, setLoading] = useState(true)

  // Profile tab
  const [fullName, setFullName]         = useState('')
  const [phone, setPhone]               = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg, setProfileMsg]     = useState('')

  // Password tab
  const [currentPass, setCurrentPass]   = useState('')
  const [newPass, setNewPass]           = useState('')
  const [confirmPass, setConfirmPass]   = useState('')
  const [passSaving, setPassSaving]     = useState(false)
  const [passMsg, setPassMsg]           = useState('')
  const [passErr, setPassErr]           = useState('')
  const [showCurrent, setShowCurrent]   = useState(false)
  const [showNew, setShowNew]           = useState(false)

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user') || '{}')
    setUser(u)
    setFullName(u.fullName || '')
    setPhone(u.phone || '')
    setLoading(false)
  }, [])

  const saveProfile = async () => {
    setProfileSaving(true)
    setProfileMsg('')
    try {
      const res     = await api.put('/users/me', { fullName: fullName.trim(), phone: phone.trim() })
      const updated = res.data?.data || res.data
      const stored  = JSON.parse(localStorage.getItem('user') || '{}')
      localStorage.setItem('user', JSON.stringify({
        ...stored,
        fullName: updated.fullName || fullName,
        phone:    updated.phone    || phone,
      }))
      setProfileMsg('✓ Yadda saxlandı')
      setTimeout(() => setProfileMsg(''), 3000)
    } catch (e) {
      setProfileMsg('✗ ' + (e.response?.data?.message || 'Xəta baş verdi'))
    } finally {
      setProfileSaving(false)
    }
  }

  const changePassword = async () => {
    setPassErr('')
    setPassMsg('')
    if (!currentPass)            { setPassErr('Cari şifrəni daxil edin'); return }
    if (newPass.length < 8)      { setPassErr('Yeni şifrə minimum 8 simvol olmalıdır'); return }
    if (newPass !== confirmPass)  { setPassErr('Şifrələr uyğun gəlmir'); return }
    setPassSaving(true)
    try {
      await api.post('/auth/change-password', { currentPassword: currentPass, newPassword: newPass })
      setPassMsg('✓ Şifrə uğurla dəyişdirildi')
      setCurrentPass(''); setNewPass(''); setConfirmPass('')
      setTimeout(() => setPassMsg(''), 3000)
    } catch (e) {
      setPassErr(e.response?.data?.message || 'Xəta baş verdi')
      setTimeout(() => setPassErr(''), 3000)
    } finally {
      setPassSaving(false)
    }
  }

  const strength = strengthOf(newPass)

  if (loading) return null

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: FONT, paddingTop: 130 }}>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '32px 20px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'linear-gradient(135deg, #00848e, #0a1628)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: 'white' }}>
              {(user?.fullName || 'U')[0].toUpperCase()}
            </span>
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: NAVY }}>
              {user?.fullName || '—'}
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>{user?.email || '—'}</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: 4, background: '#f1f5f9',
          borderRadius: 10, padding: 4, marginBottom: 24,
        }}>
          {[
            { key: 'profile',  label: '👤 Profil' },
            { key: 'password', label: '🔒 Şifrə'  },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                flex: 1, padding: '9px 0', borderRadius: 8,
                border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, fontFamily: FONT,
                background: tab === t.key ? 'white' : 'transparent',
                color: tab === t.key ? TEAL : '#64748b',
                boxShadow: tab === t.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Card */}
        <div style={{
          background: 'white', borderRadius: 16, padding: '28px 28px',
          border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        }}>

          {/* ── PROFILE TAB ── */}
          {tab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <Field label="Ad Soyad">
                <TextInput
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Ad Soyad"
                />
              </Field>

              <Field label="E-poçt" hint="E-poçt dəyişdirilə bilməz">
                <TextInput value={user?.email || ''} disabled />
              </Field>

              <Field label="Telefon">
                <TextInput
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+994XXXXXXXXX"
                />
              </Field>

              {profileMsg && (
                <p style={{
                  fontSize: 13, margin: 0,
                  color: profileMsg.startsWith('✓') ? '#16a34a' : '#dc2626',
                }}>
                  {profileMsg}
                </p>
              )}

              <button
                onClick={saveProfile}
                disabled={profileSaving}
                style={{
                  height: 42,
                  background: profileSaving ? '#94a3b8' : TEAL,
                  color: 'white', border: 'none', borderRadius: 9,
                  fontSize: 14, fontWeight: 600, fontFamily: FONT,
                  cursor: profileSaving ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                {profileSaving ? 'Saxlanır...' : 'Yadda saxla'}
              </button>
            </div>
          )}

          {/* ── PASSWORD TAB ── */}
          {tab === 'password' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              <Field label="Cari şifrə">
                <PasswordInput
                  value={currentPass}
                  onChange={e => setCurrentPass(e.target.value)}
                  placeholder="Mövcud şifrənizi daxil edin"
                  show={showCurrent}
                  onToggle={() => setShowCurrent(s => !s)}
                />
              </Field>

              <Field label="Yeni şifrə">
                <PasswordInput
                  value={newPass}
                  onChange={e => setNewPass(e.target.value)}
                  placeholder="Minimum 8 simvol"
                  show={showNew}
                  onToggle={() => setShowNew(s => !s)}
                />
                {strength && (
                  <div style={{ marginTop: 6 }}>
                    <div style={{ height: 4, background: '#e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: strength.width,
                        background: strength.color, borderRadius: 2,
                        transition: 'all 0.3s',
                      }} />
                    </div>
                    <span style={{ fontSize: 11, color: strength.color, fontWeight: 600, marginTop: 3, display: 'block' }}>
                      {strength.label}
                    </span>
                  </div>
                )}
              </Field>

              <Field label="Şifrəni təsdiqlə">
                <input
                  type="password"
                  value={confirmPass}
                  onChange={e => setConfirmPass(e.target.value)}
                  placeholder="Yeni şifrəni təkrar daxil edin"
                  style={{
                    width: '100%', height: 42, padding: '0 14px',
                    border: `1.5px solid ${confirmPass && confirmPass !== newPass ? '#dc2626' : '#e2e8f0'}`,
                    borderRadius: 9, fontSize: 14, fontFamily: FONT,
                    outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
                  }}
                  onFocus={e => (e.target.style.borderColor = confirmPass !== newPass ? '#dc2626' : TEAL)}
                  onBlur={e => (e.target.style.borderColor = confirmPass && confirmPass !== newPass ? '#dc2626' : '#e2e8f0')}
                />
                {confirmPass && confirmPass !== newPass && (
                  <p style={{ fontSize: 11, color: '#dc2626', margin: '4px 0 0' }}>
                    Şifrələr uyğun gəlmir
                  </p>
                )}
              </Field>

              {passErr && (
                <p style={{
                  fontSize: 13, color: '#dc2626', margin: 0,
                  background: '#fef2f2', padding: '10px 12px', borderRadius: 8,
                }}>
                  {passErr}
                </p>
              )}
              {passMsg && (
                <p style={{ fontSize: 13, color: '#16a34a', margin: 0 }}>{passMsg}</p>
              )}

              <button
                onClick={changePassword}
                disabled={passSaving}
                style={{
                  height: 42,
                  background: passSaving ? '#94a3b8' : NAVY,
                  color: 'white', border: 'none', borderRadius: 9,
                  fontSize: 14, fontWeight: 600, fontFamily: FONT,
                  cursor: passSaving ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                {passSaving ? 'Dəyişdirilir...' : 'Şifrəni dəyiş'}
              </button>

            </div>
          )}

        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
