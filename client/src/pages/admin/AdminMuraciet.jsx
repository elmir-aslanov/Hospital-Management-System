import { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'

const BASE = 'http://localhost:5000'

export default function AdminMuraciet() {
  const [items, setItems]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState(null)
  const [typeFilter, setType]   = useState('all')

  const token = localStorage.getItem('adminToken')
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    setLoading(true)
    const muracietReq = fetch(`${BASE}/api/v1/muraciet`, { headers })
      .then(r => r.json())
      .then(d => {
        const list = Array.isArray(d.data) ? d.data : Array.isArray(d) ? d : d.result || []
        return list.map(m => ({ ...m, _type: 'muraciet' }))
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

  const filtered = items.filter(i => typeFilter === 'all' || i._type === typeFilter)

  const getFullName = (item) => {
    if (item.ad && item.soyad) return `${item.ad} ${item.soyad}`
    if (item.ad) return item.ad
    return item.name || item.fullName || '—'
  }

  const getContact = (item) => item.epoct || item.email || item.telefon || item.phone || '—'
  const getText = (item) => item.metn || item.message || item.text || ''
  const getDate = (item) => item.createdAt ? new Date(item.createdAt).toLocaleDateString('az-AZ', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'

  return (
    <AdminLayout activePage="muraciet">
      <div style={{ display: 'flex', gap: 22, height: 'calc(100vh - 130px)' }}>

        {/* LEFT */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f1b2d' }}>Müraciətlər</h1>
              <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>{filtered.length} müraciət</p>
            </div>
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
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
                const text = getText(item)
                return (
                  <div key={item._id} onClick={() => setSelected(item)} style={{ padding: '14px 20px', borderBottom: '1px solid #f8fafc', cursor: 'pointer', background: isSelected ? '#f0fafb' : 'white', transition: 'background 0.1s' }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f8fafc' }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'white' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: item._type === 'muraciet' ? 'linear-gradient(135deg,#00848e,#00a8b5)' : 'linear-gradient(135deg,#7c3aed,#9f67f5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                          {getFullName(item)?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#0f1b2d', marginBottom: 2 }}>{getFullName(item)}</div>
                          <div style={{ fontSize: 11, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{getContact(item)}</div>
                        </div>
                      </div>
                      <div style={{ flexShrink: 0, textAlign: 'right' }}>
                        <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 4 }}>{getDate(item)}</div>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: item._type === 'muraciet' ? '#e0f2fe' : '#f3e8ff', color: item._type === 'muraciet' ? '#0369a1' : '#7c3aed' }}>
                          {item._type === 'muraciet' ? 'Müraciət' : 'Əlaqə'}
                        </span>
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

              {selected.soyad && <DRow label="Soyadı" value={selected.soyad} />}
              {selected.ataAdi && <DRow label="Ata adı" value={selected.ataAdi} />}
              <DRow label="E-poçt" value={selected.epoct || selected.email || '—'} />
              <DRow label="Telefon" value={selected.telefon || selected.phone || '—'} />
              {selected.unvan && <DRow label="Ünvan" value={selected.unvan} />}
              <DRow label="Tarix" value={getDate(selected)} />

              {getText(selected) && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Mesaj</div>
                  <div style={{ background: '#f8fafc', borderRadius: 10, padding: '14px 16px', fontSize: 13, color: '#334155', lineHeight: 1.6 }}>
                    {getText(selected)}
                  </div>
                </div>
              )}

              {selected.subject && <DRow label="Mövzu" value={selected.subject} />}
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </AdminLayout>
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
