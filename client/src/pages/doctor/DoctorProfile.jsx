import { useState, useEffect } from 'react'
import DoctorLayout from '../../components/doctor/DoctorLayout'
import { C, Alert, Spinner, Field, Input, Textarea, PrimaryBtn, GhostBtn } from '../../components/doctor/DoctorUI'
import { BASE } from '../../api/config.js'

function getToken() {
  return localStorage.getItem('adminToken') || localStorage.getItem('doctorToken') || ''
}
function getDoctorUser() {
  try { return JSON.parse(localStorage.getItem('adminUser') || localStorage.getItem('doctorUser') || '{}') }
  catch { return {} }
}

const EDITABLE = [
  { key: 'fullName',       label: 'Ad Soyad'          },
  { key: 'phone',          label: 'Telefon'            },
  { key: 'specialization', label: 'İxtisas'            },
  { key: 'bio',            label: 'Qısa bio', wide: true },
]

const ALL_FIELDS = [
  { key: 'fullName',       label: 'Ad Soyad'          },
  { key: 'email',          label: 'E-poçt'             },
  { key: 'phone',          label: 'Telefon'            },
  { key: 'specialization', label: 'İxtisas'            },
  { key: 'department',     label: 'Şöbə'               },
  { key: 'experience',     label: 'Təcrübə (il)'       },
  { key: 'licenseNumber',  label: 'Lisenziya nömrəsi'  },
  { key: 'role',           label: 'Rol'                },
]

