import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import AdminLayout from '../../components/admin/AdminLayout'
import api from '../../api/axios'

const MANUAL_STATUS_CFG = {
  draft:     { label: 'statusDraft',     bg: '#f1f5f9', color: '#64748b' },
  completed: { label: 'statusCompleted', bg: '#eff6ff', color: '#2563eb' },
  approved:  { label: 'statusApproved',  bg: '#f0fdf4', color: '#16a34a' },
  cancelled: { label: 'statusCancelled', bg: '#fef2f2', color: '#ef4444' },
}

const APPROVER_ROLES = ['SUPER_ADMIN', 'ADMIN', 'BAS_HEKIM']

function ManualResultsTab({ onEdit }) {
  const { t } = useTranslation()
  const [results, setResults]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selected, setSelected] = useState(null)
  const [currentUser] = useState(() => { try { return JSON.parse(localStorage.getItem('adminUser') || localStorage.getItem('user') || '{}') } catch { return {} } })
  const canApprove = APPROVER_ROLES.includes(String(currentUser.role || '').toUpperCase())
  const [downloadingId, setDownloadingId] = useState(null)

  const fetchResults = async () => {
    setLoading(true)
    try {
      const params = { limit: 100 }
      if (search) params.search = search
      if (['completed', 'approved'].includes(filterStatus)) params.status = filterStatus
      if (filterStatus === 'critical') params.critical = true
      if (filterStatus === 'public') params.publicVisible = true
      if (dateFrom) params.dateFrom = dateFrom
      if (dateTo) params.dateTo = dateTo
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
  }, [search, filterStatus, dateFrom, dateTo])

  const approve = async (id) => {
    try {
      await api.patch(`/lab/results/manual/${id}/approve`, { isPublicVisible: true })
      fetchResults()
    } catch (err) {
      alert(err.response?.data?.message || t('labAdmin.genericError'))
    }
  }

  const downloadPdf = async (id) => {
    setDownloadingId(id)
    try {
      const res = await api.get(`/lab-results/${id}/pdf`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url
      a.download = 'lab-result.pdf'
      a.click()
      window.URL.revokeObjectURL(url)
    } catch {
      alert(t('labAdmin.pdfError'))
    } finally {
      setDownloadingId(null)
    }
  }

  const inp = { width: '100%', border: '1px solid #e2e8f0', borderRadius: 9, padding: '9px 12px', fontSize: 13, color: '#334155', outline: 'none', boxSizing: 'border-box', background: 'white' }

  return (
    <div style={{ display: 'flex', gap: 18 }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('labResult.search')} style={{ ...inp, flex: 1 }} />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...inp, width: 170 }}>
            <option value="all">{t('labResult.allStatuses')}</option>
            <option value="completed">{t('labResult.statusCompleted')}</option>
            <option value="approved">{t('labResult.statusApproved')}</option>
            <option value="critical">{t('labResult.flagCritical')}</option>
            <option value="public">{t('labAdmin.publicVisible')}</option>
          </select>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} aria-label={t('labAdmin.dateFrom')} style={{ ...inp, width: 145 }} />
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} aria-label={t('labAdmin.dateTo')} style={{ ...inp, width: 145 }} />
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
                  {[t('labResult.protocolNo'), t('labResult.patient'), t('labResult.testName'), t('labResult.resultDate'), t('labResult.status'), t('labAdmin.approvedBy'), t('labAdmin.actions')].map(h => (
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
                      <td style={{ padding: '11px 14px', fontSize: 12, color: '#64748b', fontWeight: 600 }}>{r.approvedBy?.fullName || '—'}</td>
                      <td style={{ padding: '11px 14px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                          <button onClick={() => setSelected(r._id)}
                            style={{ padding: '4px 9px', border: '1px solid #00848e', borderRadius: 7, background: 'white', color: '#00848e', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                            {t('labAdmin.view')}
                          </button>
                          {r.status !== 'cancelled' && (
                            <button onClick={() => onEdit(r)}
                              style={{ padding: '4px 9px', border: '1px solid #cbd5e1', borderRadius: 7, background: 'white', color: '#475569', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                              {t('labAdmin.editResult')}
                            </button>
                          )}
                          {r.status === 'completed' && canApprove && (
                            <button onClick={() => approve(r._id)}
                              style={{ padding: '4px 9px', border: '1px solid #16a34a', borderRadius: 7, background: 'white', color: '#16a34a', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                              {t('labResult.approveAndPublish')}
                            </button>
                          )}
                          {r.status === 'approved' && (
                            <button onClick={() => downloadPdf(r._id)} disabled={downloadingId === r._id}
                              style={{ padding: '4px 9px', border: '1px solid #e2e8f0', borderRadius: 7, background: 'white', color: '#475569', fontSize: 11, fontWeight: 600, cursor: downloadingId === r._id ? 'not-allowed' : 'pointer', opacity: downloadingId === r._id ? 0.6 : 1 }}>
                              {downloadingId === r._id ? '…' : t('labResult.downloadPdf')}
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
                <p style={{ margin: '0 0 6px' }}><strong>{t('labAdmin.orderNo')}:</strong> {r.labOrderId?.requestNumber || r.labOrderId?.orderNumber || '—'}</p>
                <p style={{ margin: '0 0 6px' }}><strong>{t('labAdmin.cardNumber')}:</strong> {r.patientId?.patientId || '—'}</p>
                <p style={{ margin: '0 0 6px' }}><strong>{t('labResult.testName')}:</strong> {r.testName || '—'}</p>
                <p style={{ margin: '0 0 6px' }}><strong>{t('labResult.departmentName')}:</strong> {r.departmentName || '—'}</p>
                <p style={{ margin: '0 0 6px' }}><strong>{t('labResult.doctorName')}:</strong> {r.doctorName || '—'}</p>
                <p style={{ margin: '0 0 6px' }}><strong>{t('labResult.sampleDate')}:</strong> {fmtDate(r.sampleDate || r.labOrderId?.sampleCollectedAt)}</p>
                <p style={{ margin: '0 0 6px' }}><strong>{t('labResult.resultDate')}:</strong> {fmtDate(r.resultDate)}</p>
              </div>

              {(r.results || []).length > 0 && (
                <div style={{ marginTop: 14, background: '#f8fafc', borderRadius: 10, overflow: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        {[t('labResult.parameterName'), t('labResult.value'), t('labResult.unit'), t('labResult.referenceRange'), t('labResult.status')].map(header => (
                          <th key={header} style={{ padding:'7px 8px', textAlign:'left', fontSize:10, color:'#94a3b8', whiteSpace:'nowrap' }}>{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {r.results.map((item, i) => (
                        <tr key={i} style={{ borderTop: i ? '1px solid #f1f5f9' : 'none' }}>
                          <td style={{ padding: '7px 8px', fontSize: 12, color: '#334155' }}>{item.testName}</td>
                          <td style={{ padding: '7px 8px', fontSize: 12, fontWeight: 600 }}>{item.value}</td>
                          <td style={{ padding: '7px 8px', fontSize: 11 }}>{item.unit || '—'}</td>
                          <td style={{ padding: '7px 8px', fontSize: 11 }}>{item.referenceRange || '—'}</td>
                          <td style={{ padding: '7px 8px', fontSize: 11 }}>{t(`labResult.flag${String(item.status || 'pending').charAt(0).toUpperCase()}${String(item.status || 'pending').slice(1)}`)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {r.generalConclusion && (
                <p style={{ fontSize: 12, color: '#334155', marginTop: 10, padding: '8px 12px', background: '#f0fdf4', borderRadius: 8 }}>{r.generalConclusion}</p>
              )}

              <div style={{ marginTop:10, fontSize:11, color:'#64748b', lineHeight:1.7 }}>
                <div>{t('labResult.enteredBy')}: {r.labTechnicianId?.fullName || r.performedBy?.fullName || '—'}</div>
                <div>{t('labAdmin.approvedBy')}: {r.approvedBy?.fullName || '—'}</div>
                <div>{t('labAdmin.approvedAt')}: {fmtDate(r.approvedAt)}</div>
              </div>

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
  pending:          { labelKey: 'statusPending',         bg: '#f8fafc', color: '#64748b' },
  confirmed:        { labelKey: 'statusConfirmed',       bg: '#f8fafc', color: '#475569' },
  sample_collected: { labelKey: 'statusSampleCollected', bg: '#eff6ff', color: '#2563eb' },
  processing:       { labelKey: 'statusProcessing',      bg: '#fefce8', color: '#ca8a04' },
  completed:        { labelKey: 'statusCompleted',       bg: '#f0fdf4', color: '#16a34a' },
  approved:         { labelKey: 'statusApproved',        bg: '#ecfdf5', color: '#047857' },
  cancelled:        { labelKey: 'statusCancelled',       bg: '#fef2f2', color: '#dc2626' },
}

const PRIORITY_CFG = {
  routine: { labelKey: 'priorityRoutine', color: '#64748b' },
  urgent:  { labelKey: 'priorityUrgent',  color: '#ea580c' },
  stat:    { labelKey: 'priorityStat',     color: '#dc2626' },
}

const CATEGORY_LABEL_KEYS = {
  hematology: 'categoryHematology', biochemistry: 'categoryBiochemistry', microbiology: 'categoryMicrobiology',
  imaging: 'categoryImaging', urine: 'categoryUrine', other: 'categoryOther',
}

const RESULT_STATUS = {
  normal: 'flagNormal',
  low: 'flagLow',
  high: 'flagHigh',
  critical: 'flagCritical',
  pending: 'flagPending',
}
const RESULT_COLORS = { normal:'#16a34a', low:'#2563eb', high:'#ea580c', critical:'#dc2626' }

const emptyTest   = () => ({ testName:'', testCode:'', category:'other', urgency:'routine', notes:'' })
const emptyOrder  = { patientId:'', doctorId:'', priority:'routine', notes:'', tests:[emptyTest()] }
const emptyResult = { results:[], summary:'' }
const emptyResultItem = () => ({ testName:'', testCode:'', value:'', unit:'', referenceRange:'', status:'pending', note:'' })

const inferResultStatus = (value, referenceRange) => {
  const numericValue = Number(String(value).replace(',', '.'))
  if (!Number.isFinite(numericValue)) return value ? 'pending' : 'pending'
  const match = String(referenceRange || '').replace(',', '.').match(/(-?\d+(?:\.\d+)?)\s*[-–]\s*(-?\d+(?:\.\d+)?)/)
  if (!match) return 'pending'
  const minimum = Number(match[1])
  const maximum = Number(match[2])
  if (numericValue < minimum) return 'low'
  if (numericValue > maximum) return 'high'
  return 'normal'
}

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('az-AZ') : '—'
const patFull = (p) => p?.userId?.fullName || p?.fullName || '—'
const docFull = (d) => d?.userId?.fullName || d?.name || '—'

const inp = { width:'100%', border:'1px solid #e2e8f0', borderRadius:9, padding:'9px 12px', fontSize:13, color:'#334155', outline:'none', boxSizing:'border-box', background:'white' }
const lbl = { fontSize:12, fontWeight:600, color:'#475569', display:'block', marginBottom:6 }

export default function AdminLab() {
  const { t } = useTranslation()
  const [currentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('adminUser') || localStorage.getItem('user') || '{}') } catch { return {} }
  })
  const canApprove = APPROVER_ROLES.includes(String(currentUser.role || '').toUpperCase())

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
  const [resultsRefreshKey, setResultsRefreshKey] = useState(0)
  const [downloadingResultId, setDownloadingResultId] = useState(null)

  /* detail panel */
  const [selected,   setSelected]   = useState(null)
  const [detail,     setDetail]     = useState(null)
  const [detailResult, setDetailResult] = useState(null)
  const [detailLoad, setDetailLoad] = useState(false)

  /* ── load ───────────────────────────────────────────────────────── */
  const loadLabData = useCallback(async ({ includeDirectories = false } = {}) => {
    const requests = [
      api.get('/lab/summary'),
      api.get('/lab/orders', { params: { limit: 50 } }),
    ]
    if (includeDirectories) {
      requests.push(
        api.get('/patients', { params: { page: 1, limit: 200 } }),
        api.get('/doctors', { params: { limit: 100 } }),
      )
    }
    const [summaryRes, ordersRes, patientsRes, doctorsRes] = await Promise.all(requests)
    setSummary(summaryRes.data?.data || { byStatus: [], todayOrders: 0 })
    setOrders(ordersRes.data?.data?.orders || [])
    if (patientsRes) setPatients(patientsRes.data?.data?.patients || [])
    if (doctorsRes) setDoctors(doctorsRes.data?.data?.doctors || [])
  }, [])

  useEffect(() => {
    // Initial data hydration is intentionally delegated to the shared async loader.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadLabData({ includeDirectories: true })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [loadLabData])

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
  const openDetail = async (order) => {
    setSelected(order._id); setDetail(order); setDetailResult(null); setDetailLoad(true)
    try {
      const [orderRes, resultRes] = await Promise.all([
        api.get(`/lab/orders/${order._id}`),
        api.get(`/lab/results/order/${order._id}`).catch(error => {
          if (error.response?.status === 404) return null
          throw error
        }),
      ])
      setDetail(orderRes.data?.data || order)
      setDetailResult(resultRes?.data?.data || null)
    } catch {
      setDetail(order)
    } finally {
      setDetailLoad(false)
    }
  }

  const loadDetailResult = async () => {
    if (!selected) return
    try {
      const res = await api.get(`/lab/results/order/${selected}`)
      setDetailResult(res.data?.data || null)
    } catch (error) {
      if (error.response?.status === 404) setDetailResult(null)
    }
  }

  /* ── status update ───────────────────────────────────────────────── */
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await api.patch(`/lab/orders/${orderId}/status`, { status: newStatus })
      const updated = res.data?.data
      if (updated) {
        setOrders(prev => prev.map(o => o._id === orderId ? updated : o))
        if (selected === orderId) {
          setDetail(updated)
          await loadDetailResult()
        }
      }
      await loadLabData()
    } catch (error) {
      alert(error.response?.data?.message || t('labAdmin.genericError'))
    }
  }

  /* ── order modal ─────────────────────────────────────────────────── */
  const setOF = (k, v) => setOrderForm(f => ({ ...f, [k]: v }))
  const updateTest = (i, k, v) => setOrderForm(f => ({ ...f, tests: f.tests.map((t,idx) => idx===i ? {...t,[k]:v} : t) }))

  const saveOrder = async () => {
    if (!orderForm.patientId) { setOrderErr(t('labAdmin.selectPatientError')); return }
    if (!orderForm.doctorId)  { setOrderErr(t('labAdmin.selectDoctorError')); return }
    if (orderForm.tests.some(t => !t.testName.trim())) { setOrderErr(t('labAdmin.testNameEmptyError')); return }
    setOrderSaving(true); setOrderErr('')
    try {
      const res = await api.post('/lab/orders', orderForm)
      setOrders(prev => [res.data?.data, ...prev].filter(Boolean))
      setShowOrderModal(false); setOrderForm(emptyOrder)
      await loadLabData()
    } catch(e) { setOrderErr(e.response?.data?.message || e.message) }
    finally { setOrderSaving(false) }
  }

  /* ── result modal ────────────────────────────────────────────────── */
  const openResultModal = async (order) => {
    setResultOrderId(order._id); setResultOrder(order); setResultId(null); setPdfFile(null)
    setResultErr('')
    try {
      const existingRes = await api.get(`/lab/results/order/${order._id}`)
      const existing = existingRes.data?.data
      setResultId(existing._id)
      let existingRows = existing.results || []
      if (!existingRows.length) {
        const primaryTest = order.tests?.[0] || {}
        const templateRes = await api.get('/lab/test-templates', {
          params: { testName: primaryTest.testName, testCode: primaryTest.testCode },
        }).catch(() => null)
        const template = templateRes?.data?.data?.template || []
        existingRows = template.length
          ? template.map(item => ({
              testName: item.parameterName || item.testName || '',
              testCode: item.testCode || '',
              value: '',
              unit: item.unit || '',
              referenceRange: item.referenceRange || '',
              status: 'pending',
              note: item.note || '',
            }))
          : (order.tests || []).map(test => ({ ...emptyResultItem(), testName: test.testName, testCode: test.testCode || '' }))
      }
      setResultForm({
        results: existingRows.map(r => ({
          testName: r.testName,
          testCode: r.testCode || '',
          value: r.value || '',
          unit: r.unit || '',
          referenceRange: r.referenceRange || '',
          status: r.status || 'pending',
          note: r.note || '',
        })),
        summary: existing.generalConclusion || existing.summary || '',
      })
    } catch (error) {
      if (error.response?.status !== 404) {
        setResultErr(error.response?.data?.message || t('labAdmin.genericError'))
      }
      const primaryTest = order.tests?.[0] || {}
      const template = await (async () => {
        try {
        const templateRes = await api.get('/lab/test-templates', {
          params: { testName: primaryTest.testName, testCode: primaryTest.testCode },
        })
          return templateRes.data?.data?.template || []
        } catch {
          return []
        }
      })()
      const rows = template.length
        ? template.map(item => ({
            testName: item.parameterName || item.testName || '',
            testCode: item.testCode || '',
            value: '',
            unit: item.unit || '',
            referenceRange: item.referenceRange || '',
            status: 'pending',
            note: item.note || '',
          }))
        : (order.tests || []).map(test => ({ ...emptyResultItem(), testName: test.testName, testCode: test.testCode || '' }))
      setResultForm({ results: rows.length ? rows : [emptyResultItem()], summary: '' })
    }
    setShowResultModal(true)
  }

  const updateResultRow = (i, k, v) => setResultForm(f => ({
    ...f,
    results: f.results.map((row, idx) => {
      if (idx !== i) return row
      const next = { ...row, [k]: v }
      if (k === 'value' || k === 'referenceRange') {
        next.status = inferResultStatus(next.value, next.referenceRange)
      }
      return next
    }),
  }))
  const addResultRow = () => setResultForm(f => ({ ...f, results: [...f.results, emptyResultItem()] }))
  const removeResultRow = (index) => setResultForm(f => ({ ...f, results: f.results.filter((_, i) => i !== index) }))

  const openListedResultEdit = (result) => {
    setResultOrderId(result.labOrderId?._id || result.labOrderId || null)
    setResultOrder({
      orderNumber: result.labOrderId?.orderNumber,
      requestNumber: result.labOrderId?.requestNumber,
      protocolNo: result.protocolNo,
      patientId: { fullName: result.patientFullName },
      tests: result.labOrderId?.tests || [{ testName: result.testName }],
      sampleCollectedAt: result.sampleDate || result.labOrderId?.sampleCollectedAt,
      resultPdf: result.attachmentUrl,
    })
    setResultId(result._id)
    setPdfFile(null)
    setResultErr('')
    setResultForm({
      results: (result.results || []).map(item => ({
        testName: item.testName || '',
        testCode: item.testCode || '',
        value: item.value || '',
        unit: item.unit || '',
        referenceRange: item.referenceRange || '',
        status: item.status || 'pending',
        note: item.note || '',
      })),
      summary: result.generalConclusion || result.summary || '',
    })
    setShowResultModal(true)
  }

  const saveResult = async () => {
    if (resultForm.results.some(r => !r.value.trim())) { setResultErr(t('labAdmin.allValuesRequiredError')); return }
    setResultSaving(true); setResultErr('')
    try {
      let savedResultId = resultId
      let savedResult = null
      if (resultId) {
        const res = await api.patch(`/lab/results/${resultId}`, resultForm)
        savedResult = res.data?.data
      } else {
        const res = await api.post('/lab/results', { labOrderId: resultOrderId, ...resultForm })
        savedResult = res.data?.data
        savedResultId = savedResult?._id
      }

      if (pdfFile) {
        const fd = new FormData()
        fd.append('document', pdfFile)
        const uploadRes = await api.post(`/lab/results/${savedResultId}/attachment`, fd)
        savedResult = uploadRes.data?.data || savedResult
      }

      setDetailResult(savedResult)
      await loadLabData()
      setResultsRefreshKey(key => key + 1)
      if (selected === resultOrderId) {
        const orderRes = await api.get(`/lab/orders/${resultOrderId}`)
        setDetail(orderRes.data?.data)
        await loadDetailResult()
      }
      setShowResultModal(false)
    } catch(e) {
      const message = e.response?.data?.message
      setResultErr(message?.includes('already exists') ? t('labOrderResult.duplicateError') : (message || t('labOrderResult.genericError')))
    }
    finally { setResultSaving(false) }
  }

  const approveAndPublish = async (result) => {
    if (!result?._id || !canApprove) return
    try {
      const res = await api.patch(`/lab/results/manual/${result._id}/approve`, { isPublicVisible: true })
      const approved = res.data?.data || result
      setDetailResult(approved)
      await loadLabData()
      if (selected) {
        const orderRes = await api.get(`/lab/orders/${selected}`)
        setDetail(orderRes.data?.data)
      }
      if (approved.emailStatus === 'failed') {
        alert(t('labAdmin.pdfEmailFailed'))
      } else if (approved.emailStatus === 'sent') {
        alert(t('labAdmin.pdfEmailSent'))
      }
    } catch (error) {
      alert(error.response?.data?.message || t('labAdmin.genericError'))
    }
  }

  const downloadResultPdf = async (result) => {
    if (!result?._id) return
    setDownloadingResultId(result._id)
    try {
      const res = await api.get(`/lab-results/${result._id}/pdf`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `${result.protocolNo || 'lab-result'}.pdf`
      anchor.click()
      window.URL.revokeObjectURL(url)
    } catch {
      alert(t('labAdmin.pdfError'))
    } finally {
      setDownloadingResultId(null)
    }
  }

  /* ════════════════════════════════════════════════════════════════ */
  return (
    <AdminLayout activePage="lab">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
        <div>
          <h1 style={{ margin:0, fontSize:22, fontWeight:700, color:'#0f1b2d' }}>{t('adminLayout.nav.lab')}</h1>
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
        {[['orders', t('labAdmin.tabOrders')], ['results', t('labAdmin.tabResults')]].map(([k, label]) => (
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
        <ManualResultsTab key={resultsRefreshKey} onEdit={openListedResultEdit} />
      ) : (
        <>
      {/* ── Summary cards ───────────────────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
        {[
          { label:t('labAdmin.today'), value: summary.todayOrders, color:'#00848e', bg:'#f0fdfa' },
          { label:t('labAdmin.waiting'), value: byStatusCount('pending') + byStatusCount('confirmed'), color:'#64748b', bg:'#f8fafc' },
          { label:t('labAdmin.processing'), value: byStatusCount('sample_collected') + byStatusCount('processing'), color:'#ca8a04', bg:'#fefce8' },
          { label:t('labAdmin.completed'), value: byStatusCount('completed') + byStatusCount('approved'), color:'#16a34a', bg:'#f0fdf4' },
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
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('labAdmin.searchOrdersPlaceholder')}
                style={{ ...inp, paddingLeft:36 }} />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              style={{ ...inp, width:160 }}>
              <option value="all">{t('labAdmin.allStatuses')}</option>
              {Object.entries(STATUS_CFG).map(([k,v]) => <option key={k} value={k}>{t(`labAdmin.${v.labelKey}`)}</option>)}
            </select>
          </div>

          <div style={{ flex:1, background:'white', borderRadius:14, border:'1px solid #f1f5f9', overflow:'auto' }}>
            {loading ? (
              <div style={{ display:'flex', justifyContent:'center', padding:60 }}>
                <div style={{ width:32, height:32, border:'3px solid #e2e8f0', borderTopColor:'#00848e', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign:'center', padding:60, color:'#94a3b8', fontSize:14 }}>{t('labAdmin.noOrdersFound')}</div>
            ) : (
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ borderBottom:'1px solid #f1f5f9' }}>
                    {[t('labAdmin.orderNo'),t('labAdmin.protocolNo'),t('labAdmin.patient'),t('labAdmin.doctor'),t('labAdmin.tests'),t('labAdmin.priority'),t('labAdmin.status'),t('labAdmin.actions')].map(h => (
                      <th key={h} style={{ padding:'12px 14px', textAlign:'left', fontSize:11, fontWeight:600, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.05em', whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(o => {
                    const sc = STATUS_CFG[o.status]   || STATUS_CFG.pending
                    const pc = PRIORITY_CFG[o.priority] || PRIORITY_CFG.routine
                    const isSel = selected === o._id
                    return (
                      <tr key={o._id} onClick={() => openDetail(o)}
                        style={{ borderBottom:'1px solid #f8fafc', cursor:'pointer', background: isSel ? '#f0fafb' : 'white', transition:'background 0.1s' }}
                        onMouseEnter={e => { if (!isSel) e.currentTarget.style.background='#f8fafc' }}
                        onMouseLeave={e => { if (!isSel) e.currentTarget.style.background='white' }}>
                        <td style={{ padding:'11px 14px', fontSize:12, fontWeight:700, color:'#0f1b2d' }}>{o.requestNumber||o.orderNumber||'—'}</td>
                        <td style={{ padding:'11px 14px', fontSize:12, fontWeight:600, color:'#00848e' }}>{o.protocolNo||'—'}</td>
                        <td style={{ padding:'11px 14px', fontSize:13, color:'#334155' }}>{patFull(o.patientId)}</td>
                        <td style={{ padding:'11px 14px', fontSize:12, color:'#64748b' }}>{docFull(o.doctorId)}</td>
                        <td style={{ padding:'11px 14px', fontSize:12, color:'#334155', fontWeight:500 }}>{o.tests?.map(test => test.testName).join(', ')||'—'}</td>
                        <td style={{ padding:'11px 14px' }}>
                          <span style={{ fontSize:11, fontWeight:700, color:pc.color }}>{t(`labAdmin.${pc.labelKey}`)}</span>
                        </td>
                        <td style={{ padding:'11px 14px' }}>
                          <span style={{ fontSize:11, fontWeight:600, padding:'3px 9px', borderRadius:20, background:sc.bg, color:sc.color }}>{t(`labAdmin.${sc.labelKey}`)}</span>
                        </td>
                        <td style={{ padding:'11px 14px' }} onClick={e => e.stopPropagation()}>
                          <div style={{ display:'flex', gap:5, alignItems:'center' }}>
                            {o.status === 'pending' && (
                              <button onClick={() => handleStatusChange(o._id, 'confirmed')}
                                style={{ padding:'4px 9px', border:'1px solid #00848e', borderRadius:7, background:'white', color:'#00848e', fontSize:11, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap' }}>
                                {t('labAdmin.confirmAdmission')}
                              </button>
                            )}
                            {o.status === 'pending' && (
                              <button onClick={() => handleStatusChange(o._id, 'cancelled')}
                                style={{ padding:'4px 9px', border:'1px solid #fee2e2', borderRadius:7, background:'white', color:'#dc2626', fontSize:11, fontWeight:600, cursor:'pointer' }}>
                                {t('labResult.cancel')}
                              </button>
                            )}
                            {o.status === 'confirmed' && (
                              <button onClick={() => handleStatusChange(o._id, 'sample_collected')}
                                style={{ padding:'4px 9px', border:'1px solid #2563eb', borderRadius:7, background:'white', color:'#2563eb', fontSize:11, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap' }}>
                                {t('labAdmin.receiveSample')}
                              </button>
                            )}
                            {o.status === 'sample_collected' && (
                              <button onClick={() => handleStatusChange(o._id, 'processing')}
                                style={{ padding:'4px 9px', border:'1px solid #ca8a04', borderRadius:7, background:'white', color:'#a16207', fontSize:11, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap' }}>
                                {t('labAdmin.startProcessing')}
                              </button>
                            )}
                            {['sample_collected','processing'].includes(o.status) && !o.resultInfo?.hasValues && (
                              <button onClick={() => openResultModal(o)}
                                style={{ padding:'4px 9px', border:'1px solid #00848e', borderRadius:7, background:'white', color:'#00848e', fontSize:11, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap' }}>
                                {t('labResult.fillIn')}
                              </button>
                            )}
                            {o.resultInfo?.hasValues && (
                              <button onClick={() => openDetail(o)}
                                style={{ padding:'4px 9px', border:'1px solid #00848e', borderRadius:7, background:'white', color:'#00848e', fontSize:11, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap' }}>
                                {t('labAdmin.viewResult')}
                              </button>
                            )}
                            {o.status === 'completed' && o.resultInfo?.hasValues && (
                              <button onClick={() => openResultModal(o)}
                                style={{ padding:'4px 9px', border:'1px solid #cbd5e1', borderRadius:7, background:'white', color:'#475569', fontSize:11, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap' }}>
                                {t('labAdmin.editResult')}
                              </button>
                            )}
                            {o.status === 'completed' && o.resultInfo?.status === 'completed' && canApprove && (
                              <button onClick={() => approveAndPublish(o.resultInfo)}
                                style={{ padding:'4px 9px', border:'1px solid #16a34a', borderRadius:7, background:'white', color:'#16a34a', fontSize:11, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap' }}>
                                {t('labResult.approveAndPublish')}
                              </button>
                            )}
                            {o.status === 'approved' && (
                              <button onClick={() => downloadResultPdf(o.resultInfo)} disabled={downloadingResultId === o.resultInfo?._id}
                                style={{ padding:'4px 9px', border:'1px solid #cbd5e1', borderRadius:7, background:'white', color:'#475569', fontSize:11, fontWeight:600, cursor: downloadingResultId === o.resultInfo?._id ? 'not-allowed' : 'pointer', opacity: downloadingResultId === o.resultInfo?._id ? 0.6 : 1, whiteSpace:'nowrap' }}>
                                {downloadingResultId === o.resultInfo?._id ? '…' : t('labResult.downloadPdf')}
                              </button>
                            )}
                            {o.status === 'approved' && canApprove && (
                              <button onClick={() => openResultModal(o)}
                                style={{ padding:'4px 9px', border:'1px solid #cbd5e1', borderRadius:7, background:'white', color:'#475569', fontSize:11, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap' }}>
                                {t('labAdmin.returnToEdit')}
                              </button>
                            )}
                            {o.status === 'cancelled' && (
                              <button onClick={() => openDetail(o)}
                                style={{ padding:'4px 9px', border:'1px solid #cbd5e1', borderRadius:7, background:'white', color:'#475569', fontSize:11, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap' }}>
                                {t('labAdmin.details')}
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
                <span style={{ fontWeight:700, fontSize:14, color:'#0f1b2d' }}>{t('labAdmin.orderDetails')}</span>
                <button onClick={() => { setSelected(null); setDetail(null); setDetailResult(null) }}
                  style={{ background:'none', border:'none', cursor:'pointer', color:'#94a3b8', fontSize:20 }}>×</button>
              </div>

              {detailLoad ? (
                <div style={{ display:'flex', justifyContent:'center', padding:40 }}>
                  <div style={{ width:28, height:28, border:'3px solid #e2e8f0', borderTopColor:'#00848e', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
                </div>
              ) : (
                <>
                  <p style={{ margin:0, fontSize:17, fontWeight:700, color:'#0f1b2d' }}>{detail.requestNumber||detail.orderNumber||'—'}</p>
                  <p style={{ margin:'4px 0 12px', fontSize:12, color:'#64748b' }}>{fmtDate(detail.createdAt)}</p>

                  {detail.protocolNo && (
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14, padding:'8px 12px', background:'#f0fdfa', border:'1px solid #ccfbf1', borderRadius:8 }}>
                      <span style={{ fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.06em' }}>{t('labAdmin.protocolNo')}</span>
                      <span style={{ fontSize:14, fontWeight:700, color:'#00848e', flex:1 }}>{detail.protocolNo}</span>
                      <button onClick={() => navigator.clipboard?.writeText(detail.protocolNo)}
                        style={{ padding:'3px 8px', border:'1px solid #00848e', borderRadius:6, background:'white', color:'#00848e', fontSize:10, fontWeight:600, cursor:'pointer' }}>
                        {t('labAdmin.copy')}
                      </button>
                    </div>
                  )}

                  <div style={{ display:'flex', gap:8, marginBottom:14 }}>
                    {(() => { const sc=STATUS_CFG[detail.status]||STATUS_CFG.pending; return <span style={{ fontSize:11, fontWeight:600, padding:'3px 9px', borderRadius:20, background:sc.bg, color:sc.color }}>{t(`labAdmin.${sc.labelKey}`)}</span> })()}
                    {(() => { const pc=PRIORITY_CFG[detail.priority]||PRIORITY_CFG.routine; return <span style={{ fontSize:11, fontWeight:700, color:pc.color }}>{t(`labAdmin.${pc.labelKey}`)}</span> })()}
                  </div>

                  <div style={{ fontSize:13, fontWeight:600, color:'#334155', marginBottom:2 }}>{patFull(detail.patientId)}</div>
                  <div style={{ fontSize:12, color:'#64748b', marginBottom:2 }}>{t('labAdmin.cardNumber')}: {detail.patientId?.patientId||'—'}</div>
                  <div style={{ fontSize:12, color:'#64748b', marginBottom:2 }}>{detail.patientId?.userId?.email||''}</div>
                  <div style={{ fontSize:12, color:'#64748b', marginBottom:14 }}>Dr. {docFull(detail.doctorId)}</div>
                  <div style={{ fontSize:12, color:'#64748b', marginBottom:14 }}>{t('labAdmin.sampleDate')}: {fmtDate(detail.sampleCollectedAt)}</div>

                  {detail.notes && <p style={{ fontSize:12, color:'#64748b', background:'#f8fafc', borderRadius:8, padding:'8px 12px', marginBottom:14 }}>{detail.notes}</p>}

                  {/* Tests */}
                  <p style={{ fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.06em', margin:'0 0 8px' }}>{t('labAdmin.tests')}</p>
                  {(detail.tests||[]).map((test,i) => (
                    <div key={i} style={{ padding:'8px 12px', background:'#f8fafc', borderRadius:8, marginBottom:6 }}>
                      <span style={{ fontSize:13, fontWeight:600, color:'#0f1b2d' }}>{test.testName}</span>
                      <span style={{ fontSize:11, color:'#94a3b8', marginLeft:8 }}>{CATEGORY_LABEL_KEYS[test.category] ? t(`labAdmin.${CATEGORY_LABEL_KEYS[test.category]}`) : test.category}</span>
                      {test.urgency !== 'routine' && <span style={{ fontSize:10, fontWeight:700, color: test.urgency==='stat' ? '#dc2626':'#ea580c', marginLeft:6 }}>{test.urgency.toUpperCase()}</span>}
                    </div>
                  ))}

                  {/* Result section */}
                  <div style={{ marginTop:14, display:'flex', gap:8, flexWrap:'wrap' }}>
                    {!detailResult?.results?.some(item => item.value) && (
                    <button onClick={() => openResultModal(detail)}
                      style={{ fontSize:12, fontWeight:600, padding:'6px 12px', border:'1px solid #00848e', borderRadius:8, background:'white', color:'#00848e', cursor:'pointer' }}>
                      {t('labResult.fillIn')}
                    </button>
                    )}
                    {detailResult?.results?.some(item => item.value) && (
                      <button onClick={() => openResultModal(detail)}
                        style={{ fontSize:12, fontWeight:600, padding:'6px 12px', border:'1px solid #00848e', borderRadius:8, background:'white', color:'#00848e', cursor:'pointer' }}>
                        {t('labAdmin.editResult')}
                      </button>
                    )}
                    {detailResult?.status === 'completed' && canApprove && (
                      <button onClick={() => approveAndPublish(detailResult)}
                        style={{ fontSize:12, fontWeight:600, padding:'6px 12px', border:'1px solid #16a34a', borderRadius:8, background:'white', color:'#16a34a', cursor:'pointer' }}>
                        {t('labResult.approveAndPublish')}
                      </button>
                    )}
                  </div>

                  {detailResult?.results?.some(item => item.value) ? (
                    <div style={{ marginTop:14 }}>
                      <p style={{ fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.06em', margin:'0 0 8px' }}>{t('labAdmin.results')}</p>
                      <div style={{ background:'#f8fafc', borderRadius:10, overflow:'hidden' }}>
                        <table style={{ width:'100%', borderCollapse:'collapse' }}>
                          <thead>
                            <tr>
                              {[t('labResult.parameterName'),t('labResult.value'),t('labResult.unit'),t('labResult.referenceRange'),t('labResult.status')].map(h => (
                                <th key={h} style={{ padding:'7px 10px', fontSize:10, fontWeight:600, color:'#94a3b8', textAlign:'left', textTransform:'uppercase' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {(detailResult.results||[]).map((r,i) => (
                              <tr key={i} style={{ borderTop:'1px solid #f1f5f9' }}>
                                <td style={{ padding:'7px 10px', fontSize:12, color:'#334155', fontWeight:500 }}>{r.testName}</td>
                                <td style={{ padding:'7px 10px', fontSize:12, fontWeight:600, color:RESULT_COLORS[r.status]||'#334155' }}>{r.value}</td>
                                <td style={{ padding:'7px 10px', fontSize:11, color:'#64748b' }}>{r.unit||'—'}</td>
                                <td style={{ padding:'7px 10px', fontSize:11, color:'#94a3b8' }}>{r.referenceRange||'—'}</td>
                                <td style={{ padding:'7px 10px', fontSize:10, fontWeight:700, color:RESULT_COLORS[r.status]||'#64748b' }}>{t(`labResult.${RESULT_STATUS[r.status] || 'flagPending'}`)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {detailResult.summary && <p style={{ fontSize:12, color:'#334155', marginTop:10, padding:'8px 12px', background:'#f0fdf4', borderRadius:8 }}>{detailResult.summary}</p>}
                      <div style={{ marginTop:10, fontSize:11, color:'#64748b', lineHeight:1.7 }}>
                        <div>{t('labResult.enteredBy')}: {detailResult.labTechnicianId?.fullName || detailResult.performedBy?.fullName || '—'}</div>
                        <div>{t('labResult.completedAt')}: {fmtDate(detailResult.completedAt || detailResult.updatedAt)}</div>
                        <div>{t('labAdmin.approvedBy')}: {detailResult.approvedBy?.fullName || '—'}</div>
                        <div>{t('labAdmin.approvedAt')}: {fmtDate(detailResult.approvedAt)}</div>
                      </div>
                      {detailResult.status === 'approved' && (
                        <button onClick={() => downloadResultPdf(detailResult)} disabled={downloadingResultId === detailResult._id}
                          style={{ display:'inline-block', marginTop:10, fontSize:12, fontWeight:600, padding:'6px 12px', border:'1px solid #00848e', borderRadius:8, background:'white', color:'#00848e', cursor: downloadingResultId === detailResult._id ? 'not-allowed' : 'pointer', opacity: downloadingResultId === detailResult._id ? 0.6 : 1 }}>
                          {downloadingResultId === detailResult._id ? '…' : t('labResult.downloadPdf')}
                        </button>
                      )}
                    </div>
                  ) : (
                    <p style={{ marginTop:14, padding:'10px 12px', borderRadius:8, background:'#f8fafc', color:'#64748b', fontSize:12 }}>
                      {t('labAdmin.resultNotEntered')}
                    </p>
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
              <h2 style={{ margin:0, fontSize:17, fontWeight:700, color:'#0f1b2d' }}>{t('labAdmin.newOrderTitle')}</h2>
              <button onClick={() => setShowOrderModal(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#94a3b8', fontSize:22 }}>×</button>
            </div>

            {orderErr && <div style={{ background:'#fef2f2', color:'#ef4444', borderRadius:8, padding:'10px 14px', fontSize:13, marginBottom:16 }}>{orderErr}</div>}

            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {/* Patient + Doctor */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <div>
                  <label style={lbl}>{t('labAdmin.patient')} *</label>
                  <select style={inp} value={orderForm.patientId} onChange={e => setOF('patientId', e.target.value)}>
                    <option value="">{t('labAdmin.selectPatientPlaceholder')}</option>
                    {patients.map(p => <option key={p._id} value={p._id}>{patFull(p)}{p.patientId ? ` (${p.patientId})`:''}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>{t('labAdmin.doctor')} *</label>
                  <select style={inp} value={orderForm.doctorId} onChange={e => setOF('doctorId', e.target.value)}>
                    <option value="">{t('labAdmin.selectDoctorPlaceholder')}</option>
                    {doctors.map(d => <option key={d._id} value={d._id}>{docFull(d)}{d.specialization ? ` — ${d.specialization}`:''}</option>)}
                  </select>
                </div>
              </div>

              {/* Priority + Notes */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:14 }}>
                <div>
                  <label style={lbl}>{t('labAdmin.priority')}</label>
                  <select style={inp} value={orderForm.priority} onChange={e => setOF('priority', e.target.value)}>
                    <option value="routine">{t('labAdmin.priorityRoutine')}</option>
                    <option value="urgent">{t('labAdmin.priorityUrgent')}</option>
                    <option value="stat">{t('labAdmin.priorityStat')}</option>
                  </select>
                </div>
                <div>
                  <label style={lbl}>{t('labAdmin.notes')}</label>
                  <input style={inp} value={orderForm.notes} onChange={e => setOF('notes', e.target.value)} placeholder={t('labAdmin.optionalPlaceholder')} />
                </div>
              </div>

              {/* Tests */}
              <div>
                <label style={lbl}>{t('labAdmin.tests')} *</label>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {orderForm.tests.map((test, i) => (
                    <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 90px 120px 100px 24px', gap:6, alignItems:'center' }}>
                      <input style={inp} placeholder={`${t('labAdmin.testName')} *`} value={test.testName} onChange={e => updateTest(i,'testName',e.target.value)} />
                      <input style={inp} placeholder={t('labAdmin.testCode')} value={test.testCode} onChange={e => updateTest(i,'testCode',e.target.value)} />
                      <select style={inp} value={test.category} onChange={e => updateTest(i,'category',e.target.value)}>
                        {Object.entries(CATEGORY_LABEL_KEYS).map(([v,key]) => <option key={v} value={v}>{t(`labAdmin.${key}`)}</option>)}
                      </select>
                      <select style={inp} value={test.urgency} onChange={e => updateTest(i,'urgency',e.target.value)}>
                        <option value="routine">{t('labAdmin.priorityRoutine')}</option>
                        <option value="urgent">{t('labAdmin.priorityUrgent')}</option>
                        <option value="stat">{t('labAdmin.priorityStat')}</option>
                      </select>
                      {orderForm.tests.length > 1 && (
                        <button onClick={() => setOrderForm(f => ({ ...f, tests: f.tests.filter((_,idx) => idx!==i) }))}
                          style={{ width:22, height:22, background:'#fef2f2', border:'none', borderRadius:6, color:'#ef4444', cursor:'pointer', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => setOrderForm(f => ({ ...f, tests: [...f.tests, emptyTest()] }))}
                    style={{ padding:'7px 14px', border:'1px dashed #e2e8f0', borderRadius:8, background:'white', color:'#64748b', fontSize:12, cursor:'pointer', textAlign:'left' }}>
                    + {t('labAdmin.addTest')}
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display:'flex', gap:10, marginTop:22, justifyContent:'flex-end' }}>
              <button onClick={() => setShowOrderModal(false)} style={{ padding:'10px 20px', border:'1px solid #e2e8f0', borderRadius:9, background:'white', fontSize:13, cursor:'pointer', color:'#475569' }}>{t('labResult.cancel')}</button>
              <button onClick={saveOrder} disabled={orderSaving}
                style={{ padding:'10px 24px', border:'none', borderRadius:9, background:'#00848e', color:'white', fontSize:13, fontWeight:600, cursor: orderSaving?'not-allowed':'pointer', opacity: orderSaving?0.7:1 }}>
                {orderSaving ? t('labResult.saving') : t('labAdmin.createOrder')}
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
                <h2 style={{ margin:0, fontSize:17, fontWeight:700, color:'#0f1b2d' }}>{resultId ? t('labOrderResult.editTitle') : t('labOrderResult.enterTitle')}</h2>
                {resultOrder && (
                  <div style={{ marginTop:5, fontSize:12, color:'#64748b', lineHeight:1.6 }}>
                    <div>{t('labAdmin.patient')}: {patFull(resultOrder.patientId)}</div>
                    <div>{t('labAdmin.orderNo')}: {resultOrder.requestNumber || resultOrder.orderNumber || '—'}</div>
                    <div>{t('labAdmin.protocolNo')}: <span style={{ fontWeight:700, color:'#00848e' }}>{resultOrder.protocolNo || '—'}</span></div>
                    <div>{t('labAdmin.tests')}: {(resultOrder.tests || []).map(test => test.testName).join(', ') || resultOrder.testName || '—'}</div>
                    <div>{t('labResult.sampleDate')}: {fmtDate(resultOrder.sampleCollectedAt || resultOrder.sampleDate)}</div>
                    <div>{t('labResult.resultDate')}: {fmtDate(new Date())}</div>
                  </div>
                )}
              </div>
              <button onClick={() => setShowResultModal(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#94a3b8', fontSize:22 }}>×</button>
            </div>

            {resultErr && <div style={{ background:'#fef2f2', color:'#ef4444', borderRadius:8, padding:'10px 14px', fontSize:13, margin:'12px 0' }}>{resultErr}</div>}

            <div style={{ marginTop:16 }}>
              {/* Result rows */}
              <div style={{ background:'#f8fafc', borderRadius:10, overflow:'auto', marginBottom:14 }}>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom:'1px solid #e2e8f0' }}>
                      {[t('labResult.parameterName'),t('labResult.value'),t('labResult.unit'),t('labResult.referenceRange'),t('labResult.status'),t('labResult.note'),''].map(h => (
                        <th key={h} style={{ padding:'10px 12px', fontSize:11, fontWeight:600, color:'#94a3b8', textAlign:'left', textTransform:'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {resultForm.results.map((r,i) => (
                      <tr key={i} style={{ borderBottom:'1px solid #f1f5f9' }}>
                        <td style={{ padding:'6px 8px', minWidth:150 }}>
                          <input style={{ ...inp, padding:'6px 10px' }} value={r.testName} onChange={e => updateResultRow(i,'testName',e.target.value)} />
                        </td>
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
                            {Object.entries(RESULT_STATUS).map(([value, labelKey]) => (
                              <option key={value} value={value}>{t(`labResult.${labelKey}`)}</option>
                            ))}
                          </select>
                        </td>
                        <td style={{ padding:'6px 8px', minWidth:130 }}>
                          <input style={{ ...inp, padding:'6px 10px' }} value={r.note || ''} onChange={e => updateResultRow(i,'note',e.target.value)} />
                        </td>
                        <td style={{ padding:'6px 8px' }}>
                          {resultForm.results.length > 1 && (
                            <button type="button" onClick={() => removeResultRow(i)}
                              style={{ width:28, height:28, border:'1px solid #fee2e2', borderRadius:7, background:'white', color:'#dc2626', cursor:'pointer' }}>
                              ×
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button type="button" onClick={addResultRow}
                style={{ marginBottom:14, padding:'7px 12px', border:'1px dashed #94a3b8', borderRadius:8, background:'white', color:'#475569', fontSize:12, cursor:'pointer' }}>
                + {t('labResult.addParameter')}
              </button>

              {/* Summary */}
              <div>
                <label style={lbl}>{t('labResult.generalConclusion')}</label>
                <textarea rows={3} style={{ ...inp, resize:'vertical', fontFamily:'inherit' }}
                  placeholder={t('labAdmin.labCommentPlaceholder')}
                  value={resultForm.summary}
                  onChange={e => setResultForm(f => ({ ...f, summary: e.target.value }))} />
              </div>

              {/* PDF upload */}
              <div style={{ marginTop:14 }}>
                <label style={lbl}>{t('labAdmin.resultPdf')}</label>
                <input type="file" accept="application/pdf,image/jpeg,image/png" onChange={e => setPdfFile(e.target.files?.[0] || null)}
                  style={{ fontSize:12, color:'#475569' }} />
                {resultOrder?.resultPdf && !pdfFile && (
                  <a href={resultOrder.resultPdf} target="_blank" rel="noreferrer"
                    style={{ marginLeft:10, fontSize:12, fontWeight:600, color:'#00848e' }}>
                    {t('labAdmin.viewExistingPdf')}
                  </a>
                )}
              </div>
            </div>

            <div style={{ display:'flex', gap:10, marginTop:22, justifyContent:'flex-end' }}>
              <button onClick={() => setShowResultModal(false)} style={{ padding:'10px 20px', border:'1px solid #e2e8f0', borderRadius:9, background:'white', fontSize:13, cursor:'pointer', color:'#475569' }}>{t('common.cancel')}</button>
              <button onClick={saveResult} disabled={resultSaving}
                style={{ padding:'10px 24px', border:'none', borderRadius:9, background:'#00848e', color:'white', fontSize:13, fontWeight:600, cursor: resultSaving?'not-allowed':'pointer', opacity: resultSaving?0.7:1 }}>
                {resultSaving ? t('labOrderResult.saving') : (resultId ? t('labOrderResult.saveChangesButton') : t('labOrderResult.saveButton'))}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </AdminLayout>
  )
}
