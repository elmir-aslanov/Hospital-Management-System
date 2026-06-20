import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../api/axios'
import { getErrorMessage, showSuccess, showError } from '../../utils/alert'

const SLOT_DURATIONS = [15, 20, 30, 45, 60]
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0] // Monday-first display, matches getUTCDay()/getDay() values

const defaultDay = (dayOfWeek) => ({
  dayOfWeek,
  startTime: '09:00',
  endTime: dayOfWeek === 6 ? '14:00' : '18:00',
  breakStartTime: '',
  breakEndTime: '',
  slotDuration: 30,
  isOff: dayOfWeek === 0,
})

const lbl = { fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }
const inp = { width: '100%', border: '1px solid #e2e8f0', borderRadius: 9, padding: '7px 10px', fontSize: 13, color: '#334155', outline: 'none', background: 'white', boxSizing: 'border-box' }

export default function DoctorScheduleModal({ doctorId, doctorName, onClose }) {
  const { t } = useTranslation()
  const [days, setDays] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [wasConfigured, setWasConfigured] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true); setLoadError(false)
    api.get(`/doctors/${doctorId}/schedule`)
      .then(({ data }) => {
        const existing = data.data || []
        if (existing.length === 0) {
          setWasConfigured(false)
          setDays(DAY_ORDER.map(defaultDay))
        } else {
          setWasConfigured(true)
          const byDay = new Map(existing.map(d => [d.dayOfWeek, d]))
          setDays(DAY_ORDER.map(d => byDay.get(d) || defaultDay(d)))
        }
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false))
  }, [doctorId])

  const patchDay = (dayOfWeek, patch) => {
    setDays(prev => prev.map(d => d.dayOfWeek === dayOfWeek ? { ...d, ...patch } : d))
  }

  const validate = () => {
    if (!days.some(d => !d.isOff)) return t('doctorSchedule.atLeastOneDay')
    for (const d of days) {
      if (d.isOff) continue
      if (d.endTime <= d.startTime) return t('doctorSchedule.endAfterStart')
      const hasBreak = d.breakStartTime && d.breakEndTime
      if (hasBreak) {
        if (d.breakEndTime <= d.breakStartTime) return t('doctorSchedule.breakWithinHours')
        if (d.breakStartTime < d.startTime || d.breakEndTime > d.endTime) return t('doctorSchedule.breakWithinHours')
      }
    }
    return ''
  }

  const handleSave = async () => {
    const validationError = validate()
    if (validationError) { setError(validationError); return }
    setSaving(true); setError('')
    try {
      await api.put(`/doctors/${doctorId}/schedule`, days)
      showSuccess(t('doctorSchedule.saved'))
      onClose()
    } catch (e) {
      const msg = getErrorMessage(e, t('doctorSchedule.loadError'))
      setError(msg)
      showError(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 210, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background: 'white', borderRadius: 16, width: 640, maxWidth: '95vw', maxHeight: '90vh', overflow: 'auto', padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f1b2d' }}>{t('doctorSchedule.title')}</h2>
            {doctorName && <p style={{ margin: '3px 0 0', fontSize: 12, color: '#94a3b8' }}>{doctorName}</p>}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 20, lineHeight: 1 }}>×</button>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', color: '#ef4444', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 14 }}>{error}</div>
        )}

        {!wasConfigured && !loading && !loadError && (
          <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', color: '#9a3412', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 14 }}>
            ⚠️ {t('doctorSchedule.scheduleNotConfigured')}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 50 }}>
            <div style={{ width: 30, height: 30, border: '3px solid #e2e8f0', borderTopColor: '#00848e', borderRadius: '50%', animation: 'sched-spin 0.8s linear infinite' }} />
          </div>
        ) : loadError ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#ef4444', fontSize: 13 }}>{t('doctorSchedule.loadError')}</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {days.map(d => (
              <div key={d.dayOfWeek} style={{ border: '1px solid #f1f5f9', borderRadius: 12, padding: '12px 14px', background: d.isOff ? '#f8fafc' : 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: d.isOff ? 0 : 10 }}>
                  <input
                    type="checkbox"
                    id={`day-${d.dayOfWeek}`}
                    checked={!d.isOff}
                    onChange={e => patchDay(d.dayOfWeek, { isOff: !e.target.checked })}
                    style={{ width: 16, height: 16, accentColor: '#00848e', flexShrink: 0 }}
                  />
                  <label htmlFor={`day-${d.dayOfWeek}`} style={{ fontSize: 13, fontWeight: 700, color: '#0f1b2d', cursor: 'pointer', minWidth: 130 }}>
                    {t(`doctorSchedule.days.${d.dayOfWeek}`)}
                  </label>
                  {!d.isOff && (
                    <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 600, marginLeft: 'auto' }}>{t('doctorSchedule.workingDay')}</span>
                  )}
                </div>

                {!d.isOff && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                    <div>
                      <label style={lbl}>{t('doctorSchedule.startTime')}</label>
                      <input type="time" value={d.startTime} onChange={e => patchDay(d.dayOfWeek, { startTime: e.target.value })} style={inp} />
                    </div>
                    <div>
                      <label style={lbl}>{t('doctorSchedule.endTime')}</label>
                      <input type="time" value={d.endTime} onChange={e => patchDay(d.dayOfWeek, { endTime: e.target.value })} style={inp} />
                    </div>
                    <div>
                      <label style={lbl}>{t('doctorSchedule.breakStart')}</label>
                      <input type="time" value={d.breakStartTime} onChange={e => patchDay(d.dayOfWeek, { breakStartTime: e.target.value })} style={inp} />
                    </div>
                    <div>
                      <label style={lbl}>{t('doctorSchedule.breakEnd')}</label>
                      <input type="time" value={d.breakEndTime} onChange={e => patchDay(d.dayOfWeek, { breakEndTime: e.target.value })} style={inp} />
                    </div>
                    <div>
                      <label style={lbl}>{t('doctorSchedule.slotDuration')}</label>
                      <select value={d.slotDuration} onChange={e => patchDay(d.dayOfWeek, { slotDuration: Number(e.target.value) })} style={{ ...inp, cursor: 'pointer' }}>
                        {SLOT_DURATIONS.map(m => <option key={m} value={m}>{m} dəq</option>)}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', border: '1px solid #e2e8f0', borderRadius: 9, background: 'white', fontSize: 13, cursor: 'pointer', color: '#475569' }}>
            Ləğv et
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading || loadError}
            style={{ padding: '10px 24px', border: 'none', borderRadius: 9, background: '#00848e', color: 'white', fontSize: 13, fontWeight: 600, cursor: (saving || loading || loadError) ? 'not-allowed' : 'pointer', opacity: (saving || loading || loadError) ? 0.7 : 1 }}
          >
            {saving ? t('doctorSchedule.saving') : t('doctorSchedule.save')}
          </button>
        </div>
      </div>

      <style>{`@keyframes sched-spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
