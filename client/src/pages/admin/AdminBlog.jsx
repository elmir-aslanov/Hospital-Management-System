import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { BASE } from '../../api/config.js'

const TEAL = '#00848e'
const NAVY = '#0a1628'
const BORDER = '#e2e8f0'
const MUTED = '#64748b'

const token = () => localStorage.getItem('token') || localStorage.getItem('adminToken')
const hdrs  = () => ({ Authorization: `Bearer ${token()}` })

const CATEGORIES = ['Kardiologiya', 'Nevrologiya', 'Diş', 'Uşaq sağlamlığı', 'Ümumi']

const EMPTY_FORM = { title: '', content: '', excerpt: '', category: 'Ümumi', readTime: 5, isPublished: false }

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'

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
  const [posts,     setPosts]     = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editPost,  setEditPost]  = useState(null)
  const [form,      setForm]      = useState(EMPTY_FORM)
  const [coverFile, setCoverFile] = useState(null)
  const [search,    setSearch]    = useState('')
  const [saving,    setSaving]    = useState(false)
  const [saveErr,   setSaveErr]   = useState('')

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    const qs = new URLSearchParams({ page: '1', limit: '20' })
    if (search.trim()) qs.set('search', search.trim())
    fetch(`${BASE}/api/v1/blog/admin/all?${qs.toString()}`, { headers: hdrs() })
      .then(r => r.json())
      .then(d => {
        if (!d.success) throw new Error(d.message || 'Xəta')
        setPosts(d.data?.data || [])
      })
      .catch(() => { setPosts([]); setError('Yazılar yüklənmədi. Yenidən cəhd edin.') })
      .finally(() => setLoading(false))
  }, [search])

  useEffect(() => { load() }, [load])

  const stats = {
    total:     posts.length,
    published: posts.filter(p => p.isPublished).length,
    draft:     posts.filter(p => !p.isPublished).length,
  }

  /* ── modal open/close ──────────────────────────────────────────────── */
  const openCreate = () => {
    setEditPost(null)
    setForm(EMPTY_FORM)
    setCoverFile(null)
    setSaveErr('')
    setShowModal(true)
  }

  const openEdit = (post) => {
    setEditPost(post)
    setForm({
      title:       post.title || '',
      content:     post.content || '',
      excerpt:     post.excerpt || '',
      category:    post.category || 'Ümumi',
      readTime:    post.readTime || 5,
      isPublished: !!post.isPublished,
    })
    setCoverFile(null)
    setSaveErr('')
    setShowModal(true)
  }

  const closeModal = () => { setShowModal(false); setEditPost(null); setCoverFile(null) }

  /* ── save (create / update) ────────────────────────────────────────── */
  const save = async () => {
    if (!form.title.trim())   { setSaveErr('Başlıq tələb olunur'); return }
    if (!form.content.trim()) { setSaveErr('Məzmun tələb olunur'); return }

    setSaving(true)
    setSaveErr('')
    try {
      const payload = {
        title:       form.title.trim(),
        content:     form.content.trim(),
        excerpt:     form.excerpt.trim(),
        category:    form.category,
        readTime:    Number(form.readTime) || 5,
        isPublished: form.isPublished,
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
  const togglePublish = async (post) => {
    try {
      const r = await fetch(`${BASE}/api/v1/blog/${post._id}`, {
        method: 'PUT',
        headers: { ...hdrs(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !post.isPublished }),
      })
      const data = await r.json()
      if (!r.ok || !data.success) throw new Error(data.message || 'Status dəyişdirilmədi')
      setPosts(prev => prev.map(p => p._id === post._id ? { ...p, isPublished: !p.isPublished } : p))
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

        {/* ── Search ── */}
        <div style={{ marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Başlığa görə axtar..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...inp, maxWidth: 360 }}
          />
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
                    {['Başlıq', 'Kateqoriya', 'Oxuma', 'Status', 'Tarix', 'Əməliyyat'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', borderBottom: `1px solid ${BORDER}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {posts.map(post => (
                    <tr key={post._id} style={{ borderBottom: `1px solid ${BORDER}` }}>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: NAVY, maxWidth: 320 }}>{post.title}</td>
                      <td style={{ padding: '12px 16px', color: '#334155' }}>{post.category || '—'}</td>
                      <td style={{ padding: '12px 16px', color: '#334155' }}>{post.readTime || 5} dəq</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                          background: post.isPublished ? '#DCFCE7' : '#F1F5F9',
                          color:      post.isPublished ? '#16A34A' : '#64748B',
                        }}>
                          {post.isPublished ? 'Dərc edilib' : 'Qaralama'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#334155' }}>{fmtDate(post.createdAt)}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button onClick={() => openEdit(post)} style={{ ...btnGhost, padding: '6px 12px', fontSize: 12 }}>Redaktə</button>
                          <button onClick={() => togglePublish(post)} style={{ ...btnGhost, padding: '6px 12px', fontSize: 12, color: TEAL, borderColor: TEAL }}>
                            {post.isPublished ? 'Qaralamaya çəkin' : 'Dərc et'}
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
              background: 'white', borderRadius: 18, padding: 28, width: '100%', maxWidth: 560,
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
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Oxuma müddəti (dəq)</label>
                  <input type="number" min={1} value={form.readTime} onChange={e => setForm(f => ({ ...f, readTime: e.target.value }))} style={inp} />
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Qısa məzmun</label>
                <textarea rows={2} value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} style={{ ...inp, resize: 'vertical' }} />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Məzmun</label>
                <textarea rows={8} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} style={{ ...inp, resize: 'vertical' }} />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Cover şəkli</label>
                <input type="file" accept="image/*" onChange={e => setCoverFile(e.target.files?.[0] || null)} style={inp} />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, fontSize: 13, fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.isPublished} onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))} />
                Dərc et
              </label>

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
