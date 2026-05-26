import { useState, useEffect, useRef } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'

const BASE = 'http://localhost:5000'
const SPECIALTIES = ['Kardioloq','Neyroloq','Ortoped','Cərrah','Pediatr','Dermatoloq','Oftolmoloq','Urologiya','Ginekologiya','Psixiatr','Endokrinoloq','Pulmonoloq']
const DEPARTMENTS = ['Kardiologiya','Nevrologiya','Ortopediya','Cərrahiyyə','Pediatriya','Dermatoloq','Oftolmologiya','Ürologiya','Ginekologiya','Psixiatriya','Endokrinologiya','Pulmonologiya']

const empty = { fullName: '', specialization: '', department: '', experience: '', photoUrl: '', bio: '', isActive: true }

export default function AdminDoctors() {
  const [doctors, setDoctors]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(null)   // null | 'add' | 'edit'
  const [form, setForm]         = useState(empty)
  const [editId, setEditId]     = useState(null)
  const [saving, setSaving]     = useState(false)
  const [delId, setDelId]       = useState(null)
  const [search, setSearch]     = useState('')
  const [error, setError]       = useState('')

  const token = localStorage.getItem('adminToken')
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

  const load = () => {
    setLoading(true)
    fetch(`${BASE}/api/v1/site-doctors/all`, { headers })
      .then(r => r.json())
      .then(d => {
        const list = Array.isArray(d) ? d : d.data || d.doctors || d.result || []
        setDoctors(list)
      })
      .catch(() => setDoctors([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openAdd = () => { setForm(empty); setEditId(null); setError(''); setModal('add') }
  const openEdit = (doc) => {
    setForm({ fullName: doc.fullName || doc.name || '', specialization: doc.specialization || doc.specialty || '', department: doc.department || '', experience: doc.experience || '', photoUrl: doc.photoUrl || doc.image || '', bio: doc.bio || '', isActive: doc.isActive ?? true })
    setEditId(doc._id)
    setError('')
    setModal('edit')
  }

  const handleSave = async () => {
    if (!form.fullName.trim() || !form.specialization.trim()) { setError('Ad və ixtisas tələb olunur'); return }
    setSaving(true); setError('')
    try {
      const url    = modal === 'add' ? `${BASE}/api/v1/site-doctors` : `${BASE}/api/v1/site-doctors/${editId}`
      const method = modal === 'add' ? 'POST' : 'PUT'
      const r = await fetch(url, { method, headers, body: JSON.stringify({ ...form, experience: Number(form.experience) || 0 }) })
      if (!r.ok) { const e = await r.json(); throw new Error(e.message || 'Xəta') }
      setModal(null); load()
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!delId) return
    try {
      await fetch(`${BASE}/api/v1/site-doctors/${delId}`, { method: 'DELETE', headers })
      setDelId(null); load()
    } catch { setDelId(null) }
  }

  const filtered = doctors.filter(d =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.specialty?.toLowerCase().includes(search.toLowerCase()) ||
    d.department?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminLayout activePage="doctors">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f1b2d' }}>Həkimlər</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>{doctors.length} həkim qeydiyyatda</p>
        </div>
        <button onClick={openAdd} style={{ background: '#00848e', color: 'white', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Həkim əlavə et
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: 340, marginBottom: 24 }}>
        <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
          <svg width="14" height="14" fill="none" stroke="#94a3b8" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Ad, ixtisas axtar..." style={{ width: '100%', background: 'white', border: '1px solid #e2e8f0', borderRadius: 10, padding: '9px 14px 9px 36px', fontSize: 13, color: '#334155', outline: 'none', boxSizing: 'border-box' }} />
      </div>

      {/* Grid */}
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
                {doc.image ? (
                  <img src={doc.image} alt={doc.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#00848e,#00a8b5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 24, fontWeight: 700 }}>
                    {doc.name?.[0]?.toUpperCase() || 'D'}
                  </div>
                )}
                <div style={{ position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: '50%', background: doc.isActive ? '#22c55e' : '#94a3b8', boxShadow: doc.isActive ? '0 0 6px rgba(34,197,94,0.5)' : 'none' }} />
              </div>
              <div style={{ padding: '14px 16px' }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#0f1b2d', marginBottom: 3 }}>{doc.name}</div>
                <div style={{ fontSize: 12, color: '#00848e', fontWeight: 600, marginBottom: 2 }}>{doc.specialty}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 10 }}>{doc.department} {doc.experience ? `· ${doc.experience} il` : ''}</div>
                {doc.bio && <div style={{ fontSize: 11, color: '#64748b', marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{doc.bio}</div>}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => openEdit(doc)} style={{ flex: 1, padding: '7px 0', fontSize: 12, fontWeight: 600, border: '1px solid #e2e8f0', borderRadius: 8, background: 'white', color: '#475569', cursor: 'pointer' }}>Redaktə</button>
                  <button onClick={() => setDelId(doc._id)} style={{ padding: '7px 12px', fontSize: 12, fontWeight: 600, border: 'none', borderRadius: 8, background: '#fef2f2', color: '#ef4444', cursor: 'pointer' }}>Sil</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={e => { if (e.target === e.currentTarget) setModal(null) }}>
          <div style={{ background: 'white', borderRadius: 16, width: 520, maxWidth: '95vw', maxHeight: '90vh', overflow: 'auto', padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f1b2d' }}>{modal === 'add' ? 'Həkim əlavə et' : 'Həkimi redaktə et'}</h2>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 20, lineHeight: 1 }}>×</button>
            </div>

            {error && <div style={{ background: '#fef2f2', color: '#ef4444', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>{error}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <ModalField label="Ad Soyad *" value={form.fullName} onChange={v => setForm(f => ({ ...f, fullName: v }))} />
              <ModalSelect label="İxtisas *" value={form.specialization} onChange={v => setForm(f => ({ ...f, specialization: v }))} options={SPECIALTIES} />
              <ModalSelect label="Departament" value={form.department} onChange={v => setForm(f => ({ ...f, department: v }))} options={DEPARTMENTS} />
              <ModalField label="Təcrübə (il)" value={form.experience} onChange={v => setForm(f => ({ ...f, experience: v }))} type="number" />
              <div style={{ gridColumn: 'span 2' }}>
                <ModalField label="Şəkil URL" value={form.photoUrl} onChange={v => setForm(f => ({ ...f, photoUrl: v }))} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>Bio</label>
                <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3} style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 9, padding: '9px 12px', fontSize: 13, color: '#334155', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
              <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} style={{ width: 16, height: 16, accentColor: '#00848e' }} />
                <label htmlFor="isActive" style={{ fontSize: 13, color: '#475569', cursor: 'pointer' }}>Aktiv həkim</label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
              <button onClick={() => setModal(null)} style={{ padding: '10px 20px', border: '1px solid #e2e8f0', borderRadius: 9, background: 'white', fontSize: 13, cursor: 'pointer', color: '#475569' }}>Ləğv et</button>
              <button onClick={handleSave} disabled={saving} style={{ padding: '10px 24px', border: 'none', borderRadius: 9, background: '#00848e', color: 'white', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saxlanır...' : 'Saxla'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {delId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 28, width: 360, textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="20" height="20" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: '#0f1b2d' }}>Həkimi sil?</h3>
            <p style={{ margin: '0 0 24px', fontSize: 13, color: '#64748b' }}>Bu əməliyyat geri qaytarıla bilməz.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => setDelId(null)} style={{ padding: '9px 20px', border: '1px solid #e2e8f0', borderRadius: 9, background: 'white', fontSize: 13, cursor: 'pointer' }}>Ləğv et</button>
              <button onClick={handleDelete} style={{ padding: '9px 20px', border: 'none', borderRadius: 9, background: '#ef4444', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Sil</button>
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
      <input type={type} value={value} onChange={e => onChange(e.target.value)} style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 9, padding: '9px 12px', fontSize: 13, color: '#334155', outline: 'none', boxSizing: 'border-box' }} />
    </div>
  )
}

function ModalSelect({ label, value, onChange, options }) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 9, padding: '9px 12px', fontSize: 13, color: '#334155', outline: 'none', background: 'white', boxSizing: 'border-box' }}>
        <option value="">Seçin...</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}
