import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DoctorLayout from '../../components/doctor/DoctorLayout'

import { BASE } from '../../api/config.js'

const STATUS_STYLE = {
  scheduled:   { background: '#fef9c3', color: '#854d0e', label: 'Gözləyir' },
  waiting:     { background: '#fef9c3', color: '#854d0e', label: 'Gözləmədə' },
  in_progress: { background: '#dbeafe', color: '#1e40af', label: 'Davam edir' },
  completed:   { background: '#dcfce7', color: '#166534', label: 'Tamamlandı' },
  cancelled:   { background: '#fee2e2', color: '#991b1b', label: 'Ləğv edildi' },
  missed:      { background: '#f3f4f6', color: '#374151', label: 'Buraxıldı' },
}

const TABS = ['Analizlər', 'Reseptlər', 'Tarix']

function RightPanel({ doctor, selectedPatient, onClose, token }) {
  const [activeTab, setActiveTab]      = useState('Analizlər')
  const [analyses, setAnalyses]        = useState([])
  const [prescriptions, setPrescripts] = useState([])
  const [history, setHistory]          = useState([])
  const [showForm, setShowForm]        = useState(false)
  const [form, setForm]                = useState({ medicine: '', dose: '', duration: '', note: '' })
  const [submitting, setSubmitting]    = useState(false)
  const [msg, setMsg]                  = useState('')

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  const patId = selectedPatient?._id

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
      .then(r => r.json()).then(d => {
        const list = Array.isArray(d) ? d : d.appointments || d.data || []
        setHistory(list)
      })
      .catch(() => {})
  }, [patId])

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
      setMsg('✓ Resept yazıldı')
      setShowForm(false)
      setForm({ medicine: '', dose: '', duration: '', note: '' })
      fetch(`${BASE}/api/v1/doctor/patients/${patId}/prescriptions`, { headers })
        .then(r => r.json()).then(d => setPrescripts(Array.isArray(d.data) ? d.data : Array.isArray(d) ? d : []))
        .catch(() => {})
    } catch (err) { setMsg(err.message) }
    finally { setSubmitting(false) }
  }

  if (!selectedPatient) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 32 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#00848e,#00a8b5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 24, fontWeight: 700, margin: '0 auto 14px' }}>
          {doctor?.fullName?.[0]?.toUpperCase() || 'D'}
        </div>
        <p style={{ fontWeight: 700, fontSize: 15, color: '#0f1b2d', margin: '0 0 4px' }}>{doctor?.fullName || 'Həkim'}</p>
        <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>{doctor?.specialization || ''}</p>
        <div style={{ marginTop: 20, padding: '16px 0', borderTop: '1px solid #f1f5f9' }}>
          <p style={{ fontSize: 13, color: '#64748b' }}>Pasiyent seçmək üçün sol sütundakı <strong>Ətraflı</strong> düyməsinə basın</p>
        </div>
      </div>
    )
  }

  const name  = selectedPatient.userId?.fullName || selectedPatient.fullName || 'Naməlum'
  const phone = selectedPatient.userId?.phone    || selectedPatient.phone    || '—'

  return (
    <div>
      {/* Patient header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#00848e,#00a8b5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 15, fontWeight: 700, flexShrink: 0 }}>
            {name[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 14, color: '#0f1b2d', margin: '0 0 2px' }}>{name}</p>
            <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>📞 {phone}</p>
            <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>{selectedPatient.patientId || ''}</p>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 18, lineHeight: 1 }}>×</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '2px solid #f1f5f9', marginBottom: 16 }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '8px 14px', fontSize: 12, cursor: 'pointer', border: 'none', background: 'none',
            fontWeight: activeTab === tab ? 600 : 400,
            color: activeTab === tab ? '#00848e' : '#64748b',
            borderBottom: activeTab === tab ? '2px solid #00848e' : '2px solid transparent',
            marginBottom: -2,
          }}>{tab}</button>
        ))}
      </div>

      {/* ANALIZLƏR */}
      {activeTab === 'Analizlər' && (
        <div>
          {analyses.length === 0
            ? <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>Analiz tapılmadı</p>
            : analyses.map((a, i) => (
              <div key={i} style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: 8, marginBottom: 8 }}>
                <p style={{ fontWeight: 600, fontSize: 13, color: '#0f1b2d', margin: '0 0 2px' }}>{a.type || a.testName || '—'}</p>
                <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>{a.description || a.result || ''}</p>
                <p style={{ fontSize: 11, color: '#94a3b8', margin: '4px 0 0' }}>{a.createdAt ? new Date(a.createdAt).toLocaleDateString('az-AZ') : ''}</p>
              </div>
            ))
          }
        </div>
      )}

      {/* RESEPTLƏR */}
      {activeTab === 'Reseptlər' && (
        <div>
          {msg && <p style={{ fontSize: 12, color: msg.startsWith('✓') ? '#16a34a' : '#ef4444', marginBottom: 8 }}>{msg}</p>}
          {prescriptions.length === 0
            ? <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: '10px 0' }}>Resept yoxdur</p>
            : prescriptions.map((p, i) => (
              <div key={i} style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: 8, marginBottom: 8 }}>
                {p.medications?.map((m, j) => (
                  <div key={j}>
                    <p style={{ fontWeight: 600, fontSize: 13, color: '#0f1b2d', margin: '0 0 2px' }}>💊 {m.name}</p>
                    <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Doza: {m.dosage} · {m.duration}</p>
                  </div>
                ))}
                {p.medicine && <p style={{ fontWeight: 600, fontSize: 13, color: '#0f1b2d', margin: '0 0 2px' }}>💊 {p.medicine} — {p.dose}</p>}
                <p style={{ fontSize: 11, color: '#94a3b8', margin: '4px 0 0' }}>{p.createdAt ? new Date(p.createdAt).toLocaleDateString('az-AZ') : ''}</p>
              </div>
            ))
          }

          {!showForm
            ? <button onClick={() => setShowForm(true)} style={{ marginTop: 12, width: '100%', background: '#00848e', color: 'white', border: 'none', padding: '9px 0', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ Yeni Resept</button>
            : <form onSubmit={handlePrescribe} style={{ marginTop: 12, background: '#f0fafa', borderRadius: 12, padding: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <PInput placeholder="Dərman adı *" value={form.medicine} onChange={v => setForm(f => ({ ...f, medicine: v }))} />
                  <PInput placeholder="Doza * (məs. 500mg)" value={form.dose} onChange={v => setForm(f => ({ ...f, dose: v }))} />
                  <PInput placeholder="Müddət * (məs. 7 gün)" value={form.duration} onChange={v => setForm(f => ({ ...f, duration: v }))} />
                </div>
                <textarea placeholder="Qeyd" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} rows={2} style={{ width: '100%', marginTop: 10, border: '1px solid #e2e8f0', borderRadius: 7, padding: '8px 10px', fontSize: 12, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' }} />
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button type="submit" disabled={submitting} style={{ flex: 1, background: '#00848e', color: 'white', border: 'none', padding: '8px 0', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
                    {submitting ? 'Yazılır...' : 'Resepti Yaz'}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} style={{ padding: '8px 14px', background: 'white', border: '1px solid #e2e8f0', borderRadius: 7, fontSize: 12, cursor: 'pointer', color: '#475569' }}>Ləğv et</button>
                </div>
              </form>
          }
        </div>
      )}

      {/* TARİX */}
      {activeTab === 'Tarix' && (
        <div>
          {history.length === 0
            ? <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>Tibbi tarixçə yoxdur</p>
            : history.map((h, i) => {
              const s = STATUS_STYLE[h.status] || STATUS_STYLE.scheduled
              return (
                <div key={i} style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: 8, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#0f1b2d', margin: '0 0 2px' }}>{h.date ? new Date(h.date).toLocaleDateString('az-AZ') : '—'} {h.time ? `· ${h.time}` : ''}</p>
                    {h.notes && <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>{h.notes}</p>}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: s.background, color: s.color }}>{s.label}</span>
                </div>
              )
            })
          }
        </div>
      )}
    </div>
  )
}

