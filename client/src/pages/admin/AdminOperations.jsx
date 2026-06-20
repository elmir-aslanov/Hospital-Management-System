import { useState, useEffect, useCallback, useRef } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import api from '../../api/axios'

const STATUSES = ['scheduled', 'in_progress', 'completed', 'postponed', 'cancelled']
const PRIORITIES = ['elective', 'urgent', 'emergency']

const STATUS_COLOR = {
  scheduled:   { bg: '#eff6ff', color: '#2563eb', label: 'Planlanıb' },
  in_progress: { bg: '#fefce8', color: '#ca8a04', label: 'Davam edir' },
  completed:   { bg: '#f0fdf4', color: '#16a34a', label: 'Tamamlandı' },
  postponed:   { bg: '#fff7ed', color: '#ea580c', label: 'Təxirə salınıb' },
  cancelled:   { bg: '#fef2f2', color: '#dc2626', label: 'Ləğv edilib' },
}
const PRIORITY_COLOR = {
  elective:  { bg: '#f1f5f9', color: '#64748b', label: 'Planlı' },
  urgent:    { bg: '#fff7ed', color: '#ea580c', label: 'Təcili' },
  emergency: { bg: '#fef2f2', color: '#dc2626', label: 'Fövqəladə' },
}

const TRANSITIONS = {
  scheduled: ['in_progress', 'cancelled', 'postponed'],
  in_progress: ['completed'],
  postponed: ['scheduled', 'cancelled'],
  completed: [],
  cancelled: [],
}

const inp = { width: '100%', border: '1px solid #e2e8f0', borderRadius: 9, padding: '9px 12px', fontSize: 13, color: '#334155', outline: 'none', background: 'white', boxSizing: 'border-box' }
const lbl = { fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }
const card = { background: 'white', borderRadius: 14, border: '1px solid #f1f5f9' }

const emptyForm = { patientId: '', surgeonId: '', anesthesiologistId: '', procedureName: '', room: '', priority: 'elective', date: '', startTime: '09:00', estimatedDurationMinutes: 60 }

