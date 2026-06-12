import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import api from '../../api/axios'

const PAGE_SIZE = 20

const emptyFilters = {
  startDate: '',
  endDate: '',
  userId: '',
  action: '',
  resourceType: '',
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

const getUserRole = (log) => log?.userId?.role || '-'

const getStatus = (log) => {
  const status = log?.status || log?.metadata?.status || log?.metadata?.statusCode || log?.metadata?.success
  if (status === true) return 'Success'
  if (status === false) return 'Failed'
  return status || '-'
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
  const params = {
    page,
    limit: PAGE_SIZE,
  }

  Object.entries(filters).forEach(([key, value]) => {
    const clean = String(value || '').trim()
    if (clean) params[key] = clean
  })

  return params
}

export default function AdminAuditLog() {
  const [logs, setLogs] = useState([])
  const [filters, setFilters] = useState(emptyFilters)
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const params = useMemo(() => buildParams(appliedFilters, page), [appliedFilters, page])
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  useEffect(() => {
    let cancelled = false

    setLoading(true)
    setError('')

    api.get('/audit', { params })
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
        setError(err.response?.data?.message || 'Audit log məlumatları yüklənmədi.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [params])

  const setFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

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
    <AdminLayout activePage="audit-log">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Audit Log</h1>
          <p style={{ margin: '2px 0 0', fontSize: 13, color: '#94a3b8' }}>Sistem fəaliyyətlərinin izlənməsi</p>
        </div>
      </div>

      <form onSubmit={applyFilters} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 16, padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, alignItems: 'end' }}>
          <input
            type="date"
            value={filters.startDate}
            onChange={e => setFilter('startDate', e.target.value)}
            aria-label="Başlanğıc tarix"
            style={inputStyle}
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={e => setFilter('endDate', e.target.value)}
            aria-label="Son tarix"
            style={inputStyle}
          />
          <input
            value={filters.userId}
            onChange={e => setFilter('userId', e.target.value)}
            placeholder="User ID"
            style={inputStyle}
          />
          <input
            value={filters.action}
            onChange={e => setFilter('action', e.target.value)}
            placeholder="Əməliyyat"
            style={inputStyle}
          />
          <input
            value={filters.resourceType}
            onChange={e => setFilter('resourceType', e.target.value)}
            placeholder="Modul"
            style={inputStyle}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="submit"
              style={{ height: 38, padding: '0 16px', borderRadius: 8, border: 'none', background: '#00848e', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              Filtrlə
            </button>
            <button
              type="button"
              onClick={clearFilters}
              style={{ height: 38, padding: '0 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
            >
              Sıfırla
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
          <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>Yüklənir...</div>
        ) : logs.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>Audit log məlumatları tapılmadı.</div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: 940, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={thStyle}>Tarix</th>
                    <th style={thStyle}>İstifadəçi</th>
                    <th style={thStyle}>Rol</th>
                    <th style={thStyle}>Əməliyyat</th>
                    <th style={thStyle}>Modul</th>
                    <th style={thStyle}>IP</th>
                    <th style={thStyle}>Status</th>
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
                        <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>{getUserName(log)}</div>
                        {log.userId?.email && <div style={{ marginTop: 2, fontSize: 11, color: '#94a3b8' }}>{log.userId.email}</div>}
                      </td>
                      <td style={tdStyle}>{getUserRole(log)}</td>
                      <td style={tdStyle}>{log.action || '-'}</td>
                      <td style={tdStyle}>{log.resourceType || '-'}</td>
                      <td style={tdStyle}>{log.ipAddress || '-'}</td>
                      <td style={tdStyle}>{getStatus(log)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 16px', borderTop: '1px solid #f1f5f9', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>{total} qeyd</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid #e2e8f0', background: page <= 1 ? '#f8fafc' : 'white', color: page <= 1 ? '#cbd5e1' : '#334155', cursor: page <= 1 ? 'not-allowed' : 'pointer', fontSize: 16 }}
                >
                  ‹
                </button>
                <span style={{ fontSize: 12, color: '#64748b', minWidth: 92, textAlign: 'center' }}>Səhifə {page} / {totalPages}</span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                  style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid #e2e8f0', background: page >= totalPages ? '#f8fafc' : 'white', color: page >= totalPages ? '#cbd5e1' : '#334155', cursor: page >= totalPages ? 'not-allowed' : 'pointer', fontSize: 16 }}
                >
                  ›
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
