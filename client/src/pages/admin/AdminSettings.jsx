import { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import api from '../../api/axios'
import { clearAuthStorage } from '../../utils/authSession'

const BASE  = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000'
const tok   = () => localStorage.getItem('adminToken') || localStorage.getItem('token')
const hdrs  = () => ({ Authorization: `Bearer ${tok()}`, 'Content-Type': 'application/json' })
const TEAL  = '#00848e'

/* ── shared atoms ─────────────────────────────────────────────── */
const lbl = { fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }
const inp = {
  width: '100%', border: '1px solid #e2e8f0', borderRadius: 9,
  padding: '10px 14px', fontSize: 13, color: '#334155',
  outline: 'none', background: 'white', boxSizing: 'border-box',
  fontFamily: 'inherit',
}
const card  = { background: 'white', borderRadius: 14, padding: 28, border: '1px solid #f1f5f9' }
const SaveBtn = ({ onClick, saving, label = 'Yadda saxla' }) => (
  <button onClick={onClick} disabled={saving}
    style={{ background: TEAL, color: 'white', border: 'none', borderRadius: 9, padding: '10px 24px', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, marginTop: 20 }}>
    {saving ? 'Saxlanır...' : label}
  </button>
)
const OK  = ({ msg }) => msg ? <p style={{ fontSize: 12, color: '#16a34a', marginTop: 8 }}>{msg}</p> : null
const Err = ({ msg }) => msg ? <p style={{ fontSize: 12, color: '#ef4444', marginTop: 8 }}>{msg}</p> : null

const TABS = [
  { key: 'profile',  label: 'Profil' },
  { key: 'password', label: 'Şifrə' },
  { key: 'system',   label: 'Sistem' },
  { key: 'social',   label: 'Sosial' },
  { key: 'notif',    label: 'Bildiriş' },
  { key: 'security', label: 'Təhlükəsizlik' },
]

/* ════════════════════════════════════════════════════════════════
   TAB 1 — Profil
════════════════════════════════════════════════════════════════ */
function TabProfile() {
  const [form,    setForm]    = useState({ fullName: '', email: '', phone: '' })
  const [saving,  setSaving]  = useState(false)
  const [ok,      setOk]      = useState('')
  const [err,     setErr]     = useState('')

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('adminUser') || '{}')
      setForm({ fullName: u.fullName || u.name || '', email: u.email || '', phone: u.phone || '' })
    } catch {}
    fetch(`${BASE}/api/v1/users/me`, { headers: hdrs() })
      .then(r => r.json())
      .then(d => {
        const u = d.data || d
        setForm({ fullName: u.fullName || u.name || '', email: u.email || '', phone: u.phone || '' })
      })
      .catch(() => {})
  }, [])

  const save = async () => {
    setSaving(true); setOk(''); setErr('')
    try {
      const r = await fetch(`${BASE}/api/v1/users/me`, {
        method: 'PUT', headers: hdrs(),
        body: JSON.stringify({ fullName: form.fullName, phone: form.phone }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.message || 'Xəta')
      try {
        const stored = JSON.parse(localStorage.getItem('adminUser') || '{}')
        localStorage.setItem('adminUser', JSON.stringify({ ...stored, fullName: form.fullName, phone: form.phone }))
      } catch {}
      setOk('Yadda saxlandı ✓')
      setTimeout(() => setOk(''), 3000)
    } catch (e) { setErr(e.message) }
    finally { setSaving(false) }
  }

  const initials = (form.fullName || 'A').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div style={card}>
      <h2 style={{ margin: '0 0 22px', fontSize: 16, fontWeight: 700, color: '#0f1b2d' }}>Profil Məlumatları</h2>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: `linear-gradient(135deg,${TEAL},#00a8b5)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 22, fontWeight: 700, flexShrink: 0 }}>
          {initials}
        </div>
        <div>
          <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: '#0f1b2d' }}>{form.fullName || 'Admin'}</p>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: '#94a3b8' }}>{form.email}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label style={lbl}>Ad Soyad</label>
          <input style={inp} value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} />
        </div>
        <div>
          <label style={lbl}>E-poçt</label>
          <input style={{ ...inp, background: '#f8fafc', color: '#94a3b8' }} value={form.email} readOnly />
        </div>
        <div>
          <label style={lbl}>Telefon</label>
          <input style={inp} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+994 xx xxx xx xx" />
        </div>
      </div>

      <SaveBtn onClick={save} saving={saving} />
      <OK msg={ok} /><Err msg={err} />
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   TAB 2 — Şifrə
════════════════════════════════════════════════════════════════ */
function TabPassword() {
  const [form,   setForm]   = useState({ current: '', next: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const [ok,     setOk]     = useState('')
  const [err,    setErr]    = useState('')

  const strength = (() => {
    const p = form.next
    if (!p) return null
    let score = 0
    if (p.length >= 8)                           score++
    if (p.length >= 12)                          score++
    if (/[A-Z]/.test(p) && /[a-z]/.test(p))     score++
    if (/[0-9]/.test(p))                         score++
    if (/[^A-Za-z0-9]/.test(p))                 score++
    if (score <= 2) return { label: 'Zəif',     color: '#ef4444', width: '33%' }
    if (score <= 3) return { label: 'Orta',     color: '#f59e0b', width: '66%' }
    return               { label: 'Güclü',      color: '#22c55e', width: '100%' }
  })()

  const save = async () => {
    setErr(''); setOk('')
    if (!form.current)             { setErr('Cari şifrəni daxil edin'); return }
    if (form.next.length < 8)      { setErr('Yeni şifrə ən az 8 simvol olmalıdır'); return }
    if (form.next !== form.confirm) { setErr('Şifrələr uyğun gəlmir'); return }
    setSaving(true)
    try {
      const r = await fetch(`${BASE}/api/v1/auth/change-password`, {
        method: 'POST', headers: hdrs(),
        body: JSON.stringify({ currentPassword: form.current, newPassword: form.next }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.message || 'Xəta')
      setOk('Şifrə uğurla dəyişdirildi ✓')
      setForm({ current: '', next: '', confirm: '' })
      setTimeout(() => setOk(''), 3000)
    } catch (e) { setErr(e.message) }
    finally { setSaving(false) }
  }

  return (
    <div style={card}>
      <h2 style={{ margin: '0 0 22px', fontSize: 16, fontWeight: 700, color: '#0f1b2d' }}>Şifrə Dəyişikliyi</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 400 }}>
        {[
          { key: 'current', label: 'Cari şifrə' },
          { key: 'next',    label: 'Yeni şifrə' },
          { key: 'confirm', label: 'Yeni şifrəni təsdiqlə' },
        ].map(({ key, label }) => (
          <div key={key}>
            <label style={lbl}>{label}</label>
            <input type="password" style={inp} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
          </div>
        ))}

        {strength && (
          <div>
            <div style={{ height: 4, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: strength.width, background: strength.color, borderRadius: 4, transition: 'width .3s' }} />
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 11, color: strength.color }}>{strength.label}</p>
          </div>
        )}
      </div>
      <SaveBtn onClick={save} saving={saving} label="Şifrəni Dəyiş" />
      <OK msg={ok} /><Err msg={err} />
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   TAB 3 — Sistem
════════════════════════════════════════════════════════════════ */
const CLINIC_DEF = { name: '', address: '', phone: '', email: '', website: '', workHours: '08:00 - 20:00' }

function TabSystem() {
  const [form,           setForm]           = useState(CLINIC_DEF)
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [settingsSaved,   setSettingsSaved]   = useState(false)

  useEffect(() => {
    fetch(`${BASE}/api/v1/settings?group=clinic`)
      .then(r => r.json())
      .then(d => {
        const s = d.data || {}
        setForm({
          name:      s.clinic_name    || '',
          address:   s.clinic_address || '',
          phone:     s.clinic_phone   || '',
          email:     s.clinic_email   || '',
          website:   s.clinic_website || '',
          workHours: s.work_hours     || '08:00 - 20:00',
        })
      })
      .catch(() => {})
  }, [])

  const saveClinicSettings = () => {
    setSettingsLoading(true)
    fetch(`${BASE}/api/v1/settings`, {
      method: 'PUT',
      headers: hdrs(),
      body: JSON.stringify({
        clinic_name:    form.name,
        clinic_address: form.address,
        clinic_phone:   form.phone,
        clinic_email:   form.email,
        clinic_website: form.website,
        work_hours:     form.workHours,
      }),
    })
      .then(r => r.json())
      .then(() => { setSettingsSaved(true); setTimeout(() => setSettingsSaved(false), 3000) })
      .catch(() => {})
      .finally(() => setSettingsLoading(false))
  }

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div style={card}>
      <h2 style={{ margin: '0 0 22px', fontSize: 16, fontWeight: 700, color: '#0f1b2d' }}>Klinik Məlumatlar</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={lbl}>Klinik adı</label>
          <input style={inp} value={form.name} onChange={e => setF('name', e.target.value)} placeholder="Aslan Medical Center" />
        </div>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={lbl}>Ünvan</label>
          <input style={inp} value={form.address} onChange={e => setF('address', e.target.value)} placeholder="Bakı, Xətai r., Afiyəddin Cəlilov küçəsi" />
        </div>
        <div>
          <label style={lbl}>Telefon</label>
          <input style={inp} value={form.phone} onChange={e => setF('phone', e.target.value)} placeholder="+994 50 836 36 94" />
        </div>
        <div>
          <label style={lbl}>E-poçt</label>
          <input style={inp} value={form.email} onChange={e => setF('email', e.target.value)} placeholder="info@aslanmedical.az" />
        </div>
        <div>
          <label style={lbl}>Veb sayt</label>
          <input style={inp} value={form.website} onChange={e => setF('website', e.target.value)} placeholder="https://aslanmedical.az" />
        </div>
        <div>
          <label style={lbl}>İş saatları</label>
          <input style={inp} value={form.workHours} onChange={e => setF('workHours', e.target.value)} placeholder="08:00 - 20:00" />
        </div>
      </div>
      <button
        onClick={saveClinicSettings}
        disabled={settingsLoading}
        style={{ padding: '10px 24px', background: settingsSaved ? '#16a34a' : TEAL, color: 'white', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: settingsLoading ? 'not-allowed' : 'pointer', opacity: settingsLoading ? 0.7 : 1, transition: 'background 0.3s', marginTop: 20 }}
      >
        {settingsLoading ? 'Saxlanır...' : settingsSaved ? '✓ Saxlandı' : 'Yadda saxla'}
      </button>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   TAB 4 — Bildiriş
════════════════════════════════════════════════════════════════ */
const NOTIF_KEYS = [
  { key: 'newAppointment',   label: 'Yeni randevu bildirişi' },
  { key: 'cancelAppointment', label: 'Randevu ləğvi bildirişi' },
  { key: 'newMuraciet',      label: 'Yeni müraciət bildirişi' },
  { key: 'newPatient',       label: 'Yeni pasiyent qeydiyyatı' },
  { key: 'payment',          label: 'Ödəniş bildirişi' },
  { key: 'labResult',        label: 'Lab nəticəsi bildirişi' },
]
const NOTIF_DEF = Object.fromEntries(NOTIF_KEYS.map(n => [n.key, true]))

function Toggle({ checked, onChange }) {
  return (
    <div onClick={onChange}
      style={{ width: 44, height: 24, borderRadius: 12, background: checked ? TEAL : '#e2e8f0', cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'background .2s' }}>
      <div style={{ position: 'absolute', top: 3, left: checked ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left .2s' }} />
    </div>
  )
}

function TabNotif() {
  const [prefs, setPrefs] = useState(NOTIF_DEF)
  const [ok,    setOk]    = useState('')

  useEffect(() => {
    try { setPrefs({ ...NOTIF_DEF, ...JSON.parse(localStorage.getItem('notifPrefs') || '{}') }) } catch {}
  }, [])

  const toggle = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }))

  const save = () => {
    localStorage.setItem('notifPrefs', JSON.stringify(prefs))
    setOk('Yadda saxlandı ✓')
    setTimeout(() => setOk(''), 3000)
  }

  return (
    <div style={card}>
      <h2 style={{ margin: '0 0 22px', fontSize: 16, fontWeight: 700, color: '#0f1b2d' }}>Bildiriş Tərcihlər</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {NOTIF_KEYS.map(({ key, label }, i) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: i < NOTIF_KEYS.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
            <span style={{ fontSize: 13, color: '#334155' }}>{label}</span>
            <Toggle checked={prefs[key]} onChange={() => toggle(key)} />
          </div>
        ))}
      </div>
      <SaveBtn onClick={save} saving={false} />
      <OK msg={ok} />
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   TAB 4b — Sosial
════════════════════════════════════════════════════════════════ */
function TabSocial() {
  const [socialForm,    setSocialForm]    = useState({ twitter: '', instagram: '', linkedin: '', facebook: '' })
  const [socialSaved,   setSocialSaved]   = useState(false)
  const [socialLoading, setSocialLoading] = useState(false)

  useEffect(() => {
    fetch(`${BASE}/api/v1/settings?group=social`, { headers: hdrs() })
      .then(r => r.json())
      .then(d => {
        const s = d.data || {}
        setSocialForm({
          twitter:   s.social_twitter   || '',
          instagram: s.social_instagram || '',
          linkedin:  s.social_linkedin  || '',
          facebook:  s.social_facebook  || '',
        })
      })
      .catch(() => {})
  }, [])

  const save = () => {
    setSocialLoading(true)
    fetch(`${BASE}/api/v1/settings`, {
      method: 'PUT',
      headers: hdrs(),
      body: JSON.stringify({
        social_twitter:   socialForm.twitter,
        social_instagram: socialForm.instagram,
        social_linkedin:  socialForm.linkedin,
        social_facebook:  socialForm.facebook,
      }),
    })
      .then(() => { setSocialSaved(true); setTimeout(() => setSocialSaved(false), 3000) })
      .catch(() => {})
      .finally(() => setSocialLoading(false))
  }

  return (
    <div style={card}>
      <h2 style={{ margin: '0 0 22px', fontSize: 16, fontWeight: 700, color: '#0f1b2d' }}>Sosial Media Linklər</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 480 }}>
        {[
          { key: 'twitter',   label: 'Twitter / X', placeholder: 'https://twitter.com/aslanmedical' },
          { key: 'instagram', label: 'Instagram',   placeholder: 'https://instagram.com/aslanmedical' },
          { key: 'linkedin',  label: 'LinkedIn',    placeholder: 'https://linkedin.com/company/aslanmedical' },
          { key: 'facebook',  label: 'Facebook',    placeholder: 'https://facebook.com/aslanmedical' },
        ].map(f => (
          <div key={f.key}>
            <label style={lbl}>{f.label}</label>
            <input
              type="url"
              value={socialForm[f.key]}
              onChange={e => setSocialForm(p => ({ ...p, [f.key]: e.target.value }))}
              placeholder={f.placeholder}
              style={inp}
            />
          </div>
        ))}
        <button
          onClick={save}
          disabled={socialLoading}
          style={{ alignSelf: 'flex-start', padding: '10px 24px', background: socialSaved ? '#16a34a' : TEAL, color: 'white', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: socialLoading ? 'not-allowed' : 'pointer', opacity: socialLoading ? 0.7 : 1, transition: 'background 0.3s', marginTop: 4 }}
        >
          {socialLoading ? 'Saxlanır...' : socialSaved ? '✓ Saxlandı' : 'Yadda saxla'}
        </button>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   TAB 5 — Təhlükəsizlik
════════════════════════════════════════════════════════════════ */
function TabSecurity() {
  const [ending, setEnding] = useState(false)

  const adminUser = (() => { try { return JSON.parse(localStorage.getItem('adminUser') || '{}') } catch { return {} } })()
  const lastLogin = adminUser.lastLogin ? new Date(adminUser.lastLogin).toLocaleString('az-AZ') : '—'
  const email     = adminUser.email || '—'
  const role      = adminUser.role  || '—'

  const endAll = async () => {
    if (!window.confirm('Bütün aktiv sessiyalar bitiriləcək. Davam etmək istəyirsiniz?')) return
    setEnding(true)
    try {
      await api.post('/auth/logout')
    } catch {
      // Local session should still be cleared if server logout cannot complete.
    }
    clearAuthStorage()
    window.location.href = '/admin'
  }

  return (
    <div style={card}>
      <h2 style={{ margin: '0 0 22px', fontSize: 16, fontWeight: 700, color: '#0f1b2d' }}>Təhlükəsizlik</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 24 }}>
        {[
          { label: 'Son giriş',      value: lastLogin },
          { label: 'E-poçt',         value: email },
          { label: 'Rol',            value: role },
          { label: 'Aktiv sessiya',  value: tok() ? 'Aktiv ✓' : '—' },
        ].map(({ label, value }, i, arr) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0', borderBottom: i < arr.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>{label}</span>
            <span style={{ fontSize: 13, color: '#0f1b2d' }}>{value}</span>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff5f5', border: '1px solid #fee2e2', borderRadius: 10, padding: '16px 18px' }}>
        <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, color: '#dc2626' }}>Bütün Sessiyaları Bitir</p>
        <p style={{ margin: '0 0 14px', fontSize: 12, color: '#64748b' }}>Bu əməliyyat bütün aktiv sessiyaları bitirəcək və siz çıxış ediləcəksiniz.</p>
        <button onClick={endAll} disabled={ending}
          style={{ background: '#dc2626', color: 'white', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: ending ? 'not-allowed' : 'pointer', opacity: ending ? 0.7 : 1 }}>
          {ending ? 'Bitrilir...' : 'Bütün Sessiyaları Bitir'}
        </button>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════════════ */
export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('profile')

  const CONTENT = {
    profile:  <TabProfile />,
    password: <TabPassword />,
    system:   <TabSystem />,
    social:   <TabSocial />,
    notif:    <TabNotif />,
    security: <TabSecurity />,
  }

  return (
    <AdminLayout activePage="settings">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f1b2d' }}>Ayarlar</h1>
        <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>Hesab və sistem parametrləri</p>
      </div>

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        {/* ── Left sidebar ──────────────────────────────────── */}
        <div style={{ width: 220, flexShrink: 0, background: 'white', borderRadius: 14, border: '1px solid #f1f5f9', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {TABS.map(tab => {
            const active = activeTab === tab.key
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '12px 16px', borderRadius: 9, fontSize: 13,
                  fontWeight: active ? 600 : 500, cursor: 'pointer', border: 'none',
                  background:  active ? '#f0fafb' : 'transparent',
                  color:       active ? TEAL      : '#64748b',
                  borderLeft:  active ? `3px solid ${TEAL}` : '3px solid transparent',
                  transition:  'all .15s',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f8fafc' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}>
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* ── Right content ─────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {CONTENT[activeTab]}
        </div>
      </div>
    </AdminLayout>
  )
}
