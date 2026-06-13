import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../../api/axios';
import { clearAuthStorage } from '../../utils/authSession';
import Icons from '../../components/Icons';
import '../../styles/dashboard.css';

const FONT = "'Source Sans 3', 'Raleway', sans-serif";
const TEAL = '#00848e';

const NAV_ITEMS = [
  { label: 'Əsas Səhifə',  href: '/dashboard',                   Icon: Icons.Home        },
  { label: 'Pasiyentlər',  href: '/dashboard/patients',          Icon: Icons.Users       },
  { label: 'Həkimlər',     href: '/dashboard/doctors',           Icon: Icons.Stethoscope },
  { label: 'Randevular',   href: '/dashboard/appointments',      Icon: Icons.Calendar    },
  { label: 'Palatalar',    href: '/dashboard/wards',             Icon: Icons.Bed         },
  { label: 'Site Həkimləri', href: '/dashboard/site-doctors', Icon: Icons.Globe       },
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  let user = {};
  try { user = JSON.parse(localStorage.getItem('user') || '{}'); } catch {}

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch {
      // Local session should still be cleared if server logout cannot complete.
    }
    clearAuthStorage();
    toast.success('Sistemdən uğurla çıxdınız.');
    navigate('/');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: FONT, background: 'var(--bg)' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: collapsed ? '64px' : '220px',
        background: '#0a1628',
        display: 'flex', flexDirection: 'column',
        flexShrink: 0, transition: 'width 0.25s ease',
        overflow: 'hidden',
      }}>

        {/* Logo + collapse toggle */}
        <div style={{
          height: '64px', display: 'flex', alignItems: 'center',
          padding: '0 16px', gap: '10px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
        }}>
          {!collapsed && (
            <img src="/yenilogo.png" alt="Aslan Medical"
              style={{ height: '38px', maxWidth: '150px', width: 'auto', objectFit: 'contain', flexShrink: 0 }}
              onError={e => e.currentTarget.style.display = 'none'}
            />
          )}
          <button onClick={() => setCollapsed(c => !c)}
            style={{
              marginLeft: 'auto', background: 'none', border: 'none',
              cursor: 'pointer', color: 'rgba(255,255,255,0.5)', padding: '4px',
              display: 'flex', flexShrink: 0,
            }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {collapsed ? <polyline points="9 18 15 12 9 6"/> : <polyline points="15 18 9 12 15 6"/>}
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
          {NAV_ITEMS.map(({ label, href, Icon }) => (
            <NavLink key={href} to={href} end={href === '/dashboard'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: collapsed ? '10px 20px' : '10px 18px',
                margin: '2px 8px', borderRadius: '8px',
                textDecoration: 'none', whiteSpace: 'nowrap', overflow: 'hidden',
                fontSize: '14px', fontWeight: 500, fontFamily: FONT,
                color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
                background: isActive ? TEAL : 'transparent',
                transition: 'background 0.15s, color 0.15s',
              })}
              onMouseEnter={e => { if (!e.currentTarget.style.background.includes(TEAL)) e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
              onMouseLeave={e => { if (!e.currentTarget.style.background.includes(TEAL)) e.currentTarget.style.background = 'transparent'; }}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              {!collapsed && label}
            </NavLink>
          ))}
        </nav>

        {/* User + logout */}
        <div style={{
          padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
        }}>
          {!collapsed && (
            <div style={{ padding: '8px 10px', marginBottom: '6px' }}>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: FONT }}>
                {user.role}
              </div>
              <div style={{
                fontSize: '13px', fontWeight: 600,
                color: 'rgba(255,255,255,0.85)', fontFamily: FONT,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {user.fullName || user.name || 'İstifadəçi'}
              </div>
            </div>
          )}
          <button onClick={logout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
              padding: collapsed ? '10px 20px' : '10px 12px',
              background: 'none', border: 'none', cursor: 'pointer', borderRadius: '8px',
              color: 'rgba(255,255,255,0.45)', fontSize: '14px', fontFamily: FONT,
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.color = '#f87171'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
          >
            <Icons.LogOut size={18} style={{ flexShrink: 0 }} />
            {!collapsed && 'Çıxış'}
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '32px', minWidth: 0 }}>
        <Outlet />
      </main>
    </div>
  );
}
