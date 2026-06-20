import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState, useEffect, useCallback } from 'react'
import api from '../../api/axios'
import { clearAuthStorage } from '../../utils/authSession'
import { C } from './DoctorUI'

const NAV = [
  {
    key: 'dashboard', path: '/doctor/dashboard',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    key: 'patients', path: '/doctor/patients',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    key: 'prescriptions', path: '/doctor/prescriptions',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
        <rect x="9" y="3" width="6" height="4" rx="1"/>
        <line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>
      </svg>
    ),
  },
  {
    key: 'analyses', path: '/doctor/analyses',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    key: 'documents', path: '/doctor/documents',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z"/>
        <line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/>
      </svg>
    ),
  },
  {
    key: 'consent-forms', path: '/doctor/consent-forms',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
  },
  {
    key: 'profile', path: '/doctor/profile',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
]

export default function DoctorLayout({ children }) {
  const navigate   = useNavigate()
  const location   = useLocation()
  const { t }      = useTranslation()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const doctorUser = (() => {
    try { return JSON.parse(localStorage.getItem('adminUser') || localStorage.getItem('doctorUser') || '{}') }
    catch { return {} }
  })()
  const initial = (doctorUser?.fullName || 'D')[0].toUpperCase()

  // Derive active page from URL
  const activePath = location.pathname

  const handleLogout = async () => {
    try { await api.post('/auth/logout') } catch {}
    clearAuthStorage()
    navigate('/admin')
  }

  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false) }, [location.pathname])

  // Prevent scroll when drawer open on mobile
  useEffect(() => {
    if (drawerOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  // Escape key to close drawer
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') closeDrawer() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [closeDrawer])

  const sidebarContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{ padding: '18px 16px 14px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 7,
          background: C.teal, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="15" height="15" fill="none" stroke="white" strokeWidth="2.2" viewBox="0 0 24 24" aria-hidden="true">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
        </div>
        <div>
          <div style={{ color: 'white', fontWeight: 700, fontSize: 13, lineHeight: 1.2 }}>Aslan Medical</div>
          <div style={{ color: '#4e7a9e', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {t('doctorLayout.panel')}
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '0 14px 6px' }} />

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '4px 10px', overflowY: 'auto' }} aria-label="Doctor panel navigation">
        {NAV.map(item => {
          const active = activePath === item.path || (item.path !== '/doctor/dashboard' && activePath.startsWith(item.path))
          return (
            <button
              key={item.key}
              onClick={() => navigate(item.path)}
              aria-current={active ? 'page' : undefined}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '0 12px', height: 44,
                borderRadius: 8, cursor: 'pointer', marginBottom: 2,
                fontSize: 13, fontWeight: active ? 600 : 400,
                color: active ? 'white' : '#7fa8c8',
                background: active ? 'rgba(22,140,150,0.18)' : 'transparent',
                borderLeft: `3px solid ${active ? C.teal : 'transparent'}`,
                border: 'none',
                textAlign: 'left',
                transition: 'background 0.12s, color 0.12s',
                outline: 'none',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
              onFocus={e => { e.currentTarget.style.boxShadow = '0 0 0 2px rgba(22,140,150,0.5)' }}
              onBlur={e => { e.currentTarget.style.boxShadow = 'none' }}
            >
              {item.icon}
              <span style={{ flex: 1 }}>{t(`doctorLayout.nav.${item.key}`)}</span>
            </button>
          )
        })}
      </nav>

      {/* User card + logout */}
      <div style={{ padding: '10px 10px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
        {/* Compact user info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 12px', marginBottom: 4 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg,#168C96,#1aaabb)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: 12, fontWeight: 700, flexShrink: 0,
          }}>{initial}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {doctorUser?.fullName || t('doctorLayout.fallbackDoctor')}
            </div>
            <div style={{ fontSize: 10, color: '#4e7a9e' }}>
              {t('doctorLayout.roleLabel')}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          aria-label={t('doctorLayout.logout')}
          style={{
            display: 'flex', alignItems: 'center', gap: 9,
            width: '100%', padding: '0 12px', height: 40,
            borderRadius: 8, cursor: 'pointer',
            fontSize: 13, color: '#7fa8c8',
            background: 'transparent', border: 'none', textAlign: 'left',
            transition: 'all 0.12s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#7fa8c8'; e.currentTarget.style.background = 'transparent' }}
          onFocus={e => { e.currentTarget.style.boxShadow = '0 0 0 2px rgba(239,68,68,0.4)' }}
          onBlur={e => { e.currentTarget.style.boxShadow = 'none' }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span>{t('doctorLayout.logout')}</span>
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg, fontFamily: "'Source Sans 3','Segoe UI',sans-serif" }}>

      {/* ── Desktop sidebar ── */}
      <aside style={{
        width: 252, minHeight: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 50,
        background: C.sidebar, display: 'flex', flexDirection: 'column',
      }} aria-label="Sidebar">
        {sidebarContent}
      </aside>

      {/* ── Mobile drawer overlay ── */}
      {drawerOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }}
          onClick={closeDrawer}
          aria-hidden="true"
        >
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(7,27,46,0.6)' }} />
          <aside
            style={{
              width: 252, height: '100%', background: C.sidebar,
              position: 'relative', zIndex: 1, overflowY: 'auto',
            }}
            onClick={e => e.stopPropagation()}
            aria-label="Mobile navigation"
          >
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* ── Right content ── */}
      <div style={{ marginLeft: 252, flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Topbar */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 10,
          background: 'rgba(244,247,250,0.95)', backdropFilter: 'blur(8px)',
          borderBottom: `1px solid ${C.border}`,
          padding: '0 28px', height: 64,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* Hamburger — shown on ≤900px via CSS-in-JS trick */}
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Menyu aç"
            style={{
              display: 'none', background: 'none', border: 'none',
              cursor: 'pointer', padding: 4, borderRadius: 6, color: C.navy,
            }}
            className="dr-hamburger"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          {/* Page title is rendered inside each page — topbar stays minimal */}
          <div />

          {/* User chip */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 9,
            background: C.white, border: `1px solid ${C.border}`,
            borderRadius: 8, padding: '5px 12px 5px 6px',
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'linear-gradient(135deg,#168C96,#1aaabb)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: 11, fontWeight: 700,
            }}>{initial}</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.navy, lineHeight: 1.2 }}>
                {doctorUser?.fullName || t('doctorLayout.fallbackDoctor')}
              </div>
              <div style={{ fontSize: 10, color: C.sub }}>
                {doctorUser?.specialization || t('doctorLayout.roleLabel')}
              </div>
            </div>
          </div>
        </header>

        <main style={{ padding: '24px 28px', flex: 1 }}>
          {children}
        </main>
      </div>

      {/* Responsive: hide desktop sidebar, show hamburger on mobile */}
      <style>{`
        @media (max-width: 900px) {
          aside[aria-label="Sidebar"] { display: none !important; }
          div[style*="marginLeft: 252"] { margin-left: 0 !important; }
          .dr-hamburger { display: flex !important; }
        }
        @media (min-width: 901px) {
          .dr-hamburger { display: none !important; }
        }
      `}</style>
    </div>
  )
}
