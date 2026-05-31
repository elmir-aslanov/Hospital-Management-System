import { useState, useEffect, useRef } from 'react'
import DoctorLayout from '../../components/doctor/DoctorLayout'

import { BASE } from '../../api/config.js'

function getToken() {
  return localStorage.getItem('adminToken') || localStorage.getItem('doctorToken') || ''
}

function getDoctorUser() {
  try {
    return JSON.parse(localStorage.getItem('adminUser') || localStorage.getItem('doctorUser') || '{}')
  } catch { return {} }
}

function formatDate(str) {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const STATUS_COLORS = {
  active:    { bg: '#dcfce7', color: '#166534' },
  completed: { bg: '#dbeafe', color: '#1e40af' },
  cancelled: { bg: '#fee2e2', color: '#991b1b' },
}

export default function DoctorPrescriptions() {
  const doctorUser = getDoctorUser()
  const doctorId   = doctorUser._id || doctorUser.id || ''

  const [prescriptions, setPrescriptions] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [modal,    setModal]    = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [delId,    setDelId]    = useState(null)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState('')
  const [search,   setSearch]   = useState('')
  const [patients, setPatients] = useState([])
  const [patSearch, setPatSearch] = useState('')
  const [patLoading, setPatLoading] = useState(false)
  const debounceRef = useRef(null)

  const emptyForm = { patientId: '', patientName: '', medicine: '', dose: '', duration: '', note: '', status: 'active' }
  const [form, setForm] = useState(emptyForm)

  const load = async () => {
    setLoading(true)
    try {
      const url = doctorId
        ? `${BASE}/api/v1/prescriptions?doctorId=${doctorId}&limit=100`
        : `${BASE}/api/v1/prescriptions?limit=100`
      const r = await fetch(url, { headers: { Authorization: `Bearer ${getToken()}` } })
      const data = await r.json()
      let list = []
      if (Array.isArray(data)) list = data
      else if (Array.isArray(data.data)) list = data.data
      else if (Array.isArray(data.prescriptions)) list = data.prescriptions
      else if (Array.isArray(data.docs)) list = data.docs
      setPrescriptions(list)
    } catch {
      setPrescriptions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const searchPatients = async (q) => {
    if (!q.trim()) { setPatients([]); return }
    setPatLoading(true)
    try {
      const r = await fetch(`${BASE}/api/v1/patients/search?q=${encodeURIComponent(q)}&limit=10`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      const data = await r.json()
      let list = []
      if (Array.isArray(data)) list = data
      else if (Array.isArray(data.data)) list = data.data
      else if (Array.isArray(data.patients)) list = data.patients
      setPatients(list)
    } catch {
      setPatients([])
    } finally {
      setPatLoading(false)
    }
  }

  const handlePatSearch = (val) => {
    setPatSearch(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => searchPatients(val), 350)
  }

  const selectPatient = (pat) => {
    setForm(f => ({ ...f, patientId: pat._id, patientName: pat.name || pat.fullName || '' }))
    setPatients([])
    setPatSearch(pat.name || pat.fullName || '')
  }

  const handleSave = async () => {
    if (!form.patientId) { setError('Pasiyent seçin'); return }
    if (!form.medicine.trim()) { setError('Dərman adını daxil edin'); return }
    if (!form.dose.trim()) { setError('Dozanı daxil edin'); return }
    if (!form.duration.trim()) { setError('Müddəti daxil edin'); return }
    setError('')
    setSaving(true)
    try {
      const body = {
        patientId: form.patientId,
        medicine:  form.medicine.trim(),
        dose:      form.dose.trim(),
        duration:  form.duration.trim(),
        note:      form.note.trim(),
        status:    form.status,
      }
      if (doctorId) body.doctorId = doctorId
      const r = await fetch(`${BASE}/api/v1/prescriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(body),
      })
      if (!r.ok) {
        const d = await r.json()
        throw new Error(d.message || d.error || 'Xəta baş verdi')
      }
      setModal(false)
      setForm(emptyForm)
      setPatSearch('')
      setPatients([])
      setSuccess('Resept uğurla əlavə edildi')
      setTimeout(() => setSuccess(''), 3000)
      load()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!delId) return
    try {
      await fetch(`${BASE}/api/v1/prescriptions/${delId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      setDelId(null)
      setSuccess('Resept silindi')
      setTimeout(() => setSuccess(''), 3000)
      load()
    } catch {
      setDelId(null)
    }
  }

  const filtered = (prescriptions || []).filter(p => {
    const name = p.patientId?.name || p.patientId?.fullName || p.patientName || ''
    const med  = p.medicine || p.medicationName || ''
    const q    = search.toLowerCase()
    return name.toLowerCase().includes(q) || med.toLowerCase().includes(q)
  })

  return (
    <DoctorLayout activePage="prescriptions">
      {success && (
        <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: 10, padding: '10px 16px', marginBottom: 16, color: '#166534', fontSize: 13 }}>
          {success}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#0f1b2d' }}>Reseptlər</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>{filtered.length} resept tapıldı</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Pasiyent və ya dərman axtar..."
            style={{ padding: '8px 14px', borderRadius: 9, border: '1px solid #e2e8f0', fontSize: 13, width: 220, outline: 'none' }}
          />
          <button onClick={() => { setModal(true); setForm(emptyForm); setPatSearch(''); setPatients([]); setError('') }} style={{
            background: '#00848e', color: 'white', border: 'none', borderRadius: 9,
            padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6
          }}>
            <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Yeni Resept
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              {['Pasiyent', 'Dərman', 'Doza', 'Müddət', 'Tarix', 'Status', 'Əməliyyatlar'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>Yüklənir...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>
                {search ? 'Nəticə tapılmadı' : 'Hələ resept yoxdur'}
              </td></tr>
            ) : filtered.map(p => {
              const patName = p.patientId?.name || p.patientId?.fullName || p.patientName || '—'
              const patId   = p.patientId?.patientId || p.patientId?.pid || ''
              const medicine = p.medicine || p.medicationName || '—'
              const dose     = p.dose || p.dosage || '—'
              const duration = p.duration || '—'
              const status   = p.status || 'active'
              const sc       = STATUS_COLORS[status] || STATUS_COLORS.active
              return (
                <tr key={p._id} style={{ borderBottom: '1px solid #f1f5f9' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#0f1b2d' }}>{patName}</div>
                    {patId && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{patId}</div>}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#334155', fontWeight: 500 }}>{medicine}</td>
                  <td style={{ padding: '12px 16px', color: '#475569' }}>{dose}</td>
                  <td style={{ padding: '12px 16px', color: '#475569' }}>{duration}</td>
                  <td style={{ padding: '12px 16px', color: '#64748b' }}>{formatDate(p.createdAt)}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ background: sc.bg, color: sc.color, borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>
                      {status === 'active' ? 'Aktiv' : status === 'completed' ? 'Tamamlandı' : 'Ləğv edildi'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button onClick={() => setDelId(p._id)} style={{
                      background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 7,
                      padding: '5px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 500
                    }}>Sil</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* New Prescription Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: 16, width: 480, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f1b2d' }}>Yeni Resept</h3>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8', lineHeight: 1 }}>×</button>
            </div>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {error && <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#dc2626' }}>{error}</div>}

              {/* Patient search */}
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Pasiyent *</label>
                <input
                  value={patSearch}
                  onChange={e => handlePatSearch(e.target.value)}
                  placeholder="Ad ilə axtarın..."
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1px solid #d1d5db', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                />
                {form.patientId && (
                  <div style={{ fontSize: 11, color: '#00848e', marginTop: 3 }}>✓ Seçildi</div>
                )}
                {patients.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #e2e8f0', borderRadius: 9, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', zIndex: 10, maxHeight: 200, overflow: 'auto' }}>
                    {patLoading ? (
                      <div style={{ padding: '10px 14px', color: '#94a3b8', fontSize: 13 }}>Axtarılır...</div>
                    ) : patients.map(pat => (
                      <div key={pat._id} onClick={() => selectPatient(pat)}
                        style={{ padding: '9px 14px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', fontSize: 13 }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <span style={{ fontWeight: 600 }}>{pat.name || pat.fullName}</span>
                        {pat.patientId && <span style={{ color: '#94a3b8', marginLeft: 6, fontSize: 11 }}>{pat.patientId}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {[
                { key: 'medicine', label: 'Dərman adı *', placeholder: 'məs. Amoksisilin 500mg' },
                { key: 'dose',     label: 'Doza *',       placeholder: 'məs. Gündə 3 dəfə 1 həb' },
                { key: 'duration', label: 'Müddət *',     placeholder: 'məs. 7 gün' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>{f.label}</label>
                  <input
                    value={form[f.key]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1px solid #d1d5db', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              ))}

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Qeyd</label>
                <textarea
                  value={form.note}
                  onChange={e => setForm(prev => ({ ...prev, note: e.target.value }))}
                  placeholder="Əlavə qeydlər..."
                  rows={3}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1px solid #d1d5db', fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <button onClick={() => setModal(false)} style={{ flex: 1, padding: '10px', borderRadius: 9, border: '1px solid #e2e8f0', background: 'white', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
                  Ləğv et
                </button>
                <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: '10px', borderRadius: 9, border: 'none', background: saving ? '#94a3b8' : '#00848e', color: 'white', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}>
                  {saving ? 'Saxlanılır...' : 'Resept Yaz'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {delId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: 14, padding: 28, width: 340, textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <svg width="22" height="22" fill="none" stroke="#dc2626" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            </div>
            <h4 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700, color: '#0f1b2d' }}>Resepti silmək istəyirsiniz?</h4>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: '#64748b' }}>Bu əməliyyat geri qaytarıla bilməz.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setDelId(null)} style={{ flex: 1, padding: '9px', borderRadius: 9, border: '1px solid #e2e8f0', background: 'white', fontSize: 13, cursor: 'pointer' }}>Ləğv et</button>
              <button onClick={handleDelete} style={{ flex: 1, padding: '9px', borderRadius: 9, border: 'none', background: '#dc2626', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Sil</button>
            </div>
          </div>
        </div>
      )}
    </DoctorLayout>
  )
}
