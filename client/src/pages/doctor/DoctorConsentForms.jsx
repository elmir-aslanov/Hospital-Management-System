import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import DoctorLayout from '../../components/doctor/DoctorLayout'
import {
  C, Toolbar, SearchInput, Badge, Alert, Spinner,
  TableCard, THead, EmptyRow, Modal, Field, Input, Textarea,
  PrimaryBtn, GhostBtn,
} from '../../components/doctor/DoctorUI'
import api from '../../api/axios'

const CONSENT_TYPES = ['procedure_consent', 'operation_consent', 'anesthesia_consent', 'lab_test_consent', 'data_processing_consent', 'treatment_consent']

function formatDate(str) {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function DoctorConsentForms() {
  const { t } = useTranslation()
  const tableCols = [
    t('consentForms.patient'),
    t('consentForms.type'),
    t('consentForms.date'),
    t('consentForms.status'),
    '',
  ]

  const [forms, setForms] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [modal, setModal] = useState(null)
  const [saving, setSaving] = useState(false)
  const [sendingId, setSendingId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [search, setSearch] = useState('')
  const [patients, setPatients] = useState([])
  const [patSearch, setPatSearch] = useState('')
  const [patLoading, setPatLoading] = useState(false)
  const debounceRef = useRef(null)

  const emptyForm = { patientId: '', consentType: 'procedure_consent', title: '', content: '' }
  const [form, setForm] = useState(emptyForm)

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(false)
    try {
      const { data } = await api.get('/consent-forms/doctor/mine', { params: { limit: 100 } })
      setForms(data?.data?.items || [])
    } catch {
      setForms([])
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])
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

  const openEdit = (item) => {
    setModal({ mode: 'edit', record: item })
    setForm({ patientId: item.patientId?._id || item.patientId, consentType: item.consentType, title: item.title, content: item.content })
    setPatSearch(item.patientId?.userId?.fullName || '')
    setPatients([])
    setError('')
  }

  const closeModal = () => { setModal(null); setError('') }

  const handleSave = async () => {
    if (modal?.mode === 'create' && !form.patientId) { setError(t('consentForms.patientRequired')); return }
    if (!form.title.trim()) { setError(t('consentForms.titleRequired')); return }
    if (!form.content.trim()) { setError(t('consentForms.contentRequired')); return }
    setError('')
    setSaving(true)
    try {
      if (modal?.mode === 'edit') {
        await api.put(`/consent-forms/${modal.record._id}`, {
          consentType: form.consentType, title: form.title.trim(), content: form.content.trim(),
        })
        setSuccess(t('consentForms.updatedSuccess'))
      } else {
        await api.post('/consent-forms', {
          patientId: form.patientId, consentType: form.consentType, title: form.title.trim(), content: form.content.trim(),
        })
        setSuccess(t('consentForms.createdSuccess'))
      }
      setModal(null)
      setTimeout(() => setSuccess(''), 3000)
      load()
    } catch (e) {
      setError(e.response?.data?.message || t('consentForms.genericError'))
    } finally {
      setSaving(false)
    }
  }

  const handleSend = async (id) => {
    setSendingId(id)
    try {
      await api.patch(`/consent-forms/${id}/send`)
      setSuccess(t('consentForms.sentSuccess'))
      setTimeout(() => setSuccess(''), 3000)
      load()
    } catch (e) {
      setError(e.response?.data?.message || t('consentForms.genericError'))
    } finally {
      setSendingId(null)
    }
  }

  const filtered = (forms || []).filter(item => {
    const name = item.patientId?.userId?.fullName || ''
    const q = search.toLowerCase()
    return name.toLowerCase().includes(q) || (item.title || '').toLowerCase().includes(q)
  })

  return (
    <DoctorLayout>
      <Toolbar
        title={t('consentForms.title')}
        count={filtered.length}
        right={
          <>
            <SearchInput value={search} onChange={setSearch} placeholder={t('consentForms.searchPlaceholder')} width={320} />
            <PrimaryBtn onClick={openCreate}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              {t('consentForms.create')}
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
              <EmptyRow colSpan={tableCols.length} text={t('consentForms.loadError')} />
            ) : filtered.length === 0 ? (
              <EmptyRow colSpan={tableCols.length} text={search ? t('consentForms.noResults') : t('consentForms.empty')} />
            ) : filtered.map(item => {
              const patName = item.patientId?.userId?.fullName || '—'
              const editable = item.status === 'draft'
              return (
                <tr key={item._id} style={{ borderBottom: '1px solid #f1f5f9', height: 56 }}
                  onMouseEnter={e => e.currentTarget.style.background = C.rowHover}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '0 16px', fontWeight: 600, color: C.navy }}>{patName}</td>
                  <td style={{ padding: '0 16px', color: '#334155' }}>{t(`consentForms.types.${item.consentType}`, item.consentType)}</td>
                  <td style={{ padding: '0 16px', color: C.sub }}>{formatDate(item.createdAt)}</td>
                  <td style={{ padding: '0 16px' }}>
                    <Badge status={item.status} label={t(`consentForms.statuses.${item.status}`, item.status)} />
                    {item.status === 'declined' && item.declinedReason && (
                      <div style={{ fontSize: 11, color: '#991b1b', marginTop: 4, maxWidth: 220, overflowWrap: 'anywhere' }}>
                        {t('consentForms.declineReason')}: {item.declinedReason}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '0 16px' }}>
                    {editable && (
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={() => openEdit(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.teal, fontSize: 12, fontWeight: 600, padding: '4px 2px' }}>
                          {t('consentForms.edit')}
                        </button>
                        <button
                          onClick={() => handleSend(item._id)}
                          disabled={sendingId === item._id}
                          style={{ background: 'none', border: 'none', cursor: sendingId === item._id ? 'not-allowed' : 'pointer', color: '#16a34a', fontSize: 12, fontWeight: 600, padding: '4px 2px' }}
                        >
                          {sendingId === item._id ? t('consentForms.saving') : t('consentForms.sendToPatient')}
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
        <Modal title={modal.mode === 'edit' ? t('consentForms.editForm') : t('consentForms.create')} onClose={closeModal} width={560}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {error && <Alert type="error">{error}</Alert>}

            {modal.mode === 'create' && (
              <Field label={t('consentForms.patient')} required>
                <div style={{ position: 'relative' }}>
                  <Input value={patSearch} onChange={handlePatSearch} placeholder={t('consentForms.patientSearchPlaceholder')} />
                  {form.patientId && <div style={{ fontSize: 11, color: C.teal, marginTop: 3 }}>{t('consentForms.selected')}</div>}
                  {(patLoading || patients.length > 0) && (
                    <div style={{
                      position: 'absolute', top: '100%', left: 0, right: 0,
                      background: C.white, border: `1px solid ${C.border}`,
                      borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                      zIndex: 10, maxHeight: 200, overflow: 'auto',
                    }}>
                      {patLoading ? (
                        <div style={{ padding: '10px 14px', color: '#94a3b8', fontSize: 13 }}>{t('consentForms.searching')}</div>
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

            <Field label={t('consentForms.type')} required>
              <select
                value={form.consentType}
                onChange={e => setForm(f => ({ ...f, consentType: e.target.value }))}
                style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', fontSize: 13, color: C.navy, outline: 'none', boxSizing: 'border-box' }}
              >
                {CONSENT_TYPES.map(k => <option key={k} value={k}>{t(`consentForms.types.${k}`)}</option>)}
              </select>
            </Field>

            <Field label={t('consentForms.titleField')} required>
              <Input value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} placeholder={t('consentForms.titlePlaceholder')} />
            </Field>

            <Field label={t('consentForms.content')} required>
              <Textarea value={form.content} onChange={v => setForm(f => ({ ...f, content: v }))} placeholder={t('consentForms.contentPlaceholder')} rows={6} />
            </Field>

            <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
              <GhostBtn onClick={closeModal} style={{ flex: 1 }}>{t('consentForms.dismiss')}</GhostBtn>
              <PrimaryBtn onClick={handleSave} disabled={saving} style={{ flex: 2 }}>
                {saving ? t('consentForms.saving') : t('consentForms.save')}
              </PrimaryBtn>
            </div>
          </div>
        </Modal>
      )}
    </DoctorLayout>
  )
}
