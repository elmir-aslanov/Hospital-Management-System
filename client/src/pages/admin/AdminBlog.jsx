import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { BASE } from '../../api/config.js'
import { BLOG_CATEGORIES, blogCategoryLabel } from '../../data/blogCategories.js'

const TEAL = '#00848e'
const NAVY = '#0a1628'
const BORDER = '#e2e8f0'
const MUTED = '#64748b'

const token = () => localStorage.getItem('token') || localStorage.getItem('adminToken')
const hdrs  = () => ({ Authorization: `Bearer ${token()}` })

const STATUSES = [
  { value: 'draft',     label: 'Qaralama' },
  { value: 'published', label: 'Dərc edilib' },
]

const EMPTY_FORM = { title: '', content: '', excerpt: '', category: BLOG_CATEGORIES[0].slug, status: 'draft', reviewedBy: '' }

const MIN_COVER_WIDTH = 1600

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'

const doctorLabel = (doc) => {
  const u = doc.userId || {}
  const name = u.fullName || [u.name, u.surname].filter(Boolean).join(' ') || 'Həkim'
  return doc.specialization ? `${name} — ${doc.specialization}` : name
}

/* ── shared style atoms ─────────────────────────────────────────────── */
const inp = {
  width: '100%', border: `1px solid ${BORDER}`, borderRadius: 9,
  padding: '9px 12px', fontSize: 13, color: '#334155', outline: 'none',
  boxSizing: 'border-box', background: 'white', fontFamily: 'inherit',
}
const lbl = { fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }

const btnPrimary = {
  background: TEAL, color: 'white', border: 'none', borderRadius: 9,
  padding: '10px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
}
const btnGhost = {
  background: 'white', color: '#475569', border: `1px solid ${BORDER}`, borderRadius: 9,
  padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
}

