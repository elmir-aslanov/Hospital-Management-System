import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'

const BASE  = 'http://localhost:5000'
const token = () => localStorage.getItem('adminToken') || localStorage.getItem('token')
const hdrs  = () => ({ Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' })
const TEAL  = '#00848e'
const NAVY  = '#0a1628'
const FONT  = "'Source Sans 3', sans-serif"

const TYPE_CONFIG = {
  diagnosis:    { label: 'Diaqnoz',      color: '#dc2626', bg: '#fef2f2', icon: '🔴' },
  procedure:    { label: 'Prosedur',     color: '#2563eb', bg: '#eff6ff', icon: '🔵' },
  allergy:      { label: 'Allergiya',    color: '#ea580c', bg: '#fff7ed', icon: '🟠' },
  prescription: { label: 'Resept',       color: '#7c3aed', bg: '#f5f3ff', icon: '🟣' },
  lab:          { label: 'Laboratoriya', color: '#0891b2', bg: '#ecfeff', icon: '🔷' },
  note:         { label: 'Qeyd',         color: '#64748b', bg: '#f8fafc', icon: '⚪' },
  vaccination:  { label: 'Peyvənd',      color: '#16a34a', bg: '#f0fdf4', icon: '🟢' },
}

const TABS = [
  { key: 'all', label: 'Hamısı' },
  { key: 'diagnosis',    label: 'Diaqnoz' },
  { key: 'procedure',   label: 'Prosedur' },
  { key: 'allergy',     label: 'Allergiya' },
  { key: 'prescription',label: 'Resept' },
  { key: 'lab',         label: 'Lab' },
  { key: 'note',        label: 'Qeyd' },
  { key: 'vaccination', label: 'Peyvənd' },
]

const fmt = (d) => d ? new Date(d).toLocaleDateString('az-AZ') : '—'

export default function AdminEHR() {
  const { patientId } = useParams()
  const navigate      = useNavigate()

  const [summary,    setSummary]    = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [activeType, setActiveType] = useState('all')
  const [showAdd,    setShowAdd]    = useState(false)
  const [saving,     setSaving]     = useState(false)
  const [addForm,    setAddForm]    = useState({
    type: 'note', title: '', description: '',
    date: new Date().toISOString().split('T')[0],
  })

  const load = () => {
    setLoading(true)
    fetch(`${BASE}/api/v1/ehr/patient/${patientId}/summary`, { headers: hdrs() })
      .then(r => r.json())
      .then(d => setSummary(d.data || null))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [patientId])

  const handleAdd = async () => {
    if (!addForm.title.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`${BASE}/api/v1/ehr/records`, {
        method: 'POST',
        headers: hdrs(),
        body: JSON.stringify({ ...addForm, patientId }),
      })
      const data = await res.json()
      if (res.ok && data.data) {
        setSummary(prev => {
          if (!prev) return prev
          const newRecord = data.data
          const newRecords = [newRecord, ...prev.records]
          return {
            ...prev,
            records: newRecords,
            byType: {
              ...prev.byType,
              [newRecord.type]: [newRecord, ...(prev.byType[newRecord.type] || [])],
            },
          }
        })
        setShowAdd(false)
        setAddForm({ type: 'note', title: '', description: '', date: new Date().toISOString().split('T')[0] })
      }
    } catch {}
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bu qeydi silmək istəyirsiniz?')) return
    await fetch(`${BASE}/api/v1/ehr/records/${id}`, { method: 'DELETE', headers: hdrs() })
    setSummary(prev => {
      if (!prev) return prev
      const newRecords = prev.records.filter(r => r._id !== id)
      return {
        ...prev,
        records: newRecords,
        byType: Object.fromEntries(
          Object.entries(prev.byType).map(([k, v]) => [k, v.filter(r => r._id !== id)])
        ),
      }
    })
  }

  const patient  = summary?.patient
  const records  = summary?.records || []
  const byType   = summary?.byType || {}
  const displayed = activeType === 'all' ? records : (byType[activeType] || [])

  const pName = patient?.userId?.fullName || '—'
  const initial = pName[0]?.toUpperCase() || 'P'

  const inputSt = {
    width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0',
    borderRadius: 9, fontSize: 13, fontFamily: FONT, color: NAVY,
    background: '#fff', outline: 'none', boxSizing: 'border-box',
  }

  return (
    <AdminLayout activePage="patients">
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} .ehr-card:hover{border-color:#cbd5e1!important}`}</style>

      {/* Back */}
      <button onClick={() => navigate('/admin/patients')} style={{
        display: 'flex', alignItems: 'center', gap: 6, background: 'none',
        border: 'none', cursor: 'pointer', color: '#64748b', fontSize: 13,
        fontFamily: FONT, fontWeight: 600, marginBottom: 20, padding: 0,
      }}>
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Pasiyentlər
      </button>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
          <div style={{ width: 36, height: 36, border: `3px solid #e2e8f0`, borderTop: `3px solid ${TEAL}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : (
        <>
          {/* Patient Header */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #f1f5f9', padding: '20px 24px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: `linear-gradient(135deg,${TEAL},#00a8b5)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 22, fontWeight: 800, flexShrink: 0, fontFamily: FONT }}>
              {initial}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: NAVY, fontFamily: FONT }}>{pName}</div>
              <div style={{ display: 'flex', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
                {patient?.userId?.email && <span style={{ fontSize: 12, color: '#64748b', fontFamily: FONT }}>{patient.userId.email}</span>}
                {patient?.userId?.phone && <span style={{ fontSize: 12, color: '#64748b', fontFamily: FONT }}>{patient.userId.phone}</span>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              {patient?.patientId && (
                <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: '#eff6ff', color: '#2563eb', fontFamily: FONT }}>
                  {patient.patientId}
                </span>
              )}
              {patient?.bloodGroup && (
                <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: '#fef2f2', color: '#dc2626', fontFamily: FONT }}>
                  {patient.bloodGroup}
                </span>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
            {TABS.map(tab => {
              const count = tab.key === 'all' ? records.length : (byType[tab.key]?.length || 0)
              const active = activeType === tab.key
              return (
                <button key={tab.key} onClick={() => setActiveType(tab.key)} style={{
                  padding: '7px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                  background: active ? TEAL : '#f1f5f9',
                  color: active ? '#fff' : '#64748b',
                  fontSize: 12, fontWeight: 600, fontFamily: FONT,
                  transition: 'all 0.15s',
                }}>
                  {tab.label} {count > 0 && <span style={{ opacity: 0.8 }}>({count})</span>}
                </button>
              )
            })}
          </div>

          {/* 2-Column Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>

            {/* LEFT — Timeline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {displayed.length === 0 ? (
                <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #f1f5f9', padding: '48px 24px', textAlign: 'center', color: '#94a3b8', fontSize: 14, fontFamily: FONT }}>
                  Bu kateqoriyada qeyd yoxdur
                </div>
              ) : displayed.map(rec => {
                const tc = TYPE_CONFIG[rec.type] || TYPE_CONFIG.note
                return (
                  <div key={rec._id} className="ehr-card" style={{
                    background: '#fff', borderRadius: 12,
                    border: '1px solid #f1f5f9',
                    borderLeft: `4px solid ${tc.color}`,
                    padding: '14px 18px',
                    transition: 'border-color 0.15s',
                    boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 10, background: tc.bg, color: tc.color, fontFamily: FONT }}>
                            {tc.icon} {tc.label}
                          </span>
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, fontFamily: FONT, marginBottom: 4 }}>{rec.title}</div>
                        {rec.description && (
                          <div style={{ fontSize: 13, color: '#475569', fontFamily: FONT, lineHeight: 1.6 }}>{rec.description}</div>
                        )}
                        {rec.doctorId?.userId?.fullName && (
                          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 8, fontFamily: FONT }}>
                            Həkim: {rec.doctorId.userId.fullName}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                        <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: FONT }}>{fmt(rec.date)}</span>
                        <button onClick={() => handleDelete(rec._id)} style={{
                          padding: '3px 9px', border: '1px solid #fee2e2', borderRadius: 6,
                          background: '#fff', color: '#ef4444', fontSize: 11,
                          cursor: 'pointer', fontFamily: FONT,
                        }}>Sil</button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* RIGHT — Stats + Add */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

              {/* Stats */}
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #f1f5f9', padding: 18, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12, fontFamily: FONT }}>Xülasə</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {Object.entries(TYPE_CONFIG).map(([key, tc]) => {
                    const count = byType[key]?.length || 0
                    return (
                      <div key={key} onClick={() => setActiveType(key)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', borderRadius: 9, cursor: 'pointer', background: activeType === key ? tc.bg : 'transparent', transition: 'background 0.15s' }}>
                        <span style={{ fontSize: 12, color: '#475569', fontFamily: FONT }}>{tc.icon} {tc.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, padding: '2px 9px', borderRadius: 10, background: tc.bg, color: tc.color, fontFamily: FONT }}>{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Add Form */}
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #f1f5f9', padding: 18, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                {!showAdd ? (
                  <button onClick={() => setShowAdd(true)} style={{
                    width: '100%', padding: '11px', background: TEAL, color: '#fff',
                    border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700,
                    cursor: 'pointer', fontFamily: FONT, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', gap: 7,
                  }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Qeyd əlavə et
                  </button>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, fontFamily: FONT, marginBottom: 2 }}>Yeni Qeyd</div>

                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4, fontFamily: FONT }}>Növ</label>
                      <select value={addForm.type} onChange={e => setAddForm(f => ({ ...f, type: e.target.value }))} style={inputSt}>
                        {Object.entries(TYPE_CONFIG).map(([k, v]) => (
                          <option key={k} value={k}>{v.icon} {v.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4, fontFamily: FONT }}>Başlıq *</label>
                      <input value={addForm.title} onChange={e => setAddForm(f => ({ ...f, title: e.target.value }))} placeholder="Başlıq daxil edin" style={inputSt} />
                    </div>

                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4, fontFamily: FONT }}>Açıqlama</label>
                      <textarea rows={3} value={addForm.description} onChange={e => setAddForm(f => ({ ...f, description: e.target.value }))} placeholder="Ətraflı məlumat..." style={{ ...inputSt, resize: 'vertical' }} />
                    </div>

                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4, fontFamily: FONT }}>Tarix</label>
                      <input type="date" value={addForm.date} onChange={e => setAddForm(f => ({ ...f, date: e.target.value }))} style={inputSt} />
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => setShowAdd(false)} style={{ flex: 1, padding: '9px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: FONT }}>Ləğv et</button>
                      <button onClick={handleAdd} disabled={saving || !addForm.title.trim()} style={{ flex: 1, padding: '9px', background: saving ? '#7ec8cc' : TEAL, color: '#fff', border: 'none', borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: FONT }}>
                        {saving ? '…' : 'Saxla'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  )
}
