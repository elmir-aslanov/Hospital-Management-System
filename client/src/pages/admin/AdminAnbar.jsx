import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import AdminLayout from '../../components/admin/AdminLayout'
import { clampNumberInput, toBoundedNumber } from '../../utils/numberInput'

const BASE  = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000'
const token = () => localStorage.getItem('adminToken') || localStorage.getItem('token')
const hdrs  = () => ({ Authorization: `Bearer ${token()}` })

const CATEGORIES = ['medicine', 'equipment', 'consumable', 'office', 'other']
const CATEGORY_COLOR = {
  medicine:   { bg: '#eff6ff', color: '#2563eb' },
  equipment:  { bg: '#f0fdf4', color: '#16a34a' },
  consumable: { bg: '#fefce8', color: '#ca8a04' },
  office:     { bg: '#fdf4ff', color: '#9333ea' },
  other:      { bg: '#f8fafc', color: '#64748b' },
}

const EMPTY_FORM = { name: '', category: 'medicine', quantity: 0, unit: 'ədəd', minStock: 5, unitPrice: 0, description: '' }

const stockStatus = (item) => {
  const qty = item.stock ?? item.quantity ?? 0
  const min = item.minStockLevel ?? item.minStock ?? 0
  if (qty === 0)  return { labelKey: 'outOfStock', bg: '#fef2f2', color: '#dc2626' }
  if (qty <= min) return { labelKey: 'lowStock',   bg: '#fff7ed', color: '#ea580c' }
  return { labelKey: 'normal', bg: '#f0fdf4', color: '#16a34a' }
}

/* ── shared style atoms ──────────────────────────────────────── */
const lbl = { fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }
const inp = { width: '100%', border: '1px solid #e2e8f0', borderRadius: 9, padding: '9px 12px', fontSize: 13, color: '#334155', outline: 'none', background: 'white', boxSizing: 'border-box' }
const card = { background: 'white', borderRadius: 14, border: '1px solid #f1f5f9', padding: '18px 22px' }