export default function DoctorProfile() {
  const localUser = getDoctorUser()
  const [profile,  setProfile]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [editing,  setEditing]  = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [form,     setForm]     = useState({})
  const [success,  setSuccess]  = useState('')
  const [error,    setError]    = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const r = await fetch(`${BASE}/api/v1/doctor/me`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      const build = (doc) => ({
        fullName:       doc.userId?.fullName || doc.fullName || localUser.fullName || '',
        email:          doc.userId?.email    || doc.email    || localUser.email    || '',
        phone:          doc.userId?.phone    || doc.phone    || localUser.phone    || '',
        specialization: doc.specialization   || localUser.specialization || '',
        department:     doc.departmentId?.name || doc.department || localUser.department || '',
        experience:     String(doc.experience || localUser.experience || ''),
        role:           doc.userId?.role     || localUser.role || 'DOCTOR',
        licenseNumber:  doc.licenseNumber    || '',
        bio:            doc.bio              || '',
      })
      if (r.ok) {
        const data = await r.json()
        const doc  = data.data || data.doctor || data
        setProfile(doc)
        setForm(build(doc))
      } else {
        setProfile(localUser)
        setForm(build(localUser))
      }
    } catch {
      setProfile(localUser)
      setForm({
        fullName:       localUser.fullName       || '',
        email:          localUser.email          || '',
        phone:          localUser.phone          || '',
        specialization: localUser.specialization || '',
        department:     localUser.department     || '',
        experience:     String(localUser.experience || ''),
        role:           localUser.role           || 'DOCTOR',
        licenseNumber:  localUser.licenseNumber  || '',
        bio:            '',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleSave = async () => {
    if (!form.fullName.trim()) { setError('Ad Soyad daxil edin'); return }
    setError('')
    setSaving(true)
    try {
      const doctorId = profile?._id
      if (!doctorId) throw new Error('Doctor profile ID tapılmadı')
      const r = await fetch(`${BASE}/api/v1/doctors/${doctorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          fullName:       form.fullName.trim(),
          phone:          form.phone.trim(),
          specialization: form.specialization.trim(),
          bio:            form.bio.trim(),
        }),
      })
      if (!r.ok) {
        const d = await r.json()
        throw new Error(d.message || d.error || 'Xəta baş verdi')
      }
      setEditing(false)
      setSuccess('Profil uğurla yeniləndi')
      setTimeout(() => setSuccess(''), 3500)
      load()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const initial  = (form.fullName || localUser.fullName || 'D')[0]?.toUpperCase() || 'D'
  const roleDisplay = form.role === 'DOCTOR' ? 'Həkim' : (form.role || 'Həkim')

  return (
    <DoctorLayout>
      <div style={{ maxWidth: 1140, margin: '0 auto' }}>

        {success && <Alert type="success" style={{ marginBottom: 16 }}>{success}</Alert>}

        {/* Profile header card */}
        <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden', marginBottom: 16 }}>
          {/* Cover */}
          <div style={{
            height: 88,
            background: `linear-gradient(110deg, ${C.sidebar} 0%, ${C.teal} 100%)`,
          }} />

          {/* Avatar + info */}
          <div style={{ padding: '0 28px 20px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
              {/* Avatar */}
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'linear-gradient(135deg,#168C96,#1aaabb)',
                border: '4px solid white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: 28, fontWeight: 700,
                marginTop: -40, flexShrink: 0,
                boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
              }}>{initial}</div>

              {loading ? (
                <div style={{ paddingBottom: 4 }}><Spinner /></div>
              ) : (
                <div style={{ paddingBottom: 6 }}>
                  <h2 style={{ margin: '0 0 2px', fontSize: 20, fontWeight: 700, color: C.navy, fontFamily: "'Raleway',sans-serif" }}>{form.fullName || '—'}</h2>
                  <p style={{ margin: '0 0 2px', fontSize: 13, color: C.teal, fontWeight: 600 }}>{form.specialization || roleDisplay}</p>
                  {form.department && <p style={{ margin: 0, fontSize: 12, color: C.sub }}>{form.department}</p>}
                </div>
              )}
            </div>

            {!loading && !editing && (
              <button
                onClick={() => { setEditing(true); setError('') }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: C.tealDim, color: C.teal,
                  border: `1px solid #b2d8db`, borderRadius: 8,
                  padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  marginBottom: 6, outline: 'none',
                }}
                onFocus={e => e.currentTarget.style.boxShadow = `0 0 0 2px rgba(22,140,150,0.4)`}
                onBlur={e => e.currentTarget.style.boxShadow = 'none'}
              >
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Redaktə et
              </button>
            )}
          </div>
        </div>

        {/* Info / Edit */}
        <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: '22px 28px' }}>
          {error && <Alert type="error" style={{ marginBottom: 16 }}>{error}</Alert>}

          {editing ? (
            <>
              <h3 style={{ margin: '0 0 18px', fontSize: 15, fontWeight: 700, color: C.navy }}>Profili Redaktə Et</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {EDITABLE.map(f => (
                  <div key={f.key} style={f.wide ? { gridColumn: '1 / -1' } : {}}>
                    <Field label={f.label}>
                      {f.wide
                        ? <Textarea value={form[f.key] || ''} onChange={v => setForm(p => ({ ...p, [f.key]: v }))} placeholder="Özünüz haqqında qısa məlumat..." rows={3} />
                        : <Input value={form[f.key] || ''} onChange={v => setForm(p => ({ ...p, [f.key]: v }))} />
                      }
                    </Field>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
                <GhostBtn onClick={() => { setEditing(false); setError('') }}>Ləğv et</GhostBtn>
                <PrimaryBtn onClick={handleSave} disabled={saving}>
                  {saving ? 'Saxlanılır...' : 'Dəyişiklikləri Saxla'}
                </PrimaryBtn>
              </div>
            </>
          ) : (
            <>
              <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: C.navy }}>Şəxsi Məlumatlar</h3>
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><Spinner /></div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 40px' }}>
                  {ALL_FIELDS.map(f => {
                    let val = form[f.key]
                    if (f.key === 'role') val = val === 'DOCTOR' ? 'Həkim' : (val || '—')
                    if (!val) return null
                    return (
                      <div key={f.key} style={{ paddingBottom: 14, marginBottom: 14, borderBottom: `1px solid #f1f5f9` }}>
                        <div style={{ fontSize: 11.5, fontWeight: 600, color: C.sub, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{f.label}</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>{val}</div>
                      </div>
                    )
                  })}
                </div>
              )}
              {form.bio && (
                <div style={{ marginTop: 4, padding: '14px 16px', background: '#f8fafc', borderRadius: 9 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: C.sub, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>Bio</div>
                  <p style={{ margin: 0, fontSize: 13, color: '#475569', lineHeight: 1.6 }}>{form.bio}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 680px) {
          .dr-profile-info { grid-template-columns: 1fr !important; }
          .dr-profile-edit { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </DoctorLayout>
  )
}
