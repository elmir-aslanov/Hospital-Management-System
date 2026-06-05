import { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'

import { BASE } from '../../api/config.js'

const TEAL = '#1D8B95'
const NAVY = '#0B1D34'
const BORDER = '#E2E8F0'
const MUTED = '#64748B'
const LIGHT_MUTED = '#94A3B8'
const DONUT_CIRC = 2 * Math.PI * 55

const STATUS_AZ = {
  confirmed:   { label: 'Təsdiqləndi', color: TEAL },
  scheduled:   { label: 'Təsdiqləndi', color: TEAL },
  waiting:     { label: 'Gözləyir',    color: '#F59E0B' },
  pending:     { label: 'Gözləyir',    color: '#F59E0B' },
  in_progress: { label: 'İcrada',      color: '#3B82F6' },
  completed:   { label: 'Tamamlandı',  color: '#22C55E' },
  cancelled:   { label: 'Ləğv edildi', color: '#EF4444' },
  missed:      { label: 'Buraxıldı',   color: '#94A3B8' },
}

const DAY_AZ = {
  Sunday: 'Bazar', Monday: 'B.ertəsi', Tuesday: 'Ç.axş.',
  Wednesday: 'Çərş.', Thursday: 'C.axş.', Friday: 'Cümə', Saturday: 'Şənbə',
}

const RANGE_LABELS = [
  { value: '7',   label: '7 gün'  },
  { value: '30',  label: '30 gün' },
  { value: '90',  label: '90 gün' },
  { value: '365', label: '1 il'   },
]

const Empty = () => (
  <div className="analytics-empty">Məlumat yoxdur</div>
)

function MetricIcon({ type }) {
  const paths = {
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
    alert: <><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
    revenue: <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>,
    lab: <><path d="M9 3v6l-5 9a2 2 0 0 0 1.7 3h12.6A2 2 0 0 0 20 18l-5-9V3"/><path d="M8 3h8"/><path d="M7 15h10"/></>,
    chart: <><path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-7"/></>,
  }

  return <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">{paths[type] || paths.chart}</svg>
}

function HBar({ pct, color = TEAL }) {
  const width = Math.max(0, Math.min(100, pct || 0))
  return (
    <div className="analytics-progress">
      <div style={{ width: `${width}%`, background: color }} />
    </div>
  )
}

function labelForMonth(item, index) {
  return item.monthName || item.label || item.month || item._id || `${index + 1}`
}

function AreaChart({ data }) {
  if (!data.length) return <Empty />

  const width = 760
  const height = 260
  const pad = { top: 18, right: 22, bottom: 38, left: 42 }
  const innerW = width - pad.left - pad.right
  const innerH = height - pad.top - pad.bottom
  const max = Math.max(...data.map(item => item.count || 0), 1)
  const step = data.length > 1 ? innerW / (data.length - 1) : 0
  const points = data.map((item, index) => ({
    x: data.length === 1 ? pad.left + innerW / 2 : pad.left + index * step,
    y: pad.top + innerH - ((item.count || 0) / max) * innerH,
    count: item.count || 0,
    label: labelForMonth(item, index),
  }))
  const linePath = points.map((p, index) => `${index === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${pad.top + innerH} L ${points[0].x} ${pad.top + innerH} Z`
  const labelStep = Math.max(1, Math.ceil(points.length / 5))

  return (
    <svg className="analytics-area-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Aylıq pasiyent artımı">
      <defs>
        <linearGradient id="analyticsAreaFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={TEAL} stopOpacity="0.18" />
          <stop offset="100%" stopColor={TEAL} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map(mark => {
        const y = pad.top + innerH - mark * innerH
        return (
          <g key={mark}>
            <line x1={pad.left} y1={y} x2={width - pad.right} y2={y} stroke={BORDER} strokeWidth="1" opacity="0.8" />
            <text x={8} y={y + 4} fontSize="11" fill={LIGHT_MUTED}>{Math.round(max * mark)}</text>
          </g>
        )
      })}
      <path d={areaPath} fill="url(#analyticsAreaFill)" />
      <path d={linePath} fill="none" stroke={TEAL} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, index) => (
        <g key={index}>
          <circle cx={p.x} cy={p.y} r="5" fill="white" stroke={TEAL} strokeWidth="3" />
          {(index % labelStep === 0 || index === points.length - 1) && (
            <text x={p.x} y={height - 13} textAnchor="middle" fontSize="11" fill={LIGHT_MUTED}>
              {String(p.label).slice(0, 8)}
            </text>
          )}
        </g>
      ))}
    </svg>
  )
}

