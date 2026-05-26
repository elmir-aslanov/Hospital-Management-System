import { useNavigate, useLocation } from 'react-router-dom'

const NAV = [
  { key: 'dashboard',     label: 'Dashboard',    path: '/doctor/dashboard',     icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { key: 'patients',      label: 'Xəstələrim',   path: '/doctor/patients',      icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { key: 'prescriptions', label: 'Reseptlər',    path: '/doctor/prescriptions', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M10.5 20.5L3.5 13.5a5 5 0 0 1 7.07-7.07l7 7a5 5 0 0 1-7.07 7.07z"/><line x1="8.5" y1="11.5" x2="13.5" y2="6.5"/></svg> },
  { key: 'analyses',      label: 'Analizlər',    path: '/doctor/analyses',      icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
  { key: 'profile',       label: 'Profilim',     path: '/doctor/profile',       icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
]

const PAGE_TITLES = {
  dashboard:     'Dashboard',
  patients:      'Xəstələrim',
  prescriptions: 'Reseptlər',
  analyses:      'Analizlər',
  profile:       'Profilim',
}

export default function DoctorLayout({ children, activePage }) {
  const navigate  = useNavigate()
  const doctorUser = JSON.parse(localStorage.getItem('adminUser') || localStorage.getItem('doctorUser') || '{}')
  const initial   = doctorUser?.fullName?.[0]?.toUpperCase() || 'D'

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    localStorage.removeItem('doctorToken')
    localStorage.removeItem('doctorUser')
    navigate('/admin')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>

      {/* SIDEBAR */}
      <aside style={{
        width: 220, minHeight: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 50,
        background: 'linear-gradient(180deg,#0a1628 0%,#0d2137 60%,#0a1f35 100%)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '20px 20px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#00848e', boxShadow: '0 0 12px rgba(0,132,142,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="15" height="15" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>Aslan Medical</div>
            <div style={{ color: '#475569', fontSize: 10 }}>Həkim Paneli</div>
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
                background: active ? 'rgba(0,132,142,0.2)' : 'transparent',
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
      <div style={{ marginLeft: 220, flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* TOPBAR */}
        <header style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(241,245,249,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,0,0,0.06)', padding: '12px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f1b2d' }}>{PAGE_TITLES[activePage] || 'Həkim Paneli'}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'white', border: '1px solid #e2e8f0', borderRadius: 10, padding: '5px 14px 5px 6px' }}>
            <div style={{ width: 30, height: 30, borderRadius: 7, background: 'linear-gradient(135deg,#00848e,#00a8b5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 700 }}>{initial}</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#0f1b2d' }}>{doctorUser?.fullName || 'Həkim'}</div>
              <div style={{ fontSize: 10, color: '#94a3b8' }}>{doctorUser?.specialization || doctorUser?.role || 'DOCTOR'}</div>
            </div>
          </div>
        </header>

        <main style={{ padding: '24px 28px', flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  )
}
