import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import axios from 'axios'
import { toast } from 'sonner'

const API = 'http://localhost:5000/api/v1'

const ROLES = [
  { value: 'ADMIN',          label: 'Admin',         color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
  { value: 'SUPER_ADMIN',    label: 'Baş Admin',     color: '#dc2626', bg: 'rgba(220,38,38,0.1)' },
  { value: 'DOCTOR',         label: 'Həkim',         color: '#0891b2', bg: 'rgba(8,145,178,0.1)' },
  { value: 'NURSE',          label: 'Tibb bacısı',   color: '#0d9488', bg: 'rgba(13,148,136,0.1)' },
  { value: 'RECEPTIONIST',   label: 'Resepsionist',  color: '#d97706', bg: 'rgba(217,119,6,0.1)' },
  { value: 'LAB_TECHNICIAN', label: 'Lab Texniki',   color: '#7c3aed', bg: 'rgba(124,58,237,0.08)' },
  { value: 'PATIENT',        label: 'Pasiyent',      color: '#64748b', bg: 'rgba(100,116,139,0.1)' },
  { value: 'STAFF',          label: 'Staff',         color: '#475569', bg: 'rgba(71,85,105,0.1)' },
  { value: 'SOBE_MUDURU',    label: 'Şöbə Müdürü',  color: '#b45309', bg: 'rgba(180,83,9,0.1)' },
  { value: 'BAS_HEKIM',      label: 'Baş Həkim',     color: '#1d4ed8', bg: 'rgba(29,78,216,0.1)' },
]

const FILTER_TABS = [
  { key: 'all',          label: 'Hamısı' },
  { key: 'DOCTOR',       label: 'Həkim' },
  { key: 'NURSE',        label: 'Tibb bacısı' },
  { key: 'STAFF',        label: 'Staff' },
  { key: 'SOBE_MUDURU',  label: 'Şöbə Müdürü' },
  { key: 'BAS_HEKIM',    label: 'Baş Həkim' },
]

const EMPTY_FORM = {
  name: '', surname: '', sexiyyatId: '', age: '', email: '',
  phone: '', address: '', department: '', role: 'STAFF',
  password: '', photoUrl: '', isActive: true,
}

function RoleBadge({ role }) {
  const r = ROLES.find(x => x.value === role)
  if (!r) return <span style={{ fontSize: 12, color: '#64748b' }}>{role}</span>
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
      color: r.color, background: r.bg, whiteSpace: 'nowrap',
    }}>{r.label}</span>
  )
}

function Toggle({ checked, onChange }) {
  return (
    <div onClick={onChange} style={{
      width: 40, height: 22, borderRadius: 11, cursor: 'pointer',
      background: checked ? '#00848e' : '#cbd5e1',
      position: 'relative', transition: 'background 0.2s', flexShrink: 0,
    }}>
      <div style={{
        position: 'absolute', top: 3, left: checked ? 21 : 3,
        width: 16, height: 16, borderRadius: '50%', background: 'white',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left 0.2s',
      }} />
    </div>
  )
}

