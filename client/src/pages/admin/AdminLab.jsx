import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import AdminLayout from '../../components/admin/AdminLayout'
import api from '../../api/axios'

import { BASE } from '../../api/config.js'

const MANUAL_STATUS_CFG = {
  draft:     { label: 'statusDraft',     bg: '#f1f5f9', color: '#64748b' },
  completed: { label: 'statusCompleted', bg: '#eff6ff', color: '#2563eb' },
  approved:  { label: 'statusApproved',  bg: '#f0fdf4', color: '#16a34a' },
  cancelled: { label: 'statusCancelled', bg: '#fef2f2', color: '#ef4444' },
}

const APPROVER_ROLES = ['SUPER_ADMIN', 'ADMIN', 'BAS_HEKIM']

function ManualResultsTab() {
  const { t } = useTranslation()
  const [results, setResults]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selected, setSelected] = useState(null)
  const [currentUser] = useState(() => { try { return JSON.parse(localStorage.getItem('adminUser') || localStorage.getItem('user') || '{}') } catch { return {} } })
  const canApprove = APPROVER_ROLES.includes(currentUser.role)

  const fetchResults = async () => {
    setLoading(true)
    try {
      const params = { limit: 100 }
      if (search) params.search = search
      if (filterStatus !== 'all') params.status = filterStatus
      const res = await api.get('/lab/results/manual', { params })
      setResults(res.data?.data?.results || [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(fetchResults, 300)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filterStatus])

  const approve = async (id) => {
    const makePublic = window.confirm('Bu nəticə pasiyentə (E-Nəticə səhifəsində) açıq olsun?')
    try {
      await api.patch(`/lab/results/manual/${id}/approve`, { isPublicVisible: makePublic })
      fetchResults()
    } catch (err) {
      alert(err.response?.data?.message || 'Xəta baş verdi')
    }
  }

  const cancelResult = async (id) => {
    if (!window.confirm('Bu nəticəni ləğv etmək istəyirsiniz?')) return
    try {
      await api.patch(`/lab/results/manual/${id}/cancel`)
      fetchResults()
    } catch (err) {
      alert(err.response?.data?.message || 'Xəta baş verdi')
    }
  }

  const downloadPdf = async (id) => {
    try {
      const res = await api.get(`/lab-results/${id}/pdf`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url
      a.download = 'lab-result.pdf'
      a.click()
      window.URL.revokeObjectURL(url)
    } catch {
      alert('PDF yüklənmədi')
    }
  }

  const inp = { width: '100%', border: '1px solid #e2e8f0', borderRadius: 9, padding: '9px 12px', fontSize: 13, color: '#334155', outline: 'none', boxSizing: 'border-box', background: 'white' }

  return (
    <div style={{ display: 'flex', gap: 18 }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('labResult.search')} style={{ ...inp, flex: 1 }} />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...inp, width: 170 }}>
            <option value="all">{t('labResult.allStatuses')}</option>
            {Object.entries(MANUAL_STATUS_CFG).map(([k, cfg]) => <option key={k} value={k}>{t(`labResult.${cfg.label}`)}</option>)}
          </select>
        </div>

        <div style={{ background: 'white', borderRadius: 14, border: '1px solid #f1f5f9', overflow: 'auto' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#00848e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : results.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8', fontSize: 14 }}>{t('labResult.noResults')}</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  {[t('labResult.protocolNo'), t('labResult.patient'), t('labResult.testName'), t('labResult.resultDate'), t('labResult.status'), 'Public', ''].map(h => (
                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map(r => {
                  const sc = MANUAL_STATUS_CFG[r.status] || MANUAL_STATUS_CFG.draft
                  const isSel = selected === r._id
                  return (
                    <tr key={r._id} onClick={() => setSelected(r._id)}
                      style={{ borderBottom: '1px solid #f8fafc', cursor: 'pointer', background: isSel ? '#f0fafb' : 'white' }}>
                      <td style={{ padding: '11px 14px', fontSize: 12, fontWeight: 700, color: '#00848e' }}>{r.protocolNo}</td>
                      <td style={{ padding: '11px 14px', fontSize: 13, color: '#334155' }}>{r.patientFullName}</td>
                      <td style={{ padding: '11px 14px', fontSize: 12, color: '#64748b' }}>{r.testName}</td>
                      <td style={{ padding: '11px 14px', fontSize: 12, color: '#64748b' }}>{r.resultDate ? new Date(r.resultDate).toLocaleDateString('az-AZ') : '—'}</td>
                      <td style={{ padding: '11px 14px' }}>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: sc.bg, color: sc.color }}>{t(`labResult.${sc.label}`)}</span>
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: 12, color: r.isPublicVisible ? '#16a34a' : '#94a3b8', fontWeight: 600 }}>{r.isPublicVisible ? '✓' : '—'}</td>
                      <td style={{ padding: '11px 14px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                          {r.status === 'completed' && canApprove && (
                            <button onClick={() => approve(r._id)}
                              style={{ padding: '4px 9px', border: '1px solid #16a34a', borderRadius: 7, background: 'white', color: '#16a34a', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                              {t('labResult.approveAndPublish')}
                            </button>
                          )}
                          {['draft', 'completed'].includes(r.status) && (
                            <button onClick={() => cancelResult(r._id)}
                              style={{ padding: '4px 9px', border: '1px solid #fee2e2', borderRadius: 7, background: 'white', color: '#ef4444', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                              {t('labResult.cancel')}
                            </button>
                          )}
                          <button onClick={() => downloadPdf(r._id)}
                            style={{ padding: '4px 9px', border: '1px solid #e2e8f0', borderRadius: 7, background: 'white', color: '#475569', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                            {t('labResult.downloadPdf')}
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

      {/* Detail panel */}
      <div style={{ width: selected ? 320 : 0, transition: 'width 0.25s', overflow: 'hidden', flexShrink: 0 }}>
        {selected && (() => {
          const r = results.find(x => x._id === selected)
          if (!r) return null
          const sc = MANUAL_STATUS_CFG[r.status] || MANUAL_STATUS_CFG.draft
          return (
            <div style={{ width: 320, background: 'white', borderRadius: 14, border: '1px solid #f1f5f9', height: '100%', overflow: 'auto', padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#0f1b2d' }}>{t('labResult.details')}</span>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 20 }}>×</button>
              </div>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f1b2d' }}>{r.patientFullName}</p>
              <p style={{ margin: '4px 0 12px', fontSize: 12, color: '#64748b' }}>{r.protocolNo}</p>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: sc.bg, color: sc.color }}>{t(`labResult.${sc.label}`)}</span>

              <div style={{ marginTop: 14, fontSize: 13, color: '#334155' }}>
                <p style={{ margin: '0 0 6px' }}><strong>{t('labResult.testName')}:</strong> {r.testName || '—'}</p>
                <p style={{ margin: '0 0 6px' }}><strong>{t('labResult.departmentName')}:</strong> {r.departmentName || '—'}</p>
                <p style={{ margin: '0 0 6px' }}><strong>{t('labResult.doctorName')}:</strong> {r.doctorName || '—'}</p>
              </div>

              {(r.results || []).length > 0 && (
                <div style={{ marginTop: 14, background: '#f8fafc', borderRadius: 10, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      {r.results.map((item, i) => (
                        <tr key={i} style={{ borderTop: i ? '1px solid #f1f5f9' : 'none' }}>
                          <td style={{ padding: '7px 10px', fontSize: 12, color: '#334155' }}>{item.testName}</td>
                          <td style={{ padding: '7px 10px', fontSize: 12, fontWeight: 600 }}>{item.value} {item.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {r.generalConclusion && (
                <p style={{ fontSize: 12, color: '#334155', marginTop: 10, padding: '8px 12px', background: '#f0fdf4', borderRadius: 8 }}>{r.generalConclusion}</p>
              )}

              {r.internalNote && (
                <div style={{ marginTop: 10 }}>
                  <p style={{ margin: '0 0 4px', fontSize: 10.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>{t('labResult.internalNote')}</p>
                  <p style={{ fontSize: 12, color: '#92400e', margin: 0, padding: '8px 12px', background: '#fffbeb', borderRadius: 8 }}>{r.internalNote}</p>
                </div>
              )}
            </div>
          )
        })()}
      </div>
    </div>
  )
}

const STATUS_CFG = {
  pending:          { label: 'Gözləyir',      bg: '#f8fafc', color: '#64748b' },
  sample_collected: { label: 'Nümunə alındı', bg: '#eff6ff', color: '#2563eb' },
  processing:       { label: 'İşlənir',       bg: '#fefce8', color: '#ca8a04' },
  completed:        { label: 'Tamamlandı',    bg: '#f0fdf4', color: '#16a34a' },
  cancelled:        { label: 'Ləğv',          bg: '#fef2f2', color: '#dc2626' },
}

const PRIORITY_CFG = {
  routine: { label: 'Adi',    color: '#64748b' },
  urgent:  { label: 'Təcili', color: '#ea580c' },
  stat:    { label: 'STAT',   color: '#dc2626' },
}

const CATEGORY_LABELS = {
  hematology:'Hematologiya', biochemistry:'Biokimya', microbiology:'Mikrobiologiya',
  imaging:'Görüntüləmə', urine:'Sidik', other:'Digər',
}

const RESULT_STATUS = { normal:'Normal', low:'Aşağı', high:'Yüksək', critical:'Kritik' }
const RESULT_COLORS = { normal:'#16a34a', low:'#2563eb', high:'#ea580c', critical:'#dc2626' }

const NEXT_STATUS = {
  pending:          ['sample_collected','cancelled'],
  sample_collected: ['processing','cancelled'],
  processing:       ['completed','cancelled'],
}

const emptyTest   = () => ({ testName:'', testCode:'', category:'other', urgency:'routine', notes:'' })
const emptyOrder  = { patientId:'', doctorId:'', priority:'routine', notes:'', tests:[emptyTest()] }
const emptyResult = { results:[], summary:'' }

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('az-AZ') : '—'
const patFull = (p) => p?.userId?.fullName || p?.fullName || '—'
const docFull = (d) => d?.userId?.fullName || d?.name || '—'

const inp = { width:'100%', border:'1px solid #e2e8f0', borderRadius:9, padding:'9px 12px', fontSize:13, color:'#334155', outline:'none', boxSizing:'border-box', background:'white' }
const lbl = { fontSize:12, fontWeight:600, color:'#475569', display:'block', marginBottom:6 }

export default function AdminLab() {
  const token   = localStorage.getItem('adminToken') || localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  const [activeMainTab, setActiveMainTab] = useState('orders')
  const [orders,       setOrders]       = useState([])
  const [summary,      setSummary]      = useState({ byStatus:[], todayOrders:0 })
  const [patients,     setPatients]     = useState([])
  const [doctors,      setDoctors]      = useState([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  /* order modal */
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [orderForm,      setOrderForm]      = useState(emptyOrder)
  const [orderSaving,    setOrderSaving]    = useState(false)
  const [orderErr,       setOrderErr]       = useState('')

  /* result modal */
  const [showResultModal, setShowResultModal] = useState(false)
  const [resultOrderId,   setResultOrderId]   = useState(null)
  const [resultOrder,     setResultOrder]     = useState(null)
  const [resultId,        setResultId]        = useState(null)
  const [resultForm,      setResultForm]      = useState(emptyResult)
  const [resultSaving,    setResultSaving]    = useState(false)
  const [resultErr,       setResultErr]       = useState('')
  const [pdfFile,         setPdfFile]         = useState(null)

  /* inline status update */
  const [statusEditId, setStatusEditId] = useState(null)

  /* detail panel */
  const [selected,   setSelected]   = useState(null)
  const [detail,     setDetail]     = useState(null)
  const [detailResult, setDetailResult] = useState(null)
  const [detailLoad, setDetailLoad] = useState(false)

  /* ── load ───────────────────────────────────────────────────────── */
  useEffect(() => {
    Promise.all([
      fetch(`${BASE}/api/v1/lab/summary`,              { headers }).then(r => r.json()),
      fetch(`${BASE}/api/v1/lab/orders?limit=50`,      { headers }).then(r => r.json()),
      fetch(`${BASE}/api/v1/patients?page=1&limit=200`,{ headers }).then(r => r.json()),
      fetch(`${BASE}/api/v1/doctors?limit=100`,        { headers }).then(r => r.json()),
    ]).then(([s, ord, pat, doc]) => {
      setSummary(s.data || { byStatus:[], todayOrders:0 })
      setOrders(ord.data?.orders || [])
      setPatients(pat.data?.patients || [])
      setDoctors(doc.data?.doctors || [])
    }).finally(() => setLoading(false))
  }, [])

  /* ── summary helpers ─────────────────────────────────────────────── */
  const byStatusCount = (key) => summary.byStatus?.find(b => b._id === key)?.count || 0

  /* ── filtered orders ─────────────────────────────────────────────── */
  const filtered = orders.filter(o => {
    const matchSearch = !search ||
      (o.orderNumber || '').toLowerCase().includes(search.toLowerCase()) ||
      patFull(o.patientId).toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || o.status === filterStatus
    return matchSearch && matchStatus
  })

  /* ── detail open ─────────────────────────────────────────────────── */
  const openDetail = (order) => {
    setSelected(order._id); setDetail(order); setDetailResult(null); setDetailLoad(true)
    fetch(`${BASE}/api/v1/lab/orders/${order._id}`, { headers })
      .then(r => r.json()).then(d => setDetail(d.data || order)).catch(() => {})
      .finally(() => setDetailLoad(false))
  }

  const loadDetailResult = () => {
    if (!selected) return
    fetch(`${BASE}/api/v1/lab/results/order/${selected}`, { headers })
      .then(r => r.json()).then(d => { if (d.data) setDetailResult(d.data) }).catch(() => {})
  }

  /* ── status update ───────────────────────────────────────────────── */
  const handleStatusChange = async (orderId, newStatus) => {
    setStatusEditId(null)
    const r = await fetch(`${BASE}/api/v1/lab/orders/${orderId}/status`, {
      method: 'PATCH', headers: { ...headers, 'Content-Type':'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    if (r.ok) setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o))
  }

  /* ── delete order ────────────────────────────────────────────────── */
  const handleDelete = async (orderId) => {
    if (!window.confirm('Bu lab sifarişini silmək istəyirsiniz?')) return
    const r = await fetch(`${BASE}/api/v1/lab/orders/${orderId}`, { method:'DELETE', headers })
    if (r.ok) {
      setOrders(prev => prev.filter(o => o._id !== orderId))
      if (selected === orderId) { setSelected(null); setDetail(null) }
    }
  }

  /* ── order modal ─────────────────────────────────────────────────── */
  const setOF = (k, v) => setOrderForm(f => ({ ...f, [k]: v }))
  const updateTest = (i, k, v) => setOrderForm(f => ({ ...f, tests: f.tests.map((t,idx) => idx===i ? {...t,[k]:v} : t) }))

  const saveOrder = async () => {
    if (!orderForm.patientId) { setOrderErr('Pasiyent seçin'); return }
    if (!orderForm.doctorId)  { setOrderErr('Həkim seçin'); return }
    if (orderForm.tests.some(t => !t.testName.trim())) { setOrderErr('Test adı boş ola bilməz'); return }
    setOrderSaving(true); setOrderErr('')
    try {
      const r    = await fetch(`${BASE}/api/v1/lab/orders`, {
        method:'POST', headers:{ ...headers,'Content-Type':'application/json' },
        body: JSON.stringify(orderForm),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.message || 'Xəta baş verdi')
      setOrders(prev => [data.data, ...prev])
      setShowOrderModal(false); setOrderForm(emptyOrder)
    } catch(e) { setOrderErr(e.message) }
    finally { setOrderSaving(false) }
  }

  /* ── result modal ────────────────────────────────────────────────── */
  const openResultModal = (order) => {
    setResultOrderId(order._id); setResultOrder(order); setResultId(null); setPdfFile(null)
    setResultErr('')
    if (order.status === 'completed') {
      fetch(`${BASE}/api/v1/lab/results/order/${order._id}`, { headers })
        .then(r => r.json())
        .then(d => {
          if (d.data) {
            setResultId(d.data._id)
            setResultForm({
              results: (d.data.results||[]).map(r => ({ testName:r.testName, testCode:r.testCode||'', value:r.value||'', unit:r.unit||'', referenceRange:r.referenceRange||'', status:r.status||'normal', notes:r.notes||'' })),
              summary: d.data.summary || '',
            })
          }
        }).catch(() => {})
    } else {
      setResultForm({
        results: order.tests.map(t => ({ testName: t.testName, testCode: t.testCode||'', value:'', unit:'', referenceRange:'', status:'normal', notes:'' })),
        summary: '',
      })
    }
    setShowResultModal(true)
  }

  const updateResultRow = (i, k, v) => setResultForm(f => ({ ...f, results: f.results.map((r,idx) => idx===i ? {...r,[k]:v} : r) }))

  const saveResult = async () => {
    if (resultForm.results.some(r => !r.value.trim())) { setResultErr('Bütün testlər üçün dəyər daxil edin'); return }
    setResultSaving(true); setResultErr('')
    try {
      let savedResultId = resultId
      if (resultId) {
        const r    = await fetch(`${BASE}/api/v1/lab/results/${resultId}`, {
          method:'PATCH', headers:{ ...headers,'Content-Type':'application/json' },
          body: JSON.stringify(resultForm),
        })
        const data = await r.json()
        if (!r.ok) throw new Error(data.message || 'Xəta baş verdi')
      } else {
        const r    = await fetch(`${BASE}/api/v1/lab/results`, {
          method:'POST', headers:{ ...headers,'Content-Type':'application/json' },
          body: JSON.stringify({ labOrderId: resultOrderId, ...resultForm }),
        })
        const data = await r.json()
        if (!r.ok) throw new Error(data.message || 'Xəta baş verdi')
        savedResultId = data.data._id
      }

      if (pdfFile) {
        const fd = new FormData()
        fd.append('document', pdfFile)
        const r2 = await fetch(`${BASE}/api/v1/lab/results/${savedResultId}/attachment`, { method:'POST', headers, body: fd })
        const d2 = await r2.json()
        if (!r2.ok) throw new Error(d2.message || 'PDF yüklənmədi')
      }

      setOrders(prev => prev.map(o => o._id === resultOrderId ? { ...o, status:'completed' } : o))
      if (selected === resultOrderId) {
        setDetail(d => ({ ...d, status:'completed' }))
        loadDetailResult()
      }
      setShowResultModal(false)
    } catch(e) { setResultErr(e.message) }
    finally { setResultSaving(false) }
  }

  /* ════════════════════════════════════════════════════════════════ */
  return (
    <AdminLayout activePage="lab">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
        <div>
          <h1 style={{ margin:0, fontSize:22, fontWeight:700, color:'#0f1b2d' }}>Laboratoriya</h1>
          <p style={{ margin:'4px 0 0', color:'#64748b', fontSize:13 }}>{orders.length} sifariş</p>
        </div>
        {activeMainTab === 'orders' && (
          <button onClick={() => { setOrderForm(emptyOrder); setOrderErr(''); setShowOrderModal(true) }}
            style={{ background:'#00848e', color:'white', border:'none', borderRadius:10, padding:'10px 20px', fontSize:13, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Yeni Sifariş
          </button>
        )}
      </div>

      {/* ── Tabs ───────────────────────────────────────────────── */}
      <div style={{ display:'flex', gap:6, marginBottom:20 }}>
        {[['orders', 'Sifarişlər'], ['results', 'Nəticələr']].map(([k, label]) => (
          <button key={k} onClick={() => setActiveMainTab(k)}
            style={{ padding:'8px 16px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', border:'1px solid',
              background:   activeMainTab === k ? '#00848e' : 'white',
              color:        activeMainTab === k ? 'white'   : '#475569',
              borderColor:  activeMainTab === k ? '#00848e' : '#e2e8f0',
            }}>
            {label}
          </button>
        ))}
      </div>

      {activeMainTab === 'results' ? (
        <ManualResultsTab />
      ) : (
        <>
      {/* ── Summary cards ───────────────────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
        {[
          { label:'Bu gün',     value: summary.todayOrders,       color:'#00848e', bg:'#f0fdfa' },
          { label:'Gözləyir',   value: byStatusCount('pending'),   color:'#64748b', bg:'#f8fafc' },
          { label:'İşlənir',    value: byStatusCount('processing'), color:'#ca8a04', bg:'#fefce8' },
          { label:'Tamamlandı', value: byStatusCount('completed'),  color:'#16a34a', bg:'#f0fdf4' },
        ].map(c => (
          <div key={c.label} style={{ background:c.bg, border:`1px solid ${c.color}20`, borderRadius:14, padding:'16px 20px' }}>
            <p style={{ margin:0, fontSize:12, color:'#64748b', fontWeight:500 }}>{c.label}</p>
            <p style={{ margin:'6px 0 0', fontSize:26, fontWeight:700, color:c.color }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* ── Main 2-panel ────────────────────────────────────────── */}
      <div style={{ display:'flex', gap:18, height:'calc(100vh - 300px)' }}>

        {/* Left — table */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>

          {/* search + filter */}
          <div style={{ display:'flex', gap:10, marginBottom:14 }}>
            <div style={{ position:'relative', flex:1 }}>
              <div style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)' }}>
                <svg width="14" height="14" fill="none" stroke="#94a3b8" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </div>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Sifariş №, pasiyent axtar..."
                style={{ ...inp, paddingLeft:36 }} />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              style={{ ...inp, width:160 }}>
              <option value="all">Bütün statuslar</option>
              {Object.entries(STATUS_CFG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>

          <div style={{ flex:1, background:'white', borderRadius:14, border:'1px solid #f1f5f9', overflow:'auto' }}>
            {loading ? (
              <div style={{ display:'flex', justifyContent:'center', padding:60 }}>
                <div style={{ width:32, height:32, border:'3px solid #e2e8f0', borderTopColor:'#00848e', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign:'center', padding:60, color:'#94a3b8', fontSize:14 }}>Sifariş tapılmadı</div>
            ) : (
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ borderBottom:'1px solid #f1f5f9' }}>
                    {['Sifariş №','Protokol №','Pasiyent','Həkim','Testlər','Prioritet','Status',''].map(h => (
                      <th key={h} style={{ padding:'12px 14px', textAlign:'left', fontSize:11, fontWeight:600, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.05em', whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(o => {
                    const sc = STATUS_CFG[o.status]   || STATUS_CFG.pending
                    const pc = PRIORITY_CFG[o.priority] || PRIORITY_CFG.routine
                    const isSel = selected === o._id
                    const nexts = NEXT_STATUS[o.status] || []
                    return (
                      <tr key={o._id} onClick={() => openDetail(o)}
                        style={{ borderBottom:'1px solid #f8fafc', cursor:'pointer', background: isSel ? '#f0fafb' : 'white', transition:'background 0.1s' }}
                        onMouseEnter={e => { if (!isSel) e.currentTarget.style.background='#f8fafc' }}
                        onMouseLeave={e => { if (!isSel) e.currentTarget.style.background='white' }}>
                        <td style={{ padding:'11px 14px', fontSize:12, fontWeight:700, color:'#0f1b2d' }}>{o.orderNumber||'—'}</td>
                        <td style={{ padding:'11px 14px', fontSize:12, fontWeight:600, color:'#00848e' }}>{o.protocolNo||'—'}</td>
                        <td style={{ padding:'11px 14px', fontSize:13, color:'#334155' }}>{patFull(o.patientId)}</td>
                        <td style={{ padding:'11px 14px', fontSize:12, color:'#64748b' }}>{docFull(o.doctorId)}</td>
                        <td style={{ padding:'11px 14px', fontSize:12, color:'#334155', fontWeight:500 }}>{o.tests?.length||0} test</td>
                        <td style={{ padding:'11px 14px' }}>
                          <span style={{ fontSize:11, fontWeight:700, color:pc.color }}>{pc.label}</span>
                        </td>
                        <td style={{ padding:'11px 14px' }}>
                          <span style={{ fontSize:11, fontWeight:600, padding:'3px 9px', borderRadius:20, background:sc.bg, color:sc.color }}>{sc.label}</span>
                        </td>
                        <td style={{ padding:'11px 14px' }} onClick={e => e.stopPropagation()}>
                          <div style={{ display:'flex', gap:5, alignItems:'center' }}>
                            {/* Nəticə button */}
                            {['sample_collected','processing','completed'].includes(o.status) && (
                              <button onClick={() => openResultModal(o)}
                                style={{ padding:'4px 9px', border:'1px solid #00848e', borderRadius:7, background:'white', color:'#00848e', fontSize:11, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap' }}>
                                {o.status === 'completed' ? 'Nəticəni redaktə et' : 'Nəticə'}
                              </button>
                            )}
                            {/* Status dropdown */}
                            {nexts.length > 0 && (
                              statusEditId === o._id ? (
                                <select autoFocus onBlur={() => setStatusEditId(null)}
                                  onChange={e => handleStatusChange(o._id, e.target.value)}
                                  style={{ padding:'3px 6px', border:'1px solid #e2e8f0', borderRadius:7, fontSize:11, color:'#334155', background:'white', cursor:'pointer' }}>
                                  <option value="">Seç...</option>
                                  {nexts.map(s => <option key={s} value={s}>{STATUS_CFG[s]?.label}</option>)}
                                </select>
                              ) : (
                                <button onClick={() => setStatusEditId(o._id)}
                                  style={{ padding:'4px 9px', border:'1px solid #e2e8f0', borderRadius:7, background:'white', color:'#475569', fontSize:11, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap' }}>
                                  Status ↑
                                </button>
                              )
                            )}
                            {/* Delete button */}
                            {['pending','cancelled'].includes(o.status) && (
                              <button onClick={() => handleDelete(o._id)}
                                style={{ padding:'4px 9px', border:'1px solid #fee2e2', borderRadius:7, background:'white', color:'#ef4444', fontSize:11, fontWeight:600, cursor:'pointer' }}>
                                Sil
                              </button>
                            )}
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

        {/* Right — detail panel */}
        <div style={{ width: selected ? 320 : 0, transition:'width 0.25s', overflow:'hidden', flexShrink:0 }}>
          {selected && detail && (
            <div style={{ width:320, background:'white', borderRadius:14, border:'1px solid #f1f5f9', height:'100%', overflow:'auto', padding:20 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                <span style={{ fontWeight:700, fontSize:14, color:'#0f1b2d' }}>Sifariş məlumatı</span>
                <button onClick={() => { setSelected(null); setDetail(null); setDetailResult(null) }}
                  style={{ background:'none', border:'none', cursor:'pointer', color:'#94a3b8', fontSize:20 }}>×</button>
              </div>

              {detailLoad ? (
                <div style={{ display:'flex', justifyContent:'center', padding:40 }}>
                  <div style={{ width:28, height:28, border:'3px solid #e2e8f0', borderTopColor:'#00848e', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
                </div>
              ) : (
                <>
                  <p style={{ margin:0, fontSize:17, fontWeight:700, color:'#0f1b2d' }}>{detail.orderNumber||'—'}</p>
                  <p style={{ margin:'4px 0 12px', fontSize:12, color:'#64748b' }}>{fmtDate(detail.createdAt)}</p>

                  {detail.protocolNo && (
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14, padding:'8px 12px', background:'#f0fdfa', border:'1px solid #ccfbf1', borderRadius:8 }}>
                      <span style={{ fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.06em' }}>Protokol №</span>
                      <span style={{ fontSize:14, fontWeight:700, color:'#00848e', flex:1 }}>{detail.protocolNo}</span>
                      <button onClick={() => navigator.clipboard?.writeText(detail.protocolNo)}
                        style={{ padding:'3px 8px', border:'1px solid #00848e', borderRadius:6, background:'white', color:'#00848e', fontSize:10, fontWeight:600, cursor:'pointer' }}>
                        Kopyala
                      </button>
                    </div>
                  )}

                  <div style={{ display:'flex', gap:8, marginBottom:14 }}>
                    {(() => { const sc=STATUS_CFG[detail.status]||STATUS_CFG.pending; return <span style={{ fontSize:11, fontWeight:600, padding:'3px 9px', borderRadius:20, background:sc.bg, color:sc.color }}>{sc.label}</span> })()}
                    {(() => { const pc=PRIORITY_CFG[detail.priority]||PRIORITY_CFG.routine; return <span style={{ fontSize:11, fontWeight:700, color:pc.color }}>{pc.label}</span> })()}
                  </div>

                  <div style={{ fontSize:13, fontWeight:600, color:'#334155', marginBottom:2 }}>{patFull(detail.patientId)}</div>
                  <div style={{ fontSize:12, color:'#64748b', marginBottom:2 }}>{detail.patientId?.userId?.email||''}</div>
                  <div style={{ fontSize:12, color:'#64748b', marginBottom:14 }}>Dr. {docFull(detail.doctorId)}</div>

                  {detail.notes && <p style={{ fontSize:12, color:'#64748b', background:'#f8fafc', borderRadius:8, padding:'8px 12px', marginBottom:14 }}>{detail.notes}</p>}

                  {/* Tests */}
                  <p style={{ fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.06em', margin:'0 0 8px' }}>Testlər</p>
                  {(detail.tests||[]).map((t,i) => (
                    <div key={i} style={{ padding:'8px 12px', background:'#f8fafc', borderRadius:8, marginBottom:6 }}>
                      <span style={{ fontSize:13, fontWeight:600, color:'#0f1b2d' }}>{t.testName}</span>
                      <span style={{ fontSize:11, color:'#94a3b8', marginLeft:8 }}>{CATEGORY_LABELS[t.category]||t.category}</span>
                      {t.urgency !== 'routine' && <span style={{ fontSize:10, fontWeight:700, color: t.urgency==='stat' ? '#dc2626':'#ea580c', marginLeft:6 }}>{t.urgency.toUpperCase()}</span>}
                    </div>
                  ))}

                  {/* Result section */}
                  <div style={{ marginTop:14, display:'flex', gap:8, flexWrap:'wrap' }}>
                    <button onClick={loadDetailResult}
                      style={{ fontSize:12, fontWeight:600, padding:'6px 12px', border:'1px solid #00848e', borderRadius:8, background:'white', color:'#00848e', cursor:'pointer' }}>
                      Nəticəni Yoxla
                    </button>
                  </div>

                  {detailResult && (
                    <div style={{ marginTop:14 }}>
                      <p style={{ fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.06em', margin:'0 0 8px' }}>Nəticələr</p>
                      <div style={{ background:'#f8fafc', borderRadius:10, overflow:'hidden' }}>
                        <table style={{ width:'100%', borderCollapse:'collapse' }}>
                          <thead>
                            <tr>
                              {['Test','Dəyər','N. aralığı','Status'].map(h => (
                                <th key={h} style={{ padding:'7px 10px', fontSize:10, fontWeight:600, color:'#94a3b8', textAlign:'left', textTransform:'uppercase' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {(detailResult.results||[]).map((r,i) => (
                              <tr key={i} style={{ borderTop:'1px solid #f1f5f9' }}>
                                <td style={{ padding:'7px 10px', fontSize:12, color:'#334155', fontWeight:500 }}>{r.testName}</td>
                                <td style={{ padding:'7px 10px', fontSize:12, fontWeight:600, color:RESULT_COLORS[r.status]||'#334155' }}>{r.value}{r.unit ? ` ${r.unit}`:''}</td>
                                <td style={{ padding:'7px 10px', fontSize:11, color:'#94a3b8' }}>{r.referenceRange||'—'}</td>
                                <td style={{ padding:'7px 10px', fontSize:10, fontWeight:700, color:RESULT_COLORS[r.status]||'#64748b' }}>{RESULT_STATUS[r.status]||r.status}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {detailResult.summary && <p style={{ fontSize:12, color:'#334155', marginTop:10, padding:'8px 12px', background:'#f0fdf4', borderRadius:8 }}>{detailResult.summary}</p>}
                      {detailResult.attachmentUrl && (
                        <a href={detailResult.attachmentUrl} target="_blank" rel="noreferrer"
                          style={{ display:'inline-block', marginTop:10, fontSize:12, fontWeight:600, padding:'6px 12px', border:'1px solid #00848e', borderRadius:8, background:'white', color:'#00848e', textDecoration:'none' }}>
                          PDF yüklə
                        </a>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
        </>
      )}

      {/* ════ ADD ORDER MODAL ════════════════════════════════════════ */}
      {showOrderModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center' }}
          onClick={e => { if (e.target===e.currentTarget) setShowOrderModal(false) }}>
          <div style={{ background:'white', borderRadius:16, width:640, maxWidth:'95vw', maxHeight:'90vh', overflow:'auto', padding:28 }}>

            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:22 }}>
              <h2 style={{ margin:0, fontSize:17, fontWeight:700, color:'#0f1b2d' }}>Yeni Lab Sifarişi</h2>
              <button onClick={() => setShowOrderModal(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#94a3b8', fontSize:22 }}>×</button>
            </div>

            {orderErr && <div style={{ background:'#fef2f2', color:'#ef4444', borderRadius:8, padding:'10px 14px', fontSize:13, marginBottom:16 }}>{orderErr}</div>}

            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {/* Patient + Doctor */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <div>
                  <label style={lbl}>Pasiyent *</label>
                  <select style={inp} value={orderForm.patientId} onChange={e => setOF('patientId', e.target.value)}>
                    <option value="">Pasiyent seçin...</option>
                    {patients.map(p => <option key={p._id} value={p._id}>{patFull(p)}{p.patientId ? ` (${p.patientId})`:''}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Həkim *</label>
                  <select style={inp} value={orderForm.doctorId} onChange={e => setOF('doctorId', e.target.value)}>
                    <option value="">Həkim seçin...</option>
                    {doctors.map(d => <option key={d._id} value={d._id}>{docFull(d)}{d.specialization ? ` — ${d.specialization}`:''}</option>)}
                  </select>
                </div>
              </div>

              {/* Priority + Notes */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:14 }}>
                <div>
                  <label style={lbl}>Prioritet</label>
                  <select style={inp} value={orderForm.priority} onChange={e => setOF('priority', e.target.value)}>
                    <option value="routine">Adi</option>
                    <option value="urgent">Təcili</option>
                    <option value="stat">STAT</option>
                  </select>
                </div>
                <div>
                  <label style={lbl}>Qeyd</label>
                  <input style={inp} value={orderForm.notes} onChange={e => setOF('notes', e.target.value)} placeholder="Opsional..." />
                </div>
              </div>

              {/* Tests */}
              <div>
                <label style={lbl}>Testlər *</label>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {orderForm.tests.map((t, i) => (
                    <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 90px 120px 100px 24px', gap:6, alignItems:'center' }}>
                      <input style={inp} placeholder="Test adı *" value={t.testName} onChange={e => updateTest(i,'testName',e.target.value)} />
                      <input style={inp} placeholder="Kod" value={t.testCode} onChange={e => updateTest(i,'testCode',e.target.value)} />
                      <select style={inp} value={t.category} onChange={e => updateTest(i,'category',e.target.value)}>
                        {Object.entries(CATEGORY_LABELS).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                      <select style={inp} value={t.urgency} onChange={e => updateTest(i,'urgency',e.target.value)}>
                        <option value="routine">Adi</option>
                        <option value="urgent">Təcili</option>
                        <option value="stat">STAT</option>
                      </select>
                      {orderForm.tests.length > 1 && (
                        <button onClick={() => setOrderForm(f => ({ ...f, tests: f.tests.filter((_,idx) => idx!==i) }))}
                          style={{ width:22, height:22, background:'#fef2f2', border:'none', borderRadius:6, color:'#ef4444', cursor:'pointer', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => setOrderForm(f => ({ ...f, tests: [...f.tests, emptyTest()] }))}
                    style={{ padding:'7px 14px', border:'1px dashed #e2e8f0', borderRadius:8, background:'white', color:'#64748b', fontSize:12, cursor:'pointer', textAlign:'left' }}>
                    + Test əlavə et
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display:'flex', gap:10, marginTop:22, justifyContent:'flex-end' }}>
              <button onClick={() => setShowOrderModal(false)} style={{ padding:'10px 20px', border:'1px solid #e2e8f0', borderRadius:9, background:'white', fontSize:13, cursor:'pointer', color:'#475569' }}>Ləğv et</button>
              <button onClick={saveOrder} disabled={orderSaving}
                style={{ padding:'10px 24px', border:'none', borderRadius:9, background:'#00848e', color:'white', fontSize:13, fontWeight:600, cursor: orderSaving?'not-allowed':'pointer', opacity: orderSaving?0.7:1 }}>
                {orderSaving ? 'Saxlanır...' : 'Sifariş Yarat'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════ ADD RESULT MODAL ════════════════════════════════════════ */}
      {showResultModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center' }}
          onClick={e => { if (e.target===e.currentTarget) setShowResultModal(false) }}>
          <div style={{ background:'white', borderRadius:16, width:660, maxWidth:'95vw', maxHeight:'90vh', overflow:'auto', padding:28 }}>

            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
              <div>
                <h2 style={{ margin:0, fontSize:17, fontWeight:700, color:'#0f1b2d' }}>{resultId ? 'Nəticəni Redaktə Et' : 'Nəticə Daxil Et'}</h2>
                {resultOrder && (
                  <p style={{ margin:'3px 0 0', fontSize:12, color:'#64748b' }}>
                    {resultOrder.orderNumber} — {patFull(resultOrder.patientId)}
                    {resultOrder.protocolNo && <span style={{ marginLeft:8, fontWeight:700, color:'#00848e' }}>Protokol: {resultOrder.protocolNo}</span>}
                  </p>
                )}
              </div>
              <button onClick={() => setShowResultModal(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#94a3b8', fontSize:22 }}>×</button>
            </div>

            {resultErr && <div style={{ background:'#fef2f2', color:'#ef4444', borderRadius:8, padding:'10px 14px', fontSize:13, margin:'12px 0' }}>{resultErr}</div>}

            <div style={{ marginTop:16 }}>
              {/* Result rows */}
              <div style={{ background:'#f8fafc', borderRadius:10, overflow:'hidden', marginBottom:14 }}>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom:'1px solid #e2e8f0' }}>
                      {['Test adı','Dəyər *','Vahid','Normal aralıq','Status'].map(h => (
                        <th key={h} style={{ padding:'10px 12px', fontSize:11, fontWeight:600, color:'#94a3b8', textAlign:'left', textTransform:'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {resultForm.results.map((r,i) => (
                      <tr key={i} style={{ borderBottom:'1px solid #f1f5f9' }}>
                        <td style={{ padding:'8px 12px', fontSize:13, fontWeight:600, color:'#0f1b2d' }}>{r.testName}</td>
                        <td style={{ padding:'6px 8px' }}>
                          <input style={{ ...inp, padding:'6px 10px' }} placeholder="0.00" value={r.value} onChange={e => updateResultRow(i,'value',e.target.value)} />
                        </td>
                        <td style={{ padding:'6px 8px' }}>
                          <input style={{ ...inp, padding:'6px 10px' }} placeholder="mg/dL" value={r.unit} onChange={e => updateResultRow(i,'unit',e.target.value)} />
                        </td>
                        <td style={{ padding:'6px 8px' }}>
                          <input style={{ ...inp, padding:'6px 10px' }} placeholder="0-100" value={r.referenceRange} onChange={e => updateResultRow(i,'referenceRange',e.target.value)} />
                        </td>
                        <td style={{ padding:'6px 8px' }}>
                          <select style={{ ...inp, padding:'6px 10px' }} value={r.status} onChange={e => updateResultRow(i,'status',e.target.value)}>
                            {Object.entries(RESULT_STATUS).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div>
                <label style={lbl}>Ümumi nəticə / Şərh</label>
                <textarea rows={3} style={{ ...inp, resize:'vertical', fontFamily:'inherit' }}
                  placeholder="Laborant şərhi..."
                  value={resultForm.summary}
                  onChange={e => setResultForm(f => ({ ...f, summary: e.target.value }))} />
              </div>

              {/* PDF upload */}
              <div style={{ marginTop:14 }}>
                <label style={lbl}>Nəticə PDF-i</label>
                <input type="file" accept="application/pdf,image/jpeg,image/png" onChange={e => setPdfFile(e.target.files?.[0] || null)}
                  style={{ fontSize:12, color:'#475569' }} />
                {resultOrder?.resultPdf && !pdfFile && (
                  <a href={resultOrder.resultPdf} target="_blank" rel="noreferrer"
                    style={{ marginLeft:10, fontSize:12, fontWeight:600, color:'#00848e' }}>
                    Mövcud PDF-ə bax
                  </a>
                )}
              </div>
            </div>

            <div style={{ display:'flex', gap:10, marginTop:22, justifyContent:'flex-end' }}>
              <button onClick={() => setShowResultModal(false)} style={{ padding:'10px 20px', border:'1px solid #e2e8f0', borderRadius:9, background:'white', fontSize:13, cursor:'pointer', color:'#475569' }}>Ləğv et</button>
              <button onClick={saveResult} disabled={resultSaving}
                style={{ padding:'10px 24px', border:'none', borderRadius:9, background:'#00848e', color:'white', fontSize:13, fontWeight:600, cursor: resultSaving?'not-allowed':'pointer', opacity: resultSaving?0.7:1 }}>
                {resultSaving ? 'Saxlanır...' : 'Nəticəni Saxla'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </AdminLayout>
  )
}
