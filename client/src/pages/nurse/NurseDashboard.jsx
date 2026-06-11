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

export default function NurseDashboard() {
  const navigate = useNavigate()

  const [todayAppts, setTodayAppts] = useState([])
  const [patients,   setPatients]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [stats,      setStats]      = useState({ total: 0, waiting: 0, completed: 0 })
  const [user,       setUser]       = useState({})

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user') || '{}')
    setUser(u)

    const today = new Date().toISOString().split('T')[0]
    Promise.all([
      fetch(`${BASE}/api/v1/appointments?date=${today}&limit=20`, { headers: hdrs() }).then(r => r.json()),
      fetch(`${BASE}/api/v1/patients?limit=10`, { headers: hdrs() }).then(r => r.json()),
    ]).then(([apptData, patData]) => {
      const appts = apptData.data?.appointments || []
      setTodayAppts(appts)
      setStats({
        total:     appts.length,
        waiting:   appts.filter(a => a.status === 'waiting').length,
        completed: appts.filter(a => a.status === 'completed').length,
      })
      setPatients(patData.data?.patients || [])
    }).finally(() => setLoading(false))
  }, [])

  const handleLogout = async () => {
    try { await api.post('/auth/logout') } catch {
      // Local session should still be cleared if server logout cannot complete.
    }
    clearAuthStorage()
    navigate('/login')
  }

  return (
    <div style={{ fontFamily: FONT, minHeight: '100vh' }}>

      {/* Top header bar */}
      <div style={{ background: NAVY, color: 'white', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22 }}>🏥</span>
          <div>
            <span style={{ fontWeight: 800, fontSize: 15 }}>Aslan Medical</span>
            <span style={{ marginLeft: 10, fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>Nurse Panel</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>{user.fullName || 'Nurse'}</span>
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
            Xoş gəldiniz, {user.fullName || 'Nurse'} 👋
          </h2>
          <p style={{ margin: 0, opacity: 0.8, fontSize: 13 }}>
            Bu gün: {new Date().toLocaleDateString('az-AZ', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>

        {/* 3 stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Bu günün randevuları', value: stats.total,     color: TEAL      },
            { label: 'Gözləyən',             value: stats.waiting,   color: '#f59e0b' },
            { label: 'Tamamlanan',           value: stats.completed, color: '#16a34a' },
          ].map((c, i) => (
            <div key={i} style={{ background: 'white', borderRadius: 12, padding: '18px 20px', border: '1px solid #f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: c.color }}>{c.value}</div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{c.label}</div>
            </div>
          ))}
        </div>

        {/* 2-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20 }}>

          {/* LEFT — Today appointments */}
          <div style={{ background: 'white', borderRadius: 14, border: '1px solid #f1f5f9', padding: 20 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: NAVY }}>Bu günün randevuları</h3>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>Yüklənir...</div>
            ) : todayAppts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>Bu gün randevu yoxdur</div>
            ) : todayAppts.map((a, i) => {
              const pName = a.patientId?.userId?.fullName || a.patientId?.fullName || '—'
              const dName = a.doctorId?.userId?.fullName  || a.doctorId?.fullName  || '—'
              const color = STATUS_COLORS[a.status] || '#64748b'
              return (
                <div key={a._id || i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < todayAppts.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, background: '#e0f7fa', color: TEAL, borderRadius: 7, padding: '3px 8px', flexShrink: 0 }}>
                    {a.startTime || '—'}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: NAVY, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pName}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{dName}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 8, background: color + '18', color, flexShrink: 0 }}>
                    {STATUS_LABELS[a.status] || a.status}
                  </span>
                </div>
              )
            })}
          </div>

          {/* RIGHT — Recent patients */}
          <div style={{ background: 'white', borderRadius: 14, border: '1px solid #f1f5f9', padding: 20 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: NAVY }}>Son Pasiyentlər</h3>
            {patients.slice(0, 8).map((p, i) => {
              const name = p.userId?.fullName || p.fullName || '—'
              return (
                <div key={p._id || i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: i < 7 ? '1px solid #f8fafc' : 'none' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg, ${TEAL}, ${NAVY})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                    {name[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: NAVY, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{p.patientId}{p.bloodGroup ? ` · ${p.bloodGroup}` : ''}</div>
                  </div>
                </div>
              )
            })}
          </div>

        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
