import { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'

const BASE        = 'http://localhost:5000'
const SPECIALTIES = ['Kardioloq','Neyroloq','Ortoped','Cərrah','Pediatr','Dermatoloq','Oftolmoloq','Urologiya','Ginekologiya','Psixiatr','Endokrinoloq','Pulmonoloq']
const DEPARTMENTS = ['Kardiologiya','Nevrologiya','Ortopediya','Cərrahiyyə','Pediatriya','Dermatoloq','Oftolmologiya','Ürologiya','Ginekologiya','Psixiatriya','Endokrinologiya','Pulmonologiya']

export default function AdminDoctors() {
  const token = localStorage.getItem('adminToken') || localStorage.getItem('token')

  const [doctors,     setDoctors]     = useState([])
  const [total,       setTotal]       = useState(0)
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [showModal,   setShowModal]   = useState(false)
  const [editDoctor,  setEditDoctor]  = useState(null)
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState('')
  const [success,     setSuccess]     = useState('')

  // ─── Form fields ──────────────────────────────────────────────────────────
  const [fullName,       setFullName]       = useState('')
  const [specialization, setSpecialization] = useState('')
  const [department,     setDepartment]     = useState('')
  const [experience,     setExperience]     = useState('')
  const [bio,            setBio]            = useState('')
  const [isActive,       setIsActive]       = useState(true)

  const resetForm = () => {
    setFullName(''); setSpecialization(''); setDepartment('')
    setExperience(''); setBio(''); setIsActive(true)
  }

  // ─── Populate form when editDoctor changes ────────────────────────────────
  useEffect(() => {
    if (editDoctor) {
      setFullName(editDoctor.fullName || '')
      setSpecialization(editDoctor.specialization || '')
      setDepartment(editDoctor.department || '')
      setExperience(editDoctor.experience || '')
      setBio(editDoctor.bio || '')
      setIsActive(editDoctor.isActive !== false)
    } else {
      resetForm()
    }
  }, [editDoctor])

  // ─── Fetch doctors on mount ───────────────────────────────────────────────
  useEffect(() => {
    fetch(`${BASE}/api/v1/site-doctors/all`)
      .then(r => r.json())
      .then(data => {
        let list = []
        if (Array.isArray(data)) list = data
        else if (Array.isArray(data.doctors)) list = data.doctors
        else if (Array.isArray(data.data)) list = data.data
        setDoctors(list)
        setTotal(list.length)
      })
      .catch(() => setDoctors([]))
      .finally(() => setLoading(false))
  }, [])

  // ─── Save (create or update) ──────────────────────────────────────────────
  const handleSave = async () => {
    if (!fullName.trim() || !specialization.trim()) { setError('Ad və ixtisas tələb olunur'); return }
    setSaving(true); setError('')
    try {
      const body = {
        fullName:       fullName.trim(),
        specialization: specialization.trim(),
        department:     department.trim(),
        experience:     Number(experience) || 0,
        bio:            bio.trim(),
        isActive,
      }
      const url    = editDoctor ? `${BASE}/api/v1/site-doctors/${editDoctor._id}` : `${BASE}/api/v1/site-doctors`
      const method = editDoctor ? 'PUT' : 'POST'
      const r = await fetch(url, {
        method,
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.message || 'Xəta')

      if (editDoctor) {
        const updated = data.doctor || data.data || data
        setDoctors(prev => prev.map(d => d._id === editDoctor._id ? updated : d))
        setSuccess('Həkim uğurla yeniləndi')
      } else {
        const newDoc = data.doctor || data.data || data
        setDoctors(prev => [newDoc, ...prev])
        setTotal(t => t + 1)
        setSuccess('Həkim uğurla əlavə edildi')
      }
      setShowModal(false)
      setEditDoctor(null)
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  // ─── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Bu həkimi silmək istəyirsiniz?')) return
    try {
      const r = await fetch(`${BASE}/api/v1/site-doctors/${id}`, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + token },
      })
      if (!r.ok) { const d = await r.json(); throw new Error(d.message || 'Silmə zamanı xəta') }
      setDoctors(prev => prev.filter(d => d._id !== id))
      setTotal(t => t - 1)
    } catch (e) { alert(e.message) }
  }

  // ─── Search ───────────────────────────────────────────────────────────────
  const filtered = doctors.filter(d =>
    !search ||
    (d.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.specialization || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.department || '').toLowerCase().includes(search.toLowerCase())
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
          onClick={() => { setEditDoctor(null); setError(''); setShowModal(true) }}
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

      {/* Cards grid */}
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
                {doc.photoUrl ? (
                  <img src={doc.photoUrl} alt={doc.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#00848e,#00a8b5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 24, fontWeight: 700 }}>
                    {(doc.fullName || doc.name || '?').charAt(0).toUpperCase()}
                  </div>
                )}
                <div style={{ position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: '50%', background: doc.isActive ? '#22c55e' : '#94a3b8', boxShadow: doc.isActive ? '0 0 6px rgba(34,197,94,0.5)' : 'none' }} />
              </div>
              <div style={{ padding: '14px 16px' }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#0f1b2d', marginBottom: 3 }}>{doc.fullName || doc.name || 'Naməlum'}</div>
                <div style={{ fontSize: 12, color: '#00848e', fontWeight: 600, marginBottom: 2 }}>{doc.specialization || '—'}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 10 }}>
                  {doc.department || '—'}{doc.experience ? ` · ${doc.experience} il` : ''}
                </div>
                {doc.bio && (
                  <div style={{ fontSize: 11, color: '#64748b', marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {doc.bio}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => { setEditDoctor(doc); setError(''); setShowModal(true) }}
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

      {/* Add / Edit Modal */}
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
              <ModalField label="Ad Soyad *" value={fullName} onChange={setFullName} />
              <ModalSelect label="İxtisas *" value={specialization} onChange={setSpecialization} options={SPECIALTIES} />
              <ModalSelect label="Departament" value={department} onChange={setDepartment} options={DEPARTMENTS} />
              <ModalField label="Təcrübə (il)" value={experience} onChange={setExperience} type="number" />
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>Bio</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
                  style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 9, padding: '9px 12px', fontSize: 13, color: '#334155', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
              <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" id="isActive" checked={isActive} onChange={e => setIsActive(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#00848e' }} />
                <label htmlFor="isActive" style={{ fontSize: 13, color: '#475569', cursor: 'pointer' }}>Aktiv həkim</label>
              </div>
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

function ModalField({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 9, padding: '9px 12px', fontSize: 13, color: '#334155', outline: 'none', boxSizing: 'border-box' }} />
    </div>
  )
}

function ModalSelect({ label, value, onChange, options }) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 9, padding: '9px 12px', fontSize: 13, color: '#334155', outline: 'none', background: 'white', boxSizing: 'border-box' }}>
        <option value="">Seçin...</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}
