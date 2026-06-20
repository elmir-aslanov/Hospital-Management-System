import { useState, useEffect, useRef, useCallback } from 'react'
import DoctorLayout from '../../components/doctor/DoctorLayout'
import {
  C, Toolbar, SearchInput, Badge, Alert, Spinner,
  TableCard, THead, EmptyRow, Modal, Field, Input, Textarea,
  PrimaryBtn, GhostBtn,
} from '../../components/doctor/DoctorUI'
import { BASE } from '../../api/config.js'

function getToken() {
  return localStorage.getItem('adminToken') || localStorage.getItem('doctorToken') || ''
}
function getDoctorUser() {
  try { return JSON.parse(localStorage.getItem('adminUser') || localStorage.getItem('doctorUser') || '{}') }
  catch { return {} }
}
function formatDate(str) {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const TABLE_COLS = ['Pasiyent', 'Dərman', 'Doza', 'Müddət', 'Tarix', 'Status', '']

export default function DoctorPrescriptions() {
  const doctorUser = getDoctorUser()
  const doctorId   = doctorUser._id || doctorUser.id || ''

  const [prescriptions, setPrescriptions] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [modal,    setModal]    = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [delId,    setDelId]    = useState(null)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState('')
  const [search,   setSearch]   = useState('')
  const [patients, setPatients] = useState([])
  const [patSearch, setPatSearch] = useState('')
  const [patLoading, setPatLoading] = useState(false)
  const debounceRef = useRef(null)

  const emptyForm = { patientId: '', patientName: '', medicine: '', dose: '', duration: '', note: '', status: 'active' }
  const [form, setForm] = useState(emptyForm)

  // Close modals on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key !== 'Escape') return
      if (delId) setDelId(null)
      else if (modal) { setModal(false); setError('') }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [modal, delId])

  // Prevent scroll when modal open
  useEffect(() => {
    if (modal || delId) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [modal, delId])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const url = doctorId
        ? `${BASE}/api/v1/prescriptions?doctorId=${doctorId}&limit=100`
        : `${BASE}/api/v1/prescriptions?limit=100`
      const r = await fetch(url, { headers: { Authorization: `Bearer ${getToken()}` } })
      const data = await r.json()
      let list = []
      if (Array.isArray(data))                        list = data
      else if (Array.isArray(data.data))              list = data.data
      else if (Array.isArray(data.data?.prescriptions)) list = data.data.prescriptions
      else if (Array.isArray(data.prescriptions))     list = data.prescriptions
      else if (Array.isArray(data.docs))              list = data.docs
      setPrescriptions(list)
    } catch {
      setPrescriptions([])
    } finally {
      setLoading(false)
    }
  }, [doctorId])

  useEffect(() => { load() }, [load])

  const searchPatients = async (q) => {
    if (!q.trim()) { setPatients([]); return }
    setPatLoading(true)
    try {
      const r = await fetch(`${BASE}/api/v1/patients/search?q=${encodeURIComponent(q)}&limit=10`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      const data = await r.json()
      let list = []
      if (Array.isArray(data))                    list = data
      else if (Array.isArray(data.data))          list = data.data
      else if (Array.isArray(data.data?.patients)) list = data.data.patients
      else if (Array.isArray(data.patients))      list = data.patients
      setPatients(list)
    } catch {
      setPatients([])
    } finally {
      setPatLoading(false)
    }
  }

  const handlePatSearch = (val) => {
    setPatSearch(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => searchPatients(val), 350)
  }

  const selectPatient = (pat) => {
    const name = pat.userId?.fullName || pat.name || pat.fullName || ''
    setForm(f => ({ ...f, patientId: pat._id, patientName: name }))
    setPatients([])
    setPatSearch(name)
  }

  const handleSave = async () => {
    if (!form.patientId)         { setError('Pasiyent seçin'); return }
    if (!form.medicine.trim())   { setError('Dərman adını daxil edin'); return }
    if (!form.dose.trim())       { setError('Dozanı daxil edin'); return }
    if (!form.duration.trim())   { setError('Müddəti daxil edin'); return }
    setError('')
    setSaving(true)
    try {
      const body = {
        patientId: form.patientId,
        medicine:  form.medicine.trim(),
        dose:      form.dose.trim(),
        duration:  form.duration.trim(),
        note:      form.note.trim(),
        status:    form.status,
      }
      if (doctorId) body.doctorId = doctorId
      const r = await fetch(`${BASE}/api/v1/prescriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(body),
      })
      if (!r.ok) {
        const d = await r.json()
        throw new Error(d.message || d.error || 'Xəta baş verdi')
      }
      setModal(false)
      setForm(emptyForm)
      setPatSearch('')
      setPatients([])
      setSuccess('Resept uğurla əlavə edildi')
      setTimeout(() => setSuccess(''), 3000)
      load()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!delId) return
    try {
      await fetch(`${BASE}/api/v1/prescriptions/${delId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      setDelId(null)
      setSuccess('Resept ləğv edildi')
      setTimeout(() => setSuccess(''), 3000)
      load()
    } catch {
      setDelId(null)
    }
  }

  const filtered = (prescriptions || []).filter(p => {
    const name = p.patientId?.userId?.fullName || p.patientId?.name || p.patientId?.fullName || p.patientName || ''
    const med  = p.medications?.[0]?.name || p.medicine || p.medicationName || ''
    const q    = search.toLowerCase()
    return name.toLowerCase().includes(q) || med.toLowerCase().includes(q)
  })

  const openModal = () => { setModal(true); setForm(emptyForm); setPatSearch(''); setPatients([]); setError('') }

  return (
    <DoctorLayout>
      <Toolbar
        title="Reseptlər"
        count={filtered.length}
        right={
          <>
            <SearchInput value={search} onChange={setSearch} placeholder="Pasiyent və ya dərman axtar..." width={320} />
            <PrimaryBtn onClick={openModal}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Yeni Resept
            </PrimaryBtn>
          </>
        }
      />

      {success && <Alert type="success" style={{ marginBottom: 16 }}>{success}</Alert>}

      <TableCard>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <THead cols={TABLE_COLS} />
          <tbody>
            {loading ? (
              <tr><td colSpan={TABLE_COLS.length} style={{ padding: 40, textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center' }}><Spinner /></div>
              </td></tr>
            ) : filtered.length === 0 ? (
              <EmptyRow
                colSpan={TABLE_COLS.length}
                text={search ? 'Nəticə tapılmadı' : 'Hələ resept yoxdur'}
              />
            ) : filtered.map(p => {
              const patName  = p.patientId?.userId?.fullName || p.patientId?.name || p.patientId?.fullName || p.patientName || '—'
              const patId    = p.patientId?.patientId || p.patientId?.pid || ''
              const medicine = p.medications?.[0]?.name || p.medicine || p.medicationName || '—'
              const dose     = p.medications?.[0]?.dosage || p.dose || p.dosage || '—'
              const duration = p.medications?.[0]?.duration || p.duration || '—'
              const status   = p.status || 'active'
              return (
                <tr key={p._id} style={{ borderBottom: `1px solid #f1f5f9`, height: 56 }}
                  onMouseEnter={e => e.currentTarget.style.background = C.rowHover}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '0 16px' }}>
                    <div style={{ fontWeight: 600, color: C.navy, fontSize: 13 }}>{patName}</div>
                    {patId && <div style={{ fontSize: 11, color: '#94a3b8' }}>{patId}</div>}
                  </td>
                  <td style={{ padding: '0 16px', color: '#334155', fontWeight: 500 }}>{medicine}</td>
                  <td style={{ padding: '0 16px', color: '#475569' }}>{dose}</td>
                  <td style={{ padding: '0 16px', color: '#475569' }}>{duration}</td>
                  <td style={{ padding: '0 16px', color: C.sub }}>{formatDate(p.createdAt)}</td>
                  <td style={{ padding: '0 16px' }}><Badge status={status} /></td>
                  <td style={{ padding: '0 16px' }}>
                    <button
                      onClick={() => setDelId(p._id)}
                      aria-label="Resepti ləğv et"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: 12, fontWeight: 600, padding: '4px 2px' }}
                    >Ləğv et</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </TableCard>

      {/* New Prescription Modal */}
      {modal && (
        <Modal title="Yeni Resept" onClose={() => { setModal(false); setError('') }} width={500}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {error && <Alert type="error">{error}</Alert>}

            {/* Patient search */}
            <Field label="Pasiyent" required>
              <div style={{ position: 'relative' }}>
                <Input
                  value={patSearch}
                  onChange={handlePatSearch}
                  placeholder="Ad ilə axtarın..."
                />
                {form.patientId && (
                  <div style={{ fontSize: 11, color: C.teal, marginTop: 3 }}>Seçildi</div>
                )}
                {patients.length > 0 && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0,
                    background: C.white, border: `1px solid ${C.border}`,
                    borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                    zIndex: 10, maxHeight: 200, overflow: 'auto',
                  }}>
                    {patLoading ? (
                      <div style={{ padding: '10px 14px', color: '#94a3b8', fontSize: 13 }}>Axtarılır...</div>
                    ) : patients.map(pat => (
                      <div key={pat._id} onClick={() => selectPatient(pat)}
                        style={{ padding: '9px 14px', cursor: 'pointer', borderBottom: `1px solid #f1f5f9`, fontSize: 13 }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <span style={{ fontWeight: 600 }}>{pat.userId?.fullName || pat.name || pat.fullName}</span>
                        {pat.patientId && <span style={{ color: '#94a3b8', marginLeft: 6, fontSize: 11 }}>{pat.patientId}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Dərman adı" required>
                <Input value={form.medicine} onChange={v => setForm(f => ({ ...f, medicine: v }))} placeholder="məs. Amoksisilin 500mg" />
              </Field>
              <Field label="Doza" required>
                <Input value={form.dose} onChange={v => setForm(f => ({ ...f, dose: v }))} placeholder="məs. Gündə 3 dəfə 1 həb" />
              </Field>
            </div>

            <Field label="Müddət" required>
              <Input value={form.duration} onChange={v => setForm(f => ({ ...f, duration: v }))} placeholder="məs. 7 gün" />
            </Field>

            <Field label="Qeyd">
              <Textarea value={form.note} onChange={v => setForm(f => ({ ...f, note: v }))} placeholder="Əlavə qeydlər..." />
            </Field>

            <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
              <GhostBtn onClick={() => { setModal(false); setError('') }} style={{ flex: 1 }}>Ləğv et</GhostBtn>
              <PrimaryBtn onClick={handleSave} disabled={saving} style={{ flex: 2 }}>
                {saving ? 'Saxlanılır...' : 'Resept Yaz'}
              </PrimaryBtn>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete confirm */}
      {delId && (
        <div
          role="dialog" aria-modal="true" aria-label="Ləğv etmə təsdiqi"
          style={{ position: 'fixed', inset: 0, background: 'rgba(7,27,46,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget) setDelId(null) }}
        >
          <div style={{ background: C.white, borderRadius: 12, padding: '28px 24px', width: 340, textAlign: 'center', boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <svg width="20" height="20" fill="none" stroke="#dc2626" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </div>
            <h4 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, color: C.navy }}>Resepti ləğv etmək istəyirsiniz?</h4>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: C.sub }}>Resept arxivləşdiriləcək və tibbi tarixçədə saxlanılacaq.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <GhostBtn onClick={() => setDelId(null)} style={{ flex: 1 }}>İmtina</GhostBtn>
              <button onClick={handleDelete} style={{ flex: 1, padding: '9px', borderRadius: 8, border: 'none', background: '#dc2626', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Ləğv et</button>
            </div>
          </div>
        </div>
      )}
    </DoctorLayout>
  )
}
