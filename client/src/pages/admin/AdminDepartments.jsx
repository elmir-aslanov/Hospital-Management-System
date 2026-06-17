import { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { clampNumberInput, toBoundedNumber } from '../../utils/numberInput'
import { DeptIcon, DEPT_ICON_OPTIONS, resolveIconKey } from '../../components/Icons'

import { BASE } from '../../api/config.js'
const token = () => localStorage.getItem('token') || localStorage.getItem('adminToken')
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
  const [deptForm,   setDeptForm]   = useState({ name:'', description:'', icon:'stethoscope', order:0, isActive:true, phone:'', fax:'', room:'', contentSections:[] })
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
    const load = async () => {
      try {
        const [dRes, docRes, patRes] = await Promise.allSettled([
          fetch(`${BASE}/api/v1/departments/admin/all`,     { headers: hdrs() }).then(r => r.json()),
          fetch(`${BASE}/api/v1/doctors?limit=200`,         { headers: hdrs() }).then(r => r.json()),
          fetch(`${BASE}/api/v1/patients?page=1&limit=200`, { headers: hdrs() }).then(r => r.json()),
        ])
        if (dRes.status === 'fulfilled') {
          const d = dRes.value
          if (d.success === false) console.warn('AdminDepartments: departments fetch error —', d.message)
          setDepts(d.data || [])
        } else {
          console.error('AdminDepartments: departments fetch failed —', dRes.reason)
        }
        if (docRes.status === 'fulfilled') setDoctors(docRes.value.data?.doctors || [])
        if (patRes.status === 'fulfilled') setPatients(patRes.value.data?.patients || [])
      } catch (err) {
        console.error('AdminDepartments: unexpected error —', err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  /* ── helpers ───────────────────────────────────────────────────────── */
  const deptDoctorCount = (dept) =>
    doctors.filter(d =>
      (d.specialization || '').toLowerCase().includes(dept.name.toLowerCase()) ||
      dept.name.toLowerCase().includes((d.specialization || '').toLowerCase())
    ).length

  const deptDoctors = apptDept
    ? doctors.filter(d =>
        d.departmentId?._id === apptDept._id ||
        d.departmentId === apptDept._id ||
        (d.specialization || '').toLowerCase().includes(apptDept.name.toLowerCase()) ||
        apptDept.name.toLowerCase().includes((d.specialization || '').toLowerCase())
      )
    : doctors

  /* ── dept CRUD ─────────────────────────────────────────────────────── */
  const openAddDept = () => {
    setEditDept(null)
    setDeptForm({ name:'', description:'', icon:'stethoscope', order: depts.length, isActive:true, phone:'', fax:'', room:'', contentSections:[] })
    setDeptErr('')
    setDeptModal(true)
  }

  const openEditDept = (dept) => {
    setEditDept(dept)
    setDeptForm({
      name: dept.name, description: dept.description || '',
      icon: resolveIconKey(dept.icon || ''), order: dept.order || 0, isActive: dept.isActive,
      phone: dept.phone || '', fax: dept.fax || '', room: dept.room || '',
      contentSections: (dept.contentSections || []).map(s => ({ title: s.title || '', body: s.body || '' })),
    })
    setDeptErr('')
    setDeptModal(true)
  }

  const saveDept = async () => {
    if (!deptForm.name.trim()) { setDeptErr('Şöbə adı tələb olunur'); return }
    setDeptSaving(true); setDeptErr('')
    const body = {
      name:        deptForm.name.trim(),
      description: deptForm.description,
      icon:        deptForm.icon,
      order:       toBoundedNumber(deptForm.order, { min: 0, integer: true }),
      isActive:    deptForm.isActive,
      phone:       deptForm.phone.trim(),
      fax:         deptForm.fax.trim(),
      room:        deptForm.room.trim(),
      contentSections: deptForm.contentSections
        .map(s => ({ title: s.title.trim(), body: s.body.trim() }))
        .filter(s => s.title || s.body),
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

  /* ── content sections helpers ─────────────────────────────────────── */
  const addSection = () =>
    setDeptForm(f => ({ ...f, contentSections: [...f.contentSections, { title:'', body:'' }] }))

  const removeSection = (idx) =>
    setDeptForm(f => ({ ...f, contentSections: f.contentSections.filter((_, i) => i !== idx) }))

  const updateSection = (idx, key, value) =>
    setDeptForm(f => ({
      ...f,
      contentSections: f.contentSections.map((s, i) => i === idx ? { ...s, [key]: value } : s),
    }))

  const moveSection = (idx, dir) =>
    setDeptForm(f => {
      const target = idx + dir
      if (target < 0 || target >= f.contentSections.length) return f
      const next = [...f.contentSections]
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return { ...f, contentSections: next }
    })

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

      {/* ── Dept table ───────────────────────────────────────────────── */}
      <div style={{ background:'white', borderRadius:14, border:'1px solid #f1f5f9', overflow:'auto' }}>
        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:60 }}>
            <div style={{ width:32, height:32, border:'3px solid #e2e8f0', borderTopColor:'#00848e', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
          </div>
        ) : depts.length === 0 ? (
          <div style={{ textAlign:'center', padding:60, color:'#94a3b8', fontSize:14 }}>Şöbə tapılmadı</div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid #f1f5f9' }}>
                <th style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>AD</th>
                <th style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>STATUS</th>
                <th style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>HƏKİM SAYI</th>
                <th style={{ padding:'10px 16px', textAlign:'right', fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}></th>
              </tr>
            </thead>
            <tbody>
              {depts.map(dept => (
                <tr key={dept._id}
                  style={{ borderBottom:'1px solid #f8fafc', transition:'background 0.1s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'white' }}
                >
                  <td style={{ padding:'12px 16px' }}>
                    <button onClick={() => openEditDept(dept)}
                      style={{ background:'none', border:'none', padding:0, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:8, fontSize:13, fontWeight:600, color:'#1D8B95' }}
                      onMouseEnter={e => { e.currentTarget.style.textDecoration = 'underline' }}
                      onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none' }}
                    >
                      <DeptIcon icon={dept.icon} name={dept.name} size={17} color='#1D8B95' />
                      {dept.name}
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
                    </button>
                  </td>
                  <td style={{ padding:'12px 16px' }}>
                    <span style={{ fontSize:11, fontWeight:600, padding:'3px 9px', borderRadius:20, background: dept.isActive ? '#f0fdf4' : '#fef2f2', color: dept.isActive ? '#16a34a' : '#dc2626' }}>
                      {dept.isActive ? 'Aktiv' : 'Deaktiv'}
                    </span>
                  </td>
                  <td style={{ padding:'12px 16px', fontSize:12, color:'#64748b' }}>{deptDoctorCount(dept)} həkim</td>
                  <td style={{ padding:'12px 16px' }}>
                    <div style={{ display:'flex', gap:6, justifyContent:'flex-end' }}>
                      <button onClick={() => openApptModal(dept)}
                        style={{ padding:'5px 12px', border:'1px solid #00848e', borderRadius:7, background:'white', color:'#00848e', fontSize:12, fontWeight:600, cursor:'pointer' }}>
                        Randevu Al
                      </button>
                      <button onClick={() => openEditDept(dept)}
                        style={{ padding:'5px 12px', border:'1px solid #e2e8f0', borderRadius:7, background:'white', color:'#475569', fontSize:12, fontWeight:600, cursor:'pointer' }}>
                        Redaktə
                      </button>
                      <button onClick={() => deleteDept(dept)}
                        style={{ padding:'4px 10px', borderRadius:7, border:'1px solid #fee2e2', background:'white', fontSize:11, cursor:'pointer', color:'#ef4444' }}>
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

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
                  onChange={e => setDF('name', e.target.value)} />
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
                  <label style={lbl}>İkon</label>
                  <div style={{ display:'flex', alignItems:'stretch', gap:8 }}>
                    <select
                      style={{ ...inp, flex:1, minWidth:0, width:'auto' }}
                      value={deptForm.icon}
                      onChange={e => setDF('icon', e.target.value)}
                    >
                      {DEPT_ICON_OPTIONS.map(o => (
                        <option key={o.key} value={o.key}>{o.label}</option>
                      ))}
                    </select>
                    <div style={{
                      display:'flex', alignItems:'center', justifyContent:'center',
                      flexShrink:0, width:44,
                      border:'1px solid #e2e8f0', borderRadius:9,
                      background:'#f8fafc',
                    }}>
                      <DeptIcon icon={deptForm.icon} name={deptForm.name} size={22} color='#00848e' />
                    </div>
                  </div>
                </div>
                <div>
                  <label style={lbl}>Sıra nömrəsi</label>
                  <input type="number" min="0" style={inp} value={deptForm.order} onChange={e => setDF('order', clampNumberInput(e.target.value, { min: 0, integer: true }))} />
                </div>
              </div>

              {/* Phone + Fax */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <div>
                  <label style={lbl}>Telefon</label>
                  <input style={inp} value={deptForm.phone} onChange={e => setDF('phone', e.target.value)} />
                </div>
                <div>
                  <label style={lbl}>Faks</label>
                  <input style={inp} value={deptForm.fax} onChange={e => setDF('fax', e.target.value)} />
                </div>
              </div>

              {/* Room */}
              <div>
                <label style={lbl}>Otaq/Mərtəbə</label>
                <input style={inp} value={deptForm.room} onChange={e => setDF('room', e.target.value)} />
              </div>

              {/* Content sections */}
              <div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                  <label style={{ ...lbl, marginBottom:0 }}>Əlavə bölmələr</label>
                  <button type="button" onClick={addSection}
                    style={{ padding:'4px 10px', border:'1px solid #00848e', borderRadius:7, background:'white', color:'#00848e', fontSize:12, fontWeight:600, cursor:'pointer' }}>
                    + Bölmə əlavə et
                  </button>
                </div>
                {deptForm.contentSections.length === 0 ? (
                  <p style={{ fontSize:12, color:'#94a3b8', margin:0 }}>Heç bir əlavə bölmə yoxdur.</p>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    {deptForm.contentSections.map((section, idx) => (
                      <div key={idx} style={{ border:'1px solid #e2e8f0', borderRadius:9, padding:12, display:'flex', flexDirection:'column', gap:8 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <input style={{ ...inp, flex:1 }} placeholder="Başlıq"
                            value={section.title} onChange={e => updateSection(idx, 'title', e.target.value)} />
                          <button type="button" onClick={() => moveSection(idx, -1)} disabled={idx === 0}
                            style={{ padding:'5px 8px', border:'1px solid #e2e8f0', borderRadius:7, background:'white', color:'#475569', fontSize:12, cursor: idx === 0 ? 'not-allowed' : 'pointer', opacity: idx === 0 ? 0.4 : 1 }}>↑</button>
                          <button type="button" onClick={() => moveSection(idx, 1)} disabled={idx === deptForm.contentSections.length - 1}
                            style={{ padding:'5px 8px', border:'1px solid #e2e8f0', borderRadius:7, background:'white', color:'#475569', fontSize:12, cursor: idx === deptForm.contentSections.length - 1 ? 'not-allowed' : 'pointer', opacity: idx === deptForm.contentSections.length - 1 ? 0.4 : 1 }}>↓</button>
                          <button type="button" onClick={() => removeSection(idx)}
                            style={{ padding:'5px 10px', borderRadius:7, border:'1px solid #fee2e2', background:'white', fontSize:11, cursor:'pointer', color:'#ef4444' }}>
                            Sil
                          </button>
                        </div>
                        <textarea rows={3} style={{ ...inp, resize:'vertical', fontFamily:'inherit' }}
                          placeholder="Mətn"
                          value={section.body} onChange={e => updateSection(idx, 'body', e.target.value)} />
                      </div>
                    ))}
                  </div>
                )}
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
