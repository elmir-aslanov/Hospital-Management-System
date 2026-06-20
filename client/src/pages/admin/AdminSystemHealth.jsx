import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import AdminLayout from '../../components/admin/AdminLayout'
import api from '../../api/axios'

const STATUS_COLOR = {
  healthy: { bg: '#f0fdf4', color: '#16a34a', dot: '#16a34a' },
  warning: { bg: '#fff7ed', color: '#c2410c', dot: '#ea580c' },
  error:   { bg: '#fef2f2', color: '#dc2626', dot: '#dc2626' },
  disabled:{ bg: '#f8fafc', color: '#64748b', dot: '#94a3b8' },
}

const card = { background: 'white', borderRadius: 14, border: '1px solid #f1f5f9', padding: '18px 20px' }

const formatUptime = (seconds) => {
  if (!Number.isFinite(seconds)) return '-'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${h}h ${m}m`
}

const formatDate = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function StatusBadge({ status, label }) {
  const s = STATUS_COLOR[status] || STATUS_COLOR.disabled
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: s.bg, color: s.color }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.dot }} />
      {label}
    </span>
  )
}

export default function AdminSystemHealth() {
  const { t } = useTranslation()
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastChecked, setLastChecked] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    api.get('/admin/health')
      .then(({ data }) => {
        setHealth(data?.data || null)
        setLastChecked(new Date())
      })
      .catch((err) => {
        setHealth(null)
        setError(err.response?.data?.message || t('systemHealth.loadError'))
      })
      .finally(() => setLoading(false))
  }, [t])

  useEffect(() => { load() }, [load])

  const statusLabel = (status) => t(`systemHealth.statuses.${status}`, status)

  const components = health ? [
    { key: 'api',      label: t('systemHealth.apiStatus'),   status: health.api?.status },
    { key: 'database', label: t('systemHealth.database'),    status: health.database?.status, extra: health.database?.state },
    { key: 'socket',   label: t('systemHealth.socketStatus'),status: health.socket?.status, extra: health.socket?.state },
    { key: 'mail',     label: t('systemHealth.mailService'), status: health.mail?.status, extra: health.mail?.configured ? t('systemHealth.statuses.healthy') : t('systemHealth.statuses.warning') },
    { key: 'queue',    label: 'BullMQ/Redis', status: health.queue?.status, extra: health.queue?.state },
  ] : []

  return (
    <AdminLayout activePage="system-health">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' }}>{t('systemHealth.title')}</h1>
          <p style={{ margin: '2px 0 0', fontSize: 13, color: '#94a3b8' }}>
            {lastChecked ? `${t('systemHealth.lastChecked')}: ${formatDate(lastChecked)}` : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          style={{ height: 38, padding: '0 16px', borderRadius: 8, border: 'none', background: '#00848e', color: 'white', fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
        >
          {t('systemHealth.refresh')}
        </button>
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: '12px 14px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fee2e2', color: '#dc2626', fontSize: 13 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ ...card, textAlign: 'center', color: '#94a3b8', padding: 48 }}>{t('systemHealth.loading')}</div>
      ) : !health ? (
        <div style={{ ...card, textAlign: 'center', color: '#94a3b8', padding: 48 }}>{t('systemHealth.empty')}</div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14, marginBottom: 20 }}>
            {components.map(c => (
              <div key={c.key} style={card}>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>{c.label}</div>
                <StatusBadge status={c.status} label={statusLabel(c.status)} />
                {c.extra && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>{c.extra}</div>}
              </div>
            ))}
            <div style={card}>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>{t('systemHealth.uptime')}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{formatUptime(health.uptimeSeconds)}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>{health.environment}</div>
            </div>
          </div>

          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
              {t('errorLogs.title')}
            </div>
            {(health.recentErrors || []).length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>{t('errorLogs.empty')}</div>
            ) : (
              <div>
                {health.recentErrors.map(e => (
                  <div key={e._id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 20px', borderBottom: '1px solid #f8fafc', fontSize: 13 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{e.statusCode} · {e.method} {e.path}</div>
                      <div style={{ fontSize: 12, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.message}</div>
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap' }}>{formatDate(e.createdAt)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </AdminLayout>
  )
}
