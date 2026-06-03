import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

const FONT = "'Source Sans 3','Raleway',sans-serif"
const TEAL = '#1D8B95'
const DARK_TEAL = '#0E8F96'
const NAVY = '#0B1D34'
const PAGE_BG = '#F8FAFC'
const CARD_BORDER = '#E2E8F0'
const MUTED = '#64748B'
const SUCCESS = '#16A34A'
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

const safeParseUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null')
  } catch {
    return null
  }
}

const getToken = () => localStorage.getItem('token') || localStorage.getItem('adminToken') || ''

const getInitial = (name, email) => {
  const source = (name || email || 'U').trim()
  return source ? source[0].toUpperCase() : 'U'
}

const roleLabel = (role) => {
  const map = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN: 'Admin',
    DOCTOR: 'Həkim',
    NURSE: 'Tibb bacısı',
    RECEPTIONIST: 'Qeydiyyat',
    LAB_TECHNICIAN: 'Laboratoriya',
    PATIENT: 'Pasiyent',
  }
  return map[role] || role || 'İstifadəçi'
}

const formatDate = (value) => {
  if (!value) return 'Qeyd olunmayıb'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Qeyd olunmayıb'
  return date.toLocaleDateString('az-AZ', { year: 'numeric', month: 'long', day: 'numeric' })
}

function Card({ children, style = {} }) {
  return (
    <section style={{
      background: '#fff',
      border: `1px solid ${CARD_BORDER}`,
      borderRadius: 8,
      boxShadow: '0 18px 45px rgba(11, 29, 52, 0.08)',
      ...style,
    }}>
      {children}
    </section>
  )
}

function Field({ label, children, hint, style = {} }) {
  return (
    <label style={{ display: 'block', ...style }}>
      <span style={{ display: 'block', marginBottom: 7, color: '#334155', fontSize: 13, fontWeight: 700 }}>
        {label}
      </span>
      {children}
      {hint && <span style={{ display: 'block', marginTop: 6, color: MUTED, fontSize: 12 }}>{hint}</span>}
    </label>
  )
}

function TextInput({ value, onChange, placeholder, disabled, type = 'text', style = {} }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      style={{
        width: '100%',
        height: 44,
        border: `1px solid ${CARD_BORDER}`,
        borderRadius: 8,
        background: disabled ? '#F8FAFC' : '#fff',
        color: disabled ? MUTED : NAVY,
        cursor: disabled ? 'not-allowed' : 'text',
        fontFamily: FONT,
        fontSize: 14,
        outline: 'none',
        padding: '0 14px',
        transition: 'border-color 0.18s, box-shadow 0.18s',
        ...style,
      }}
      onFocus={e => {
        if (!disabled) {
          e.currentTarget.style.borderColor = TEAL
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(29, 139, 149, 0.13)'
        }
      }}
      onBlur={e => {
        e.currentTarget.style.borderColor = CARD_BORDER
        e.currentTarget.style.boxShadow = 'none'
      }}
    />
  )
}

function PasswordField({ label, value, onChange, placeholder, style = {} }) {
  const [visible, setVisible] = useState(false)

  return (
    <Field label={label} style={style}>
      <div style={{ position: 'relative' }}>
        <TextInput
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{ paddingRight: 44 }}
        />
        <button
          type="button"
          aria-label={visible ? 'Şifrəni gizlət' : 'Şifrəni göstər'}
          onClick={() => setVisible(v => !v)}
          style={{
            position: 'absolute',
            right: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 32,
            height: 32,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            borderRadius: 8,
            background: 'transparent',
            color: MUTED,
            cursor: 'pointer',
          }}
        >
          {visible ? (
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M17.94 17.94A10.9 10.9 0 0 1 12 20C5 20 1 12 1 12a20.3 20.3 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A10.7 10.7 0 0 1 12 4c7 0 11 8 11 8a20.7 20.7 0 0 1-2.16 3.19" />
              <path d="M14.12 14.12a3 3 0 0 1-4.24-4.24" />
              <path d="M1 1l22 22" />
            </svg>
          ) : (
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
    </Field>
  )
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '10px 0', borderBottom: '1px solid #EEF2F6' }}>
      <span style={{ color: MUTED, fontSize: 13 }}>{label}</span>
      <strong style={{ color: NAVY, fontSize: 13, fontWeight: 700, textAlign: 'right', overflowWrap: 'anywhere' }}>
        {value || 'Qeyd olunmayıb'}
      </strong>
    </div>
  )
}

