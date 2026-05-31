import { useState, useEffect, useRef } from 'react'
import DoctorLayout from '../../components/doctor/DoctorLayout'

import { BASE } from '../../api/config.js'
const TABS = ['Analizlər', 'Reseptlər', 'Tarix']

const STATUS_STYLE = {
  scheduled:   { background: '#fef9c3', color: '#854d0e', label: 'Gözləyir' },
  completed:   { background: '#dcfce7', color: '#166534', label: 'Tamamlandı' },
  cancelled:   { background: '#fee2e2', color: '#991b1b', label: 'Ləğv edildi' },
}

function PatientDetail({ patient, onClose, token }) {
  const [activeTab, setActiveTab]      = useState('Analizlər')
  const [analyses, setAnalyses]        = useState([])
  const [prescriptions, setPrescripts] = useState([])
  const [history, setHistory]          = useState([])
  const [showForm, setShowForm]        = useState(false)
  const [form, setForm]                = useState({ medicine: '', dose: '', duration: '', note: '' })
  const [submitting, setSubmitting]    = useState(false)
  const [msg, setMsg]                  = useState('')

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  const patId = patient?._id

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

  const handlePrescribe = async e => {
    e.preventDefault()
    setSubmitting(true); setMsg('')
    try {
      const res = await fetch(`${BASE}/api/v1/doctor/prescriptions`, {
        method: 'POST', headers,
        body: JSON.stringify({ patientId: patId, medicine: form.medicine, dose: form.dose, duration: form.duration, note: form.note }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Xəta')
      setMsg('✓ Resept yazıldı'); setShowForm(false)
      setForm({ medicine: '', dose: '', duration: '', note: '' })
      fetch(`${BASE}/api/v1/doctor/patients/${patId}/prescriptions`, { headers })
        .then(r => r.json()).then(d => setPrescripts(Array.isArray(d.data) ? d.data : []))
        .catch(() => {})
    } catch (err) { setMsg(err.message) }
    finally { setSubmitting(false) }
  }

  const name  = patient?.userId?.fullName || patient?.fullName || 'Naməlum'
  const phone = patient?.userId?.phone || patient?.phone || '—'

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background: 'white', borderRadius: 16, width: 460, maxWidth: '95vw', maxHeight: '90vh', overflow: 'auto', padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#00848e,#00a8b5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 17, fontWeight: 700, flexShrink: 0 }}>
            {name[0]?.toUpperCase() || '?'}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, fontSize: 15, color: '#0f1b2d', margin: '0 0 2px' }}>{name}</p>
            <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>📞 {phone} · {patient?.patientId || ''}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 20 }}>×</button>
        </div>

        <div style={{ display: 'flex', borderBottom: '2px solid #f1f5f9', marginBottom: 16 }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '7px 14px', fontSize: 12, cursor: 'pointer', border: 'none', background: 'none', fontWeight: activeTab === tab ? 600 : 400, color: activeTab === tab ? '#00848e' : '#64748b', borderBottom: activeTab === tab ? '2px solid #00848e' : '2px solid transparent', marginBottom: -2 }}>{tab}</button>
          ))}
        </div>

        {activeTab === 'Analizlər' && (
          analyses.length === 0
            ? <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: 24 }}>Analiz tapılmadı</p>
            : analyses.map((a, i) => (
              <div key={i} style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: 8, marginBottom: 8 }}>
                <p style={{ fontWeight: 600, fontSize: 13, color: '#0f1b2d', margin: '0 0 2px' }}>{a.type || a.testName || '—'}</p>
                <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>{a.description || a.result || ''}</p>
              </div>
            ))
        )}

        {activeTab === 'Reseptlər' && (
          <div>
            {msg && <p style={{ fontSize: 12, color: msg.startsWith('✓') ? '#16a34a' : '#ef4444', marginBottom: 8 }}>{msg}</p>}
            {prescriptions.length === 0
              ? <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: '10px 0' }}>Resept yoxdur</p>
              : prescriptions.map((p, i) => (
                <div key={i} style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: 8, marginBottom: 8 }}>
                  {p.medications?.map((m, j) => (
                    <p key={j} style={{ fontWeight: 600, fontSize: 13, color: '#0f1b2d', margin: '0 0 2px' }}>💊 {m.name} — {m.dosage}</p>
                  ))}
                  {p.medicine && <p style={{ fontWeight: 600, fontSize: 13, color: '#0f1b2d', margin: '0 0 2px' }}>💊 {p.medicine} — {p.dose}</p>}
                  <p style={{ fontSize: 11, color: '#94a3b8', margin: '4px 0 0' }}>{p.createdAt ? new Date(p.createdAt).toLocaleDateString('az-AZ') : ''}</p>
                </div>
              ))
            }
            {!showForm
              ? <button onClick={() => setShowForm(true)} style={{ marginTop: 12, width: '100%', background: '#00848e', color: 'white', border: 'none', padding: '9px 0', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ Yeni Resept</button>
              : <form onSubmit={handlePrescribe} style={{ marginTop: 12, background: '#f0fafa', borderRadius: 10, padding: 14 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[['Dərman adı *', 'medicine'], ['Doza *', 'dose'], ['Müddət *', 'duration']].map(([ph, key]) => (
                      <input key={key} placeholder={ph} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 7, padding: '8px 10px', fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
                    ))}
                  </div>
                  <textarea placeholder="Qeyd" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} rows={2} style={{ width: '100%', marginTop: 8, border: '1px solid #e2e8f0', borderRadius: 7, padding: '8px 10px', fontSize: 12, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' }} />
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <button type="submit" disabled={submitting} style={{ flex: 1, background: '#00848e', color: 'white', border: 'none', padding: '8px 0', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: submitting ? 0.7 : 1 }}>{submitting ? 'Yazılır...' : 'Resepti Yaz'}</button>
                    <button type="button" onClick={() => setShowForm(false)} style={{ padding: '8px 14px', background: 'white', border: '1px solid #e2e8f0', borderRadius: 7, fontSize: 12, cursor: 'pointer', color: '#475569' }}>Ləğv et</button>
                  </div>
                </form>
            }
          </div>
        )}

        {activeTab === 'Tarix' && (
          history.length === 0
            ? <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: 24 }}>Tibbi tarixçə yoxdur</p>
            : history.map((h, i) => {
              const s = STATUS_STYLE[h.status] || STATUS_STYLE.scheduled
              return (
                <div key={i} style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: 8, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#0f1b2d', margin: '0 0 2px' }}>{h.date ? new Date(h.date).toLocaleDateString('az-AZ') : '—'}</p>
                    {h.notes && <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>{h.notes}</p>}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: s.background, color: s.color }}>{s.label}</span>
                </div>
              )
            })
        )}
      </div>
    </div>
  )
}

