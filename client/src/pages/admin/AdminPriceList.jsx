import { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { clampNumberInput, toBoundedNumber } from '../../utils/numberInput'

const BASE  = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000'
const token = () => localStorage.getItem('adminToken') || localStorage.getItem('token')
const hdrs  = () => ({ Authorization: `Bearer ${token()}` })

const CATEGORIES = ['consultation', 'lab', 'imaging', 'surgery', 'pharmacy', 'room', 'other']
const CATEGORY_AZ = {
  consultation: 'Konsultasiya',
  lab:          'Laboratoriya',
  imaging:      'Görüntüləmə',
  surgery:      'Cərrahiyyə',
  pharmacy:     'Dərman',
  room:         'Palata',
  other:        'Digər',
}
const CATEGORY_COLOR = {
  consultation: { bg: '#eff6ff', color: '#2563eb' },
  lab:          { bg: '#f0fdf4', color: '#16a34a' },
  imaging:      { bg: '#fefce8', color: '#ca8a04' },
  surgery:      { bg: '#fef2f2', color: '#dc2626' },
  pharmacy:     { bg: '#f0fdf4', color: '#16a34a' },
  room:         { bg: '#fdf4ff', color: '#9333ea' },
  other:        { bg: '#f8fafc', color: '#64748b' },
}

const EMPTY_FORM = { name: '', serviceCode: '', category: 'consultation', price: 0, currency: 'AZN', description: '', serviceSlug: '', isActive: true }

const lbl = { fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }
const inp = { width: '100%', border: '1px solid #e2e8f0', borderRadius: 9, padding: '9px 12px', fontSize: 13, color: '#334155', outline: 'none', background: 'white', boxSizing: 'border-box' }

export default function AdminPriceList() {
  const [prices,          setPrices]          = useState([])
  const [total,           setTotal]           = useState(0)
  const [loading,         setLoading]         = useState(true)
  const [search,          setSearch]          = useState('')
  const [filterCategory,  setFilterCategory]  = useState('')

  const [showModal, setShowModal] = useState(false)
  const [editPrice, setEditPrice] = useState(null)
  const [saving,    setSaving]    = useState(false)
  const [formErr,   setFormErr]   = useState('')
  const [form,      setForm]      = useState(EMPTY_FORM)
  const [labDirs,   setLabDirs]   = useState([])

  /* ── fetch ────────────────────────────────────────────────── */
  const fetchPrices = () => {
    setLoading(true)
    const params = new URLSearchParams({ limit: 200 })
    if (search)         params.set('search',   search)
    if (filterCategory) params.set('category', filterCategory)
    fetch(`${BASE}/api/v1/pricelist?${params}`, { headers: hdrs() })
      .then(r => r.json())
      .then(d => { setPrices(d.data?.prices || []); setTotal(d.data?.total || 0) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchPrices() }, [])
  useEffect(() => {
    const t = setTimeout(fetchPrices, 350)
    return () => clearTimeout(t)
  }, [search, filterCategory])

  /* ── load lab directions when modal opens with category=lab ── */
  useEffect(() => {
    if (!showModal || form.category !== 'lab') return
    if (labDirs.length > 0) return
    fetch(`${BASE}/api/v1/services`)
      .then(r => r.json())
      .then(d => setLabDirs(Array.isArray(d.data) ? d.data : []))
      .catch(() => {})
  }, [showModal, form.category])

  /* ── modal helpers ────────────────────────────────────────── */
  const openAdd = () => { setEditPrice(null); setForm(EMPTY_FORM); setFormErr(''); setShowModal(true) }
  const openEdit = (p) => {
    setEditPrice(p)
    setForm({ name: p.name, serviceCode: p.serviceCode || '', category: p.category, price: p.price, currency: p.currency || 'AZN', description: p.description || '', serviceSlug: p.serviceSlug || '', isActive: p.isActive !== false })
    setFormErr(''); setShowModal(true)
  }
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }))

  /* ── save ─────────────────────────────────────────────────── */
  const handleSave = async () => {
    if (!form.name.trim())    { setFormErr('Xidmət adı tələb olunur'); return }
    if (!form.price && form.price !== 0) { setFormErr('Qiymət tələb olunur'); return }
    setSaving(true); setFormErr('')
    try {
      const url    = editPrice ? `${BASE}/api/v1/pricelist/${editPrice._id}` : `${BASE}/api/v1/pricelist`
      const method = editPrice ? 'PUT' : 'POST'
      const body   = { ...form, price: toBoundedNumber(form.price, { min: 0 }) }
      const r      = await fetch(url, { method, headers: { ...hdrs(), 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data   = await r.json()
      if (!r.ok) throw new Error(data.message || 'Xəta')
      setShowModal(false)
      fetchPrices()
    } catch (e) { setFormErr(e.message) }
    finally { setSaving(false) }
  }

  /* ── delete ───────────────────────────────────────────────── */
  const handleDelete = async (p) => {
    if (!window.confirm(`"${p.name}" silinsin?`)) return
    await fetch(`${BASE}/api/v1/pricelist/${p._id}`, { method: 'DELETE', headers: hdrs() })
    fetchPrices()
  }

  /* ── filtered list ────────────────────────────────────────── */
  const filtered = prices.filter(p =>
    (!search         || p.name?.toLowerCase().includes(search.toLowerCase()) || (p.serviceCode || '').toLowerCase().includes(search.toLowerCase())) &&
    (!filterCategory || p.category === filterCategory)
  )

  const thS = { padding: '10px 14px', fontSize: 12, fontWeight: 600, color: '#475569', textAlign: 'left', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }
  const tdS = { padding: '12px 14px', fontSize: 13, color: '#334155', borderBottom: '1px solid #f8fafc', verticalAlign: 'middle' }

  /* ═══════════════════════════════════════════════════════════ */
  return (
    <AdminLayout activePage="pricelist">

      {/* ── Header ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f1b2d' }}>Qiymət Siyahısı</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>{total} xidmət</p>
        </div>
        <button onClick={openAdd}
          style={{ background: '#00848e', color: 'white', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Əlavə et
        </button>
      </div>

      {/* ── Filters ────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 320 }}>
          <svg width="14" height="14" fill="none" stroke="#94a3b8" strokeWidth="1.8" viewBox="0 0 24 24"
            style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Xidmət adı və ya kod..."
            style={{ ...inp, paddingLeft: 34 }} />
        </div>
        {['', ...CATEGORIES].map(cat => (
          <button key={cat} onClick={() => setFilterCategory(cat)}
            style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid',
              background:   filterCategory === cat ? '#00848e' : 'white',
              color:        filterCategory === cat ? 'white'   : '#475569',
              borderColor:  filterCategory === cat ? '#00848e' : '#e2e8f0',
            }}>
            {cat === '' ? 'Hamısı' : CATEGORY_AZ[cat]}
          </button>
        ))}
      </div>

      {/* ── Table ──────────────────────────────────────────── */}
      <div style={{ background: 'white', borderRadius: 14, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#00848e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8', fontSize: 14 }}>Xidmət tapılmadı</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Xidmət', 'Kod', 'Kateqoriya', 'Qiymət', 'Status', ''].map(h => (
                  <th key={h} style={thS}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const cat = CATEGORY_COLOR[p.category] || CATEGORY_COLOR.other
                return (
                  <tr key={p._id}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                    <td style={tdS}>
                      <div style={{ fontWeight: 600, color: '#0f1b2d' }}>{p.name}</div>
                      {p.description && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{p.description}</div>}
                    </td>
                    <td style={{ ...tdS, fontFamily: 'monospace', fontSize: 12, color: '#64748b' }}>
                      {p.serviceCode || '—'}
                    </td>
                    <td style={tdS}>
                      <span style={{ background: cat.bg, color: cat.color, borderRadius: 6, padding: '3px 9px', fontSize: 11, fontWeight: 600 }}>
                        {CATEGORY_AZ[p.category] || p.category}
                      </span>
                    </td>
                    <td style={{ ...tdS, fontWeight: 700, color: '#0f1b2d' }}>
                      {Number(p.price).toFixed(2)} <span style={{ fontSize: 11, fontWeight: 400, color: '#94a3b8' }}>{p.currency || 'AZN'}</span>
                    </td>
                    <td style={tdS}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 6,
                        background: p.isActive ? '#f0fdf4' : '#fef2f2',
                        color:      p.isActive ? '#16a34a' : '#dc2626',
                      }}>
                        {p.isActive ? 'Aktiv' : 'Deaktiv'}
                      </span>
                    </td>
                    <td style={{ ...tdS, whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => openEdit(p)}
                          style={{ padding: '5px 12px', fontSize: 12, fontWeight: 600, border: '1px solid #e2e8f0', borderRadius: 7, background: 'white', color: '#475569', cursor: 'pointer' }}>
                          Redaktə
                        </button>
                        <button onClick={() => handleDelete(p)}
                          style={{ padding: '5px 10px', fontSize: 12, fontWeight: 600, border: '1px solid #fee2e2', borderRadius: 7, background: '#fff5f5', color: '#ef4444', cursor: 'pointer' }}>
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ════ MODAL ════════════════════════════════════════════ */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div style={{ background: 'white', borderRadius: 16, width: 520, maxWidth: '95vw', maxHeight: '90vh', overflow: 'auto', padding: 28 }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f1b2d' }}>
                {editPrice ? 'Redaktə Et' : 'Yeni Xidmət'}
              </h2>
              <button onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 22, lineHeight: 1 }}>×</button>
            </div>

            {formErr && (
              <div style={{ background: '#fef2f2', color: '#ef4444', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>{formErr}</div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Xidmət adı *</label>
                <input style={inp} value={form.name} onChange={e => setF('name', e.target.value)} placeholder="məs. Ümumi qan analizi" />
              </div>

              <div>
                <label style={lbl}>Xidmət kodu</label>
                <input style={inp} value={form.serviceCode} onChange={e => setF('serviceCode', e.target.value)} placeholder="məs. LAB-001" />
              </div>

              <div>
                <label style={lbl}>Kateqoriya</label>
                <select style={{ ...inp, height: 38 }} value={form.category} onChange={e => { setF('category', e.target.value); if (e.target.value !== 'lab') setF('serviceSlug', '') }}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_AZ[c]}</option>)}
                </select>
              </div>

              {form.category === 'lab' && (
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={lbl}>Laboratoriya istiqaməti</label>
                  <select style={{ ...inp, height: 38 }} value={form.serviceSlug} onChange={e => setF('serviceSlug', e.target.value)}>
                    <option value="">— Seçilməyib —</option>
                    {labDirs.map(s => <option key={s._id} value={s.slug}>{s.name}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label style={lbl}>Qiymət (AZN) *</label>
                <input type="number" min="0" step="0.01" style={inp} value={form.price} onChange={e => setF('price', clampNumberInput(e.target.value, { min: 0 }))} />
              </div>

              <div>
                <label style={lbl}>Valyuta</label>
                <input style={inp} value={form.currency} onChange={e => setF('currency', e.target.value)} placeholder="AZN" />
              </div>

              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Açıqlama</label>
                <textarea rows={3} style={{ ...inp, resize: 'vertical', fontFamily: 'inherit' }}
                  value={form.description} onChange={e => setF('description', e.target.value)} />
              </div>

              <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setF('isActive', e.target.checked)}
                  style={{ width: 15, height: 15, accentColor: '#00848e' }} />
                <label htmlFor="isActive" style={{ fontSize: 13, color: '#475569', cursor: 'pointer' }}>Aktiv</label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)}
                style={{ padding: '10px 20px', border: '1px solid #e2e8f0', borderRadius: 9, background: 'white', fontSize: 13, cursor: 'pointer', color: '#475569' }}>
                Ləğv et
              </button>
              <button onClick={handleSave} disabled={saving}
                style={{ padding: '10px 24px', border: 'none', borderRadius: 9, background: '#00848e', color: 'white', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saxlanır...' : editPrice ? 'Yadda saxla' : 'Əlavə et'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </AdminLayout>
  )
}
