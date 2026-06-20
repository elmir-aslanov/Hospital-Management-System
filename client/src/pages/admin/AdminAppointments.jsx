import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AdminLayout from '../../components/admin/AdminLayout'
import { exportToCsv } from '../../utils/exportCsv'
import api from '../../api/axios'

// Backend enum is the single source of truth (server/config/constants.js APPOINTMENT_STATUS).
// Keep this list in sync — values here must never include statuses the backend doesn't issue.
const STATUS_COLORS = {
  scheduled:   { bg: '#f0fafb', color: '#00848e' },
  waiting:     { bg: '#fff7ed', color: '#ea580c' },
  in_progress: { bg: '#eff6ff', color: '#2563eb' },
  completed:   { bg: '#e0f2fe', color: '#0369a1' },
  cancelled:   { bg: '#fef2f2', color: '#dc2626' },
  missed:      { bg: '#f8fafc', color: '#94a3b8' },
}

// Mirrors server/config/constants.js APPOINTMENT_TRANSITIONS so the dropdown can
// disable options the backend would reject anyway (backend stays the real guard).
const APPOINTMENT_TRANSITIONS = {
  scheduled:   ['waiting', 'cancelled', 'missed'],
  waiting:     ['in_progress', 'cancelled'],
  in_progress: ['completed'],
  completed:   [],
  cancelled:   [],
  missed:      [],
}

const STATUS_ORDER = ['scheduled', 'waiting', 'in_progress', 'completed', 'cancelled', 'missed']

const inputStyle = {
  width: '100%', border: '1px solid #e2e8f0', borderRadius: 9,
  padding: '9px 12px', fontSize: 13, color: '#334155',
  outline: 'none', boxSizing: 'border-box', background: 'white',
}

const labelStyle = { fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }
const toLocalDateString = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

