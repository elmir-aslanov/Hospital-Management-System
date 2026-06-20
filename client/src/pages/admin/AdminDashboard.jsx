import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { API_URL as API } from '../../api/config.js'
import api from '../../api/axios'
import { clearAuthStorage } from '../../utils/authSession'

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

/* ─── SVG Icons ─── */
function HomeIcon({ size = 16 }) {
  return <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
}
function UsersIcon({ size = 16 }) {
  return <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
}
function UserIcon({ size = 16 }) {
  return <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
}
function CalendarIcon({ size = 16 }) {
  return <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
}
function MailIcon({ size = 16 }) {
  return <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
}
function PillIcon({ size = 16 }) {
  return <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M10.5 20.5L3.5 13.5a5 5 0 0 1 7.07-7.07l7 7a5 5 0 0 1-7.07 7.07z"/><line x1="8.5" y1="11.5" x2="13.5" y2="6.5"/></svg>
}
function SettingsIcon({ size = 16 }) {
  return <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
}
function BellIcon() {
  return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
}
function SearchIcon() {
  return <svg width="16" height="16" fill="none" stroke="#94a3b8" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
}

export default function AdminDashboard() {
  const navigate  = useNavigate()
  const location  = useLocation()

  const [adminUser]          = useState(() => JSON.parse(localStorage.getItem('adminUser') || '{}'))
  const token                = localStorage.getItem('token') || localStorage.getItem('adminToken')
  const [stats, setStats]    = useState({ doctors: 0, patients: 0, appointments: 0, muraciet: 0 })
  const [statErrors, setStatErrors] = useState({})
  const markStatError = (key) => setStatErrors(prev => ({ ...prev, [key]: true }))
  // Renders "—" instead of 0 when the underlying fetch failed, so a real zero
  // is never confused with "could not load this number".
  const safeStat = (key, value) => statErrors[key] ? '—' : (value ?? 0)
  const safeAmount = (value) => {
    const n = Number(value)
    return Number.isFinite(n) && n > 0 ? n : 0
  }
  const [appointments, setAppointments] = useState([])
  const [search, setSearch]  = useState('')
  const [loading, setLoading] = useState(true)
  const [billing,    setBilling]    = useState({ totalRevenue: 0, todayRevenue: 0 })
  const [labSummary, setLabSummary] = useState({ todayOrders: 0, byStatus: [] })
  const [todayAppts, setTodayAppts] = useState([])

  // Notifications
  const [notifs,       setNotifs]       = useState([])
  const [unreadCount,  setUnreadCount]  = useState(0)
  const [notifOpen,    setNotifOpen]    = useState(false)
  const [notifNow,     setNotifNow]     = useState(0)

  useEffect(() => {
    if (!token) { navigate('/admin'); return }
    const headers = { Authorization: `Bearer ${token}` }

    const p1 = fetch(`${API}/doctors?limit=200`, { headers })
      .then(r => r.json())
      .then(d1 => {
        const doctorList = d1.data?.doctors || d1.doctors || []
        setStats(prev => ({ ...prev, doctors: doctorList.length }))
      })
      .catch(() => markStatError('doctors'))

    const p2 = fetch(`${API}/patients?page=1&limit=1`, { headers })
      .then(r => r.json())
      .then(data => {
        const count = data.data?.total || data.total || 0
        setStats(prev => ({ ...prev, patients: count }))
      })
      .catch(() => markStatError('patients'))

    const p3 = fetch(`${API}/appointments?limit=1`, { headers })
      .then(r => r.json())
      .then(data => {
        const count = data.data?.total || data.total || 0
        setStats(prev => ({ ...prev, appointments: count }))
      })
      .catch(() => markStatError('appointments'))

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
          .catch(() => markStatError('muraciet'))
      })

    const p5 = fetch(`${API}/appointments?limit=5&sort=-createdAt`, { headers })
      .then(r => r.json())
      .then(data => {
        const list =
          Array.isArray(data.data?.appointments) ? data.data.appointments :
          Array.isArray(data.data)               ? data.data :
          Array.isArray(data.appointments)       ? data.appointments :
          Array.isArray(data.docs)               ? data.docs :
          Array.isArray(data)                    ? data : []
        setAppointments(list)
      })
      .catch(() => setAppointments([]))

    const p6 = fetch(`${API}/billing/summary`, { headers })
      .then(r => r.json())
      .then(d => setBilling({ totalRevenue: safeAmount(d.data?.totalRevenue), todayRevenue: safeAmount(d.data?.todayRevenue) }))
      .catch(() => markStatError('billing'))

    const p7 = fetch(`${API}/lab/summary`, { headers })
      .then(r => r.json())
      .then(d => setLabSummary({ todayOrders: safeAmount(d.data?.todayOrders), byStatus: d.data?.byStatus || [] }))
      .catch(() => markStatError('lab'))

    const today = new Date().toISOString().split('T')[0]
    const p8 = fetch(`${API}/appointments?date=${today}&limit=10`, { headers })
      .then(r => r.json())
      .then(d => {
        const list = d.data?.appointments || d.appointments || []
        setTodayAppts(list)
      })
      .catch(() => {})

    const p9 = fetch(`${API}/notifications?page=1&limit=20`, { headers })
      .then(r => r.json())
      .then(d => {
        const list = d.data?.notifications || []
        const now  = Date.now()
        setNotifNow(now)
        setNotifs(list.filter(n => now - new Date(n.createdAt).getTime() < 86400000))
        setUnreadCount(d.data?.unreadCount || 0)
      })
      .catch(() => {})

    Promise.allSettled([p1, p2, p3, p4, p5, p6, p7, p8, p9]).finally(() => setLoading(false))
  }, [navigate, token])

  const handleLogout = async () => {
    try { await api.post('/auth/logout') } catch {
      // Local session should still be cleared if server logout cannot complete.
    }
    clearAuthStorage()
    navigate('/admin')
  }

  const initial   = adminUser?.fullName?.[0]?.toUpperCase() || 'A'

  const markAllRead = () => {
    fetch(`${API}/notifications/read-all`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } })
      .then(() => { setNotifs(prev => prev.map(n => ({ ...n, isRead: true }))); setUnreadCount(0) })
      .catch(() => {})
  }

  const markOneRead = (id) => {
    fetch(`${API}/notifications/${id}/read`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } })
      .then(() => { setNotifs(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n)); setUnreadCount(p => Math.max(0, p - 1)) })
      .catch(() => {})
  }

  const timeAgo = (dateStr) => {
    const diff = notifNow - new Date(dateStr).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1)  return 'İndi'
    if (m < 60) return `${m} dəq əvvəl`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h} saat əvvəl`
    return `${Math.floor(h / 24)} gün əvvəl`
  }

  const typeColor = (type) => ({
    appointment: { bg: '#eff6ff', color: '#2563eb' },
    lab:         { bg: '#f0fdf4', color: '#16a34a' },
    billing:     { bg: '#fefce8', color: '#ca8a04' },
    admission:   { bg: '#fdf4ff', color: '#9333ea' },
    general:     { bg: '#f8fafc', color: '#64748b' },
  }[type] || { bg: '#f8fafc', color: '#64748b' })
  const labPending = labSummary.byStatus.find(s => s._id === 'pending')?.count || 0

  const STAT_CARDS = [
    {
      label: 'Həkimlər',     value: safeStat('doctors', stats.doctors),
      sub: 'aktiv həkim',
      iconBg: '#E0F7FA', iconColor: '#0E7490',
      icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    },
    {
      label: 'Pasiyentlər',  value: safeStat('patients', stats.patients),
      sub: 'qeydiyyatlı',
      iconBg: '#DCFCE7', iconColor: '#16A34A',
      icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    },
    {
      label: 'Randevular',   value: safeStat('appointments', stats.appointments),
      sub: 'ümumi',
      iconBg: '#EDE9FE', iconColor: '#7C3AED',
      icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    },
    {
      label: 'Müraciətlər',  value: safeStat('muraciet', stats.muraciet),
      sub: 'gözləyir',
      iconBg: '#FEF3C7', iconColor: '#D97706',
      icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    },
    {
      label: 'Bu gün gəlir', value: statErrors.billing ? '—' : safeAmount(billing.todayRevenue).toFixed(0) + ' ₼',
      sub: 'gündəlik',
      iconBg: '#FCE7F3', iconColor: '#BE185D',
      icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
    },
    {
      label: 'Ümumi gəlir',  value: statErrors.billing ? '—' : safeAmount(billing.totalRevenue).toFixed(0) + ' ₼',
      sub: 'ödənilmiş',
      iconBg: '#D1FAE5', iconColor: '#065F46',
      icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
    },
    {
      label: 'Lab sifarişi', value: statErrors.lab ? '—' : safeAmount(labSummary.todayOrders),
      sub: 'bu gün',
      iconBg: '#DBEAFE', iconColor: '#1D4ED8',
      icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18"/></svg>,
    },
    {
      label: 'Lab gözləyir', value: statErrors.lab ? '—' : safeAmount(labPending),
      sub: 'icrada',
      iconBg: '#FED7AA', iconColor: '#C2410C',
      icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    },
  ]

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#F8FAFC', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #E2E8F0', borderTopColor: '#1D8B95', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <span style={{ fontSize: 13, color: '#94A3B8' }}>Yüklənir...</span>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC', fontFamily: "'Source Sans 3', 'Inter', sans-serif" }} onClick={() => notifOpen && setNotifOpen(false)}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: 240, minHeight: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 50,
        background: 'linear-gradient(180deg, #061A2E 0%, #08233D 100%)',
        display: 'flex', flexDirection: 'column', overflowY: 'auto',
      }}>
        {/* Logo */}
        <div style={{ padding: '22px 18px 18px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: 'linear-gradient(135deg, #1D8B95, #0E6B73)',
            boxShadow: '0 0 14px rgba(29,139,149,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2.2" viewBox="0 0 24 24">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>Aslan Medical</div>
            <div style={{ color: '#4A6080', fontSize: 11 }}>Admin Panel</div>
          </div>
        </div>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 14px 6px', flexShrink: 0 }} />

        {/* Nav */}
        <nav style={{ flex: 1, padding: '4px 10px' }}>
          {NAV_ITEMS.map(({ label, path, icon: Icon }) => {
            const active = location.pathname === path
            return (
              <div key={path} onClick={() => navigate(path)} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 9, cursor: 'pointer',
                fontSize: 13, fontWeight: active ? 600 : 400, marginBottom: 1,
                color: active ? 'white' : '#B8C7D9',
                background: active ? 'rgba(29,139,149,0.22)' : 'transparent',
                borderLeft: active ? '3px solid rgba(29,139,149,0.8)' : '3px solid transparent',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'white' } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#B8C7D9' } }}
              >
                <Icon />
                <span style={{ flex: 1 }}>{label}</span>
                {active && <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#1D8B95', flexShrink: 0 }} />}
              </div>
            )
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '10px 10px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
          <div onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', borderRadius: 9, cursor: 'pointer',
            fontSize: 13, fontWeight: 400, color: '#B8C7D9',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#B8C7D9'; e.currentTarget.style.background = 'transparent' }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span>Çıxış</span>
          </div>
        </div>
      </aside>

      {/* ── RIGHT SIDE ── */}
      <div style={{ marginLeft: 240, flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* TOPBAR */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 10,
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #E2E8F0',
          padding: '0 28px', height: 64,
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <div style={{ position: 'relative', width: 560, maxWidth: '100%', flexShrink: 0 }}>
            <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <SearchIcon />
            </div>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Pasiyent, həkim və ya randevu axtar..."
              style={{
                width: '100%', height: 44, background: 'white',
                border: '1.5px solid #E2E8F0', borderRadius: 12,
                padding: '0 16px 0 42px', fontSize: 13.5, color: '#334155',
                outline: 'none', boxSizing: 'border-box',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => e.target.style.borderColor = '#1D8B95'}
              onBlur={e => e.target.style.borderColor = '#E2E8F0'}
            />
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={e => { e.stopPropagation(); setNotifOpen(o => !o) }}
                style={{
                  width: 40, height: 40, background: 'white', border: '1.5px solid #E2E8F0',
                  borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', position: 'relative', color: '#475569',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#1D8B95'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#E2E8F0'}
              >
                <BellIcon />
                {unreadCount > 0 && (
                  <div style={{ position: 'absolute', top: 6, right: 6, minWidth: 16, height: 16, background: '#EF4444', borderRadius: 8, border: '1.5px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: 'white', padding: '0 3px' }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </div>
                )}
              </button>

              {notifOpen && (
                <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', top: 48, right: 0, width: 340, background: 'white', borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.14)', border: '1px solid #F1F5F9', zIndex: 999, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 10px', borderBottom: '1px solid #F1F5F9' }}>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0F1B2D' }}>Bildirişlər</span>
                      <span style={{ fontSize: 11, color: '#94A3B8', marginLeft: 6 }}>Son 24 saat</span>
                    </div>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} style={{ fontSize: 11, color: '#1D8B95', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        Hamısını oxu
                      </button>
                    )}
                  </div>
                  <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                    {notifs.length === 0 ? (
                      <div style={{ padding: '32px 16px', textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>Bildiriş yoxdur</div>
                    ) : notifs.map(n => {
                      const tc = typeColor(n.type)
                      return (
                        <div key={n._id} onClick={() => !n.isRead && markOneRead(n._id)} style={{ display: 'flex', gap: 10, padding: '11px 16px', borderBottom: '1px solid #F8FAFC', background: n.isRead ? 'white' : '#F0FAFB', cursor: n.isRead ? 'default' : 'pointer', transition: 'background 0.15s' }}
                          onMouseEnter={e => { if (!n.isRead) e.currentTarget.style.background = '#E6F7F8' }}
                          onMouseLeave={e => { e.currentTarget.style.background = n.isRead ? 'white' : '#F0FAFB' }}
                        >
                          <div style={{ width: 7, height: 7, borderRadius: '50%', background: n.isRead ? 'transparent' : '#1D8B95', marginTop: 5, flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                              <span style={{ fontSize: 12, fontWeight: 600, color: '#0F1B2D' }}>{n.title}</span>
                              <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 10, background: tc.bg, color: tc.color, flexShrink: 0 }}>{n.type}</span>
                            </div>
                            <p style={{ margin: 0, fontSize: 11, color: '#64748B', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.message}</p>
                            <span style={{ fontSize: 10, color: '#94A3B8', marginTop: 3, display: 'block' }}>{timeAgo(n.createdAt)}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'white', border: '1.5px solid #E2E8F0',
              borderRadius: 12, padding: '5px 14px 5px 5px',
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: 9,
                background: 'linear-gradient(135deg, #1D8B95, #0B5F66)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: 13, fontWeight: 700, flexShrink: 0,
              }}>{initial}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0B1D34', lineHeight: 1.2 }}>{adminUser?.fullName || 'Admin'}</div>
                <div style={{ fontSize: 11, color: '#94A3B8', lineHeight: 1.2 }}>{adminUser?.email || 'admin@aslanmedical.az'}</div>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN */}
        <main style={{ padding: '24px 28px', flex: 1 }}>

          {/* ── Welcome Banner ── */}
          <div style={{
            borderRadius: 22, padding: '28px 32px', marginBottom: 20,
            background: 'linear-gradient(135deg, #1D8B95 0%, #0B5F66 100%)',
            position: 'relative', overflow: 'hidden', minHeight: 150,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            {/* Subtle decoration */}
            <div style={{ position: 'absolute', width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', top: -60, right: 160, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', bottom: -40, right: 40, pointerEvents: 'none' }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <h1 style={{ color: 'white', fontSize: 22, fontWeight: 800, margin: '0 0 6px', lineHeight: 1.3 }}>
                Xoş gəldiniz, {adminUser?.fullName || 'Admin'} 👋
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13.5, margin: 0 }}>
                Bugün <strong style={{ color: 'white' }}>{stats.appointments}</strong> randevu var,{' '}
                <strong style={{ color: 'white' }}>{stats.muraciet}</strong> yeni müraciət gözləyir
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10, position: 'relative', zIndex: 1, flexShrink: 0 }}>
              <button
                onClick={() => navigate('/admin/appointments?new=true')}
                style={{ height: 42, background: 'white', color: '#0B5F66', border: 'none', borderRadius: 11, padding: '0 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Yeni randevu
              </button>
              <button
                style={{ height: 42, background: 'rgba(255,255,255,0.12)', color: 'white', border: '1.5px solid rgba(255,255,255,0.3)', borderRadius: 11, padding: '0 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                Hesabat
              </button>
            </div>
          </div>

          {/* ── Stats Grid ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20 }}>
            {STAT_CARDS.map(c => (
              <div key={c.label} style={{
                background: '#FFFFFF', borderRadius: 18,
                border: '1px solid #E2E8F0',
                padding: '20px 22px', minHeight: 110,
                boxShadow: '0 6px 18px rgba(15,23,42,0.04)',
                display: 'flex', alignItems: 'center', gap: 16,
                transition: 'transform 0.15s, box-shadow 0.15s',
                cursor: 'default',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(15,23,42,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(15,23,42,0.04)' }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 13,
                  background: c.iconBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: c.iconColor, flexShrink: 0,
                }}>
                  {c.icon}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#0B1D34', lineHeight: 1, marginBottom: 4 }}>{c.value ?? 0}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#475569', lineHeight: 1.3, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.label}</div>
                  <div style={{ fontSize: 11.5, color: '#94A3B8', lineHeight: 1 }}>{c.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Bottom 3 Panels ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>

            {/* Panel 1 — Son Randevular */}
            <div style={{ background: '#FFFFFF', borderRadius: 18, border: '1px solid #E2E8F0', padding: 20, boxShadow: '0 6px 18px rgba(15,23,42,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AED' }}>
                    <CalendarIcon size={14} />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#0B1D34' }}>Son Randevular</span>
                </div>
                <span onClick={() => navigate('/admin/appointments')} style={{ fontSize: 12, color: '#1D8B95', cursor: 'pointer', fontWeight: 600 }}>Hamısına bax →</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {(appointments || []).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px 0', color: '#94A3B8', fontSize: 13 }}>Məlumat yoxdur</div>
                ) : (appointments || []).slice(0, 5).map((a, i) => {
                  const s = STATUS[a.status || 'scheduled'] || STATUS.scheduled
                  const pName = a.patientId?.userId?.fullName || a.patientId?.fullName || a.patient?.fullName || '—'
                  const dSpec = a.doctorId?.specialization || a.doctor?.specialization || ''
                  const dName = a.doctorId?.userId?.fullName || a.doctorId?.fullName || '—'
                  const dateStr = a.date ? new Date(a.date).toLocaleDateString('az-AZ', { day: 'numeric', month: 'short' }) : '—'
                  const pInit  = pName[0]?.toUpperCase() || '?'
                  return (
                    <div key={a._id || i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: i < Math.min(appointments.length, 5) - 1 ? '1px solid #F1F5F9' : 'none' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, flexShrink: 0, width: 36 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#0B1D34' }}>{a.startTime || '—'}</span>
                        <span style={{ fontSize: 10, color: '#94A3B8' }}>{dateStr}</span>
                      </div>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AED', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                        {pInit}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: '#0B1D34', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pName}</div>
                        <div style={{ fontSize: 11, color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dSpec || dName}</div>
                      </div>
                      <span style={{ background: s.bg, color: s.color, borderRadius: 6, padding: '2px 7px', fontSize: 10.5, fontWeight: 600, flexShrink: 0 }}>{s.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Panel 2 — Son fəaliyyətlər */}
            <div style={{ background: '#FFFFFF', borderRadius: 18, border: '1px solid #E2E8F0', padding: 20, boxShadow: '0 6px 18px rgba(15,23,42,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#0B1D34' }}>Son fəaliyyətlər</span>
                </div>
                <span style={{ fontSize: 12, color: '#1D8B95', cursor: 'pointer', fontWeight: 600 }}>Hamısına bax →</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {(appointments || []).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px 0', color: '#94A3B8', fontSize: 13 }}>Fəaliyyət yoxdur</div>
                ) : (appointments || []).slice(0, 5).map((a, i) => {
                  const pName = a.patientId?.userId?.fullName || a.patientId?.fullName || 'Pasiyent'
                  const s     = STATUS[a.status || 'scheduled'] || STATUS.scheduled
                  const ACTIVITY_ICONS = [
                    { bg: '#DCFCE7', color: '#16A34A', icon: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> },
                    { bg: '#DBEAFE', color: '#1D4ED8', icon: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
                    { bg: '#EDE9FE', color: '#7C3AED', icon: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
                    { bg: '#FEF3C7', color: '#D97706', icon: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
                    { bg: '#FCE7F3', color: '#BE185D', icon: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> },
                  ]
                  const ic = ACTIVITY_ICONS[i % ACTIVITY_ICONS.length]
                  const dateStr = a.createdAt ? new Date(a.createdAt).toLocaleDateString('az-AZ', { day: 'numeric', month: 'short' }) : (a.date ? new Date(a.date).toLocaleDateString('az-AZ', { day: 'numeric', month: 'short' }) : '—')
                  return (
                    <div key={a._id || i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: i < Math.min(appointments.length, 5) - 1 ? '1px solid #F1F5F9' : 'none' }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: ic.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: ic.color, flexShrink: 0 }}>
                        {ic.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: '#0B1D34', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Randevu — {pName}</div>
                        <div style={{ fontSize: 11, color: '#94A3B8' }}>{s.label}</div>
                      </div>
                      <span style={{ fontSize: 10.5, color: '#94A3B8', flexShrink: 0 }}>{dateStr}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Panel 3 — Bugünün Cədvəli */}
            <div style={{ background: '#FFFFFF', borderRadius: 18, border: '1px solid #E2E8F0', padding: 20, boxShadow: '0 6px 18px rgba(15,23,42,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: '#E0F7FA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0E7490' }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#0B1D34' }}>Bugünün Cədvəli</span>
                </div>
                <span onClick={() => navigate('/admin/appointments')} style={{ fontSize: 12, color: '#1D8B95', cursor: 'pointer', fontWeight: 600 }}>Hamısına bax →</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {todayAppts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px 0', color: '#94A3B8', fontSize: 13 }}>Bu gün randevu yoxdur</div>
                ) : todayAppts.slice(0, 6).map((a, i) => {
                  const dName = a.doctorId?.userId?.fullName || a.doctorId?.fullName || 'Həkim'
                  const spec  = a.doctorId?.specialization || ''
                  const time  = a.startTime ? a.startTime + (a.endTime ? `–${a.endTime}` : '') : '—'
                  const count = todayAppts.filter(x => (x.doctorId?._id || x.doctorId) === (a.doctorId?._id || a.doctorId)).length
                  return (
                    <div key={a._id || i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: i < Math.min(todayAppts.length, 6) - 1 ? '1px solid #F1F5F9' : 'none' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, background: '#E0F7FA', color: '#0E7490', borderRadius: 7, padding: '3px 8px', flexShrink: 0, whiteSpace: 'nowrap' }}>
                        {time}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: '#0B1D34', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dName}</div>
                        {spec && <div style={{ fontSize: 11, color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{spec}</div>}
                      </div>
                      <span style={{ fontSize: 10.5, fontWeight: 700, background: '#F0FDF4', color: '#16A34A', borderRadius: 6, padding: '2px 7px', flexShrink: 0 }}>
                        {count}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

          </div>
        </main>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @media (max-width: 1280px) {
          .dash-stats { grid-template-columns: repeat(2,1fr) !important; }
          .dash-panels { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 768px) {
          .dash-stats { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
