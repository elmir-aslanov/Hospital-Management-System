import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const FONT = "'Source Sans 3', 'Raleway', sans-serif"
const NAVY = '#0a1628'
const TEAL = '#00848e'
const API  = 'http://localhost:5000/api/v1'

const NAV = [
  { label: 'Dashboard',     icon: '🏠', path: '/doctor/dashboard' },
  { label: 'Xəstələrim',    icon: '👥', path: '/doctor/patients' },
  { label: 'Randevularım',  icon: '📅', path: '/doctor/appointments' },
  { label: 'Reseptlər',     icon: '💊', path: '/doctor/prescriptions' },
  { label: 'Profilim',      icon: '👤', path: '/doctor/profile' },
]

const STATUS_STYLE = {
  scheduled:   { background: '#fef9c3', color: '#854d0e', label: 'Gözləyir' },
  waiting:     { background: '#fef9c3', color: '#854d0e', label: 'Gözləmədə' },
  in_progress: { background: '#dbeafe', color: '#1e40af', label: 'Davam edir' },
  completed:   { background: '#dcfce7', color: '#166534', label: 'Tamamlandı' },
  cancelled:   { background: '#fee2e2', color: '#991b1b', label: 'Ləğv edildi' },
  missed:      { background: '#f3f4f6', color: '#374151', label: 'Buraxıldı' },
}

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('adminToken')}`, 'Content-Type': 'application/json' }
}

const TABS = ['Analizlər', 'Reseptlər', 'Tarix']

function RightPanel({ doctor, selectedAppt, token }) {
  const [activeTab, setActiveTab]       = useState('Analizlər')
  const [analyses, setAnalyses]         = useState([])
  const [prescriptions, setPrescripts]  = useState([])
  const [showForm, setShowForm]         = useState(false)
  const [form, setForm]                 = useState({ medicine: '', dose: '', duration: '', note: '' })
  const [submitting, setSubmitting]     = useState(false)
  const [msg, setMsg]                   = useState('')

  const patientId = selectedAppt?.patientId?._id

  useEffect(() => {
    if (!patientId) return
    setAnalyses([]); setPrescripts([]); setMsg('')

    fetch(`${API}/doctor/patients/${patientId}/analyses`, { headers: authHeaders() })
      .then(r => r.json()).then(d => setAnalyses(Array.isArray(d.data) ? d.data : []))
      .catch(() => {})

    fetch(`${API}/doctor/patients/${patientId}/prescriptions`, { headers: authHeaders() })
      .then(r => r.json()).then(d => setPrescripts(Array.isArray(d.data) ? d.data : []))
      .catch(() => {})
  }, [patientId])

  const handlePrescribe = async e => {
    e.preventDefault()
    setSubmitting(true); setMsg('')
    try {
      const res = await fetch(`${API}/doctor/prescriptions`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          patientId,
          visitId: selectedAppt?.visitId || selectedAppt?._id,
          medicine: form.medicine, dose: form.dose,
          duration: form.duration, note: form.note,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setMsg('Resept yazıldı')
      setShowForm(false)
      setForm({ medicine: '', dose: '', duration: '', note: '' })
    } catch (err) {
      setMsg(err.message || 'Xəta baş verdi')
    } finally {
      setSubmitting(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0',
    borderRadius: '6px', fontSize: '14px', fontFamily: FONT,
    boxSizing: 'border-box', outline: 'none', marginBottom: '10px',
  }

  if (!selectedAppt) {
    return (
      <div style={{ textAlign: 'center', paddingTop: '40px' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: TEAL, color: 'white', fontSize: '24px', fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 12px',
        }}>
          {doctor?.fullName?.[0]?.toUpperCase() || 'D'}
        </div>
        <p style={{ fontWeight: 600, fontSize: '16px', color: NAVY }}>{doctor?.fullName}</p>
        <p style={{ fontSize: '13px', color: '#94a3b8' }}>{doctor?.specialization || 'Həkim'}</p>
        <p style={{ fontSize: '13px', color: '#64748b', marginTop: '16px' }}>
          Pasiyent seçmək üçün sol sütundakı "Ətraflı" düyməsinə basın
        </p>
      </div>
    )
  }

  const patient = selectedAppt.patientId
  const patientName = patient?.userId?.fullName || 'Naməlum'
  const patientPhone = patient?.userId?.phone || '—'

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <p style={{ fontWeight: 700, fontSize: '16px', color: NAVY, margin: '0 0 4px' }}>{patientName}</p>
        <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>📞 {patientPhone}</p>
        <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0' }}>ID: {patient?.patientId || '—'}</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '0' }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '8px 14px', fontSize: '13px', fontFamily: FONT, cursor: 'pointer',
            border: 'none', background: 'none', fontWeight: activeTab === tab ? 600 : 400,
            color: activeTab === tab ? TEAL : '#64748b',
            borderBottom: activeTab === tab ? `2px solid ${TEAL}` : '2px solid transparent',
          }}>{tab}</button>
        ))}
      </div>

      {activeTab === 'Analizlər' && (
        <div>
          {analyses.length === 0
            ? <p style={{ fontSize: '13px', color: '#94a3b8' }}>Analiz yoxdur</p>
            : analyses.map((a, i) => (
              <div key={i} style={{ padding: '10px', background: '#f8fafc', borderRadius: '8px', marginBottom: '8px' }}>
                <p style={{ fontWeight: 600, fontSize: '13px', color: NAVY, margin: '0 0 2px' }}>{a.type}</p>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>{a.description}</p>
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: '4px 0 0' }}>{new Date(a.createdAt).toLocaleDateString('az-AZ')}</p>
              </div>
            ))
          }
        </div>
      )}

      {activeTab === 'Reseptlər' && (
        <div>
          {msg && <p style={{ fontSize: '13px', color: msg === 'Resept yazıldı' ? '#16a34a' : '#e53e3e', marginBottom: '8px' }}>{msg}</p>}
          {prescriptions.length === 0
            ? <p style={{ fontSize: '13px', color: '#94a3b8' }}>Resept yoxdur</p>
            : prescriptions.map((p, i) => (
              <div key={i} style={{ padding: '10px', background: '#f8fafc', borderRadius: '8px', marginBottom: '8px' }}>
                {p.medications?.map((m, j) => (
                  <div key={j}>
                    <p style={{ fontWeight: 600, fontSize: '13px', color: NAVY, margin: '0 0 2px' }}>{m.name}</p>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Doza: {m.dosage} · Müddət: {m.duration}</p>
                  </div>
                ))}
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: '4px 0 0' }}>{new Date(p.createdAt).toLocaleDateString('az-AZ')}</p>
              </div>
            ))
          }

          {!showForm
            ? <button onClick={() => setShowForm(true)} style={{
                marginTop: '12px', background: TEAL, color: 'white', border: 'none',
                padding: '9px 16px', borderRadius: '6px', fontSize: '13px',
                cursor: 'pointer', fontFamily: FONT,
              }}>+ Yeni Resept</button>
            : <form onSubmit={handlePrescribe} style={{ marginTop: '12px' }}>
                <input placeholder="Dərman adı *" value={form.medicine} onChange={e => setForm(f => ({ ...f, medicine: e.target.value }))} style={inputStyle} required />
                <input placeholder="Doza *" value={form.dose} onChange={e => setForm(f => ({ ...f, dose: e.target.value }))} style={inputStyle} required />
                <input placeholder="Müddət (məs. 7 gün) *" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} style={inputStyle} required />
                <textarea placeholder="Qeyd" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }} />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="submit" disabled={submitting} style={{ background: TEAL, color: 'white', border: 'none', padding: '9px 16px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontFamily: FONT }}>
                    {submitting ? 'Yazılır...' : 'Resepti Yaz'}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} style={{ background: '#f1f5f9', color: '#64748b', border: 'none', padding: '9px 16px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontFamily: FONT }}>
                    Ləğv et
                  </button>
                </div>
              </form>
          }
        </div>
      )}

      {activeTab === 'Tarix' && (
        <p style={{ fontSize: '13px', color: '#94a3b8' }}>Keçmiş ziyarətlər yoxdur</p>
      )}
    </div>
  )
}

export default function DoctorDashboard() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const isMobile  = window.innerWidth < 768

  const [doctor, setDoctor]           = useState(null)
  const [appointments, setAppts]      = useState([])
  const [selectedAppt, setSelected]   = useState(null)
  const [sidebarOpen, setSidebar]     = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) { navigate('/admin'); return }
    const u = localStorage.getItem('adminUser')
    if (u) setDoctor(JSON.parse(u))

    fetch(`${API}/doctor/appointments/today`, { headers: authHeaders() })
      .then(r => r.json()).then(d => { if (Array.isArray(d.data)) setAppts(d.data) })
      .catch(() => {})
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    navigate('/admin')
  }

  const Sidebar = () => (
    <div style={{
      width: '240px', background: NAVY, height: '100vh',
      position: 'fixed', top: 0, left: isMobile ? (sidebarOpen ? 0 : '-240px') : 0,
      display: 'flex', flexDirection: 'column', zIndex: 100,
      transition: 'left 0.25s ease',
    }}>
      <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <img src="/logo.png" alt="Aslan Medical" style={{ height: '40px' }} />
      </div>
      <nav style={{ flex: 1, paddingTop: '8px' }}>
        {NAV.map(item => {
          const active = location.pathname === item.path
          return (
            <div key={item.path} onClick={() => { navigate(item.path); setSidebar(false) }} style={{
              padding: '12px 24px', cursor: 'pointer', fontSize: '14px',
              display: 'flex', alignItems: 'center', gap: '10px',
              color: active ? 'white' : '#94a3b8',
              background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderLeft: active ? `3px solid ${TEAL}` : '3px solid transparent',
              fontFamily: FONT,
            }}>
              <span>{item.icon}</span><span>{item.label}</span>
            </div>
          )
        })}
      </nav>
      <div style={{ padding: '20px' }}>
        <button onClick={handleLogout} style={{
          width: '100%', background: 'rgba(255,255,255,0.06)',
          color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)',
          padding: '10px', borderRadius: '8px', cursor: 'pointer',
          fontSize: '14px', fontFamily: FONT,
        }}>Çıxış</button>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', fontFamily: FONT }}>
      <Sidebar />
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebar(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }} />
      )}

      <div style={{ marginLeft: isMobile ? 0 : '240px', padding: isMobile ? '16px' : '32px', background: '#f1f5f9', minHeight: '100vh', flex: 1 }}>
        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isMobile && <button onClick={() => setSidebar(true)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>☰</button>}
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: NAVY, margin: 0 }}>Dashboard</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '14px', color: '#64748b' }}>{doctor?.fullName}</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: TEAL, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 700 }}>
              {doctor?.fullName?.[0]?.toUpperCase() || 'D'}
            </div>
          </div>
        </div>

        {/* Two columns */}
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexDirection: isMobile ? 'column' : 'row' }}>

          {/* LEFT — Today's appointments */}
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: NAVY, marginBottom: '16px' }}>Bu günün randevuları</h2>
            {appointments.length === 0
              ? <div style={{ background: 'white', borderRadius: '12px', padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>Bu gün randevu yoxdur</div>
              : appointments.map((appt, i) => {
                  const s = STATUS_STYLE[appt.status] || STATUS_STYLE.scheduled
                  const name = appt.patientId?.userId?.fullName || 'Naməlum'
                  return (
                    <div key={appt._id || i} style={{
                      background: 'white', borderRadius: '12px', padding: '16px 20px',
                      marginBottom: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '15px', color: NAVY, margin: '0 0 4px' }}>{name}</p>
                        <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>{appt.startTime} – {appt.endTime}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ ...s, padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>{s.label}</span>
                        <button
                          onClick={() => setSelected(appt)}
                          style={{ background: TEAL, color: 'white', border: 'none', padding: '7px 14px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontFamily: FONT }}
                        >Ətraflı</button>
                      </div>
                    </div>
                  )
                })
            }
          </div>

          {/* RIGHT — Patient detail / doctor profile */}
          <div style={{ width: isMobile ? '100%' : '360px', background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', flexShrink: 0 }}>
            <RightPanel doctor={doctor} selectedAppt={selectedAppt} />
          </div>

        </div>
      </div>
    </div>
  )
}
