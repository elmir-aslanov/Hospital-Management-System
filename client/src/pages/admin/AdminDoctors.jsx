import { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { BASE } from '../../api/config.js'
import AvatarUpload from '../../components/common/AvatarUpload'
import { showSuccess, showError, getErrorMessage } from '../../utils/alert'
import { clampNumberInput, toBoundedNumber } from '../../utils/numberInput'

export default function AdminDoctors() {
  const token = localStorage.getItem('token') || localStorage.getItem('adminToken')

  const getName  = (doc) => {
    const u = doc.userId
    if (!u) return 'Naməlum'
    if (u.fullName?.trim()) return u.fullName.trim()
    const ns = ((u.name || '') + ' ' + (u.surname || '')).trim()
    if (ns) return ns
    if (u.email) return u.email.split('@')[0]
    return 'Naməlum'
  }
  const resolveImage = (src) => {
    if (!src) return null
    if (typeof src === 'object') src = src.url || src.secure_url || src.path || ''
    if (!src) return null
    if (src.startsWith('http')) return src
    if (src.startsWith('/')) return `${BASE}${src}`
    return src
  }
  const getPhoto = (doc) => resolveImage(doc.image || doc.imageUrl || doc.userId?.photoUrl || null)

  const [doctors,      setDoctors]      = useState([])
  const [departments,  setDepartments]  = useState([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [showModal,    setShowModal]    = useState(false)
  const [editDoctor,   setEditDoctor]   = useState(null)
  const [saving,       setSaving]       = useState(false)
  const [error,        setError]        = useState('')
  const [, setDoctorUsers]  = useState([])
  const [doctorSuccessModal, setDoctorSuccessModal] = useState(null)
  const [copied, setCopied] = useState(false)

  // ─── Form fields ──────────────────────────────────────────────────────────
  const [, setCreateMode]      = useState('quick')
  const [newFullName,     setNewFullName]     = useState('')
  const [newEmail,        setNewEmail]        = useState('')
  const [specialization,  setSpecialization]  = useState('')
  const [experience,      setExperience]      = useState('')
  const [bio,             setBio]             = useState('')
  const [isAvailable,     setIsAvailable]     = useState(true)
  const [department,      setDepartment]      = useState('')
  const [departmentId,    setDepartmentId]    = useState('')
  const [consultationFee, setConsultationFee] = useState('')
  const [order,           setOrder]           = useState(0)
  const [isActive,        setIsActive]        = useState(true)
  const [doctorPhoto,     setDoctorPhoto]     = useState('')
  const [doctorPhotoFile, setDoctorPhotoFile] = useState(null)
  const [doctorPhotoError, setDoctorPhotoError] = useState('')

  const resetForm = () => {
    setCreateMode('quick'); setNewFullName(''); setNewEmail('')
    setSpecialization(''); setExperience(''); setBio(''); setIsAvailable(true)
    setDepartment(''); setDepartmentId(''); setConsultationFee(''); setOrder(0); setIsActive(true)
    setDoctorPhoto(''); setDoctorPhotoFile(null); setDoctorPhotoError('')
  }

  const populateForm = (doc) => {
    setSpecialization(doc.specialization || '')
    setExperience(doc.experience ?? '')
    setBio(doc.bio || '')
    setIsAvailable(doc.isAvailable !== false)
    setDepartment(doc.department || '')
    setDepartmentId(doc.departmentId?._id || doc.departmentId || '')
    setConsultationFee(doc.consultationFee || '')
    setOrder(doc.order || 0)
    setIsActive(doc.isActive !== false)
    setDoctorPhoto(getPhoto(doc) || '')
    setDoctorPhotoFile(null)
    setDoctorPhotoError('')
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

    fetch(`${BASE}/api/v1/departments`)
      .then(r => r.json())
      .then(d => setDepartments(d.data || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!doctorSuccessModal) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setDoctorSuccessModal(null)
        setCopied(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [doctorSuccessModal])

  // ─── Open create modal — fetch DOCTOR-role users ──────────────────────────
  const openCreate = () => {
    resetForm(); setEditDoctor(null); setError('')
    fetch(`${BASE}/api/v1/users?role=DOCTOR`, {
      headers: { Authorization: 'Bearer ' + token },
    })
      .then(r => r.json())
      .then(data => {
        const allUsers = data.data?.users || data.users || []
        const usedIds  = new Set(doctors.map(d => d.userId?._id?.toString() || d.userId?.toString()))
        setDoctorUsers(allUsers.filter(u => !usedIds.has(u._id?.toString())))
      })
      .catch(() => setDoctorUsers([]))
    setShowModal(true)
  }

  // ─── Save ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (doctorPhotoError) {
      setError(doctorPhotoError)
      return
    }

    const toFormData = (payload) => {
      const fd = new FormData()
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) fd.append(key, value)
      })
      if (doctorPhotoFile) fd.append('image', doctorPhotoFile)
      return fd
    }

    if (editDoctor) {
      // ── EDIT ──────────────────────────────────────────
      if (!specialization.trim()) { setError('İxtisas tələb olunur'); return }
      setSaving(true); setError('')
      try {
        const updates = { specialization: specialization.trim(), experience: toBoundedNumber(experience, { min: 0, integer: true }), bio: bio.trim(), isAvailable }
        if (department.trim())       updates.department      = department.trim()
        if (departmentId)            updates.departmentId    = departmentId
        if (consultationFee !== '')  updates.consultationFee = toBoundedNumber(consultationFee, { min: 0 })
        updates.order    = toBoundedNumber(order, { min: 0, integer: true })
        updates.isActive = isActive

        const r    = await fetch(`${BASE}/api/v1/doctors/${editDoctor._id}`, { method: 'PUT', headers: { Authorization: 'Bearer ' + token }, body: toFormData(updates) })
        const data = await r.json()
        if (!r.ok) throw new Error(data.message || 'Xəta')
        const saved = data.data || data
        setDoctors(prev => prev.map(d => d._id === editDoctor._id ? saved : d))
        showSuccess('Həkim məlumatları uğurla yeniləndi.')
        setShowModal(false); setEditDoctor(null)
      } catch (e) { setError(e.message); showError(getErrorMessage(e, 'Həkim yenilənmədi.')) }
      finally { setSaving(false) }
    } else {
      // ── QUICK CREATE (admin-create) ──────────────────
      if (!newFullName.trim())     { setError('Ad Soyad tələb olunur'); return }
      if (!newEmail.trim())        { setError('E-poçt tələb olunur'); return }
      if (!specialization.trim())  { setError('İxtisas tələb olunur'); return }
      if (!departmentId && !department.trim()) { setError('Şöbə seçilməlidir'); return }

      setSaving(true); setError('')
      try {
        const body = {
          fullName:        newFullName.trim(),
          email:           newEmail.trim(),
          specialization:  specialization.trim(),
          experience:      toBoundedNumber(experience, { min: 0, integer: true }),
          bio:             bio.trim(),
          department:      department?.trim() || '',
          departmentId:    departmentId || undefined,
          consultationFee: toBoundedNumber(consultationFee, { min: 0 }),
          order:           toBoundedNumber(order, { min: 0, integer: true }),
        }
        const r = await fetch(`${BASE}/api/v1/doctors/admin-create`, {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + token },
          body: toFormData(body),
        })
        const data = await r.json()
        if (!r.ok) throw new Error(data.message || 'Xəta baş verdi')
        const created = data.data?.doctor || data.data || data
        if (created?._id) setDoctors(prev => [created, ...prev])

        setDoctorSuccessModal({
          name: created?.userId?.fullName || newFullName.trim(),
          email: created?.userId?.email || newEmail.trim(),
          password: data.data?.autoPassword || '—',
          licenseNumber: data.data?.licenseNumber || created?.licenseNumber || '—',
        })
        showSuccess('Yeni həkim uğurla əlavə edildi.')
        setCopied(false)
        closeModal()
      } catch (e) { setError(e.message); showError(getErrorMessage(e, 'Həkim əlavə edilmədi.')) }
      finally { setSaving(false) }
    }
  }

  // ─── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Bu həkimi silmək istəyirsiniz?')) return
    try {
      const r = await fetch(`${BASE}/api/v1/doctors/${id}`, { method: 'DELETE', headers: { Authorization: 'Bearer ' + token } })
      if (!r.ok) { const d = await r.json(); throw new Error(d.message || 'Silmə zamanı xəta') }
      setDoctors(prev => prev.filter(d => d._id !== id))
      showSuccess('Həkim uğurla silindi.')
    } catch (e) { showError(getErrorMessage(e, 'Həkim silinmədi.')) }
  }

  // ─── Search ───────────────────────────────────────────────────────────────
  const filtered = doctors.filter(d =>
    !search ||
    getName(d).toLowerCase().includes(search.toLowerCase()) ||
    (d.specialization || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.userId?.department || '').toLowerCase().includes(search.toLowerCase())
  )

  const closeModal = () => { setShowModal(false); setEditDoctor(null); setError(''); setDoctorPhotoFile(null); setDoctorPhotoError('') }
  const closeDoctorSuccessModal = () => { setDoctorSuccessModal(null); setCopied(false) }

  const copyDoctorCredentials = async () => {
    if (!doctorSuccessModal) return

    const text = `Həkim yaradıldı!\n\nE-poçt: ${doctorSuccessModal.email || '—'}\nŞifrə: ${doctorSuccessModal.password || '—'}\nLisenziya: ${doctorSuccessModal.licenseNumber || '—'}\n\nBu məlumatı həkimə bildirin.`

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.setAttribute('readonly', '')
        textarea.style.position = 'fixed'
        textarea.style.left = '-9999px'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <AdminLayout activePage="doctors">

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
                  <img src={getPhoto(doc)} alt={getName(doc)} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
                ) : (
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#00848e,#00a8b5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 24, fontWeight: 700 }}>
                    {getName(doc).charAt(0).toUpperCase()}
                  </div>
                )}
                <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 5 }}>
                  {doc.isActive === false && (
                    <span style={{ fontSize: 10, fontWeight: 600, background: '#fef2f2', color: '#dc2626', borderRadius: 6, padding: '2px 6px' }}>
                      Deaktiv
                    </span>
                  )}
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: doc.isAvailable ? '#22c55e' : '#94a3b8', boxShadow: doc.isAvailable ? '0 0 6px rgba(34,197,94,0.5)' : 'none', marginTop: 1 }} />
                </div>
              </div>
              <div style={{ padding: '14px 16px' }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#0f1b2d', marginBottom: 3 }}>{getName(doc)}</div>
                <div style={{ fontSize: 12, color: '#00848e', fontWeight: 600, marginBottom: 2 }}>{doc.specialization || '—'}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 2 }}>
                  {doc.departmentId?.name || doc.department || doc.userId?.department || '—'}{doc.experience ? ` · ${doc.experience} il` : ''}
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

      {doctorSuccessModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="doctor-success-title"
          style={{ position: 'fixed', inset: 0, background: 'rgba(11, 29, 52, 0.55)', backdropFilter: 'blur(4px)', zIndex: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget) closeDoctorSuccessModal() }}
        >
          <div style={{ width: 'min(560px, calc(100vw - 32px))', background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: 22, boxShadow: '0 24px 70px rgba(15, 23, 42, 0.22)', padding: 28, boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 2 }}>
              <button onClick={closeDoctorSuccessModal} aria-label="Bağla" style={{ width: 32, height: 32, border: '1px solid #E2E8F0', borderRadius: 10, background: '#fff', color: '#64748B', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>×</button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: 22 }}>
              <div style={{ width: 58, height: 58, borderRadius: '50%', background: '#DCFCE7', color: '#16A34A', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <h2 id="doctor-success-title" style={{ margin: 0, fontSize: 22, lineHeight: 1.25, fontWeight: 800, color: '#0B1D34' }}>Həkim yaradıldı!</h2>
              {doctorSuccessModal.name && (
                <p style={{ margin: '7px 0 0', color: '#64748B', fontSize: 13 }}>{doctorSuccessModal.name}</p>
              )}
            </div>

            <div style={{ border: '1px solid #E2E8F0', borderRadius: 16, overflow: 'hidden', marginBottom: 16 }}>
              <CredentialRow icon={<MailIcon />} label="E-poçt" value={doctorSuccessModal.email} />
              <CredentialRow icon={<LockIcon />} label="Şifrə" value={doctorSuccessModal.password} />
              <CredentialRow icon={<LicenseIcon />} label="Lisenziya" value={doctorSuccessModal.licenseNumber} last />
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center', background: '#E6F7F8', border: '1px solid rgba(29, 139, 149, 0.18)', borderRadius: 14, padding: '12px 14px', color: '#1D8B95', fontSize: 13, fontWeight: 600, marginBottom: 22 }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
              </svg>
              Bu məlumatı həkimə bildirin.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
              <button onClick={copyDoctorCredentials} style={{ padding: '10px 18px', border: '1px solid #E2E8F0', borderRadius: 10, background: '#fff', color: '#1D8B95', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
                {copied ? 'Kopyalandı' : 'Kopyala'}
              </button>
              <button onClick={closeDoctorSuccessModal} style={{ padding: '10px 24px', border: 'none', borderRadius: 10, background: '#1D8B95', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 20px rgba(29,139,149,0.22)' }}>
                Tamam
              </button>
            </div>
          </div>
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

            {/* Create-only fields */}
            {!editDoctor && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                <div style={{ gridColumn: 'span 2', background: '#f0fafb', border: '1px solid #b2e4e8', borderRadius: 10, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00848e" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" strokeLinecap="round" strokeWidth="2.5"/>
                  </svg>
                  <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.5 }}>
                    <strong style={{ color: '#0a1628' }}>Avtomatik yaradılır:</strong> Lisenziya nömrəsi (DR-2025-XXXXX) və müvəqqəti şifrə. Şifrə yalnız bir dəfə göstəriləcək.
                  </div>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <MF label="Ad Soyad *" value={newFullName} onChange={setNewFullName} placeholder="məs. Nigar Əliyeva" />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <MF label="E-poçt *" value={newEmail} onChange={setNewEmail} type="email" placeholder="hekim@aslanmedical.az" />
                </div>
              </div>
            )}

            {/* Avatar upload */}
            <div style={{ display:'flex', justifyContent:'center', marginBottom: 20 }}>
              <AvatarUpload
                currentUrl={doctorPhoto}
                userName={newFullName || (editDoctor ? (editDoctor.userId?.fullName || '') : '')}
                size={160}
                uploadImmediately={false}
                allowedTypes={['image/jpeg', 'image/png']}
                accept="image/jpeg,image/png,.jpg,.jpeg,.png"
                maxSizeBytes={2 * 1024 * 1024}
                minWidth={600}
                minHeight={600}
                preferSquare
                previewWidth={160}
                previewHeight={160}
                previewRadius={16}
                previewObjectPosition="center top"
                previewBackground="#F1F5F9"
                previewBorder="1px solid #E2E8F0"
                placeholderColor="#94A3B8"
                helperText="Tövsiyə olunan ölçü: 600x600 px, kvadrat şəkil. JPG/PNG, maksimum 2MB."
                guidanceText="Şəkli yükləməzdən əvvəl kvadrat formatda crop edin."
                onFileSelect={(file) => setDoctorPhotoFile(file)}
                onValidationChange={({ valid, message }) => setDoctorPhotoError(valid ? '' : message)}
              />
            </div>

            {/* Shared fields — create and edit */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <MF label="İxtisas *"    value={specialization} onChange={setSpecialization} placeholder="məs. Kardiologiya" />
              <MF label="Təcrübə (il)" value={experience}     onChange={setExperience}     type="number" min={0} integer placeholder="0" />
              <div style={{ gridColumn: 'span 2' }}>
                <MF label="Bio" value={bio} onChange={setBio} placeholder="Həkim haqqında qısa məlumat..." />
              </div>

              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Şöbə *</label>
                <select
                  value={departmentId}
                  onChange={e => {
                    setDepartmentId(e.target.value)
                    const d = departments.find(d => d._id === e.target.value)
                    if (d) setDepartment(d.name)
                  }}
                  style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 9, padding: '9px 12px', fontSize: 13, color: '#334155', outline: 'none', boxSizing: 'border-box', height: 38 }}
                >
                  <option value="">— Şöbə seçin —</option>
                  {departments.map(d => (
                    <option key={d._id} value={d._id}>{d.icon} {d.name}</option>
                  ))}
                </select>
              </div>
              <MF label="Konsultasiya haqqı (AZN)" value={consultationFee} onChange={setConsultationFee} type="number" min={0} placeholder="0" />
              <MF label="Göstərilmə sırası" value={order} onChange={setOrder} type="number" min={0} integer placeholder="0" />

              <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: 10 }}>
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={e => setIsActive(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: '#00848e' }}
                />
                <label htmlFor="isActive" style={{ fontSize: 13, color: '#475569', cursor: 'pointer' }}>
                  Profil ictimai saytda görünsün
                </label>
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

function MF({ label, value, onChange, type = 'text', placeholder = '', min, integer = false }) {
  const handleChange = (e) => {
    onChange(type === 'number' ? clampNumberInput(e.target.value, { min, integer }) : e.target.value)
  }

  return (
    <div>
      <label style={lbl}>{label}</label>
      <input type={type} min={min} value={value} onChange={handleChange} placeholder={placeholder} style={inp} />
    </div>
  )
}

function CredentialRow({ icon, label, value, last = false }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '34px 110px 1fr', gap: 12, alignItems: 'center', padding: '13px 16px', borderBottom: last ? 'none' : '1px solid #E2E8F0', background: '#fff' }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, background: '#F0FAFB', color: '#1D8B95', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <div style={{ color: '#0B1D34', fontSize: 13, fontWeight: 700 }}>{label}:</div>
      <div style={{ color: '#334155', fontSize: 13, lineHeight: 1.45, wordBreak: 'break-word' }}>{value || '—'}</div>
    </div>
  )
}

function MailIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-10 6L2 7" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function LicenseIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="14" x="3" y="5" rx="2" /><path d="M7 9h5" /><path d="M7 13h3" /><circle cx="17" cy="13" r="2" />
    </svg>
  )
}
