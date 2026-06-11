import { useState, useEffect } from 'react'
import { useNavigate }         from 'react-router-dom'
import api from '../../api/axios'
import { clearAuthStorage } from '../../utils/authSession'

const BASE  = 'http://localhost:5000'
const token = () => localStorage.getItem('token')
const hdrs  = () => ({ Authorization: `Bearer ${token()}` })
const TEAL  = '#00848e'
const NAVY  = '#0a1628'
const FONT  = "'Source Sans 3', sans-serif"

const STATUS_COLORS = {
  scheduled:   '#64748b',
  waiting:     '#f59e0b',
  in_progress: '#2563eb',
  completed:   '#16a34a',
  cancelled:   '#ef4444',
}

const STATUS_LABELS = {
  scheduled:   'Planlandı',
  waiting:     'Növbədə',
  in_progress: 'Müayinədə',
  completed:   'Tamamlandı',
  cancelled:   'Ləğv',
}

export default function ReceptionistDashboard() {
  const navigate = useNavigate()

  const [todayAppts,  setTodayAppts]  = useState([])
  const [muraciet,    setMuraciet]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [stats,       setStats]       = useState({ appointments: 0, pending: 0, muraciet: 0 })
  const [user]                         = useState(() => JSON.parse(localStorage.getItem('user') || '{}'))
  const [searchQ,     setSearchQ]     = useState('')
  const [searchRes,   setSearchRes]   = useState([])

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    Promise.all([
      fetch(`${BASE}/api/v1/appointments?date=${today}&limit=20`, { headers: hdrs() }).then(r => r.json()),
      fetch(`${BASE}/api/v1/contact?limit=10`, { headers: hdrs() }).then(r => r.json()),
    ]).then(([aData, mData]) => {
      const appts = aData.data?.appointments || []
      const msgs  = Array.isArray(mData.data) ? mData.data : (mData.data?.contacts || mData.contacts || [])
      setTodayAppts(appts)
      setMuraciet(msgs)
      setStats({
        appointments: appts.length,
        pending:      msgs.filter(m => !m.isRead).length,
        muraciet:     msgs.length,
      })
    }).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const q = searchQ.trim()
    if (!q) {
      return undefined
    }

    const timer = setTimeout(() => {
      fetch(`${BASE}/api/v1/patients?search=${encodeURIComponent(q)}&limit=5`, { headers: hdrs() })
        .then(r => r.json())
        .then(data => setSearchRes(data.data?.patients || []))
        .catch(() => setSearchRes([]))
    }, 400)

    return () => clearTimeout(timer)
  }, [searchQ])

  const handleLogout = async () => {
    try { await api.post('/auth/logout') } catch {
      // Local session should still be cleared if server logout cannot complete.
    }
    clearAuthStorage()
    navigate('/login')
  }

  const todayText = new Date().toLocaleDateString('az-AZ', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div style={{ fontFamily: FONT, minHeight: '100vh' }}>

      {/* Top header bar */}
      <div style={{ background: NAVY, color: 'white', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22 }}>🏥</span>
          <div>
            <span style={{ fontWeight: 800, fontSize: 15 }}>Aslan Medical</span>
            <span style={{ marginLeft: 10, fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>Resepsiya Paneli</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>{user.fullName || 'Resepsionist'}</span>
          <button
            onClick={handleLogout}
            style={{ padding: '6px 16px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: FONT }}
          >
            Çıxış
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ background: '#f8fafc', minHeight: 'calc(100vh - 60px)', padding: 24 }}>

        {/* Welcome banner */}
        <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${TEAL})`, borderRadius: 16, padding: '20px 28px', marginBottom: 24, color: 'white' }}>
          <h2 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 800 }}>
            Xoş gəldiniz, {user.fullName || 'Resepsionist'} 👋
          </h2>
          <p style={{ margin: 0, opacity: 0.8, fontSize: 13 }}>
            Bu gün: {todayText}
          </p>
        </div>

        {/* 3 stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Bugünün randevuları',     value: stats.appointments, color: TEAL },
            { label: 'Oxunmamış müraciətlər',   value: stats.pending,      color: '#f59e0b' },
            { label: 'Ümumi müraciətlər',       value: stats.muraciet,     color: '#2563eb' },
          ].map((c, i) => (
            <div key={i} style={{ background: 'white', borderRadius: 12, padding: '18px 20px', border: '1px solid #f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: c.color }}>{c.value}</div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{c.label}</div>
            </div>
          ))}
        </div>

        {/* 2-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: 20 }}>

          {/* LEFT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Quick appointment + patient search */}
            <div style={{ background: 'white', borderRadius: 14, border: '1px solid #f1f5f9', padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: NAVY }}>Pasiyent axtarışı və yeni randevu</h3>
                <button
                  onClick={() => navigate('/register')}
                  style={{ border: 'none', background: TEAL, color: 'white', borderRadius: 9, padding: '9px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}
                >
                  Yeni pasiyent
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 160px auto', gap: 10, alignItems: 'start' }}>
                <div style={{ position: 'relative' }}>
                  <input
                    value={searchQ}
                    onChange={e => {
                      const next = e.target.value
                      setSearchQ(next)
                      if (!next.trim()) setSearchRes([])
                    }}
                    placeholder="Pasiyent adı, ID və ya telefon..."
                    style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: '11px 12px', fontSize: 13, color: NAVY, outline: 'none', boxSizing: 'border-box', fontFamily: FONT }}
                  />
                  {searchRes.length > 0 && (
                    <div style={{ position: 'absolute', zIndex: 20, top: 44, left: 0, right: 0, background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, boxShadow: '0 12px 28px rgba(15,23,42,0.12)', overflow: 'hidden' }}>
                      {searchRes.map((p, i) => {
                        const name = p.userId?.fullName || p.fullName || '—'
                        return (
                          <div
                            key={p._id || i}
                            onClick={() => setSearchQ(name)}
                            style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, cursor: 'pointer', borderBottom: i < searchRes.length - 1 ? '1px solid #f8fafc' : 'none' }}
                          >
                            <span style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{name}</span>
                            <span style={{ fontSize: 11, color: '#94a3b8' }}>{p.patientId || p._id}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
                <input type="date" style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 12px', fontSize: 13, color: NAVY, outline: 'none', fontFamily: FONT }} />
                <input type="time" style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 12px', fontSize: 13, color: NAVY, outline: 'none', fontFamily: FONT }} />
                <button
                  onClick={() => navigate('/admin/appointments?new=true')}
                  style={{ border: 'none', background: NAVY, color: 'white', borderRadius: 10, padding: '11px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, whiteSpace: 'nowrap' }}
                >
                  Randevu yarat
                </button>
              </div>
            </div>

            {/* Today appointments */}
            <div style={{ background: 'white', borderRadius: 14, border: '1px solid #f1f5f9', padding: 20 }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: NAVY }}>Bu günün cədvəli</h3>
              {loading ? (
                <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>Yüklənir...</div>
              ) : todayAppts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>Bu gün randevu yoxdur</div>
              ) : todayAppts.map((a, i) => {
                const pName = a.patientId?.userId?.fullName || a.patientId?.fullName || '—'
                const dName = a.doctorId?.userId?.fullName  || a.doctorId?.fullName  || '—'
                const color = STATUS_COLORS[a.status] || '#64748b'
                return (
                  <div key={a._id || i} style={{ display: 'grid', gridTemplateColumns: '78px 1fr 120px', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < todayAppts.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, background: '#e0f7fa', color: TEAL, borderRadius: 7, padding: '5px 8px', textAlign: 'center' }}>
                      {a.startTime || a.time || '—'}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: NAVY, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pName}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{dName}</div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 8px', borderRadius: 8, background: color + '18', color, textAlign: 'center' }}>
                      {STATUS_LABELS[a.status] || a.status || '—'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* RIGHT */}
          <div style={{ background: 'white', borderRadius: 14, border: '1px solid #f1f5f9', padding: 20, alignSelf: 'start' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: NAVY }}>Müraciətlər</h3>
              <button
                onClick={() => navigate('/admin/muraciet')}
                style={{ border: 'none', background: 'transparent', color: TEAL, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}
              >
                Hamısına bax →
              </button>
            </div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>Yüklənir...</div>
            ) : muraciet.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>Müraciət yoxdur</div>
            ) : muraciet.slice(0, 5).map((m, i) => {
              const name = m.fullName || m.name || m.firstName || '—'
              const preview = m.message || m.text || m.subject || ''
              return (
                <div key={m._id || i} style={{ padding: '11px 0', borderBottom: i < Math.min(muraciet.length, 5) - 1 ? '1px solid #f8fafc' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: NAVY, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 10, padding: '3px 8px', color: m.isRead ? '#16a34a' : '#f59e0b', background: m.isRead ? '#dcfce7' : '#fef3c7', flexShrink: 0 }}>
                      {m.isRead ? 'Oxunub' : 'Yeni'}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 5px', fontSize: 12, color: '#64748b', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{preview}</p>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>{m.createdAt ? new Date(m.createdAt).toLocaleDateString('az-AZ') : '—'}</span>
                </div>
              )
            })}
          </div>

        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          div[style*="grid-template-columns: 1.55fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="grid-template-columns: 1fr 160px 160px auto"] {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 768px) {
          div[style*="grid-template-columns: repeat(3,1fr)"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="grid-template-columns: 1fr 160px 160px auto"],
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="grid-template-columns: 78px 1fr 120px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
