import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { BASE } from '../../api/config.js'
import AvatarUpload from '../common/AvatarUpload'

const NAV = [
  { key: 'dashboard',    label: 'Ana səhifə',   path: '/admin/dashboard',    icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { key: 'doctors',      label: 'Həkimlər',     path: '/admin/doctors',      icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { key: 'patients',     label: 'Pasiyentlər',  path: '/admin/patients',     icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  { key: 'appointments', label: 'Randevular',   path: '/admin/appointments', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { key: 'users',        label: 'İstifadəçilər', path: '/admin/users',       icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="23" y1="11" x2="17" y2="11"/><line x1="20" y1="8" x2="20" y2="14"/></svg> },
  { key: 'departments',  label: 'Şöbələr',      path: '/admin/departments',  icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg> },
  { key: 'muraciet',     label: 'Müraciətlər',  path: '/admin/muraciet',     icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> },
  { key: 'billing',      label: 'Billing',      path: '/admin/billing',      icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
  { key: 'pricelist',   label: 'Qiymətlər',   path: '/admin/pricelist',    icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
  { key: 'lab',          label: 'Laboratoriya', path: '/admin/lab',           icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18"/></svg> },
  { key: 'inventory',    label: 'Anbar',        path: '/admin/inventory',    icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 3H8L6 7h12l-2-4z"/></svg> },
  { key: 'analytics',    label: 'Analitika',    path: '/admin/analytics',    icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
  { key: 'settings',     label: 'Ayarlar',      path: '/admin/settings',     icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l-.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
]

export default function AdminLayout({ children, activePage }) {
  const navigate   = useNavigate()
  const [search, setSearch] = useState('')
  const [unreadMuraciet, setUnreadMuraciet] = useState(0)
  const [notifs, setNotifs]               = useState([])
  const [unreadCount, setUnreadCount]     = useState(0)
  const [notifOpen, setNotifOpen]         = useState(false)
  const [notifLoading, setNotifLoading]   = useState(false)
  const adminUser  = JSON.parse(localStorage.getItem('adminUser') || '{}')
  const [adminPhoto, setAdminPhoto] = useState(
    (() => { try { return JSON.parse(localStorage.getItem('user') || '{}').photoUrl || '' } catch { return '' } })()
  )

  useEffect(() => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token')
    if (!token) return
    fetch(`${BASE}/api/v1/muraciet`, {
      headers: { 'Authorization': 'Bearer ' + token },
    })
      .then(r => r.json())
      .then(d => {
        const list = Array.isArray(d.data) ? d.data : []
        setUnreadMuraciet(list.filter(i => !i.isRead).length)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const t = localStorage.getItem('adminToken') || localStorage.getItem('token')
    if (!t) return
    fetch(`${BASE}/api/v1/notifications?page=1&limit=20`, {
      headers: { Authorization: `Bearer ${t}` },
    })
      .then(r => r.json())
      .then(d => {
        const list = d.data?.notifications || []
        const now  = Date.now()
        const last24 = list.filter(n => now - new Date(n.createdAt).getTime() < 86400000)
        setNotifs(last24)
        setUnreadCount(d.data?.unreadCount || 0)
      })
      .catch(() => {})
  }, [])

  const initial    = adminUser?.fullName?.[0]?.toUpperCase() || 'A'

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    navigate('/admin')
  }

  const markAllRead = () => {
    const t = localStorage.getItem('adminToken') || localStorage.getItem('token')
    fetch(`${BASE}/api/v1/notifications/read-all`, {
      method: 'PATCH', headers: { Authorization: `Bearer ${t}` },
    }).then(() => {
      setNotifs(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    }).catch(() => {})
  }

  const markOneRead = (id) => {
    const t = localStorage.getItem('adminToken') || localStorage.getItem('token')
    fetch(`${BASE}/api/v1/notifications/${id}/read`, {
      method: 'PATCH', headers: { Authorization: `Bearer ${t}` },
    }).then(() => {
      setNotifs(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    }).catch(() => {})
  }

  const typeColor = (type) => ({
    appointment: { bg: '#eff6ff', color: '#2563eb', label: 'Randevu' },
    lab:         { bg: '#f0fdf4', color: '#16a34a', label: 'Lab' },
    billing:     { bg: '#fefce8', color: '#ca8a04', label: 'Ödəniş' },
    admission:   { bg: '#fdf4ff', color: '#9333ea', label: 'Qəbul' },
    general:     { bg: '#f8fafc', color: '#64748b', label: 'Ümumi' },
  }[type] || { bg: '#f8fafc', color: '#64748b', label: 'Ümumi' })

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1)  return 'İndicə'
    if (m < 60) return `${m} dəq əvvəl`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h} saat əvvəl`
    return `${Math.floor(h / 24)} gün əvvəl`
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }} onClick={() => notifOpen && setNotifOpen(false)}>

      {/* SIDEBAR */}
      <aside style={{
        width: 240, minHeight: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 50,
        background: 'linear-gradient(180deg,#0a1628 0%,#0d2137 60%,#0a1f35 100%)',
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto',
      }}>
        <div style={{ padding: '20px 20px 16px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: '#00848e', boxShadow: '0 0 14px rgba(0,132,142,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>Aslan Medical</div>
            <div style={{ color: '#475569', fontSize: 11 }}>Admin Panel</div>
          </div>
        </div>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '0 14px 8px', flexShrink: 0 }} />

        <nav style={{ flex: 1, padding: '0 10px' }}>
          {NAV.map(item => {
            const active = activePage === item.key
            return (
              <div key={item.key} onClick={() => navigate(item.path)} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 9, cursor: 'pointer',
                fontSize: 13, fontWeight: 500, marginBottom: 2,
                color: active ? 'white' : '#94a3b8',
                background: active ? 'rgba(0,132,142,0.18)' : 'transparent',
                borderLeft: active ? '3px solid #00848e' : '3px solid transparent',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
              >
                {item.icon}
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.key === 'muraciet' && unreadMuraciet > 0 && !active && (
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444' }} />
                )}
                {active && <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#00848e' }} />}
              </div>
            )
          })}
        </nav>

        <div style={{ padding: '12px 10px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          <div onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 9, cursor: 'pointer', fontSize: 13, color: '#94a3b8', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'transparent' }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span>Çıxış</span>
          </div>
        </div>
      </aside>

      {/* RIGHT */}
      <div style={{ marginLeft: 240, flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* TOPBAR */}
        <header style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(241,245,249,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,0,0,0.06)', padding: '12px 28px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
            <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
              <svg width="14" height="14" fill="none" stroke="#94a3b8" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Axtar..." style={{ width: '100%', background: 'white', border: '1px solid #e2e8f0', borderRadius: 10, padding: '8px 14px 8px 36px', fontSize: 13, color: '#64748b', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setNotifOpen(o => !o)}
                style={{ width: 34, height: 34, background: 'white', border: '1px solid #e2e8f0', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}
              >
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                {unreadCount > 0 && (
                  <div style={{ position: 'absolute', top: 4, right: 4, minWidth: 16, height: 16, background: '#ef4444', borderRadius: 8, border: '1.5px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: 'white', padding: '0 3px' }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </div>
                )}
              </button>

              {notifOpen && (
                <div
                  onClick={e => e.stopPropagation()}
                  style={{ position: 'absolute', top: 42, right: 0, width: 340, background: 'white', borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.14)', border: '1px solid #f1f5f9', zIndex: 999, overflow: 'hidden' }}
                >
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 10px', borderBottom: '1px solid #f1f5f9' }}>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0f1b2d' }}>Bildirişlər</span>
                      <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 6 }}>Son 24 saat</span>
                    </div>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} style={{ fontSize: 11, color: '#00848e', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        Hamısını oxu
                      </button>
                    )}
                  </div>

                  {/* List */}
                  <div style={{ maxHeight: 380, overflowY: 'auto' }}>
                    {notifs.length === 0 ? (
                      <div style={{ padding: '32px 16px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                        Son 24 saatda bildiriş yoxdur
                      </div>
                    ) : notifs.map(n => {
                      const tc = typeColor(n.type)
                      return (
                        <div
                          key={n._id}
                          onClick={() => !n.isRead && markOneRead(n._id)}
                          style={{ display: 'flex', gap: 10, padding: '11px 16px', borderBottom: '1px solid #f8fafc', background: n.isRead ? 'white' : '#f0fafb', cursor: n.isRead ? 'default' : 'pointer', transition: 'background 0.15s' }}
                          onMouseEnter={e => { if (!n.isRead) e.currentTarget.style.background = '#e6f7f8' }}
                          onMouseLeave={e => { e.currentTarget.style.background = n.isRead ? 'white' : '#f0fafb' }}
                        >
                          <div style={{ width: 7, height: 7, borderRadius: '50%', background: n.isRead ? 'transparent' : '#00848e', marginTop: 5, flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                              <span style={{ fontSize: 12, fontWeight: 600, color: '#0f1b2d' }}>{n.title}</span>
                              <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 10, background: tc.bg, color: tc.color, flexShrink: 0 }}>{tc.label}</span>
                            </div>
                            <p style={{ margin: 0, fontSize: 11, color: '#64748b', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.message}</p>
                            <span style={{ fontSize: 10, color: '#94a3b8', marginTop: 3, display: 'block' }}>{timeAgo(n.createdAt)}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white', border: '1px solid #e2e8f0', borderRadius: 10, padding: '5px 12px 5px 5px' }}>
              <AvatarUpload
                currentUrl={adminPhoto}
                userName={adminUser?.fullName || 'Admin'}
                size={34}
                onSuccess={(url) => {
                  setAdminPhoto(url)
                  try {
                    const u = JSON.parse(localStorage.getItem('user') || '{}')
                    localStorage.setItem('user', JSON.stringify({ ...u, photoUrl: url }))
                  } catch {}
                }}
              />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#0f1b2d' }}>{adminUser?.fullName || 'Admin'}</div>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>{adminUser?.email || ''}</div>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main style={{ padding: '24px 28px', flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  )
}
