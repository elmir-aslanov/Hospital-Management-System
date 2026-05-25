import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const FONT  = "'Source Sans 3', 'Raleway', sans-serif"
const NAVY  = '#0a1628'
const TEAL  = '#00848e'
const API   = 'http://localhost:5000/api/v1'

const NAV = [
  { label: 'Ana səhifə',    icon: '🏠', path: '/admin/dashboard' },
  { label: 'Həkimlər',      icon: '👨‍⚕️', path: '/admin/doctors' },
  { label: 'Pasiyentlər',   icon: '🏥', path: '/admin/patients' },
  { label: 'Randevular',    icon: '📅', path: '/admin/appointments' },
  { label: 'Müraciətlər',   icon: '📋', path: '/admin/muraciet' },
  { label: 'Reseptlər',     icon: '💊', path: '/admin/prescriptions' },
  { label: 'Ayarlar',       icon: '⚙️', path: '/admin/settings' },
]

const STATUS_STYLE = {
  scheduled:   { background: '#fef9c3', color: '#854d0e', label: 'Gözləyir' },
  waiting:     { background: '#fef9c3', color: '#854d0e', label: 'Gözləmədə' },
  in_progress: { background: '#dbeafe', color: '#1e40af', label: 'Davam edir' },
  completed:   { background: '#dcfce7', color: '#166534', label: 'Tamamlandı' },
  cancelled:   { background: '#fee2e2', color: '#991b1b', label: 'Ləğv edildi' },
  missed:      { background: '#f3f4f6', color: '#374151', label: 'Buraxıldı' },
}

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
}

export default function AdminDashboard() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const isMobile  = window.innerWidth < 768

  const [adminUser, setAdminUser]   = useState(null)
  const [stats, setStats]           = useState({ doctors: 0, patients: 0, appointments: 0, muraciet: 0 })
  const [appointments, setAppts]    = useState([])
  const [sidebarOpen, setSidebar]   = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) { navigate('/admin'); return }
    const u = localStorage.getItem('adminUser')
    if (u) setAdminUser(JSON.parse(u))

    fetch(`${API}/admin/stats`, { headers: authHeaders() })
      .then(r => r.json()).then(d => { if (d.data) setStats(d.data) })
      .catch(() => {})

    fetch(`${API}/admin/appointments?limit=5`, { headers: authHeaders() })
      .then(r => r.json()).then(d => { if (Array.isArray(d.data)) setAppts(d.data) })
      .catch(() => {})
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    navigate('/admin')
  }

  const currentNav = NAV.find(n => n.path === location.pathname) || NAV[0]

  const STAT_CARDS = [
    { label: 'Həkimlər',    value: stats.doctors,      color: '#6366f1' },
    { label: 'Pasiyentlər', value: stats.patients,     color: '#06b6d4' },
    { label: 'Randevular',  value: stats.appointments, color: '#f59e0b' },
    { label: 'Müraciətlər', value: stats.muraciet,     color: '#10b981' },
  ]

  const Sidebar = () => (
    <div style={{
      width: '240px', background: NAVY, height: '100vh',
      position: 'fixed', top: 0, left: isMobile ? (sidebarOpen ? 0 : '-240px') : 0,
      display: 'flex', flexDirection: 'column', zIndex: 100,
      transition: 'left 0.25s ease',
    }}>
      <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <img src="/logo.png" alt="Aslan Medical" style={{ height: '40px' }} />
      </div>

      <nav style={{ flex: 1, paddingTop: '8px' }}>
        {NAV.map(item => {
          const active = location.pathname === item.path
          return (
            <div
              key={item.path}
              onClick={() => { navigate(item.path); setSidebar(false) }}
              style={{
                padding: '12px 24px', cursor: 'pointer', fontSize: '14px',
                display: 'flex', alignItems: 'center', gap: '10px',
                color: active ? 'white' : '#94a3b8',
                background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                borderLeft: active ? `3px solid ${TEAL}` : '3px solid transparent',
                fontFamily: FONT,
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          )
        })}
      </nav>

      <div style={{ padding: '20px' }}>
        <button onClick={handleLogout} style={{
          width: '100%', background: 'rgba(255,255,255,0.06)',
          color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)',
          padding: '10px', borderRadius: '8px', cursor: 'pointer',
          fontSize: '14px', fontFamily: FONT,
        }}>
          Çıxış
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', fontFamily: FONT }}>
      <Sidebar />

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebar(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99,
        }} />
      )}

      {/* Main */}
      <div style={{
        marginLeft: isMobile ? 0 : '240px',
        padding: isMobile ? '16px' : '32px',
        background: '#f1f5f9', minHeight: '100vh', flex: 1,
      }}>
        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isMobile && (
              <button onClick={() => setSidebar(true)} style={{
                background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer',
              }}>☰</button>
            )}
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: NAVY, margin: 0 }}>
              {currentNav.label}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '14px', color: '#64748b' }}>{adminUser?.fullName}</span>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: TEAL, color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '15px', fontWeight: 700,
            }}>
              {adminUser?.fullName?.[0]?.toUpperCase() || 'A'}
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
          gap: '20px', marginBottom: '32px',
        }}>
          {STAT_CARDS.map(card => (
            <div key={card.label} style={{
              background: 'white', borderRadius: '12px', padding: '24px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: card.color + '20', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                marginBottom: '12px',
              }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: card.color }} />
              </div>
              <p style={{ fontSize: '32px', fontWeight: 700, color: NAVY, margin: '0 0 4px' }}>{card.value}</p>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>{card.label}</p>
            </div>
          ))}
        </div>

        {/* Recent appointments table */}
        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: NAVY, margin: 0 }}>Son Randevular</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Pasiyent', 'Həkim', 'Tarix', 'Saat', 'Status'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {appointments.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>Məlumat yoxdur</td></tr>
                ) : appointments.map((appt, i) => {
                  const s = STATUS_STYLE[appt.status] || STATUS_STYLE.scheduled
                  const patientName = appt.patientId?.userId?.fullName || '—'
                  const doctorName  = appt.doctorId?.userId?.fullName  || '—'
                  return (
                    <tr key={appt._id || i} style={{ borderTop: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 16px', color: NAVY, fontWeight: 500 }}>{patientName}</td>
                      <td style={{ padding: '14px 16px', color: '#475569' }}>{doctorName}</td>
                      <td style={{ padding: '14px 16px', color: '#475569' }}>{appt.date ? new Date(appt.date).toLocaleDateString('az-AZ') : '—'}</td>
                      <td style={{ padding: '14px 16px', color: '#475569' }}>{appt.startTime || '—'}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          ...s, padding: '4px 10px', borderRadius: '20px',
                          fontSize: '12px', fontWeight: 600,
                        }}>{s.label}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
