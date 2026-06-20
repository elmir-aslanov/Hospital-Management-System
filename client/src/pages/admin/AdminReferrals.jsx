import { useState, useEffect, useCallback, useRef } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import api from '../../api/axios'

const STATUSES = ['pending', 'accepted', 'declined', 'completed', 'cancelled']
const URGENCIES = ['routine', 'urgent', 'emergency']

const STATUS_COLOR = {
  pending:   { bg: '#fff7ed', color: '#ea580c', label: 'Gözləyir' },
  accepted:  { bg: '#eff6ff', color: '#2563eb', label: 'Qəbul edilib' },
  declined:  { bg: '#fef2f2', color: '#dc2626', label: 'Rədd edilib' },
  completed: { bg: '#f0fdf4', color: '#16a34a', label: 'Tamamlandı' },
  cancelled: { bg: '#f1f5f9', color: '#64748b', label: 'Ləğv edilib' },
}
const URGENCY_COLOR = {
  routine:   { bg: '#f1f5f9', color: '#64748b', label: 'Adi' },
  urgent:    { bg: '#fff7ed', color: '#ea580c', label: 'Təcili' },
  emergency: { bg: '#fef2f2', color: '#dc2626', label: 'Fövqəladə' },
}
const TRANSITIONS = { pending: ['accepted', 'declined', 'cancelled'], accepted: ['completed', 'cancelled'], declined: [], completed: [], cancelled: [] }

const inp = { width: '100%', border: '1px solid #e2e8f0', borderRadius: 9, padding: '9px 12px', fontSize: 13, color: '#334155', outline: 'none', background: 'white', boxSizing: 'border-box' }
const lbl = { fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }
const card = { background: 'white', borderRadius: 14, border: '1px solid #f1f5f9' }
const emptyForm = { patientId: '', referringDoctorId: '', referredToDoctorId: '', referredToDepartmentId: '', reason: '', clinicalNotes: '', urgency: 'routine' }

