import { useState, useEffect } from 'react'
import { useNavigate }         from 'react-router-dom'
import api from '../../api/axios'
import { clearAuthStorage } from '../../utils/authSession'

const BASE  = 'http://localhost:5000'
const token = () => localStorage.getItem('token')
const hdrs  = () => ({ Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' })
const TEAL  = '#00848e'
const NAVY  = '#0a1628'
const FONT  = "'Source Sans 3', sans-serif"

const STATUS_CONFIG = {
  pending:          { label: 'Gözləyir',    color: '#f59e0b', bg: '#fefce8' },
  in_progress:      { label: 'İcrada',      color: '#2563eb', bg: '#eff6ff' },
  processing:       { label: 'İcrada',      color: '#2563eb', bg: '#eff6ff' },
  sample_collected: { label: 'Nümunə alındı', color: '#2563eb', bg: '#eff6ff' },
  completed:        { label: 'Tamamlandı',  color: '#16a34a', bg: '#f0fdf4' },
  cancelled:        { label: 'Ləğv edildi', color: '#ef4444', bg: '#fef2f2' },
}

const RESULT_STATUS = {
  normal:   'Normal',
  low:      'Aşağı',
  high:     'Yüksək',
  critical: 'Kritik',
}

const emptyResult = () => ({ results: [], notes: '' })
const emptyResultItem = () => ({ testName: '', value: '', unit: '', status: 'normal' })
const inProgressStatuses = ['in_progress', 'processing', 'sample_collected']

const inputStyle = {
  width: '100%',
  border: '1px solid #e2e8f0',
  borderRadius: 9,
  padding: '9px 11px',
  fontSize: 13,
  color: '#334155',
  outline: 'none',
  boxSizing: 'border-box',
  background: 'white',
  fontFamily: FONT,
}

const getPatientName = (order) =>
  order.patientId?.userId?.fullName || order.patientId?.fullName || order.patient?.fullName || order.patientName || '—'

const getDoctorName = (order) =>
  order.doctorId?.userId?.fullName || order.doctorId?.fullName || order.doctor?.fullName || order.doctorName || '—'

const getTestType = (order) => {
  if (order.testType) return order.testType
  if (!Array.isArray(order.tests) || order.tests.length === 0) return '—'
  if (order.tests.length === 1) return order.tests[0].testName || '—'
  return `${order.tests[0].testName || 'Test'} +${order.tests.length - 1}`
}

const computeStats = (list) => ({
  pending:    list.filter(o => o.status === 'pending').length,
  inProgress: list.filter(o => inProgressStatuses.includes(o.status)).length,
  completed:  list.filter(o => o.status === 'completed').length,
})

const buildResultFromOrder = (order) => ({
  results: Array.isArray(order.tests) && order.tests.length > 0
    ? order.tests.map(t => ({
      testName: t.testName || '',
      value: '',
      unit: '',
      status: 'normal',
    }))
    : [emptyResultItem()],
  notes: '',
})

export default function LabTechDashboard() {
  const navigate = useNavigate()

  const [orders,   setOrders]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [stats,    setStats]    = useState({ pending: 0, inProgress: 0, completed: 0 })
  const [selected, setSelected] = useState(null)
  const [result,   setResult]   = useState(emptyResult())
  const [saving,   setSaving]   = useState(false)
  const [user]                  = useState(() => JSON.parse(localStorage.getItem('user') || '{}'))

  useEffect(() => {
    fetch(`${BASE}/api/v1/lab/orders?limit=50`, { headers: hdrs() })
      .then(r => r.json())
      .then(d => {
        const list = d.data?.orders || (Array.isArray(d.data) ? d.data : [])
        setOrders(list)
        setStats(computeStats(list))
      })
      .catch(() => {
        setOrders([])
        setStats({ pending: 0, inProgress: 0, completed: 0 })
      })
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = async () => {
    try { await api.post('/auth/logout') } catch {
      // Local session should still be cleared if server logout cannot complete.
    }
    clearAuthStorage()
    navigate('/login')
  }

  const openResultPanel = (order) => {
    setSelected(order)
    setResult(buildResultFromOrder(order))
  }

  const viewResult = (order) => {
    setSelected(order)
    setResult(buildResultFromOrder(order))

    fetch(`${BASE}/api/v1/lab/results/order/${order._id}`, { headers: hdrs() })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d?.data) return
        setResult({
          results: d.data.results?.length ? d.data.results.map(item => ({
            testName: item.testName || '',
            value: item.value || '',
            unit: item.unit || '',
            status: item.status || 'normal',
          })) : buildResultFromOrder(order).results,
          notes: d.data.summary || d.data.notes || '',
        })
      })
      .catch(() => {})
  }

  const addResultRow = () => {
    setResult(prev => ({ ...prev, results: [...prev.results, emptyResultItem()] }))
  }

  const updateResultRow = (index, key, value) => {
    setResult(prev => ({
      ...prev,
      results: prev.results.map((item, i) => i === index ? { ...item, [key]: value } : item),
    }))
  }

  const removeResultRow = (index) => {
    setResult(prev => ({ ...prev, results: prev.results.filter((_, i) => i !== index) }))
  }

  const saveResult = async () => {
    if (!selected) return
    if (result.results.length === 0 || result.results.some(item => !item.testName.trim() || !item.value.trim())) {
      alert('Test adı və dəyər sahələri boş ola bilməz')
      return
    }

    setSaving(true)
    try {
      const payload = { results: result.results, notes: result.notes }
      let response = await fetch(`${BASE}/api/v1/lab/orders/${selected._id}/results`, {
        method: 'POST',
        headers: hdrs(),
        body: JSON.stringify(payload),
      })

      if (response.status === 404) {
        response = await fetch(`${BASE}/api/v1/lab/results`, {
          method: 'POST',
          headers: hdrs(),
          body: JSON.stringify({
            labOrderId: selected._id,
            results: result.results,
            summary: result.notes,
            notes: result.notes,
          }),
        })
      }

      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message || 'Nəticə saxlanılmadı')

      const nextOrders = orders.map(o => o._id === selected._id ? { ...o, status: 'completed' } : o)
      setOrders(nextOrders)
      setStats(computeStats(nextOrders))
      setSelected(null)
      setResult(emptyResult())
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ fontFamily: FONT, minHeight: '100vh' }}>

      {/* Header bar */}
      <div style={{ background: NAVY, color: 'white', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22 }}>🧪</span>
          <div>
            <span style={{ fontWeight: 800, fontSize: 15 }}>Aslan Medical</span>
            <span style={{ marginLeft: 10, fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>Laboratoriya Paneli</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>{user.fullName || 'Lab Texniki'}</span>
          <button
            onClick={handleLogout}
            style={{ padding: '6px 16px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: FONT }}
          >
            Çıxış
          </button>
        </div>
      </div>

      <div style={{ background: '#f8fafc', minHeight: 'calc(100vh - 60px)', padding: 24 }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Gözləyən',   value: stats.pending,    color: '#f59e0b' },
            { label: 'İcrada',     value: stats.inProgress, color: '#2563eb' },
            { label: 'Tamamlanan', value: stats.completed,  color: '#16a34a' },
          ].map(card => (
            <div key={card.label} style={{ background: 'white', borderRadius: 12, padding: '18px 20px', border: '1px solid #f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: card.color }}>{card.value}</div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{card.label}</div>
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="lab-tech-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 3fr) minmax(360px, 2fr)', gap: 20, alignItems: 'start' }}>

          {/* Left table */}
          <div style={{ background: 'white', borderRadius: 14, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
            <div style={{ padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f8fafc' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: NAVY }}>Lab sifarişləri</h3>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#94a3b8' }}>{orders.length} sifariş</p>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: 44, color: '#94a3b8' }}>Yüklənir...</div>
              ) : orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 44, color: '#94a3b8' }}>Lab sifarişi yoxdur</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 820 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                      {['Sifariş №', 'Pasiyent', 'Həkim', 'Test növü', 'Status', 'Əməliyyatlar'].map(h => (
                        <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => {
                      const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
                      const canEnter = ['pending', ...inProgressStatuses].includes(order.status)

                      return (
                        <tr key={order._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                          <td style={{ padding: '13px 14px', fontSize: 13, fontWeight: 700, color: NAVY }}>{order.orderNumber || '—'}</td>
                          <td style={{ padding: '13px 14px', fontSize: 13, color: '#334155' }}>{getPatientName(order)}</td>
                          <td style={{ padding: '13px 14px', fontSize: 13, color: '#64748b' }}>{getDoctorName(order)}</td>
                          <td style={{ padding: '13px 14px', fontSize: 13, color: '#334155', fontWeight: 600 }}>{getTestType(order)}</td>
                          <td style={{ padding: '13px 14px' }}>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: status.bg, color: status.color }}>
                              {status.label}
                            </span>
                          </td>
                          <td style={{ padding: '13px 14px' }}>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                              {canEnter && (
                                <button
                                  onClick={() => openResultPanel(order)}
                                  style={{ border: `1px solid ${TEAL}`, background: 'white', color: TEAL, borderRadius: 8, padding: '6px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}
                                >
                                  Nəticə daxil et
                                </button>
                              )}
                              <button
                                onClick={() => viewResult(order)}
                                style={{ border: '1px solid #e2e8f0', background: 'white', color: '#475569', borderRadius: 8, padding: '6px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}
                              >
                                Bax
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Right result panel */}
          <div style={{ background: 'white', borderRadius: 14, border: '1px solid #f1f5f9', padding: 20, minHeight: 430 }}>
            {!selected ? (
              <div style={{ minHeight: 390, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#94a3b8', fontSize: 13, lineHeight: 1.6 }}>
                Nəticə daxil etmək və ya baxmaq üçün sifariş seçin.
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 18 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: NAVY }}>Nəticə Daxil Et</h3>
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>{selected.orderNumber || '—'}</p>
                  </div>
                  <button
                    onClick={() => { setSelected(null); setResult(emptyResult()) }}
                    style={{ border: 'none', background: '#f8fafc', color: '#64748b', width: 30, height: 30, borderRadius: 8, cursor: 'pointer', fontSize: 18 }}
                  >
                    ×
                  </button>
                </div>

                <div style={{ background: '#f8fafc', borderRadius: 12, padding: 14, marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{getPatientName(selected)}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{getTestType(selected)}</div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Test nəticələri</span>
                  <button
                    onClick={addResultRow}
                    style={{ border: '1px dashed #cbd5e1', background: 'white', color: TEAL, borderRadius: 8, padding: '6px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}
                  >
                    + Test əlavə et
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {result.results.map((item, index) => (
                    <div key={index} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 0.75fr 1fr 28px', gap: 8, alignItems: 'center' }}>
                      <input
                        value={item.testName}
                        onChange={e => updateResultRow(index, 'testName', e.target.value)}
                        placeholder="Test adı"
                        style={inputStyle}
                      />
                      <input
                        value={item.value}
                        onChange={e => updateResultRow(index, 'value', e.target.value)}
                        placeholder="Dəyər"
                        style={inputStyle}
                      />
                      <input
                        value={item.unit}
                        onChange={e => updateResultRow(index, 'unit', e.target.value)}
                        placeholder="Vahid"
                        style={inputStyle}
                      />
                      <select
                        value={item.status}
                        onChange={e => updateResultRow(index, 'status', e.target.value)}
                        style={inputStyle}
                      >
                        {Object.entries(RESULT_STATUS).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                      {result.results.length > 1 && (
                        <button
                          onClick={() => removeResultRow(index)}
                          style={{ width: 28, height: 28, border: 'none', borderRadius: 8, background: '#fef2f2', color: '#ef4444', cursor: 'pointer', fontSize: 16 }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>Qeydlər</label>
                  <textarea
                    rows={4}
                    value={result.notes}
                    onChange={e => setResult(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Əlavə qeydlər..."
                    style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
                  />
                </div>

                <button
                  onClick={saveResult}
                  disabled={saving}
                  style={{ marginTop: 16, width: '100%', border: 'none', background: saving ? '#7ec8cc' : TEAL, color: 'white', borderRadius: 10, padding: '12px 16px', fontSize: 14, fontWeight: 800, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: FONT }}
                >
                  {saving ? 'Saxlanır...' : 'Nəticəni saxla'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1120px) {
          .lab-tech-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 768px) {
          div[style*="grid-template-columns: repeat(3,1fr)"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="grid-template-columns: 1.4fr 1fr 0.75fr 1fr 28px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
