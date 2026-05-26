import { useState, useEffect, useRef, useCallback } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'

const BASE = 'http://localhost:5000'
const PAGE_SIZE = 10
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const emptyForm = { fullName: '', email: '', phone: '', bloodGroup: '', doctorId: '' }

export default function AdminPatients() {
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
  const [doctors, setDoctors]       = useState([])
  const debounceRef = useRef(null)

  const token   = localStorage.getItem('adminToken')
  const headers = { Authorization: `Bearer ${token}` }

  const load = useCallback((q, pg) => {
    setLoading(true)
    const params = new URLSearchParams({ page: pg, limit: PAGE_SIZE })
    if (q) params.set('q', q)
    const url = q
      ? `${BASE}/api/v1/patients/search?${params}`
      : `${BASE}/api/v1/patients?${params}`
    fetch(url, { headers })
      .then(r => r.json())
      .then(data => {
        let list = []
        if (Array.isArray(data)) list = data
        else if (Array.isArray(data.patients)) list = data.patients
        else if (Array.isArray(data.data)) list = data.data
        else if (Array.isArray(data.docs)) list = data.docs
        setPatients(list)
        setTotal(data.total || list.length)
      })
      .catch(() => { setPatients([]); setTotal(0) })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load(search, page) }, [page])

  const handleSearch = (val) => {
    setSearch(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => { setPage(1); load(val, 1) }, 400)
  }

  const openDetail = (pat) => {
    setSelected(pat._id)
    setDetail(pat)
    setDetailLoad(true)
    fetch(`${BASE}/api/v1/patients/${pat._id}`, { headers })
      .then(r => r.json())
      .then(d => setDetail(d.data || d))
      .catch(() => {})
      .finally(() => setDetailLoad(false))
  }

  const openModal = () => {
    setForm(emptyForm); setFormError(''); setShowModal(true)
    fetch(`${BASE}/api/v1/site-doctors/all`, { headers })
      .then(r => r.json())
      .then(d => {
        const list = Array.isArray(d) ? d : d.doctors || d.data || []
        setDoctors(list)
      })
      .catch(() => setDoctors([]))
  }
  const closeModal = () => { setShowModal(false); setFormError('') }

  const handleSave = async () => {
    if (!form.fullName.trim()) { setFormError('Ad Soyad tələb olunur'); return }
    if (!form.email.trim())    { setFormError('E-poçt tələb olunur'); return }
    setSaving(true); setFormError('')
    try {
      const body = {
        fullName:  form.fullName.trim(),
        email:     form.email.trim(),
        phone:     form.phone.trim() || undefined,
        bloodGroup: form.bloodGroup || undefined,
        doctorId:  form.doctorId || undefined,
      }
      const r = await fetch(`${BASE}/api/v1/patients/admin-create`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.message || data.error || 'Xəta baş verdi')
      closeModal()
      load(search, page)
    } catch (e) { setFormError(e.message) }
    finally { setSaving(false) }
  }

  const pages = Math.ceil(total / PAGE_SIZE) || 1

  const getAge = (dob) => {
    if (!dob) return '—'
    return Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000)) + ' yaş'
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
              <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>{total} pasiyent</p>
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
            <input value={search} onChange={e => handleSearch(e.target.value)} placeholder="Ad, P-ID ilə axtar..." style={{ width: '100%', background: 'white', border: '1px solid #e2e8f0', borderRadius: 10, padding: '9px 14px 9px 36px', fontSize: 13, color: '#334155', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          {/* Table */}
          <div style={{ flex: 1, background: 'white', borderRadius: 14, border: '1px solid #f1f5f9', overflow: 'auto' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#00848e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              </div>
            ) : patients.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8', fontSize: 14 }}>Pasiyent tapılmadı</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    {['Ad Soyad', 'Patient ID', 'E-poçt', 'Yaş', 'Status'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(patients || []).map(pat => {
                    const u = pat.userId || pat
                    const isSelected = selected === pat._id
                    return (
                      <tr key={pat._id} onClick={() => openDetail(pat)} style={{ borderBottom: '1px solid #f8fafc', cursor: 'pointer', background: isSelected ? '#f0fafb' : 'white', transition: 'background 0.1s' }}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f8fafc' }}
                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'white' }}
                      >
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#00848e,#00a8b5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                              {(u.fullName || 'P')?.[0]?.toUpperCase()}
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#0f1b2d' }}>{u.fullName || '—'}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: '#00848e', fontWeight: 600 }}>{pat.patientId || '—'}</td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: '#64748b' }}>{u.email || '—'}</td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: '#64748b' }}>{getAge(pat.dateOfBirth)}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: '#f0fdf4', color: '#16a34a' }}>Aktiv</span>
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
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 18 }}>×</button>
              </div>

              {detailLoad ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                  <div style={{ width: 28, height: 28, border: '3px solid #e2e8f0', borderTopColor: '#00848e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                </div>
              ) : (
                <>
                  <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#00848e,#00a8b5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 24, fontWeight: 700, margin: '0 auto 10px' }}>
                      {((detail.userId?.fullName || detail.fullName || 'P')?.[0])?.toUpperCase()}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#0f1b2d' }}>{detail.userId?.fullName || detail.fullName || '—'}</div>
                    <div style={{ fontSize: 12, color: '#00848e', fontWeight: 600, marginTop: 2 }}>{detail.patientId || ''}</div>
                  </div>

                  <InfoRow label="E-poçt"       value={detail.userId?.email || detail.email || '—'} />
                  <InfoRow label="Telefon"       value={detail.phone || '—'} />
                  <InfoRow label="Doğum tarixi" value={detail.dateOfBirth ? new Date(detail.dateOfBirth).toLocaleDateString('az-AZ') : '—'} />
                  <InfoRow label="Yaş"           value={getAge(detail.dateOfBirth)} />
                  <InfoRow label="Cins"          value={detail.gender === 'male' ? 'Kişi' : detail.gender === 'female' ? 'Qadın' : '—'} />
                  <InfoRow label="Qan qrupu"     value={detail.bloodType || '—'} />
                  <InfoRow label="Ünvan"         value={detail.address || '—'} />

                  {detail.medicalHistory && detail.medicalHistory.length > 0 && (
                    <div style={{ marginTop: 16 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Tibbi tarix</div>
                      {detail.medicalHistory.map((h, i) => (
                        <div key={i} style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 12px', marginBottom: 8, fontSize: 12 }}>
                          <div style={{ fontWeight: 600, color: '#0f1b2d', marginBottom: 2 }}>{h.diagnosis || h.condition || '—'}</div>
                          {h.date && <div style={{ color: '#94a3b8' }}>{new Date(h.date).toLocaleDateString('az-AZ')}</div>}
                          {h.notes && <div style={{ color: '#64748b', marginTop: 4 }}>{h.notes}</div>}
                        </div>
                      ))}
                    </div>
                  )}

                  {detail.allergies && detail.allergies.length > 0 && (
                    <div style={{ marginTop: 14 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Allergiyalar</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {detail.allergies.map((a, i) => (
                          <span key={i} style={{ background: '#fef2f2', color: '#ef4444', fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20 }}>{a}</span>
                        ))}
                      </div>
                    </div>
                  )}
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
              <MField label="Ad Soyad *" value={form.fullName} onChange={v => setForm(f => ({ ...f, fullName: v }))} />
              <MField label="E-poçt *"   value={form.email}    onChange={v => setForm(f => ({ ...f, email: v }))}    type="email" />
              <MField label="Telefon"    value={form.phone}    onChange={v => setForm(f => ({ ...f, phone: v }))}    placeholder="0501234567" />
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>Qan qrupu</label>
                <select value={form.bloodGroup} onChange={e => setForm(f => ({ ...f, bloodGroup: e.target.value }))} style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 9, padding: '9px 12px', fontSize: 13, color: '#334155', outline: 'none', background: 'white', boxSizing: 'border-box' }}>
                  <option value="">Seçin...</option>
                  {BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>Həkim (istəyə bağlı)</label>
                <select value={form.doctorId} onChange={e => setForm(f => ({ ...f, doctorId: e.target.value }))} style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 9, padding: '9px 12px', fontSize: 13, color: '#334155', outline: 'none', background: 'white', boxSizing: 'border-box' }}>
                  <option value="">Həkim seçin...</option>
                  {doctors.map(d => (
                    <option key={d._id} value={d._id}>{d.fullName || d.name} {d.specialization || d.specialty ? `— ${d.specialization || d.specialty}` : ''}</option>
                  ))}
                </select>
              </div>
            </div>

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
