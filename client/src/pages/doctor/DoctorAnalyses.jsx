import { useState, useEffect, useCallback } from 'react'
import DoctorLayout from '../../components/doctor/DoctorLayout'
import {
  C, Toolbar, SearchInput, Badge, Spinner,
  TableCard, THead, EmptyRow, Modal,
} from '../../components/doctor/DoctorUI'
import { BASE } from '../../api/config.js'

function getToken() {
  return localStorage.getItem('adminToken') || localStorage.getItem('doctorToken') || ''
}
function getDoctorUser() {
  try { return JSON.parse(localStorage.getItem('adminUser') || localStorage.getItem('doctorUser') || '{}') }
  catch { return {} }
}
function formatDate(str) {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const STATUS_MAP = {
  pending:   { label: 'Gözləyir'   },
  completed: { label: 'Tamamlandı' },
  reviewed:  { label: 'Baxıldı'    },
  normal:    { label: 'Normal'     },
  abnormal:  { label: 'Anormal'    },
}

const TABLE_COLS = ['Pasiyent', 'Analiz növü', 'Nəticə', 'Normal aralıq', 'Tarix', 'Status', '']

export default function DoctorAnalyses() {
  const doctorUser = getDoctorUser()
  const doctorId   = doctorUser._id || doctorUser.id || ''

  const [analyses,   setAnalyses]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selected,   setSelected]   = useState(null)

  // Close modal on Escape, prevent background scroll
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setSelected(null) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (selected) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [selected])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: 100 })
      if (doctorId) params.set('doctorId', doctorId)
      const r = await fetch(`${BASE}/api/v1/vitals?${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      const data = await r.json()
      let list = []
      if (Array.isArray(data))              list = data
      else if (Array.isArray(data.data))    list = data.data
      else if (Array.isArray(data.data?.vitals)) list = data.data.vitals
      else if (Array.isArray(data.vitals))  list = data.vitals
      else if (Array.isArray(data.docs))    list = data.docs
      setAnalyses(list)
    } catch {
      setAnalyses([])
    } finally {
      setLoading(false)
    }
  }, [doctorId])

  useEffect(() => { load() }, [load])

  const types = ['all', ...Array.from(new Set((analyses || []).map(a => a.type || a.testType || '').filter(Boolean)))]

  const filtered = (analyses || []).filter(a => {
    const name = a.patientId?.userId?.fullName || a.patientId?.name || a.patientId?.fullName || a.patientName || ''
    const type = a.type || a.testType || ''
    const q    = search.toLowerCase()
    return (name.toLowerCase().includes(q) || type.toLowerCase().includes(q)) &&
      (typeFilter === 'all' || type === typeFilter)
  })

  // Resolve status & whether result is abnormal
  const getStatus = (a) => a.status || (a.isAbnormal ? 'abnormal' : 'normal')
  const isAbnormal = (a) => getStatus(a) === 'abnormal'

  return (
    <DoctorLayout>
      <Toolbar
        title="Analizlər"
        count={filtered.length}
        right={
          <>
            <SearchInput value={search} onChange={setSearch} placeholder="Pasiyent və ya analiz növü axtar..." width={300} />
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              aria-label="Analiz növünə görə filtr"
              style={{
                padding: '8px 10px', borderRadius: 8, border: `1px solid ${C.border}`,
                fontSize: 13, outline: 'none', background: C.white, color: '#334155',
                width: 160, cursor: 'pointer',
              }}
              onFocus={e => e.target.style.borderColor = C.teal}
              onBlur={e => e.target.style.borderColor = C.border}
            >
              {types.map(t => <option key={t} value={t}>{t === 'all' ? 'Bütün növlər' : t}</option>)}
            </select>
          </>
        }
      />

      <TableCard>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <THead cols={TABLE_COLS} />
          <tbody>
            {loading ? (
              <tr><td colSpan={TABLE_COLS.length} style={{ padding: 40, textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center' }}><Spinner /></div>
              </td></tr>
            ) : filtered.length === 0 ? (
              <EmptyRow
                colSpan={TABLE_COLS.length}
                text={search || typeFilter !== 'all' ? 'Nəticə tapılmadı' : 'Analiz məlumatı yoxdur'}
                subText={!search && typeFilter === 'all' ? 'Laboratoriya nəticələri burada görünəcək' : undefined}
              />
            ) : filtered.map(a => {
              const patName = a.patientId?.userId?.fullName || a.patientId?.name || a.patientId?.fullName || a.patientName || '—'
              const patId   = a.patientId?.patientId || a.patientId?.pid || ''
              const type    = a.type || a.testType || '—'
              const value   = a.value !== undefined ? `${a.value} ${a.unit || ''}`.trim() : (a.result || '—')
              const normal  = a.normalRange || a.referenceRange || '—'
              const status  = getStatus(a)
              const abnormal = isAbnormal(a)
              return (
                <tr
                  key={a._id}
                  style={{ borderBottom: `1px solid #f1f5f9`, cursor: 'pointer', height: 56 }}
                  onMouseEnter={e => e.currentTarget.style.background = C.rowHover}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  onClick={() => setSelected(a)}
                >
                  <td style={{ padding: '0 16px' }}>
                    <div style={{ fontWeight: 600, color: C.navy }}>{patName}</div>
                    {patId && <div style={{ fontSize: 11, color: '#94a3b8' }}>{patId}</div>}
                  </td>
                  <td style={{ padding: '0 16px', color: '#334155', fontWeight: 500 }}>{type}</td>
                  <td style={{ padding: '0 16px', fontWeight: 700, color: abnormal ? '#dc2626' : C.navy }}>{value}</td>
                  <td style={{ padding: '0 16px', color: C.sub, fontSize: 12 }}>{normal}</td>
                  <td style={{ padding: '0 16px', color: C.sub }}>{formatDate(a.createdAt || a.recordedAt)}</td>
                  <td style={{ padding: '0 16px' }}>
                    <Badge status={status} label={STATUS_MAP[status]?.label} />
                  </td>
                  <td style={{ padding: '0 16px' }}>
                    <button
                      onClick={e => { e.stopPropagation(); setSelected(a) }}
                      aria-label="Ətraflı bax"
                      style={{
                        background: '#f1f5f9', border: 'none', borderRadius: 7,
                        padding: '5px 12px', fontSize: 12, cursor: 'pointer', color: '#475569', fontWeight: 500,
                        outline: 'none',
                      }}
                      onFocus={e => e.currentTarget.style.boxShadow = `0 0 0 2px rgba(22,140,150,0.4)`}
                      onBlur={e => e.currentTarget.style.boxShadow = 'none'}
                    >Ətraflı</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </TableCard>

      {/* Detail Modal */}
      {selected && (
        <Modal title="Analiz məlumatı" onClose={() => setSelected(null)} width={460}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              ['Pasiyent',      selected.patientId?.userId?.fullName || selected.patientId?.name || selected.patientName || '—'],
              ['Analiz növü',   selected.type || selected.testType || '—'],
              ['Nəticə',        selected.value !== undefined ? `${selected.value} ${selected.unit || ''}`.trim() : (selected.result || '—')],
              ['Normal aralıq', selected.normalRange || selected.referenceRange || '—'],
              ['Tarix',         formatDate(selected.createdAt || selected.recordedAt)],
              ['Status',        STATUS_MAP[getStatus(selected)]?.label || getStatus(selected) || '—'],
              ['Laborant',      selected.technicianId?.fullName || selected.labTechName || '—'],
            ].map(([label, value]) => {
              const isResult = label === 'Nəticə' && isAbnormal(selected)
              return (
                <div key={label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                  padding: '11px 0', borderBottom: `1px solid #f1f5f9`,
                }}>
                  <span style={{ fontSize: 13, color: C.sub, fontWeight: 500, flexShrink: 0, marginRight: 12 }}>{label}</span>
                  <span style={{ fontSize: 13, color: isResult ? '#dc2626' : C.navy, fontWeight: 600, textAlign: 'right' }}>{String(value)}</span>
                </div>
              )
            })}

            {isAbnormal(selected) && (
              <div style={{ marginTop: 12, padding: '8px 12px', background: '#fff1f1', borderRadius: 7, fontSize: 12, color: '#dc2626', fontWeight: 500 }}>
                Bu nəticə normal aralıqdan kənardır.
              </div>
            )}

            {selected.notes && (
              <div style={{ marginTop: 12, padding: '10px 12px', background: '#f8fafc', borderRadius: 8, fontSize: 13, color: '#475569', lineHeight: 1.55 }}>
                <div style={{ fontWeight: 600, color: '#374151', marginBottom: 4, fontSize: 12 }}>Qeyd</div>
                {selected.notes}
              </div>
            )}
          </div>
        </Modal>
      )}
    </DoctorLayout>
  )
}
