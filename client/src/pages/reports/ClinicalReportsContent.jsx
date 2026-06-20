import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../api/axios'

const card = { background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', padding: '16px 18px' }
const inputStyle = { height: 38, border: '1px solid #e2e8f0', borderRadius: 8, padding: '0 12px', fontSize: 13, color: '#0f172a', background: '#fff', outline: 'none', boxSizing: 'border-box' }
const thStyle = { padding: '10px 14px', fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }
const tdStyle = { padding: '11px 14px', fontSize: 13, color: '#334155', borderBottom: '1px solid #f8fafc' }

const TABS = ['appointments', 'lab', 'documents', 'doctors', 'departments']

const emptyFilters = { dateFrom: '', dateTo: '', status: '' }

function Card({ label, value }) {
  return (
    <div style={card}>
      <div style={{ fontSize: 12, color: '#64748b' }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginTop: 4 }}>{value}</div>
    </div>
  )
}

export default function ClinicalReportsContent() {
  const { t } = useTranslation()
  const [filters, setFilters] = useState(emptyFilters)
  const [applied, setApplied] = useState(emptyFilters)
  const [tab, setTab] = useState('appointments')

  const [summary, setSummary] = useState(null)
  const [tabData, setTabData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v }))
  const applyFilters = (e) => { e.preventDefault(); setApplied(filters) }
  const clearFilters = () => { setFilters(emptyFilters); setApplied(emptyFilters) }

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    const params = {}
    if (applied.dateFrom) params.dateFrom = applied.dateFrom
    if (applied.dateTo)   params.dateTo   = applied.dateTo
    if (applied.status)   params.status   = applied.status

    Promise.all([
      api.get('/reports/clinical/summary', { params }),
      api.get(`/reports/clinical/${tab}`, { params }),
    ])
      .then(([s, d]) => {
        setSummary(s.data?.data || null)
        setTabData(d.data?.data || null)
      })
      .catch((err) => {
        setSummary(null)
        setTabData(null)
        setError(err.response?.data?.message || t('clinicalReports.loadError'))
      })
      .finally(() => setLoading(false))
  }, [applied, tab, t])

  useEffect(() => { load() }, [load])

  const noData = !loading && !error && (
    !tabData || (
      (!tabData.byStatus || tabData.byStatus.length === 0) &&
      (!tabData.byDoctor || tabData.byDoctor.length === 0) &&
      (!tabData.items || tabData.items.length === 0)
    )
  )

  return (
    <div>
      <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: '#0f172a' }}>{t('clinicalReports.title')}</h1>
      <p style={{ margin: '0 0 20px', fontSize: 13, color: '#94a3b8' }}>{t('clinicalReports.subtitle')}</p>

      <form onSubmit={applyFilters} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 16, padding: 16, marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, alignItems: 'end' }}>
          <input type="date" value={filters.dateFrom} onChange={e => setFilter('dateFrom', e.target.value)} aria-label={t('clinicalReports.dateRange')} style={inputStyle} />
          <input type="date" value={filters.dateTo} onChange={e => setFilter('dateTo', e.target.value)} aria-label={t('clinicalReports.dateRange')} style={inputStyle} />
          <input value={filters.status} onChange={e => setFilter('status', e.target.value)} placeholder={t('clinicalReports.status')} style={inputStyle} />
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

      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginBottom: 20 }}>
          <Card label={t('clinicalReports.appointmentReport')} value={summary.totalAppointments} />
          <Card label={t('adminAppointments.status.completed')} value={summary.completed} />
          <Card label={t('adminAppointments.status.cancelled')} value={summary.cancelled} />
          <Card label={t('adminAppointments.status.missed')} value={summary.missed} />
          <Card label={t('clinicalReports.documentApprovalReport')} value={summary.pendingDocuments} />
          <Card label={t('chiefDoctor.labHours')} value={summary.averageLabApprovalHours} />
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {TABS.map(key => (
          <button key={key} onClick={() => setTab(key)}
            style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid', background: tab === key ? '#00848e' : 'white', color: tab === key ? 'white' : '#475569', borderColor: tab === key ? '#00848e' : '#e2e8f0' }}>
            {t(`clinicalReports.tabs.${key}`)}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: '12px 14px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fee2e2', color: '#dc2626', fontSize: 13 }}>{error}</div>
      )}

      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>{t('errorLogs.loading')}</div>
        ) : noData ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>{t('clinicalReports.noData')}</div>
        ) : tab === 'appointments' ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: 600, borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: '#f8fafc' }}><th style={thStyle}>{t('clinicalReports.status')}</th><th style={thStyle}>Count</th></tr></thead>
              <tbody>{(tabData.byStatus || []).map(r => <tr key={r._id}><td style={tdStyle}>{r._id}</td><td style={tdStyle}>{r.count}</td></tr>)}</tbody>
            </table>
            <table style={{ width: '100%', minWidth: 600, borderCollapse: 'collapse', marginTop: 4 }}>
              <thead><tr style={{ background: '#f8fafc' }}><th style={thStyle}>{t('clinicalReports.doctor')}</th><th style={thStyle}>Total</th><th style={thStyle}>{t('adminAppointments.status.completed')}</th></tr></thead>
              <tbody>{(tabData.byDoctor || []).map(r => <tr key={r._id}><td style={tdStyle}>{r.doctor?.userId?.fullName || '-'}</td><td style={tdStyle}>{r.total}</td><td style={tdStyle}>{r.completed}</td></tr>)}</tbody>
            </table>
          </div>
        ) : tab === 'lab' ? (
          <div style={{ overflowX: 'auto' }}>
            <div style={{ padding: '10px 14px', fontSize: 12, color: '#64748b' }}>{t('chiefDoctor.labHours')}: {tabData.averageApprovalHours}</div>
            <table style={{ width: '100%', minWidth: 400, borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: '#f8fafc' }}><th style={thStyle}>{t('clinicalReports.status')}</th><th style={thStyle}>Count</th></tr></thead>
              <tbody>{(tabData.byStatus || []).map(r => <tr key={r._id}><td style={tdStyle}>{r._id}</td><td style={tdStyle}>{r.count}</td></tr>)}</tbody>
            </table>
          </div>
        ) : tab === 'documents' ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: 500, borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: '#f8fafc' }}><th style={thStyle}>{t('clinicalReports.status')}</th><th style={thStyle}>EHR</th><th style={thStyle}>Discharge</th><th style={thStyle}>Certificate</th><th style={thStyle}>Total</th></tr></thead>
              <tbody>{(tabData.byStatus || []).map(r => <tr key={r.status}><td style={tdStyle}>{r.status}</td><td style={tdStyle}>{r.ehr}</td><td style={tdStyle}>{r.discharge}</td><td style={tdStyle}>{r.certificate}</td><td style={tdStyle}>{r.total}</td></tr>)}</tbody>
            </table>
          </div>
        ) : tab === 'doctors' ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: 600, borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: '#f8fafc' }}><th style={thStyle}>{t('clinicalReports.doctor')}</th><th style={thStyle}>Total</th><th style={thStyle}>{t('adminAppointments.status.completed')}</th><th style={thStyle}>%</th></tr></thead>
              <tbody>{(tabData.items || []).map(r => <tr key={r._id}><td style={tdStyle}>{r.doctor?.userId?.fullName || '-'}</td><td style={tdStyle}>{r.total}</td><td style={tdStyle}>{r.completed}</td><td style={tdStyle}>{r.completionRate}%</td></tr>)}</tbody>
            </table>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: 600, borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: '#f8fafc' }}><th style={thStyle}>{t('clinicalReports.department')}</th><th style={thStyle}>Total</th><th style={thStyle}>{t('adminAppointments.status.completed')}</th><th style={thStyle}>Doctors</th></tr></thead>
              <tbody>{(tabData.items || []).map(r => <tr key={r.departmentId || r.departmentName}><td style={tdStyle}>{r.departmentName}</td><td style={tdStyle}>{r.total}</td><td style={tdStyle}>{r.completed}</td><td style={tdStyle}>{r.activeDoctors}</td></tr>)}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
