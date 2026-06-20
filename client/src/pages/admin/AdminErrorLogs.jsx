import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import AdminLayout from '../../components/admin/AdminLayout'
import api from '../../api/axios'

const PAGE_SIZE = 20

const emptyFilters = {
  startDate: '',
  endDate: '',
  level: '',
  statusCode: '',
  path: '',
}

const thStyle = {
  padding: '12px 16px',
  fontSize: 11,
  fontWeight: 600,
  color: '#94a3b8',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  textAlign: 'left',
}

const tdStyle = {
  padding: '14px 16px',
  fontSize: 13,
  color: '#334155',
  borderBottom: '1px solid #f8fafc',
  verticalAlign: 'top',
}

const inputStyle = {
  height: 38,
  border: '1px solid #e2e8f0',
  borderRadius: 8,
  padding: '0 12px',
  fontSize: 13,
  color: '#0f172a',
  background: '#fff',
  outline: 'none',
  boxSizing: 'border-box',
}

const getUserName = (log) => {
  const user = log?.userId
  if (!user) return '-'
  return user.fullName || user.email || '-'
}

const formatDate = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return date.toLocaleString('az-AZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const buildParams = (filters, page) => {
  const params = { page, limit: PAGE_SIZE }
  Object.entries(filters).forEach(([key, value]) => {
    const clean = String(value || '').trim()
    if (clean) params[key] = clean
  })
  return params
}

export default function AdminErrorLogs() {
  const { t } = useTranslation()
  const [logs, setLogs] = useState([])
  const [filters, setFilters] = useState(emptyFilters)
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [detail, setDetail] = useState(null)

  const params = useMemo(() => buildParams(appliedFilters, page), [appliedFilters, page])
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  useEffect(() => {
    let cancelled = false

    setLoading(true)
    setError('')

    api.get('/error-logs', { params })
      .then(({ data }) => {
        if (cancelled) return
        const payload = data?.data || {}
        const list = Array.isArray(payload.logs) ? payload.logs : []
        setLogs(list)
        setTotal(Number(payload.total || list.length || 0))
      })
      .catch((err) => {
        if (cancelled) return
        setLogs([])
        setTotal(0)
        setError(err.response?.data?.message || t('errorLogs.loadError'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [params, t])

  const setFilter = (key, value) => setFilters(prev => ({ ...prev, [key]: value }))

  const applyFilters = (event) => {
    event.preventDefault()
    setPage(1)
    setAppliedFilters(filters)
  }

  const clearFilters = () => {
    setFilters(emptyFilters)
    setAppliedFilters(emptyFilters)
    setPage(1)
  }

  return (
    <AdminLayout activePage="error-logs">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' }}>{t('errorLogs.title')}</h1>
          <p style={{ margin: '2px 0 0', fontSize: 13, color: '#94a3b8' }}>{t('errorLogs.subtitle')}</p>
        </div>
      </div>

      <form onSubmit={applyFilters} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 16, padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, alignItems: 'end' }}>
          <input type="date" value={filters.startDate} onChange={e => setFilter('startDate', e.target.value)} aria-label={t('errorLogs.startDate')} style={inputStyle} />
          <input type="date" value={filters.endDate} onChange={e => setFilter('endDate', e.target.value)} aria-label={t('errorLogs.endDate')} style={inputStyle} />
          <select value={filters.level} onChange={e => setFilter('level', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
            <option value="">{t('errorLogs.level')}</option>
            <option value="error">error</option>
            <option value="warn">warn</option>
          </select>
          <input value={filters.statusCode} onChange={e => setFilter('statusCode', e.target.value)} placeholder={t('errorLogs.statusCode')} style={inputStyle} />
          <input value={filters.path} onChange={e => setFilter('path', e.target.value)} placeholder={t('errorLogs.path')} style={inputStyle} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" style={{ height: 38, padding: '0 16px', borderRadius: 8, border: 'none', background: '#00848e', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              {t('errorLogs.filter')}
            </button>
            <button type="button" onClick={clearFilters} style={{ height: 38, padding: '0 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
              {t('errorLogs.clear')}
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div style={{ marginBottom: 16, padding: '12px 14px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fee2e2', color: '#dc2626', fontSize: 13 }}>
          {error}
        </div>
      )}

      <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', width: '100%', border: '1px solid #e2e8f0' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>{t('errorLogs.loading')}</div>
        ) : logs.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>{t('errorLogs.empty')}</div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: 900, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={thStyle}>{t('errorLogs.date')}</th>
                    <th style={thStyle}>{t('errorLogs.level')}</th>
                    <th style={thStyle}>{t('errorLogs.statusCode')}</th>
                    <th style={thStyle}>{t('errorLogs.method')}</th>
                    <th style={thStyle}>{t('errorLogs.path')}</th>
                    <th style={thStyle}>{t('errorLogs.user')}</th>
                    <th style={thStyle}></th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr
                      key={log._id}
                      onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>{formatDate(log.createdAt)}</td>
                      <td style={tdStyle}>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: log.level === 'warn' ? '#fff7ed' : '#fef2f2', color: log.level === 'warn' ? '#c2410c' : '#dc2626' }}>
                          {log.level || 'error'}
                        </span>
                      </td>
                      <td style={tdStyle}>{log.statusCode || '-'}</td>
                      <td style={tdStyle}>{log.method || '-'}</td>
                      <td style={{ ...tdStyle, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.path || '-'}</td>
                      <td style={tdStyle}>{getUserName(log)}</td>
                      <td style={tdStyle}>
                        <button
                          type="button"
                          onClick={() => setDetail(log)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#00848e', fontSize: 12, fontWeight: 600, padding: 0 }}
                        >
                          {t('errorLogs.viewDetails')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 16px', borderTop: '1px solid #f1f5f9', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>{total}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid #e2e8f0', background: page <= 1 ? '#f8fafc' : 'white', color: page <= 1 ? '#cbd5e1' : '#334155', cursor: page <= 1 ? 'not-allowed' : 'pointer', fontSize: 16 }}
                >‹</button>
                <span style={{ fontSize: 12, color: '#64748b', minWidth: 92, textAlign: 'center' }}>{page} / {totalPages}</span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                  style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid #e2e8f0', background: page >= totalPages ? '#f8fafc' : 'white', color: page >= totalPages ? '#cbd5e1' : '#334155', cursor: page >= totalPages ? 'not-allowed' : 'pointer', fontSize: 16 }}
                >›</button>
              </div>
            </div>
          </>
        )}
      </div>

      {detail && (
        <div
          role="dialog" aria-modal="true"
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget) setDetail(null) }}
        >
          <div style={{ background: 'white', borderRadius: 14, width: 480, maxWidth: '100%', padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{t('errorLogs.viewDetails')}</h3>
              <button onClick={() => setDetail(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 20 }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
              <div><strong>{t('errorLogs.date')}:</strong> {formatDate(detail.createdAt)}</div>
              <div><strong>{t('errorLogs.level')}:</strong> {detail.level}</div>
              <div><strong>{t('errorLogs.statusCode')}:</strong> {detail.statusCode || '-'}</div>
              <div><strong>{t('errorLogs.method')}:</strong> {detail.method || '-'}</div>
              <div><strong>{t('errorLogs.path')}:</strong> {detail.path || '-'}</div>
              <div><strong>{t('errorLogs.user')}:</strong> {getUserName(detail)} {detail.role ? `(${detail.role})` : ''}</div>
              <div style={{ wordBreak: 'break-word' }}><strong>{t('errorLogs.message')}:</strong> {detail.message}</div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
