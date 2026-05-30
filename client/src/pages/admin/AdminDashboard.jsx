import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const API = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1`

const NAV_ITEMS = [
  { label: 'Ana səhifə',  path: '/admin/dashboard',     icon: HomeIcon },
  { label: 'Həkimlər',    path: '/admin/doctors',        icon: UsersIcon },
  { label: 'Pasiyentlər', path: '/admin/patients',       icon: UserIcon },
  { label: 'Randevular',  path: '/admin/appointments',   icon: CalendarIcon },
  { label: 'Müraciətlər', path: '/admin/muraciet',       icon: MailIcon },
  { label: 'Reseptlər',   path: '/admin/prescriptions',  icon: PillIcon },
  { label: 'Ayarlar',     path: '/admin/settings',       icon: SettingsIcon },
]

const STATUS = {
  scheduled:   { bg: '#fef9c3', color: '#854d0e', label: 'Gözləyir' },
  waiting:     { bg: '#fef9c3', color: '#854d0e', label: 'Gözləmədə' },
  in_progress: { bg: '#dbeafe', color: '#1e40af', label: 'Davam edir' },
  completed:   { bg: '#dcfce7', color: '#166534', label: 'Tamamlandı' },
  cancelled:   { bg: '#fee2e2', color: '#991b1b', label: 'Ləğv edilib' },
  missed:      { bg: '#f3f4f6', color: '#374151', label: 'Buraxıldı' },
}

const SCHEDULE = [
  { time: '10:00', name: 'Dr. Nigar Əliyeva',   type: 'Kardiologiya' },
  { time: '11:30', name: 'Dr. Tural Qasımov',   type: 'Nevrologiya' },
  { time: '14:00', name: 'Dr. Elnur Məmmədov',  type: 'Cərrahiyyə' },
  { time: '16:00', name: 'Dr. Nigar Əliyeva',   type: 'Müayinə' },
]

/* ─── SVG Icons ─── */
function HomeIcon() {
  return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
}
function UsersIcon() {
  return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
}
function UserIcon() {
  return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
}
function CalendarIcon() {
  return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
}
function MailIcon() {
  return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
}
function PillIcon() {
  return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M10.5 20.5L3.5 13.5a5 5 0 0 1 7.07-7.07l7 7a5 5 0 0 1-7.07 7.07z"/><line x1="8.5" y1="11.5" x2="13.5" y2="6.5"/></svg>
}
function SettingsIcon() {
  return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
}
function BellIcon() {
  return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
}
function SearchIcon() {
  return <svg width="15" height="15" fill="none" stroke="#94a3b8" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
}
function WAIcon() {
  return <svg width="24" height="24" fill="white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
}

export default function AdminDashboard() {
  const navigate  = useNavigate()
  const location  = useLocation()

  const [adminUser]          = useState(() => JSON.parse(localStorage.getItem('adminUser') || '{}'))
  const token                = localStorage.getItem('adminToken')
  const [stats, setStats]    = useState({ doctors: 0, patients: 0, appointments: 0, muraciet: 0 })
  const [appointments, setAppointments] = useState([])
  const [search, setSearch]  = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) { navigate('/admin'); return }
    const headers = { Authorization: `Bearer ${token}` }

    const p1 = fetch(`${API}/site-doctors/all`, { headers })
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : data.doctors || data.data || []
        setStats(prev => ({ ...prev, doctors: list.length }))
      })
      .catch(() => {})

    const p2 = fetch(`${API}/patients`, { headers })
      .then(r => r.json())
      .then(data => {
        const count = data.total || data.count || (Array.isArray(data) ? data.length : 0) || (Array.isArray(data.patients) ? data.patients.length : 0)
        setStats(prev => ({ ...prev, patients: count }))
      })
      .catch(() => {})

    const p3 = fetch(`${API}/appointments`, { headers })
      .then(r => r.json())
      .then(data => {
        const count = data.total || data.count || (Array.isArray(data) ? data.length : 0) || (Array.isArray(data.appointments) ? data.appointments.length : 0)
        setStats(prev => ({ ...prev, appointments: count }))
      })
      .catch(() => {})

    const p4 = fetch(`${API}/contact`, { headers })
      .then(r => r.json())
      .then(data => {
        const count = data.total || data.count || (Array.isArray(data) ? data.length : 0) || (Array.isArray(data.contacts) ? data.contacts.length : 0)
        setStats(prev => ({ ...prev, muraciet: count }))
      })
      .catch(() => {
        fetch(`${API}/muraciet`, { headers })
          .then(r => r.json())
          .then(data => {
            const count = Array.isArray(data) ? data.length : data.total || 0
            setStats(prev => ({ ...prev, muraciet: count }))
          })
          .catch(() => {})
      })

    const p5 = fetch(`${API}/appointments?limit=5&sort=-createdAt`, { headers })
      .then(r => r.json())
      .then(data => {
        let list = []
        if (Array.isArray(data)) list = data
        else if (Array.isArray(data.appointments)) list = data.appointments
        else if (Array.isArray(data.data)) list = data.data
        else if (Array.isArray(data.docs)) list = data.docs
        setAppointments(list)
      })
      .catch(() => setAppointments([]))

    Promise.allSettled([p1, p2, p3, p4, p5]).finally(() => setLoading(false))
  }, [navigate, token])

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    navigate('/admin')
  }

  const initial = adminUser?.fullName?.[0]?.toUpperCase() || 'A'

  const STAT_CARDS = [
    { label: 'Həkimlər',    value: stats.doctors,      grad: 'linear-gradient(135deg,#e0f7fa,#b2ebf2)', color: '#00848e', delta: '+18%' },
    { label: 'Pasiyentlər', value: stats.patients,     grad: 'linear-gradient(135deg,#e8f5e9,#c8e6c9)', color: '#2e7d32', delta: '+24%' },
    { label: 'Randevular',  value: stats.appointments, grad: 'linear-gradient(135deg,#ede7f6,#d1c4e9)', color: '#6b21a8', delta: '+8%'  },
    { label: 'Müraciətlər', value: stats.muraciet,     grad: 'linear-gradient(135deg,#fff8e1,#ffecb3)', color: '#b45309', delta: '+12%' },
  ]

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8fafc', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#00848e', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <span style={{ fontSize: 13, color: '#94a3b8' }}>Yüklənir...</span>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: 256, minHeight: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 50,
        background: 'linear-gradient(180deg,#0a1628 0%,#0d2137 60%,#0a1f35 100%)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: '#00848e',
            boxShadow: '0 0 16px rgba(0,132,142,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>Aslan Medical</div>
            <div style={{ color: '#64748b', fontSize: 11 }}>Medical Center</div>
          </div>
        </div>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '0 16px 8px' }} />

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0 12px' }}>
          {NAV_ITEMS.map(({ label, path, icon: Icon }) => {
            const active = location.pathname === path
            return (
              <div key={path} onClick={() => navigate(path)} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                fontSize: 13, fontWeight: 500, marginBottom: 2,
                color: active ? 'white' : '#94a3b8',
                background: active ? 'rgba(0,132,142,0.15)' : 'transparent',
                transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
              >
                <Icon />
                <span style={{ flex: 1 }}>{label}</span>
                {active && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00848e' }} />}
              </div>
            )
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '12px 12px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
            fontSize: 13, fontWeight: 500, color: '#94a3b8',
            transition: 'color 0.15s, background 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'transparent' }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span>Çıxış</span>
          </div>
        </div>
      </aside>

      {/* ── RIGHT SIDE ── */}
      <div style={{ marginLeft: 256, flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* TOPBAR */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 10,
          background: 'rgba(248,250,252,0.85)', backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          padding: '14px 32px', display: 'flex', alignItems: 'center', gap: 16,
        }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
            <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}>
              <SearchIcon />
            </div>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Pasiyent, həkim və ya randevu axtar..."
              style={{
                width: '100%', background: 'white', border: '1px solid #e2e8f0',
                borderRadius: 12, padding: '9px 16px 9px 40px',
                fontSize: 13, color: '#64748b', outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Bell */}
            <button style={{
              width: 36, height: 36, background: 'white', border: '1px solid #e2e8f0',
              borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', position: 'relative',
            }}>
              <BellIcon />
              <div style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, background: '#ef4444', borderRadius: '50%', border: '2px solid white' }} />
            </button>

            {/* Profile chip */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'white', border: '1px solid #e2e8f0',
              borderRadius: 12, padding: '6px 14px 6px 6px',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'linear-gradient(135deg,#00848e,#00a8b5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: 12, fontWeight: 700,
              }}>{initial}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0f1b2d', lineHeight: 1.2 }}>{adminUser?.fullName || 'Admin'}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>{adminUser?.email || ''}</div>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN */}
        <main style={{ padding: '28px 32px', flex: 1 }}>

          {/* Hero card */}
          <div style={{
            borderRadius: 24, padding: '32px 40px', marginBottom: 28,
            position: 'relative', overflow: 'hidden',
            background: 'linear-gradient(135deg,#00848e 0%,#006d75 50%,#004d52 100%)',
          }}>
            <div style={{ position: 'absolute', width: 256, height: 256, background: 'rgba(255,255,255,0.08)', borderRadius: '50%', top: -32, right: -32, filter: 'blur(40px)' }} />
            <div style={{ position: 'absolute', width: 192, height: 192, background: 'rgba(0,200,210,0.15)', borderRadius: '50%', bottom: -24, right: 200, filter: 'blur(32px)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h1 style={{ color: 'white', fontSize: 26, fontWeight: 700, marginBottom: 8 }}>
                Xoş gəldiniz, {adminUser?.fullName || 'Admin'} 👋
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, marginBottom: 24 }}>
                Bugün {stats.appointments} randevu var, {stats.muraciet} yeni müraciət gözləyir
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => navigate('/admin/appointments?new=true')} style={{ background: 'white', color: '#00848e', border: 'none', borderRadius: 10, padding: '10px 22px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  ＋ Yeni randevu
                </button>
                <button style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 10, padding: '10px 22px', fontSize: 13, fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
                  Hesabat
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
            {STAT_CARDS.map(c => (
              <div key={c.label} style={{
                background: 'white', borderRadius: 16, padding: '22px 24px',
                border: '1px solid #f1f5f9', cursor: 'default',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: c.grad, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: c.color }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, borderRadius: 20, padding: '3px 8px', background: '#dcfce7', color: '#166534' }}>{c.delta}</span>
                </div>
                <p style={{ fontSize: 32, fontWeight: 800, color: '#0f1b2d', margin: '16px 0 4px', lineHeight: 1 }}>{c.value}</p>
                <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>{c.label}</p>
              </div>
            ))}
          </div>

          {/* Two columns */}
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

            {/* LEFT — appointments table */}
            <div style={{ flex: 2, background: 'white', borderRadius: 16, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f8fafc' }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#0f1b2d' }}>Son Randevular</span>
                <span style={{ fontSize: 12, color: '#00848e', cursor: 'pointer' }}>Bütün randevular →</span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#fafafa' }}>
                    {['Pasiyent', 'Həkim', 'Tarix', 'Status'].map(h => (
                      <th key={h} style={{ padding: '10px 24px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #f1f5f9' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(appointments || []).length === 0 ? (
                    <tr><td colSpan={4} style={{ padding: 28, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Məlumat yoxdur</td></tr>
                  ) : (appointments || []).map((a, i) => {
                    const s = STATUS[a.status || 'scheduled'] || STATUS.scheduled
                    const pName = a.patientId?.userId?.fullName || a.patientId?.fullName || a.patient?.fullName || a.patientName || '—'
                    const dName = a.doctorId?.userId?.fullName  || a.doctorId?.fullName  || a.doctor?.fullName  || a.doctorName  || '—'
                    const dSpec = a.doctorId?.specialization || a.doctor?.specialization || a.specialization || ''
                    return (
                      <tr key={a._id || i} style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.1s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '14px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#ede7f6,#d1c4e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b21a8', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                              {pName[0]?.toUpperCase() || '?'}
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 500, color: '#0f1b2d' }}>{pName}</span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 24px' }}>
                          <div style={{ fontSize: 13, color: '#0f1b2d' }}>{dName}</div>
                          {dSpec && <div style={{ fontSize: 11, color: '#94a3b8' }}>{dSpec}</div>}
                        </td>
                        <td style={{ padding: '14px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b' }}>
                            <svg width="12" height="12" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            {a.date ? new Date(a.date).toLocaleDateString('az-AZ') : '—'}
                            {a.time ? ` · ${a.time}` : ''}
                          </div>
                        </td>
                        <td style={{ padding: '14px 24px' }}>
                          <span style={{ background: s.bg, color: s.color, borderRadius: 20, padding: '4px 10px', fontSize: 11, fontWeight: 600 }}>{s.label}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* RIGHT column */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Schedule card */}
              <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f1f5f9', padding: 24 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#0f1b2d', marginBottom: 16 }}>Bu günün cədvəli</p>
                {SCHEDULE.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < SCHEDULE.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, background: 'linear-gradient(135deg,#e0f7fa,#b2ebf2)', color: '#00848e', borderRadius: 8, padding: '4px 10px', flexShrink: 0 }}>{s.time}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#0f1b2d' }}>{s.name}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{s.type}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f1f5f9', padding: 24 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#0f1b2d', marginBottom: 16, marginTop: 0 }}>Sürətli Əməliyyatlar</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    {
                      label: '＋ Yeni Randevu',
                      path: '/admin/appointments',
                      icon: <svg width="16" height="16" fill="none" stroke="#00848e" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
                    },
                    {
                      label: '＋ Yeni Pasiyent',
                      path: '/admin/patients',
                      icon: <svg width="16" height="16" fill="none" stroke="#16a34a" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
                    },
                    {
                      label: '＋ Yeni Həkim',
                      path: '/admin/doctors',
                      icon: <svg width="16" height="16" fill="none" stroke="#2563eb" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
                    },
                    {
                      label: '📋 Müraciətlər',
                      path: '/admin/muraciet',
                      icon: <svg width="16" height="16" fill="none" stroke="#d97706" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
                    },
                  ].map(({ label, path, icon }) => (
                    <button key={path} onClick={() => navigate(path)}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#0f1b2d', width: '100%', textAlign: 'left' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'white'}
                    >
                      {icon}
                      {label}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
