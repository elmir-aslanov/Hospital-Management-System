import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import api from '../../api/axios'

const ROLES = ['DOCTOR', 'NURSE', 'RECEPTIONIST', 'LAB_TECHNICIAN', 'STAFF']
const SHIFT_TYPES = ['morning', 'afternoon', 'night']
const STATUSES = ['scheduled', 'active', 'completed', 'off', 'vacation', 'sick_leave', 'cancelled']

const STATUS_COLOR = {
  scheduled:  { bg: '#eff6ff', color: '#2563eb', label: 'Planlanıb' },
  active:     { bg: '#f0fdf4', color: '#16a34a', label: 'Aktiv' },
  completed:  { bg: '#f0fdf4', color: '#16a34a', label: 'Tamamlandı' },
  off:        { bg: '#f1f5f9', color: '#64748b', label: 'İstirahət günü' },
  vacation:   { bg: '#fefce8', color: '#ca8a04', label: 'Məzuniyyət' },
  sick_leave: { bg: '#fff7ed', color: '#ea580c', label: 'Xəstəlik' },
  cancelled:  { bg: '#fef2f2', color: '#dc2626', label: 'Ləğv edilib' },
}
const SHIFT_TYPE_LABEL = { morning: 'Səhər', afternoon: 'Gündüz', night: 'Gecə' }

const inp = { width: '100%', border: '1px solid #e2e8f0', borderRadius: 9, padding: '9px 12px', fontSize: 13, color: '#334155', outline: 'none', background: 'white', boxSizing: 'border-box' }
const lbl = { fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }
const card = { background: 'white', borderRadius: 14, border: '1px solid #f1f5f9' }

const emptyForm = { userId: '', departmentId: '', shiftType: 'morning', date: '', startTime: '09:00', endTime: '17:00', breakStartTime: '', breakEndTime: '', notes: '' }

