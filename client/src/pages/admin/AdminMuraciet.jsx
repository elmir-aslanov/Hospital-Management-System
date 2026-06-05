import { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'

import { BASE } from '../../api/config.js'

const STATUS_MAP = {
  yeni:            { label: 'Yeni',       bg: '#fef9c3', color: '#854d0e' },
  baxildi:         { label: 'Baxıldı',    bg: '#dcfce7', color: '#166534' },
  cavablandirildi: { label: 'Cavablandı', bg: '#e0f2fe', color: '#0369a1' },
}

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.yeni
  return (
    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: s.bg, color: s.color }}>
      {s.label}
    </span>
  )
}

function DRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f8fafc' }}>
      <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 12, color: '#334155', fontWeight: 600, textAlign: 'right', maxWidth: '65%', wordBreak: 'break-word' }}>{value}</span>
    </div>
  )
}

export default function AdminMuraciet() {
  const [items, setItems]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [selected, setSelected]   = useState(null)
  const [typeFilter, setType]     = useState('all')
  const [search, setSearch]       = useState('')
  const [dateFilter, setDateFilter] = useState('all')

  const token   = localStorage.getItem('token') || localStorage.getItem('adminToken')
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    setLoading(true)
    const muracietReq = fetch(`${BASE}/api/v1/muraciet`, { headers })
      .then(r => r.json())
      .then(d => {
        const list = Array.isArray(d.data) ? d.data : d.data?.muracietler || d.muracietler || d.data || []
        return (Array.isArray(list) ? list : []).map(m => ({ ...m, _type: 'muraciet' }))
      })
      .catch(() => [])

    const contactReq = fetch(`${BASE}/api/v1/contact`, { headers })
      .then(r => r.json())
      .then(d => {
        const list = Array.isArray(d.data) ? d.data : Array.isArray(d) ? d : d.result || []
        return list.map(c => ({ ...c, _type: 'contact' }))
      })
      .catch(() => [])

    Promise.all([muracietReq, contactReq]).then(([mList, cList]) => {
      const merged = [...mList, ...cList].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      setItems(merged)
    }).finally(() => setLoading(false))
  }, [])

  /* ── helpers ── */
  const getFullName = (item) => {
    if (item.ad && item.soyad) return `${item.ad} ${item.soyad}`
    if (item.ad) return item.ad
    return item.name || item.fullName || '—'
  }
  const getContact = (item) => item.epoct || item.email || item.telefon || item.phone || '—'
  const getText    = (item) => item.metn || item.message || item.text || ''
  const getDate    = (item) => item.createdAt
    ? new Date(item.createdAt).toLocaleDateString('az-AZ', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—'
  const isUnread = (item) => item._type === 'muraciet' && !item.isRead

  /* ── date boundaries ── */
  const now      = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekStart  = new Date(todayStart); weekStart.setDate(weekStart.getDate() - 7)
  const monthStart = new Date(todayStart); monthStart.setMonth(monthStart.getMonth() - 1)

  /* ── filtering ── */
  const filtered = items.filter(item => {
    if (typeFilter !== 'all' && item._type !== typeFilter) return false
    if (search) {
      const q = search.toLowerCase()
      const hay = [item.ad, item.soyad, item.epoct, item.email, item.metn, item.message, item.telefon, item.phone]
        .filter(Boolean).join(' ').toLowerCase()
      if (!hay.includes(q)) return false
    }
    if (dateFilter !== 'all' && item.createdAt) {
      const d = new Date(item.createdAt)
      if (dateFilter === 'today' && d < todayStart) return false
      if (dateFilter === 'week'  && d < weekStart)  return false
      if (dateFilter === 'month' && d < monthStart) return false
    }
    return true
  })

  const unreadCount = items.filter(isUnread).length

  /* ── update helpers ── */
  const updateItem = (id, patch) => {
    setItems(prev => prev.map(i => i._id === id ? { ...i, ...patch } : i))
    setSelected(s => s?._id === id ? { ...s, ...patch } : s)
  }

  const handleMarkRead = async (item) => {
    updateItem(item._id, { isRead: true, status: 'baxildi' })
    fetch(`${BASE}/api/v1/muraciet/${item._id}/read`, { method: 'PATCH', headers }).catch(() => {})
  }

  const handleStatusChange = async (item, status) => {
    updateItem(item._id, { status })
    fetch(`${BASE}/api/v1/muraciet/${item._id}/status`, {
      method: 'PATCH',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch(() => {})
  }

  const handleDelete = async (item) => {
    if (!window.confirm('Bu müraciəti silmək istəyirsiniz?')) return
    try {
      const r = await fetch(`${BASE}/api/v1/muraciet/${item._id}`, { method: 'DELETE', headers })
      if (!r.ok) throw new Error()
      setItems(prev => prev.filter(i => i._id !== item._id))
      setSelected(null)
    } catch {
      alert('Silinmədi, yenidən cəhd edin')
    }
  }

  return (
    <AdminLayout activePage="muraciet">
      <div style={{ display: 'flex', gap: 22, height: 'calc(100vh - 130px)' }}>

        {/* LEFT */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f1b2d' }}>Müraciətlər</h1>
              {unreadCount > 0 && (
                <span style={{ background: '#ef4444', color: 'white', borderRadius: 999, fontSize: 11, fontWeight: 700, padding: '2px 8px' }}>
                  {unreadCount}
                </span>
              )}
            </div>
            <p style={{ margin: 0, color: '#64748b', fontSize: 13 }}>{filtered.length} müraciət</p>
          </div>

          {/* Search + date filter */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200, maxWidth: 400 }}>
              <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </div>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Ad, email və ya mətn üzrə axtar..."
                style={{ width: '100%', height: 36, border: '1px solid #e2e8f0', borderRadius: 8, padding: '0 12px 0 32px', fontSize: 13, outline: 'none', boxSizing: 'border-box', background: 'white', color: '#334155' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {[['all', 'Hamısı'], ['today', 'Bu gün'], ['week', 'Bu həftə'], ['month', 'Bu ay']].map(([v, l]) => (
                <button key={v} onClick={() => setDateFilter(v)} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid', fontSize: 12, fontWeight: 500, cursor: 'pointer', borderColor: dateFilter === v ? '#00848e' : '#e2e8f0', background: dateFilter === v ? '#00848e' : 'white', color: dateFilter === v ? 'white' : '#475569', whiteSpace: 'nowrap' }}>{l}</button>
              ))}
            </div>
          </div>

          {/* Type filter tabs */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            {[['all', 'Hamısı'], ['muraciet', 'Elektron müraciət'], ['contact', 'Əlaqə forması']].map(([v, l]) => (
              <button key={v} onClick={() => setType(v)} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid', fontSize: 12, fontWeight: 600, cursor: 'pointer', borderColor: typeFilter === v ? '#00848e' : '#e2e8f0', background: typeFilter === v ? '#00848e' : 'white', color: typeFilter === v ? 'white' : '#475569' }}>{l}</button>
            ))}
          </div>

          {/* List */}
          <div style={{ flex: 1, background: 'white', borderRadius: 14, border: '1px solid #f1f5f9', overflow: 'auto' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#00848e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8', fontSize: 14 }}>Müraciət tapılmadı</div>
            ) : (
              filtered.map(item => {
                const isSelected = selected?._id === item._id
                const text       = getText(item)
                const unread     = isUnread(item)
                return (
                  <div key={item._id} onClick={() => setSelected(item)}
                    style={{ padding: '14px 20px', borderBottom: '1px solid #f8fafc', cursor: 'pointer', background: isSelected ? '#f0fafb' : 'white', transition: 'background 0.1s' }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f8fafc' }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'white' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: item._type === 'muraciet' ? 'linear-gradient(135deg,#00848e,#00a8b5)' : 'linear-gradient(135deg,#7c3aed,#9f67f5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontWeight: 700 }}>
                            {getFullName(item)?.[0]?.toUpperCase() || '?'}
                          </div>
                          {unread && <div style={{ position: 'absolute', top: 0, right: 0, width: 9, height: 9, borderRadius: '50%', background: '#00848e', border: '2px solid white' }} />}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: unread ? 700 : 500, color: '#0f1b2d', marginBottom: 2 }}>{getFullName(item)}</div>
                          <div style={{ fontSize: 11, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{getContact(item)}</div>
                        </div>
                      </div>
                      <div style={{ flexShrink: 0, textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                        <div style={{ fontSize: 10, color: '#94a3b8' }}>{getDate(item)}</div>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {item._type === 'muraciet' && <StatusBadge status={item.status || 'yeni'} />}
                          <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: item._type === 'muraciet' ? '#e0f2fe' : '#f3e8ff', color: item._type === 'muraciet' ? '#0369a1' : '#7c3aed' }}>
                            {item._type === 'muraciet' ? 'Müraciət' : 'Əlaqə'}
                          </span>
                        </div>
                      </div>
                    </div>
                    {text && <div style={{ marginTop: 8, fontSize: 12, color: '#64748b', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', paddingLeft: 46 }}>{text}</div>}
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* DETAIL PANEL */}
        <div style={{ width: selected ? 340 : 0, transition: 'width 0.25s', overflow: 'hidden', flexShrink: 0 }}>
          {selected && (
            <div style={{ width: 340, background: 'white', borderRadius: 14, border: '1px solid #f1f5f9', height: '100%', overflow: 'auto', padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#0f1b2d' }}>Müraciət detalı</span>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 18 }}>×</button>
              </div>

              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: selected._type === 'muraciet' ? 'linear-gradient(135deg,#00848e,#00a8b5)' : 'linear-gradient(135deg,#7c3aed,#9f67f5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 22, fontWeight: 700, margin: '0 auto 12px' }}>
                  {getFullName(selected)?.[0]?.toUpperCase() || '?'}
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#0f1b2d' }}>{getFullName(selected)}</div>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: selected._type === 'muraciet' ? '#e0f2fe' : '#f3e8ff', color: selected._type === 'muraciet' ? '#0369a1' : '#7c3aed', display: 'inline-block', marginTop: 6 }}>
                  {selected._type === 'muraciet' ? 'Elektron Müraciət' : 'Əlaqə Forması'}
                </span>
              </div>

              {selected.soyad   && <DRow label="Soyadı"  value={selected.soyad} />}
              {selected.ataAdi  && <DRow label="Ata adı" value={selected.ataAdi} />}
              <DRow label="E-poçt"  value={selected.epoct || selected.email || '—'} />
              <DRow label="Telefon" value={selected.telefon || selected.phone || '—'} />
              {selected.unvan   && <DRow label="Ünvan"  value={selected.unvan} />}
              <DRow label="Tarix"   value={getDate(selected)} />
              {selected.subject && <DRow label="Mövzu"  value={selected.subject} />}

              {getText(selected) && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Mesaj</div>
                  <div style={{ background: '#f8fafc', borderRadius: 10, padding: '14px 16px', fontSize: 13, color: '#334155', lineHeight: 1.6 }}>
                    {getText(selected)}
                  </div>
                </div>
              )}

              {/* Status dropdown — muraciet only */}
              {selected._type === 'muraciet' && (
                <div style={{ marginTop: 20 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Status</label>
                  <select
                    value={selected.status || 'yeni'}
                    onChange={e => handleStatusChange(selected, e.target.value)}
                    style={{ width: '100%', height: 36, border: '1px solid #e2e8f0', borderRadius: 8, padding: '0 10px', fontSize: 13, color: '#334155', background: 'white', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="yeni">Yeni</option>
                    <option value="baxildi">Baxıldı</option>
                    <option value="cavablandirildi">Cavablandırıldı</option>
                  </select>
                </div>
              )}

              {/* Action buttons */}
              <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {/* Cavab yaz — email client */}
                {(selected.epoct || selected.email) && (
                  <a
                    href={`mailto:${selected.epoct || selected.email}?subject=Müraciətinizə cavab&body=Hörmətli ${selected.ad || selected.name || ''}`}
                    style={{ display: 'block', textAlign: 'center', padding: '8px 16px', borderRadius: 8, background: '#e0f2fe', color: '#0369a1', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
                  >
                    ✉ Cavab yaz
                  </a>
                )}

                {/* Oxundu işarələ — only for unread muraciet */}
                {selected._type === 'muraciet' && !selected.isRead && (
                  <button
                    onClick={() => handleMarkRead(selected)}
                    style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#dcfce7', color: '#166534', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                  >
                    ✓ Oxundu işarələ
                  </button>
                )}

                {/* Sil */}
                {selected._type === 'muraciet' && (
                  <button
                    onClick={() => handleDelete(selected)}
                    style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#fee2e2', color: '#991b1b', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                  >
                    Sil
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </AdminLayout>
  )
}
