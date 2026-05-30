import { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'

const ROLE_MAP = {
  ADMIN:          { label: 'Admin',         color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
  SUPER_ADMIN:    { label: 'Baş Admin',     color: '#dc2626', bg: 'rgba(220,38,38,0.1)' },
  DOCTOR:         { label: 'Həkim',         color: '#0891b2', bg: 'rgba(8,145,178,0.1)' },
  NURSE:          { label: 'Tibb bacısı',   color: '#0d9488', bg: 'rgba(13,148,136,0.1)' },
  RECEPTIONIST:   { label: 'Resepsionist',  color: '#d97706', bg: 'rgba(217,119,6,0.1)' },
  LAB_TECHNICIAN: { label: 'Lab Texniki',   color: '#7c3aed', bg: 'rgba(124,58,237,0.08)' },
  PATIENT:        { label: 'Pasiyent',      color: '#64748b', bg: 'rgba(100,116,139,0.1)' },
  STAFF:          { label: 'Staff',         color: '#475569', bg: 'rgba(71,85,105,0.1)' },
  SOBE_MUDURU:    { label: 'Şöbə Müdürü',  color: '#b45309', bg: 'rgba(180,83,9,0.1)' },
  BAS_HEKIM:      { label: 'Baş Həkim',     color: '#1d4ed8', bg: 'rgba(29,78,216,0.1)' },
}

// Roles that should show the department field
const DEPT_ROLES = new Set(['DOCTOR', 'NURSE', 'STAFF', 'SOBE_MUDURU', 'BAS_HEKIM'])

const baseInput = {
  width: '100%', height: 42, borderRadius: 8,
  padding: '0 12px', fontSize: 14, color: '#0f172a', background: '#fff',
  outline: 'none', boxSizing: 'border-box',
}
const fieldStyle   = { ...baseInput, border: '1px solid #e2e8f0' }
const labelStyle   = { fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 4, display: 'block' }
const inputSt      = (err) => ({ ...baseInput, border: `1px solid ${err ? '#ef4444' : '#e2e8f0'}` })

function RoleBadge({ role }) {
  const r = ROLE_MAP[role]
  if (!r) return <span style={{ fontSize: 12, color: '#64748b' }}>{role}</span>
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, color: r.color, background: r.bg, whiteSpace: 'nowrap' }}>
      {r.label}
    </span>
  )
}

function Toggle({ checked, onChange }) {
  return (
    <div onClick={onChange} style={{ width: 40, height: 22, borderRadius: 11, cursor: 'pointer', background: checked ? '#00848e' : '#cbd5e1', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 3, left: checked ? 21 : 3, width: 16, height: 16, borderRadius: '50%', background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left 0.2s' }} />
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 20, marginBottom: 12 }}>
      {children}
    </div>
  )
}

function FieldBlock({ label, required, error, full, hint, children }) {
  return (
    <div style={full ? { gridColumn: '1/-1' } : {}}>
      <label style={labelStyle}>
        {label}
        {required && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}
      </label>
      {children}
      {error && <p style={{ margin: '3px 0 0', fontSize: 11, color: '#ef4444' }}>{error}</p>}
      {!error && hint && <p style={{ margin: '4px 0 0', fontSize: 11, color: '#94a3b8' }}>{hint}</p>}
    </div>
  )
}

const EyeIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
)
const EyeOffIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

