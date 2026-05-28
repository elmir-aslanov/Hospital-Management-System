import { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'

const BASE      = 'http://localhost:5000'
const PAGE_SIZE = 10
const emptyForm = { name: '', surname: '', email: '', phone: '', address: '', birthDate: '' }

const fullName = (u) => {
  if (u.name && u.surname) return `${u.name} ${u.surname}`
  return u.fullName || u.name || u.surname || '—'
}

export default function AdminPatients() {
  const token = localStorage.getItem('adminToken') || localStorage.getItem('token')

  const [patients, setPatients]     = useState([])
  const [total, setTotal]           = useState(0)
  const [page, setPage]             = useState(1)
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [selected, setSelected]     = useState(null)
  const [detail, setDetail]         = useState(null)
  const [detailLoad, setDetailLoad] = useState(false)
  const [showModal, setShowModal]   = useState(false)
  const [form, setForm]             = useState(emptyForm)
  const [saving, setSaving]         = useState(false)
  const [formError, setFormError]   = useState('')

  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    fetch(`${BASE}/api/v1/users?role=PATIENT`, {
      headers: { Authorization: 'Bearer ' + token },
    })
      .then(r => r.json())
      .then(data => {
        let list = []
        if (Array.isArray(data))                    list = data
        else if (Array.isArray(data.data?.users))   list = data.data.users
        else if (Array.isArray(data.users))         list = data.users
        else if (Array.isArray(data.patients))      list = data.patients
        else if (Array.isArray(data.data))          list = data.data
        setPatients(list)
        setTotal(data.total || data.data?.total || list.length)
      })
      .catch(() => setPatients([]))
      .finally(() => setLoading(false))
  }, [])

  /* client-side search + pagination */
  const filtered = patients.filter(p =>
    !search ||
    ((p.name || '') + ' ' + (p.surname || '')).toLowerCase().includes(search.toLowerCase()) ||
    (p.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.phone || '').includes(search)
  )
  const pages    = Math.ceil(filtered.length / PAGE_SIZE) || 1
  const pagSlice = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleSearch = (val) => { setSearch(val); setPage(1) }

  const openDetail = (user) => {
    setSelected(user._id)
    setDetail(user)
    setDetailLoad(true)
    fetch(`${BASE}/api/v1/users/${user._id}`, { headers })
      .then(r => r.json())
      .then(d => setDetail(d.data || d))
      .catch(() => {})
      .finally(() => setDetailLoad(false))
  }

  const openModal  = () => { setForm(emptyForm); setFormError(''); setShowModal(true) }
  const closeModal = () => { setShowModal(false); setFormError('') }

  const handleSave = async () => {
    if (!form.name.trim())    { setFormError('Ad tələb olunur'); return }
    if (!form.surname.trim()) { setFormError('Soyad tələb olunur'); return }
    if (!form.email.trim())   { setFormError('E-poçt tələb olunur'); return }
    setSaving(true); setFormError('')
    try {
      const body = {
        name:      form.name.trim(),
        surname:   form.surname.trim(),
        email:     form.email.trim(),
        password:  'Aslan123!',
        phone:     form.phone.trim()     || undefined,
        address:   form.address.trim()   || undefined,
        birthDate: form.birthDate        || undefined,
        role:      'PATIENT',
      }
      const r = await fetch(`${BASE}/api/v1/users`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.message || data.error || 'Xəta baş verdi')
      const created = data.data || data.user || data
      if (created && created._id) setPatients(prev => [created, ...prev])
      closeModal()
    } catch (e) { setFormError(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = (id) => {
    if (!window.confirm('Bu pasiyenti silmək istəyirsiniz?')) return
    fetch(`${BASE}/api/v1/users/${id}`, {
      method: 'DELETE',
      headers,
    }).then(() => {
      setPatients(prev => prev.filter(p => p._id !== id))
      if (selected === id) { setSelected(null); setDetail(null) }
    })
  }

  return (
    <AdminLayout activePage="patients">
      <div style={{ display: 'flex', gap: 22, height: 'calc(100vh - 130px)' }}>

        {/* LEFT PANEL */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f1b2d' }}>Pasiyentlər</h1>
              <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>{filtered.length} pasiyent</p>
            </div>
            <button onClick={openModal} style={{ background: '#00848e', color: 'white', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Yeni Pasiyent
            </button>
          </div>

          {/* Search */}
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
              <svg width="14" height="14" fill="none" stroke="#94a3b8" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
            <input value={search} onChange={e => handleSearch(e.target.value)} placeholder="Ad, soyad, email ilə axtar..." style={{ width: '100%', background: 'white', border: '1px solid #e2e8f0', borderRadius: 10, padding: '9px 14px 9px 36px', fontSize: 13, color: '#334155', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          {/* Table */}
          <div style={{ flex: 1, background: 'white', borderRadius: 14, border: '1px solid #f1f5f9', overflow: 'auto' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#00848e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              </div>
            ) : pagSlice.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8', fontSize: 14 }}>Pasiyent tapılmadı</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    {['Ad Soyad', 'E-poçt', 'Telefon', 'Ünvan', 'Doğum tarixi', 'Status', ''].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagSlice.map(u => {
                    const name       = fullName(u)
                    const isSelected = selected === u._id
                    const dob        = u.birthDate
                      ? new Date(u.birthDate).toLocaleDateString('az-AZ')
                      : u.age ? `${u.age} yaş` : '—'
                    return (
                      <tr key={u._id} onClick={() => openDetail(u)}
                        style={{ borderBottom: '1px solid #f8fafc', cursor: 'pointer', background: isSelected ? '#f0fafb' : 'white', transition: 'background 0.1s' }}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f8fafc' }}
                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'white' }}
                      >
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#00848e,#00a8b5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                              {name?.[0]?.toUpperCase() || 'P'}
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#0f1b2d' }}>{name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: '#64748b' }}>{u.email || '—'}</td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: '#64748b' }}>{u.phone || '—'}</td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: '#64748b', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.address || '—'}</td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: '#64748b' }}>{dob}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: u.isActive !== false ? '#f0fdf4' : '#fef2f2', color: u.isActive !== false ? '#16a34a' : '#dc2626' }}>
                            {u.isActive !== false ? 'Aktiv' : 'Deaktiv'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }} onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => handleDelete(u._id)}
                            style={{ padding: '4px 10px', borderRadius: 7, border: '1px solid #fee2e2', background: 'white', fontSize: 11, cursor: 'pointer', color: '#ef4444' }}
                          >Sil</button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14 }}>
              <PagBtn label="‹" disabled={page === 1} onClick={() => setPage(p => p - 1)} />
              {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map(p => (
                <PagBtn key={p} label={p} active={p === page} onClick={() => setPage(p)} />
              ))}
              <PagBtn label="›" disabled={page === pages} onClick={() => setPage(p => p + 1)} />
            </div>
          )}
        </div>

        {/* DETAIL PANEL */}
        <div style={{ width: selected ? 320 : 0, transition: 'width 0.25s', overflow: 'hidden', flexShrink: 0 }}>
          {selected && detail && (
            <div style={{ width: 320, background: 'white', borderRadius: 14, border: '1px solid #f1f5f9', height: '100%', overflow: 'auto', padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#0f1b2d' }}>Pasiyent məlumatı</span>
                <button onClick={() => { setSelected(null); setDetail(null) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 18 }}>×</button>
              </div>

              {detailLoad ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                  <div style={{ width: 28, height: 28, border: '3px solid #e2e8f0', borderTopColor: '#00848e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                </div>
              ) : (
                <>
                  <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#00848e,#00a8b5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 24, fontWeight: 700, margin: '0 auto 10px' }}>
                      {fullName(detail)?.[0]?.toUpperCase() || 'P'}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#0f1b2d' }}>{fullName(detail)}</div>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: detail.isActive !== false ? '#f0fdf4' : '#fef2f2', color: detail.isActive !== false ? '#16a34a' : '#dc2626', display: 'inline-block', marginTop: 6 }}>
                      {detail.isActive !== false ? 'Aktiv' : 'Deaktiv'}
                    </span>
                  </div>

                  <InfoRow label="E-poçt"        value={detail.email || '—'} />
                  <InfoRow label="Telefon"        value={detail.phone || '—'} />
                  <InfoRow label="Ünvan"          value={detail.address || '—'} />
                  <InfoRow label="FİN / Şəx. ID"  value={detail.sexiyyatId || '—'} />
                  <InfoRow label="Doğum tarixi"   value={detail.birthDate ? new Date(detail.birthDate).toLocaleDateString('az-AZ') : detail.age ? `${detail.age} yaş` : '—'} />
                  <InfoRow label="Şöbə"           value={detail.department || '—'} />
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ADD PATIENT MODAL */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div style={{ background: 'white', borderRadius: 16, width: 520, maxWidth: '95vw', maxHeight: '90vh', overflow: 'auto', padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f1b2d' }}>Yeni Pasiyent</h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 22, lineHeight: 1 }}>×</button>
            </div>

            {formError && (
              <div style={{ background: '#fef2f2', color: '#ef4444', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>{formError}</div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <MField label="Ad *"           value={form.name}      onChange={v => setForm(f => ({ ...f, name: v }))} />
              <MField label="Soyad *"        value={form.surname}   onChange={v => setForm(f => ({ ...f, surname: v }))} />
              <MField label="E-poçt *"       value={form.email}     onChange={v => setForm(f => ({ ...f, email: v }))} type="email" />
              <MField label="Telefon"        value={form.phone}     onChange={v => setForm(f => ({ ...f, phone: v }))} placeholder="0501234567" />
              <MField label="Doğum tarixi"   value={form.birthDate} onChange={v => setForm(f => ({ ...f, birthDate: v }))} type="date" />
              <div style={{ gridColumn: 'span 2' }}>
                <MField label="Ünvan" value={form.address} onChange={v => setForm(f => ({ ...f, address: v }))} placeholder="Bakı, Azərbaycan" />
              </div>
            </div>

            <p style={{ margin: '14px 0 0', fontSize: 12, color: '#94a3b8' }}>
              Şifrə avtomatik olaraq <strong>Aslan123!</strong> təyin ediləcək.
            </p>

            <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
              <button onClick={closeModal} style={{ padding: '10px 20px', border: '1px solid #e2e8f0', borderRadius: 9, background: 'white', fontSize: 13, cursor: 'pointer', color: '#475569' }}>Ləğv et</button>
              <button onClick={handleSave} disabled={saving} style={{ padding: '10px 24px', border: 'none', borderRadius: 9, background: '#00848e', color: 'white', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saxlanır...' : 'Əlavə et'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </AdminLayout>
  )
}

function MField({ label, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 9, padding: '9px 12px', fontSize: 13, color: '#334155', outline: 'none', boxSizing: 'border-box' }} />
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f8fafc' }}>
      <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 12, color: '#334155', fontWeight: 600, textAlign: 'right', maxWidth: '60%' }}>{value}</span>
    </div>
  )
}

function PagBtn({ label, onClick, disabled, active }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ width: 32, height: 32, borderRadius: 8, border: active ? 'none' : '1px solid #e2e8f0', background: active ? '#00848e' : 'white', color: active ? 'white' : '#475569', fontSize: 13, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {label}
    </button>
  )
}