function DonutChart({ segments }) {
  const total = segments.reduce((sum, item) => sum + (item.count || 0), 0)
  if (!segments.length || total === 0) return <Empty />

  return (
    <div className="analytics-donut-wrap">
      <svg width="184" height="184" viewBox="0 0 184 184" role="img" aria-label="Randevu statusları">
        <circle cx="92" cy="92" r="55" fill="none" stroke="#F1F5F9" strokeWidth="22" />
        {segments.map((seg, index) => {
          const cfg = STATUS_AZ[seg._id] || { label: 'Digər', color: LIGHT_MUTED }
          const dashLen = ((seg.count || 0) / total) * DONUT_CIRC
          const currentOffset = segments
            .slice(0, index)
            .reduce((sum, item) => sum + (((item.count || 0) / total) * DONUT_CIRC), 0)
          return (
            <circle
              key={`${seg._id || 'other'}-${index}`}
              cx="92"
              cy="92"
              r="55"
              fill="none"
              stroke={cfg.color}
              strokeWidth="22"
              strokeDasharray={`${dashLen} ${DONUT_CIRC}`}
              strokeDashoffset={-currentOffset}
              strokeLinecap="round"
              transform="rotate(-90 92 92)"
            />
          )
        })}
        <text x="92" y="88" textAnchor="middle" fontSize="26" fontWeight="800" fill={NAVY}>{total}</text>
        <text x="92" y="107" textAnchor="middle" fontSize="12" fontWeight="600" fill={LIGHT_MUTED}>ümumi</text>
      </svg>
      <div className="analytics-donut-legend">
        {segments.map((seg, index) => {
          const cfg = STATUS_AZ[seg._id] || { label: 'Digər', color: LIGHT_MUTED }
          return (
            <div key={`${seg._id || 'other'}-${index}`} className="analytics-legend-row">
              <span><i style={{ background: cfg.color }} />{cfg.label}</span>
              <strong>{seg.count || 0}</strong>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function sumBillingStatus(rows, keys) {
  return rows.reduce((acc, row) => {
    if (!keys.includes(row._id)) return acc
    return {
      count: acc.count + (row.count || 0),
      total: acc.total + Number(row.total || 0),
    }
  }, { count: 0, total: 0 })
}

/* ═══════════════════════════════════════════════════════════════════ */
export default function AdminAnalitika() {
  const [loading,   setLoading]   = useState(true)
  const [apptData,  setApptData]  = useState(null)
  const [monthly,   setMonthly]   = useState([])
  const [billing,   setBilling]   = useState(null)
  const [labData,   setLabData]   = useState(null)
  const [dateRange, setDateRange] = useState('30')

  useEffect(() => {
    let ignore = false
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token')
    const headers = { Authorization: `Bearer ${token}` }
    const end = new Date().toISOString().split('T')[0]
    const start = new Date(Date.now() - parseInt(dateRange, 10) * 86400000).toISOString().split('T')[0]

    Promise.all([
      fetch(`${BASE}/api/v1/analytics/appointments?startDate=${start}&endDate=${end}`, { headers }).then(r => r.json()),
      fetch(`${BASE}/api/v1/analytics/patients/monthly`, { headers }).then(r => r.json()),
      fetch(`${BASE}/api/v1/billing/summary`,            { headers }).then(r => r.json()),
      fetch(`${BASE}/api/v1/lab/summary`,                { headers }).then(r => r.json()),
    ]).then(([a, m, b, l]) => {
      if (ignore) return
      setApptData(a.data || null)
      setMonthly(m.data  || [])
      setBilling(b.data  || null)
      setLabData(l.data  || null)
    }).catch(() => {}).finally(() => {
      if (!ignore) setLoading(false)
    })

    return () => { ignore = true }
  }, [dateRange])

  const totalAppts = apptData?.missedRate?.total || 0
  const missedRate = Number(apptData?.missedRate?.rate || 0)
  const totalRevenue = Number(billing?.totalRevenue || 0)
  const todayLab = labData?.todayOrders || 0
  const activeRangeLabel = RANGE_LABELS.find(item => item.value === dateRange)?.label || '30 gün'

  const topDoctors = (apptData?.topDoctors || []).slice(0, 8)
  const docMax = topDoctors.length ? Math.max(...topDoctors.map(item => item.count || 0), 1) : 1
  const statusSegs = (apptData?.statusBreakdown || []).filter(item => (item.count || 0) > 0)
  const busiestDays = (apptData?.busiestDays || []).slice(0, 7)
  const dayMax = busiestDays.length ? Math.max(...busiestDays.map(item => item.count || 0), 1) : 1
  const specDemand = (apptData?.specializationDemand || []).slice(0, 6)
  const specMax = specDemand.length ? Math.max(...specDemand.map(item => item.count || 0), 1) : 1
  const billingRows = billing?.byStatus || []
  const paymentSummary = [
    { key: 'paid', label: 'Ödənildi', color: '#22C55E', bg: '#F0FDF4', value: sumBillingStatus(billingRows, ['paid', 'partially_paid']) },
    { key: 'pending', label: 'Gözləyir', color: '#F59E0B', bg: '#FEFCE8', value: sumBillingStatus(billingRows, ['draft', 'issued', 'overdue']) },
    { key: 'cancelled', label: 'Ləğv edilib', color: '#EF4444', bg: '#FEF2F2', value: sumBillingStatus(billingRows, ['cancelled']) },
  ]

  if (loading) return (
    <AdminLayout activePage="analytics">
      <div className="analytics-loading">
        <div />
        <span>Yüklənir...</span>
      </div>
      <style>{`
        .analytics-loading { display:flex; align-items:center; justify-content:center; height:60vh; flex-direction:column; gap:14px; }
        .analytics-loading div { width:36px; height:36px; border:3px solid #E2E8F0; border-top-color:${TEAL}; border-radius:50%; animation:analytics-spin .8s linear infinite; }
        .analytics-loading span { font-size:13px; color:${LIGHT_MUTED}; }
        @keyframes analytics-spin { to { transform: rotate(360deg); } }
      `}</style>
    </AdminLayout>
  )

  return (
    <AdminLayout activePage="analytics">
      <div className="analytics-page">
        <header className="analytics-header">
          <div>
            <p>Ana səhifə / Analitika</p>
            <h1>Analitika</h1>
            <span>Sistem statistikası</span>
          </div>
          <div className="analytics-range">
            {RANGE_LABELS.map(item => {
              const active = dateRange === item.value
              return (
                <button
                  key={item.value}
                  type="button"
                  className={active ? 'active' : ''}
                  onClick={() => {
                    if (!active) {
                      setLoading(true)
                      setDateRange(item.value)
                    }
                  }}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        </header>

        <section className="analytics-kpi-grid">
          {[
            { label: 'Ümumi Randevu', value: totalAppts, icon: 'calendar', color: TEAL, bg: '#DDF4F5' },
            { label: 'Buraxılma faizi', value: `${missedRate}%`, icon: 'alert', color: missedRate > 10 ? '#F59E0B' : '#22C55E', bg: missedRate > 10 ? '#FEFCE8' : '#F0FDF4' },
            { label: 'Ümumi Gəlir', value: `${totalRevenue.toFixed(0)} ₼`, icon: 'revenue', color: '#DB2777', bg: '#FCE7F3' },
            { label: 'Lab Sifarişi', value: todayLab, icon: 'lab', color: '#3B82F6', bg: '#DBEAFE' },
          ].map(card => (
            <article key={card.label} className="analytics-kpi-card">
              <div className="analytics-kpi-icon" style={{ background: card.bg, color: card.color }}>
                <MetricIcon type={card.icon} />
              </div>
              <div>
                <strong>{card.value}</strong>
                <span>{card.label}</span>
                <small>son {activeRangeLabel}</small>
              </div>
            </article>
          ))}
        </section>

        <section className="analytics-main-grid">
          <article className="analytics-card analytics-card-large">
            <div className="analytics-card-header">
              <div>
                <h2>Aylıq Pasiyent Artımı</h2>
                <p>Pasiyent qeydiyyatının aylıq dinamikası</p>
              </div>
            </div>
            <AreaChart data={monthly} />
          </article>

          <article className="analytics-card">
            <div className="analytics-card-header">
              <div>
                <h2>Randevu Statusları</h2>
                <p>Statuslara görə bölgü</p>
              </div>
            </div>
            <DonutChart segments={statusSegs} />
          </article>
        </section>

        <section className="analytics-bottom-grid">
          <article className="analytics-card">
            <div className="analytics-card-header">
              <div>
                <h2>Ən Yoğun Günlər</h2>
                <p>Randevu sayı üzrə</p>
              </div>
            </div>
            {busiestDays.length === 0 ? <Empty /> : (
              <div className="analytics-list">
                {busiestDays.map((item, index) => {
                  const label = DAY_AZ[item.day] || item.day || `Gün ${index + 1}`
                  return (
                    <div key={`${label}-${index}`} className="analytics-bar-row">
                      <div className="analytics-row-top">
                        <span>{label}</span>
                        <strong>{item.count || 0}</strong>
                      </div>
                      <HBar pct={((item.count || 0) / dayMax) * 100} />
                    </div>
                  )
                })}
              </div>
            )}
          </article>

          <article className="analytics-card">
            <div className="analytics-card-header">
              <div>
                <h2>İxtisas Tələbi</h2>
                <p>Şöbə və ixtisaslara maraq</p>
              </div>
            </div>
            {specDemand.length === 0 ? <Empty /> : (
              <div className="analytics-list">
                {specDemand.map((item, index) => {
                  const name = item.specialization || item._id || `İxtisas ${index + 1}`
                  return (
                    <div key={`${name}-${index}`} className="analytics-bar-row">
                      <div className="analytics-row-top">
                        <span>{name}</span>
                        <strong>{item.count || 0}</strong>
                      </div>
                      <HBar pct={((item.count || 0) / specMax) * 100} color={index % 2 ? '#8B5CF6' : TEAL} />
                    </div>
                  )
                })}
              </div>
            )}
          </article>

          <article className="analytics-card">
            <div className="analytics-card-header">
              <div>
                <h2>Ödəniş Vəziyyəti</h2>
                <p>Fakturaların status icmalı</p>
              </div>
            </div>
            {billingRows.length === 0 ? <Empty /> : (
              <div className="analytics-payment-list">
                {paymentSummary.map(item => (
                  <div key={item.key} className="analytics-payment-row" style={{ background: item.bg }}>
                    <span style={{ background: item.color }} />
                    <div>
                      <strong>{item.label}</strong>
                      <small>{Number(item.value.total || 0).toFixed(0)} ₼</small>
                    </div>
                    <b style={{ color: item.color }}>{item.value.count}</b>
                  </div>
                ))}
              </div>
            )}
          </article>
        </section>

        <section className="analytics-doctors-card analytics-card">
          <div className="analytics-card-header">
            <div>
              <h2>Ən Aktiv Həkimlər</h2>
              <p>Randevu sayına görə həkim aktivliyi</p>
            </div>
          </div>
          {topDoctors.length === 0 ? <Empty /> : (
            <div className="analytics-doctors-grid">
              {topDoctors.map((item, index) => {
                const name = item.fullName || item.name || item.doctorName || `Həkim ${index + 1}`
                return (
                  <div key={`${name}-${index}`} className="analytics-bar-row">
                    <div className="analytics-row-top">
                      <span>{name}</span>
                      <strong>{item.count || 0}</strong>
                    </div>
                    <HBar pct={((item.count || 0) / docMax) * 100} />
                    {item.specialization && <small>{item.specialization}</small>}
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>

      <style>{`
        .analytics-page {
          background: #F8FAFC;
          min-height: calc(100vh - 112px);
          color: ${NAVY};
        }
        .analytics-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 22px;
        }
        .analytics-header p,
        .analytics-header span {
          margin: 0;
          color: ${MUTED};
          font-size: 13px;
          line-height: 1.5;
        }
        .analytics-header h1 {
          margin: 3px 0 2px;
          color: ${NAVY};
          font-size: 28px;
          line-height: 1.2;
          font-weight: 850;
        }
        .analytics-range {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }
        .analytics-range button {
          height: 42px;
          padding: 0 16px;
          border-radius: 13px;
          border: 1px solid ${BORDER};
          background: #FFFFFF;
          color: ${NAVY};
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          transition: background .16s, border-color .16s, color .16s, box-shadow .16s;
        }
        .analytics-range button:hover {
          border-color: rgba(29, 139, 149, 0.35);
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.05);
        }
        .analytics-range button.active {
          background: ${TEAL};
          border-color: ${TEAL};
          color: #FFFFFF;
          box-shadow: 0 10px 22px rgba(29, 139, 149, 0.22);
        }
        .analytics-kpi-grid,
        .analytics-bottom-grid {
          display: grid;
          gap: 18px;
        }
        .analytics-kpi-grid {
          grid-template-columns: repeat(4, minmax(0, 1fr));
          margin-bottom: 20px;
        }
        .analytics-kpi-card,
        .analytics-card {
          background: #FFFFFF;
          border: 1px solid ${BORDER};
          border-radius: 18px;
          box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
        }
        .analytics-kpi-card {
          min-height: 112px;
          padding: 20px 22px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-sizing: border-box;
        }
        .analytics-kpi-icon {
          width: 52px;
          height: 52px;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .analytics-kpi-card strong,
        .analytics-kpi-card span,
        .analytics-kpi-card small {
          display: block;
        }
        .analytics-kpi-card strong {
          color: ${NAVY};
          font-size: 30px;
          line-height: 1;
          font-weight: 850;
          margin-bottom: 8px;
        }
        .analytics-kpi-card span {
          color: #475569;
          font-size: 14px;
          font-weight: 750;
        }
        .analytics-kpi-card small {
          color: ${LIGHT_MUTED};
          font-size: 12px;
          font-weight: 650;
          margin-top: 3px;
        }
        .analytics-main-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.65fr) minmax(340px, .9fr);
          gap: 20px;
          margin-bottom: 20px;
        }
        .analytics-bottom-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
          margin-bottom: 20px;
        }
        .analytics-card {
          padding: 24px;
          min-width: 0;
        }
        .analytics-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 18px;
        }
        .analytics-card-header h2 {
          margin: 0;
          color: ${NAVY};
          font-size: 17px;
          line-height: 1.25;
          font-weight: 850;
        }
        .analytics-card-header p {
          margin: 5px 0 0;
          color: ${MUTED};
          font-size: 12px;
          line-height: 1.5;
        }
        .analytics-area-chart {
          width: 100%;
          height: 280px;
          display: block;
        }
        .analytics-donut-wrap {
          display: flex;
          align-items: center;
          gap: 20px;
          min-height: 280px;
        }
        .analytics-donut-legend {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-width: 0;
        }
        .analytics-legend-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 9px 10px;
          border-radius: 12px;
          background: #F8FAFC;
        }
        .analytics-legend-row span {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
          color: #475569;
          font-size: 13px;
          font-weight: 700;
        }
        .analytics-legend-row i {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .analytics-legend-row strong {
          color: ${NAVY};
          font-size: 13px;
          font-weight: 850;
        }
        .analytics-list,
        .analytics-payment-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .analytics-bar-row {
          min-width: 0;
        }
        .analytics-row-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 7px;
        }
        .analytics-row-top span {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #334155;
          font-size: 13px;
          font-weight: 750;
        }
        .analytics-row-top strong {
          flex-shrink: 0;
          color: ${MUTED};
          font-size: 13px;
          font-weight: 850;
        }
        .analytics-progress {
          height: 8px;
          border-radius: 999px;
          background: ${BORDER};
          overflow: hidden;
        }
        .analytics-progress div {
          height: 100%;
          border-radius: inherit;
          transition: width .35s ease;
        }
        .analytics-payment-row {
          display: flex;
          align-items: center;
          gap: 12px;
          border-radius: 14px;
          padding: 14px;
        }
        .analytics-payment-row > span {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .analytics-payment-row div {
          min-width: 0;
          flex: 1;
        }
        .analytics-payment-row strong,
        .analytics-payment-row small {
          display: block;
        }
        .analytics-payment-row strong {
          color: ${NAVY};
          font-size: 13px;
          font-weight: 850;
        }
        .analytics-payment-row small {
          color: ${MUTED};
          font-size: 12px;
          margin-top: 2px;
        }
        .analytics-payment-row b {
          font-size: 18px;
          font-weight: 900;
        }
        .analytics-doctors-card {
          margin-bottom: 4px;
        }
        .analytics-doctors-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px 20px;
        }
        .analytics-doctors-grid small {
          display: block;
          color: ${LIGHT_MUTED};
          font-size: 11px;
          margin-top: 5px;
        }
        .analytics-empty {
          min-height: 188px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${LIGHT_MUTED};
          font-size: 13px;
          text-align: center;
        }
        @media (max-width: 1180px) {
          .analytics-kpi-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .analytics-main-grid,
          .analytics-bottom-grid {
            grid-template-columns: 1fr;
          }
          .analytics-donut-wrap {
            min-height: 0;
          }
        }
        @media (max-width: 720px) {
          .analytics-page {
            margin: 0;
          }
          .analytics-header {
            flex-direction: column;
            align-items: stretch;
          }
          .analytics-range {
            justify-content: flex-start;
          }
          .analytics-kpi-grid,
          .analytics-doctors-grid {
            grid-template-columns: 1fr;
          }
          .analytics-card,
          .analytics-kpi-card {
            padding: 18px;
          }
          .analytics-donut-wrap {
            flex-direction: column;
            align-items: stretch;
          }
          .analytics-donut-wrap svg {
            align-self: center;
          }
          .analytics-area-chart {
            height: 240px;
          }
        }
        @media (max-width: 480px) {
          .analytics-range button {
            flex: 1;
            min-width: 86px;
          }
        }
        @keyframes analytics-spin { to { transform: rotate(360deg); } }
      `}</style>
    </AdminLayout>
  )
}