export default function AdminAppointments() {
  const { t } = useTranslation()
  const statusLabel = (status) => t(`adminAppointments.status.${status}`, status)
  const [appts, setAppts]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [statusFilter, setStatus] = useState('all')
  const [dateFilter, setDate]     = useState('')
  const [modal, setModal]         = useState(false)
  const [saving, setSaving]       = useState(false)
  const [patchId, setPatchId]     = useState(null)
  const [rescheduleModal,  setRescheduleModal]  = useState(false)
  const [rescheduleAppt,   setRescheduleAppt]   = useState(null)
  const [rescheduleDate,   setRescheduleDate]   = useState('')
  const [rescheduleStart,  setRescheduleStart]  = useState('')
  const [rescheduleEnd,    setRescheduleEnd]    = useState('')
  const [rescheduleErr,    setRescheduleErr]    = useState('')
  const [rescheduleSaving, setRescheduleSaving] = useState(false)
  const [view,      setView]      = useState('table')
  const [calMonth,  setCalMonth]  = useState(new Date())
  const [searchParams]            = useSearchParams()

  /* ── modal form state ── */
  const [patientSearch,   setPatientSearch]   = useState('')
  const [patientResults,  setPatientResults]  = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [doctors,         setDoctors]         = useState([])
  const [selectedDoctor,  setSelectedDoctor]  = useState('')
  const [apptDate,        setApptDate]        = useState('')
  const [apptTime,        setApptTime]        = useState('')
  const [startTime,       setStartTime]       = useState('')
  const [endTime,         setEndTime]         = useState('')
  const [note,            setNote]            = useState('')
  const [formError,       setFormError]       = useState('')
  const [adminSlots,      setAdminSlots]      = useState([])
  const searchTimer = useRef(null)

  const load = () => {
    setLoading(true)
    api.get('/appointments?limit=50')
      .then(({ data: d }) => {
        const list = Array.isArray(d.data) ? d.data
        : Array.isArray(d.data?.appointments) ? d.data.appointments
        : Array.isArray(d) ? d
        : d.appointments || d.result || []
        setAppts(list)
      })
      .catch(() => setAppts([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  /* open modal if ?new=true on mount */
  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      openModal()
    }
  }, [])

  const openModal = () => {
    setPatientSearch('')
    setPatientResults([])
    setSelectedPatient(null)
    setSelectedDoctor('')
    setApptDate('')
    setApptTime('')
    setStartTime('')
    setEndTime('')
    setAdminSlots([])
    setNote('')
    setFormError('')
    setModal(true)
    /* fetch doctors */
    api.get('/doctors?limit=200')
      .then(({ data: d }) => {
        const list = d.data?.doctors || d.doctors || []
        setDoctors(Array.isArray(list) ? list : [])
      })
      .catch(() => setDoctors([]))
  }

  const closeModal = () => { setModal(false) }

  /* patient search with debounce */
  const handlePatientSearch = (val) => {
    setPatientSearch(val)
    setSelectedPatient(null)
    clearTimeout(searchTimer.current)
    if (!val.trim()) { setPatientResults([]); return }
    searchTimer.current = setTimeout(() => {
      api.get('/patients/search', { params: { q: val } })
        .then(({ data: d }) => {
          const list = Array.isArray(d.data) ? d.data : d.data?.patients || d.patients || []
          setPatientResults(Array.isArray(list) ? list.slice(0, 6) : [])
        })
        .catch(() => setPatientResults([]))
    }, 350)
  }

  const selectPatient = (p) => {
    setSelectedPatient(p)
    const name = p.userId?.fullName || p.fullName || p.name || ''
    setPatientSearch(name)
    setPatientResults([])
  }

  useEffect(() => {
    if (!selectedDoctor || !apptDate) return
    api.get('/appointments/slots', { params: { doctorId: selectedDoctor, date: apptDate } })
      .then(({ data }) => setAdminSlots(data.data?.slots || []))
      .catch(() => setAdminSlots([]))
  }, [selectedDoctor, apptDate])

  const handleSave = async () => {
    if (!selectedPatient || !selectedDoctor || !apptDate || (!apptTime && !startTime)) {
      setFormError(t('adminAppointments.requiredFieldsError'))
      return
    }
    const selectedSlot = adminSlots.find(slot => slot.time === (startTime || apptTime))
    if (selectedSlot && !selectedSlot.available) {
      setFormError(t('appointmentConflict.doctorBusy'))
      return
    }
    setFormError('')
    setSaving(true)
    try {
      await api.post('/appointments', {
          patientId: selectedPatient._id,
          doctorId:  selectedDoctor,
          date:      apptDate,
          startTime: startTime || apptTime,
          endTime:   endTime   || (() => {
            if (!apptTime) return '';
            const [h, m] = apptTime.split(':').map(Number);
            const em = m + 30;
            return `${String(em >= 60 ? h + 1 : h).padStart(2,'0')}:${String(em % 60).padStart(2,'0')}`;
          })(),
          reason:    note || t('adminAppointments.defaultReason'),
      })
      closeModal()
      load()
    } catch (error) {
      setFormError(error.response?.status === 409
        ? t('appointmentConflict.doctorBusy')
        : error.response?.data?.message || t('adminAppointments.serverError'))
    } finally {
      setSaving(false)
    }
  }

  const handleStatusPatch = async (id, status) => {
    setPatchId(id)
    try {
      await api.patch(`/appointments/${id}/status`, { status })
      setAppts(prev => prev.map(a => a._id === id ? { ...a, status } : a))
    } catch {
      // Keep current UI state when the backend rejects an invalid transition.
    }
    finally { setPatchId(null) }
  }

  const filtered = appts.filter(a => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false
    if (dateFilter) {
      const d = a.date ? new Date(a.date).toISOString().slice(0, 10) : a.appointmentDate?.slice(0, 10)
      if (d !== dateFilter) return false
    }
    return true
  })

  const getName   = (a) => {
    const p = a.patientId
    if (!p) return '—'
    return p.userId?.fullName || p.fullName || '—'
  }
  const getDoctor = (a) => {
    const d = a.doctorId
    if (!d) return '—'
    const u = d.userId
    if (u?.fullName?.trim()) return u.fullName.trim()
    const ns = ((u?.name || '') + ' ' + (u?.surname || '')).trim()
    if (ns) return ns
    return d.name || d.fullName || '—'
  }
  const getDate   = (a) => { const raw = a.date || a.appointmentDate || a.createdAt; if (!raw) return '—'; return new Date(raw).toLocaleDateString('az-AZ') }
  const getTime   = (a) => {
    if (a.startTime && a.endTime) return `${a.startTime}–${a.endTime}`
    return a.startTime || a.time || a.timeSlot || '—'
  }
  const todayStr  = toLocalDateString()

  const openReschedule = (appt) => {
    setRescheduleAppt(appt)
    const d = appt.date ? new Date(appt.date).toISOString().split('T')[0] : ''
    setRescheduleDate(d)
    setRescheduleStart(appt.startTime || '')
    setRescheduleEnd(appt.endTime || '')
    setRescheduleErr('')
    setRescheduleModal(true)
  }

  const handleReschedule = async () => {
    if (!rescheduleDate || !rescheduleStart || !rescheduleEnd) {
      setRescheduleErr(t('adminAppointments.rescheduleRequiredError'))
      return
    }
    if (rescheduleStart >= rescheduleEnd) {
      setRescheduleErr(t('adminAppointments.endAfterStartError'))
      return
    }
    setRescheduleSaving(true); setRescheduleErr('')
    try {
      await api.patch(`/appointments/${rescheduleAppt._id}/reschedule`, {
        date: rescheduleDate,
        startTime: rescheduleStart,
        endTime: rescheduleEnd,
      })
      setAppts(prev => prev.map(a => a._id === rescheduleAppt._id
        ? { ...a, date: rescheduleDate, startTime: rescheduleStart, endTime: rescheduleEnd, status: 'scheduled' }
        : a
      ))
      setRescheduleModal(false)
    } catch (error) {
      setRescheduleErr(error.response?.status === 409
        ? t('appointmentConflict.doctorBusy')
        : error.response?.data?.message || t('adminAppointments.serverError'))
    }
    finally { setRescheduleSaving(false) }
  }

  const getDaysInMonth     = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()

  const getApptsByDate = (dateStr) =>
    appts.filter(a => a.date && new Date(a.date).toDateString() === new Date(dateStr).toDateString())

  const calDays = () => {
    const daysInMonth = getDaysInMonth(calMonth)
    const firstDay    = (getFirstDayOfMonth(calMonth) + 6) % 7 // Mon=0
    const days = []
    for (let i = 0; i < firstDay; i++) days.push(null)
    for (let i = 1; i <= daysInMonth; i++) days.push(i)
    return days
  }

  return (
    <AdminLayout activePage="appointments">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f1b2d' }}>{t('adminLayout.nav.appointments')}</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>{t('adminAppointments.showingCount', { count: filtered.length })}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', borderRadius: 9, padding: 3 }}>
            <button onClick={() => setView('table')}
              style={{ padding: '7px 14px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center',
                background: view === 'table' ? 'white' : 'transparent',
                color: view === 'table' ? '#00848e' : '#64748b',
                boxShadow: view === 'table' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              }}>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ marginRight: 5 }}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              {t('adminAppointments.tableView')}
            </button>
            <button onClick={() => setView('calendar')}
              style={{ padding: '7px 14px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center',
                background: view === 'calendar' ? 'white' : 'transparent',
                color: view === 'calendar' ? '#00848e' : '#64748b',
                boxShadow: view === 'calendar' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              }}>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ marginRight: 5 }}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              {t('adminAppointments.calendarView')}
            </button>
          </div>
          <button onClick={openModal} style={{ background: '#00848e', color: 'white', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            {t('adminAppointments.newAppointment')}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['all', ...STATUS_ORDER].map((v) => (
            <button key={v} onClick={() => setStatus(v)} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid', fontSize: 12, fontWeight: 600, cursor: 'pointer', borderColor: statusFilter === v ? '#00848e' : '#e2e8f0', background: statusFilter === v ? '#00848e' : 'white', color: statusFilter === v ? 'white' : '#475569' }}>
              {v === 'all' ? t('adminAppointments.status.all', 'Hamısı') : statusLabel(v)}
            </button>
          ))}
        </div>
        <input type="date" value={dateFilter} onChange={e => setDate(e.target.value)} style={{ border: '1px solid #e2e8f0', borderRadius: 9, padding: '6px 12px', fontSize: 13, color: '#334155', outline: 'none', background: 'white' }} />
        {dateFilter && <button onClick={() => setDate('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 12 }}>{t('adminAppointments.clear')}</button>}
        <button
          onClick={() => exportToCsv('randevular.csv',
            appts.map(a => [
              getName(a),
              getDoctor(a),
              a.date ? new Date(a.date).toLocaleDateString('az-AZ') : '',
              getTime(a),
              a.status || '',
              a.reason || '',
            ]),
            [t('adminAppointments.patient'), t('adminAppointments.doctor'), t('adminAppointments.date'), t('adminAppointments.time'), t('adminAppointments.statusLabel'), t('adminAppointments.reason')]
          )}
          style={{ padding: '9px 16px', border: '1px solid #e2e8f0', borderRadius: 9, background: 'white', fontSize: 13, fontWeight: 600, color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          CSV
        </button>
      </div>

      {/* Table view */}
      {view === 'table' && (
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid #f1f5f9', overflow: 'auto' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#00848e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8', fontSize: 14 }}>{t('adminAppointments.noResults')}</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  {[t('adminAppointments.patient'), t('adminAppointments.doctor'), t('adminAppointments.date'), t('adminAppointments.time'), t('adminAppointments.statusLabel'), t('adminAppointments.actions')].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => {
                  const sc = STATUS_COLORS[a.status] || STATUS_COLORS.scheduled
                  const patching = patchId === a._id
                  const allowedNext = APPOINTMENT_TRANSITIONS[a.status] || []
                  return (
                    <tr key={a._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '12px 16px' }}><div style={{ fontSize: 13, fontWeight: 600, color: '#0f1b2d' }}>{getName(a)}</div></td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#475569' }}>{getDoctor(a)}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#475569' }}>{getDate(a)}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#475569' }}>{getTime(a)}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          title={a.checkedInAt ? `${t('checkIn.checkedInAt')}: ${new Date(a.checkedInAt).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })}` : undefined}
                          style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: sc.bg, color: sc.color }}
                        >
                          {statusLabel(a.status)}{a.queueNumber ? ` · №${a.queueNumber}` : ''}
                        </span>
                        {a.status === 'scheduled' && (
                          <span
                            title={a.reminder24hSentAt || a.reminder2hSentAt ? t('appointmentReminders.sent') : t('appointmentReminders.pending')}
                            style={{ marginLeft: 6, fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 20, background: (a.reminder24hSentAt || a.reminder2hSentAt) ? '#f0fdf4' : '#f8fafc', color: (a.reminder24hSentAt || a.reminder2hSentAt) ? '#16a34a' : '#94a3b8' }}
                          >
                            🔔 {(a.reminder24hSentAt || a.reminder2hSentAt) ? t('appointmentReminders.sent') : t('appointmentReminders.pending')}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', display: 'flex', gap: 6, alignItems: 'center' }}>
                        <select
                          disabled={patching || allowedNext.length === 0}
                          value={a.status || 'scheduled'}
                          onChange={e => handleStatusPatch(a._id, e.target.value)}
                          title={allowedNext.length === 0 ? t('adminAppointments.status.noTransition', 'Bu statusdan dəyişiklik mümkün deyil') : undefined}
                          style={{ border: '1px solid #e2e8f0', borderRadius: 7, padding: '5px 8px', fontSize: 12, color: '#334155', outline: 'none', background: 'white', cursor: (patching || allowedNext.length === 0) ? 'not-allowed' : 'pointer', opacity: (patching || allowedNext.length === 0) ? 0.5 : 1 }}
                        >
                          <option value={a.status}>{statusLabel(a.status)}</option>
                          {STATUS_ORDER.filter(s => allowedNext.includes(s)).map(s => (
                            <option key={s} value={s}>{statusLabel(s)}</option>
                          ))}
                        </select>
                        {!['completed','cancelled','missed'].includes(a.status) && (
                          <button
                            onClick={() => openReschedule(a)}
                            title={t('adminAppointments.changeTime')}
                            style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid #e2e8f0', background: 'white', fontSize: 11, fontWeight: 600, color: '#475569', cursor: 'pointer', whiteSpace: 'nowrap' }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = '#00848e'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                          >
                            📅 {t('adminAppointments.change')}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Calendar view */}
      {view === 'calendar' && (
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid #f1f5f9', overflow: 'hidden' }}>

          {/* Month navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
            <button onClick={() => setCalMonth(m => new Date(m.getFullYear(), m.getMonth() - 1))}
              style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#0f1b2d' }}>
              {calMonth.toLocaleDateString('az-AZ', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={() => setCalMonth(m => new Date(m.getFullYear(), m.getMonth() + 1))}
              style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', borderBottom: '1px solid #f1f5f9' }}>
            {['mon','tue','wed','thu','fri','sat','sun'].map(d => (
              <div key={d} style={{ padding: '10px 0', textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t(`adminAppointments.weekdays.${d}`)}</div>
            ))}
          </div>

          {/* Days grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 1, background: '#f8fafc' }}>
            {calDays().map((day, i) => {
              const dateStr  = day ? new Date(calMonth.getFullYear(), calMonth.getMonth(), day).toISOString() : null
              const dayAppts = day ? getApptsByDate(dateStr) : []
              const isToday  = day && new Date().toDateString() === new Date(calMonth.getFullYear(), calMonth.getMonth(), day).toDateString()
              return (
                <div key={i} style={{ background: 'white', minHeight: 90, padding: '8px 6px' }}>
                  {day && (
                    <>
                      <div style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4, background: isToday ? '#00848e' : 'transparent', color: isToday ? 'white' : '#374151', fontSize: 13, fontWeight: isToday ? 700 : 400 }}>
                        {day}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {dayAppts.slice(0, 3).map((a, j) => (
                          <div key={j} style={{ fontSize: 10, padding: '2px 5px', borderRadius: 4, background: '#e0f7fa', color: '#00848e', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {a.startTime || '—'} {getName(a).split(' ')[0]}
                          </div>
                        ))}
                        {dayAppts.length > 3 && (
                          <div style={{ fontSize: 10, color: '#94a3b8', paddingLeft: 5 }}>{t('adminAppointments.moreCount', { count: dayAppts.length - 3 })}</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* New Appointment Modal */}
      {modal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div style={{ background: 'white', borderRadius: 16, width: 500, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f1b2d' }}>{t('adminAppointments.newAppointment')}</h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 20 }}>×</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

              {/* Patient search */}
              <div style={{ gridColumn: '1/-1', position: 'relative' }}>
                <label style={labelStyle}>{t('adminAppointments.patient')} <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  value={patientSearch}
                  onChange={e => handlePatientSearch(e.target.value)}
                  placeholder={t('adminAppointments.patientSearchPlaceholder')}
                  style={{ ...inputStyle, borderColor: selectedPatient ? '#00848e' : '#e2e8f0' }}
                />
                {selectedPatient && (
                  <div style={{ fontSize: 11, color: '#00848e', marginTop: 4 }}>
                    ✓ {t('adminAppointments.selected')}: {selectedPatient.userId?.fullName || selectedPatient.fullName || selectedPatient.name}
                  </div>
                )}
                {patientResults.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #e2e8f0', borderRadius: 9, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 100, maxHeight: 200, overflowY: 'auto' }}>
                    {patientResults.map(p => {
                      const name = p.userId?.fullName || p.fullName || p.name || '—'
                      const pid  = p.patientId || p._id
                      return (
                        <div
                          key={p._id}
                          onClick={() => selectPatient(p)}
                          style={{ padding: '10px 14px', cursor: 'pointer', fontSize: 13, borderBottom: '1px solid #f8fafc' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f0fafb'}
                          onMouseLeave={e => e.currentTarget.style.background = 'white'}
                        >
                          <div style={{ fontWeight: 600, color: '#0f1b2d' }}>{name}</div>
                          {pid && <div style={{ fontSize: 11, color: '#94a3b8' }}>{pid}</div>}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Doctor select */}
              <div style={{ gridColumn: '1/-1' }}>
                <label style={labelStyle}>{t('adminAppointments.doctor')} <span style={{ color: '#ef4444' }}>*</span></label>
                <select
                  value={selectedDoctor}
                  onChange={e => {
                    setSelectedDoctor(e.target.value)
                    setStartTime('')
                    setApptTime('')
                    setEndTime('')
                    setAdminSlots([])
                  }}
                  style={{ ...inputStyle, height: 38, cursor: 'pointer' }}
                >
                  <option value="">— {t('labAdmin.selectDoctorPlaceholder')} —</option>
                  {doctors.map(d => {
                    const u = d.userId
                    const name = d.userId?.fullName || d.fullName || (u?.fullName?.trim()) || ((u?.name || '') + ' ' + (u?.surname || '')).trim() || d.name || '—'
                    return <option key={d._id} value={d._id}>{name}{d.department ? ` (${d.department})` : ''}</option>
                  })}
                </select>
              </div>

              {/* Date */}
              <div>
                <label style={labelStyle}>{t('adminAppointments.date')} <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="date"
                  value={apptDate}
                  min={todayStr}
                  onChange={e => {
                    setApptDate(e.target.value)
                    setStartTime('')
                    setApptTime('')
                    setEndTime('')
                    setAdminSlots([])
                  }}
                  style={inputStyle}
                />
              </div>

              {/* Start time */}
              <div>
                <label style={labelStyle}>{t('adminAppointments.startTime')} <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="time"
                  value={startTime || apptTime}
                  onChange={e => { setStartTime(e.target.value); setApptTime(e.target.value) }}
                  style={{
                    ...inputStyle,
                    borderColor: adminSlots.some(slot => slot.time === (startTime || apptTime) && !slot.available)
                      ? '#dc2626'
                      : '#e2e8f0',
                  }}
                />
                {adminSlots.some(slot => slot.time === (startTime || apptTime) && !slot.available) && (
                  <div style={{ color: '#dc2626', fontSize: 11, marginTop: 5 }}>
                    {t('appointmentConflict.doctorBusy')}
                  </div>
                )}
              </div>

              {/* End time */}
              <div>
                <label style={labelStyle}>{t('adminAppointments.endTime')} <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  style={inputStyle}
                />
              </div>

              {/* Reason */}
              <div style={{ gridColumn: '1/-1' }}>
                <label style={labelStyle}>{t('adminAppointments.reasonLabel')}</label>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  rows={3}
                  style={{ ...inputStyle, height: 'auto', padding: '9px 12px', resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>
            </div>

            {formError && (
              <p style={{ color: '#dc2626', fontSize: 13, margin: '12px 0 0' }}>{formError}</p>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
              <button onClick={closeModal} style={{ padding: '10px 20px', border: '1px solid #e2e8f0', borderRadius: 9, background: 'white', fontSize: 13, cursor: 'pointer', color: '#475569' }}>{t('labResult.cancel')}</button>
              <button onClick={handleSave} disabled={saving} style={{ padding: '10px 24px', border: 'none', borderRadius: 9, background: '#00848e', color: 'white', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? t('labResult.saving') : t('adminAppointments.createAction')}
              </button>
            </div>
          </div>
        </div>
      )}

      {rescheduleModal && rescheduleAppt && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget) setRescheduleModal(false) }}
        >
          <div style={{ background: 'white', borderRadius: 16, width: 420, maxWidth: '100%', padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f1b2d' }}>{t('adminAppointments.changeTimeTitle')}</h2>
                <p style={{ margin: '3px 0 0', fontSize: 12, color: '#94a3b8' }}>
                  {getName(rescheduleAppt)} — {getDoctor(rescheduleAppt)}
                </p>
              </div>
              <button onClick={() => setRescheduleModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 20 }}>×</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14 }}>
              <div>
                <label style={labelStyle}>{t('adminAppointments.newDate')} <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="date"
                  value={rescheduleDate}
                  min={todayStr}
                  onChange={e => setRescheduleDate(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>{t('adminAppointments.startTime')} <span style={{ color: '#ef4444' }}>*</span></label>
                  <input type="time" value={rescheduleStart} onChange={e => setRescheduleStart(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>{t('adminAppointments.endTime')} <span style={{ color: '#ef4444' }}>*</span></label>
                  <input type="time" value={rescheduleEnd} onChange={e => setRescheduleEnd(e.target.value)} style={inputStyle} />
                </div>
              </div>
            </div>

            {rescheduleErr && (
              <div style={{ background: '#fef2f2', color: '#dc2626', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginTop: 14 }}>
                {rescheduleErr}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
              <button onClick={() => setRescheduleModal(false)} style={{ padding: '10px 20px', border: '1px solid #e2e8f0', borderRadius: 9, background: 'white', fontSize: 13, cursor: 'pointer', color: '#475569' }}>
                {t('labResult.cancel')}
              </button>
              <button onClick={handleReschedule} disabled={rescheduleSaving} style={{ padding: '10px 24px', border: 'none', borderRadius: 9, background: '#00848e', color: 'white', fontSize: 13, fontWeight: 600, cursor: rescheduleSaving ? 'not-allowed' : 'pointer', opacity: rescheduleSaving ? 0.7 : 1 }}>
                {rescheduleSaving ? t('labResult.saving') : t('adminAppointments.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </AdminLayout>
  )
}
