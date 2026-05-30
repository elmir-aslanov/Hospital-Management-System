import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'

const BASE = 'http://localhost:5000'

const STATUS_COLORS = {
  pending:   { bg: '#fef9c3', color: '#ca8a04', label: 'Gözləyir' },
  confirmed: { bg: '#dcfce7', color: '#16a34a', label: 'Təsdiqləndi' },
  completed: { bg: '#e0f2fe', color: '#0369a1', label: 'Tamamlandı' },
  cancelled: { bg: '#fef2f2', color: '#dc2626', label: 'Ləğv edildi' },
  gözləyir:  { bg: '#fef9c3', color: '#ca8a04', label: 'Gözləyir' },
}

const inputStyle = {
  width: '100%', border: '1px solid #e2e8f0', borderRadius: 9,
  padding: '9px 12px', fontSize: 13, color: '#334155',
  outline: 'none', boxSizing: 'border-box', background: 'white',
}

const labelStyle = { fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }

export default function AdminAppointments() {
  const [appts, setAppts]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [statusFilter, setStatus] = useState('all')
  const [dateFilter, setDate]     = useState('')
  const [modal, setModal]         = useState(false)
  const [saving, setSaving]       = useState(false)
  const [patchId, setPatchId]     = useState(null)
  const [rescheduleModal,  setRescheduleModal]  = useState(false)
  const [rescheduleAppt,   setRescheduleAppt]   = useState(null)
  const [rescheduleDate,   setRescheduleDate]   = useState('')
  const [rescheduleStart,  setRescheduleStart]  = useState('')
  const [rescheduleEnd,    setRescheduleEnd]    = useState('')
  const [rescheduleErr,    setRescheduleErr]    = useState('')
  const [rescheduleSaving, setRescheduleSaving] = useState(false)
  const [searchParams]            = useSearchParams()

  /* ── modal form state ── */
  const [patientSearch,   setPatientSearch]   = useState('')
  const [patientResults,  setPatientResults]  = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [doctors,         setDoctors]         = useState([])
  const [selectedDoctor,  setSelectedDoctor]  = useState('')
  const [apptDate,        setApptDate]        = useState('')
  const [apptTime,        setApptTime]        = useState('')
  const [note,            setNote]            = useState('')
  const [formError,       setFormError]       = useState('')
  const searchTimer = useRef(null)

  const token   = localStorage.getItem('adminToken')
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

  const load = () => {
    setLoading(true)
    fetch(`${BASE}/api/v1/appointments?limit=50`, { headers })
      .then(r => r.json())
      .then(d => {
        const list = Array.isArray(d.data) ? d.data : Array.isArray(d) ? d : d.appointments || d.result || []
        setAppts(list)
      })
      .catch(() => setAppts([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  /* open modal if ?new=true on mount */
  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      openModal()
    }
  }, [])

  const openModal = () => {
    setPatientSearch('')
    setPatientResults([])
    setSelectedPatient(null)
    setSelectedDoctor('')
    setApptDate('')
    setApptTime('')
    setNote('')
    setFormError('')
    setModal(true)
    /* fetch doctors */
    fetch(`${BASE}/api/v1/site-doctors/all`, { headers })
      .then(r => r.json())
      .then(d => {
        const list = Array.isArray(d.data) ? d.data : d.data?.doctors || d.doctors || []
        setDoctors(Array.isArray(list) ? list : [])
      })
      .catch(() => setDoctors([]))
  }

  const closeModal = () => { setModal(false) }

  /* patient search with debounce */
  const handlePatientSearch = (val) => {
    setPatientSearch(val)
    setSelectedPatient(null)
    clearTimeout(searchTimer.current)
    if (!val.trim()) { setPatientResults([]); return }
    searchTimer.current = setTimeout(() => {
      fetch(`${BASE}/api/v1/patients/search?q=${encodeURIComponent(val)}`, { headers })
        .then(r => r.json())
        .then(d => {
          const list = Array.isArray(d.data) ? d.data : d.data?.patients || d.patients || []
          setPatientResults(Array.isArray(list) ? list.slice(0, 6) : [])
        })
        .catch(() => setPatientResults([]))
    }, 350)
  }

  const selectPatient = (p) => {
    setSelectedPatient(p)
    const name = p.userId?.fullName || p.fullName || p.name || ''
    setPatientSearch(name)
    setPatientResults([])
  }

  const handleSave = async () => {
    if (!selectedPatient || !selectedDoctor || !apptDate || !apptTime) {
      setFormError('Pasiyent, həkim, tarix və saat mütləqdir')
      return
    }
    setFormError('')
    setSaving(true)
    try {
      const res = await fetch(`${BASE}/api/v1/appointments`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          patientId: selectedPatient._id,
          doctorId:  selectedDoctor,
          date:      new Date(apptDate).toISOString(),
          time:      apptTime,
          note,
          status:    'gözləyir',
        }),
      })
      const data = await res.json()
      if (!res.ok) { setFormError(data.message || 'Xəta baş verdi'); return }
      closeModal()
      load()
    } catch {
      setFormError('Server xətası, yenidən cəhd edin')
    } finally {
      setSaving(false)
    }
  }

  const handleStatusPatch = async (id, status) => {
    setPatchId(id)
    try {
      await fetch(`${BASE}/api/v1/appointments/${id}/status`, {
        method: 'PATCH', headers, body: JSON.stringify({ status }),
      })
      setAppts(prev => prev.map(a => a._id === id ? { ...a, status } : a))
    } catch {}
    finally { setPatchId(null) }
  }

  const filtered = appts.filter(a => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false
    if (dateFilter) {
      const d = a.date ? new Date(a.date).toISOString().slice(0, 10) : a.appointmentDate?.slice(0, 10)
      if (d !== dateFilter) return false
    }
    return true
  })

  const getName   = (a) => {
    const p = a.patientId
    if (!p) return '—'
    return p.userId?.fullName || p.fullName || '—'
  }
  const getDoctor = (a) => {
    const d = a.doctorId
    if (!d) return '—'
    const u = d.userId
    if (u?.fullName?.trim()) return u.fullName.trim()
    const ns = ((u?.name || '') + ' ' + (u?.surname || '')).trim()
    if (ns) return ns
    return d.name || d.fullName || '—'
  }
  const getDate   = (a) => { const raw = a.date || a.appointmentDate || a.createdAt; if (!raw) return '—'; return new Date(raw).toLocaleDateString('az-AZ') }
  const getTime   = (a) => a.time || a.timeSlot || '—'
  const todayStr  = new Date().toISOString().split('T')[0]

  const openReschedule = (appt) => {
    setRescheduleAppt(appt)
    const d = appt.date ? new Date(appt.date).toISOString().split('T')[0] : ''
    setRescheduleDate(d)
    setRescheduleStart(appt.startTime || '')
    setRescheduleEnd(appt.endTime || '')
    setRescheduleErr('')
    setRescheduleModal(true)
  }

  const handleReschedule = async () => {
    if (!rescheduleDate || !rescheduleStart || !rescheduleEnd) {
      setRescheduleErr('Tarix, başlama və bitmə vaxtı mütləqdir')
      return
    }
    if (rescheduleStart >= rescheduleEnd) {
      setRescheduleErr('Bitmə vaxtı başlama vaxtından sonra olmalıdır')
      return
    }
    setRescheduleSaving(true); setRescheduleErr('')
    try {
      const res = await fetch(`${BASE}/api/v1/appointments/${rescheduleAppt._id}/reschedule`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ date: rescheduleDate, startTime: rescheduleStart, endTime: rescheduleEnd }),
      })
      const data = await res.json()
      if (!res.ok) { setRescheduleErr(data.message || 'Xəta baş verdi'); return }
      setAppts(prev => prev.map(a => a._id === rescheduleAppt._id
        ? { ...a, date: rescheduleDate, startTime: rescheduleStart, endTime: rescheduleEnd, status: 'scheduled' }
        : a
      ))
      setRescheduleModal(false)
    } catch { setRescheduleErr('Server xətası') }
    finally { setRescheduleSaving(false) }
  }

  return (
    <AdminLayout activePage="appointments">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f1b2d' }}>Randevular</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>{filtered.length} randevu göstərilir</p>
        </div>
        <button onClick={openModal} style={{ background: '#00848e', color: 'white', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Yeni randevu
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[['all', 'Hamısı'], ['pending', 'Gözləyir'], ['confirmed', 'Təsdiqləndi'], ['completed', 'Tamamlandı'], ['cancelled', 'Ləğv edildi']].map(([v, l]) => (
            <button key={v} onClick={() => setStatus(v)} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid', fontSize: 12, fontWeight: 600, cursor: 'pointer', borderColor: statusFilter === v ? '#00848e' : '#e2e8f0', background: statusFilter === v ? '#00848e' : 'white', color: statusFilter === v ? 'white' : '#475569' }}>{l}</button>
          ))}
        </div>
        <input type="date" value={dateFilter} onChange={e => setDate(e.target.value)} style={{ border: '1px solid #e2e8f0', borderRadius: 9, padding: '6px 12px', fontSize: 13, color: '#334155', outline: 'none', background: 'white' }} />
        {dateFilter && <button onClick={() => setDate('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 12 }}>Təmizlə</button>}
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: 14, border: '1px solid #f1f5f9', overflow: 'auto' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#00848e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8', fontSize: 14 }}>Randevu tapılmadı</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                {['Pasiyent', 'Həkim', 'Tarix', 'Saat', 'Status', 'Əməliyyat'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => {
                const sc = STATUS_COLORS[a.status] || STATUS_COLORS.pending
                const patching = patchId === a._id
                return (
                  <tr key={a._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '12px 16px' }}><div style={{ fontSize: 13, fontWeight: 600, color: '#0f1b2d' }}>{getName(a)}</div></td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#475569' }}>{getDoctor(a)}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#475569' }}>{getDate(a)}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#475569' }}>{getTime(a)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: sc.bg, color: sc.color }}>{sc.label}</span>
                    </td>
                    <td style={{ padding: '12px 16px', display: 'flex', gap: 6, alignItems: 'center' }}>
                      <select
                        disabled={patching}
                        value={a.status || 'pending'}
                        onChange={e => handleStatusPatch(a._id, e.target.value)}
                        style={{ border: '1px solid #e2e8f0', borderRadius: 7, padding: '5px 8px', fontSize: 12, color: '#334155', outline: 'none', background: 'white', cursor: patching ? 'not-allowed' : 'pointer', opacity: patching ? 0.5 : 1 }}
                      >
                        <option value="pending">Gözləyir</option>
                        <option value="confirmed">Təsdiqləndi</option>
                        <option value="completed">Tamamlandı</option>
                        <option value="cancelled">Ləğv edildi</option>
                      </select>
                      {!['completed','cancelled','missed'].includes(a.status) && (
                        <button
                          onClick={() => openReschedule(a)}
                          title="Vaxtı dəyiş"
                          style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid #e2e8f0', background: 'white', fontSize: 11, fontWeight: 600, color: '#475569', cursor: 'pointer', whiteSpace: 'nowrap' }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = '#00848e'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                        >
                          📅 Dəyiş
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* New Appointment Modal */}
      {modal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div style={{ background: 'white', borderRadius: 16, width: 500, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f1b2d' }}>Yeni randevu</h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 20 }}>×</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

              {/* Patient search */}
              <div style={{ gridColumn: '1/-1', position: 'relative' }}>
                <label style={labelStyle}>Pasiyent <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  value={patientSearch}
                  onChange={e => handlePatientSearch(e.target.value)}
                  placeholder="Ad və ya soyad ilə axtar..."
                  style={{ ...inputStyle, borderColor: selectedPatient ? '#00848e' : '#e2e8f0' }}
                />
                {selectedPatient && (
                  <div style={{ fontSize: 11, color: '#00848e', marginTop: 4 }}>
                    ✓ Seçildi: {selectedPatient.userId?.fullName || selectedPatient.fullName || selectedPatient.name}
                  </div>
                )}
                {patientResults.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #e2e8f0', borderRadius: 9, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 100, maxHeight: 200, overflowY: 'auto' }}>
                    {patientResults.map(p => {
                      const name = p.userId?.fullName || p.fullName || p.name || '—'
                      const pid  = p.patientId || p._id
                      return (
                        <div
                          key={p._id}
                          onClick={() => selectPatient(p)}
                          style={{ padding: '10px 14px', cursor: 'pointer', fontSize: 13, borderBottom: '1px solid #f8fafc' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f0fafb'}
                          onMouseLeave={e => e.currentTarget.style.background = 'white'}
                        >
                          <div style={{ fontWeight: 600, color: '#0f1b2d' }}>{name}</div>
                          {pid && <div style={{ fontSize: 11, color: '#94a3b8' }}>{pid}</div>}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Doctor select */}
              <div style={{ gridColumn: '1/-1' }}>
                <label style={labelStyle}>Həkim <span style={{ color: '#ef4444' }}>*</span></label>
                <select
                  value={selectedDoctor}
                  onChange={e => setSelectedDoctor(e.target.value)}
                  style={{ ...inputStyle, height: 38, cursor: 'pointer' }}
                >
                  <option value="">— Həkim seçin —</option>
                  {doctors.map(d => {
                    const u = d.userId
                    const name = (u?.fullName?.trim()) || ((u?.name || '') + ' ' + (u?.surname || '')).trim() || d.name || d.fullName || '—'
                    return <option key={d._id} value={d._id}>{name}{d.department ? ` (${d.department})` : ''}</option>
                  })}
                </select>
              </div>

              {/* Date */}
              <div>
                <label style={labelStyle}>Tarix <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="date"
                  value={apptDate}
                  min={todayStr}
                  onChange={e => setApptDate(e.target.value)}
                  style={inputStyle}
                />
              </div>

              {/* Time */}
              <div>
                <label style={labelStyle}>Saat <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="time"
                  value={apptTime}
                  onChange={e => setApptTime(e.target.value)}
                  style={inputStyle}
                />
              </div>

              {/* Note */}
              <div style={{ gridColumn: '1/-1' }}>
                <label style={labelStyle}>Qeyd</label>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  rows={3}
                  style={{ ...inputStyle, height: 'auto', padding: '9px 12px', resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>
            </div>

            {formError && (
              <p style={{ color: '#dc2626', fontSize: 13, margin: '12px 0 0' }}>{formError}</p>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
              <button onClick={closeModal} style={{ padding: '10px 20px', border: '1px solid #e2e8f0', borderRadius: 9, background: 'white', fontSize: 13, cursor: 'pointer', color: '#475569' }}>Ləğv et</button>
              <button onClick={handleSave} disabled={saving} style={{ padding: '10px 24px', border: 'none', borderRadius: 9, background: '#00848e', color: 'white', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saxlanır...' : 'Yarat'}
              </button>
            </div>
          </div>
        </div>
      )}

      {rescheduleModal && rescheduleAppt && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget) setRescheduleModal(false) }}
        >
          <div style={{ background: 'white', borderRadius: 16, width: 420, maxWidth: '100%', padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f1b2d' }}>Vaxtı Dəyiş</h2>
                <p style={{ margin: '3px 0 0', fontSize: 12, color: '#94a3b8' }}>
                  {getName(rescheduleAppt)} — {getDoctor(rescheduleAppt)}
                </p>
              </div>
              <button onClick={() => setRescheduleModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 20 }}>×</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14 }}>
              <div>
                <label style={labelStyle}>Yeni tarix <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="date"
                  value={rescheduleDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setRescheduleDate(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Başlama vaxtı <span style={{ color: '#ef4444' }}>*</span></label>
                  <input type="time" value={rescheduleStart} onChange={e => setRescheduleStart(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Bitmə vaxtı <span style={{ color: '#ef4444' }}>*</span></label>
                  <input type="time" value={rescheduleEnd} onChange={e => setRescheduleEnd(e.target.value)} style={inputStyle} />
                </div>
              </div>
            </div>

            {rescheduleErr && (
              <div style={{ background: '#fef2f2', color: '#dc2626', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginTop: 14 }}>
                {rescheduleErr}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
              <button onClick={() => setRescheduleModal(false)} style={{ padding: '10px 20px', border: '1px solid #e2e8f0', borderRadius: 9, background: 'white', fontSize: 13, cursor: 'pointer', color: '#475569' }}>
                Ləğv et
              </button>
              <button onClick={handleReschedule} disabled={rescheduleSaving} style={{ padding: '10px 24px', border: 'none', borderRadius: 9, background: '#00848e', color: 'white', fontSize: 13, fontWeight: 600, cursor: rescheduleSaving ? 'not-allowed' : 'pointer', opacity: rescheduleSaving ? 0.7 : 1 }}>
                {rescheduleSaving ? 'Saxlanır...' : 'Təsdiqlə'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </AdminLayout>
  )
}
