import { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function AdminDoctors() {
  const token = localStorage.getItem('adminToken') || localStorage.getItem('token')

  const getName  = (doc) => {
    const u = doc.userId
    if (!u) return 'Naməlum'
    if (u.fullName?.trim()) return u.fullName.trim()
    const ns = ((u.name || '') + ' ' + (u.surname || '')).trim()
    if (ns) return ns
    if (u.email) return u.email.split('@')[0]
    return 'Naməlum'
  }
  const getPhoto = (doc) => doc.userId?.photoUrl || null

  const [doctors,      setDoctors]      = useState([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [showModal,    setShowModal]    = useState(false)
  const [editDoctor,   setEditDoctor]   = useState(null)
  const [saving,       setSaving]       = useState(false)
  const [error,        setError]        = useState('')
  const [success,      setSuccess]      = useState('')
  const [doctorUsers,  setDoctorUsers]  = useState([])

  // ─── Form fields ──────────────────────────────────────────────────────────
  const [userId,         setUserId]         = useState('')
  const [specialization, setSpecialization] = useState('')
  const [licenseNumber,  setLicenseNumber]  = useState('')
  const [experience,     setExperience]     = useState('')
  const [bio,            setBio]            = useState('')
  const [isAvailable,    setIsAvailable]    = useState(true)

  const resetForm = () => {
    setUserId(''); setSpecialization(''); setLicenseNumber('')
    setExperience(''); setBio(''); setIsAvailable(true)
  }

  const populateForm = (doc) => {
    setSpecialization(doc.specialization || '')
    setLicenseNumber(doc.licenseNumber || '')
    setExperience(doc.experience ?? '')
    setBio(doc.bio || '')
    setIsAvailable(doc.isAvailable !== false)
  }

  // ─── Fetch doctors ────────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${BASE}/api/v1/doctors?limit=100`)
      .then(r => r.json())
      .then(data => {
        const list = data.data?.doctors || data.doctors || (Array.isArray(data) ? data : [])
        setDoctors(list)
      })
      .catch(() => setDoctors([]))
      .finally(() => setLoading(false))
  }, [])

  // ─── Open create modal — fetch DOCTOR-role users ──────────────────────────
  const openCreate = () => {
    resetForm(); setEditDoctor(null); setError('')
    fetch(`${BASE}/api/v1/users?role=DOCTOR`, {
      headers: { Authorization: 'Bearer ' + token },
    })
      .then(r => r.json())
      .then(data => setDoctorUsers(data.data?.users || data.users || []))
      .catch(() => setDoctorUsers([]))
    setShowModal(true)
  }

  // ─── Save ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!specialization.trim())              { setError('İxtisas tələb olunur'); return }
    if (!editDoctor && !userId)              { setError('İstifadəçi seçilməlidir'); return }
    if (!editDoctor && !licenseNumber.trim()) { setError('Lisenziya nömrəsi tələb olunur'); return }
    setSaving(true); setError('')
    try {
      const url    = editDoctor ? `${BASE}/api/v1/doctors/${editDoctor._id}` : `${BASE}/api/v1/doctors`
      const method = editDoctor ? 'PUT' : 'POST'
      const body   = editDoctor
        ? { specialization: specialization.trim(), licenseNumber: licenseNumber.trim(), experience: Number(experience) || 0, bio: bio.trim(), isAvailable }
        : { userId, specialization: specialization.trim(), licenseNumber: licenseNumber.trim(), experience: Number(experience) || 0, bio: bio.trim() }

      const r    = await fetch(url, { method, headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await r.json()
      if (!r.ok) throw new Error(data.message || 'Xəta')

      const saved = data.data || data
      if (editDoctor) {
        setDoctors(prev => prev.map(d => d._id === editDoctor._id ? saved : d))
        setSuccess('Həkim uğurla yeniləndi')
      } else {
        setDoctors(prev => [saved, ...prev])
        setSuccess('Həkim uğurla əlavə edildi')
      }
      setShowModal(false); setEditDoctor(null)
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  // ─── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Bu həkimi silmək istəyirsiniz?')) return
    try {
      const r = await fetch(`${BASE}/api/v1/doctors/${id}`, { method: 'DELETE', headers: { Authorization: 'Bearer ' + token } })
      if (!r.ok) { const d = await r.json(); throw new Error(d.message || 'Silmə zamanı xəta') }
      setDoctors(prev => prev.filter(d => d._id !== id))
      setSuccess('Həkim silindi'); setTimeout(() => setSuccess(''), 3000)
    } catch (e) { alert(e.message) }
  }

  // ─── Search ───────────────────────────────────────────────────────────────
  const filtered = doctors.filter(d =>
    !search ||
    getName(d).toLowerCase().includes(search.toLowerCase()) ||
    (d.specialization || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.userId?.department || '').toLowerCase().includes(search.toLowerCase())
  )

  const closeModal = () => { setShowModal(false); setEditDoctor(null); setError('') }

  return (
    <AdminLayout activePage="doctors">
      {success && (
        <div style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 10, padding: '10px 16px', fontSize: 13, fontWeight: 600, marginBottom: 18 }}>
          {success}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f1b2d' }}>Həkimlər</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>{filtered.length} həkim qeydiyyatda</p>
        </div>
        <button
          onClick={openCreate}
          style={{ background: '#00848e', color: 'white', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Həkim əlavə et
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: 340, marginBottom: 24 }}>
        <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
          <svg width="14" height="14" fill="none" stroke="#94a3b8" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Ad, ixtisas axtar..."
          style={{ width: '100%', background: 'white', border: '1px solid #e2e8f0', borderRadius: 10, padding: '9px 14px 9px 36px', fontSize: 13, color: '#334155', outline: 'none', boxSizing: 'border-box' }} />
      </div>

      {/* Cards */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
          <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#00848e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, color: '#94a3b8', fontSize: 14 }}>Həkim tapılmadı</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 18 }}>
          {filtered.map(doc => (
            <div key={doc._id} style={{ background: 'white', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
              <div style={{ height: 130, background: 'linear-gradient(135deg,#e8f6f8,#f0fafb)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {getPhoto(doc) ? (
                  <img src={getPhoto(doc)} alt={getName(doc)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#00848e,#00a8b5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 24, fontWeight: 700 }}>
                    {getName(doc).charAt(0).toUpperCase()}
                  </div>
                )}
                <div style={{ position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: '50%', background: doc.isAvailable ? '#22c55e' : '#94a3b8', boxShadow: doc.isAvailable ? '0 0 6px rgba(34,197,94,0.5)' : 'none' }} />
              </div>
              <div style={{ padding: '14px 16px' }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#0f1b2d', marginBottom: 3 }}>{getName(doc)}</div>
                <div style={{ fontSize: 12, color: '#00848e', fontWeight: 600, marginBottom: 2 }}>{doc.specialization || '—'}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 2 }}>
                  {doc.userId?.department || '—'}{doc.experience ? ` · ${doc.experience} il` : ''}
                </div>
                {doc.licenseNumber && (
                  <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 10 }}>Lic: {doc.licenseNumber}</div>
                )}
                {doc.bio && (
                  <div style={{ fontSize: 11, color: '#64748b', marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{doc.bio}</div>
                )}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => { populateForm(doc); setEditDoctor(doc); setError(''); setShowModal(true) }}
                    style={{ flex: 1, padding: '7px 0', fontSize: 12, fontWeight: 600, border: '1px solid #e2e8f0', borderRadius: 8, background: 'white', color: '#475569', cursor: 'pointer' }}
                  >Redaktə</button>
                  <button
                    onClick={() => handleDelete(doc._id)}
                    style={{ padding: '7px 12px', fontSize: 12, fontWeight: 600, border: 'none', borderRadius: 8, background: '#fef2f2', color: '#ef4444', cursor: 'pointer' }}
                  >Sil</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div style={{ background: 'white', borderRadius: 16, width: 520, maxWidth: '95vw', maxHeight: '90vh', overflow: 'auto', padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f1b2d' }}>
                {editDoctor ? 'Həkimi Redaktə Et' : 'Yeni Həkim əlavə et'}
              </h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 20, lineHeight: 1 }}>×</button>
            </div>

            {error && (
              <div style={{ background: '#fef2f2', color: '#ef4444', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>{error}</div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {/* userId — only for create */}
              {!editDoctor && (
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={lbl}>İstifadəçi (Həkim) *</label>
                  <select value={userId} onChange={e => setUserId(e.target.value)} style={inp}>
                    <option value="">Seçin...</option>
                    {doctorUsers.map(u => (
                      <option key={u._id} value={u._id}>
                        {u.fullName || ((u.name || '') + ' ' + (u.surname || '')).trim() || u.email}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <MF label="İxtisas *" value={specialization} onChange={setSpecialization} />
              <MF label="Lisenziya nömrəsi *" value={licenseNumber} onChange={setLicenseNumber} />
              <MF label="Təcrübə (il)" value={experience} onChange={setExperience} type="number" />

              <div style={{ gridColumn: 'span 2' }}>
                <label style={lbl}>Bio</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
                  style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 9, padding: '9px 12px', fontSize: 13, color: '#334155', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>

              {/* isAvailable — only for edit */}
              {editDoctor && (
                <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="checkbox" id="isAvailable" checked={isAvailable} onChange={e => setIsAvailable(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#00848e' }} />
                  <label htmlFor="isAvailable" style={{ fontSize: 13, color: '#475569', cursor: 'pointer' }}>Qəbul aparır (mövcuddur)</label>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
              <button onClick={closeModal} style={{ padding: '10px 20px', border: '1px solid #e2e8f0', borderRadius: 9, background: 'white', fontSize: 13, cursor: 'pointer', color: '#475569' }}>
                Ləğv et
              </button>
              <button onClick={handleSave} disabled={saving} style={{ padding: '10px 24px', border: 'none', borderRadius: 9, background: '#00848e', color: 'white', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saxlanır...' : editDoctor ? 'Yenilə' : 'Saxla'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </AdminLayout>
  )
}

const lbl = { fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }
const inp = { width: '100%', border: '1px solid #e2e8f0', borderRadius: 9, padding: '9px 12px', fontSize: 13, color: '#334155', outline: 'none', background: 'white', boxSizing: 'border-box' }

function MF({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label style={lbl}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} style={inp} />
    </div>
  )
}
