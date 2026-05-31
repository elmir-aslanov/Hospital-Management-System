import { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'

import { BASE } from '../../api/config.js'
const token = () => localStorage.getItem('adminToken') || localStorage.getItem('token')
const hdrs  = () => ({ Authorization: `Bearer ${token()}` })

/* ── helpers ───────────────────────────────────────────────────────────── */
const toSlug = (name) =>
  name.toLowerCase().trim()
    .replace(/ə/g,'e').replace(/ı/g,'i').replace(/ö/g,'o')
    .replace(/ü/g,'u').replace(/ç/g,'c').replace(/ş/g,'s').replace(/ğ/g,'g')
    .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')

const patientName = (p) => p.userId?.fullName || p.fullName || p.patientId || '—'
const doctorName  = (d) => d.userId?.fullName || d.name || d.specialization || '—'

const today = new Date().toISOString().split('T')[0]

/* ── shared style atoms ─────────────────────────────────────────────────── */
const inp = {
  width: '100%', border: '1px solid #e2e8f0', borderRadius: 9,
  padding: '9px 12px', fontSize: 13, color: '#334155', outline: 'none',
  boxSizing: 'border-box', background: 'white',
}
const lbl = {
  fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6,
}

/* ════════════════════════════════════════════════════════════════════════ */
export default function AdminDepartments() {
  const [depts,      setDepts]      = useState([])
  const [doctors,    setDoctors]    = useState([])
  const [patients,   setPatients]   = useState([])
  const [loading,    setLoading]    = useState(true)

  /* dept modal */
  const [deptModal,  setDeptModal]  = useState(false)
  const [editDept,   setEditDept]   = useState(null)
  const [deptForm,   setDeptForm]   = useState({ name:'', slug:'', description:'', icon:'🏥', order:0, isActive:true })
  const [deptSaving, setDeptSaving] = useState(false)
  const [deptErr,    setDeptErr]    = useState('')

  /* appointment modal */
  const [apptModal,  setApptModal]  = useState(false)
  const [apptDept,   setApptDept]   = useState(null)
  const [apptForm,   setApptForm]   = useState({ patientId:'', doctorId:'', date:'', startTime:'08:00', endTime:'08:30', reason:'' })
  const [apptSaving, setApptSaving] = useState(false)
  const [apptErr,    setApptErr]    = useState('')

  /* ── load data ─────────────────────────────────────────────────────── */
  useEffect(() => {
    Promise.all([
      fetch(`${BASE}/api/v1/departments/admin/all`,     { headers: hdrs() }).then(r => r.json()),
      fetch(`${BASE}/api/v1/doctors?limit=200`,         { headers: hdrs() }).then(r => r.json()),
      fetch(`${BASE}/api/v1/patients?page=1&limit=200`, { headers: hdrs() }).then(r => r.json()),
    ]).then(([d, doc, pat]) => {
      setDepts(d.data || [])
      setDoctors(doc.data?.doctors   || [])
      setPatients(pat.data?.patients || [])
    }).finally(() => setLoading(false))
  }, [])

  /* ── helpers ───────────────────────────────────────────────────────── */
  const deptDoctorCount = (dept) =>
    doctors.filter(d =>
      (d.specialization || '').toLowerCase().includes(dept.name.toLowerCase()) ||
      dept.name.toLowerCase().includes((d.specialization || '').toLowerCase())
    ).length

  const deptDoctors = apptDept
    ? doctors.filter(d =>
        (d.specialization || '').toLowerCase().includes(apptDept.name.toLowerCase()) ||
        apptDept.name.toLowerCase().includes((d.specialization || '').toLowerCase())
      )
    : doctors

  /* ── dept CRUD ─────────────────────────────────────────────────────── */
  const openAddDept = () => {
    setEditDept(null)
    setDeptForm({ name:'', slug:'', description:'', icon:'🏥', order: depts.length, isActive:true })
    setDeptErr('')
    setDeptModal(true)
  }

  const openEditDept = (dept) => {
    setEditDept(dept)
    setDeptForm({
      name: dept.name, slug: dept.slug, description: dept.description || '',
      icon: dept.icon || '🏥', order: dept.order || 0, isActive: dept.isActive,
    })
    setDeptErr('')
    setDeptModal(true)
  }

  const saveDept = async () => {
    if (!deptForm.name.trim()) { setDeptErr('Şöbə adı tələb olunur'); return }
    setDeptSaving(true); setDeptErr('')
    const body = {
      ...deptForm,
      slug: deptForm.slug.trim() || toSlug(deptForm.name),
      order: Number(deptForm.order) || 0,
    }
    try {
      const url    = editDept ? `${BASE}/api/v1/departments/${editDept._id}` : `${BASE}/api/v1/departments`
      const method = editDept ? 'PUT' : 'POST'
      const r      = await fetch(url, {
        method, headers: { ...hdrs(), 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.message || 'Xəta baş verdi')
      const saved = data.data
      if (editDept) {
        setDepts(prev => prev.map(d => d._id === editDept._id ? saved : d))
      } else {
        setDepts(prev => [saved, ...prev])
      }
      setDeptModal(false)
    } catch (e) { setDeptErr(e.message) }
    finally { setDeptSaving(false) }
  }

  const deleteDept = (dept) => {
    if (!window.confirm('Bu şöbəni silmək istəyirsiniz?')) return
    fetch(`${BASE}/api/v1/departments/${dept._id}`, { method: 'DELETE', headers: hdrs() })
      .then(() => setDepts(prev => prev.filter(d => d._id !== dept._id)))
  }

  /* ── appointment ───────────────────────────────────────────────────── */
  const openApptModal = (dept) => {
    setApptDept(dept)
    setApptForm({ patientId:'', doctorId:'', date:'', startTime:'08:00', endTime:'08:30', reason:'' })
    setApptErr('')
    setApptModal(true)
  }

  const saveAppt = async () => {
    const { patientId, doctorId, date, startTime, endTime } = apptForm
    if (!patientId || !doctorId || !date || !startTime || !endTime) {
      setApptErr('Bütün məcburi sahələri doldurun'); return
    }
    setApptSaving(true); setApptErr('')
    try {
      const r    = await fetch(`${BASE}/api/v1/appointments`, {
        method: 'POST',
        headers: { ...hdrs(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId, doctorId, date, startTime, endTime, reason: apptForm.reason }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.message || 'Xəta baş verdi')
      setApptModal(false)
    } catch (e) { setApptErr(e.message) }
    finally { setApptSaving(false) }
  }

  /* ── setField helpers ──────────────────────────────────────────────── */
  const setDF = (k, v) => setDeptForm(f => ({ ...f, [k]: v }))
  const setAF = (k, v) => setApptForm(f => ({ ...f, [k]: v }))

  /* ════════════════════════════════════════════════════════════════════ */
  return (
    <AdminLayout activePage="departments">

      {/* ── Page header ──────────────────────────────────────────────── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <div>
          <h1 style={{ margin:0, fontSize:22, fontWeight:700, color:'#0f1b2d' }}>Şöbələr</h1>
          <p style={{ margin:'4px 0 0', color:'#64748b', fontSize:13 }}>{depts.length} şöbə</p>
        </div>
        <button onClick={openAddDept}
          style={{ background:'#00848e', color:'white', border:'none', borderRadius:10, padding:'10px 20px', fontSize:13, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Şöbə əlavə et
        </button>
      </div>

      {/* ── Loading ───────────────────────────────────────────────────── */}
      {loading && (
        <div style={{ display:'flex', justifyContent:'center', padding:80 }}>
          <div style={{ width:32, height:32, border:'3px solid #e2e8f0', borderTopColor:'#00848e', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
        </div>
      )}

      {/* ── Empty state ──────────────────────────────────────────────── */}
      {!loading && depts.length === 0 && (
        <div style={{ textAlign:'center', padding:80, color:'#94a3b8', fontSize:14 }}>Şöbə tapılmadı</div>
      )}

      {/* ── Dept grid ────────────────────────────────────────────────── */}
      {!loading && depts.length > 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px,1fr))', gap:18 }}>
          {depts.map(dept => (
            <div key={dept._id}
              style={{ background:'white', borderRadius:14, border:'1px solid #e2e8f0', padding:20, display:'flex', flexDirection:'column' }}>

              {/* top row */}
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
                <div style={{ width:48, height:48, borderRadius:12, background:'rgba(0,132,142,0.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>
                  {dept.icon || '🏥'}
                </div>
                <span style={{
                  fontSize:11, fontWeight:600, padding:'3px 9px', borderRadius:20,
                  background: dept.isActive ? '#f0fdf4' : '#fef2f2',
                  color:      dept.isActive ? '#16a34a' : '#dc2626',
                }}>
                  {dept.isActive ? 'Aktiv' : 'Deaktiv'}
                </span>
              </div>

              {/* middle */}
              <div style={{ marginTop:12, fontSize:15, fontWeight:700, color:'#0f1b2d' }}>{dept.name}</div>
              {dept.description && (
                <div style={{ marginTop:4, fontSize:12, color:'#64748b', overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
                  {dept.description}
                </div>
              )}
              <div style={{ marginTop:8, fontSize:12, color:'#00848e', fontWeight:600 }}>
                {deptDoctorCount(dept)} həkim
              </div>

              {/* actions */}
              <div style={{ marginTop:16, display:'flex', gap:8 }}>
                <button onClick={() => openApptModal(dept)}
                  style={{ fontSize:12, fontWeight:600, padding:'6px 12px', borderRadius:8, cursor:'pointer', border:'1px solid #00848e', color:'#00848e', background:'white' }}>
                  Randevu Al
                </button>
                <button onClick={() => openEditDept(dept)}
                  style={{ fontSize:12, fontWeight:600, padding:'6px 12px', borderRadius:8, cursor:'pointer', border:'1px solid #e2e8f0', color:'#475569', background:'white' }}>
                  Redaktə
                </button>
                <button onClick={() => deleteDept(dept)}
                  style={{ fontSize:12, fontWeight:600, padding:'6px 12px', borderRadius:8, cursor:'pointer', border:'1px solid #fee2e2', color:'#ef4444', background:'white' }}>
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ════ DEPT MODAL ════════════════════════════════════════════════ */}
      {deptModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center' }}
          onClick={e => { if (e.target === e.currentTarget) setDeptModal(false) }}>
          <div style={{ background:'white', borderRadius:16, width:480, maxWidth:'95vw', maxHeight:'90vh', overflow:'auto', padding:28 }}>

            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:22 }}>
              <h2 style={{ margin:0, fontSize:17, fontWeight:700, color:'#0f1b2d' }}>
                {editDept ? 'Şöbəni Redaktə Et' : 'Yeni Şöbə'}
              </h2>
              <button onClick={() => setDeptModal(false)}
                style={{ background:'none', border:'none', cursor:'pointer', color:'#94a3b8', fontSize:22, lineHeight:1 }}>×</button>
            </div>

            {deptErr && (
              <div style={{ background:'#fef2f2', color:'#ef4444', borderRadius:8, padding:'10px 14px', fontSize:13, marginBottom:16 }}>{deptErr}</div>
            )}

            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {/* Name */}
              <div>
                <label style={lbl}>Şöbə adı *</label>
                <input style={inp} value={deptForm.name}
                  onChange={e => {
                    const v = e.target.value
                    setDF('name', v)
                    if (!editDept) setDF('slug', toSlug(v))
                  }} />
              </div>

              {/* Slug */}
              <div>
                <label style={lbl}>Slug</label>
                <input
                  style={{ ...inp, background: editDept ? '#f8fafc' : 'white' }}
                  value={deptForm.slug}
                  readOnly={!!editDept}
                  onChange={e => { if (!editDept) setDF('slug', e.target.value) }}
                />
              </div>

              {/* Description */}
              <div>
                <label style={lbl}>Açıqlama</label>
                <textarea rows={3} style={{ ...inp, resize:'vertical', fontFamily:'inherit' }}
                  value={deptForm.description}
                  onChange={e => setDF('description', e.target.value)} />
              </div>

              {/* Icon + Order */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <div>
                  <label style={lbl}>İkon (emoji)</label>
                  <input style={inp} value={deptForm.icon} onChange={e => setDF('icon', e.target.value)} />
                </div>
                <div>
                  <label style={lbl}>Sıra nömrəsi</label>
                  <input type="number" style={inp} value={deptForm.order} onChange={e => setDF('order', e.target.value)} />
                </div>
              </div>

              {/* isActive */}
              <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, cursor:'pointer', color:'#475569' }}>
                <input type="checkbox" checked={deptForm.isActive} onChange={e => setDF('isActive', e.target.checked)}
                  style={{ width:15, height:15, accentColor:'#00848e' }} />
                Aktiv
              </label>
            </div>

            <div style={{ display:'flex', gap:10, marginTop:22, justifyContent:'flex-end' }}>
              <button onClick={() => setDeptModal(false)}
                style={{ padding:'10px 20px', border:'1px solid #e2e8f0', borderRadius:9, background:'white', fontSize:13, cursor:'pointer', color:'#475569' }}>
                Ləğv et
              </button>
              <button onClick={saveDept} disabled={deptSaving}
                style={{ padding:'10px 24px', border:'none', borderRadius:9, background:'#00848e', color:'white', fontSize:13, fontWeight:600, cursor: deptSaving ? 'not-allowed' : 'pointer', opacity: deptSaving ? 0.7 : 1 }}>
                {deptSaving ? 'Saxlanır...' : editDept ? 'Yadda saxla' : 'Əlavə et'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════ APPOINTMENT MODAL ══════════════════════════════════════════ */}
      {apptModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center' }}
          onClick={e => { if (e.target === e.currentTarget) setApptModal(false) }}>
          <div style={{ background:'white', borderRadius:16, width:520, maxWidth:'95vw', maxHeight:'90vh', overflow:'auto', padding:28 }}>

            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
              <div>
                <h2 style={{ margin:0, fontSize:17, fontWeight:700, color:'#0f1b2d' }}>Yeni Randevu</h2>
                {apptDept && <p style={{ margin:'3px 0 0', fontSize:12, color:'#64748b' }}>{apptDept.name}</p>}
              </div>
              <button onClick={() => setApptModal(false)}
                style={{ background:'none', border:'none', cursor:'pointer', color:'#94a3b8', fontSize:22, lineHeight:1 }}>×</button>
            </div>

            {apptErr && (
              <div style={{ background:'#fef2f2', color:'#ef4444', borderRadius:8, padding:'10px 14px', fontSize:13, margin:'12px 0' }}>{apptErr}</div>
            )}

            <div style={{ display:'flex', flexDirection:'column', gap:14, marginTop:16 }}>
              {/* Patient */}
              <div>
                <label style={lbl}>Pasiyent *</label>
                <select style={inp} value={apptForm.patientId} onChange={e => setAF('patientId', e.target.value)}>
                  <option value="">Pasiyent seçin...</option>
                  {patients.map(p => (
                    <option key={p._id} value={p._id}>
                      {patientName(p)}{p.patientId ? ` (${p.patientId})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Doctor */}
              <div>
                <label style={lbl}>Həkim *</label>
                <select style={inp} value={apptForm.doctorId} onChange={e => setAF('doctorId', e.target.value)}>
                  <option value="">Həkim seçin...</option>
                  {deptDoctors.map(d => (
                    <option key={d._id} value={d._id}>
                      {doctorName(d)}{d.specialization ? ` — ${d.specialization}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date + times */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14 }}>
                <div>
                  <label style={lbl}>Tarix *</label>
                  <input type="date" style={inp} min={today}
                    value={apptForm.date} onChange={e => setAF('date', e.target.value)} />
                </div>
                <div>
                  <label style={lbl}>Başlama vaxtı *</label>
                  <input type="time" style={inp}
                    value={apptForm.startTime} onChange={e => setAF('startTime', e.target.value)} />
                </div>
                <div>
                  <label style={lbl}>Bitmə vaxtı *</label>
                  <input type="time" style={inp}
                    value={apptForm.endTime} onChange={e => setAF('endTime', e.target.value)} />
                </div>
              </div>

              {/* Reason */}
              <div>
                <label style={lbl}>Səbəb</label>
                <input style={inp} placeholder="Müayinənin məqsədi..."
                  value={apptForm.reason} onChange={e => setAF('reason', e.target.value)} />
              </div>
            </div>

            <div style={{ display:'flex', gap:10, marginTop:22, justifyContent:'flex-end' }}>
              <button onClick={() => setApptModal(false)}
                style={{ padding:'10px 20px', border:'1px solid #e2e8f0', borderRadius:9, background:'white', fontSize:13, cursor:'pointer', color:'#475569' }}>
                Ləğv et
              </button>
              <button onClick={saveAppt} disabled={apptSaving}
                style={{ padding:'10px 24px', border:'none', borderRadius:9, background:'#00848e', color:'white', fontSize:13, fontWeight:600, cursor: apptSaving ? 'not-allowed' : 'pointer', opacity: apptSaving ? 0.7 : 1 }}>
                {apptSaving ? 'Yaradılır...' : 'Randevu Yarat'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </AdminLayout>
  )
}
