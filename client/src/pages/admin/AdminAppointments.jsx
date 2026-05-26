import { useState, useEffect, useRef } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'

const BASE = 'http://localhost:5000'

const STATUS_COLORS = {
  pending:   { bg: '#fef9c3', color: '#ca8a04', label: 'Gözləyir' },
  confirmed: { bg: '#dcfce7', color: '#16a34a', label: 'Təsdiqləndi' },
  completed: { bg: '#e0f2fe', color: '#0369a1', label: 'Tamamlandı' },
  cancelled: { bg: '#fef2f2', color: '#dc2626', label: 'Ləğv edildi' },
}

export default function AdminAppointments() {
  const [appts, setAppts]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [statusFilter, setStatus] = useState('all')
  const [dateFilter, setDate]     = useState('')
  const [modal, setModal]         = useState(false)
  const [form, setForm]           = useState({ patientName: '', doctorName: '', date: '', time: '', notes: '' })
  const [saving, setSaving]       = useState(false)
  const [patchId, setPatchId]     = useState(null)

  const token = localStorage.getItem('adminToken')
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

  const handleStatusPatch = async (id, status) => {
    setPatchId(id)
    try {
      await fetch(`${BASE}/api/v1/appointments/${id}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status }),
      })
      setAppts(prev => prev.map(a => a._id === id ? { ...a, status } : a))
    } catch {}
    finally { setPatchId(null) }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch(`${BASE}/api/v1/appointments`, {
        method: 'POST',
        headers,
        body: JSON.stringify(form),
      })
      setModal(false)
      setForm({ patientName: '', doctorName: '', date: '', time: '', notes: '' })
      load()
    } catch {}
    finally { setSaving(false) }
  }

  const filtered = appts.filter(a => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false
    if (dateFilter) {
      const d = a.date ? new Date(a.date).toISOString().slice(0, 10) : a.appointmentDate?.slice(0, 10)
      if (d !== dateFilter) return false
    }
    return true
  })

  const getName = (a) => {
    const p = a.patientId
    if (!p) return '—'
    return p.userId?.fullName || p.fullName || '—'
  }

  const getDoctor = (a) => {
    const d = a.doctorId
    if (!d) return '—'
    return d.userId?.fullName || d.name || '—'
  }

  const getDate = (a) => {
    const raw = a.date || a.appointmentDate || a.createdAt
    if (!raw) return '—'
    return new Date(raw).toLocaleDateString('az-AZ')
  }

  const getTime = (a) => a.time || a.timeSlot || '—'

  return (
    <AdminLayout activePage="appointments">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f1b2d' }}>Randevular</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>{filtered.length} randevu göstərilir</p>
        </div>
        <button onClick={() => setModal(true)} style={{ background: '#00848e', color: 'white', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
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
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0f1b2d' }}>{getName(a)}</div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#475569' }}>{getDoctor(a)}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#475569' }}>{getDate(a)}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#475569' }}>{getTime(a)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: sc.bg, color: sc.color }}>{sc.label}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <select disabled={patching} value={a.status || 'pending'} onChange={e => handleStatusPatch(a._id, e.target.value)} style={{ border: '1px solid #e2e8f0', borderRadius: 7, padding: '5px 8px', fontSize: 12, color: '#334155', outline: 'none', background: 'white', cursor: patching ? 'not-allowed' : 'pointer', opacity: patching ? 0.5 : 1 }}>
                        <option value="pending">Gözləyir</option>
                        <option value="confirmed">Təsdiqləndi</option>
                        <option value="completed">Tamamlandı</option>
                        <option value="cancelled">Ləğv edildi</option>
                      </select>
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={e => { if (e.target === e.currentTarget) setModal(false) }}>
          <div style={{ background: 'white', borderRadius: 16, width: 460, maxWidth: '95vw', padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f1b2d' }}>Yeni randevu</h2>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 20 }}>×</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <MField label="Pasiyent adı" value={form.patientName} onChange={v => setForm(f => ({ ...f, patientName: v }))} />
              <MField label="Həkim adı" value={form.doctorName} onChange={v => setForm(f => ({ ...f, doctorName: v }))} />
              <MField label="Tarix" value={form.date} onChange={v => setForm(f => ({ ...f, date: v }))} type="date" />
              <MField label="Saat" value={form.time} onChange={v => setForm(f => ({ ...f, time: v }))} type="time" />
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>Qeyd</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 9, padding: '9px 12px', fontSize: 13, color: '#334155', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
              <button onClick={() => setModal(false)} style={{ padding: '10px 20px', border: '1px solid #e2e8f0', borderRadius: 9, background: 'white', fontSize: 13, cursor: 'pointer', color: '#475569' }}>Ləğv et</button>
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

function MField({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 9, padding: '9px 12px', fontSize: 13, color: '#334155', outline: 'none', boxSizing: 'border-box' }} />
    </div>
  )
}