export default function AdminAnbar() {
  const { t } = useTranslation()
  /* ── list state ────────────────────────────────────────────── */
  const [items,          setItems]          = useState([])
  const [total,          setTotal]          = useState(0)
  const [loading,        setLoading]        = useState(true)
  const [search,         setSearch]         = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [page,           setPage]           = useState(1)
  const [lowStockItems,  setLowStockItems]  = useState([])
  const [showLowStock,   setShowLowStock]   = useState(false)
  const [onlyLowStock,   setOnlyLowStock]   = useState(false)

  /* ── add/edit modal ────────────────────────────────────────── */
  const [showModal, setShowModal] = useState(false)
  const [editItem,  setEditItem]  = useState(null)
  const [saving,    setSaving]    = useState(false)
  const [formErr,   setFormErr]   = useState('')
  const [form,      setForm]      = useState(EMPTY_FORM)

  /* ── stock in/out modal ────────────────────────────────────── */
  const [showStockModal, setShowStockModal] = useState(false)
  const [stockItem,      setStockItem]      = useState(null)
  const [stockType,      setStockType]      = useState('in')
  const [stockQty,       setStockQty]       = useState(1)
  const [stockNote,      setStockNote]      = useState('')
  const [stockSaving,    setStockSaving]    = useState(false)
  const [stockErr,       setStockErr]       = useState('')

  /* ── fetch items ───────────────────────────────────────────── */
  const fetchItems = useCallback((pg, q, cat) => {
    setLoading(true)
    const params = new URLSearchParams({ page: pg, limit: 20 })
    if (q)   params.set('search', q)
    if (cat) params.set('category', cat)
    fetch(`${BASE}/api/v1/inventory/medicines?${params}`, { headers: hdrs() })
      .then(r => r.json())
      .then(d => { setItems(d.data?.items || []); setTotal(d.data?.total || 0) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  /* mount: parallel load */
  useEffect(() => {
    fetchItems(1, '', '')
    fetch(`${BASE}/api/v1/inventory/medicines/low-stock`, { headers: hdrs() })
      .then(r => r.json())
      .then(d => setLowStockItems(d.data || []))
      .catch(() => {})
  }, [fetchItems])

  /* debounce search */
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchItems(1, search, filterCategory) }, 400)
    return () => clearTimeout(t)
  }, [search, filterCategory, fetchItems])

  /* page change */
  useEffect(() => {
    fetchItems(page, search, filterCategory)
  }, [page]) // eslint-disable-line

  /* ── summary counts ────────────────────────────────────────── */
  const countCat = (cat) => items.filter(i => i.category === cat).length

  /* ── add/edit modal helpers ────────────────────────────────── */
  const openAdd = () => {
    setEditItem(null); setForm(EMPTY_FORM); setFormErr(''); setShowModal(true)
  }
  const openEdit = (item) => {
    setEditItem(item)
    setForm({ name: item.name, category: item.category, quantity: item.stock ?? item.quantity ?? 0, unit: item.unit, minStock: item.minStockLevel ?? item.minStock ?? 0, unitPrice: item.unitPrice, description: item.description || '' })
    setFormErr(''); setShowModal(true)
  }
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.name.trim()) { setFormErr(t('adminInventory.nameRequiredError')); return }
    setSaving(true); setFormErr('')
    try {
      const url    = editItem ? `${BASE}/api/v1/inventory/medicines/${editItem._id}` : `${BASE}/api/v1/inventory/medicines`
      const method = editItem ? 'PUT' : 'POST'
      const body   = {
        ...form,
        quantity: toBoundedNumber(form.quantity, { min: 0, integer: true }),
        minStock: toBoundedNumber(form.minStock, { min: 0, integer: true }),
        unitPrice: toBoundedNumber(form.unitPrice, { min: 0 }),
      }
      const r    = await fetch(url, { method, headers: { ...hdrs(), 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await r.json()
      if (!r.ok) throw new Error(data.message || 'Xəta')
      const saved = data.data
      if (editItem) {
        setItems(prev => prev.map(i => i._id === editItem._id ? saved : i))
      } else {
        setItems(prev => [saved, ...prev]); setTotal(t => t + 1)
      }
      setShowModal(false)
    } catch (e) { setFormErr(e.message) }
    finally { setSaving(false) }
  }

  /* ── delete ────────────────────────────────────────────────── */
  const handleDelete = async (item) => {
    if (!window.confirm(t('adminInventory.confirmDelete', { name: item.name }))) return
    await fetch(`${BASE}/api/v1/inventory/medicines/${item._id}`, { method: 'DELETE', headers: hdrs() })
    setItems(prev => prev.filter(i => i._id !== item._id)); setTotal(t => t - 1)
  }

  /* ── stock modal ───────────────────────────────────────────── */
  const openStock = (item, type) => {
    setStockItem(item); setStockType(type); setStockQty(1); setStockNote(''); setStockErr(''); setShowStockModal(true)
  }

  const handleStock = async () => {
    if (!stockQty || stockQty < 1) { setStockErr(t('adminInventory.minQuantityError')); return }
    if (stockType === 'out' && stockQty > (stockItem.stock ?? stockItem.quantity ?? 0)) { setStockErr(t('adminInventory.exceedsStock')); return }
    setStockSaving(true); setStockErr('')
    try {
      const endpoint = stockType === 'in' ? 'stock-in' : 'stock-out'
      const r    = await fetch(`${BASE}/api/v1/inventory/medicines/${stockItem._id}/${endpoint}`, {
        method: 'POST',
        headers: { ...hdrs(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: toBoundedNumber(stockQty, { min: 1, integer: true }), note: stockNote }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.message || 'Xəta')
      const updated = data.data
      setItems(prev => prev.map(i => i._id === stockItem._id ? { ...i, quantity: updated?.quantity ?? (stockType === 'in' ? i.quantity + Number(stockQty) : i.quantity - Number(stockQty)) } : i))
      setShowStockModal(false)
    } catch (e) { setStockErr(e.message) }
    finally { setStockSaving(false) }
  }

  /* ── pagination ────────────────────────────────────────────── */
  const totalPages = Math.ceil(total / 20)

  /* ════════════════════════════════════════════════════════════ */
  return (
    <AdminLayout activePage="anbar">

      {/* ── Header ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f1b2d' }}>{t('adminLayout.nav.inventory')}</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>{t('adminInventory.productCount', { count: total })}</p>
        </div>
        <button onClick={openAdd}
          style={{ background: '#00848e', color: 'white', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          {t('adminInventory.addProduct')}
        </button>
      </div>

      {/* ── Low stock banner ───────────────────────────────── */}
      {lowStockItems.length > 0 && (
        <div
          onClick={() => setShowLowStock(s => !s)}
          style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: '11px 16px', fontSize: 13, fontWeight: 600, color: '#c2410c', cursor: 'pointer', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          ⚠️ {t('adminInventory.lowStockCount', { count: lowStockItems.length })}
          <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 500, opacity: 0.7 }}>{showLowStock ? `▲ ${t('adminInventory.hide')}` : `▼ ${t('adminInventory.show')}`}</span>
        </div>
      )}

      {/* ── Summary cards ──────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: t('adminInventory.totalProducts'),  value: total,                    accent: '#00848e' },
          { label: t('inventory.lowStock'),             value: lowStockItems.length,      accent: lowStockItems.length > 0 ? '#dc2626' : '#16a34a' },
          { label: t('adminInventory.category.medicine'),    value: countCat('medicine'),      accent: '#2563eb' },
          { label: t('adminInventory.category.equipment'),   value: countCat('equipment'),     accent: '#16a34a' },
          { label: t('adminInventory.category.consumable'),  value: countCat('consumable'),    accent: '#ca8a04' },
        ].map(c => (
          <div key={c.label} style={{ ...card, textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: c.accent }}>{c.value}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* ── Filters ────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 320 }}>
          <svg width="14" height="14" fill="none" stroke="#94a3b8" strokeWidth="1.8" viewBox="0 0 24 24"
            style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('adminInventory.searchPlaceholder')}
            style={{ ...inp, paddingLeft: 34 }} />
        </div>
        {['', ...CATEGORIES].map(cat => (
          <button key={cat} onClick={() => { setFilterCategory(cat); setPage(1) }}
            style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid', transition: 'all .15s',
              background: filterCategory === cat ? '#00848e' : 'white',
              color:      filterCategory === cat ? 'white'   : '#475569',
              borderColor:filterCategory === cat ? '#00848e' : '#e2e8f0',
            }}>
            {cat === '' ? t('adminInventory.all') : t(`adminInventory.category.${cat}`)}
          </button>
        ))}
        <button onClick={() => setOnlyLowStock(v => !v)}
          style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid', transition: 'all .15s',
            background: onlyLowStock ? '#ea580c' : 'white',
            color:      onlyLowStock ? 'white'   : '#ea580c',
            borderColor:'#ea580c',
          }}>
          ⚠️ {t('inventory.onlyLowStock')}
        </button>
      </div>

      {/* ── Main table ─────────────────────────────────────── */}
      <ItemTable
        items={onlyLowStock ? items.filter(i => i.lowStockAlert) : items}
        loading={loading}
        emptyText={onlyLowStock ? t('inventory.noLowStockItems') : undefined}
        onStockIn={i => openStock(i,'in')} onStockOut={i => openStock(i,'out')} onEdit={openEdit} onDelete={handleDelete}
      />

      {/* ── Pagination ─────────────────────────────────────── */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 24 }}>
          <PageBtn label="←" disabled={page === 1}         onClick={() => setPage(p => p - 1)} />
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <PageBtn key={p} label={p} active={p === page} onClick={() => setPage(p)} />
          ))}
          <PageBtn label="→" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} />
        </div>
      )}

      {/* ── Low stock table ─────────────────────────────────── */}
      {showLowStock && lowStockItems.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#c2410c', marginBottom: 12 }}>⚠️ {t('inventory.lowStockItems')}</h2>
          <ItemTable
            items={lowStockItems}
            loading={false}
            headerStyle={{ background: '#fff7ed' }}
            onStockIn={i => openStock(i,'in')}
            onStockOut={i => openStock(i,'out')}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        </div>
      )}

      {/* ════ ADD/EDIT MODAL ════════════════════════════════ */}
      {showModal && (
        <Overlay onClose={() => setShowModal(false)}>
          <div style={{ background: 'white', borderRadius: 16, width: 540, maxWidth: '95vw', maxHeight: '90vh', overflow: 'auto', padding: 28 }}>
            <ModalHeader title={editItem ? t('adminInventory.editProduct') : t('adminInventory.newProduct')} onClose={() => setShowModal(false)} />
            {formErr && <ErrBox msg={formErr} />}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>{t('adminInventory.productName')} *</label>
                <input style={inp} value={form.name} onChange={e => setF('name', e.target.value)} />
              </div>

              <div>
                <label style={lbl}>{t('adminInventory.category.label')}</label>
                <select style={{ ...inp, height: 38 }} value={form.category} onChange={e => setF('category', e.target.value)}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{t(`adminInventory.category.${c}`)}</option>)}
                </select>
              </div>

              <div>
                <label style={lbl}>{t('adminInventory.unit')}</label>
                <input style={inp} value={form.unit} onChange={e => setF('unit', e.target.value)} placeholder={t('adminInventory.unitPlaceholder')} />
              </div>

              <div>
                <label style={lbl}>{t('adminInventory.quantity')}</label>
                <input type="number" min="0" style={inp} value={form.quantity} onChange={e => setF('quantity', clampNumberInput(e.target.value, { min: 0, integer: true }))} />
              </div>

              <div>
                <label style={lbl}>{t('inventory.minStock')}</label>
                <input type="number" min="0" style={inp} value={form.minStock} onChange={e => setF('minStock', clampNumberInput(e.target.value, { min: 0, integer: true }))} />
              </div>

              <div>
                <label style={lbl}>{t('adminInventory.unitPrice')}</label>
                <input type="number" min="0" step="0.01" style={inp} value={form.unitPrice} onChange={e => setF('unitPrice', clampNumberInput(e.target.value, { min: 0 }))} />
              </div>

              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>{t('adminInventory.description')}</label>
                <textarea rows={3} style={{ ...inp, resize: 'vertical', fontFamily: 'inherit' }} value={form.description} onChange={e => setF('description', e.target.value)} />
              </div>
            </div>

            <ModalFooter onClose={() => setShowModal(false)} onSave={handleSave} saving={saving} saveLabel={editItem ? t('adminInventory.saveChanges') : t('adminInventory.add')} />
          </div>
        </Overlay>
      )}

      {/* ════ STOCK IN/OUT MODAL ════════════════════════════ */}
      {showStockModal && stockItem && (
        <Overlay onClose={() => setShowStockModal(false)}>
          <div style={{ background: 'white', borderRadius: 16, width: 400, maxWidth: '95vw', padding: 28 }}>
            <ModalHeader
              title={stockType === 'in' ? t('adminInventory.stockIn') : t('adminInventory.stockOut')}
              subtitle={stockItem.name}
              onClose={() => setShowStockModal(false)}
            />
            {stockErr && <ErrBox msg={stockErr} />}

            {/* current qty highlight */}
            <div style={{ background: '#f0fafb', border: '1px solid #bae6ea', borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#475569' }}>{t('adminInventory.currentStock')}</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#00848e' }}>{(stockItem.stock ?? stockItem.quantity ?? 0)} {stockItem.unit}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={lbl}>{t('adminInventory.quantity')} *</label>
                <input
                  type="number" min="1"
                  max={stockType === 'out' ? (stockItem.stock ?? stockItem.quantity ?? 0) : undefined}
                  style={inp}
                  value={stockQty}
                  onChange={e => setStockQty(clampNumberInput(e.target.value, { min: 1, integer: true }))}
                />
                {stockType === 'out' && stockQty > (stockItem.stock ?? stockItem.quantity ?? 0) && (
                  <p style={{ margin: '5px 0 0', fontSize: 12, color: '#dc2626' }}>⚠️ {t('adminInventory.exceedsStock')}</p>
                )}
              </div>
              <div>
                <label style={lbl}>{t('adminInventory.note')}</label>
                <input style={inp} placeholder={t('adminInventory.notePlaceholder')} value={stockNote} onChange={e => setStockNote(e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowStockModal(false)}
                style={{ padding: '10px 20px', border: '1px solid #e2e8f0', borderRadius: 9, background: 'white', fontSize: 13, cursor: 'pointer', color: '#475569' }}>
                {t('labResult.cancel')}
              </button>
              <button onClick={handleStock} disabled={stockSaving}
                style={{ padding: '10px 24px', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: stockSaving ? 'not-allowed' : 'pointer', opacity: stockSaving ? 0.7 : 1,
                  background: stockType === 'in' ? '#16a34a' : '#ea580c', color: 'white' }}>
                {stockSaving ? t('labResult.saving') : stockType === 'in' ? `+ ${t('adminInventory.in')}` : `- ${t('adminInventory.out')}`}
              </button>
            </div>
          </div>
        </Overlay>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </AdminLayout>
  )
}

/* ── Sub-components ────────────────────────────────────────────── */

function ItemTable({ items, loading, onStockIn, onStockOut, onEdit, onDelete, headerStyle = {}, emptyText }) {
  const { t } = useTranslation()
  const thStyle = { padding: '10px 14px', fontSize: 12, fontWeight: 600, color: '#475569', textAlign: 'left', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }
  const tdStyle = { padding: '12px 14px', fontSize: 13, color: '#334155', borderBottom: '1px solid #f8fafc', verticalAlign: 'middle' }

  return (
    <div style={{ background: 'white', borderRadius: 14, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#00848e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8', fontSize: 14 }}>{emptyText || t('adminInventory.notFound')}</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', ...headerStyle }}>
              {[t('adminInventory.productName'), t('adminInventory.category.label'), t('adminInventory.stock'), t('inventory.minStock'), t('adminInventory.price'), t('feedback.status'), ''].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map(item => {
              const st  = stockStatus(item)
              const cat = CATEGORY_COLOR[item.category] || CATEGORY_COLOR.other
              return (
                <tr key={item._id} style={{ transition: 'background .1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                  onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 600, color: '#0f1b2d' }}>{item.name}</div>
                    {item.description && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{item.description}</div>}
                  </td>
                  <td style={tdStyle}>
                    <span style={{ background: cat.bg, color: cat.color, borderRadius: 6, padding: '3px 9px', fontSize: 11, fontWeight: 600 }}>
                      {CATEGORY_COLOR[item.category] ? t(`adminInventory.category.${item.category}`) : item.category}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, fontWeight: 700, color: (item.stock ?? item.quantity) === 0 ? '#dc2626' : '#0f1b2d' }}>
                    {item.stock ?? item.quantity} <span style={{ fontWeight: 400, color: '#94a3b8', fontSize: 11 }}>{item.unit}</span>
                  </td>
                  <td style={{ ...tdStyle, color: '#64748b' }}>
                    {item.minStockLevel ?? item.minStock} <span style={{ color: '#94a3b8', fontSize: 11 }}>{item.unit}</span>
                  </td>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{Number(item.unitPrice).toFixed(2)} ₼</td>
                  <td style={tdStyle}>
                    <span style={{ background: st.bg, color: st.color, borderRadius: 6, padding: '3px 9px', fontSize: 11, fontWeight: 600 }}>
                      {t(`adminInventory.statuses.${st.labelKey}`)}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <ABtn label={`+ ${t('adminInventory.in')}`}  color="#16a34a" onClick={() => onStockIn(item)} />
                      <ABtn label={`- ${t('adminInventory.out')}`}  color="#ea580c" onClick={() => onStockOut(item)} />
                      <IconBtn onClick={() => onEdit(item)}>
                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </IconBtn>
                      <IconBtn onClick={() => onDelete(item)} danger>
                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                      </IconBtn>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}

const ABtn = ({ label, color, onClick }) => (
  <button onClick={onClick}
    style={{ padding: '4px 9px', fontSize: 11, fontWeight: 600, borderRadius: 7, cursor: 'pointer', border: `1px solid ${color}`, color, background: 'white', whiteSpace: 'nowrap' }}>
    {label}
  </button>
)

const IconBtn = ({ onClick, danger, children }) => (
  <button onClick={onClick}
    style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${danger ? '#fee2e2' : '#e2e8f0'}`, borderRadius: 7, background: danger ? '#fff5f5' : 'white', color: danger ? '#ef4444' : '#475569', cursor: 'pointer' }}>
    {children}
  </button>
)

const PageBtn = ({ label, onClick, disabled, active }) => (
  <button onClick={onClick} disabled={disabled}
    style={{ minWidth: 34, height: 34, padding: '0 10px', borderRadius: 8, border: '1px solid', fontSize: 13, fontWeight: 600, cursor: disabled ? 'default' : 'pointer',
      background:   active    ? '#00848e' : 'white',
      color:        active    ? 'white'   : disabled ? '#cbd5e1' : '#475569',
      borderColor:  active    ? '#00848e' : disabled ? '#f1f5f9' : '#e2e8f0',
    }}>
    {label}
  </button>
)

const Overlay = ({ children, onClose }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    onClick={e => { if (e.target === e.currentTarget) onClose() }}>
    {children}
  </div>
)

const ModalHeader = ({ title, subtitle, onClose }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
    <div>
      <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f1b2d' }}>{title}</h2>
      {subtitle && <p style={{ margin: '3px 0 0', fontSize: 12, color: '#64748b' }}>{subtitle}</p>}
    </div>
    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 22, lineHeight: 1 }}>×</button>
  </div>
)

const ModalFooter = ({ onClose, onSave, saving, saveLabel }) => {
  const { t } = useTranslation()
  return (
  <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
    <button onClick={onClose}
      style={{ padding: '10px 20px', border: '1px solid #e2e8f0', borderRadius: 9, background: 'white', fontSize: 13, cursor: 'pointer', color: '#475569' }}>
      {t('labResult.cancel')}
    </button>
    <button onClick={onSave} disabled={saving}
      style={{ padding: '10px 24px', border: 'none', borderRadius: 9, background: '#00848e', color: 'white', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
      {saving ? t('labResult.saving') : (saveLabel || t('adminInventory.saveChanges'))}
    </button>
  </div>
  )
}

const ErrBox = ({ msg }) => (
  <div style={{ background: '#fef2f2', color: '#ef4444', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>{msg}</div>
)