export default function AdminShifts() {
  const [shifts, setShifts]     = useState([])
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [departments, setDepartments] = useState([])
  const [staff, setStaff]       = useState([])

  const [filters, setFilters]   = useState({ role: '', departmentId: '', date: '', status: '' })

  const [showModal, setShowModal] = useState(false)
  const [form, setForm]         = useState(emptyForm)
  const [saving, setSaving]     = useState(false)
  const [formErr, setFormErr]   = useState('')

  const load = useCallback(() => {
    setLoading(true)
    setLoadError(false)
    const params = { limit: 100 }
    if (filters.role)         params.role = filters.role
    if (filters.departmentId) params.departmentId = filters.departmentId
    if (filters.date)         params.date = filters.date
    if (filters.status)       params.status = filters.status
    api.get('/shifts', { params })
      .then(({ data }) => {
        setShifts(data?.data?.shifts || [])
        setTotal(data?.data?.total || 0)
      })
      .catch(() => { setShifts([]); setLoadError(true) })
      .finally(() => setLoading(false))
  }, [filters])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    api.get('/departments').then(({ data }) => {
      const d = data?.data
      setDepartments(Array.isArray(d) ? d : (d?.departments || []))
    }).catch(() => setDepartments([]))
  }, [])

  const openCreate = () => {
    setForm(emptyForm)
    setFormErr('')
    setShowModal(true)
    api.get('/users', { params: { limit: 200 } })
      .then(({ data }) => setStaff(data?.data?.users || []))
      .catch(() => setStaff([]))
  }

  const closeModal = () => { setShowModal(false); setFormErr('') }

  const handleSave = async () => {
    if (!form.userId) { setFormErr('İşçi seçin'); return }
    if (!form.date) { setFormErr('Tarix seçin'); return }
    if (!form.startTime || !form.endTime) { setFormErr('Başlama və bitmə vaxtı tələb olunur'); return }
    if (form.startTime >= form.endTime) { setFormErr('Bitmə vaxtı başlama vaxtından sonra olmalıdır'); return }
    setSaving(true)
    setFormErr('')
    try {
      await api.post('/shifts', {
        userId: form.userId,
        departmentId: form.departmentId || undefined,
        shiftType: form.shiftType,
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        breakStartTime: form.breakStartTime || undefined,
        breakEndTime: form.breakEndTime || undefined,
        notes: form.notes || undefined,
      })
      setShowModal(false)
      load()
    } catch (e) {
      setFormErr(e.response?.data?.message || 'Xəta baş verdi')
    } finally {
      setSaving(false)
    }
  }

  const changeStatus = async (id, status) => {
    try {
      await api.patch(`/shifts/${id}/status`, { status })
      load()
    } catch (e) {
      alert(e.response?.data?.message || 'Xəta baş verdi')
    }
  }

  const staffName = (u) => u?.fullName || [u?.name, u?.surname].filter(Boolean).join(' ') || '—'

  return (
    <AdminLayout activePage="shifts">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f1b2d' }}>İş Cədvəli</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>{total} növbə</p>
        </div>
        <button onClick={openCreate} style={{ background: '#00848e', color: 'white', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Növbə əlavə et
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <select value={filters.role} onChange={e => setFilters(f => ({ ...f, role: e.target.value }))} style={{ ...inp, width: 160 }}>
          <option value="">Bütün rollar</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={filters.departmentId} onChange={e => setFilters(f => ({ ...f, departmentId: e.target.value }))} style={{ ...inp, width: 180 }}>
          <option value="">Bütün şöbələr</option>
          {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
        </select>
        <input type="date" value={filters.date} onChange={e => setFilters(f => ({ ...f, date: e.target.value }))} style={{ ...inp, width: 160 }} />
        <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} style={{ ...inp, width: 160 }}>
          <option value="">Bütün statuslar</option>
          {STATUSES.map(s => <option key={s} value={s}>{STATUS_COLOR[s]?.label || s}</option>)}
        </select>
        {(filters.role || filters.departmentId || filters.date || filters.status) && (
          <button onClick={() => setFilters({ role: '', departmentId: '', date: '', status: '' })}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 13 }}>Təmizlə</button>
        )}
      </div>

      <div style={{ ...card, overflow: 'auto' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#00848e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : loadError ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#dc2626', fontSize: 14 }}>Növbələr yüklənmədi</div>
        ) : shifts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8', fontSize: 14 }}>Növbə tapılmadı</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                {['İşçi', 'Rol', 'Şöbə', 'Tarix', 'Növbə', 'Saat', 'Status', 'Əməliyyat'].map(h => (
                  <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shifts.map(s => {
                const sc = STATUS_COLOR[s.status] || STATUS_COLOR.scheduled
                const cancellable = !['cancelled', 'completed'].includes(s.status)
                return (
                  <tr key={s._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 600, color: '#0f1b2d' }}>{staffName(s.userId)}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: '#64748b' }}>{s.userId?.role || '—'}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: '#64748b' }}>{s.departmentId?.name || '—'}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: '#64748b' }}>{new Date(s.date).toLocaleDateString('az-AZ')}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: '#64748b' }}>{SHIFT_TYPE_LABEL[s.shiftType] || s.shiftType}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: '#64748b' }}>{s.startTime}–{s.endTime}{s.breakStartTime ? ` (fasilə ${s.breakStartTime}-${s.breakEndTime})` : ''}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: sc.bg, color: sc.color }}>{sc.label}</span>
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      {cancellable && (
                        <select
                          value=""
                          onChange={e => { if (e.target.value) changeStatus(s._id, e.target.value) }}
                          style={{ border: '1px solid #e2e8f0', borderRadius: 7, padding: '5px 8px', fontSize: 11, color: '#475569', outline: 'none', background: 'white', cursor: 'pointer' }}
                        >
                          <option value="">Status dəyiş...</option>
                          {STATUSES.filter(st => st !== s.status).map(st => (
                            <option key={st} value={st}>{STATUS_COLOR[st]?.label || st}</option>
                          ))}
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
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}>
          <div style={{ background: 'white', borderRadius: 16, width: 520, maxWidth: '95vw', maxHeight: '90vh', overflow: 'auto', padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f1b2d' }}>Yeni Növbə</h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 22 }}>×</button>
            </div>

            {formErr && (
              <div style={{ background: '#fef2f2', color: '#ef4444', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>{formErr}</div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>İşçi *</label>
                <select value={form.userId} onChange={e => setForm(f => ({ ...f, userId: e.target.value }))} style={inp}>
                  <option value="">— İşçi seçin —</option>
                  {staff.map(u => <option key={u._id} value={u._id}>{staffName(u)} ({u.role})</option>)}
                </select>
              </div>

              <div>
                <label style={lbl}>Şöbə</label>
                <select value={form.departmentId} onChange={e => setForm(f => ({ ...f, departmentId: e.target.value }))} style={inp}>
                  <option value="">— Şöbə seçilməyib —</option>
                  {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>

              <div>
                <label style={lbl}>Növbə tipi</label>
                <select value={form.shiftType} onChange={e => setForm(f => ({ ...f, shiftType: e.target.value }))} style={inp}>
                  {SHIFT_TYPES.map(s => <option key={s} value={s}>{SHIFT_TYPE_LABEL[s]}</option>)}
                </select>
              </div>

              <div>
                <label style={lbl}>Tarix *</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={inp} />
              </div>
              <div />

              <div>
                <label style={lbl}>Başlama saatı *</label>
                <input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} style={inp} />
              </div>
              <div>
                <label style={lbl}>Bitmə saatı *</label>
                <input type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} style={inp} />
              </div>

              <div>
                <label style={lbl}>Fasilə başlanğıcı</label>
                <input type="time" value={form.breakStartTime} onChange={e => setForm(f => ({ ...f, breakStartTime: e.target.value }))} style={inp} />
              </div>
              <div>
                <label style={lbl}>Fasilə sonu</label>
                <input type="time" value={form.breakEndTime} onChange={e => setForm(f => ({ ...f, breakEndTime: e.target.value }))} style={inp} />
              </div>

              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Qeyd</label>
                <textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ ...inp, resize: 'vertical' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
              <button onClick={closeModal} style={{ padding: '10px 20px', border: '1px solid #e2e8f0', borderRadius: 9, background: 'white', fontSize: 13, cursor: 'pointer', color: '#475569' }}>Ləğv et</button>
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
