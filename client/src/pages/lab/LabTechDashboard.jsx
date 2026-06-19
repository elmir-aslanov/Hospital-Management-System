import { useState, useEffect } from 'react'
import { useNavigate }         from 'react-router-dom'
import { useTranslation }      from 'react-i18next'
import api from '../../api/axios'
import { clearAuthStorage } from '../../utils/authSession'

const BASE  = 'http://localhost:5000'
const token = () => localStorage.getItem('token')
const hdrs  = () => ({ Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' })
const TEAL  = '#00848e'
const NAVY  = '#0a1628'
const FONT  = "'Source Sans 3', sans-serif"

const MANUAL_STATUS_CFG = {
  draft:     { label: 'statusDraft',     color: '#64748b', bg: '#f1f5f9' },
  completed: { label: 'statusCompleted', color: '#2563eb', bg: '#eff6ff' },
  approved:  { label: 'statusApproved',  color: '#16a34a', bg: '#f0fdf4' },
  cancelled: { label: 'statusCancelled', color: '#ef4444', bg: '#fef2f2' },
}
const MANUAL_FLAG_CFG = {
  normal:   { label: 'flagNormal',   color: '#15803d' },
  low:      { label: 'flagLow',      color: '#c2410c' },
  high:     { label: 'flagHigh',     color: '#c2410c' },
  critical: { label: 'flagCritical', color: '#b91c1c' },
  pending:  { label: 'flagPending',  color: '#64748b' },
}

const displayUserName = (u) => {
  if (!u) return ''
  const name = [u.name, u.surname].filter(Boolean).join(' ').trim()
  return name || u.fullName || ''
}

// Parses reference-range strings like "0-20", "0–20", "<5", ">10", "≤20", "≥5".
const parseReferenceRange = (range) => {
  const r = String(range || '').trim()
  if (!r) return null
  const dash = r.match(/^(-?\d+(?:[.,]\d+)?)\s*[-–]\s*(-?\d+(?:[.,]\d+)?)$/)
  if (dash) return { min: parseFloat(dash[1].replace(',', '.')), max: parseFloat(dash[2].replace(',', '.')) }
  const lt = r.match(/^[<≤]\s*=?\s*(-?\d+(?:[.,]\d+)?)$/)
  if (lt) return { max: parseFloat(lt[1].replace(',', '.')) }
  const gt = r.match(/^[>≥]\s*=?\s*(-?\d+(?:[.,]\d+)?)$/)
  if (gt) return { min: parseFloat(gt[1].replace(',', '.')) }
  return null
}

const computeAutoStatus = (value, range) => {
  const num = parseFloat(String(value || '').replace(',', '.'))
  if (Number.isNaN(num)) return null
  const bounds = parseReferenceRange(range)
  if (!bounds) return null
  if (bounds.min !== undefined && num < bounds.min) return 'low'
  if (bounds.max !== undefined && num > bounds.max) return 'high'
  return 'normal'
}

const emptyManualItem = () => ({ parameterName: '', value: '', unit: '', referenceRange: '', status: 'normal', note: '', statusTouched: false })
const isBlankItem = (item) => !item.parameterName.trim() && !item.value.trim() && !item.unit.trim() && !item.referenceRange.trim()
const emptyManualForm = () => ({
  patientFullName: '', patientFin: '', patientBirthDate: '',
  testName: '', testCode: '', sampleDate: '', resultDate: '',
  doctorName: '', departmentName: '',
  resultItems: [emptyManualItem()],
  generalConclusion: '', internalNote: '',
})

const manualInputStyle = {
  width: '100%', border: '1px solid #e2e8f0', borderRadius: 9, padding: '9px 11px',
  fontSize: 13, color: '#334155', outline: 'none', boxSizing: 'border-box', background: 'white', fontFamily: FONT,
}
const manualLbl = { fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }

function ManualResultPanel() {
  const { t } = useTranslation()
  const [showForm, setShowForm]   = useState(false)
  const [form, setForm]           = useState(emptyManualForm())
  const [editingId, setEditingId] = useState(null)
  const [meta, setMeta]           = useState(null) // { protocolNo, enteredByName, completedAt }
  const [saving, setSaving]       = useState(false)
  const [formErr, setFormErr]     = useState('')
  const [results, setResults]     = useState([])
  const [loadingList, setLoadingList] = useState(true)

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const setItem = (i, k, v) => setForm(f => ({
    ...f,
    resultItems: f.resultItems.map((it, idx) => {
      if (idx !== i) return it
      if (k === 'status') return { ...it, status: v, statusTouched: true }
      const next = { ...it, [k]: v }
      if ((k === 'value' || k === 'referenceRange') && !it.statusTouched) {
        const auto = computeAutoStatus(k === 'value' ? v : it.value, k === 'referenceRange' ? v : it.referenceRange)
        if (auto) next.status = auto
      }
      return next
    }),
  }))

  const addItem = () => setForm(f => ({ ...f, resultItems: [...f.resultItems, emptyManualItem()] }))
  const removeItem = (i) => setForm(f => ({ ...f, resultItems: f.resultItems.filter((_, idx) => idx !== i) }))

  const loadList = async () => {
    setLoadingList(true)
    try {
      const res = await api.get('/lab/results/manual', { params: { limit: 20 } })
      setResults(res.data?.data?.results || [])
    } catch {
      setResults([])
    } finally {
      setLoadingList(false)
    }
  }

  useEffect(() => {
    let isCurrent = true
    const load = async () => {
      setLoadingList(true)
      try {
        const res = await api.get('/lab/results/manual', { params: { limit: 20 } })
        if (isCurrent) setResults(res.data?.data?.results || [])
      } catch {
        if (isCurrent) setResults([])
      } finally {
        if (isCurrent) setLoadingList(false)
      }
    }
    load()
    return () => { isCurrent = false }
  }, [])

  const toDateInput = (v) => v ? new Date(v).toISOString().slice(0, 10) : ''

  const applyTemplateIfBlank = async (testName) => {
    const name = testName.trim()
    if (!name) return
    try {
      const res = await api.get('/lab/test-templates', { params: { testName: name } })
      const template = res.data?.data?.template || []
      if (!template.length) return
      setForm(f => {
        if (f.resultItems.length > 1 || !isBlankItem(f.resultItems[0])) return f
        return {
          ...f,
          resultItems: template.map(row => ({
            parameterName: row.parameterName || '', value: '', unit: row.unit || '',
            referenceRange: row.referenceRange || '', status: 'normal', note: '', statusTouched: false,
          })),
        }
      })
    } catch {
      // No template for this test — leave the form as-is.
    }
  }

  const openNew = () => {
    setEditingId(null)
    setMeta(null)
    setForm(emptyManualForm())
    setFormErr('')
    setShowForm(true)
  }

  const openEdit = async (id) => {
    setFormErr('')
    try {
      const res = await api.get(`/lab/results/manual/${id}`)
      const r = res.data?.data
      if (!r) return
      setEditingId(id)
      setMeta({
        protocolNo: r.protocolNo,
        enteredByName: displayUserName(r.labTechnicianId),
        completedAt: r.completedAt,
      })
      setForm({
        patientFullName: r.patientFullName || '', patientFin: r.patientFin || '',
        patientBirthDate: toDateInput(r.patientBirthDate),
        testName: r.testName || '', testCode: r.testCode || '',
        sampleDate: toDateInput(r.sampleDate), resultDate: toDateInput(r.resultDate),
        doctorName: r.doctorName || '', departmentName: r.departmentName || '',
        resultItems: r.results?.length ? r.results.map(item => ({
          parameterName: item.testName || '', value: item.value || '', unit: item.unit || '',
          referenceRange: item.referenceRange || '', status: item.status || 'normal',
          note: item.note || '', statusTouched: true,
        })) : [emptyManualItem()],
        generalConclusion: r.generalConclusion || '', internalNote: r.internalNote || '',
      })
      setShowForm(true)
    } catch (err) {
      alert(err.response?.data?.message || 'Xəta baş verdi')
    }
  }

  const submit = async (status) => {
    if (!form.patientFullName.trim()) { setFormErr(t('labResult.validationFullName')); return }
    if (!form.testName.trim())        { setFormErr(t('labResult.validationTestName')); return }
    setSaving(true); setFormErr('')
    try {
      if (editingId) {
        await api.patch(`/lab/results/manual/${editingId}`, { ...form, status })
      } else {
        await api.post('/lab/results/manual', { ...form, status })
      }
      setForm(emptyManualForm())
      setEditingId(null)
      setMeta(null)
      setShowForm(false)
      loadList()
    } catch (err) {
      setFormErr(err.response?.data?.message || 'Xəta baş verdi')
    } finally {
      setSaving(false)
    }
  }

  const cancelResult = async (id) => {
    if (!window.confirm('Bu nəticəni ləğv etmək istəyirsiniz?')) return
    try {
      await api.patch(`/lab/results/manual/${id}/cancel`)
      loadList()
    } catch (err) {
      alert(err.response?.data?.message || 'Xəta baş verdi')
    }
  }

  const downloadPdf = (id) => {
    api.get(`/lab-results/${id}/pdf`, { responseType: 'blob' })
      .then(res => {
        const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
        const a = document.createElement('a')
        a.href = url
        a.download = 'lab-result.pdf'
        a.click()
        window.URL.revokeObjectURL(url)
      })
      .catch(() => alert('PDF yüklənmədi'))
  }

  return (
    <div style={{ background: 'white', borderRadius: 14, border: '1px solid #f1f5f9', padding: 20, marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showForm ? 16 : 0 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: NAVY }}>{t('labResult.newResult')}</h3>
        <button
          onClick={() => { if (showForm) { setShowForm(false) } else { openNew() } }}
          style={{ border: `1px solid ${TEAL}`, background: showForm ? TEAL : 'white', color: showForm ? 'white' : TEAL, borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}
        >
          {showForm ? '×' : t('labResult.newResult')}
        </button>
      </div>

      {showForm && (
        <div style={{ marginTop: 4 }}>
          {formErr && <div style={{ background: '#fef2f2', color: '#ef4444', borderRadius: 8, padding: '9px 12px', fontSize: 13, marginBottom: 14 }}>{formErr}</div>}

          {meta && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, background: '#f8fafc', borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 10.5, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 2 }}>{t('labResult.patientFullName')}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{form.patientFullName || '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: 10.5, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 2 }}>{t('labResult.protocolNo')}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: TEAL }}>{meta.protocolNo || '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: 10.5, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 2 }}>{t('labResult.testName')}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{form.testName || '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: 10.5, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 2 }}>{t('labResult.sampleDate')}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{form.sampleDate || '—'}</div>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={manualLbl}>{t('labResult.patientFullName')} *</label>
              <input style={manualInputStyle} value={form.patientFullName} onChange={e => setF('patientFullName', e.target.value)} />
            </div>
            <div>
              <label style={manualLbl}>{t('labResult.patientFin')}</label>
              <input style={manualInputStyle} value={form.patientFin} onChange={e => setF('patientFin', e.target.value)} />
            </div>
            <div>
              <label style={manualLbl}>{t('labResult.patientBirthDate')}</label>
              <input type="date" style={manualInputStyle} value={form.patientBirthDate} onChange={e => setF('patientBirthDate', e.target.value)} />
            </div>
            <div>
              <label style={manualLbl}>{t('labResult.testName')} *</label>
              <input style={manualInputStyle} value={form.testName} onChange={e => setF('testName', e.target.value)} onBlur={e => applyTemplateIfBlank(e.target.value)} />
            </div>
            <div>
              <label style={manualLbl}>{t('labResult.testCode')}</label>
              <input style={manualInputStyle} value={form.testCode} onChange={e => setF('testCode', e.target.value)} />
            </div>
            <div>
              <label style={manualLbl}>{t('labResult.departmentName')}</label>
              <input style={manualInputStyle} value={form.departmentName} onChange={e => setF('departmentName', e.target.value)} />
            </div>
            <div>
              <label style={manualLbl}>{t('labResult.sampleDate')}</label>
              <input type="date" style={manualInputStyle} value={form.sampleDate} onChange={e => setF('sampleDate', e.target.value)} />
            </div>
            <div>
              <label style={manualLbl}>{t('labResult.resultDate')}</label>
              <input type="date" style={manualInputStyle} value={form.resultDate} onChange={e => setF('resultDate', e.target.value)} />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={manualLbl}>{t('labResult.doctorName')}</label>
              <input style={manualInputStyle} value={form.doctorName} onChange={e => setF('doctorName', e.target.value)} />
            </div>
          </div>

          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>{t('labResult.parameterName')}</span>
            <button onClick={addItem} style={{ border: '1px dashed #cbd5e1', background: 'white', color: TEAL, borderRadius: 8, padding: '5px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>
              {t('labResult.addParameter')}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {form.resultItems.map((item, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.7fr 0.55fr 0.8fr 0.7fr 1fr 28px', gap: 6, alignItems: 'center' }}>
                <input placeholder={t('labResult.parameterName')} style={manualInputStyle} value={item.parameterName} onChange={e => setItem(i, 'parameterName', e.target.value)} />
                <input placeholder={t('labResult.value')} style={manualInputStyle} value={item.value} onChange={e => setItem(i, 'value', e.target.value)} />
                <input placeholder={t('labResult.unit')} style={manualInputStyle} value={item.unit} onChange={e => setItem(i, 'unit', e.target.value)} />
                <input placeholder={t('labResult.referenceRange')} style={manualInputStyle} value={item.referenceRange} onChange={e => setItem(i, 'referenceRange', e.target.value)} />
                <select style={manualInputStyle} value={item.status} onChange={e => setItem(i, 'status', e.target.value)}>
                  {Object.entries(MANUAL_FLAG_CFG).map(([v, cfg]) => <option key={v} value={v}>{t(`labResult.${cfg.label}`)}</option>)}
                </select>
                <input placeholder={t('labResult.itemNote')} style={manualInputStyle} value={item.note} onChange={e => setItem(i, 'note', e.target.value)} />
                {form.resultItems.length > 1 && (
                  <button onClick={() => removeItem(i)} style={{ width: 28, height: 28, border: 'none', borderRadius: 8, background: '#fef2f2', color: '#ef4444', cursor: 'pointer', fontSize: 16 }}>×</button>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 14 }}>
            <label style={manualLbl}>{t('labResult.generalConclusion')}</label>
            <textarea rows={3} style={{ ...manualInputStyle, resize: 'vertical' }} value={form.generalConclusion} onChange={e => setF('generalConclusion', e.target.value)} />
          </div>

          <div style={{ marginTop: 14 }}>
            <label style={manualLbl}>{t('labResult.internalNote')}</label>
            <p style={{ margin: '0 0 6px', fontSize: 11, color: '#94a3b8' }}>{t('labResult.internalNoteHint')}</p>
            <textarea rows={2} style={{ ...manualInputStyle, resize: 'vertical' }} value={form.internalNote} onChange={e => setF('internalNote', e.target.value)} />
          </div>

          {meta && (
            <div style={{ marginTop: 12, fontSize: 11.5, color: '#94a3b8' }}>
              {meta.enteredByName && <span>{t('labResult.enteredBy')}: <strong>{meta.enteredByName}</strong></span>}
              {meta.completedAt && <span style={{ marginLeft: 14 }}>{t('labResult.completedAt')}: <strong>{new Date(meta.completedAt).toLocaleDateString('az-AZ')}</strong></span>}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
            <button onClick={() => submit('draft')} disabled={saving}
              style={{ padding: '9px 16px', border: '1px solid #e2e8f0', borderRadius: 9, background: 'white', color: '#475569', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: FONT }}>
              {saving ? t('labResult.saving') : t('labResult.saveDraft')}
            </button>
            <button onClick={() => submit('completed')} disabled={saving}
              style={{ padding: '9px 20px', border: 'none', borderRadius: 9, background: TEAL, color: 'white', fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: FONT }}>
              {saving ? t('labResult.saving') : t('labResult.markCompleted')}
            </button>
          </div>
        </div>
      )}

      {/* List of manually created results */}
      <div style={{ marginTop: 18, borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
        {loadingList ? (
          <div style={{ textAlign: 'center', padding: 20, color: '#94a3b8', fontSize: 13 }}>Yüklənir...</div>
        ) : results.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 20, color: '#94a3b8', fontSize: 13 }}>{t('labResult.noResults')}</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {[t('labResult.protocolNo'), t('labResult.patient'), t('labResult.testName'), t('labResult.resultDate'), t('labResult.status'), ''].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map(r => {
                  const sc = MANUAL_STATUS_CFG[r.status] || MANUAL_STATUS_CFG.draft
                  return (
                    <tr key={r._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700, color: TEAL }}>{r.protocolNo}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: '#334155' }}>{r.patientFullName}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: '#64748b' }}>{r.testName}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: '#64748b' }}>{r.resultDate ? new Date(r.resultDate).toLocaleDateString('az-AZ') : '—'}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: sc.bg, color: sc.color }}>{t(`labResult.${sc.label}`)}</span>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {['draft', 'completed', 'approved'].includes(r.status) && (
                            <button onClick={() => openEdit(r._id)}
                              style={{ padding: '4px 9px', border: `1px solid ${TEAL}`, borderRadius: 7, background: 'white', color: TEAL, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                              {t('labResult.fillIn')}
                            </button>
                          )}
                          {['draft', 'completed'].includes(r.status) && (
                            <button onClick={() => cancelResult(r._id)}
                              style={{ padding: '4px 9px', border: '1px solid #fee2e2', borderRadius: 7, background: 'white', color: '#ef4444', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                              {t('labResult.cancel')}
                            </button>
                          )}
                          <button onClick={() => downloadPdf(r._id)}
                            style={{ padding: '4px 9px', border: '1px solid #e2e8f0', borderRadius: 7, background: 'white', color: '#475569', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                            {t('labResult.downloadPdf')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

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

        {/* Manual / standalone certified results */}
        <ManualResultPanel />

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