function Modal({ user, onClose, onSave }) {
  const isEdit = !!user?._id
  const [form, setForm] = useState(isEdit ? { ...EMPTY_FORM, ...user, password: '' } : { ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.name || !form.surname || !form.email || !form.role) {
      toast.error('Ad, soyad, email və rol mütləqdir')
      return
    }
    if (!isEdit && !form.password) {
      toast.error('Yeni istifadəçi üçün şifrə mütləqdir')
      return
    }
    setSaving(true)
    try {
      const token = localStorage.getItem('adminToken')
      const body = { ...form }
      if (!body.password) delete body.password
      if (body.age === '') delete body.age
      if (isEdit) {
        await axios.put(`${API}/users/${user._id}`, body, { headers: { Authorization: `Bearer ${token}` } })
        toast.success('İstifadəçi yeniləndi')
      } else {
        await axios.post(`${API}/users`, body, { headers: { Authorization: `Bearer ${token}` } })
        toast.success('İstifadəçi yaradıldı')
      }
      onSave()
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Xəta baş verdi')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = {
    width: '100%', height: 42, border: '1px solid #e2e8f0', borderRadius: 9,
    padding: '0 12px', fontSize: 13, color: '#0f172a', background: '#f8fafc',
    outline: 'none', boxSizing: 'border-box',
  }
  const labelStyle = { fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4, display: 'block' }

  const Field = ({ label, k, type = 'text', required }) => (
    <div>
      <label style={labelStyle}>{label}{required && <span style={{ color: '#ef4444' }}> *</span>}</label>
      <input
        type={type}
        value={form[k]}
        onChange={e => set(k, e.target.value)}
        style={inputStyle}
      />
    </div>
  )

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }} onClick={onClose}>
      <div style={{
        background: 'white', borderRadius: 16, width: '100%', maxWidth: 640,
        maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }} onClick={e => e.stopPropagation()}>

        <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
            {isEdit ? 'İstifadəçini Redaktə Et' : 'Yeni İstifadəçi'}
          </h3>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 20 }}>×</button>
        </div>

        <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Ad" k="name" required />
          <Field label="Soyad" k="surname" required />
          <Field label="Şəxsiyyət ID" k="sexiyyatId" />
          <Field label="Yaş" k="age" type="number" />
          <Field label="Email" k="email" type="email" required />
          <Field label="Telefon" k="phone" />
          <div style={{ gridColumn: '1/-1' }}>
            <Field label="Ünvan" k="address" />
          </div>
          <Field label="Şöbə" k="department" />

          <div>
            <label style={labelStyle}>Rol <span style={{ color: '#ef4444' }}>*</span></label>
            <select value={form.role} onChange={e => set('role', e.target.value)} style={{ ...inputStyle, height: 42 }}>
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          <div style={{ gridColumn: '1/-1' }}>
            <Field label={isEdit ? 'Şifrə (boş qoyun — dəyişməsin)' : 'Şifrə'} k="password" type="password" required={!isEdit} />
          </div>

          <div style={{ gridColumn: '1/-1' }}>
            <Field label="Şəkil URL" k="photoUrl" />
          </div>

          <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Toggle checked={form.isActive} onChange={() => set('isActive', !form.isActive)} />
            <span style={{ fontSize: 13, color: '#475569' }}>Aktiv</span>
          </div>
        </div>

        <div style={{ padding: '0 24px 24px', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            padding: '9px 20px', borderRadius: 9, border: '1px solid #e2e8f0',
            background: 'white', fontSize: 13, cursor: 'pointer', color: '#475569',
          }}>Ləğv et</button>
          <button onClick={handleSubmit} disabled={saving} style={{
            padding: '9px 22px', borderRadius: 9, border: 'none',
            background: '#00848e', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            opacity: saving ? 0.7 : 1,
          }}>{saving ? 'Saxlanılır...' : 'Saxla'}</button>
        </div>
      </div>
    </div>
  )
}