export default function AdminUsers() {
  const token = localStorage.getItem('adminToken') || localStorage.getItem('token')
  const BASE  = 'http://localhost:5000'

  // ─── List state ───────────────────────────────────────────────────────────
  const [users,        setUsers]        = useState([])
  const [loading,      setLoading]      = useState(true)
  const [activeTab,    setActiveTab]    = useState('all')
  const [search,       setSearch]       = useState('')

  // ─── Modal state ──────────────────────────────────────────────────────────
  const [showModal,    setShowModal]    = useState(false)
  const [editUser,     setEditUser]     = useState(null)

  // ─── Form fields ──────────────────────────────────────────────────────────
  const [fullName,     setFullName]     = useState('')
  const [ataAdi,       setAtaAdi]       = useState('')
  const [sexiyyatId,   setSexiyyatId]   = useState('')
  const [birthDate,    setBirthDate]    = useState('')
  const [email,        setEmail]        = useState('')
  const [phone,        setPhone]        = useState('')
  const [address,      setAddress]      = useState('')
  const [department,   setDepartment]   = useState('')
  const [role,         setRole]         = useState('STAFF')
  const [password,     setPassword]     = useState('')
  const [isActive,     setIsActive]     = useState(true)
  const [showPassword, setShowPassword] = useState(false)

  // ─── Form meta ────────────────────────────────────────────────────────────
  const [errors,       setErrors]       = useState({})
  const [formError,    setFormError]    = useState('')
  const [formLoading,  setFormLoading]  = useState(false)

  // ─── Fetch users on mount ─────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${BASE}/api/v1/users`, {
      headers: { Authorization: 'Bearer ' + token },
    })
      .then(r => r.json())
      .then(data => {
        const list = data.data?.users || data.users || (Array.isArray(data.data) ? data.data : null) || []
        setUsers(list)
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false))
  }, [])

  // ─── Populate / reset form when modal opens ───────────────────────────────
  useEffect(() => {
    if (!showModal) return
    setErrors({})
    setFormError('')
    setShowPassword(false)
    if (editUser) {
      setFullName(editUser.fullName || `${editUser.name || ''} ${editUser.surname || ''}`.trim() || '')
      setAtaAdi(editUser.ataAdi || '')
      setSexiyyatId(editUser.sexiyyatId || '')
      setBirthDate(editUser.birthDate ? editUser.birthDate.split('T')[0] : '')
      setEmail(editUser.email || '')
      setPhone(editUser.phone || '')
      setAddress(editUser.address || '')
      setDepartment(editUser.department || '')
      setRole(editUser.role || 'STAFF')
      setPassword('')
      setIsActive(editUser.isActive !== false)
    } else {
      setFullName(''); setAtaAdi(''); setSexiyyatId(''); setBirthDate('')
      setEmail(''); setPhone(''); setAddress(''); setDepartment('')
      setRole('STAFF'); setPassword(''); setIsActive(true)
    }
  }, [showModal, editUser])

  const closeModal = () => { setShowModal(false); setEditUser(null) }
  const showDept   = DEPT_ROLES.has(role)

  // ─── Filter / search ──────────────────────────────────────────────────────
  const filtered = users.filter(u => {
    const matchTab    = activeTab === 'all' || u.role === activeTab
    const matchSearch = !search ||
      (u.fullName || `${u.name || ''} ${u.surname || ''}`).toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  // ─── Validation ───────────────────────────────────────────────────────────
  const validate = () => {
    const e = {}
    if (!fullName.trim()) e.fullName = 'Ad Soyad daxil edilməlidir'
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      e.email = 'Düzgün e-poçt ünvanı daxil edin'
    if (!role) e.role = 'Rol seçilməlidir'
    if (role === 'DOCTOR' && !department.trim())
      e.department = 'Həkim üçün şöbə seçilməlidir'
    if (!editUser) {
      if (!password)             e.password = 'Şifrə məcburidir'
      else if (password.length < 8) e.password = 'Şifrə minimum 8 simvol olmalıdır'
    } else if (password && password.length < 8) {
      e.password = 'Şifrə minimum 8 simvol olmalıdır'
    }
    return e
  }

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setErrors({})
    setFormError('')
    setFormLoading(true)

    const body = {
      fullName: fullName.trim(),
      name:     fullName.trim().split(/\s+/)[0] || '',
      surname:  fullName.trim().split(/\s+/).slice(1).join(' ') || '',
      email:   email.trim().toLowerCase(),
      role,
      isActive,
    }
    if (ataAdi.trim())     body.ataAdi     = ataAdi.trim()
    if (sexiyyatId.trim()) body.sexiyyatId = sexiyyatId.trim()
    if (birthDate)         body.birthDate  = birthDate
    if (phone.trim())      body.phone      = phone.trim()
    if (address.trim())    body.address    = address.trim()
    if (department.trim()) body.department = department.trim()
    if (password)          body.password   = password

    const url    = editUser ? `${BASE}/api/v1/users/${editUser._id}` : `${BASE}/api/v1/users`
    const method = editUser ? 'PUT' : 'POST'

    fetch(url, {
      method,
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(r => r.json())
      .then(data => {
        const user = data.data || data.user
        if (user && user._id) {
          if (editUser) setUsers(prev => prev.map(u => u._id === editUser._id ? user : u))
          else          setUsers(prev => [user, ...prev])
          closeModal()
        } else {
          setFormError(data.message || 'Xəta baş verdi')
        }
      })
      .catch(() => setFormError('Xəta baş verdi'))
      .finally(() => setFormLoading(false))
  }

  // ─── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = (id) => {
    if (!window.confirm('Bu istifadəçini silmək istəyirsiniz?')) return
    fetch(`${BASE}/api/v1/users/${id}`, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + token },
    }).then(() => setUsers(prev => prev.filter(u => u._id !== id)))
  }

  // ─── Toggle active ────────────────────────────────────────────────────────
  const handleToggle = (id) => {
    fetch(`${BASE}/api/v1/users/${id}/toggle-active`, {
      method: 'PATCH',
      headers: { Authorization: 'Bearer ' + token },
    })
      .then(r => r.json())
      .then(data => {
        const user = data.data || data.user
        if (user) setUsers(prev => prev.map(u => u._id === id ? user : u))
      })
  }

  const TABS = [
    { key: 'all',         label: 'Hamısı' },
    { key: 'DOCTOR',      label: 'Həkim' },
    { key: 'STAFF',       label: 'Staff' },
    { key: 'SOBE_MUDURU', label: 'Şöbə Müdürü' },
    { key: 'BAS_HEKIM',   label: 'Baş Həkim' },
  ]

  const thStyle = { padding: '12px 16px', fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }
  const tdStyle = { padding: '14px 16px', fontSize: 13, color: '#334155', borderBottom: '1px solid #f8fafc' }
  const grid2   = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }

  return (
    <AdminLayout activePage="users">

      {/* ── Page header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' }}>İstifadəçilər</h1>
          <p style={{ margin: '2px 0 0', fontSize: 13, color: '#94a3b8' }}>{users.length} istifadəçi</p>
        </div>
        <button
          onClick={() => { setEditUser(null); setShowModal(true) }}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 10, border: 'none', background: '#00848e', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Yeni İstifadəçi
        </button>
      </div>

      {/* ── Filter tabs ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0',
            background: activeTab === tab.key ? '#00848e' : 'white',
            color: activeTab === tab.key ? 'white' : '#64748b',
            fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}>{tab.label}</button>
        ))}
      </div>

      {/* ── Search ── */}
      <div style={{ marginBottom: 20, position: 'relative', width: 280 }}>
        <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}>
          <svg width="14" height="14" fill="none" stroke="#94a3b8" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Ad, email axtar..."
          style={{ ...fieldStyle, paddingLeft: 34, height: 38, fontSize: 13 }} />
      </div>

      {/* ── Table ── */}
      <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', width: '100%', border: '1px solid #e2e8f0' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>Yüklənir...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>İstifadəçi tapılmadı</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={thStyle}>Ad Soyad</th>
                  <th style={thStyle}>Rol</th>
                  <th style={thStyle}>Şöbə</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Telefon</th>
                  <th style={thStyle}>Status</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => {
                  const displayName = u.fullName || `${u.name || ''} ${u.surname || ''}`.trim() || u.email || '—'
                  const initial     = displayName[0].toUpperCase()
                  return (
                    <tr key={u._id}
                      onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg,#00848e,#00a8b5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontWeight: 700 }}>
                            {initial}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>{displayName}</div>
                            {u.phone && <div style={{ fontSize: 11, color: '#94a3b8' }}>{u.phone}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={tdStyle}><RoleBadge role={u.role} /></td>
                      <td style={tdStyle}><span style={{ fontSize: 13 }}>{u.department || '—'}</span></td>
                      <td style={tdStyle}><span style={{ fontSize: 13, color: '#64748b' }}>{u.email}</span></td>
                      <td style={tdStyle}><span style={{ fontSize: 13, color: '#64748b' }}>{u.phone || '—'}</span></td>
                      <td style={tdStyle}>
                        <Toggle checked={u.isActive} onChange={() => handleToggle(u._id)} />
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button onClick={() => { setEditUser(u); setShowModal(true) }} style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid #e2e8f0', background: 'white', fontSize: 12, cursor: 'pointer', color: '#334155', display: 'flex', alignItems: 'center', gap: 5 }}>
                            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            Redaktə
                          </button>
                          <button onClick={() => handleDelete(u._id)} style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid #fee2e2', background: 'white', fontSize: 12, cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', gap: 5 }}>
                            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={closeModal}
        >
          <div
            style={{ background: 'white', borderRadius: 16, width: 580, maxWidth: '92vw', maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}
          >

            {/* Fixed header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                {editUser ? 'İstifadəçini Redaktə Et' : 'Yeni İstifadəçi'}
              </h3>
              <button onClick={closeModal} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 22, lineHeight: 1, padding: '2px 6px' }}>×</button>
            </div>

            {/* Scrollable body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 24px 16px' }}>

              {/* A — Şəxsi məlumatlar */}
              <SectionTitle>Şəxsi məlumatlar</SectionTitle>
              <div style={grid2}>
                <div style={{ gridColumn: 'span 2' }}>
                  <FieldBlock label="Ad Soyad" required error={errors.fullName}>
                    <input
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="məs. Əli Əliyev"
                      style={inputSt(errors.fullName)}
                    />
                  </FieldBlock>
                </div>
                <FieldBlock label="Ata adı">
                  <input value={ataAdi} onChange={e => setAtaAdi(e.target.value)} placeholder="məs. Əliməmməd" style={inputSt()} />
                </FieldBlock>
                <FieldBlock label="FİN kod / Şəxsiyyət vəsiqəsi">
                  <input value={sexiyyatId} onChange={e => setSexiyyatId(e.target.value)} placeholder="məs. 7ABC123" maxLength={20} style={inputSt()} />
                </FieldBlock>
                <FieldBlock label="Doğum tarixi" full>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={e => setBirthDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    style={{ ...inputSt(), width: 'calc(50% - 7px)' }}
                  />
                </FieldBlock>
              </div>

              {/* B — Əlaqə məlumatları */}
              <SectionTitle>Əlaqə məlumatları</SectionTitle>
              <div style={grid2}>
                <FieldBlock label="E-poçt" required error={errors.email}>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ad@example.com" style={inputSt(errors.email)} />
                </FieldBlock>
                <FieldBlock label="Telefon">
                  <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+994 50 XXX XX XX" style={inputSt()} />
                </FieldBlock>
                <FieldBlock label="Ünvan" full>
                  <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Şəhər, küçə, bina..." style={inputSt()} />
                </FieldBlock>
              </div>

              {/* C — Sistem məlumatları */}
              <SectionTitle>Sistem məlumatları</SectionTitle>
              <div style={grid2}>
                <FieldBlock label="Rol" required error={errors.role}>
                  <select
                    value={role}
                    onChange={e => { setRole(e.target.value); setDepartment('') }}
                    style={inputSt(errors.role)}
                  >
                    <option value="DOCTOR">Həkim</option>
                    <option value="NURSE">Tibb bacısı</option>
                    <option value="STAFF">Staff</option>
                    <option value="SOBE_MUDURU">Şöbə Müdürü</option>
                    <option value="BAS_HEKIM">Baş Həkim</option>
                  </select>
                </FieldBlock>

                {showDept && (
                  <FieldBlock label="Şöbə" required={role === 'DOCTOR'} error={errors.department}>
                    <input
                      type="text"
                      value={department}
                      onChange={e => setDepartment(e.target.value)}
                      placeholder="məs. Kardiologiya"
                      style={inputSt(errors.department)}
                    />
                  </FieldBlock>
                )}

                <FieldBlock
                  label={editUser ? 'Şifrə (dəyişdirmək üçün doldurun)' : 'Şifrə'}
                  required={!editUser}
                  error={errors.password}
                  hint={!editUser ? 'İstifadəçi ilk girişdən sonra şifrəni dəyişməlidir.' : undefined}
                  full
                >
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder={editUser ? '••••••••' : 'Minimum 8 simvol'}
                      style={{ ...inputSt(errors.password), paddingRight: 42 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex', alignItems: 'center' }}
                    >
                      {showPassword ? EyeOffIcon : EyeIcon}
                    </button>
                  </div>
                </FieldBlock>

                <div style={{ gridColumn: '1/-1' }}>
                  <label style={labelStyle}>Status</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 2 }}>
                    <Toggle checked={isActive} onChange={() => setIsActive(v => !v)} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: isActive ? '#00848e' : '#94a3b8' }}>
                      {isActive ? 'Aktiv' : 'Passiv'}
                    </span>
                  </div>
                </div>
              </div>

              {formError && (
                <p style={{ color: '#ef4444', fontSize: 13, marginTop: 12 }}>{formError}</p>
              )}
            </div>

            {/* Fixed footer */}
            <div style={{ padding: '14px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: 8, flexShrink: 0 }}>
              <button
                onClick={closeModal}
                style={{ padding: '9px 20px', borderRadius: 9, border: '1px solid #e2e8f0', background: 'white', fontSize: 13, cursor: 'pointer', color: '#475569' }}
              >Ləğv et</button>
              <button
                onClick={handleSubmit}
                disabled={formLoading}
                style={{ padding: '9px 22px', borderRadius: 9, border: 'none', background: '#00848e', color: 'white', fontSize: 13, fontWeight: 600, cursor: formLoading ? 'not-allowed' : 'pointer', opacity: formLoading ? 0.7 : 1 }}
              >{formLoading ? 'Saxlanılır...' : 'Saxla'}</button>
            </div>

          </div>
        </div>
      )}

    </AdminLayout>
  )
}
