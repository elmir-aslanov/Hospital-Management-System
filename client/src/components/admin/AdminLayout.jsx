import { useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'

const BASE = 'http://localhost:5000'

const NAV = [
  { key: 'dashboard',    label: 'Ana səhifə',  path: '/admin/dashboard',     icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { key: 'doctors',      label: 'Həkimlər',    path: '/admin/doctors',        icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { key: 'patients',     label: 'Pasiyentlər', path: '/admin/patients',       icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  { key: 'appointments', label: 'Randevular',  path: '/admin/appointments',   icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { key: 'muraciet',     label: 'Müraciətlər', path: '/admin/muraciet',       icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> },
  { key: 'inventory',    label: 'İnventory',   path: '/admin/inventory',      icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M10.5 20.5L3.5 13.5a5 5 0 0 1 7.07-7.07l7 7a5 5 0 0 1-7.07 7.07z"/><line x1="8.5" y1="11.5" x2="13.5" y2="6.5"/></svg> },
  { key: 'analytics',    label: 'Analytics',   path: '/admin/analytics',      icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
  { key: 'settings',     label: 'Ayarlar',     path: '/admin/settings',       icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
]

export default function AdminLayout({ children, activePage }) {
  const navigate   = useNavigate()
  const [search, setSearch] = useState('')
  const adminUser  = JSON.parse(localStorage.getItem('adminUser') || '{}')
  const initial    = adminUser?.fullName?.[0]?.toUpperCase() || 'A'

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    navigate('/admin')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>

      {/* SIDEBAR */}
      <aside style={{
        width: 240, minHeight: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 50,
        background: 'linear-gradient(180deg,#0a1628 0%,#0d2137 60%,#0a1f35 100%)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '20px 20px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: '#00848e', boxShadow: '0 0 14px rgba(0,132,142,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>Aslan Medical</div>
            <div style={{ color: '#475569', fontSize: 11 }}>Admin Panel</div>
          </div>
        </div>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '0 14px 8px' }} />

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
                {active && <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#00848e' }} />}
              </div>
            )
          })}
        </nav>

        <div style={{ padding: '12px 10px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
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
            <button style={{ width: 34, height: 34, background: 'white', border: '1px solid #e2e8f0', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <div style={{ position: 'absolute', top: 5, right: 5, width: 7, height: 7, background: '#ef4444', borderRadius: '50%', border: '1.5px solid white' }} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white', border: '1px solid #e2e8f0', borderRadius: 10, padding: '5px 12px 5px 5px' }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg,#00848e,#00a8b5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, fontWeight: 700 }}>{initial}</div>
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