export default function AdminUsers() {
  const [users, setUsers]       = useState([])
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(true)
  const [tab, setTab]           = useState('all')
  const [search, setSearch]     = useState('')
  const [modal, setModal]       = useState(null) // null | 'add' | user object
  const [deleting, setDeleting] = useState(null)

  const token = localStorage.getItem('adminToken')

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = { limit: 100 }
      if (tab !== 'all') params.role = tab
      const res = await axios.get(`${API}/users`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = res.data?.data
      const list = Array.isArray(data) ? data : data?.users || []
      setUsers(list)
      setTotal(data?.total ?? list.length)
    } catch {
      toast.error('İstifadəçilər yüklənmədi')
    } finally {
      setLoading(false)
    }
  }, [tab, token])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleToggleActive = async (user) => {
    try {
      await axios.patch(`${API}/users/${user._id}/toggle-active`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, isActive: !u.isActive } : u))
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Status dəyişdirilmədi')
    }
  }

  const handleDelete = async (id) => {
    setDeleting(id)
    try {
      await axios.delete(`${API}/users/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      toast.success('İstifadəçi silindi')
      setUsers(prev => prev.filter(u => u._id !== id))
      setTotal(t => t - 1)
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Silinmədi')
    } finally {
      setDeleting(null)
    }
  }

  const filtered = users.filter(u => {
    if (!search) return true
    const q = search.toLowerCase()
    const full = `${u.name || ''} ${u.surname || ''} ${u.fullName || ''} ${u.email || ''} ${u.department || ''}`.toLowerCase()
    return full.includes(q)
  })

  const thStyle = {
    padding: '10px 14px', fontSize: 11, fontWeight: 600,
    color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em',
    textAlign: 'left', whiteSpace: 'nowrap',
  }
  const tdStyle = {
    padding: '12px 14px', fontSize: 13, color: '#334155',
    borderBottom: '1px solid #f1f5f9',
  }

  return (
    <AdminLayout activePage="users">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' }}>İstifadəçilər</h1>
          <p style={{ margin: '2px 0 0', fontSize: 13, color: '#94a3b8' }}>{total} istifadəçi</p>
        </div>
        <button onClick={() => setModal('add')} style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '10px 18px', borderRadius: 10, border: 'none',
          background: '#00848e', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Yeni İstifadəçi
        </button>
      </div>

      {/* Filters row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6, background: 'white', border: '1px solid #e2e8f0', borderRadius: 10, padding: 4, flexWrap: 'wrap' }}>
          {FILTER_TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '6px 14px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13,
              background: tab === t.key ? '#00848e' : 'transparent',
              color: tab === t.key ? 'white' : '#64748b',
              fontWeight: tab === t.key ? 600 : 400,
              transition: 'all 0.15s',
            }}>{t.label}</button>
          ))}
        </div>

        <div style={{ marginLeft: 'auto', position: 'relative' }}>
          <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}>
            <svg width="14" height="14" fill="none" stroke="#94a3b8" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Axtar..."
            style={{
              height: 38, border: '1px solid #e2e8f0', borderRadius: 9,
              padding: '0 12px 0 34px', fontSize: 13, color: '#334155',
              background: 'white', outline: 'none', width: 220,
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
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
                  <th style={thStyle}>Şəxsiyyət ID</th>
                  <th style={thStyle}>Yaş</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Status</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => {
                  const fullName = u.name && u.surname ? `${u.name} ${u.surname}` : u.fullName || u.email
                  const initial = fullName?.[0]?.toUpperCase() || '?'
                  return (
                    <tr key={u._id} style={{ transition: 'background 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {u.photoUrl ? (
                            <img src={u.photoUrl} alt={fullName} style={{ width: 34, height: 34, borderRadius: 9, objectFit: 'cover' }} />
                          ) : (
                            <div style={{
                              width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                              background: 'linear-gradient(135deg,#00848e,#00a8b5)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: 'white', fontSize: 13, fontWeight: 700,
                            }}>{initial}</div>
                          )}
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>{fullName}</div>
                            {u.phone && <div style={{ fontSize: 11, color: '#94a3b8' }}>{u.phone}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={tdStyle}><RoleBadge role={u.role} /></td>
                      <td style={tdStyle}><span style={{ fontSize: 13 }}>{u.department || '—'}</span></td>
                      <td style={tdStyle}><span style={{ fontSize: 12, fontFamily: 'monospace', color: '#64748b' }}>{u.sexiyyatId || '—'}</span></td>
                      <td style={tdStyle}>{u.age || '—'}</td>
                      <td style={tdStyle}><span style={{ fontSize: 12, color: '#64748b' }}>{u.email}</span></td>
                      <td style={tdStyle}>
                        <Toggle checked={u.isActive} onChange={() => handleToggleActive(u)} />
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button onClick={() => setModal(u)} style={{
                            padding: '6px 12px', borderRadius: 7, border: '1px solid #e2e8f0',
                            background: 'white', fontSize: 12, cursor: 'pointer', color: '#334155',
                            display: 'flex', alignItems: 'center', gap: 5,
                          }}>
                            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            Redaktə
                          </button>
                          <button
                            onClick={() => { if (window.confirm('Silmək istədiyinizə əminsiniz?')) handleDelete(u._id) }}
                            disabled={deleting === u._id}
                            style={{
                              padding: '6px 12px', borderRadius: 7, border: '1px solid #fee2e2',
                              background: 'white', fontSize: 12, cursor: 'pointer', color: '#ef4444',
                              display: 'flex', alignItems: 'center', gap: 5,
                              opacity: deleting === u._id ? 0.5 : 1,
                            }}>
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

      {modal && (
        <Modal
          user={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); fetchUsers() }}
        />
      )}
    </AdminLayout>
  )
}