function ActionRow({ message, error, saving, buttonText, savingText, buttonColor, onHoverColor }) {
  return (
    <div className="profile-action-row" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      marginTop: 4,
      paddingTop: 18,
      borderTop: `1px solid ${CARD_BORDER}`,
    }}>
      <div aria-live="polite" style={{ minHeight: 22, minWidth: 0 }}>
        {(message || error) && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            minHeight: 34,
            borderRadius: 8,
            padding: '7px 11px',
            background: message ? '#ECFDF3' : '#FEF2F2',
            color: message ? SUCCESS : '#B42318',
            fontSize: 13,
            fontWeight: 800,
          }}>
            {message || error}
          </div>
        )}
      </div>
      <button
        type="submit"
        disabled={saving}
        style={{
          width: 'fit-content',
          minWidth: 158,
          height: 42,
          border: 'none',
          borderRadius: 8,
          background: saving ? '#94A3B8' : buttonColor,
          color: '#fff',
          cursor: saving ? 'not-allowed' : 'pointer',
          fontFamily: FONT,
          fontSize: 14,
          fontWeight: 800,
          padding: '0 18px',
          boxShadow: saving ? 'none' : '0 10px 20px rgba(14, 143, 150, 0.18)',
          transition: 'background 0.18s, transform 0.18s, box-shadow 0.18s',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => {
          if (!saving) {
            e.currentTarget.style.background = onHoverColor
            e.currentTarget.style.transform = 'translateY(-1px)'
          }
        }}
        onMouseLeave={e => {
          if (!saving) {
            e.currentTarget.style.background = buttonColor
            e.currentTarget.style.transform = 'translateY(0)'
          }
        }}
      >
        {saving ? savingText : buttonText}
      </button>
    </div>
  )
}

