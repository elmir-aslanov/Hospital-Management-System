import { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'

const BASE = 'http://localhost:5000'
const TEAL = '#00848e'
const NAVY = '#0a1628'
const CIRC = 2 * Math.PI * 55   // ≈ 345.57

const STATUS_AZ = {
  scheduled:   { label: 'Planlandı',  color: '#00848e' },
  waiting:     { label: 'Növbədə',    color: '#f59e0b' },
  in_progress: { label: 'Müayinədə',  color: '#3b82f6' },
  completed:   { label: 'Tamamlandı', color: '#22c55e' },
  cancelled:   { label: 'Ləğv',       color: '#ef4444' },
  missed:      { label: 'Buraxıldı',  color: '#94a3b8' },
}

const DAY_AZ = {
  Sunday: 'Bazar', Monday: 'B.ertəsi', Tuesday: 'Ç.axş.',
  Wednesday: 'Çərş.', Thursday: 'C.axş.', Friday: 'Cümə', Saturday: 'Şənbə',
}

const BILLING_STATUS_AZ = {
  draft: 'Qaralama', issued: 'Kəsildi', paid: 'Ödənildi',
  partially_paid: 'Qismən', cancelled: 'Ləğv', overdue: 'Gecikmiş',
}

const BILLING_COLORS = {
  draft: '#94a3b8', issued: '#3b82f6', paid: '#22c55e',
  partially_paid: '#f59e0b', cancelled: '#ef4444', overdue: '#ea580c',
}

const RANGE_LABELS = [
  { value: '7',   label: '7 gün'  },
  { value: '30',  label: '30 gün' },
  { value: '90',  label: '90 gün' },
  { value: '365', label: '1 il'   },
]

const cardSt = {
  background: 'white', borderRadius: 16, border: '1px solid #f1f5f9', padding: 24,
}
const titleSt = {
  fontSize: 15, fontWeight: 700, color: NAVY, margin: '0 0 16px',
}
const Empty = () => (
  <div style={{ textAlign: 'center', padding: '28px 0', color: '#94a3b8', fontSize: 13 }}>
    Məlumat yoxdur
  </div>
)

/* ── horizontal progress bar ── */
function HBar({ pct, color }) {
  return (
    <div style={{ height: 8, borderRadius: 4, background: '#f1f5f9', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, width: `${Math.max(1, pct)}%`, background: color, borderRadius: 4, transition: 'width 0.4s' }} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════ */
export default function AdminAnalitika() {
  const token   = localStorage.getItem('adminToken') || localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  const [loading,   setLoading]   = useState(true)
  const [apptData,  setApptData]  = useState(null)
  const [monthly,   setMonthly]   = useState([])
  const [billing,   setBilling]   = useState(null)
  const [labData,   setLabData]   = useState(null)
  const [dateRange, setDateRange] = useState('30')

  useEffect(() => {
    setLoading(true)
    const end   = new Date().toISOString().split('T')[0]
    const start = new Date(Date.now() - parseInt(dateRange) * 86400000).toISOString().split('T')[0]

    Promise.all([
      fetch(`${BASE}/api/v1/analytics/appointments?startDate=${start}&endDate=${end}`, { headers }).then(r => r.json()),
      fetch(`${BASE}/api/v1/analytics/patients/monthly`, { headers }).then(r => r.json()),
      fetch(`${BASE}/api/v1/billing/summary`,            { headers }).then(r => r.json()),
      fetch(`${BASE}/api/v1/lab/summary`,                { headers }).then(r => r.json()),
    ]).then(([a, m, b, l]) => {
      setApptData(a.data || null)
      setMonthly(m.data  || [])
      setBilling(b.data  || null)
      setLabData(l.data  || null)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [dateRange])

  /* ── derived values ── */
  const totalAppts   = apptData?.missedRate?.total || 0
  const missedRate   = apptData?.missedRate?.rate  || 0
  const totalRevenue = billing?.totalRevenue        || 0
  const todayLab     = labData?.todayOrders         || 0

  const monthMax   = monthly.length ? Math.max(...monthly.map(m => m.count), 1) : 1
  const topDoctors = (apptData?.topDoctors          || []).slice(0, 8)
  const docMax     = topDoctors.length ? Math.max(...topDoctors.map(d => d.count), 1) : 1
  const statusSegs = apptData?.statusBreakdown       || []
  const statusTot  = statusSegs.reduce((s, x) => s + (x.count || 0), 0) || 1
  const busiestDays = apptData?.busiestDays          || []
  const dayMax      = busiestDays.length ? Math.max(...busiestDays.map(d => d.count), 1) : 1
  const specDemand  = (apptData?.specializationDemand || []).slice(0, 8)
  const specMax     = specDemand.length ? Math.max(...specDemand.map(d => d.count), 1) : 1

  /* ── loading ── */
  if (loading) return (
    <AdminLayout activePage="analytics">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 14 }}>
        <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: TEAL, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ fontSize: 13, color: '#94a3b8' }}>Yüklənir...</span>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </AdminLayout>
  )

  return (
    <AdminLayout activePage="analytics">

      {/* ── Page header ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: NAVY }}>Analitika</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>Sistem statistikası</p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {RANGE_LABELS.map(r => (
            <button key={r.value} onClick={() => setDateRange(r.value)} style={{
              padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              border: `1px solid ${dateRange === r.value ? TEAL : '#e2e8f0'}`,
              background: dateRange === r.value ? TEAL : 'white',
              color:      dateRange === r.value ? 'white' : '#475569',
            }}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── ROW 1 — Summary cards ──────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Ümumi Randevu',   value: totalAppts,                      icon: '📅', color: TEAL,      bg: '#f0fdfa' },
          { label: 'Buraxılma faizi', value: missedRate + '%',                 icon: '⚠️', color: missedRate > 10 ? '#ea580c' : '#22c55e', bg: missedRate > 10 ? '#fff7ed' : '#f0fdf4' },
          { label: 'Ümumi Gəlir',    value: Number(totalRevenue).toFixed(0) + ' ₼', icon: '💰', color: '#be185d', bg: '#fdf2f8' },
          { label: 'Lab Sifarişi',   value: todayLab,                         icon: '🔬', color: '#1d4ed8', bg: '#eff6ff' },
        ].map(c => (
          <div key={c.label} style={{ ...cardSt, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
              {c.icon}
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#0f1b2d', lineHeight: 1 }}>{c.value}</div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── ROW 2 — Monthly patients bar chart ─────────────────────── */}
      <div style={{ ...cardSt, marginBottom: 24 }}>
        <p style={titleSt}>Aylıq Pasiyent Artımı</p>
        {monthly.length === 0 ? <Empty /> : (
          <div style={{ overflow: 'hidden', borderRadius: 8 }}>
            <svg viewBox="0 0 800 220" width="100%" height="220" preserveAspectRatio="none">
              {/* grid lines */}
              {[0, 0.5, 1].map((f, i) => (
                <g key={i}>
                  <line x1="30" y1={200 - f * 180} x2="800" y2={200 - f * 180} stroke="#f1f5f9" strokeWidth="1" />
                  <text x="2" y={200 - f * 180 + 4} fontSize="9" fill="#94a3b8">{Math.round(monthMax * f)}</text>
                </g>
              ))}
              {/* bars */}
              {monthly.map((m, i) => {
                const slot = 800 / monthly.length
                const bww  = Math.max(4, slot - 6)
                const bx   = 30 + i * slot + (slot - bww) / 2
                const bh   = Math.max(4, (m.count / monthMax) * 180)
                const by   = 200 - bh
                return (
                  <g key={i}>
                    <rect x={bx} y={by} width={bww} height={bh} rx="3"
                      fill={TEAL} opacity="0.88"
                      style={{ cursor: 'pointer', transition: 'opacity 0.15s' }}
                      onMouseEnter={e => e.currentTarget.setAttribute('opacity','0.6')}
                      onMouseLeave={e => e.currentTarget.setAttribute('opacity','0.88')}
                    />
                    <text x={bx + bww / 2} y="214" textAnchor="middle" fontSize="9" fill="#94a3b8">
                      {(m.monthName || '').slice(0, 3)}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        )}
      </div>

      {/* ── ROW 3 — Top doctors + Donut ────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 20, marginBottom: 24 }}>

        {/* Top doctors — horizontal bars */}
        <div style={cardSt}>
          <p style={titleSt}>Ən Aktiv Həkimlər</p>
          {topDoctors.length === 0 ? <Empty /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {topDoctors.map((d, i) => {
                const pct  = (d.count / docMax) * 100
                const name = d.fullName || d.name || d.doctorName || `Həkim ${i + 1}`
                const spec = d.specialization || ''
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#0f1b2d', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                        {spec && <span style={{ fontSize: 11, color: '#94a3b8', flexShrink: 0 }}>{spec}</span>}
                      </div>
                      <span style={{ fontSize: 12, color: '#64748b', flexShrink: 0, marginLeft: 8 }}>{d.count}</span>
                    </div>
                    <HBar pct={pct} color={TEAL} />
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Donut chart — status breakdown */}
        <div style={cardSt}>
          <p style={titleSt}>Randevu Statusları</p>
          {statusSegs.length === 0 ? <Empty /> : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              {/* SVG donut */}
              <div style={{ flexShrink: 0 }}>
                <svg width="160" height="160" viewBox="0 0 160 160">
                  {(() => {
                    let cumOffset = 0
                    return statusSegs.map((seg, i) => {
                      const cfg     = STATUS_AZ[seg._id] || { label: seg._id || '?', color: '#94a3b8' }
                      const dashLen = (seg.count / statusTot) * CIRC
                      const offset  = cumOffset
                      cumOffset    += dashLen
                      return (
                        <circle key={i}
                          cx="80" cy="80" r="55"
                          fill="none"
                          stroke={cfg.color}
                          strokeWidth="22"
                          strokeDasharray={`${dashLen} ${CIRC}`}
                          strokeDashoffset={-offset}
                          transform="rotate(-90 80 80)"
                          style={{ cursor: 'pointer', transition: 'opacity 0.15s' }}
                          onMouseEnter={e => e.currentTarget.setAttribute('opacity','0.65')}
                          onMouseLeave={e => e.currentTarget.setAttribute('opacity','1')}
                        />
                      )
                    })
                  })()}
                  <text x="80" y="76" textAnchor="middle" fontSize="18" fontWeight="700" fill={NAVY}>{statusTot}</text>
                  <text x="80" y="91" textAnchor="middle" fontSize="9"  fill="#94a3b8">ümumi</text>
                </svg>
              </div>
              {/* Legend */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
                {statusSegs.map((seg, i) => {
                  const cfg = STATUS_AZ[seg._id] || { label: seg._id || '?', color: '#94a3b8' }
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: '#475569' }}>{cfg.label}</span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#0f1b2d' }}>{seg.count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── ROW 4 — Busiest days + Specialization demand ───────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>

        {/* Busiest days */}
        <div style={cardSt}>
          <p style={titleSt}>Ən Yoğun Günlər</p>
          {busiestDays.length === 0 ? <Empty /> : (
            <svg viewBox="0 0 320 150" width="100%" height="150" preserveAspectRatio="none">
              {busiestDays.map((d, i) => {
                const slot = 320 / busiestDays.length
                const bww  = Math.max(4, slot - 6)
                const bx   = i * slot + (slot - bww) / 2
                const bh   = Math.max(4, (d.count / dayMax) * 110)
                const by   = 125 - bh
                return (
                  <g key={i}>
                    <rect x={bx} y={by} width={bww} height={bh} rx="3"
                      fill="#6366f1" opacity="0.85"
                      style={{ cursor: 'pointer', transition: 'opacity 0.15s' }}
                      onMouseEnter={e => e.currentTarget.setAttribute('opacity','0.55')}
                      onMouseLeave={e => e.currentTarget.setAttribute('opacity','0.85')}
                    />
                    <text x={bx + bww / 2} y="140" textAnchor="middle" fontSize="8" fill="#94a3b8">
                      {DAY_AZ[d.day] || d.day || ''}
                    </text>
                  </g>
                )
              })}
            </svg>
          )}
        </div>

        {/* Specialization demand */}
        <div style={cardSt}>
          <p style={titleSt}>İxtisas Tələbi</p>
          {specDemand.length === 0 ? <Empty /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {specDemand.map((s, i) => {
                const pct = (s.count / specMax) * 100
                const name = s.specialization || s._id || `İxtisas ${i + 1}`
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75%' }}>{name}</span>
                      <span style={{ fontSize: 12, color: '#64748b', flexShrink: 0 }}>{s.count}</span>
                    </div>
                    <HBar pct={pct} color="#8b5cf6" />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── ROW 5 — Billing breakdown ───────────────────────────────── */}
      {billing?.byStatus?.length > 0 && (
        <div style={cardSt}>
          <p style={titleSt}>Ödəniş Vəziyyəti</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: 12 }}>
            {billing.byStatus.map((s, i) => {
              const lbl   = BILLING_STATUS_AZ[s._id] || s._id || '?'
              const color = BILLING_COLORS[s._id]    || '#94a3b8'
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', border: '1px solid #f1f5f9', borderRadius: 10, background: '#fafafa' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0f1b2d' }}>{lbl}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                      {s.count} faktura · {Number(s.total || 0).toFixed(0)} ₼
                    </div>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color }}>{s.count}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </AdminLayout>
  )
}