export default function AdminOperations() {
  const [ops, setOps]           = useState([])
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [filters, setFilters]   = useState({ status: '', date: '' })

  const [doctors, setDoctors]   = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm]         = useState(emptyForm)
  const [patientSearch, setPatientSearch] = useState('')
  const [patientResults, setPatientResults] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [saving, setSaving]     = useState(false)
  const [formErr, setFormErr]   = useState('')
  const searchTimer = useRef(null)

  const load = useCallback(() => {
    setLoading(true)
    setLoadError(false)
    const params = { limit: 100 }
    if (filters.status) params.status = filters.status
    if (filters.date)   params.date = filters.date
    api.get('/operations', { params })
      .then(({ data }) => {
        setOps(data?.data?.operations || [])
        setTotal(data?.data?.total || 0)
      })
      .catch(() => { setOps([]); setLoadError(true) })
      .finally(() => setLoading(false))
  }, [filters])

  useEffect(() => { load() }, [load])

  const openCreate = () => {
    setForm(emptyForm)
    setSelectedPatient(null)
    setPatientSearch('')
    setFormErr('')
    setShowModal(true)
    api.get('/doctors', { params: { limit: 200 } })
      .then(({ data }) => setDoctors(data?.data?.doctors || data?.data || []))
      .catch(() => setDoctors([]))
  }

  const handlePatientSearch = (val) => {
    setPatientSearch(val)
    setSelectedPatient(null)
    clearTimeout(searchTimer.current)
    if (!val.trim()) { setPatientResults([]); return }
    searchTimer.current = setTimeout(() => {
      api.get('/patients/search', { params: { q: val } })
        .then(({ data: d }) => {
          const list = Array.isArray(d.data) ? d.data : d.data?.patients || []
          setPatientResults(list.slice(0, 6))
        })
        .catch(() => setPatientResults([]))
    }, 350)
  }

  const selectPatient = (p) => {
    setSelectedPatient(p)
    setForm(f => ({ ...f, patientId: p._id }))
    setPatientSearch(p.userId?.fullName || p.fullName || '')
    setPatientResults([])
  }

  const doctorName = (d) => d?.userId?.fullName || d?.fullName || '—'

  const handleSave = async () => {
    if (!form.patientId || !form.surgeonId || !form.procedureName.trim() || !form.date || !form.startTime) {
      setFormErr('Bütün tələb olunan sahələri doldurun')
      return
    }
    setSaving(true)
    setFormErr('')
    try {
      await api.post('/operations', {
        ...form,
        anesthesiologistId: form.anesthesiologistId || undefined,
        estimatedDurationMinutes: Number(form.estimatedDurationMinutes),
      })
      setShowModal(false)
      load()
    } catch (e) {
      setFormErr(e.response?.data?.message || 'Xəta baş verdi')
    } finally {
      setSaving(false)
    }
  }

  const changeStatus = async (op, status) => {
    const reason = ['cancelled', 'postponed'].includes(status) ? prompt('Səbəb:') || '' : undefined
    try {
      await api.patch(`/operations/${op._id}/status`, { status, reason })
      load()
    } catch (e) {
      alert(e.response?.data?.message || 'Xəta baş verdi')
    }
  }

  return (
    <AdminLayout activePage="operations">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f1b2d' }}>Əməliyyatlar</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>{total} əməliyyat</p>
        </div>
        <button onClick={openCreate} style={{ background: '#00848e', color: 'white', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          + Əməliyyat planlaşdır
        </button>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} style={{ ...inp, width: 180 }}>
          <option value="">Bütün statuslar</option>
          {STATUSES.map(s => <option key={s} value={s}>{STATUS_COLOR[s]?.label || s}</option>)}
        </select>
        <input type="date" value={filters.date} onChange={e => setFilters(f => ({ ...f, date: e.target.value }))} style={{ ...inp, width: 160 }} />
      </div>

      <div style={{ ...card, overflow: 'auto' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#00848e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : loadError ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#dc2626', fontSize: 14 }}>Yüklənmədi</div>
        ) : ops.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8', fontSize: 14 }}>Əməliyyat tapılmadı</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                {['Pasiyent', 'Prosedur', 'Cərrah', 'Tarix/Saat', 'Otaq', 'Prioritet', 'Status', 'Əməliyyat'].map(h => (
                  <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ops.map(op => {
                const sc = STATUS_COLOR[op.status] || STATUS_COLOR.scheduled
                const pc = PRIORITY_COLOR[op.priority] || PRIORITY_COLOR.elective
                const allowed = TRANSITIONS[op.status] || []
                return (
                  <tr key={op._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 600, color: '#0f1b2d' }}>{op.patientId?.userId?.fullName || '—'}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: '#64748b' }}>{op.procedureName}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: '#64748b' }}>{op.surgeonId?.userId?.fullName || '—'}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: '#64748b' }}>{new Date(op.date).toLocaleDateString('az-AZ')} {op.startTime}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: '#64748b' }}>{op.room || '—'}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: pc.bg, color: pc.color }}>{pc.label}</span>
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: sc.bg, color: sc.color }}>{sc.label}</span>
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      {allowed.length > 0 && (
                        <select value="" onChange={e => { if (e.target.value) changeStatus(op, e.target.value) }}
                          style={{ border: '1px solid #e2e8f0', borderRadius: 7, padding: '5px 8px', fontSize: 11, color: '#475569', outline: 'none', background: 'white', cursor: 'pointer' }}>
                          <option value="">Status dəyiş...</option>
                          {allowed.map(s => <option key={s} value={s}>{STATUS_COLOR[s]?.label || s}</option>)}
                        </select>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div style={{ background: 'white', borderRadius: 16, width: 560, maxWidth: '95vw', maxHeight: '90vh', overflow: 'auto', padding: 28 }}>
            <h2 style={{ margin: '0 0 18px', fontSize: 17, fontWeight: 700, color: '#0f1b2d' }}>Yeni Əməliyyat</h2>
            {formErr && <div style={{ background: '#fef2f2', color: '#ef4444', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>{formErr}</div>}

            <div style={{ marginBottom: 12, position: 'relative' }}>
              <label style={lbl}>Pasiyent *</label>
              <input style={inp} value={patientSearch} onChange={e => handlePatientSearch(e.target.value)} placeholder="Ad, FİN və ya telefon ilə axtar" />
              {patientResults.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, marginTop: 4, zIndex: 10, maxHeight: 180, overflow: 'auto' }}>
                  {patientResults.map(p => (
                    <div key={p._id} onClick={() => selectPatient(p)} style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 13 }}>
                      {p.userId?.fullName || p.fullName || '—'}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Prosedur adı *</label>
                <input style={inp} value={form.procedureName} onChange={e => setForm(f => ({ ...f, procedureName: e.target.value }))} />
              </div>

              <div>
                <label style={lbl}>Cərrah *</label>
                <select style={inp} value={form.surgeonId} onChange={e => setForm(f => ({ ...f, surgeonId: e.target.value }))}>
                  <option value="">— Seçin —</option>
                  {doctors.map(d => <option key={d._id} value={d._id}>{doctorName(d)}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Anesteziolog</label>
                <select style={inp} value={form.anesthesiologistId} onChange={e => setForm(f => ({ ...f, anesthesiologistId: e.target.value }))}>
                  <option value="">— Seçilməyib —</option>
                  {doctors.map(d => <option key={d._id} value={d._id}>{doctorName(d)}</option>)}
                </select>
              </div>

              <div>
                <label style={lbl}>Tarix *</label>
                <input type="date" style={inp} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div>
                <label style={lbl}>Başlama saatı *</label>
                <input type="time" style={inp} value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} />
              </div>

              <div>
                <label style={lbl}>Müddət (dəq) *</label>
                <input type="number" min={5} style={inp} value={form.estimatedDurationMinutes} onChange={e => setForm(f => ({ ...f, estimatedDurationMinutes: e.target.value }))} />
              </div>
              <div>
                <label style={lbl}>Otaq</label>
                <input style={inp} value={form.room} onChange={e => setForm(f => ({ ...f, room: e.target.value }))} placeholder="OR-1" />
              </div>

              <div>
                <label style={lbl}>Prioritet</label>
                <select style={inp} value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                  {PRIORITIES.map(p => <option key={p} value={p}>{PRIORITY_COLOR[p]?.label || p}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '10px 20px', border: '1px solid #e2e8f0', borderRadius: 9, background: 'white', fontSize: 13, cursor: 'pointer', color: '#475569' }}>Ləğv et</button>
              <button onClick={handleSave} disabled={saving} style={{ padding: '10px 24px', border: 'none', borderRadius: 9, background: '#00848e', color: 'white', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saxlanır...' : 'Planlaşdır'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </AdminLayout>
  )
}