export default function AdminReferrals() {
  const [referrals, setReferrals] = useState([])
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [filters, setFilters]   = useState({ status: '' })

  const [doctors, setDoctors]   = useState([])
  const [departments, setDepartments] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm]         = useState(emptyForm)
  const [patientSearch, setPatientSearch] = useState('')
  const [patientResults, setPatientResults] = useState([])
  const [saving, setSaving]     = useState(false)
  const [formErr, setFormErr]   = useState('')
  const searchTimer = useRef(null)

  const load = useCallback(() => {
    setLoading(true)
    setLoadError(false)
    const params = { limit: 100 }
    if (filters.status) params.status = filters.status
    api.get('/referrals', { params })
      .then(({ data }) => {
        setReferrals(data?.data?.referrals || [])
        setTotal(data?.data?.total || 0)
      })
      .catch(() => { setReferrals([]); setLoadError(true) })
      .finally(() => setLoading(false))
  }, [filters])

  useEffect(() => { load() }, [load])

  const openCreate = () => {
    setForm(emptyForm)
    setPatientSearch('')
    setFormErr('')
    setShowModal(true)
    api.get('/doctors', { params: { limit: 200 } }).then(({ data }) => setDoctors(data?.data?.doctors || data?.data || [])).catch(() => setDoctors([]))
    api.get('/departments').then(({ data }) => {
      const d = data?.data
      setDepartments(Array.isArray(d) ? d : d?.departments || [])
    }).catch(() => setDepartments([]))
  }

  const handlePatientSearch = (val) => {
    setPatientSearch(val)
    setForm(f => ({ ...f, patientId: '' }))
    clearTimeout(searchTimer.current)
    if (!val.trim()) { setPatientResults([]); return }
    searchTimer.current = setTimeout(() => {
      api.get('/patients/search', { params: { q: val } })
        .then(({ data: d }) => setPatientResults((Array.isArray(d.data) ? d.data : d.data?.patients || []).slice(0, 6)))
        .catch(() => setPatientResults([]))
    }, 350)
  }

  const selectPatient = (p) => {
    setForm(f => ({ ...f, patientId: p._id }))
    setPatientSearch(p.userId?.fullName || p.fullName || '')
    setPatientResults([])
  }

  const doctorName = (d) => d?.userId?.fullName || d?.fullName || '—'

  const handleSave = async () => {
    if (!form.patientId || !form.referringDoctorId || !form.reason.trim()) { setFormErr('Pasiyent, yönləndirən həkim və səbəb tələb olunur'); return }
    if (!form.referredToDoctorId && !form.referredToDepartmentId) { setFormErr('Həkim və ya şöbə seçin'); return }
    setSaving(true)
    setFormErr('')
    try {
      await api.post('/referrals', {
        ...form,
        referredToDoctorId: form.referredToDoctorId || undefined,
        referredToDepartmentId: form.referredToDepartmentId || undefined,
      })
      setShowModal(false)
      load()
    } catch (e) {
      setFormErr(e.response?.data?.message || 'Xəta baş verdi')
    } finally {
      setSaving(false)
    }
  }

  const changeStatus = async (r, status) => {
    let declineReason, consultationNotes
    if (status === 'declined') declineReason = prompt('Rədd səbəbi:') || ''
    if (status === 'completed') consultationNotes = prompt('Konsultasiya qeydi:') || ''
    try {
      await api.patch(`/referrals/${r._id}/status`, { status, declineReason, consultationNotes })
      load()
    } catch (e) {
      alert(e.response?.data?.message || 'Xəta baş verdi')
    }
  }

  return (
    <AdminLayout activePage="referrals">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f1b2d' }}>Yönləndirmələr</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>{total} yönləndirmə</p>
        </div>
        <button onClick={openCreate} style={{ background: '#00848e', color: 'white', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          + Yönləndirmə yarat
        </button>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} style={{ ...inp, width: 180 }}>
          <option value="">Bütün statuslar</option>
          {STATUSES.map(s => <option key={s} value={s}>{STATUS_COLOR[s]?.label || s}</option>)}
        </select>
      </div>

      <div style={{ ...card, overflow: 'auto' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#00848e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : loadError ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#dc2626', fontSize: 14 }}>Yüklənmədi</div>
        ) : referrals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8', fontSize: 14 }}>Yönləndirmə tapılmadı</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                {['Pasiyent', 'Yönləndirən', 'Yönləndirilib', 'Səbəb', 'Təcililik', 'Status', 'Əməliyyat'].map(h => (
                  <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {referrals.map(r => {
                const sc = STATUS_COLOR[r.status] || STATUS_COLOR.pending
                const uc = URGENCY_COLOR[r.urgency] || URGENCY_COLOR.routine
                const allowed = TRANSITIONS[r.status] || []
                return (
                  <tr key={r._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 600, color: '#0f1b2d' }}>{r.patientId?.userId?.fullName || '—'}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: '#64748b' }}>{r.referringDoctorId?.userId?.fullName || '—'}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: '#64748b' }}>{r.referredToDoctorId?.userId?.fullName || r.referredToDepartmentId?.name || '—'}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: '#64748b', maxWidth: 200 }}>{r.reason}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: uc.bg, color: uc.color }}>{uc.label}</span>
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: sc.bg, color: sc.color }}>{sc.label}</span>
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      {allowed.length > 0 && (
                        <select value="" onChange={e => { if (e.target.value) changeStatus(r, e.target.value) }}
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
          <div style={{ background: 'white', borderRadius: 16, width: 540, maxWidth: '95vw', maxHeight: '90vh', overflow: 'auto', padding: 28 }}>
            <h2 style={{ margin: '0 0 18px', fontSize: 17, fontWeight: 700, color: '#0f1b2d' }}>Yeni Yönləndirmə</h2>
            {formErr && <div style={{ background: '#fef2f2', color: '#ef4444', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>{formErr}</div>}

            <div style={{ marginBottom: 12, position: 'relative' }}>
              <label style={lbl}>Pasiyent *</label>
              <input style={inp} value={patientSearch} onChange={e => handlePatientSearch(e.target.value)} placeholder="Ad, FİN və ya telefon ilə axtar" />
              {patientResults.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, marginTop: 4, zIndex: 10, maxHeight: 180, overflow: 'auto' }}>
                  {patientResults.map(p => (
                    <div key={p._id} onClick={() => selectPatient(p)} style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 13 }}>{p.userId?.fullName || p.fullName || '—'}</div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={lbl}>Yönləndirən həkim *</label>
                <select style={inp} value={form.referringDoctorId} onChange={e => setForm(f => ({ ...f, referringDoctorId: e.target.value }))}>
                  <option value="">— Seçin —</option>
                  {doctors.map(d => <option key={d._id} value={d._id}>{doctorName(d)}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Təcililik</label>
                <select style={inp} value={form.urgency} onChange={e => setForm(f => ({ ...f, urgency: e.target.value }))}>
                  {URGENCIES.map(u => <option key={u} value={u}>{URGENCY_COLOR[u]?.label || u}</option>)}
                </select>
              </div>

              <div>
                <label style={lbl}>Yönləndirilən həkim</label>
                <select style={inp} value={form.referredToDoctorId} onChange={e => setForm(f => ({ ...f, referredToDoctorId: e.target.value, referredToDepartmentId: e.target.value ? '' : f.referredToDepartmentId }))}>
                  <option value="">— Seçilməyib —</option>
                  {doctors.map(d => <option key={d._id} value={d._id}>{doctorName(d)}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Və ya şöbə</label>
                <select style={inp} value={form.referredToDepartmentId} onChange={e => setForm(f => ({ ...f, referredToDepartmentId: e.target.value, referredToDoctorId: e.target.value ? '' : f.referredToDoctorId }))}>
                  <option value="">— Seçilməyib —</option>
                  {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>

              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Səbəb *</label>
                <textarea rows={2} style={{ ...inp, resize: 'vertical' }} value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Klinik qeydlər</label>
                <textarea rows={2} style={{ ...inp, resize: 'vertical' }} value={form.clinicalNotes} onChange={e => setForm(f => ({ ...f, clinicalNotes: e.target.value }))} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '10px 20px', border: '1px solid #e2e8f0', borderRadius: 9, background: 'white', fontSize: 13, cursor: 'pointer', color: '#475569' }}>Ləğv et</button>
              <button onClick={handleSave} disabled={saving} style={{ padding: '10px 24px', border: 'none', borderRadius: 9, background: '#00848e', color: 'white', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saxlanır...' : 'Yarat'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </AdminLayout>
  )
}
