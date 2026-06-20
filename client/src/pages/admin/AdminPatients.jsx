import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AdminLayout from '../../components/admin/AdminLayout'
import { exportToCsv } from '../../utils/exportCsv'
import useSort from '../../hooks/useSort'
import PatientTimeline from '../../components/common/PatientTimeline'

import { BASE } from '../../api/config.js'
const emptyForm = { fullName: '', email: '', phone: '', bloodGroup: '' }

const fullName = (p) => {
  if (!p) return '—'
  if (p.userId?.fullName) return p.userId.fullName
  if (p.fullName) return p.fullName
  return '—'
}
const getEmail  = (p) => p?.userId?.email   || '—'
const getPhone  = (p) => p?.userId?.phone   || '—'

export default function AdminPatients() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const token = localStorage.getItem('token') || localStorage.getItem('adminToken')
  const [timelinePatient, setTimelinePatient] = useState(null)

  const [patients, setPatients]     = useState([])
  const [total, setTotal]           = useState(0)
  const [page, setPage]             = useState(1)
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [selected, setSelected]     = useState(null)
  const [detail, setDetail]         = useState(null)
  const [detailLoad, setDetailLoad] = useState(false)
  const [showModal, setShowModal]   = useState(false)
  const [form, setForm]             = useState(emptyForm)
  const [saving, setSaving]         = useState(false)
  const [formError, setFormError]   = useState('')

  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    fetch(`${BASE}/api/v1/patients?page=1&limit=100`, {
      headers: { Authorization: 'Bearer ' + token },
    })
      .then(r => r.json())
      .then(data => {
        const list = data.data?.patients || data.patients || []
        setPatients(list)
        setTotal(data.data?.total || list.length)
      })
      .catch(() => setPatients([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = patients.filter(p =>
    !search ||
    fullName(p).toLowerCase().includes(search.toLowerCase()) ||
    (p.userId?.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.userId?.phone || '').includes(search) ||
    (p.patientId || '').toLowerCase().includes(search.toLowerCase())
  )

  const { sorted: sortedPatients, toggle: toggleSort, SortIcon } = useSort(filtered, 'patientId')

  const pages    = Math.ceil(sortedPatients.length / 10) || 1
  const pagSlice = sortedPatients.slice((page - 1) * 10, page * 10)

  const handleSearch = (val) => { setSearch(val); setPage(1) }

  const openDetail = (p) => {
    setSelected(p._id)
    setDetail(p)
    setDetailLoad(true)
    fetch(`${BASE}/api/v1/patients/${p._id}`, { headers })
      .then(r => r.json())
      .then(d => setDetail(d.data || d))
      .catch(() => {})
      .finally(() => setDetailLoad(false))
  }

  const openModal  = () => { setForm(emptyForm); setFormError(''); setShowModal(true) }
  const closeModal = () => { setShowModal(false); setFormError('') }

  const handleSave = async () => {
    if (!form.fullName?.trim()) { setFormError(t('adminPatients.fullNameRequiredError')); return }
    if (!form.email?.trim())    { setFormError(t('adminPatients.emailRequiredError')); return }
    setSaving(true); setFormError('')
    try {
      const body = {
        fullName:   form.fullName.trim(),
        email:      form.email.trim(),
        phone:      form.phone?.trim()    || undefined,
        bloodGroup: form.bloodGroup       || undefined,
      }
      const r = await fetch(`${BASE}/api/v1/patients/admin-create`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.message || data.error || t('labAdmin.genericError'))
      const created = data.data || data
      if (created?._id) setPatients(prev => [created, ...prev])
      closeModal()
    } catch (e) { setFormError(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = (patient) => {
    if (!window.confirm(t('adminPatients.confirmDelete'))) return
    const uid = patient.userId?._id || patient._id
    fetch(`${BASE}/api/v1/users/${uid}`, { method: 'DELETE', headers })
      .then(() => {
        setPatients(prev => prev.filter(p => p._id !== patient._id))
        if (selected === patient._id) { setSelected(null); setDetail(null) }
      })
  }

  return (
    <AdminLayout activePage="patients">
      <div style={{ display: 'flex', gap: 22, height: 'calc(100vh - 130px)' }}>

        {/* LEFT PANEL */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f1b2d' }}>{t('adminLayout.nav.patients')}</h1>
              <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>{t('adminPatients.patientCount', { count: search ? filtered.length : total })}</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => exportToCsv('pasiyentler.csv',
                  patients.map(p => [
                    p.patientId || '',
                    p.userId?.fullName || p.fullName || '',
                    p.userId?.email || '',
                    p.userId?.phone || '',
                    p.bloodGroup || '',
                    new Date(p.createdAt).toLocaleDateString('az-AZ'),
                  ]),
                  [t('adminPatients.patientId'), t('adminDoctors.fullName'), t('adminDoctors.email'), t('adminPatients.phone'), t('adminPatients.bloodGroup'), t('adminAppointments.date')]
                )}
                style={{ padding: '9px 16px', border: '1px solid #e2e8f0', borderRadius: 9, background: 'white', fontSize: 13, fontWeight: 600, color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                CSV
              </button>
              <button onClick={openModal} style={{ background: '#00848e', color: 'white', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                {t('adminPatients.newPatient')}
              </button>
            </div>
          </div>

          {/* Search */}
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
              <svg width="14" height="14" fill="none" stroke="#94a3b8" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
            <input value={search} onChange={e => handleSearch(e.target.value)} placeholder={t('adminPatients.searchPlaceholder')} style={{ width: '100%', background: 'white', border: '1px solid #e2e8f0', borderRadius: 10, padding: '9px 14px 9px 36px', fontSize: 13, color: '#334155', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          {/* Table */}
          <div style={{ flex: 1, background: 'white', borderRadius: 14, border: '1px solid #f1f5f9', overflow: 'auto' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#00848e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              </div>
            ) : pagSlice.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8', fontSize: 14 }}>{t('adminPatients.notFound')}</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    {[
                      { label: t('adminPatients.patientId'), key: 'patientId' },
                      { label: t('adminDoctors.fullName'),   key: 'userId.fullName' },
                      { label: t('adminDoctors.email'),     key: 'userId.email' },
                      { label: t('adminPatients.phone'),    key: 'userId.phone' },
                      { label: t('adminPatients.bloodGroup'),  key: 'bloodGroup' },
                      { label: t('feedback.status'),     key: null },
                      { label: '',           key: null },
                    ].map(({ label, key }) => (
                      <th key={label}
                        onClick={() => key && toggleSort(key)}
                        style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', userSelect: 'none', cursor: key ? 'pointer' : 'default', whiteSpace: 'nowrap' }}
                        onMouseEnter={e => { if (key) e.currentTarget.style.color = '#00848e' }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8' }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                          {label}{key && <SortIcon colKey={key} />}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagSlice.map(p => {
                    const name       = fullName(p)
                    const isSelected = selected === p._id
                    return (
                      <tr key={p._id} onClick={() => openDetail(p)}
                        style={{ borderBottom: '1px solid #f8fafc', cursor: 'pointer', background: isSelected ? '#f0fafb' : 'white', transition: 'background 0.1s' }}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f8fafc' }}
                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'white' }}
                      >
                        <td style={{ padding: '12px 16px', fontSize: 12, color: '#64748b', fontWeight: 600 }}>{p.patientId || '—'}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#00848e,#00a8b5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                              {name?.[0]?.toUpperCase() || 'P'}
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#0f1b2d' }}>{name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: '#64748b' }}>{getEmail(p)}</td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: '#64748b' }}>{getPhone(p)}</td>
                        <td style={{ padding: '12px 16px' }}>
                          {p.bloodGroup
                            ? <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: '#fef2f2', color: '#dc2626' }}>{p.bloodGroup}</span>
                            : <span style={{ fontSize: 12, color: '#94a3b8' }}>—</span>
                          }
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: '#f0fdf4', color: '#16a34a' }}>
                            Aktiv
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }} onClick={e => e.stopPropagation()}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              onClick={() => navigate(`/admin/ehr/${p._id}`)}
                              style={{ padding: '5px 12px', border: '1px solid #00848e', borderRadius: 7, background: 'white', color: '#00848e', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                            >EHR</button>
                            <button
                              onClick={() => handleDelete(p)}
                              style={{ padding: '4px 10px', borderRadius: 7, border: '1px solid #fee2e2', background: 'white', fontSize: 11, cursor: 'pointer', color: '#ef4444' }}
                            >{t('adminDoctors.delete')}</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14 }}>
              <PagBtn label="‹" disabled={page === 1} onClick={() => setPage(p => p - 1)} />
              {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map(p => (
                <PagBtn key={p} label={p} active={p === page} onClick={() => setPage(p)} />
              ))}
              <PagBtn label="›" disabled={page === pages} onClick={() => setPage(p => p + 1)} />
            </div>
          )}
        </div>

        {/* DETAIL PANEL */}
        <div style={{ width: selected ? 320 : 0, transition: 'width 0.25s', overflow: 'hidden', flexShrink: 0 }}>
          {selected && detail && (
            <div style={{ width: 320, background: 'white', borderRadius: 14, border: '1px solid #f1f5f9', height: '100%', overflow: 'auto', padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#0f1b2d' }}>{t('adminPatients.patientInfo')}</span>
                <button onClick={() => { setSelected(null); setDetail(null) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 18 }}>×</button>
              </div>

              {detailLoad ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                  <div style={{ width: 28, height: 28, border: '3px solid #e2e8f0', borderTopColor: '#00848e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                </div>
              ) : (
                <>
                  <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#00848e,#00a8b5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 24, fontWeight: 700, margin: '0 auto 10px' }}>
                      {fullName(detail)?.[0]?.toUpperCase() || 'P'}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#0f1b2d' }}>{fullName(detail)}</div>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: '#f0fdf4', color: '#16a34a', display: 'inline-block', marginTop: 6 }}>
                      {t('adminPatients.active')}
                    </span>
                  </div>

                  <InfoRow label={t('adminPatients.patientId')}          value={detail.patientId || '—'} />
                  <InfoRow label={t('adminDoctors.email')}               value={detail.userId?.email || '—'} />
                  <InfoRow label={t('adminPatients.phone')}              value={detail.userId?.phone || '—'} />
                  <InfoRow label={t('adminPatients.bloodGroup')}            value={detail.bloodGroup || '—'} />
                  <InfoRow label={t('adminPatients.allergies')}         value={detail.allergies?.join(', ') || '—'} />
                  <InfoRow label={t('adminPatients.chronicConditions')}  value={detail.chronicConditions?.join(', ') || '—'} />
                  <InfoRow label={t('adminPatients.medicalHistory')}  value={detail.medicalHistory?.length ? t('adminPatients.recordCount', { count: detail.medicalHistory.length }) : '—'} />

                  <button
                    onClick={() => setTimelinePatient(detail)}
                    style={{ width: '100%', marginTop: 14, padding: '9px 0', border: '1px solid #00848e', borderRadius: 9, background: 'white', color: '#00848e', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                  >
                    {t('timeline.title')}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ADD PATIENT MODAL */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div style={{ background: 'white', borderRadius: 16, width: 520, maxWidth: '95vw', maxHeight: '90vh', overflow: 'auto', padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f1b2d' }}>{t('adminPatients.newPatient')}</h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 22, lineHeight: 1 }}>×</button>
            </div>

            {formError && (
              <div style={{ background: '#fef2f2', color: '#ef4444', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>{formError}</div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ gridColumn: 'span 2' }}>
                <MField label={`${t('adminDoctors.fullName')} *`} value={form.fullName} onChange={v => setForm(f => ({ ...f, fullName: v }))} />
              </div>
              <MField label={`${t('adminDoctors.email')} *`} value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} type="email" />
              <MField label={t('adminPatients.phone')}  value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} placeholder="0501234567" />
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>{t('adminPatients.bloodGroup')}</label>
                <select
                  value={form.bloodGroup}
                  onChange={e => setForm(f => ({ ...f, bloodGroup: e.target.value }))}
                  style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 9, padding: '9px 12px', fontSize: 13, color: '#334155', outline: 'none', boxSizing: 'border-box', background: 'white' }}
                >
                  <option value="">{t('adminPatients.select')}</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
              <button onClick={closeModal} style={{ padding: '10px 20px', border: '1px solid #e2e8f0', borderRadius: 9, background: 'white', fontSize: 13, cursor: 'pointer', color: '#475569' }}>{t('labResult.cancel')}</button>
              <button onClick={handleSave} disabled={saving} style={{ padding: '10px 24px', border: 'none', borderRadius: 9, background: '#00848e', color: 'white', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? t('labResult.saving') : t('adminInventory.add')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TIMELINE MODAL */}
      {timelinePatient && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget) setTimelinePatient(null) }}
        >
          <div style={{ background: 'white', borderRadius: 16, width: 620, maxWidth: '95vw', maxHeight: '85vh', overflow: 'auto', padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f1b2d' }}>{t('timeline.title')}</h2>
                <p style={{ margin: '3px 0 0', fontSize: 12, color: '#94a3b8' }}>{fullName(timelinePatient)}</p>
              </div>
              <button onClick={() => setTimelinePatient(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 22, lineHeight: 1 }}>×</button>
            </div>
            <PatientTimeline patientId={timelinePatient._id} />
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </AdminLayout>
  )
}

function MField({ label, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 9, padding: '9px 12px', fontSize: 13, color: '#334155', outline: 'none', boxSizing: 'border-box' }} />
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f8fafc' }}>
      <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 12, color: '#334155', fontWeight: 600, textAlign: 'right', maxWidth: '60%' }}>{value}</span>
    </div>
  )
}

function PagBtn({ label, onClick, disabled, active }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ width: 32, height: 32, borderRadius: 8, border: active ? 'none' : '1px solid #e2e8f0', background: active ? '#00848e' : 'white', color: active ? 'white' : '#475569', fontSize: 13, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {label}
    </button>
  )
}