export default function AdminBlog() {
  const [posts,      setPosts]      = useState([])
  const [doctors,    setDoctors]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const [showModal,  setShowModal]  = useState(false)
  const [editPost,   setEditPost]   = useState(null)
  const [form,       setForm]       = useState(EMPTY_FORM)
  const [coverFile,  setCoverFile]  = useState(null)
  const [coverPreview, setCoverPreview] = useState('')
  const [coverWarning, setCoverWarning] = useState('')
  const [search,     setSearch]     = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [saving,     setSaving]     = useState(false)
  const [saveErr,    setSaveErr]    = useState('')

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    const qs = new URLSearchParams({ page: '1', limit: '50' })
    if (search.trim()) qs.set('search', search.trim())
    if (statusFilter)  qs.set('status', statusFilter)
    fetch(`${BASE}/api/v1/blog/admin/all?${qs.toString()}`, { headers: hdrs() })
      .then(r => r.json())
      .then(d => {
        if (!d.success) throw new Error(d.message || 'Xəta')
        setPosts(d.data?.data || [])
      })
      .catch(() => { setPosts([]); setError('Yazılar yüklənmədi. Yenidən cəhd edin.') })
      .finally(() => setLoading(false))
  }, [search, statusFilter])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    fetch(`${BASE}/api/v1/doctors/public/all`)
      .then(r => r.json())
      .then(d => setDoctors(d.data || []))
      .catch(() => setDoctors([]))
  }, [])

  const stats = {
    total:     posts.length,
    published: posts.filter(p => p.status === 'published').length,
    draft:     posts.filter(p => p.status !== 'published').length,
  }

  /* ── modal open/close ──────────────────────────────────────────────── */
  const openCreate = () => {
    setEditPost(null)
    setForm(EMPTY_FORM)
    setCoverFile(null)
    setCoverPreview('')
    setCoverWarning('')
    setSaveErr('')
    setShowModal(true)
  }

  const openEdit = (post) => {
    setEditPost(post)
    setForm({
      title:      post.title || '',
      content:    post.content || '',
      excerpt:    post.excerpt || '',
      category:   post.category || BLOG_CATEGORIES[0].slug,
      status:     post.status || 'draft',
      reviewedBy: post.reviewedBy?._id || '',
    })
    setCoverFile(null)
    setCoverPreview(post.coverImage || '')
    setCoverWarning('')
    setSaveErr('')
    setShowModal(true)
  }

  const closeModal = () => { setShowModal(false); setEditPost(null); setCoverFile(null); setCoverPreview(''); setCoverWarning('') }

  /* ── cover selection + min-width validation ──────────────────────────── */
  const onCoverChange = (e) => {
    const file = e.target.files?.[0] || null
    setCoverFile(file)
    setCoverWarning('')
    if (!file) { setCoverPreview(editPost?.coverImage || ''); return }

    const url = URL.createObjectURL(file)
    setCoverPreview(url)
    const img = new Image()
    img.onload = () => {
      if (img.naturalWidth < MIN_COVER_WIDTH) {
        setCoverWarning(`Şəklin eni minimum ${MIN_COVER_WIDTH}px olmalıdır (yüklənən: ${img.naturalWidth}px).`)
      }
    }
    img.src = url
  }

  /* ── save (create / update) ────────────────────────────────────────── */
  const save = async () => {
    if (!form.title.trim())   { setSaveErr('Başlıq tələb olunur'); return }
    if (!form.content.trim()) { setSaveErr('Məzmun tələb olunur'); return }

    setSaving(true)
    setSaveErr('')
    try {
      const payload = {
        title:      form.title.trim(),
        content:    form.content.trim(),
        excerpt:    form.excerpt.trim(),
        category:   form.category,
        status:     form.status,
        reviewedBy: form.reviewedBy || '',
      }

      const url    = editPost ? `${BASE}/api/v1/blog/${editPost._id}` : `${BASE}/api/v1/blog`
      const method = editPost ? 'PUT' : 'POST'

      const r = await fetch(url, {
        method,
        headers: { ...hdrs(), 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await r.json()
      if (!r.ok || !data.success) throw new Error(data.message || 'Yazı yadda saxlanmadı')

      const savedId = data.data?._id || editPost?._id

      if (coverFile && savedId) {
        const fd = new FormData()
        fd.append('image', coverFile)
        const ir = await fetch(`${BASE}/api/v1/blog/${savedId}/image`, {
          method: 'POST',
          headers: hdrs(),
          body: fd,
        })
        const idata = await ir.json()
        if (!ir.ok || !idata.success) throw new Error(idata.message || 'Şəkil yüklənmədi')
      }

      closeModal()
      load()
    } catch (err) {
      setSaveErr(err.message || 'Xəta baş verdi')
    } finally {
      setSaving(false)
    }
  }

  /* ── delete ────────────────────────────────────────────────────────── */
  const remove = async (post) => {
    if (!window.confirm(`"${post.title}" yazısını silmək istədiyinizə əminsiniz?`)) return
    try {
      const r = await fetch(`${BASE}/api/v1/blog/${post._id}`, { method: 'DELETE', headers: hdrs() })
      const data = await r.json()
      if (!r.ok || !data.success) throw new Error(data.message || 'Silinmədi')
      setPosts(prev => prev.filter(p => p._id !== post._id))
    } catch (err) {
      alert(err.message || 'Xəta baş verdi')
    }
  }

  /* ── toggle publish ────────────────────────────────────────────────── */
  const toggleStatus = async (post) => {
    const nextStatus = post.status === 'published' ? 'draft' : 'published'
    try {
      const r = await fetch(`${BASE}/api/v1/blog/${post._id}`, {
        method: 'PUT',
        headers: { ...hdrs(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      const data = await r.json()
      if (!r.ok || !data.success) throw new Error(data.message || 'Status dəyişdirilmədi')
      setPosts(prev => prev.map(p => p._id === post._id ? { ...p, status: nextStatus, publishedAt: data.data?.publishedAt ?? p.publishedAt } : p))
    } catch (err) {
      alert(err.message || 'Xəta baş verdi')
    }
  }

  return (
    <AdminLayout>
      <div style={{ padding: 24, fontFamily: "'Source Sans 3', sans-serif" }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: NAVY }}>Blog İdarəetməsi</h1>
          <button onClick={openCreate} style={btnPrimary}>+ Yeni Yazı</button>
        </div>

        {/* ── Stats ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 20 }}>
          {[
            { label: 'Ümumi yazı',   value: stats.total },
            { label: 'Dərc edilmiş', value: stats.published },
            { label: 'Qaralama',     value: stats.draft },
          ].map((s) => (
            <div key={s.label} style={{ background: 'white', border: `1px solid ${BORDER}`, borderRadius: 14, padding: '18px 20px' }}>
              <p style={{ margin: '0 0 6px', fontSize: 13, color: MUTED, fontWeight: 600 }}>{s.label}</p>
              <p style={{ margin: 0, fontSize: 26, fontWeight: 800, color: NAVY }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── Search + filter ── */}
        <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Başlığa görə axtar..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...inp, maxWidth: 360 }}
          />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ ...inp, maxWidth: 200 }}>
            <option value="">Bütün statuslar</option>
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        {/* ── Table ── */}
        <div style={{ background: 'white', border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden' }}>
          {loading ? (
            <p style={{ padding: 28, textAlign: 'center', color: MUTED, fontSize: 14 }}>Yüklənir...</p>
          ) : error ? (
            <p style={{ padding: 28, textAlign: 'center', color: '#DC2626', fontSize: 14 }}>{error}</p>
          ) : posts.length === 0 ? (
            <p style={{ padding: 28, textAlign: 'center', color: MUTED, fontSize: 14 }}>Heç bir yazı tapılmadı.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                    {['Şəkil', 'Başlıq', 'Kateqoriya', 'Status', 'Tarix', 'Baxış', 'Əməliyyat'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', borderBottom: `1px solid ${BORDER}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {posts.map(post => (
                    <tr key={post._id} style={{ borderBottom: `1px solid ${BORDER}` }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ width: 64, height: 40, borderRadius: 6, overflow: 'hidden', background: '#F1F5F9', flexShrink: 0 }}>
                          {post.coverImage && (
                            <img src={post.coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => { e.currentTarget.style.display = 'none' }} />
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: NAVY, maxWidth: 320 }}>{post.title}</td>
                      <td style={{ padding: '12px 16px', color: '#334155' }}>{blogCategoryLabel(post.category)}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                          background: post.status === 'published' ? '#DCFCE7' : '#F1F5F9',
                          color:      post.status === 'published' ? '#16A34A' : '#64748B',
                        }}>
                          {post.status === 'published' ? 'Dərc edilib' : 'Qaralama'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#334155' }}>{fmtDate(post.publishedAt || post.createdAt)}</td>
                      <td style={{ padding: '12px 16px', color: '#334155' }}>{post.views ?? 0}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button onClick={() => openEdit(post)} style={{ ...btnGhost, padding: '6px 12px', fontSize: 12 }}>Redaktə</button>
                          <button onClick={() => toggleStatus(post)} style={{ ...btnGhost, padding: '6px 12px', fontSize: 12, color: TEAL, borderColor: TEAL }}>
                            {post.status === 'published' ? 'Qaralamaya çəkin' : 'Dərc et'}
                          </button>
                          <button onClick={() => remove(post)} style={{ ...btnGhost, padding: '6px 12px', fontSize: 12, color: '#DC2626', borderColor: '#FCA5A5' }}>Sil</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Modal ── */}
        {showModal && (
          <div onClick={closeModal} style={{
            position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 2000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
          }}>
            <div onClick={e => e.stopPropagation()} style={{
              background: 'white', borderRadius: 18, padding: 28, width: '100%', maxWidth: 600,
              maxHeight: '90vh', overflowY: 'auto',
            }}>
              <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 800, color: NAVY }}>
                {editPost ? 'Yazını redaktə et' : 'Yeni yazı'}
              </h2>

              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Başlıq</label>
                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={inp} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={lbl}>Kateqoriya</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={inp}>
                    {BLOG_CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={inp}>
                    {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Qısa məzmun</label>
                <textarea rows={2} value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} style={{ ...inp, resize: 'vertical' }} />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Məzmun (mətn / markdown / HTML)</label>
                <textarea rows={8} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} style={{ ...inp, resize: 'vertical' }} />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Rəyçi həkim (istəyə bağlı)</label>
                <select value={form.reviewedBy} onChange={e => setForm(f => ({ ...f, reviewedBy: e.target.value }))} style={inp}>
                  <option value="">Seçilməyib</option>
                  {doctors.map(d => <option key={d._id} value={d._id}>{doctorLabel(d)}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Cover şəkli (minimum {MIN_COVER_WIDTH}px en)</label>
                <input type="file" accept="image/*" onChange={onCoverChange} style={inp} />
                {coverWarning && <p style={{ margin: '8px 0 0', fontSize: 12, color: '#D97706', fontWeight: 600 }}>{coverWarning}</p>}
                {coverPreview && (
                  <div style={{ marginTop: 10, borderRadius: 8, overflow: 'hidden', border: `1px solid ${BORDER}`, maxWidth: 320 }}>
                    <img src={coverPreview} alt="Cover preview" style={{ width: '100%', display: 'block', aspectRatio: '16/9', objectFit: 'cover' }} />
                  </div>
                )}
              </div>

              {saveErr && <p style={{ margin: '0 0 14px', fontSize: 13, color: '#DC2626' }}>{saveErr}</p>}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button onClick={closeModal} style={btnGhost} disabled={saving}>Ləğv et</button>
                <button onClick={save} style={{ ...btnPrimary, opacity: saving ? 0.7 : 1 }} disabled={saving}>
                  {saving ? 'Yadda saxlanılır...' : 'Yadda saxla'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  )
}
