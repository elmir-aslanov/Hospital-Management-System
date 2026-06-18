import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import DoctorLayout from '../../components/doctor/DoctorLayout'
import { C, Badge, Spinner, Avatar } from '../../components/doctor/DoctorUI'
import { BASE } from '../../api/config.js'

const TABS = ['Analizlər', 'Reseptlər', 'Tarix']

function getAge(dob) {
  if (!dob) return null
  return Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000))
}

function formatDate(str) {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// ── Patient detail panel (right) ─────────────────────────────────────────────
function PatientPanel({ doctor, patient, onClose, token }) {
  const [tab, setTab]               = useState('Analizlər')
  const [analyses, setAnalyses]     = useState([])
  const [prescripts, setPrescripts] = useState([])
  const [history, setHistory]       = useState([])
  const [showForm, setShowForm]     = useState(false)
  const [form, setForm]             = useState({ medicine: '', dose: '', duration: '', note: '' })
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg]               = useState('')

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  const patId   = patient?._id

  useEffect(() => {
    if (!patId) return
    setAnalyses([]); setPrescripts([]); setHistory([]); setMsg('')

    fetch(`${BASE}/api/v1/doctor/patients/${patId}/analyses`, { headers })
      .then(r => r.json()).then(d => setAnalyses(Array.isArray(d.data) ? d.data : Array.isArray(d) ? d : []))
      .catch(() => {})

    fetch(`${BASE}/api/v1/doctor/patients/${patId}/prescriptions`, { headers })
      .then(r => r.json()).then(d => setPrescripts(Array.isArray(d.data) ? d.data : Array.isArray(d) ? d : []))
      .catch(() => {})

    fetch(`${BASE}/api/v1/appointments?patientId=${patId}&limit=20`, { headers })
      .then(r => r.json()).then(d => setHistory(Array.isArray(d) ? d : d.appointments || d.data || []))
      .catch(() => {})
  }, [patId])

  // Escape key
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])

  const handlePrescribe = async e => {
    e.preventDefault()
    if (!form.medicine.trim() || !form.dose.trim() || !form.duration.trim()) {
      setMsg('Bütün məcburi sahələri doldurun'); return
    }
    setSubmitting(true); setMsg('')
    try {
      const res = await fetch(`${BASE}/api/v1/doctor/prescriptions`, {
        method: 'POST', headers,
        body: JSON.stringify({ patientId: patId, medicine: form.medicine, dose: form.dose, duration: form.duration, note: form.note }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Xəta baş verdi')
      setMsg('success')
      setShowForm(false)
      setForm({ medicine: '', dose: '', duration: '', note: '' })
      fetch(`${BASE}/api/v1/doctor/patients/${patId}/prescriptions`, { headers })
        .then(r => r.json()).then(d => setPrescripts(Array.isArray(d.data) ? d.data : Array.isArray(d) ? d : []))
        .catch(() => {})
    } catch (err) { setMsg(err.message) }
    finally { setSubmitting(false) }
  }

  if (!patient) {
    return (
      <div style={{ padding: '24px 20px', textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: C.tealDim, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: C.teal }}>
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
          </svg>
        </div>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.navy, margin: '0 0 6px' }}>Pasiyent seçilməyib</p>
        <p style={{ fontSize: 12, color: C.sub, margin: 0, lineHeight: 1.5 }}>
          Randevu sırasından <strong>Ətraflı</strong> düyməsinə basın
        </p>
      </div>
    )
  }

  const name  = patient.userId?.fullName || patient.fullName || 'Naməlum'
  const phone = patient.userId?.phone    || patient.phone    || '—'

  const inp = {
    width: '100%', padding: '8px 10px', fontSize: 12,
    border: `1px solid ${C.border}`, borderRadius: 7, outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div>
      {/* Patient header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, paddingBottom: 14, borderBottom: `1px solid ${C.border}` }}>
        <Avatar name={name} size={38} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: C.navy, margin: '0 0 1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</p>
          <p style={{ fontSize: 11, color: C.sub, margin: 0 }}>{phone} · {patient.patientId || ''}</p>
        </div>
        <button onClick={onClose} aria-label="Bağla" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 20, lineHeight: 1, padding: 2 }}>×</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, marginBottom: 14 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '7px 12px', fontSize: 12, cursor: 'pointer', border: 'none', background: 'none',
            fontWeight: tab === t ? 600 : 400,
            color: tab === t ? C.teal : C.sub,
            borderBottom: `2px solid ${tab === t ? C.teal : 'transparent'}`,
            marginBottom: -1,
          }}>{t}</button>
        ))}
      </div>

      {/* Tab: Analyses */}
      {tab === 'Analizlər' && (
        analyses.length === 0
          ? <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: '16px 0' }}>Analiz tapılmadı</p>
          : analyses.map((a, i) => (
            <div key={i} style={{ padding: '9px 11px', background: '#f8fafc', borderRadius: 7, marginBottom: 7 }}>
              <p style={{ fontWeight: 600, fontSize: 13, color: C.navy, margin: '0 0 2px' }}>{a.type || a.testName || '—'}</p>
              <p style={{ fontSize: 12, color: C.sub, margin: 0 }}>{a.description || a.result || ''}</p>
              <p style={{ fontSize: 11, color: '#94a3b8', margin: '3px 0 0' }}>{formatDate(a.createdAt)}</p>
            </div>
          ))
      )}

      {/* Tab: Prescriptions */}
      {tab === 'Reseptlər' && (
        <div>
          {msg === 'success' && <p style={{ fontSize: 12, color: '#16a34a', marginBottom: 8 }}>Resept yazıldı</p>}
          {msg && msg !== 'success' && <p style={{ fontSize: 12, color: '#ef4444', marginBottom: 8 }}>{msg}</p>}
          {prescripts.length === 0
            ? <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: '8px 0' }}>Resept yoxdur</p>
            : prescripts.map((p, i) => (
              <div key={i} style={{ padding: '9px 11px', background: '#f8fafc', borderRadius: 7, marginBottom: 7 }}>
                {p.medications?.map((m, j) => (
                  <p key={j} style={{ fontWeight: 600, fontSize: 13, color: C.navy, margin: '0 0 2px' }}>{m.name} – {m.dosage}</p>
                ))}
                {p.medicine && <p style={{ fontWeight: 600, fontSize: 13, color: C.navy, margin: '0 0 2px' }}>{p.medicine} — {p.dose}</p>}
                <p style={{ fontSize: 11, color: '#94a3b8', margin: '3px 0 0' }}>{formatDate(p.createdAt)}</p>
              </div>
            ))
          }
          {!showForm
            ? <button onClick={() => setShowForm(true)} style={{ marginTop: 10, width: '100%', background: C.teal, color: 'white', border: 'none', padding: '8px 0', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ Yeni Resept</button>
            : <form onSubmit={handlePrescribe} style={{ marginTop: 10, background: '#f0fafa', borderRadius: 9, padding: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[['Dərman adı *', 'medicine'], ['Doza *', 'dose'], ['Müddət *', 'duration']].map(([ph, key]) => (
                    <input key={key} placeholder={ph} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={inp} />
                  ))}
                </div>
                <textarea placeholder="Qeyd" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} rows={2} style={{ ...inp, height: 'auto', marginTop: 8, resize: 'vertical', fontFamily: 'inherit' }} />
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button type="submit" disabled={submitting} style={{ flex: 1, background: C.teal, color: 'white', border: 'none', padding: '8px 0', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
                    {submitting ? 'Yazılır...' : 'Resepti Yaz'}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} style={{ padding: '8px 14px', background: 'white', border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 12, cursor: 'pointer', color: '#475569' }}>Ləğv et</button>
                </div>
              </form>
          }
        </div>
      )}

      {/* Tab: History */}
      {tab === 'Tarix' && (
        history.length === 0
          ? <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: '16px 0' }}>Tibbi tarixçə yoxdur</p>
          : history.map((h, i) => (
            <div key={i} style={{ padding: '9px 11px', background: '#f8fafc', borderRadius: 7, marginBottom: 7, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: C.navy, margin: 0 }}>{formatDate(h.date)} {h.time ? `· ${h.time}` : ''}</p>
              <Badge status={h.status || 'scheduled'} />
            </div>
          ))
      )}
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function DoctorDashboard() {
  const navigate  = useNavigate()
  const [doctor, setDoctor]             = useState(null)
  const [appointments, setAppointments] = useState([])
  const [selectedPatient, setSelected]  = useState(null)
  const [loading, setLoading]           = useState(true)
  const [stats, setStats]               = useState({})

  const token   = localStorage.getItem('adminToken') || localStorage.getItem('doctorToken')
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    if (!token) { navigate('/admin'); return }
    const u = localStorage.getItem('adminUser') || localStorage.getItem('doctorUser')
    if (u) { try { setDoctor(JSON.parse(u)) } catch {} }

    fetch(`${BASE}/api/v1/doctor/appointments?date=${new Date().toISOString().split('T')[0]}`, { headers })
      .then(r => r.json())
      .then(d => setAppointments(d.data?.appointments || d.appointments || []))
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false))

    fetch(`${BASE}/api/v1/doctor/stats`, { headers })
      .then(r => r.json()).then(d => setStats(d.data || {}))
      .catch(() => {})
  }, [])

  const today = new Date().toLocaleDateString('az-AZ', { day: 'numeric', month: 'long', year: 'numeric' })

  const statCards = [
    { label: 'Bu günkü randevular', value: stats.todayCount     || 0, accent: C.teal    },
    { label: 'Gözləyir',           value: stats.pendingCount   || 0, accent: '#f59e0b'  },
    { label: 'Tamamlandı',         value: stats.completedCount || 0, accent: '#22c55e'  },
    { label: 'Ümumi randevu',      value: stats.totalCount     || 0, accent: '#6366f1'  },
  ]

  const closePanel = useCallback(() => setSelected(null), [])

  return (
    <DoctorLayout>
      {/* Page intro */}
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ margin: '0 0 2px', fontSize: 22, fontWeight: 700, color: C.navy, fontFamily: "'Raleway',sans-serif" }}>Ümumi baxış</h1>
        <p style={{ margin: 0, fontSize: 13, color: C.sub }}>{today}</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
        {statCards.map((s, i) => (
          <div key={i} style={{ background: C.white, borderRadius: 12, padding: '14px 16px', border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.accent, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: C.sub, marginTop: 5 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Appointments + detail */}
      <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>

        {/* Left: Today's appointments */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: C.navy, margin: '0 0 12px', fontFamily: "'Raleway',sans-serif" }}>
            Bugünün randevuları
          </h2>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner /></div>
          ) : appointments.length === 0 ? (
            <div style={{ background: C.white, borderRadius: 12, padding: '28px 24px', textAlign: 'center', border: `1px solid ${C.border}` }}>
              <svg width="32" height="32" fill="none" stroke="#CBD5E1" strokeWidth="1.5" viewBox="0 0 24 24" style={{ margin: '0 auto 10px', display: 'block' }} aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <p style={{ fontSize: 13, color: C.sub, margin: 0 }}>Bu gün randevu yoxdur</p>
            </div>
          ) : appointments.map((apt, i) => {
            const pat    = apt.patientId || apt.patient || {}
            const name   = pat.userId?.fullName || pat.fullName || 'Naməlum'
            const dob    = pat.dateOfBirth
            const age    = getAge(dob)
            const gender = pat.gender === 'male' ? 'Kişi' : pat.gender === 'female' ? 'Qadın' : null
            const time   = apt.time || apt.startTime || ''
            return (
              <div
                key={apt._id || i}
                style={{
                  background: C.white, borderRadius: 10, padding: '12px 16px',
                  marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12,
                  border: `1px solid ${C.border}`,
                  transition: 'border-color 0.12s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#b2d8db'}
                onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
              >
                {time && (
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.teal, background: C.tealDim, borderRadius: 6, padding: '5px 10px', minWidth: 46, textAlign: 'center', flexShrink: 0 }}>{time}</div>
                )}
                <Avatar name={name} size={34} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: C.navy, margin: '0 0 1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</p>
                  <p style={{ fontSize: 11, color: C.sub, margin: 0 }}>{[gender, age ? `${age} yaş` : null].filter(Boolean).join(', ') || '—'}</p>
                </div>
                <Badge status={apt.status || 'scheduled'} />
                <button
                  onClick={() => setSelected(pat)}
                  style={{
                    background: C.tealDim, color: C.teal,
                    border: `1px solid #b2d8db`, borderRadius: 7,
                    padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0,
                    outline: 'none',
                  }}
                  onFocus={e => e.currentTarget.style.boxShadow = `0 0 0 2px rgba(22,140,150,0.4)`}
                  onBlur={e => e.currentTarget.style.boxShadow = 'none'}
                >Ətraflı</button>
              </div>
            )
          })}
        </div>

        {/* Right: Patient detail panel */}
        <div style={{
          width: 340, flexShrink: 0,
          background: C.white, borderRadius: 12,
          border: `1px solid ${C.border}`, padding: 18,
        }}>
          <PatientPanel
            doctor={doctor}
            patient={selectedPatient}
            onClose={closePanel}
            token={token}
          />
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .dr-dash-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (max-width: 520px) {
          .dr-dash-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 720px) {
          .dr-apt-layout { flex-direction: column !important; }
          .dr-apt-layout > div:last-child { width: 100% !important; }
        }
      `}</style>
    </DoctorLayout>
  )
}
