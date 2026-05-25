import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const FONT = "'Source Sans 3', 'Raleway', sans-serif"
const NAVY = '#0a1628'
const TEAL = '#00848e'

const NAV_ITEMS = ['Dashboard', 'Həkimlər', 'Pasiyentlər', 'Randevular', 'Müraciətlər']

const STAT_CARDS = [
  { label: 'Həkimlər',    value: 0 },
  { label: 'Pasiyentlər', value: 0 },
  { label: 'Randevular',  value: 0 },
  { label: 'Müraciətlər', value: 0 },
]

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [adminUser, setAdminUser] = useState(null)
  const [activeNav, setActiveNav] = useState('Dashboard')
  const isMobile = window.innerWidth < 768

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) { navigate('/admin'); return }
    const user = localStorage.getItem('adminUser')
    if (user) setAdminUser(JSON.parse(user))
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    navigate('/admin')
  }

  return (
    <div style={{ display: 'flex', fontFamily: FONT }}>

      {/* Sidebar */}
      {!isMobile && (
        <div style={{
          width: '240px', background: NAVY, height: '100vh',
          position: 'fixed', top: 0, left: 0,
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ padding: '24px' }}>
            <img src="/logo.png" alt="Aslan Medical" style={{ height: '40px' }} />
          </div>

          <nav style={{ flex: 1 }}>
            {NAV_ITEMS.map(item => (
              <div
                key={item}
                onClick={() => setActiveNav(item)}
                style={{
                  padding: '12px 24px', cursor: 'pointer', fontSize: '14px',
                  color: activeNav === item ? 'white' : '#aaa',
                  background: activeNav === item ? 'rgba(255,255,255,0.1)' : 'transparent',
                  borderLeft: activeNav === item ? `3px solid ${TEAL}` : '3px solid transparent',
                }}
              >
                {item}
              </div>
            ))}
          </nav>

          <div style={{ padding: '24px' }}>
            <button
              onClick={handleLogout}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.08)',
                color: '#aaa', border: '1px solid rgba(255,255,255,0.12)',
                padding: '10px', borderRadius: '8px', cursor: 'pointer',
                fontSize: '14px', fontFamily: FONT,
              }}
            >
              Çıxış
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div style={{
        marginLeft: isMobile ? 0 : '240px',
        padding: '32px',
        background: '#f8fafc',
        minHeight: '100vh',
        flex: 1,
      }}>
        {/* Mobile logout */}
        {isMobile && (
          <button onClick={handleLogout} style={{ marginBottom: '16px', background: NAVY, color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: FONT }}>
            Çıxış
          </button>
        )}

        <h1 style={{ fontSize: '24px', fontWeight: 700, color: NAVY, margin: 0 }}>
          Xoş gəldiniz, {adminUser?.fullName || 'Admin'}
        </h1>

        {/* Stat cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
          gap: '24px',
          marginTop: '32px',
        }}>
          {STAT_CARDS.map(card => (
            <div key={card.label} style={{
              background: 'white', borderRadius: '12px', padding: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}>
              <p style={{ fontSize: '13px', color: '#888', margin: '0 0 8px', fontFamily: FONT }}>{card.label}</p>
              <p style={{ fontSize: '28px', fontWeight: 700, color: NAVY, margin: 0, fontFamily: FONT }}>{card.value}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
