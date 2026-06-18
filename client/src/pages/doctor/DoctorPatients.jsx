import { useState, useEffect, useRef, useCallback } from 'react'
import DoctorLayout from '../../components/doctor/DoctorLayout'
import { C, Toolbar, SearchInput, Badge, Spinner, Avatar, Modal } from '../../components/doctor/DoctorUI'
import { BASE } from '../../api/config.js'

const TABS = ['Analizlər', 'Reseptlər', 'Tarix']

function formatDate(str) {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function getAge(dob) {
  if (!dob) return null
  return Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000))
}

// ── Patient detail modal ──────────────────────────────────────────────────────
function PatientModal({ patient, onClose, token }) {
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
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

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
      setMsg('success'); setShowForm(false)
      setForm({ medicine: '', dose: '', duration: '', note: '' })
      fetch(`${BASE}/api/v1/doctor/patients/${patId}/prescriptions`, { headers })
        .then(r => r.json()).then(d => setPrescripts(Array.isArray(d.data) ? d.data : []))
        .catch(() => {})
    } catch (err) { setMsg(err.message) }
    finally { setSubmitting(false) }
  }

  const name  = patient?.userId?.fullName || patient?.fullName || 'Naməlum'
  const phone = patient?.userId?.phone || patient?.phone || '—'
  const inp   = { width: '100%', padding: '8px 10px', fontSize: 12, border: `1px solid ${C.border}`, borderRadius: 7, outline: 'none', boxSizing: 'border-box' }

  return (
    <Modal title="" onClose={onClose} width={640}>
      {/* Patient header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, paddingBottom: 16, borderBottom: `1px solid ${C.border}` }}>
        <Avatar name={name} size={46} fontSize={17} />
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, fontSize: 16, color: C.navy, margin: '0 0 3px' }}>{name}</p>
          <p style={{ fontSize: 12, color: C.sub, margin: 0 }}>{phone} · {patient?.patientId || '—'}</p>
        </div>
        <button onClick={onClose} aria-label="Bağla" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 22, lineHeight: 1 }}>×</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, marginBottom: 16 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '7px 14px', fontSize: 12.5, cursor: 'pointer', border: 'none', background: 'none',
            fontWeight: tab === t ? 600 : 400,
            color: tab === t ? C.teal : C.sub,
            borderBottom: `2px solid ${tab === t ? C.teal : 'transparent'}`,
            marginBottom: -1,
          }}>{t}</button>
        ))}
      </div>

      {/* Analyses */}
      {tab === 'Analizlər' && (
        analyses.length === 0
          ? <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: 24 }}>Analiz tapılmadı</p>
          : analyses.map((a, i) => (
            <div key={i} style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: 8, marginBottom: 8 }}>
              <p style={{ fontWeight: 600, fontSize: 13, color: C.navy, margin: '0 0 2px' }}>{a.type || a.testName || '—'}</p>
              <p style={{ fontSize: 12, color: C.sub, margin: 0 }}>{a.description || a.result || ''}</p>
              <p style={{ fontSize: 11, color: '#94a3b8', margin: '3px 0 0' }}>{formatDate(a.createdAt)}</p>
            </div>
          ))
      )}

      {/* Prescriptions */}
      {tab === 'Reseptlər' && (
        <div>
          {msg === 'success' && <p style={{ fontSize: 12, color: '#16a34a', marginBottom: 8 }}>Resept yazıldı</p>}
          {msg && msg !== 'success' && <p style={{ fontSize: 12, color: '#ef4444', marginBottom: 8 }}>{msg}</p>}
          {prescripts.length === 0
            ? <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: '8px 0 12px' }}>Resept yoxdur</p>
            : prescripts.map((p, i) => (
              <div key={i} style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: 8, marginBottom: 8 }}>
                {p.medications?.map((m, j) => (
                  <p key={j} style={{ fontWeight: 600, fontSize: 13, color: C.navy, margin: '0 0 2px' }}>{m.name} — {m.dosage}</p>
                ))}
                {p.medicine && <p style={{ fontWeight: 600, fontSize: 13, color: C.navy, margin: '0 0 2px' }}>{p.medicine} — {p.dose}</p>}
                <p style={{ fontSize: 11, color: '#94a3b8', margin: '3px 0 0' }}>{formatDate(p.createdAt)}</p>
              </div>
            ))
          }
          {!showForm
            ? <button onClick={() => setShowForm(true)} style={{ marginTop: 10, width: '100%', background: C.teal, color: 'white', border: 'none', padding: '9px 0', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ Yeni Resept</button>
            : <form onSubmit={handlePrescribe} style={{ marginTop: 10, background: '#f0fafa', borderRadius: 9, padding: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[['Dərman adı *', 'medicine'], ['Doza *', 'dose'], ['Müddət *', 'duration']].map(([ph, key]) => (
                    <input key={key} placeholder={ph} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={inp} />
                  ))}
                </div>
                <textarea placeholder="Qeyd" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} rows={2} style={{ ...inp, height: 'auto', marginTop: 8, resize: 'vertical', fontFamily: 'inherit' }} />
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button type="submit" disabled={submitting} style={{ flex: 1, background: C.teal, color: 'white', border: 'none', padding: '8px 0', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
                    {submitting ? 'Yazılır...' : 'Resepti Yaz'}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} style={{ padding: '8px 14px', background: 'white', border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 12, cursor: 'pointer', color: '#475569' }}>Ləğv et</button>
                </div>
              </form>
          }
        </div>
      )}

      {/* History */}
      {tab === 'Tarix' && (
        history.length === 0
          ? <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: 24 }}>Tibbi tarixçə yoxdur</p>
          : history.map((h, i) => (
            <div key={i} style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: 8, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: C.navy, margin: 0 }}>{formatDate(h.date)}</p>
              <Badge status={h.status || 'scheduled'} />
            </div>
          ))
      )}
    </Modal>
  )
}