export default function UserProfilePage() {
  const { t } = useTranslation()
  const initialUser = useMemo(() => safeParseUser(), [])
  const [activeTab, setActiveTab] = useState('profile')
  const [user, setUser] = useState(initialUser)
  const [fullName, setFullName] = useState(initialUser?.fullName || initialUser?.name || '')
  const [phone, setPhone] = useState(initialUser?.phone || '')
  const [profileMessage, setProfileMessage] = useState('')
  const [profileError, setProfileError] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)

  const displayName = fullName || user?.fullName || user?.name || 'İstifadəçi'
  const email = user?.email || 'E-poçt qeyd olunmayıb'
  const role = roleLabel(user?.role)
  const initial = useMemo(() => getInitial(displayName, user?.email), [displayName, user?.email])

  const clearProfileNotice = () => {
    window.setTimeout(() => {
      setProfileMessage('')
      setProfileError('')
    }, 3000)
  }

  const clearPasswordNotice = () => {
    window.setTimeout(() => {
      setPasswordMessage('')
      setPasswordError('')
    }, 3000)
  }

  const handleProfileSubmit = async (event) => {
    event.preventDefault()
    setProfileMessage('')
    setProfileError('')
    setProfileSaving(true)

    try {
      const token = getToken()
      const response = await fetch(`${API_BASE}/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ fullName: fullName.trim(), phone: phone.trim() }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data?.message || 'Məlumatları yadda saxlamaq mümkün olmadı')

      const updatedUser = {
        ...(user || {}),
        ...(data?.data || {}),
        fullName: data?.data?.fullName || fullName.trim(),
        phone: data?.data?.phone || phone.trim(),
      }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      window.dispatchEvent(new Event('storage'))
      setUser(updatedUser)
      setProfileMessage(t('profile.saved'))
      clearProfileNotice()
    } catch (error) {
      setProfileError(error.message || 'Xəta baş verdi')
      clearProfileNotice()
    } finally {
      setProfileSaving(false)
    }
  }

  const handlePasswordSubmit = async (event) => {
    event.preventDefault()
    setPasswordMessage('')
    setPasswordError('')

    if (!currentPassword.trim()) {
      setPasswordError('Cari şifrəni daxil edin')
      return
    }
    if (newPassword.length < 8) {
      setPasswordError('Yeni şifrə minimum 8 simvol olmalıdır')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Təsdiq şifrəsi uyğun deyil')
      return
    }

    setPasswordSaving(true)
    try {
      const token = getToken()
      const response = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data?.message || 'Şifrəni dəyişmək mümkün olmadı')

      setPasswordMessage('✓ Şifrə uğurla dəyişdirildi')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      clearPasswordNotice()
    } catch (error) {
      setPasswordError(error.message || 'Xəta baş verdi')
      clearPasswordNotice()
    } finally {
      setPasswordSaving(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: PAGE_BG, fontFamily: FONT, color: NAVY, overflowX: 'hidden' }}>
      <div className="profile-shell-wrap" style={{ maxWidth: 1080, margin: '0 auto', padding: '40px 20px 48px' }}>
        <Card style={{ overflow: 'hidden' }}>
          <div className="profile-summary-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) 292px',
            gap: 24,
            alignItems: 'center',
            padding: '22px 24px',
            borderBottom: `1px solid ${CARD_BORDER}`,
            background: 'linear-gradient(180deg, #FFFFFF 0%, #F9FCFD 100%)',
          }}>
            <div className="profile-identity" style={{ display: 'flex', gap: 16, alignItems: 'center', minWidth: 0 }}>
              <div style={{
                width: 74,
                height: 74,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${TEAL}, ${NAVY})`,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                fontWeight: 800,
                boxShadow: '0 12px 26px rgba(29, 139, 149, 0.24)',
                flexShrink: 0,
              }}>
                {initial}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: '0 0 5px', color: TEAL, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0 }}>
                  Aslan Medical Center
                </p>
                <h1 style={{ margin: 0, color: NAVY, fontSize: 27, lineHeight: 1.12, fontWeight: 800, overflowWrap: 'anywhere' }}>
                  {displayName}
                </h1>
                <p style={{ margin: '7px 0 12px', color: MUTED, fontSize: 14, overflowWrap: 'anywhere' }}>{email}</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ padding: '6px 10px', borderRadius: 999, background: 'rgba(29, 139, 149, 0.1)', color: TEAL, fontSize: 12, fontWeight: 800 }}>
                    {role}
                  </span>
                  <span style={{ padding: '6px 10px', borderRadius: 999, background: '#ECFDF3', color: SUCCESS, fontSize: 12, fontWeight: 800 }}>
                    Aktiv hesab
                  </span>
                </div>
              </div>
            </div>

            <div className="profile-summary-side" style={{ borderLeft: `1px solid ${CARD_BORDER}`, paddingLeft: 22 }}>
              <p style={{ margin: '0 0 10px', color: NAVY, fontSize: 15, fontWeight: 800 }}>Hesab xülasəsi</p>
              <InfoRow label="Telefon" value={phone || user?.phone} />
              <InfoRow label="Qeydiyyat" value={formatDate(user?.createdAt)} />
              <InfoRow label="Status" value="Aktiv" />
            </div>
          </div>

          <div className="profile-tabs-row" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            padding: '10px 16px',
            borderBottom: `1px solid ${CARD_BORDER}`,
            background: '#fff',
          }}>
            <div className="profile-tabs" style={{
              display: 'inline-flex',
              gap: 4,
              background: '#EEF6F7',
              border: '1px solid #DDECEF',
              borderRadius: 8,
              padding: 4,
              maxWidth: '100%',
            }}>
              {[
                { key: 'profile', label: t('profile.profileTab') },
                { key: 'password', label: t('profile.passwordTab') },
              ].map(tab => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    minHeight: 34,
                    padding: '0 13px',
                    border: 'none',
                    borderRadius: 7,
                    background: activeTab === tab.key ? '#fff' : 'transparent',
                    color: activeTab === tab.key ? DARK_TEAL : MUTED,
                    boxShadow: activeTab === tab.key ? '0 3px 10px rgba(11, 29, 52, 0.08)' : 'none',
                    cursor: 'pointer',
                    fontFamily: FONT,
                    fontSize: 13,
                    fontWeight: 800,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <span className="profile-section-label" style={{ color: MUTED, fontSize: 13, fontWeight: 700 }}>
              Hesab parametrləri
            </span>
          </div>

          <div className="profile-settings-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 312px', minHeight: 390 }}>
            <section style={{ padding: '24px 24px 22px', minWidth: 0 }}>
              {activeTab === 'profile' ? (
                <form onSubmit={handleProfileSubmit} style={{ display: 'grid', gap: 18 }}>
                  <div className="profile-form-heading" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                    <div>
                      <h2 style={{ margin: 0, color: NAVY, fontSize: 21, fontWeight: 800 }}>{t('profile.profileTab')}</h2>
                      <p style={{ margin: '5px 0 0', color: MUTED, fontSize: 13 }}>Şəxsi məlumatlar</p>
                    </div>
                    <span style={{ padding: '6px 10px', borderRadius: 999, background: '#F0FAFB', color: TEAL, fontSize: 12, fontWeight: 800 }}>
                      Yenilənə bilər
                    </span>
                  </div>
                  <div className="profile-form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
                    <Field label="Ad Soyad">
                      <TextInput value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Ad Soyad" />
                    </Field>
                    <Field label="Telefon">
                      <TextInput value={phone} onChange={e => setPhone(e.target.value)} placeholder="+994 XX XXX XX XX" />
                    </Field>
                    <Field label="E-poçt" hint="E-poçt bu səhifədə dəyişdirilə bilməz." style={{ gridColumn: '1 / -1' }}>
                      <TextInput value={user?.email || ''} disabled />
                    </Field>
                  </div>
                  <ActionRow
                    message={profileMessage}
                    error={profileError}
                    saving={profileSaving}
                    buttonText={t('common.save')}
                    savingText={t('common.saving')}
                    buttonColor={TEAL}
                    onHoverColor={DARK_TEAL}
                  />
                </form>
              ) : (
                <form onSubmit={handlePasswordSubmit} style={{ display: 'grid', gap: 18 }}>
                  <div className="profile-form-heading" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                    <div>
                      <h2 style={{ margin: 0, color: NAVY, fontSize: 21, fontWeight: 800 }}>{t('profile.passwordTab')}</h2>
                      <p style={{ margin: '5px 0 0', color: MUTED, fontSize: 13 }}>Giriş məlumatları</p>
                    </div>
                    <span style={{ padding: '6px 10px', borderRadius: 999, background: '#F8FAFC', color: NAVY, fontSize: 12, fontWeight: 800 }}>
                      Təhlükəsiz dəyişiklik
                    </span>
                  </div>
                  <div className="profile-form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
                    <PasswordField
                      label="Cari şifrə"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      placeholder="Cari şifrənizi daxil edin"
                      style={{ gridColumn: '1 / -1' }}
                    />
                    <PasswordField
                      label="Yeni şifrə"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Minimum 8 simvol"
                    />
                    <PasswordField
                      label="Yeni şifrənin təsdiqi"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Yeni şifrəni təkrar daxil edin"
                    />
                  </div>
                  <ActionRow
                    message={passwordMessage}
                    error={passwordError}
                    saving={passwordSaving}
                    buttonText="Şifrəni dəyiş"
                    savingText="Dəyişdirilir..."
                    buttonColor={NAVY}
                    onHoverColor="#122A49"
                  />
                </form>
              )}
            </section>

            <aside className="profile-side-panel" style={{
              borderLeft: `1px solid ${CARD_BORDER}`,
              background: '#FBFDFE',
              minWidth: 0,
            }}>
              <section style={{ padding: '22px 22px 18px', borderBottom: `1px solid ${CARD_BORDER}` }}>
                <h3 style={{ margin: '0 0 10px', color: NAVY, fontSize: 17, fontWeight: 800 }}>{t('profile.accountInfo')}</h3>
                <InfoRow label="Ad Soyad" value={displayName} />
                <InfoRow label="E-poçt" value={user?.email} />
                <InfoRow label="Rol" value={role} />
                <InfoRow label="Hesab ID" value={user?._id || user?.id} />
              </section>
              <section style={{ padding: '20px 22px', borderBottom: `1px solid ${CARD_BORDER}` }}>
                <h3 style={{ margin: '0 0 12px', color: NAVY, fontSize: 17, fontWeight: 800 }}>Profil statusu</h3>
                <div style={{ display: 'grid', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <span style={{ color: MUTED, fontSize: 13 }}>Hesab</span>
                    <span style={{ color: SUCCESS, fontSize: 13, fontWeight: 800 }}>Aktiv</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 999, background: '#E2E8F0', overflow: 'hidden' }}>
                    <div style={{ width: '82%', height: '100%', borderRadius: 999, background: `linear-gradient(90deg, ${TEAL}, ${SUCCESS})` }} />
                  </div>
                </div>
              </section>
              <section style={{ padding: '20px 22px', background: 'linear-gradient(180deg, #FBFDFE 0%, #F2FBFC 100%)' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: 'rgba(29, 139, 149, 0.12)',
                    color: TEAL,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <path d="M9 12l2 2 4-5" />
                    </svg>
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 7px', color: NAVY, fontSize: 17, fontWeight: 800 }}>{t('profile.securityTip')}</h3>
                    <p style={{ margin: 0, color: MUTED, fontSize: 13, lineHeight: 1.55 }}>
                      Şifrənizi mütəmadi yeniləyin, ən azı 8 simvoldan istifadə edin və giriş məlumatlarınızı heç kimlə paylaşmayın.
                    </p>
                  </div>
                </div>
              </section>
            </aside>
          </div>
        </Card>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .profile-summary-grid,
          .profile-settings-grid {
            grid-template-columns: 1fr !important;
          }

          .profile-summary-side {
            border-left: none !important;
            border-top: 1px solid ${CARD_BORDER};
            padding-left: 0 !important;
            padding-top: 18px;
          }

          .profile-side-panel {
            border-left: none !important;
            border-top: 1px solid ${CARD_BORDER};
          }
        }

        @media (max-width: 640px) {
          .profile-shell-wrap {
            padding: 36px 14px 36px !important;
          }

          .profile-summary-grid {
            padding: 20px 18px !important;
          }

          .profile-identity {
            align-items: flex-start !important;
          }

          .profile-tabs-row {
            align-items: stretch !important;
            flex-direction: column !important;
            gap: 8px !important;
          }

          .profile-tabs {
            display: grid !important;
            grid-template-columns: 1fr !important;
            width: 100%;
          }

          .profile-section-label {
            display: none !important;
          }

          .profile-form-grid {
            grid-template-columns: 1fr !important;
          }

          .profile-form-grid > label {
            grid-column: auto !important;
          }

          .profile-form-heading {
            flex-direction: column !important;
            gap: 10px !important;
          }

          .profile-action-row {
            align-items: stretch !important;
            flex-direction: column !important;
          }

          .profile-action-row button {
            width: 100% !important;
          }
        }

        @media (max-width: 430px) {
          .profile-identity {
            flex-direction: column !important;
          }
        }
      `}</style>
    </main>
  )
}
