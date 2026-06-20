import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import api from '../../api/axios'

const STATUSES = ['available', 'in_use', 'dirty', 'cleaning', 'sterilizing', 'sterile', 'maintenance', 'retired']
const METHODS = ['autoclave', 'chemical', 'dry_heat', 'ethylene_oxide']

const STATUS_COLOR = {
  available:   { bg: '#f0fdf4', color: '#16a34a', label: 'Hazır' },
  in_use:      { bg: '#eff6ff', color: '#2563eb', label: 'İstifadədə' },
  dirty:       { bg: '#fef2f2', color: '#dc2626', label: 'Çirkli' },
  cleaning:    { bg: '#fffbeb', color: '#d97706', label: 'Təmizlənir' },
  sterilizing: { bg: '#faf5ff', color: '#9333ea', label: 'Sterilizasiyada' },
  sterile:     { bg: '#ecfeff', color: '#0891b2', label: 'Sterildir' },
  maintenance: { bg: '#f1f5f9', color: '#64748b', label: 'Texniki baxış' },
  retired:     { bg: '#f8fafc', color: '#94a3b8', label: 'Sıradan çıxarılıb' },
}
const METHOD_LABEL = { autoclave: 'Avtoklav', chemical: 'Kimyəvi', dry_heat: 'Quru istilik', ethylene_oxide: 'Etilen oksid' }

const TRANSITIONS = {
  available: ['in_use', 'maintenance', 'retired'],
  in_use: ['dirty', 'maintenance'],
  dirty: ['cleaning', 'maintenance'],
  cleaning: ['dirty', 'maintenance'],
  sterilizing: [],
  sterile: ['available', 'in_use', 'maintenance'],
  maintenance: ['available', 'retired'],
  retired: [],
}

const inp = { width: '100%', border: '1px solid #e2e8f0', borderRadius: 9, padding: '9px 12px', fontSize: 13, color: '#334155', outline: 'none', background: 'white', boxSizing: 'border-box' }
const lbl = { fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }
const card = { background: 'white', borderRadius: 14, border: '1px solid #f1f5f9' }
const emptyForm = { name: '', code: '', category: 'instrument', notes: '' }