// ── Patient list ──────────────────────────────────────────────────────────────
export default function DoctorPatients() {
  const [patients, setPatients] = useState([])
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [selected, setSelected] = useState(null)
  const debounceRef = useRef(null)

  const token   = localStorage.getItem('adminToken') || localStorage.getItem('doctorToken')
  const headers = { Authorization: `Bearer ${token}` }

  const load = useCallback((q = '') => {
    setLoading(true)
    const url = q
      ? `${BASE}/api/v1/patients/search?query=${encodeURIComponent(q)}&limit=50`
      : `${BASE}/api/v1/doctor/my-patients`
    fetch(url, { headers })
      .then(r => r.json())
      .then(d => {
        const list = d.data?.patients || d.patients || d.data || (Array.isArray(d) ? d : [])
        setPatients(list)
        setTotal(d.data?.total || d.total || list.length)
      })
      .catch(() => { setPatients([]); setTotal(0) })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const handleSearch = val => {
    setSearch(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => load(val), 400)
  }

  return (
    <DoctorLayout>
      <Toolbar
        title="Xəstələrim"
        count={total}
        right={
          <SearchInput
            value={search}
            onChange={handleSearch}
            placeholder="Ad, P-ID ilə axtar..."
            width={380}
          />
        }
      />

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Spinner /></div>
      ) : patients.length === 0 ? (
        <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: '32px 24px', textAlign: 'center' }}>
          <svg width="36" height="36" fill="none" stroke="#CBD5E1" strokeWidth="1.5" viewBox="0 0 24 24" style={{ margin: '0 auto 10px', display: 'block' }} aria-hidden="true">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <p style={{ fontSize: 13, color: C.sub, margin: 0 }}>
            {search ? 'Axtarışa uyğun xəstə tapılmadı' : 'Hələ xəstə yoxdur'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>
          {patients.map(pat => {
            const u    = pat.userId || pat
            const name = u.fullName || '—'
            const age  = getAge(pat.dateOfBirth)
            const phone = u.phone || pat.phone || '—'
            return (
              <div
                key={pat._id}
                style={{
                  background: C.white, borderRadius: 12, padding: '18px 18px',
                  border: `1px solid ${C.border}`, transition: 'border-color 0.12s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#b2d8db'}
                onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 12 }}>
                  <Avatar name={name} size={44} fontSize={17} />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: C.navy, margin: '0 0 3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</p>
                    <span style={{ background: C.tealDim, color: C.teal, borderRadius: 5, fontSize: 11, fontWeight: 600, padding: '1px 7px' }}>{pat.patientId || '—'}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: 12, color: C.sub, marginBottom: 14, flexWrap: 'wrap' }}>
                  <span>{phone}</span>
                  {pat.bloodGroup && <span>{pat.bloodGroup}</span>}
                  {age && <span>{age} yaş</span>}
                </div>
                <button
                  onClick={() => setSelected(pat)}
                  style={{
                    width: '100%', background: C.tealDim, color: C.teal,
                    border: `1px solid #b2d8db`, borderRadius: 8,
                    padding: '7px 0', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    outline: 'none',
                  }}
                  onFocus={e => e.currentTarget.style.boxShadow = `0 0 0 2px rgba(22,140,150,0.4)`}
                  onBlur={e => e.currentTarget.style.boxShadow = 'none'}
                >Ətraflı</button>
              </div>
            )
          })}
        </div>
      )}

      {selected && <PatientModal patient={selected} onClose={() => setSelected(null)} token={token} />}
    </DoctorLayout>
  )
}
