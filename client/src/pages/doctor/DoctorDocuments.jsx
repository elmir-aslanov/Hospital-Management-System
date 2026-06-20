import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import DoctorLayout from '../../components/doctor/DoctorLayout'
import {
  C, Toolbar, SearchInput, Badge, Alert, Spinner,
  TableCard, THead, EmptyRow, Modal, Field, Input, Textarea,
  PrimaryBtn, GhostBtn,
} from '../../components/doctor/DoctorUI'
import api from '../../api/axios'

const DOC_TYPES = ['medical_certificate', 'epicrisis', 'consultation_opinion', 'operation_protocol', 'lab_summary', 'other']

function formatDate(str) {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function DoctorDocuments() {
  const { t } = useTranslation()
  const tableCols = [
    t('doctorDocuments.patient'),
    t('doctorDocuments.type'),
    t('doctorDocuments.date'),
    t('doctorDocuments.status'),
    '',
  ]

  const [documents, setDocuments] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [loadError,  setLoadError]  = useState(false)
  const [modal,      setModal]      = useState(null) // null | { mode: 'create' } | { mode: 'edit', record }
  const [saving,     setSaving]     = useState(false)
  const [submittingId, setSubmittingId] = useState(null)
  const [error,      setError]      = useState('')
  const [success,    setSuccess]    = useState('')
  const [search,     setSearch]     = useState('')
  const [patients,   setPatients]   = useState([])
  const [patSearch,  setPatSearch]  = useState('')
  const [patLoading, setPatLoading] = useState(false)
  const debounceRef = useRef(null)

  const emptyForm = { patientId: '', type: 'consultation_opinion', title: '', description: '', date: new Date().toISOString().split('T')[0] }
  const [form, setForm] = useState(emptyForm)

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(false)
    try {
      const { data } = await api.get('/ehr/my-records', { params: { limit: 100 } })
      setDocuments(data?.data?.records || [])
    } catch {
      setDocuments([])
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && modal) setModal(null) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [modal])

  useEffect(() => {
    if (modal) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [modal])

  useEffect(() => () => clearTimeout(debounceRef.current), [])

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
    setForm(f => ({ ...f, patientId: '' }))
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => searchPatients(val), 350)
  }

  const selectPatient = (pat) => {
    const name = pat.userId?.fullName || pat.name || pat.fullName || ''
    setForm(f => ({ ...f, patientId: pat._id }))
    setPatients([])
    setPatSearch(name)
  }

  const openCreate = () => {
    setModal({ mode: 'create' })
    setForm(emptyForm)
    setPatSearch('')
    setPatients([])
    setError('')
  }

  const openEdit = (record) => {
    setModal({ mode: 'edit', record })
    setForm({
      patientId: record.patientId?._id || record.patientId,
      type: record.type,
      title: record.title,
      description: record.description || '',
      date: record.date ? new Date(record.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    })
    setPatSearch(record.patientId?.userId?.fullName || '')
    setPatients([])
    setError('')
  }

  const closeModal = () => { setModal(null); setError('') }

  const handleSave = async () => {
    if (modal?.mode === 'create' && !form.patientId) { setError(t('doctorDocuments.patientRequired')); return }
    if (!form.title.trim()) { setError(t('doctorDocuments.titleRequired')); return }
    setError('')
    setSaving(true)
    try {
      if (modal?.mode === 'edit') {
        await api.put(`/ehr/records/${modal.record._id}`, {
          type: form.type, title: form.title.trim(), description: form.description.trim(), date: form.date,
        })
        setSuccess(t('doctorDocuments.updatedSuccess'))
      } else {
        await api.post('/ehr/records', {
          patientId: form.patientId, type: form.type, title: form.title.trim(), description: form.description.trim(), date: form.date,
        })
        setSuccess(t('doctorDocuments.createdSuccess'))
      }
      setModal(null)
      setTimeout(() => setSuccess(''), 3000)
      load()
    } catch (e) {
      setError(e.response?.data?.message || t('doctorDocuments.genericError'))
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async (id) => {
    setSubmittingId(id)
    try {
      await api.patch(`/ehr/records/${id}/submit`)
      setSuccess(t('doctorDocuments.submittedSuccess'))
      setTimeout(() => setSuccess(''), 3000)
      load()
    } catch (e) {
      setError(e.response?.data?.message || t('doctorDocuments.genericError'))
    } finally {
      setSubmittingId(null)
    }
  }

  const filtered = (documents || []).filter(d => {
    const name = d.patientId?.userId?.fullName || ''
    const q = search.toLowerCase()
    return name.toLowerCase().includes(q) || (d.title || '').toLowerCase().includes(q)
  })

  return (
    <DoctorLayout>
      <Toolbar
        title={t('doctorDocuments.title')}
        count={filtered.length}
        right={
          <>
            <SearchInput value={search} onChange={setSearch} placeholder={t('doctorDocuments.searchPlaceholder')} width={320} />
            <PrimaryBtn onClick={openCreate}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              {t('doctorDocuments.create')}
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
              <EmptyRow colSpan={tableCols.length} text={t('doctorDocuments.loadError')} />
            ) : filtered.length === 0 ? (
              <EmptyRow colSpan={tableCols.length} text={search ? t('doctorDocuments.noResults') : t('doctorDocuments.empty')} />
            ) : filtered.map(d => {
              const patName = d.patientId?.userId?.fullName || '—'
              const editable = ['draft', 'returned'].includes(d.approvalStatus)
              return (
                <tr key={d._id} style={{ borderBottom: '1px solid #f1f5f9', height: 56 }}
                  onMouseEnter={e => e.currentTarget.style.background = C.rowHover}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '0 16px', fontWeight: 600, color: C.navy }}>{patName}</td>
                  <td style={{ padding: '0 16px', color: '#334155' }}>{t(`doctorDocuments.types.${d.type}`, d.type)}</td>
                  <td style={{ padding: '0 16px', color: C.sub }}>{formatDate(d.date)}</td>
                  <td style={{ padding: '0 16px' }}>
                    <Badge status={d.approvalStatus} label={t(`doctorDocuments.statuses.${d.approvalStatus}`, d.approvalStatus)} />
                    {d.approvalStatus === 'returned' && d.returnReason && (
                      <div style={{ fontSize: 11, color: '#991b1b', marginTop: 4, maxWidth: 220, overflowWrap: 'anywhere' }}>
                        {t('doctorDocuments.returnReason')}: {d.returnReason}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '0 16px' }}>
                    {editable && (
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={() => openEdit(d)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.teal, fontSize: 12, fontWeight: 600, padding: '4px 2px' }}>
                          {t('doctorDocuments.edit')}
                        </button>
                        <button
                          onClick={() => handleSubmit(d._id)}
                          disabled={submittingId === d._id}
                          style={{ background: 'none', border: 'none', cursor: submittingId === d._id ? 'not-allowed' : 'pointer', color: '#16a34a', fontSize: 12, fontWeight: 600, padding: '4px 2px' }}
                        >
                          {submittingId === d._id ? t('doctorDocuments.saving') : t('doctorDocuments.submit')}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </TableCard>

      {modal && (
        <Modal title={modal.mode === 'edit' ? t('doctorDocuments.editDocument') : t('doctorDocuments.create')} onClose={closeModal} width={560}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {error && <Alert type="error">{error}</Alert>}

            {modal.mode === 'create' && (
              <Field label={t('doctorDocuments.patient')} required>
                <div style={{ position: 'relative' }}>
                  <Input value={patSearch} onChange={handlePatSearch} placeholder={t('doctorDocuments.patientSearchPlaceholder')} />
                  {form.patientId && <div style={{ fontSize: 11, color: C.teal, marginTop: 3 }}>{t('doctorDocuments.selected')}</div>}
                  {(patLoading || patients.length > 0) && (
                    <div style={{
                      position: 'absolute', top: '100%', left: 0, right: 0,
                      background: C.white, border: `1px solid ${C.border}`,
                      borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                      zIndex: 10, maxHeight: 200, overflow: 'auto',
                    }}>
                      {patLoading ? (
                        <div style={{ padding: '10px 14px', color: '#94a3b8', fontSize: 13 }}>{t('doctorDocuments.searching')}</div>
                      ) : patients.map(pat => (
                        <div key={pat._id} onClick={() => selectPatient(pat)}
                          style={{ padding: '9px 14px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', fontSize: 13 }}
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
            )}

            <Field label={t('doctorDocuments.type')} required>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', fontSize: 13, color: C.navy, outline: 'none', boxSizing: 'border-box' }}
              >
                {DOC_TYPES.map(k => <option key={k} value={k}>{t(`doctorDocuments.types.${k}`)}</option>)}
              </select>
            </Field>

            <Field label={t('doctorDocuments.titleField')} required>
              <Input value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} placeholder={t('doctorDocuments.titlePlaceholder')} />
            </Field>

            <Field label={t('doctorDocuments.description')}>
              <Textarea value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} placeholder={t('doctorDocuments.descriptionPlaceholder')} rows={5} />
            </Field>

            <Field label={t('doctorDocuments.date')}>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', fontSize: 13, color: C.navy, outline: 'none', boxSizing: 'border-box' }} />
            </Field>

            <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
              <GhostBtn onClick={closeModal} style={{ flex: 1 }}>{t('doctorDocuments.dismiss')}</GhostBtn>
              <PrimaryBtn onClick={handleSave} disabled={saving} style={{ flex: 2 }}>
                {saving ? t('doctorDocuments.saving') : t('doctorDocuments.save')}
              </PrimaryBtn>
            </div>
          </div>
        </Modal>
      )}
    </DoctorLayout>
  )
}
