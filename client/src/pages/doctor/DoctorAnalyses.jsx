import { useState, useEffect } from 'react'
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
  pending:   { bg: '#fef9c3', color: '#854d0e' },
  completed: { bg: '#dcfce7', color: '#166534' },
  reviewed:  { bg: '#dbeafe', color: '#1e40af' },
  normal:    { bg: '#dcfce7', color: '#166534' },
  abnormal:  { bg: '#fee2e2', color: '#991b1b' },
}

const STATUS_LABELS = {
  pending:   'Gözləyir',
  completed: 'Tamamlandı',
  reviewed:  'Baxıldı',
  normal:    'Normal',
  abnormal:  'Anormal',
}

export default function DoctorAnalyses() {
  const doctorUser = getDoctorUser()
  const doctorId   = doctorUser._id || doctorUser.id || ''

  const [analyses,  setAnalyses]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selected,  setSelected]  = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: 100 })
      if (doctorId) params.set('doctorId', doctorId)
      const r = await fetch(`${BASE}/api/v1/vitals?${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      const data = await r.json()
      let list = []
      if (Array.isArray(data)) list = data
      else if (Array.isArray(data.data)) list = data.data
      else if (Array.isArray(data.data?.vitals)) list = data.data.vitals
      else if (Array.isArray(data.vitals)) list = data.vitals
      else if (Array.isArray(data.docs)) list = data.docs
      setAnalyses(list)
    } catch {
      setAnalyses([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const types = ['all', ...Array.from(new Set((analyses || []).map(a => a.type || a.testType || '').filter(Boolean)))]

  const filtered = (analyses || []).filter(a => {
    const name = a.patientId?.userId?.fullName || a.patientId?.name || a.patientId?.fullName || a.patientName || ''
    const type = a.type || a.testType || ''
    const q    = search.toLowerCase()
    const matchSearch = name.toLowerCase().includes(q) || type.toLowerCase().includes(q)
    const matchType   = typeFilter === 'all' || type === typeFilter
    return matchSearch && matchType
  })

  return (
    <DoctorLayout activePage="analyses">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#0f1b2d' }}>Analizlər</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>{filtered.length} analiz tapıldı</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Pasiyent və ya analiz axtar..."
            style={{ padding: '8px 14px', borderRadius: 9, border: '1px solid #e2e8f0', fontSize: 13, width: 220, outline: 'none' }}
          />
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 9, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', background: 'white' }}
          >
            {types.map(t => (
              <option key={t} value={t}>{t === 'all' ? 'Bütün növlər' : t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              {['Pasiyent', 'Analiz növü', 'Dəyər', 'Normal aralıq', 'Tarix', 'Status', ''].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>Yüklənir...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 48, textAlign: 'center' }}>
                <div style={{ color: '#94a3b8', fontSize: 14 }}>
                  {search || typeFilter !== 'all' ? 'Nəticə tapılmadı' : 'Hələ analiz məlumatı yoxdur'}
                </div>
                {!search && typeFilter === 'all' && (
                  <div style={{ color: '#cbd5e1', fontSize: 12, marginTop: 6 }}>
                    Laboratoriya analiz nəticələri burada görünəcək
                  </div>
                )}
              </td></tr>
            ) : filtered.map(a => {
              const patName = a.patientId?.userId?.fullName || a.patientId?.name || a.patientId?.fullName || a.patientName || '—'
              const patId   = a.patientId?.patientId || a.patientId?.pid || ''
              const type    = a.type || a.testType || '—'
              const value   = a.value !== undefined ? `${a.value} ${a.unit || ''}`.trim() : (a.result || '—')
              const normal  = a.normalRange || a.referenceRange || '—'
              const status  = a.status || (a.isAbnormal ? 'abnormal' : 'normal')
              const sc      = STATUS_COLORS[status] || STATUS_COLORS.normal
              const label   = STATUS_LABELS[status] || status
              return (
                <tr key={a._id} style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  onClick={() => setSelected(a)}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#0f1b2d' }}>{patName}</div>
                    {patId && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{patId}</div>}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#334155', fontWeight: 500 }}>{type}</td>
                  <td style={{ padding: '12px 16px', color: '#0f1b2d', fontWeight: 600 }}>{value}</td>
                  <td style={{ padding: '12px 16px', color: '#64748b', fontSize: 12 }}>{normal}</td>
                  <td style={{ padding: '12px 16px', color: '#64748b' }}>{formatDate(a.createdAt || a.recordedAt)}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ background: sc.bg, color: sc.color, borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>{label}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button onClick={e => { e.stopPropagation(); setSelected(a) }} style={{
                      background: '#f1f5f9', border: 'none', borderRadius: 7, padding: '5px 12px',
                      fontSize: 12, cursor: 'pointer', color: '#475569', fontWeight: 500
                    }}>Ətraflı</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setSelected(null)}>
          <div style={{ background: 'white', borderRadius: 16, width: 440, maxHeight: '85vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f1b2d' }}>Analiz Məlumatı</h3>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8' }}>×</button>
            </div>
            <div style={{ padding: 22 }}>
              {[
                ['Pasiyent', selected.patientId?.userId?.fullName || selected.patientId?.name || selected.patientId?.fullName || selected.patientName || '—'],
                ['Analiz növü', selected.type || selected.testType || '—'],
                ['Nəticə', selected.value !== undefined ? `${selected.value} ${selected.unit || ''}`.trim() : (selected.result || '—')],
                ['Normal aralıq', selected.normalRange || selected.referenceRange || '—'],
                ['Tarix', formatDate(selected.createdAt || selected.recordedAt)],
                ['Status', STATUS_LABELS[selected.status] || selected.status || '—'],
                ['Laborant', selected.technicianId?.fullName || selected.labTechName || '—'],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f8fafc' }}>
                  <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{label}</span>
                  <span style={{ fontSize: 13, color: '#0f1b2d', fontWeight: 600, textAlign: 'right', maxWidth: 220 }}>{String(value)}</span>
                </div>
              ))}
              {selected.notes && (
                <div style={{ marginTop: 14, padding: 12, background: '#f8fafc', borderRadius: 9, fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                  <div style={{ fontWeight: 600, color: '#374151', marginBottom: 4 }}>Qeyd:</div>
                  {selected.notes}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DoctorLayout>
  )
}
