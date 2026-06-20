import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import api from '../../api/axios'

const STATUS_COLOR = {
  pending:             { bg: '#fff7ed', color: '#ea580c', label: 'Gözləyir' },
  partially_dispensed: { bg: '#eff6ff', color: '#2563eb', label: 'Qismən verilib' },
  dispensed:           { bg: '#f0fdf4', color: '#16a34a', label: 'Verilib' },
}

const card = { background: 'white', borderRadius: 14, border: '1px solid #f1f5f9' }
const inp = { width: '100%', border: '1px solid #e2e8f0', borderRadius: 9, padding: '9px 12px', fontSize: 13, color: '#334155', outline: 'none', background: 'white', boxSizing: 'border-box' }

export default function AdminDispensing() {
  const [queue, setQueue]       = useState([])
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(true)
  const [loadError, setLoadError] = useState(false)

  const [detail, setDetail]     = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [medicines, setMedicines] = useState([])
  const [picks, setPicks]       = useState({})
  const [saving, setSaving]     = useState(false)
  const [saveErr, setSaveErr]   = useState('')

  const load = useCallback(() => {
    setLoading(true)
    setLoadError(false)
    api.get('/inventory/dispense/queue', { params: { limit: 100 } })
      .then(({ data }) => {
        setQueue(data?.data?.prescriptions || [])
        setTotal(data?.data?.total || 0)
      })
      .catch(() => { setQueue([]); setLoadError(true) })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const patientName = (p) => p?.patientId?.userId?.fullName || '—'
  const doctorName = (p) => p?.prescribedBy?.userId?.fullName || '—'

  const openDetail = (prescriptionId) => {
    setDetailLoading(true)
    setSaveErr('')
    setPicks({})
    api.get(`/inventory/dispense/${prescriptionId}`)
      .then(({ data }) => setDetail(data?.data || null))
      .catch(() => setDetail(null))
      .finally(() => setDetailLoading(false))
    api.get('/inventory/medicines', { params: { limit: 200, isActive: true } })
      .then(({ data }) => setMedicines(data?.data?.items || []))
      .catch(() => setMedicines([]))
  }

  const closeDetail = () => { setDetail(null); setPicks({}) }

  const setPick = (medName, field, value) => {
    setPicks(p => ({ ...p, [medName]: { ...p[medName], [field]: value } }))
  }

  const handleDispense = async () => {
    const items = Object.values(picks)
      .filter(p => p?.medicineId && Number(p.quantity) > 0)
      .map(p => ({ medicineId: p.medicineId, quantity: Number(p.quantity) }))
    if (!items.length) { setSaveErr('Ən azı bir dərman və say seçin'); return }
    setSaving(true)
    setSaveErr('')
    try {
      await api.post('/inventory/dispense', { prescriptionId: detail._id, items })
      closeDetail()
      load()
    } catch (e) {
      setSaveErr(e.response?.data?.message || 'Xəta baş verdi')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout activePage="dispensing">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f1b2d' }}>Dərman Verilişi</h1>
        <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>{total} reçetə gözləyir</p>
      </div>

      <div style={{ ...card, overflow: 'auto' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#00848e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : loadError ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#dc2626', fontSize: 14 }}>Yüklənmədi</div>
        ) : queue.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8', fontSize: 14 }}>Gözləyən reçetə yoxdur</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                {['Pasiyent', 'Həkim', 'Tarix', 'Status', 'Əməliyyat'].map(h => (
                  <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {queue.map(p => {
                const sc = STATUS_COLOR[p.dispensingStatus] || STATUS_COLOR.pending
                return (
                  <tr key={p._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 600, color: '#0f1b2d' }}>{patientName(p)}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: '#64748b' }}>{doctorName(p)}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: '#64748b' }}>{new Date(p.createdAt).toLocaleDateString('az-AZ')}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: sc.bg, color: sc.color }}>{sc.label}</span>
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <button onClick={() => openDetail(p._id)} style={{ fontSize: 12, padding: '6px 14px', borderRadius: 7, border: 'none', background: '#00848e', color: 'white', cursor: 'pointer', fontWeight: 600 }}>Ver</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {detail && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => { if (e.target === e.currentTarget) closeDetail() }}>
          <div style={{ background: 'white', borderRadius: 16, width: 560, maxWidth: '95vw', maxHeight: '90vh', overflow: 'auto', padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f1b2d' }}>{patientName(detail)}</h2>
              <button onClick={closeDetail} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 22 }}>×</button>
            </div>

            {detailLoading ? (
              <div style={{ textAlign: 'center', padding: 30, color: '#94a3b8' }}>Yüklənir...</div>
            ) : (
              <>
                {saveErr && <div style={{ background: '#fef2f2', color: '#ef4444', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 14 }}>{saveErr}</div>}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {(detail.medications || []).map((m, idx) => {
                    const remaining = m.remainingQuantity
                    const fullyDone = remaining === 0
                    return (
                      <div key={idx} style={{ border: '1px solid #f1f5f9', borderRadius: 10, padding: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontWeight: 700, fontSize: 13, color: '#0f1b2d' }}>{m.name}</span>
                          <span style={{ fontSize: 11, color: '#94a3b8' }}>
                            {m.quantity ? `Reçetə: ${m.quantity} · Verilib: ${m.dispensedQuantity} · Qalıq: ${remaining}` : 'Say göstərilməyib'}
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>{m.dosage} · {m.frequency} · {m.duration}</div>
                        {!fullyDone && (
                          <div style={{ display: 'flex', gap: 8 }}>
                            <select style={{ ...inp, flex: 2 }} value={picks[m.name]?.medicineId || ''}
                              onChange={e => setPick(m.name, 'medicineId', e.target.value)}>
                              <option value="">— Anbar maddəsi seçin —</option>
                              {medicines.map(med => <option key={med._id} value={med._id}>{med.name} (stok: {med.stock})</option>)}
                            </select>
                            <input type="number" min={1} max={remaining || undefined} style={{ ...inp, flex: 1 }}
                              placeholder="Say" value={picks[m.name]?.quantity || ''}
                              onChange={e => setPick(m.name, 'quantity', e.target.value)} />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
                  <button onClick={closeDetail} style={{ padding: '10px 20px', border: '1px solid #e2e8f0', borderRadius: 9, background: 'white', fontSize: 13, cursor: 'pointer', color: '#475569' }}>Bağla</button>
                  <button onClick={handleDispense} disabled={saving} style={{ padding: '10px 24px', border: 'none', borderRadius: 9, background: '#00848e', color: 'white', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                    {saving ? 'Saxlanır...' : 'Ver'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </AdminLayout>
  )
}
