import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../../api/axios'
import { fadeUp } from '../../utils/animations'

const TEAL   = '#1D8B95'
const NAVY   = '#0B1D34'
const BG     = '#EAF7FB'
const CARD   = '#FFFFFF'
const BORDER = '#E2E8F0'
const MUTED  = '#64748B'
const FONT   = "'Source Sans 3', sans-serif"

const BACKEND = import.meta.env.VITE_API_URL?.replace('/api/v1', '') ?? 'http://localhost:5000'

function resolveImage(src) {
  if (!src) return null
  if (typeof src === 'object') src = src.url || src.secure_url || src.path || ''
  if (!src) return null
  if (src.startsWith('http')) return src
  if (src.startsWith('/')) return `${BACKEND}${src}`
  return src
}

function getInitials(name) {
  return (name || '').split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'DR'
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

const TIME_GROUPS = [
  { key: 'seher',   label: 'Səhər',   test: (t) => t < '12:00' },
  { key: 'gunorta', label: 'Günorta', test: (t) => t >= '12:00' && t < '17:00' },
  { key: 'axsam',   label: 'Axşam',   test: (t) => t >= '17:00' },
]

const slotBtnStyle = (available, selected) => ({
  padding: '9px 16px',
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 700,
  fontFamily: FONT,
  cursor: available ? 'pointer' : 'not-allowed',
  transition: 'all 0.15s',
  border: selected ? `1.5px solid ${TEAL}` : available ? `1.5px solid ${TEAL}` : '1.5px solid #E2E8F0',
  background: selected ? TEAL : available ? '#FFFFFF' : '#F1F5F9',
  color: selected ? '#FFFFFF' : available ? TEAL : '#94A3B8',
})

// ─────────────────────────────────────────────────────────────────────────────
// Tab 4 — Randevu saatları (backend-driven slot picker)
// ─────────────────────────────────────────────────────────────────────────────
function AppointmentSlotsTab({ doctor, navigate }) {
  const [date,     setDate]     = useState(() => todayStr())
  const [slots,    setSlots]    = useState([])
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(false)
  const [selected, setSelected] = useState('')

  useEffect(() => {
    if (!date) return
    setLoading(true)
    setError(false)
    setSelected('')
    api.get('/appointments/slots', { params: { doctorId: doctor._id, date } })
      .then(res => {
        const data = res.data?.data
        setSlots(data && data.available !== false && Array.isArray(data.slots) ? data.slots : [])
      })
      .catch(() => { setSlots([]); setError(true) })
      .finally(() => setLoading(false))
  }, [doctor._id, date])

  const groups = TIME_GROUPS
    .map(g => ({ ...g, items: slots.filter(s => g.test(s.time)) }))
    .filter(g => g.items.length > 0)

  const goToBooking = () => {
    const qs = new URLSearchParams({ doctorId: doctor._id })
    if (doctor.department?._id) qs.set('departmentId', doctor.department._id)
    if (date) qs.set('date', date)
    if (selected) qs.set('time', selected)
    navigate(`/randevu?${qs.toString()}`)
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 8 }}>Tarix seçin</label>
        <input
          type="date"
          value={date}
          min={todayStr()}
          onChange={e => setDate(e.target.value)}
          style={{ padding: '10px 14px', borderRadius: 8, border: `1.5px solid ${BORDER}`, fontSize: 14, fontFamily: FONT, color: NAVY, colorScheme: 'light' }}
        />
      </div>

      {loading && <p style={{ fontSize: 14, color: MUTED }}>Boş saatlar yüklənir...</p>}
      {!loading && error && <p style={{ fontSize: 14, color: '#DC2626' }}>Boş saatlar yüklənmədi. Yenidən cəhd edin.</p>}
      {!loading && !error && slots.length === 0 && <p style={{ fontSize: 14, color: MUTED }}>Bu tarix üçün boş saat yoxdur.</p>}

      {!loading && !error && groups.map(g => (
        <div key={g.key} style={{ marginBottom: 18 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: NAVY, margin: '0 0 10px' }}>{g.label}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {g.items.map(s => (
              <button
                key={s.time}
                disabled={!s.available}
                onClick={() => s.available && setSelected(s.time)}
                style={slotBtnStyle(s.available, selected === s.time)}
              >
                {s.time}
              </button>
            ))}
          </div>
        </div>
      ))}

      {doctor.isAcceptingAppointments && (
        <button
          onClick={goToBooking}
          disabled={!selected}
          style={{
            marginTop: 8, padding: '13px 28px', borderRadius: 10, border: 'none',
            background: selected ? TEAL : '#CBD5E1', color: '#FFFFFF', fontSize: 14, fontWeight: 700,
            cursor: selected ? 'pointer' : 'not-allowed', fontFamily: FONT, transition: 'background 0.15s',
          }}
        >
          Bu saat üçün randevu al
        </button>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Expandable list — used for Nəşrlər / education / etc.
// ─────────────────────────────────────────────────────────────────────────────
function ExpandableList({ items, previewCount = 3 }) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? items : items.slice(0, previewCount)
  return (
    <div>
      <ul style={{ margin: 0, paddingLeft: 20 }}>
        {visible.map((item, i) => (
          <li key={i} style={{ fontSize: 15, color: '#374151', marginBottom: 10, lineHeight: 1.6 }}>{item}</li>
        ))}
      </ul>
      {items.length > previewCount && (
        <button
          onClick={() => setExpanded(v => !v)}
          style={{ marginTop: 4, padding: 0, border: 'none', background: 'none', color: TEAL, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}
        >
          {expanded ? 'Daha az göstər' : 'Hamısını görün'}
        </button>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function HekimProfilPage() {
  const { id }      = useParams()
  const navigate    = useNavigate()
  const [doctor,    setDoctor]    = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [notFound,  setNotFound]  = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [activeTab, setActiveTab] = useState('haqqinda')
  const [failedImageSrc, setFailedImageSrc] = useState('')

  useEffect(() => {
    setLoading(true)
    setNotFound(false)
    setLoadError(false)
    api.get(`/doctors/public/${id}`)
      .then(res => setDoctor(res.data?.data ?? res.data))
      .catch(err => {
        setDoctor(null)
        if (err?.response?.status === 404) setNotFound(true)
        else setLoadError(true)
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70vh', gap: 16, fontFamily: FONT }}>
      <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: TEAL, borderRadius: '50%', animation: 'hp-spin 0.8s linear infinite' }} />
      <p style={{ fontSize: 15, color: MUTED, margin: 0 }}>Həkim məlumatları yüklənir...</p>
      <style>{`@keyframes hp-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (notFound || !doctor) return (
    <div style={{ textAlign: 'center', padding: '100px 24px', fontFamily: FONT }}>
      <p style={{ fontSize: 18, color: MUTED, marginBottom: 20 }}>Həkim tapılmadı.</p>
      <button onClick={() => navigate('/hekimler')} style={{ padding: '11px 26px', background: TEAL, color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>← Həkimlərə qayıt</button>
    </div>
  )

  if (loadError) return (
    <div style={{ textAlign: 'center', padding: '100px 24px', fontFamily: FONT }}>
      <p style={{ fontSize: 18, color: '#DC2626', marginBottom: 20 }}>Həkim məlumatları yüklənmədi. Yenidən cəhd edin.</p>
      <button onClick={() => navigate('/hekimler')} style={{ padding: '11px 26px', background: TEAL, color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>← Həkimlərə qayıt</button>
    </div>
  )

  // ── Derived display data ───────────────────────────────────────────────────
  const name           = doctor.fullName || ''
  const title          = doctor.title || ''
  const department     = doctor.department?.name || ''
  const specialty      = doctor.specialty || ''
  const imageSrc       = resolveImage(doctor.image)
  const photo          = imageSrc && failedImageSrc !== imageSrc ? imageSrc : null
  const initials       = getInitials(name)
  const isAccepting    = doctor.isAcceptingAppointments !== false
  const activityAreas  = Array.isArray(doctor.activityAreas) && doctor.activityAreas.length
    ? doctor.activityAreas
    : (specialty ? [specialty] : [])
  const education      = Array.isArray(doctor.education) ? doctor.education : []
  const publications   = Array.isArray(doctor.publications) ? doctor.publications : []
  const courses        = Array.isArray(doctor.courses) ? doctor.courses : []
  const memberships    = Array.isArray(doctor.memberships) ? doctor.memberships : []
  const workingHours   = (Array.isArray(doctor.workingHours) && doctor.workingHours.length ? doctor.workingHours : null)
                      || (Array.isArray(doctor.schedule)     && doctor.schedule.length     ? doctor.schedule     : null)

  const TABS = [
    { key: 'haqqinda', label: 'Tərcümeyi-hal' },
    { key: 'nesrler',  label: 'Nəşrlər' },
    ...(memberships.length ? [{ key: 'uzvluk', label: 'Üzvlüklər' }] : []),
    { key: 'kurslar',  label: 'İştirak Etdiyi Kurslar' },
    { key: 'saatlar',  label: 'Randevu saatları' },
  ]

  const bookAppointment = () => {
    const qs = new URLSearchParams({ doctorId: doctor._id })
    if (doctor.department?._id) qs.set('departmentId', doctor.department._id)
    navigate(`/randevu?${qs.toString()}`)
  }

  // info rows for the quick info / contact block — empty values are simply hidden
  const infoRows = [
    doctor.consultationFee > 0 && { label: 'Konsultasiya haqqı', value: `${doctor.consultationFee} ₼` },
    department && { label: 'Şöbə', value: department },
    { label: 'Qəbul statusu', value: isAccepting ? 'Qəbul edir' : 'Qəbul etmir' },
  ].filter(Boolean)

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: FONT, paddingTop: 40 }}>

      {/* ── MAIN CONTENT ── */}
      <div className="hp-grid">

        {/* LEFT CARD */}
        <motion.div className="hp-card hp-left" variants={fadeUp} initial="hidden" animate="visible">
          {photo
            ? <img src={photo} alt={name} className="hp-photo" onError={() => setFailedImageSrc(photo)} />
            : (
              <div className="hp-photo hp-photo-placeholder">
                <span>{initials}</span>
              </div>
            )
          }

          <h2 style={{ margin: '18px 0 2px', fontSize: 19, fontWeight: 800, color: NAVY, fontFamily: "'Raleway',sans-serif" }}>{name}</h2>
          {(title || department) && (
            <p style={{ margin: '0 0 18px', fontSize: 14, color: MUTED }}>
              {[title, department].filter(Boolean).join(' · ')}
            </p>
          )}

          {activityAreas.length > 0 && (
            <>
              <h3 style={{ margin: '6px 0 12px', fontSize: 15, fontWeight: 700, color: NAVY }}>Fəaliyyət Sahələri</h3>
              <ul style={{ margin: '0 0 22px', paddingLeft: 20 }}>
                {activityAreas.map((a, i) => (
                  <li key={i} style={{ fontSize: 14, color: '#374151', marginBottom: 8, lineHeight: 1.6 }}>{a}</li>
                ))}
              </ul>
            </>
          )}

          {infoRows.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              {infoRows.map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: i < infoRows.length - 1 ? `1px solid #F1F5F9` : 'none' }}>
                  <span style={{ fontSize: 13, color: MUTED }}>{row.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{row.value}</span>
                </div>
              ))}
            </div>
          )}

          {isAccepting && (
            <div style={{ background: BG, borderRadius: 16, padding: '18px 20px' }}>
              <p style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: NAVY }}>Randevu üçün uyğun saatları seçin</p>
              <button onClick={bookAppointment}
                style={{ width: '100%', padding: '12px', borderRadius: 10, border: 'none', background: TEAL, color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, transition: 'background 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#0E8F96' }}
                onMouseLeave={e => { e.currentTarget.style.background = TEAL }}
              >
                Randevu Al
              </button>
            </div>
          )}
        </motion.div>

        {/* RIGHT CARD */}
        <motion.div className="hp-card hp-right" variants={fadeUp} initial="hidden" animate="visible" transition={{ ...fadeUp.visible.transition, delay: 0.1 }}>
          <div className="hp-tabbar">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)} className={`hp-tab ${activeTab === t.key ? 'hp-tab-active' : ''}`}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="hp-tab-content">

            {activeTab === 'haqqinda' && (
              <div>
                <p style={{ fontSize: 15, color: '#374151', marginBottom: 6 }}>
                  <strong style={{ color: NAVY }}>Elmi dərəcə Ad Soyad:</strong> {[title, name].filter(Boolean).join(' ')}
                </p>
                {department && (
                  <p style={{ fontSize: 15, color: '#374151', marginBottom: 18 }}>
                    <strong style={{ color: NAVY }}>Tibbi bölmə:</strong> {department}
                  </p>
                )}

                {activityAreas.length > 0 && (
                  <>
                    <p style={{ fontSize: 15, fontWeight: 700, color: TEAL, marginBottom: 8 }}>Fəaliyyət istiqamətləri:</p>
                    <ul style={{ margin: '0 0 20px', paddingLeft: 20 }}>
                      {activityAreas.map((a, i) => <li key={i} style={{ fontSize: 15, color: '#374151', marginBottom: 6, lineHeight: 1.6 }}>{a}</li>)}
                    </ul>
                  </>
                )}

                {doctor.bio && (
                  <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.7, marginBottom: 20 }}>{doctor.bio}</p>
                )}

                {education.length > 0 && (
                  <>
                    <p style={{ fontSize: 15, fontWeight: 700, color: TEAL, marginBottom: 8 }}>Təhsil:</p>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {education.map((e, i) => <li key={i} style={{ fontSize: 15, color: '#374151', marginBottom: 6, lineHeight: 1.6 }}>{e}</li>)}
                    </ul>
                  </>
                )}
              </div>
            )}

            {activeTab === 'nesrler' && (
              publications.length > 0
                ? <ExpandableList items={publications} />
                : <p style={{ fontSize: 14, color: MUTED, margin: 0 }}>Nəşr məlumatı əlavə edilməyib.</p>
            )}

            {activeTab === 'uzvluk' && (
              memberships.length > 0
                ? (
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {memberships.map((m, i) => <li key={i} style={{ fontSize: 15, color: '#374151', marginBottom: 8, lineHeight: 1.6 }}>{m}</li>)}
                  </ul>
                )
                : <p style={{ fontSize: 14, color: MUTED, margin: 0 }}>Üzvlük məlumatı əlavə edilməyib.</p>
            )}

            {activeTab === 'kurslar' && (
              courses.length > 0
                ? (
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {courses.map((c, i) => <li key={i} style={{ fontSize: 15, color: '#374151', marginBottom: 8, lineHeight: 1.6 }}>{c}</li>)}
                  </ul>
                )
                : <p style={{ fontSize: 14, color: MUTED, margin: 0 }}>Kurs məlumatı əlavə edilməyib.</p>
            )}

            {activeTab === 'saatlar' && (
              workingHours
                ? (
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {workingHours.map((entry, i) => {
                      let text
                      if (typeof entry === 'string') {
                        text = entry
                      } else {
                        const day   = entry.day || entry.dayName || ''
                        const start = entry.startTime || entry.start || ''
                        const end   = entry.endTime   || entry.end   || ''
                        text = day && start && end ? `${day}: ${start} – ${end}`
                             : day && start        ? `${day}: ${start}`
                             : day                 || start || ''
                      }
                      return text
                        ? <li key={i} style={{ fontSize: 15, color: '#374151', marginBottom: 8, lineHeight: 1.6 }}>{text}</li>
                        : null
                    })}
                  </ul>
                )
                : <p style={{ fontSize: 14, color: MUTED, margin: 0 }}>Randevu saatları məlumatı əlavə edilməyib.</p>
            )}

          </div>
        </motion.div>
      </div>

      <style>{`
        @keyframes hp-spin { to { transform: rotate(360deg) } }

        .hp-grid {
          max-width: 1320px;
          margin: 0 auto;
          padding: 32px 32px 64px;
          display: grid;
          grid-template-columns: 35% 65%;
          gap: 32px;
          align-items: start;
        }

        .hp-card {
          background: ${CARD};
          border-radius: 24px;
          border: 1px solid ${BORDER};
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
          padding: 28px;
          box-sizing: border-box;
        }

        .hp-photo {
          width: 100%;
          max-width: 360px;
          aspect-ratio: 1 / 1;
          height: auto;
          border-radius: 20px;
          object-fit: cover;
          object-position: center top;
          display: block;
          background: #EEF2F6;
          box-shadow: 0 6px 18px rgba(15, 23, 42, 0.1);
        }

        .hp-photo-placeholder {
          background: #EEF2F6;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hp-photo-placeholder span {
          font-size: 56px;
          font-weight: 800;
          color: #94A3B8;
          font-family: 'Raleway', sans-serif;
        }

        .hp-tabbar {
          display: flex;
          flex-wrap: wrap;
          border-bottom: 2px solid ${BORDER};
          margin-bottom: 24px;
        }

        .hp-tab {
          padding: 12px 18px;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          font-family: ${FONT};
          color: ${MUTED};
          border-bottom: 2px solid transparent;
          margin-bottom: -2px;
          white-space: nowrap;
          transition: color 0.2s, border-color 0.2s, transform 0.2s;
        }

        .hp-tab:hover {
          color: ${NAVY};
          transform: scale(1.05);
        }

        .hp-tab-active {
          color: ${TEAL};
          border-bottom: 2px solid ${TEAL};
          font-weight: 700;
        }

        .hp-tab-content {
          min-height: 220px;
        }

        @media (max-width: 1024px) {
          .hp-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .hp-grid {
            padding: 24px 16px 48px;
            gap: 20px;
          }

          .hp-card {
            padding: 22px;
            border-radius: 18px;
          }

          .hp-photo, .hp-photo-placeholder {
            max-width: 100%;
            aspect-ratio: 1 / 1;
            height: auto;
          }

          .hp-tabbar {
            overflow-x: auto;
            flex-wrap: nowrap;
          }
        }
      `}</style>
    </div>
  )
}
