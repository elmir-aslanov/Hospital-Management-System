import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../api/axios'

const SOURCE_META = {
  appointment:  { color: '#00848e', bg: '#e0f7fa' },
  lab:          { color: '#9333ea', bg: '#f5f3ff' },
  ehr:          { color: '#0369a1', bg: '#e0f2fe' },
  prescription: { color: '#16a34a', bg: '#f0fdf4' },
  billing:      { color: '#ca8a04', bg: '#fefce8' },
  document:     { color: '#475569', bg: '#f1f5f9' },
}

const fmtDateTime = (d) => {
  if (!d) return '—'
  const date = new Date(d)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function PatientTimeline({ patientId, fixedSource = '' }) {
  const { t } = useTranslation()
  const [items, setItems]     = useState([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(false)
  const [source, setSource]   = useState(fixedSource)
  const [expandedId, setExpandedId] = useState(null)
  const limit = 20

  useEffect(() => {
    if (!patientId) return
    let active = true
    api.get(`/patients/${patientId}/timeline`, { params: { source: source || undefined, page, limit } })
      .then(({ data }) => {
        if (!active) return
        setItems(data.data?.items || [])
        setTotal(data.data?.total || 0)
        setError(false)
      })
      .catch(() => {
        if (active) setError(true)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [patientId, source, page])

  const sourceLabel = (key) => ({
    appointment: t('timeline.appointment'),
    lab: t('timeline.labResult'),
    ehr: t('timeline.medicalNote'),
    prescription: t('timeline.prescription'),
    billing: t('timeline.payment'),
    document: t('timeline.document'),
  }[key] || key)

  const pages = Math.max(1, Math.ceil(total / limit))

  return (
    <div>
      {!fixedSource && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
        <FilterChip active={!source} label={t('timeline.filterAll')} onClick={() => { setLoading(true); setError(false); setSource(''); setPage(1) }} />
        {Object.keys(SOURCE_META).map((key) => (
          <FilterChip key={key} active={source === key} label={sourceLabel(key)} onClick={() => { setLoading(true); setError(false); setSource(key); setPage(1) }} />
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <div style={{ width: 28, height: 28, border: '3px solid #e2e8f0', borderTopColor: '#00848e', borderRadius: '50%', animation: 'timeline-spin 0.8s linear infinite' }} />
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: 32, color: '#ef4444', fontSize: 13 }}>{t('timeline.loadError')}</div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8', fontSize: 13 }}>{t('timeline.empty')}</div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {items.map((item) => {
              const meta = SOURCE_META[item.source] || SOURCE_META.document
              const expanded = expandedId === item.id
              return (
                <div key={item.id} style={{ border: '1px solid #f1f5f9', borderRadius: 10, padding: '10px 12px', background: 'white' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: meta.color, marginTop: 5, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: meta.color, background: meta.bg, borderRadius: 6, padding: '2px 8px', whiteSpace: 'nowrap' }}>
                          {sourceLabel(item.source)}
                        </span>
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>{fmtDateTime(item.date)}</span>
                        {item.status && (
                          <span style={{ fontSize: 10, fontWeight: 600, color: '#475569', background: '#f8fafc', borderRadius: 10, padding: '2px 8px' }}>{item.status}</span>
                        )}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0f1b2d', marginTop: 4, overflowWrap: 'anywhere' }}>{item.title || '—'}</div>
                      {(item.doctorName || item.department) && (
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                          {[item.doctorName, item.department].filter(Boolean).join(' · ')}
                        </div>
                      )}
                      {item.detail && (
                        <button
                          onClick={() => setExpandedId(expanded ? null : item.id)}
                          style={{ marginTop: 6, background: 'none', border: 'none', color: '#00848e', fontSize: 11, fontWeight: 600, cursor: 'pointer', padding: 0 }}
                        >
                          {t('timeline.viewDetails')}
                        </button>
                      )}
                      {expanded && item.detail && (
                        <div style={{ marginTop: 6, fontSize: 12, color: '#334155', background: '#f8fafc', borderRadius: 8, padding: '8px 10px', overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}>
                          {item.detail.description || item.detail.summary || '—'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 14 }}>
              {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => { setLoading(true); setError(false); setPage(p) }}
                  style={{ width: 28, height: 28, borderRadius: 7, border: p === page ? 'none' : '1px solid #e2e8f0', background: p === page ? '#00848e' : 'white', color: p === page ? 'white' : '#475569', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                >{p}</button>
              ))}
            </div>
          )}
        </>
      )}

      <style>{`@keyframes timeline-spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

function FilterChip({ active, label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{ padding: '5px 12px', borderRadius: 20, border: '1px solid', borderColor: active ? '#00848e' : '#e2e8f0', background: active ? '#00848e' : 'white', color: active ? 'white' : '#475569', fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
    >
      {label}
    </button>
  )
}