function PInput({ placeholder, value, onChange }) {
  return (
    <input placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 7, padding: '8px 10px', fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
  )
}

export default function DoctorDashboard() {
  const navigate = useNavigate()
  const [doctor, setDoctor]             = useState(null)
  const [appointments, setAppointments] = useState([])
  const [selectedPatient, setSelected]  = useState(null)
  const [loading, setLoading]           = useState(true)
  const [stats, setStats]               = useState({})

  const token = localStorage.getItem('adminToken') || localStorage.getItem('doctorToken')
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
  }, [])

  useEffect(() => {
    if (!token) return
    fetch(`${BASE}/api/v1/doctor/stats`, { headers })
      .then(r => r.json())
      .then(d => setStats(d.data || {}))
      .catch(() => {})
  }, [])

  const getAge = (dob) => {
    if (!dob) return null
    return Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000))
  }

  return (
    <DoctorLayout activePage="dashboard">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Bu gün',        value: stats.todayCount     || 0, color: '#00848e' },
          { label: 'Gözləyir',      value: stats.pendingCount   || 0, color: '#f59e0b' },
          { label: 'Tamamlandı',    value: stats.completedCount || 0, color: '#22c55e' },
          { label: 'Ümumi randevu', value: stats.totalCount     || 0, color: '#6366f1' },
        ].map((c, i) => (
          <div key={i} style={{ background: 'white', borderRadius: 12, padding: '16px 18px', border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: c.color }}>{c.value}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{c.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

        {/* LEFT — Today's appointments */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f1b2d', margin: '0 0 16px' }}>Bugünün Randevuları</h2>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#00848e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : appointments.length === 0 ? (
            <div style={{ background: 'white', borderRadius: 16, padding: '40px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📅</div>
              <p style={{ fontSize: 14, color: '#94a3b8', margin: 0 }}>Bugün randevu yoxdur</p>
            </div>
          ) : appointments.map((apt, i) => {
            const s    = STATUS_STYLE[apt.status] || STATUS_STYLE.scheduled
            const pat  = apt.patientId || apt.patient || {}
            const name = pat.userId?.fullName || pat.fullName || 'Naməlum'
            const dob  = pat.dateOfBirth
            const age  = getAge(dob)
            const gender = pat.gender === 'male' ? 'Kişi' : pat.gender === 'female' ? 'Qadın' : null
            const time  = apt.time || apt.startTime || ''
            return (
              <div key={apt._id || i} style={{ background: 'white', borderRadius: 12, padding: '16px 20px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                {time && (
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#00848e', background: '#e0f7fa', borderRadius: 8, padding: '6px 12px', minWidth: 52, textAlign: 'center', flexShrink: 0 }}>{time}</div>
                )}
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#00848e,#00a8b5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 15, fontWeight: 700, flexShrink: 0 }}>
                  {name[0]?.toUpperCase() || '?'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#0f1b2d', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</p>
                  <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>{[gender, age ? `${age} yaş` : null].filter(Boolean).join(', ') || '—'}</p>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: s.background, color: s.color, flexShrink: 0 }}>{s.label}</span>
                <button onClick={() => setSelected(pat)} style={{ background: '#f0fafa', color: '#00848e', border: '1px solid #e0f2f1', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>Ətraflı</button>
              </div>
            )
          })}
        </div>

        {/* RIGHT — Patient detail / doctor card */}
        <div style={{ width: 360, background: 'white', borderRadius: 16, padding: 24, flexShrink: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          {!selectedPatient ? (
            <>
              <div style={{ textAlign: 'center', paddingBottom: 16, borderBottom: '1px solid #f1f5f9', marginBottom: 16 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#00848e,#00a8b5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 22, fontWeight: 700, margin: '0 auto 10px' }}>
                  {doctor?.fullName?.[0]?.toUpperCase() || 'D'}
                </div>
                <p style={{ fontWeight: 700, fontSize: 17, color: '#0f1b2d', margin: '0 0 4px' }}>{doctor?.fullName || 'Həkim'}</p>
                <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>{doctor?.specialization || ''}</p>
              </div>
              <div style={{ display: 'flex', gap: 24 }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 22, fontWeight: 800, color: '#0f1b2d', margin: '0 0 2px' }}>{appointments.length}</p>
                  <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>Bugün</p>
                </div>
              </div>
              <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 16, textAlign: 'center' }}>Pasiyent seçmək üçün <strong>Ətraflı</strong> düyməsinə basın</p>
            </>
          ) : (
            <RightPanel doctor={doctor} selectedPatient={selectedPatient} onClose={() => setSelected(null)} token={token} />
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </DoctorLayout>
  )
}
