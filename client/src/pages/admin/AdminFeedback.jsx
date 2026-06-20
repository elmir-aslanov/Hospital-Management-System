import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import AdminLayout from '../../components/admin/AdminLayout'
import api from '../../api/axios'

const PAGE_SIZE = 20
const emptyFilters = { status: '', category: '', priority: '' }

const STATUS_COLOR = {
  new:        { bg: '#eff6ff', color: '#2563eb' },
  in_review:  { bg: '#fff7ed', color: '#c2410c' },
  resolved:   { bg: '#f0fdf4', color: '#16a34a' },
  rejected:   { bg: '#fef2f2', color: '#dc2626' },
  closed:     { bg: '#f1f5f9', color: '#475569' },
}
const PRIORITY_COLOR = { low: '#64748b', medium: '#ca8a04', high: '#dc2626' }

const thStyle = { padding: '12px 16px', fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }
const tdStyle = { padding: '14px 16px', fontSize: 13, color: '#334155', borderBottom: '1px solid #f8fafc', verticalAlign: 'top' }
const inputStyle = { height: 38, border: '1px solid #e2e8f0', borderRadius: 8, padding: '0 12px', fontSize: 13, color: '#0f172a', background: '#fff', outline: 'none', boxSizing: 'border-box' }

const formatDate = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function AdminFeedback() {
  const { t } = useTranslation()
  const [items, setItems] = useState([])
  const [filters, setFilters] = useState(emptyFilters)
  const [applied, setApplied] = useState(emptyFilters)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [detail, setDetail] = useState(null)
  const [responseText, setResponseText] = useState('')
  const [statusEdit, setStatusEdit] = useState('')
  const [saving, setSaving] = useState(false)

  const params = useMemo(() => {
    const p = { page, limit: PAGE_SIZE }
    Object.entries(applied).forEach(([k, v]) => { if (v) p[k] = v })
    return p
  }, [applied, page])

  const load = () => {
    setLoading(true)
    setError('')
    api.get('/feedback', { params })
      .then(({ data }) => {
        const payload = data?.data || {}
        setItems(Array.isArray(payload.items) ? payload.items : [])
        setTotal(Number(payload.total || 0))
      })
      .catch((err) => {
        setItems([])
        setTotal(0)
        setError(err.response?.data?.message || t('feedback.loadError'))
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [params]) // eslint-disable-line react-hooks/exhaustive-deps

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v }))
  const applyFilters = (e) => { e.preventDefault(); setPage(1); setApplied(filters) }
  const clearFilters = () => { setFilters(emptyFilters); setApplied(emptyFilters); setPage(1) }

  const openDetail = (item) => {
    setDetail(item)
    setResponseText(item.adminResponse || '')
    setStatusEdit(item.status)
  }

  const saveResponse = async () => {
    if (!detail) return
    setSaving(true)
    try {
      await api.patch(`/feedback/${detail._id}`, { status: statusEdit, adminResponse: responseText })
      setDetail(null)
      load()
    } catch (err) {
      alert(err.response?.data?.message || t('feedback.loadError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout activePage="feedback">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' }}>{t('feedback.title')}</h1>
          <p style={{ margin: '2px 0 0', fontSize: 13, color: '#94a3b8' }}>{t('feedback.subtitle')}</p>
        </div>
      </div>

      <form onSubmit={applyFilters} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 16, padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, alignItems: 'end' }}>
          <select value={filters.status} onChange={e => setFilter('status', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
            <option value="">{t('feedback.status')}</option>
            {['new', 'in_review', 'resolved', 'rejected', 'closed'].map(s => <option key={s} value={s}>{t(`feedback.statuses.${s}`)}</option>)}
          </select>
          <select value={filters.category} onChange={e => setFilter('category', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
            <option value="">{t('feedback.category')}</option>
            {['feedback', 'complaint', 'suggestion', 'service_quality', 'doctor_related', 'lab_related', 'billing_related'].map(c => <option key={c} value={c}>{t(`feedback.categories.${c}`)}</option>)}
          </select>
          <select value={filters.priority} onChange={e => setFilter('priority', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
            <option value="">{t('feedback.priority')}</option>
            {['low', 'medium', 'high'].map(p => <option key={p} value={p}>{t(`feedback.priorities.${p}`)}</option>)}
          </select>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" style={{ height: 38, padding: '0 16px', borderRadius: 8, border: 'none', background: '#00848e', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{t('errorLogs.filter')}</button>
            <button type="button" onClick={clearFilters} style={{ height: 38, padding: '0 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>{t('errorLogs.clear')}</button>
          </div>
        </div>
      </form>

      {error && <div style={{ marginBottom: 16, padding: '12px 14px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fee2e2', color: '#dc2626', fontSize: 13 }}>{error}</div>}

      <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', width: '100%', border: '1px solid #e2e8f0' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>{t('errorLogs.loading')}</div>
        ) : items.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>{t('feedback.noFeedbackFound')}</div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: 900, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={thStyle}>{t('errorLogs.date')}</th>
                    <th style={thStyle}>{t('feedback.category')}</th>
                    <th style={thStyle}>{t('feedback.priority')}</th>
                    <th style={thStyle}>{t('feedback.status')}</th>
                    <th style={thStyle}>{t('errorLogs.user')}</th>
                    <th style={thStyle}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => {
                    const sc = STATUS_COLOR[item.status] || STATUS_COLOR.new
                    return (
                      <tr key={item._id}>
                        <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>{formatDate(item.createdAt)}</td>
                        <td style={tdStyle}>{t(`feedback.categories.${item.category}`)}</td>
                        <td style={{ ...tdStyle, color: PRIORITY_COLOR[item.priority], fontWeight: 600 }}>{t(`feedback.priorities.${item.priority}`)}</td>
                        <td style={tdStyle}><span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: sc.bg, color: sc.color }}>{t(`feedback.statuses.${item.status}`)}</span></td>
                        <td style={tdStyle}>{item.isAnonymous ? '—' : (item.userId?.fullName || '-')}</td>
                        <td style={tdStyle}>
                          <button type="button" onClick={() => openDetail(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#00848e', fontSize: 12, fontWeight: 600, padding: 0 }}>
                            {t('errorLogs.viewDetails')}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 16px', borderTop: '1px solid #f1f5f9', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>{total}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button type="button" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid #e2e8f0', background: page <= 1 ? '#f8fafc' : 'white', color: page <= 1 ? '#cbd5e1' : '#334155', cursor: page <= 1 ? 'not-allowed' : 'pointer', fontSize: 16 }}>‹</button>
                <span style={{ fontSize: 12, color: '#64748b', minWidth: 92, textAlign: 'center' }}>{page} / {totalPages}</span>
                <button type="button" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid #e2e8f0', background: page >= totalPages ? '#f8fafc' : 'white', color: page >= totalPages ? '#cbd5e1' : '#334155', cursor: page >= totalPages ? 'not-allowed' : 'pointer', fontSize: 16 }}>›</button>
              </div>
            </div>
          </>
        )}
      </div>

      {detail && (
        <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget) setDetail(null) }}>
          <div style={{ background: 'white', borderRadius: 14, width: 520, maxWidth: '100%', padding: 22, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{detail.subject}</h3>
              <button onClick={() => setDetail(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 20 }}>×</button>
            </div>
            <div style={{ fontSize: 13, color: '#334155', marginBottom: 14, whiteSpace: 'pre-wrap' }}>{detail.message}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 14 }}>
              {detail.isAnonymous ? t('feedback.anonymous') : (detail.userId?.fullName || '-')} · {formatDate(detail.createdAt)}
            </div>

            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>{t('feedback.status')}</label>
            <select value={statusEdit} onChange={e => setStatusEdit(e.target.value)} style={{ ...inputStyle, width: '100%', marginBottom: 14, cursor: 'pointer' }}>
              {['new', 'in_review', 'resolved', 'rejected', 'closed'].map(s => <option key={s} value={s}>{t(`feedback.statuses.${s}`)}</option>)}
            </select>

            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>{t('feedback.adminResponse')}</label>
            <textarea rows={4} value={responseText} onChange={e => setResponseText(e.target.value)} style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 8, padding: '9px 12px', fontSize: 13, resize: 'vertical', boxSizing: 'border-box', marginBottom: 14 }} />

            <button onClick={saveResponse} disabled={saving} style={{ width: '100%', height: 40, borderRadius: 9, border: 'none', background: '#00848e', color: 'white', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? t('errorLogs.loading') : t('feedback.save')}
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