export default function AdminEquipment() {
  const [items, setItems]       = useState([])
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')

  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm]         = useState(emptyForm)
  const [saving, setSaving]     = useState(false)
  const [formErr, setFormErr]   = useState('')

  const [cycleTarget, setCycleTarget] = useState(null)
  const [method, setMethod]     = useState('autoclave')
  const [cycleErr, setCycleErr] = useState('')

  const [historyTarget, setHistoryTarget] = useState(null)
  const [cycles, setCycles]     = useState([])

  const load = useCallback(() => {
    setLoading(true)
    setLoadError(false)
    const params = { limit: 100 }
    if (filterStatus) params.status = filterStatus
    api.get('/equipment', { params })
      .then(({ data }) => {
        setItems(data?.data?.equipment || [])
        setTotal(data?.data?.total || 0)
      })
      .catch(() => { setItems([]); setLoadError(true) })
      .finally(() => setLoading(false))
  }, [filterStatus])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!form.name.trim() || !form.code.trim()) { setFormErr('Ad və kod tələb olunur'); return }
    setSaving(true)
    setFormErr('')
    try {
      await api.post('/equipment', form)
      setShowCreate(false)
      setForm(emptyForm)
      load()
    } catch (e) {
      setFormErr(e.response?.data?.message || 'Xəta baş verdi')
    } finally {
      setSaving(false)
    }
  }

  const changeStatus = async (item, status) => {
    try {
      await api.patch(`/equipment/${item._id}/status`, { status })
      load()
    } catch (e) {
      alert(e.response?.data?.message || 'Xəta baş verdi')
    }
  }

  const openStartCycle = (item) => { setCycleTarget(item); setMethod('autoclave'); setCycleErr('') }

  const startCycle = async () => {
    try {
      await api.post('/equipment/sterilization/start', { equipmentId: cycleTarget._id, method })
      setCycleTarget(null)
      load()
    } catch (e) {
      setCycleErr(e.response?.data?.message || 'Xəta baş verdi')
    }
  }

  const completeCycle = async (item, result) => {
    if (!item.currentCycleId) return
    const cycleId = typeof item.currentCycleId === 'object' ? item.currentCycleId._id : item.currentCycleId
    try {
      await api.patch(`/equipment/sterilization/${cycleId}/complete`, { result })
      load()
    } catch (e) {
      alert(e.response?.data?.message || 'Xəta baş verdi')
    }
  }

  const openHistory = (item) => {
    setHistoryTarget(item)
    api.get(`/equipment/${item._id}/cycles`)
      .then(({ data }) => setCycles(data?.data?.cycles || []))
      .catch(() => setCycles([]))
  }

  return (
    <AdminLayout activePage="equipment">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f1b2d' }}>Avadanlıq və Sterilizasiya</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>{total} avadanlıq</p>
        </div>
        <button onClick={() => setShowCreate(true)} style={{ background: '#00848e', color: 'white', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          + Avadanlıq əlavə et
        </button>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...inp, width: 200 }}>
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
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8', fontSize: 14 }}>Avadanlıq tapılmadı</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                {['Ad', 'Kod', 'Kateqoriya', 'Status', 'Son sterilizasiya', 'Etibarlıdır', 'Əməliyyat'].map(h => (
                  <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map(item => {
                const sc = STATUS_COLOR[item.status] || STATUS_COLOR.available
                const allowed = TRANSITIONS[item.status] || []
                const expired = item.sterileExpiresAt && new Date(item.sterileExpiresAt) < new Date()
                return (
                  <tr key={item._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 600, color: '#0f1b2d' }}>{item.name}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: '#64748b' }}>{item.code}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: '#64748b' }}>{item.category}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: sc.bg, color: sc.color }}>{sc.label}</span>
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: '#64748b' }}>{item.lastSterilizedAt ? new Date(item.lastSterilizedAt).toLocaleDateString('az-AZ') : '—'}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: expired ? '#dc2626' : '#64748b' }}>
                      {item.sterileExpiresAt ? new Date(item.sterileExpiresAt).toLocaleDateString('az-AZ') + (expired ? ' (bitib)' : '') : '—'}
                    </td>
                    <td style={{ padding: '11px 14px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {item.status === 'cleaning' && (
                        <button onClick={() => openStartCycle(item)} style={{ fontSize: 11, padding: '5px 10px', borderRadius: 6, border: 'none', background: '#ede9fe', color: '#7c3aed', cursor: 'pointer' }}>Sterilizasiyaya başla</button>
                      )}
                      {item.status === 'sterilizing' && (
                        <>
                          <button onClick={() => completeCycle(item, 'completed')} style={{ fontSize: 11, padding: '5px 10px', borderRadius: 6, border: 'none', background: '#dcfce7', color: '#166534', cursor: 'pointer' }}>Uğurlu</button>
                          <button onClick={() => completeCycle(item, 'failed')} style={{ fontSize: 11, padding: '5px 10px', borderRadius: 6, border: 'none', background: '#fee2e2', color: '#991b1b', cursor: 'pointer' }}>Uğursuz</button>
                        </>
                      )}
                      {allowed.length > 0 && (
                        <select value="" onChange={e => { if (e.target.value) changeStatus(item, e.target.value) }}
                          style={{ border: '1px solid #e2e8f0', borderRadius: 7, padding: '5px 8px', fontSize: 11, color: '#475569', outline: 'none', background: 'white', cursor: 'pointer' }}>
                          <option value="">Status dəyiş...</option>
                          {allowed.map(s => <option key={s} value={s}>{STATUS_COLOR[s]?.label || s}</option>)}
                        </select>
                      )}
                      <button onClick={() => openHistory(item)} style={{ fontSize: 11, padding: '5px 10px', borderRadius: 6, border: '1px solid #e2e8f0', background: 'white', color: '#475569', cursor: 'pointer' }}>Tarixçə</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => { if (e.target === e.currentTarget) setShowCreate(false) }}>
          <div style={{ background: 'white', borderRadius: 16, width: 440, maxWidth: '95vw', padding: 24 }}>
            <h2 style={{ margin: '0 0 18px', fontSize: 16, fontWeight: 700, color: '#0f1b2d' }}>Yeni Avadanlıq</h2>
            {formErr && <div style={{ background: '#fef2f2', color: '#ef4444', borderRadius: 8, padding: '9px 12px', fontSize: 12, marginBottom: 14 }}>{formErr}</div>}
            <div style={{ marginBottom: 12 }}>
              <label style={lbl}>Ad *</label>
              <input style={inp} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={lbl}>Kod *</label>
              <input style={inp} value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={lbl}>Kateqoriya</label>
              <input style={inp} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={lbl}>Qeyd</label>
              <textarea rows={2} style={{ ...inp, resize: 'vertical' }} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setShowCreate(false)} style={{ padding: '9px 18px', border: '1px solid #e2e8f0', borderRadius: 8, background: 'white', fontSize: 13, cursor: 'pointer' }}>Ləğv et</button>
              <button onClick={handleCreate} disabled={saving} style={{ padding: '9px 22px', border: 'none', borderRadius: 8, background: '#00848e', color: 'white', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saxlanır...' : 'Yarat'}
              </button>
            </div>
          </div>
        </div>
      )}

      {cycleTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => { if (e.target === e.currentTarget) setCycleTarget(null) }}>
          <div style={{ background: 'white', borderRadius: 16, width: 380, maxWidth: '95vw', padding: 24 }}>
            <h2 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 700, color: '#0f1b2d' }}>{cycleTarget.name} — Sterilizasiya</h2>
            {cycleErr && <div style={{ background: '#fef2f2', color: '#ef4444', borderRadius: 8, padding: '9px 12px', fontSize: 12, marginBottom: 14 }}>{cycleErr}</div>}
            <label style={lbl}>Metod</label>
            <select style={{ ...inp, marginBottom: 18 }} value={method} onChange={e => setMethod(e.target.value)}>
              {METHODS.map(m => <option key={m} value={m}>{METHOD_LABEL[m]}</option>)}
            </select>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setCycleTarget(null)} style={{ padding: '9px 18px', border: '1px solid #e2e8f0', borderRadius: 8, background: 'white', fontSize: 13, cursor: 'pointer' }}>Ləğv et</button>
              <button onClick={startCycle} style={{ padding: '9px 22px', border: 'none', borderRadius: 8, background: '#00848e', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Başla</button>
            </div>
          </div>
        </div>
      )}

      {historyTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => { if (e.target === e.currentTarget) setHistoryTarget(null) }}>
          <div style={{ background: 'white', borderRadius: 16, width: 520, maxWidth: '95vw', maxHeight: '80vh', overflow: 'auto', padding: 24 }}>
            <h2 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 700, color: '#0f1b2d' }}>{historyTarget.name} — Sterilizasiya tarixçəsi</h2>
            {cycles.length === 0 ? (
              <div style={{ color: '#94a3b8', fontSize: 13 }}>Tarixçə yoxdur</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {cycles.map(c => (
                  <div key={c._id} style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 12px', fontSize: 12 }}>
                    <div style={{ fontWeight: 700, color: '#0f1b2d' }}>{c.batchNumber} · {METHOD_LABEL[c.method]}</div>
                    <div style={{ color: '#64748b', marginTop: 2 }}>
                      {c.status === 'completed' ? 'Uğurlu' : c.status === 'failed' ? 'Uğursuz' : 'Davam edir'} · {new Date(c.startedAt).toLocaleString('az-AZ')}
                      {c.performedBy?.fullName ? ` · ${c.performedBy.fullName}` : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
              <button onClick={() => setHistoryTarget(null)} style={{ padding: '9px 18px', border: '1px solid #e2e8f0', borderRadius: 8, background: 'white', fontSize: 13, cursor: 'pointer' }}>Bağla</button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </AdminLayout>
  )
}
