import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import DoctorLayout from '../../components/doctor/DoctorLayout'
import {
  C, Toolbar, SearchInput, Badge, Alert, Spinner,
  TableCard, THead, EmptyRow, Modal, Field, Input, Textarea,
  PrimaryBtn, GhostBtn,
} from '../../components/doctor/DoctorUI'
import api from '../../api/axios'

function formatDate(str) {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const emptyMedicine = () => ({ name: '', dosage: '', frequency: '', duration: '', instructions: '' })

export default function DoctorPrescriptions() {
  const { t } = useTranslation()
  const tableCols = [
    t('prescription.patient'),
    t('prescription.medicineName'),
    t('prescription.dosage'),
    t('prescription.duration'),
    t('prescription.date'),
    t('prescription.status'),
    '',
  ]

  const [prescriptions, setPrescriptions] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [modal,    setModal]    = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState('')
  const [search,   setSearch]   = useState('')
  const [patients, setPatients] = useState([])
  const [patSearch, setPatSearch] = useState('')
  const [patLoading, setPatLoading] = useState(false)
  const debounceRef = useRef(null)

  // Cancel / archive action dialog (shared shape, distinguished by `action`)
  const [actionTarget, setActionTarget] = useState(null) // { id, action: 'cancel' | 'archive' }
  const [actionReason, setActionReason] = useState('')
  const [actionError,  setActionError]  = useState('')
  const [actionSaving, setActionSaving] = useState(false)

  const emptyForm = { patientId: '', patientName: '', visitId: '', medications: [emptyMedicine()], notes: '' }
  const [form, setForm] = useState(emptyForm)
  const [visitOptions, setVisitOptions] = useState([])
  const [visitLoading, setVisitLoading] = useState(false)

  const closeAction = useCallback(() => {
    setActionTarget(null)
    setActionReason('')
    setActionError('')
  }, [])

  // Close modals on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key !== 'Escape') return
      if (actionTarget) closeAction()
      else if (modal) { setModal(false); setError('') }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [modal, actionTarget, closeAction])

  // Prevent scroll when modal open
  useEffect(() => {
    if (modal || actionTarget) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [modal, actionTarget])

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(false)
    try {
      const { data } = await api.get('/prescriptions', { params: { limit: 100 } })
      const d = data?.data
      setPrescriptions(d?.prescriptions || (Array.isArray(d) ? d : []))
    } catch {
      setPrescriptions([])
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    api.get('/prescriptions', { params: { limit: 100 } })
      .then(({ data }) => {
        if (!active) return
        const payload = data?.data
        setPrescriptions(payload?.prescriptions || (Array.isArray(payload) ? payload : []))
        setLoadError(false)
      })
      .catch(() => {
        if (!active) return
        setPrescriptions([])
        setLoadError(true)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  const searchPatients = async (q) => {
    if (!q.trim()) { setPatients([]); return }
    setPatLoading(true)
    try {
      const { data } = await api.get('/patients/search', { params: { q, limit: 10 } })
      const d = data?.data
      setPatients(d?.patients || (Array.isArray(d) ? d : []))
    } catch {
      setPatients([])
    } finally {
      setPatLoading(false)
    }
  }

  const handlePatSearch = (val) => {
    setPatSearch(val)
    setForm(f => ({ ...f, patientId: '', patientName: '', visitId: '' }))
    setVisitOptions([])
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => searchPatients(val), 350)
  }

  useEffect(() => () => clearTimeout(debounceRef.current), [])

  // Prescriptions require an open Visit. Resolve the doctor's own open visit(s)
  // for the selected patient — auto-select if there's exactly one.
  const loadVisitsForPatient = async (patientId) => {
    setVisitOptions([]); setForm(f => ({ ...f, visitId: '' }))
    if (!patientId) return
    setVisitLoading(true)
    try {
      const { data } = await api.get(`/visits/patient/${patientId}`, {
        params: { status: 'open', limit: 100 },
      })
      const payload = data?.data
      const list = payload?.visits || (Array.isArray(payload) ? payload : [])
      const open = list.filter(v => v.status === 'open')
      setVisitOptions(open)
      if (open.length === 1) setForm(f => ({ ...f, visitId: open[0]._id }))
    } catch {
      setVisitOptions([])
    } finally {
      setVisitLoading(false)
    }
  }

  const selectPatient = (pat) => {
    const name = pat.userId?.fullName || pat.name || pat.fullName || ''
    setForm(f => ({ ...f, patientId: pat._id, patientName: name }))
    setPatients([])
    setPatSearch(name)
    loadVisitsForPatient(pat._id)
  }

  const updateMedicine = (idx, key, value) => {
    setForm(f => ({
      ...f,
      medications: f.medications.map((m, i) => i === idx ? { ...m, [key]: value } : m),
    }))
  }
  const addMedicineRow = () => setForm(f => ({ ...f, medications: [...f.medications, emptyMedicine()] }))
  const removeMedicineRow = (idx) => setForm(f => ({
    ...f, medications: f.medications.length > 1 ? f.medications.filter((_, i) => i !== idx) : f.medications,
  }))

  const handleSave = async () => {
    if (!form.patientId) { setError(t('prescription.patientRequired')); return }
    if (!form.visitId)   { setError(t('prescription.noOpenVisit')); return }
    for (const m of form.medications) {
      if (!m.name.trim())         { setError(t('prescription.fieldRequired', { field: t('prescription.medicineName') })); return }
      if (!m.dosage.trim())       { setError(t('prescription.fieldRequired', { field: t('prescription.dosage') })); return }
      if (!m.frequency.trim())    { setError(t('prescription.fieldRequired', { field: t('prescription.frequency') })); return }
      if (!m.duration.trim())     { setError(t('prescription.fieldRequired', { field: t('prescription.duration') })); return }
      if (!m.instructions.trim()) { setError(t('prescription.fieldRequired', { field: t('prescription.instructions') })); return }
    }
    setError('')
    setSaving(true)
    try {
      const body = {
        visitId:   form.visitId,
        patientId: form.patientId,
        medications: form.medications.map(m => ({
          name: m.name.trim(), dosage: m.dosage.trim(), frequency: m.frequency.trim(),
          duration: m.duration.trim(), instructions: m.instructions.trim(),
        })),
        notes: form.notes.trim(),
      }
      await api.post('/prescriptions', body)
      setModal(false)
      setForm(emptyForm)
      setPatSearch('')
      setPatients([])
      setVisitOptions([])
      setSuccess(t('prescription.createdSuccess'))
      setTimeout(() => setSuccess(''), 3000)
      load()
    } catch (e) {
      setError(e.response?.data?.message || t('prescription.genericError'))
    } finally {
      setSaving(false)
    }
  }

  const submitAction = async () => {
    if (!actionTarget) return
    if (!actionReason.trim()) { setActionError(t('prescription.reasonRequired')); return }
    setActionSaving(true); setActionError('')
    try {
      if (actionTarget.action === 'cancel') {
        await api.patch(`/prescriptions/${actionTarget.id}/cancel`, { reason: actionReason.trim() })
        setSuccess(t('prescription.cancelledSuccess'))
      } else {
        await api.patch(`/prescriptions/${actionTarget.id}/archive`, { reason: actionReason.trim() })
        setSuccess(t('prescription.archivedSuccess'))
      }
      closeAction()
      setTimeout(() => setSuccess(''), 3000)
      load()
    } catch (e) {
      setActionError(e.response?.data?.message || t('prescription.genericError'))
    } finally {
      setActionSaving(false)
    }
  }

  const filtered = (prescriptions || []).filter(p => {
    const name = p.patientId?.userId?.fullName || p.patientId?.name || p.patientId?.fullName || p.patientName || ''
    const med  = (p.medications || []).map(m => m.name).join(' ') || p.medicine || p.medicationName || ''
    const q    = search.toLowerCase()
    return name.toLowerCase().includes(q) || med.toLowerCase().includes(q)
  })

  const openModal = () => { setModal(true); setForm(emptyForm); setPatSearch(''); setPatients([]); setVisitOptions([]); setError('') }

  return (
    <DoctorLayout>
      <Toolbar
        title={t('prescription.listTitle')}
        count={filtered.length}
        right={
          <>
            <SearchInput value={search} onChange={setSearch} placeholder={t('prescription.searchPlaceholder')} width={320} />
            <PrimaryBtn onClick={openModal}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              {t('prescription.createPrescription')}
            </PrimaryBtn>
          </>
        }
      />

      {success && <Alert type="success" style={{ marginBottom: 16 }}>{success}</Alert>}

      <TableCard>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <THead cols={tableCols} />
          <tbody>
            {loading ? (
              <tr><td colSpan={tableCols.length} style={{ padding: 40, textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center' }}><Spinner /></div>
              </td></tr>
            ) : loadError ? (
              <EmptyRow colSpan={tableCols.length} text={t('prescription.loadError')} />
            ) : filtered.length === 0 ? (
              <EmptyRow
                colSpan={tableCols.length}
                text={search ? t('prescription.noResults') : t('prescription.empty')}
              />
            ) : filtered.map(p => {
              const patName  = p.patientId?.userId?.fullName || p.patientId?.name || p.patientId?.fullName || p.patientName || '—'
              const patId    = p.patientId?.patientId || p.patientId?.pid || ''
              const medicine = (p.medications || []).map(m => m.name).filter(Boolean).join(', ') || p.medicine || '—'
              const dose     = p.medications?.[0]?.dosage || p.dose || '—'
              const duration = p.medications?.[0]?.duration || p.duration || '—'
              const status   = p.isCancelled ? 'cancelled' : (p.status || 'active')
              const finalState = ['cancelled', 'archived', 'superseded'].includes(status)
              return (
                <tr key={p._id} style={{ borderBottom: `1px solid #f1f5f9`, height: 56 }}
                  onMouseEnter={e => e.currentTarget.style.background = C.rowHover}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '0 16px' }}>
                    <div style={{ fontWeight: 600, color: C.navy, fontSize: 13 }}>{patName}</div>
                    {patId && <div style={{ fontSize: 11, color: '#94a3b8' }}>{patId}</div>}
                  </td>
                  <td style={{ padding: '0 16px', color: '#334155', fontWeight: 500, maxWidth: 220, overflowWrap: 'anywhere' }}>{medicine}</td>
                  <td style={{ padding: '0 16px', color: '#475569' }}>{dose}</td>
                  <td style={{ padding: '0 16px', color: '#475569' }}>{duration}</td>
                  <td style={{ padding: '0 16px', color: C.sub }}>{formatDate(p.createdAt)}</td>
                  <td style={{ padding: '0 16px' }}><Badge status={status} /></td>
                  <td style={{ padding: '0 16px' }}>
                    {!finalState && (
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button
                          onClick={() => setActionTarget({ id: p._id, action: 'cancel' })}
                          aria-label={t('prescription.cancelPrescription')}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: 12, fontWeight: 600, padding: '4px 2px' }}
                        >{t('prescription.cancelPrescription')}</button>
                        <button
                          onClick={() => setActionTarget({ id: p._id, action: 'archive' })}
                          aria-label={t('prescription.archive')}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: 12, fontWeight: 600, padding: '4px 2px' }}
                        >{t('prescription.archive')}</button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </TableCard>

      {/* New Prescription Modal */}
      {modal && (
        <Modal title={t('prescription.createPrescription')} onClose={() => { setModal(false); setError('') }} width={560}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {error && <Alert type="error">{error}</Alert>}

            {/* Patient search */}
            <Field label={t('prescription.patient')} required>
              <div style={{ position: 'relative' }}>
                <Input
                  value={patSearch}
                  onChange={handlePatSearch}
                  placeholder={t('prescription.patientSearchPlaceholder')}
                />
                {form.patientId && (
                  <div style={{ fontSize: 11, color: C.teal, marginTop: 3 }}>{t('prescription.selected')}</div>
                )}
                {(patLoading || patients.length > 0) && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0,
                    background: C.white, border: `1px solid ${C.border}`,
                    borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                    zIndex: 10, maxHeight: 200, overflow: 'auto',
                  }}>
                    {patLoading ? (
                      <div style={{ padding: '10px 14px', color: '#94a3b8', fontSize: 13 }}>{t('prescription.searching')}</div>
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

            {/* Visit resolution */}
            {form.patientId && (
              visitLoading ? (
                <div style={{ fontSize: 12, color: '#94a3b8' }}>{t('prescription.checkingVisit')}</div>
              ) : visitOptions.length === 0 ? (
                <Alert type="error">{t('prescription.noOpenVisit')}</Alert>
              ) : visitOptions.length > 1 ? (
                <Field label={t('prescription.visit')} required>
                  <select
                    value={form.visitId}
                    onChange={e => setForm(f => ({ ...f, visitId: e.target.value }))}
                    style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', fontSize: 13, color: C.navy, outline: 'none', boxSizing: 'border-box' }}
                  >
                    <option value="">— {t('prescription.select')} —</option>
                    {visitOptions.map(v => (
                      <option key={v._id} value={v._id}>{v.chiefComplaint} · {formatDate(v.createdAt)}</option>
                    ))}
                  </select>
                </Field>
              ) : (
                <div style={{ fontSize: 11, color: C.teal }}>✓ {t('prescription.visit')}: {visitOptions[0].chiefComplaint}</div>
              )
            )}

            {/* Medications */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 8 }}>
                {t('prescription.medicineName')} <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {form.medications.map((m, idx) => (
                  <div key={idx} style={{ border: `1px solid ${C.border}`, borderRadius: 9, padding: 10, position: 'relative' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                      <Field label={t('prescription.medicineName')} required>
                        <Input value={m.name} onChange={v => updateMedicine(idx, 'name', v)} placeholder={t('prescription.medicinePlaceholder')} />
                      </Field>
                      <Field label={t('prescription.dosage')} required>
                        <Input value={m.dosage} onChange={v => updateMedicine(idx, 'dosage', v)} placeholder={t('prescription.dosagePlaceholder')} />
                      </Field>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                      <Field label={t('prescription.frequency')} required>
                        <Input value={m.frequency} onChange={v => updateMedicine(idx, 'frequency', v)} placeholder={t('prescription.frequencyPlaceholder')} />
                      </Field>
                      <Field label={t('prescription.duration')} required>
                        <Input value={m.duration} onChange={v => updateMedicine(idx, 'duration', v)} placeholder={t('prescription.durationPlaceholder')} />
                      </Field>
                    </div>
                    <Field label={t('prescription.instructions')} required>
                      <Input value={m.instructions} onChange={v => updateMedicine(idx, 'instructions', v)} placeholder={t('prescription.instructionsPlaceholder')} />
                    </Field>
                    {form.medications.length > 1 && (
                      <button
                        onClick={() => removeMedicineRow(idx)}
                        style={{ position: 'absolute', top: 8, right: 8, background: '#fef2f2', border: 'none', borderRadius: 6, color: '#ef4444', fontSize: 11, fontWeight: 600, padding: '3px 8px', cursor: 'pointer' }}
                      >{t('prescription.removeMedicine')}</button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={addMedicineRow}
                style={{ marginTop: 8, padding: '7px 14px', border: `1px dashed ${C.border}`, borderRadius: 8, background: 'white', color: C.teal, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
              >
                + {t('prescription.addMedicine')}
              </button>
            </div>

            <Field label={t('prescription.generalInstructions')}>
              <Textarea value={form.notes} onChange={v => setForm(f => ({ ...f, notes: v }))} placeholder={t('prescription.generalInstructionsPlaceholder')} />
            </Field>

            <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
              <GhostBtn onClick={() => { setModal(false); setError('') }} style={{ flex: 1 }}>{t('prescription.dismiss')}</GhostBtn>
              <PrimaryBtn onClick={handleSave} disabled={saving} style={{ flex: 2 }}>
                {saving ? t('prescription.saving') : t('prescription.save')}
              </PrimaryBtn>
            </div>
          </div>
        </Modal>
      )}

      {/* Cancel / Archive confirm */}
      {actionTarget && (
        <div
          role="dialog" aria-modal="true" aria-label={actionTarget.action === 'cancel' ? t('prescription.cancelPrescription') : t('prescription.archive')}
          style={{ position: 'fixed', inset: 0, background: 'rgba(7,27,46,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget) closeAction() }}
        >
          <div style={{ background: C.white, borderRadius: 12, padding: '28px 24px', width: 380, boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <svg width="20" height="20" fill="none" stroke="#dc2626" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </div>
            <h4 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, color: C.navy, textAlign: 'center' }}>
              {actionTarget.action === 'cancel' ? t('prescription.confirmCancel', 'Resepti ləğv etmək istəyirsiniz?') : t('prescription.confirmArchive')}
            </h4>
            <p style={{ margin: '0 0 14px', fontSize: 13, color: C.sub, textAlign: 'center' }}>{t('prescription.historyNotice')}</p>

            {actionError && <Alert type="error" style={{ marginBottom: 10 }}>{actionError}</Alert>}

            <Field label={actionTarget.action === 'cancel' ? t('prescription.cancelReason') : t('prescription.archiveReason')} required>
              <Textarea value={actionReason} onChange={setActionReason} placeholder="" />
            </Field>

            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <GhostBtn onClick={closeAction} style={{ flex: 1 }}>{t('prescription.dismiss')}</GhostBtn>
              <button
                onClick={submitAction}
                disabled={actionSaving}
                style={{ flex: 1, padding: '9px', borderRadius: 8, border: 'none', background: '#dc2626', color: 'white', fontSize: 13, fontWeight: 600, cursor: actionSaving ? 'not-allowed' : 'pointer', opacity: actionSaving ? 0.7 : 1 }}
              >
                {actionSaving ? t('prescription.saving') : (actionTarget.action === 'cancel' ? t('prescription.cancelPrescription') : t('prescription.archive'))}
              </button>
            </div>
          </div>
        </div>
      )}
    </DoctorLayout>
  )
}
