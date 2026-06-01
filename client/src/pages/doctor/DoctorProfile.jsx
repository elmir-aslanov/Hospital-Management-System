import { useState, useEffect } from 'react'
import DoctorLayout from '../../components/doctor/DoctorLayout'

import { BASE } from '../../api/config.js'

function getToken() {
  return localStorage.getItem('adminToken') || localStorage.getItem('doctorToken') || ''
}

function getDoctorUser() {
  try {
    return JSON.parse(localStorage.getItem('adminUser') || localStorage.getItem('doctorUser') || '{}')
  } catch { return {} }
}

const FIELD_ROWS = [
  { key: 'fullName',       label: 'Ad Soyad',        type: 'text',  editable: true  },
  { key: 'email',          label: 'E-poçt',           type: 'email', editable: false },
  { key: 'phone',          label: 'Telefon',          type: 'text',  editable: true  },
  { key: 'specialization', label: 'İxtisas',          type: 'text',  editable: true  },
  { key: 'department',     label: 'Şöbə',             type: 'text',  editable: true  },
  { key: 'experience',     label: 'Təcrübə (il)',     type: 'text',  editable: true  },
  { key: 'role',           label: 'Rol',              type: 'text',  editable: false },
  { key: 'licenseNumber',  label: 'Lisenziya nömrəsi',type: 'text',  editable: false },
]

export default function DoctorProfile() {
  const localUser  = getDoctorUser()
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
      if (r.ok) {
        const data = await r.json()
        const doc  = data.data || data.doctor || data
        setProfile(doc)
        setForm({
          fullName:       doc.userId?.fullName || doc.fullName || localUser.fullName || '',
          email:          doc.userId?.email    || doc.email    || localUser.email    || '',
          phone:          doc.userId?.phone    || doc.phone    || localUser.phone    || '',
          specialization: doc.specialization   || localUser.specialization || '',
          department:     doc.departmentId?.name || doc.department || localUser.department || '',
          experience:     String(doc.experience || localUser.experience || ''),
          role:           doc.userId?.role     || localUser.role          || 'DOCTOR',
          licenseNumber:  doc.licenseNumber    || '',
          bio:            doc.bio              || '',
        })
      } else {
        // Fall back to localStorage data
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
          bio:            localUser.bio            || '',
        })
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
      const body = {
        fullName:       form.fullName.trim(),
        phone:          form.phone.trim(),
        specialization: form.specialization.trim(),
        bio:            form.bio.trim(),
      }
      const doctorId = profile?._id
      if (!doctorId) throw new Error('Doctor profile ID tapılmadı')
      const r = await fetch(`${BASE}/api/v1/doctors/${doctorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(body)
      })
      if (!r.ok) {
        const d = await r.json()
        throw new Error(d.message || d.error || 'Xəta baş verdi')
      }
      setEditing(false)
      setSuccess('Profil uğurla yeniləndi')
      setTimeout(() => setSuccess(''), 3000)
      load()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const initial = (form.fullName || localUser.fullName || 'D')[0]?.toUpperCase() || 'D'

  return (
    <DoctorLayout activePage="profile">
      {success && (
        <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: 10, padding: '10px 16px', marginBottom: 16, color: '#166534', fontSize: 13 }}>
          {success}
        </div>
      )}

      <div style={{ maxWidth: 700 }}>
        {/* Profile Card */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: 20 }}>
          {/* Cover */}
          <div style={{ height: 100, background: 'linear-gradient(135deg,#0a1628 0%,#00848e 100%)' }} />
          {/* Avatar + name */}
          <div style={{ padding: '0 28px 24px', position: 'relative' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'linear-gradient(135deg,#00848e,#00a8b5)',
              border: '4px solid white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: 28, fontWeight: 700,
              marginTop: -40, marginBottom: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
            }}>{initial}</div>

            {loading ? (
              <div style={{ color: '#94a3b8', fontSize: 14 }}>Yüklənir...</div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#0f1b2d' }}>{form.fullName || '—'}</h2>
                  <p style={{ margin: '4px 0 0', fontSize: 14, color: '#00848e', fontWeight: 500 }}>{form.specialization || form.role || 'Həkim'}</p>
                  {form.department && <p style={{ margin: '2px 0 0', fontSize: 13, color: '#64748b' }}>{form.department}</p>}
                </div>
                {!editing && (
                  <button onClick={() => { setEditing(true); setError('') }} style={{
                    background: 'linear-gradient(135deg,#00848e,#00a8b5)', color: 'white', border: 'none',
                    borderRadius: 9, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6
                  }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Redaktə et
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Info / Edit Form */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f1b2d' }}>
              {editing ? 'Profili Redaktə Et' : 'Şəxsi Məlumatlar'}
            </h3>
            {editing && (
              <button onClick={() => { setEditing(false); setError('') }} style={{ background: 'none', border: 'none', fontSize: 13, color: '#94a3b8', cursor: 'pointer' }}>
                Ləğv et
              </button>
            )}
          </div>

          {error && (
            <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#dc2626', marginBottom: 16 }}>{error}</div>
          )}

          {editing ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {FIELD_ROWS.filter(f => f.editable).map(f => (
                <div key={f.key} style={f.key === 'bio' ? { gridColumn: '1 / -1' } : {}}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>{f.label}</label>
                  <input
                    type={f.type}
                    value={form[f.key] || ''}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1px solid #d1d5db', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Bio</label>
                <textarea
                  value={form.bio || ''}
                  onChange={e => setForm(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Özünüz haqqında qısa məlumat..."
                  rows={3}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1px solid #d1d5db', fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10, marginTop: 4 }}>
                <button onClick={() => { setEditing(false); setError('') }} style={{ flex: 1, padding: '10px', borderRadius: 9, border: '1px solid #e2e8f0', background: 'white', fontSize: 13, cursor: 'pointer' }}>
                  Ləğv et
                </button>
                <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: '10px', borderRadius: 9, border: 'none', background: saving ? '#94a3b8' : '#00848e', color: 'white', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}>
                  {saving ? 'Saxlanılır...' : 'Dəyişiklikləri Saxla'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              {FIELD_ROWS.map(f => {
                const val = form[f.key]
                if (!val) return null
                return (
                  <div key={f.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f8fafc' }}>
                    <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{f.label}</span>
                    <span style={{ fontSize: 13, color: '#0f1b2d', fontWeight: 600 }}>{val}</span>
                  </div>
                )
              })}
              {form.bio && (
                <div style={{ marginTop: 14, padding: 14, background: '#f8fafc', borderRadius: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Bio</div>
                  <p style={{ margin: 0, fontSize: 13, color: '#475569', lineHeight: 1.6 }}>{form.bio}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stats Row */}
        {!loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginTop: 16 }}>
            {[
              { label: 'İxtisas', value: form.specialization || '—', icon: '🩺' },
              { label: 'Təcrübə', value: form.experience ? `${form.experience} il` : '—', icon: '📅' },
              { label: 'Şöbə', value: form.department || '—', icon: '🏥' },
            ].map(s => (
              <div key={s.label} style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: '16px 18px', textAlign: 'center' }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f1b2d' }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DoctorLayout>
  )
}