export default function DoctorPatients() {
  const [patients, setPatients]   = useState([])
  const [total, setTotal]         = useState(0)
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [selected, setSelected]   = useState(null)
  const debounceRef = useRef(null)

  const token   = localStorage.getItem('adminToken') || localStorage.getItem('doctorToken')
  const headers = { Authorization: `Bearer ${token}` }

  const load = (q = '') => {
    setLoading(true)
    const url = q
      ? `${BASE}/api/v1/patients/search?query=${encodeURIComponent(q)}&limit=50`
      : `${BASE}/api/v1/patients?limit=50`
    fetch(url, { headers })
      .then(r => r.json())
      .then(d => {
        const list = Array.isArray(d) ? d : d.patients || d.data || []
        setPatients(list)
        setTotal(d.total || list.length)
      })
      .catch(() => { setPatients([]); setTotal(0) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleSearch = val => {
    setSearch(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => load(val), 400)
  }

  const getAge = dob => {
    if (!dob) return null
    return Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000))
  }

  return (
    <DoctorLayout activePage="patients">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f1b2d' }}>Xəstələrim</h1>
        <span style={{ background: '#f1f5f9', borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 600, color: '#64748b' }}>{total}</span>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: 360, marginBottom: 22 }}>
        <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
          <svg width="14" height="14" fill="none" stroke="#94a3b8" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
        <input value={search} onChange={e => handleSearch(e.target.value)} placeholder="Ad, P-ID ilə axtar..." style={{ width: '100%', background: 'white', border: '1px solid #e2e8f0', borderRadius: 10, padding: '9px 14px 9px 36px', fontSize: 13, color: '#334155', outline: 'none', boxSizing: 'border-box' }} />
      </div>

      {/* Cards grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#00848e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : patients.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8', fontSize: 14 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>👥</div>
          Xəstə tapılmadı
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
          {patients.map(pat => {
            const u    = pat.userId || pat
            const name = u.fullName || '—'
            const age  = getAge(pat.dateOfBirth)
            return (
              <div key={pat._id} style={{ background: 'white', borderRadius: 12, padding: 20, border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg,#00848e,#00a8b5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 18, fontWeight: 700, flexShrink: 0 }}>
                    {name[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#0f1b2d', margin: '0 0 3px' }}>{name}</p>
                    <span style={{ background: '#f1f5f9', borderRadius: 6, fontSize: 11, fontWeight: 600, color: '#64748b', padding: '1px 7px' }}>{pat.patientId || '—'}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 14 }}>
                  <span>📞 {u.phone || '—'}</span>
                  {pat.bloodGroup && <span>🩸 {pat.bloodGroup}</span>}
                  {age && <span>{age} yaş</span>}
                </div>
                <button onClick={() => setSelected(pat)} style={{ width: '100%', background: '#f0fafa', color: '#00848e', border: '1px solid #e0f2f1', borderRadius: 8, padding: '7px 0', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Ətraflı</button>
              </div>
            )
          })}
        </div>
      )}

      {selected && <PatientDetail patient={selected} onClose={() => setSelected(null)} token={token} />}
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </DoctorLayout>
  )
}
