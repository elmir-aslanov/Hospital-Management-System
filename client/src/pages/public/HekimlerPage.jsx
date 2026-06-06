import usePageTitle from '../../hooks/usePageTitle'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import AboutDirector from '../../components/sections/AboutDirector'
import api from '../../api/axios'

const FONT = "'Source Sans 3', 'Raleway', sans-serif"
const TEAL = '#1D8B95'
const NAVY = '#0B1D34'
const GREEN = '#16A34A'
const GREEN_HOVER = '#159947'

// Resolve image: http → direct, /path → backend origin, empty → null
const BACKEND = import.meta.env.VITE_API_URL?.replace('/api/v1', '') ?? 'http://localhost:5000'
function resolveImage(src) {
  if (!src) return null
  if (src.startsWith('http')) return src
  if (src.startsWith('/')) return `${BACKEND}${src}`
  return src
}

function asText(value) {
  if (!value) return ''
  if (Array.isArray(value)) {
    return value
      .map(item => typeof item === 'object' ? (item?.name || item?.title || item?.label || '') : item)
      .filter(Boolean)
      .join(', ')
  }
  if (typeof value === 'object') return value.name || value.title || value.label || ''
  return String(value)
}

function getDoctorId(doctor) {
  return doctor._id || doctor.id
}

function getDoctorName(doctor) {
  return doctor.userId?.fullName || doctor.fullName || doctor.name || ''
}

function getDoctorImage(doctor) {
  return resolveImage(doctor.image || doctor.userId?.photoUrl || doctor.photoUrl || doctor.photo)
}

function getDoctorSpecialty(doctor) {
  return doctor.specialization || doctor.specialty || doctor.userId?.specialization || ''
}

function getDoctorDepartment(doctor) {
  return doctor.departmentId?.name || doctor.department || doctor.departmentName || ''
}

function getDoctorTitle(doctor) {
  return doctor.academicTitle || doctor.academicDegree || doctor.degree || doctor.education || doctor.qualification || doctor.title || ''
}

function getDoctorPosition(doctor) {
  return doctor.position || doctor.roleTitle || ''
}

function getClinicalInterests(doctor) {
  return asText(doctor.clinicalInterests || doctor.interests || doctor.services || doctor.serviceAreas || doctor.expertise)
}

function DoctorCard({ doctor }) {
  const navigate   = useNavigate()
  const fullName   = doctor.userId?.fullName || doctor.fullName || doctor.name || 'Həkim'
  const spec       = doctor.specialization || doctor.specialty || doctor.department || ''
  const exp        = doctor.experience || 0
  const rating     = doctor.averageRating || 0
  const ratingCount = doctor.totalRatings || 0
  const photo      = doctor.userId?.photoUrl || doctor.image || null
  const initials   = fullName.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) || 'DR'
  const isAvailable = doctor.isAvailable !== false
  const fee        = doctor.consultationFee || 0

  const days = []
  let d = new Date()
  d.setDate(d.getDate() + 1)
  while (days.length < 2) {
    if (d.getDay() !== 0) {
      days.push({
        label: d.toLocaleDateString('az-AZ', { weekday:'long', day:'numeric', month:'long', year:'numeric' }),
        date:  d.toISOString().split('T')[0],
        slots: ['09:00', '09:30', '10:00'],
      })
    }
    d = new Date(d); d.setDate(d.getDate() + 1)
  }

  const StarRating = ({ value }) => (
    <span style={{ display:'flex', alignItems:'center', gap: 2 }}>
      {[1,2,3,4,5].map(s => (
        <svg key={s} width="14" height="14" viewBox="0 0 24 24"
          fill={s <= Math.round(value) ? '#f59e0b' : 'none'}
          stroke="#f59e0b" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </span>
  )

  const fmtTime = (t) => {
    const [h, m] = t.split(':').map(Number)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const h12  = h % 12 || 12
    return `${h12}:${String(m).padStart(2,'0')} ${ampm}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      style={{ background: 'white', borderRadius: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0', fontFamily: FONT, overflow: 'hidden' }}
    >
      {/* ── TOP SECTION: Left col (photo+btn) + Right col (info) ── */}
      <div style={{ display: 'flex', gap: 0 }}>

        {/* Left column — photo + View Full Profile */}
        <div style={{ width: 180, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, minHeight: 180, background: 'linear-gradient(135deg, #1e3a5f 0%, #00848e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {photo
              ? <img src={photo} alt={fullName} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center top' }} onError={e=>e.target.style.display='none'} />
              : <span style={{ fontSize: 44, fontWeight: 800, color: 'rgba(255,255,255,0.75)', fontFamily:"'Raleway',sans-serif" }}>{initials}</span>
            }
          </div>
          <button
            onClick={() => navigate(`/hekimler/${doctor._id}`)}
            style={{ margin: 12, padding: '9px 12px', border: `2px solid ${NAVY}`, borderRadius: 5, background: 'white', color: NAVY, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, transition: 'all 0.18s', textAlign: 'center' }}
            onMouseEnter={e => { e.currentTarget.style.background = NAVY; e.currentTarget.style.color = 'white' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = NAVY }}
          >
            View Full Profile
          </button>
        </div>

        {/* Right column — all info */}
        <div style={{ flex: 1, padding: '18px 20px 14px', minWidth: 0 }}>

          {/* Name */}
          <h3 style={{ margin: '0 0 3px', fontSize: 19, fontWeight: 800, color: NAVY, fontFamily: "'Raleway', sans-serif" }}>
            Dr. {fullName}
          </h3>
          <p style={{ margin: '0 0 10px', fontSize: 13.5, color: '#475569' }}>{spec}</p>

          {/* Rating + Accepting — same row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {rating > 0 && (
                <>
                  <StarRating value={rating} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1f2937' }}>{rating.toFixed(1)}</span>
                  {ratingCount > 0 && <span style={{ fontSize: 12, color: '#64748b' }}>| {ratingCount} rəy</span>}
                </>
              )}
            </div>
            <span style={{ display:'flex', alignItems:'center', gap: 5, fontSize: 12.5, fontWeight: 600, color: isAvailable ? '#16a34a' : '#94a3b8', flexShrink: 0 }}>
              {isAvailable && <svg width="13" height="13" fill="none" stroke="#16a34a" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>}
              {isAvailable ? 'Qəbul edir' : 'Məşğul'}
            </span>
          </div>

          {/* Address + phone — same row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
              <svg width="15" height="15" fill={TEAL} viewBox="0 0 24 24" style={{ flexShrink:0, marginTop: 1 }}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              <span style={{ fontSize: 12.5, color: TEAL, fontWeight: 600, lineHeight: 1.5 }}>
                Aslan Medical Center<br/>
                <span style={{ color: '#475569', fontWeight: 400 }}>Bakı, Azərbaycan</span>
              </span>
            </div>
            <a href="tel:+994508363694" style={{ display:'flex', alignItems:'center', gap: 6, textDecoration:'none', flexShrink: 0 }}>
              <svg width="15" height="15" fill="none" stroke={TEAL} strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 5.5 5.5l.76-.76a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z"/></svg>
              <span style={{ fontSize: 13, color: TEAL, fontWeight: 700 }}>+994 50 836 36 94</span>
            </a>
          </div>

          {(exp > 0 || fee > 0) && (
            <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
              {exp > 0 && <span style={{ fontSize: 12, color: '#64748b' }}>{exp} il təcrübə</span>}
              {fee > 0  && <span style={{ fontSize: 12, color: '#64748b' }}>Konsultasiya: <strong style={{ color: NAVY }}>{fee} ₼</strong></span>}
            </div>
          )}
        </div>
      </div>

      {/* ── Divider ── */}
      <div style={{ height: 1, background: '#e2e8f0', margin: '0' }} />

      {/* ── BOOK AN APPOINTMENT ── */}
      <div style={{ padding: '18px 20px 20px' }}>
        <p style={{ margin: '0 0 14px', fontSize: 11, fontWeight: 800, color: NAVY, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          BOOK AN APPOINTMENT
        </p>

        {days.map((day, di) => (
          <div key={di} style={{ marginBottom: di < days.length - 1 ? 16 : 0 }}>
            <p style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700, color: '#111827' }}>{day.label}</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {day.slots.map(slot => (
                <button
                  key={slot}
                  onClick={() => navigate(`/randevu?doctorId=${doctor._id}&date=${day.date}&time=${slot}`)}
                  style={{ padding: '10px 16px', background: NAVY, color: 'white', border: 'none', borderRadius: 4, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = TEAL}
                  onMouseLeave={e => e.currentTarget.style.background = NAVY}
                >
                  {fmtTime(slot)}
                </button>
              ))}
            </div>
          </div>
        ))}

        <button
          onClick={() => navigate(`/randevu?doctorId=${doctor._id}`)}
          style={{ marginTop: 16, width: '100%', padding: '11px', border: '1.5px solid #d1d5db', borderRadius: 5, background: 'white', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: FONT, transition: 'all 0.18s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = TEAL; e.currentTarget.style.color = TEAL }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.color = '#374151' }}
        >
          Show more appointment times
        </button>
      </div>

    </motion.div>
  )
}

export default function HekimlerPage() {
  usePageTitle('Həkimlər', 'Aslan Medical Center-in peşəkar həkim heyəti ilə tanış olun.')
  const [doctors, setDoctors]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(false)
  const [search, setSearch]         = useState('')
  const [activeSpec, setActiveSpec] = useState('Hamısı')
  const [visibleCount, setVisibleCount] = useState(8)
  const [view, setView] = useState('table')

  useEffect(() => {
    // Public site-doctors endpoint — no auth required
    api.get('/doctors/public/all')
      .then(res => {
        const data = res.data?.data ?? res.data
        setDoctors(Array.isArray(data) ? data : [])
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const filtered = doctors.filter(d => {
    const name = getDoctorName(d)
    const specialty = getDoctorSpecialty(d)
    const department = getDoctorDepartment(d)
    const matchSearch = !search ||
      name.toLowerCase().includes(search.toLowerCase()) ||
      specialty.toLowerCase().includes(search.toLowerCase()) ||
      department.toLowerCase().includes(search.toLowerCase())
    const matchSpec = activeSpec === 'Hamısı' ||
      specialty.toLowerCase().includes(activeSpec.toLowerCase()) ||
      department.toLowerCase().includes(activeSpec.toLowerCase())
    return matchSearch && matchSpec
  })

  const filterOptions = ['Hamısı', ...Array.from(new Set(doctors
    .flatMap(d => [getDoctorDepartment(d), getDoctorSpecialty(d)])
    .filter(Boolean)
  ))]

  return (
    <main style={{ fontFamily: FONT }}>
      <AboutDirector />

      {/* Wave: white → light grey */}
      <div style={{ lineHeight: 0, overflow: 'hidden', background: '#ffffff' }}>
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ width: '100%', height: '60px', display: 'block' }}>
          <path d="M0,30 C360,0 1080,60 1440,20 L1440,60 L0,60 Z" fill="#EAF6F3" />
        </svg>
      </div>

      <section className="doctors-listing-section">
        <div className="doctors-page-container">

          <motion.div
            className="doctors-page-header"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div>
              <h2 className="doctors-page-title">Həkimlərimiz</h2>
              <p className="doctors-page-subtitle">
                Peşəkar həkim heyətimizlə tanış olun və ixtisasınıza uyğun mütəxəssisi seçin.
              </p>
            </div>

            {/* Search + filter + view toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div className="doctor-controls" aria-label="Həkim axtarışı və filter">
              <label className="doctor-search" aria-label="Həkim adı ilə axtar">
                <span aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Həkim adı ilə axtar..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setVisibleCount(8) }}
                />
              </label>

              <label className="doctor-filter" aria-label="Şöbə seçimi">
                <select value={activeSpec} onChange={e => { setActiveSpec(e.target.value); setVisibleCount(8) }}>
                  {filterOptions.map(spec => (
                    <option key={spec} value={spec}>{spec === 'Hamısı' ? 'Bütün şöbələr' : spec}</option>
                  ))}
                </select>
                <span aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </span>
              </label>
            </div>

              <div style={{ display:'flex', gap: 4, background:'#f1f5f9', borderRadius: 8, padding: 3 }}>
                {[{key:'table',label:'Siyahı'},{key:'card',label:'Kart'}].map(v => (
                  <button key={v.key} onClick={() => setView(v.key)}
                    style={{ padding:'6px 16px', borderRadius: 6, border:'none', cursor:'pointer', fontSize: 12, fontWeight: 600, fontFamily: FONT,
                      background: view===v.key ? 'white' : 'transparent',
                      color: view===v.key ? '#00848e' : '#64748b',
                      boxShadow: view===v.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.15s' }}>
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* States */}
          {error && !loading && (
            <div className="doctor-empty-state" style={{ color: '#ef4444' }}>
              Həkimlər yüklənərkən xəta baş verdi.
            </div>
          )}

          {loading && (
            <div className="doctors-grid">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="doctor-card-skeleton" />
              ))}
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="doctor-empty-state">
              <h3>{doctors.length === 0 ? 'Həkim tapılmadı' : 'Həkim tapılmadı'}</h3>
              <p>
                {doctors.length === 0 ? 'Hazırda həkim məlumatı əlavə edilməyib.' : 'Axtarış və ya filtr nəticəsinə uyğun həkim mövcud deyil.'}
              </p>
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <>
              {view === 'table' && (
                <div style={{ background:'white', borderRadius: 12, border:'1px solid #e2e8f0', overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div style={{ padding:'14px 24px', borderBottom:'1px solid #e2e8f0', display:'flex', alignItems:'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius:'50%', background:'#00848e' }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color:'#1f2937', letterSpacing:'0.04em' }}>
                      {filtered.length} HƏKIM TAPILDI
                    </span>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', padding:'10px 24px', background:'#f9fafb', borderBottom:'2px solid #e2e8f0' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color:'#374151', letterSpacing:'0.06em' }}>Ad</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color:'#374151', letterSpacing:'0.06em' }}>Şöbə</span>
                  </div>
                  {filtered.map((doc, i) => {
                    const name = doc.userId?.fullName || doc.fullName || doc.name || '—'
                    const dept = doc.specialization || doc.department || doc.specialty || '—'
                    const hasLink = !!doc._id
                    return (
                      <div key={doc._id || i}
                        onClick={() => hasLink && navigate(`/hekimler/${doc._id}`)}
                        style={{ display:'grid', gridTemplateColumns:'1fr 1fr', padding:'13px 24px', borderBottom: i < filtered.length-1 ? '1px solid #f3f4f6' : 'none', cursor: hasLink ? 'pointer' : 'default', transition:'background 0.1s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                        onMouseLeave={e => e.currentTarget.style.background = 'white'}
                      >
                        <span style={{ fontSize: 14, fontWeight: hasLink ? 500 : 400, color: hasLink ? '#2563eb' : '#1f2937' }}>
                          Dr. {name}
                        </span>
                        <span style={{ fontSize: 14, color:'#374151' }}>{dept}</span>
                      </div>
                    )
                  })}
                </div>
              )}

              {view === 'card' && (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap: 20 }}>
                  {filtered.slice(0, visibleCount).map((doc, i) => <DoctorCard key={doc._id ?? i} doctor={doc} />)}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <style>{`
        .doctors-listing-section {
          background: #DDEFE9;
          padding: 24px 0 68px;
        }

        .doctors-page-container {
          max-width: 100%;
          margin: 0 auto;
          padding: 0 36px;
          box-sizing: border-box;
        }

        .doctors-page-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 28px;
          margin-bottom: 22px;
        }

        .doctors-page-title {
          font-family: ${FONT};
          font-size: 34px;
          line-height: 1.12;
          font-weight: 800;
          color: ${NAVY};
          margin: 0 0 8px;
          letter-spacing: 0;
        }

        .doctors-page-subtitle {
          font-family: ${FONT};
          max-width: 620px;
          font-size: 15px;
          line-height: 1.55;
          color: #64748B;
          margin: 0;
        }

        .doctor-controls {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 0 0 auto;
        }

        .doctor-search,
        .doctor-filter {
          height: 50px;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          background: #FFFFFF;
          color: #64748B;
          display: flex;
          align-items: center;
          box-sizing: border-box;
          transition: border-color 180ms ease, box-shadow 180ms ease;
        }

        .doctor-search {
          width: 300px;
          padding: 0 16px;
          gap: 10px;
        }

        .doctor-filter {
          position: relative;
          min-width: 190px;
        }

        .doctor-search:focus-within,
        .doctor-filter:focus-within {
          border-color: ${TEAL};
          box-shadow: 0 0 0 3px rgba(29, 139, 149, 0.12);
        }

        .doctor-search input,
        .doctor-filter select {
          width: 100%;
          height: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          color: ${NAVY};
          font-family: ${FONT};
          font-size: 15px;
          box-sizing: border-box;
        }

        .doctor-search input::placeholder {
          color: #94A3B8;
          opacity: 1;
        }

        .doctor-filter select {
          appearance: none;
          padding: 0 44px 0 16px;
          cursor: pointer;
        }

        .doctor-filter > span {
          position: absolute;
          right: 16px;
          pointer-events: none;
          color: #64748B;
          display: flex;
        }

        .doctors-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          column-gap: 24px;
          row-gap: 28px;
        }

        .doctor-profile-card {
          min-height: 300px;
          height: 312px;
          background: #FFFFFF;
          border-radius: 30px;
          border: none;
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.035);
          padding: 28px 30px;
          display: flex;
          align-items: flex-start;
          gap: 32px;
          position: relative;
          cursor: pointer;
          transition: transform 250ms ease, box-shadow 250ms ease, border-color 250ms ease;
          box-sizing: border-box;
          overflow: hidden;
        }

        .doctor-profile-card:hover,
        .doctor-profile-card:focus-visible {
          transform: translateY(-3px);
          box-shadow: 0 18px 42px rgba(15, 23, 42, 0.08);
          outline: none;
        }

        .doctor-card-photo {
          width: 200px;
          height: 260px;
          flex: 0 0 200px;
          border-radius: 12px;
          overflow: hidden;
          background: #EEF2F6;
        }

        .doctor-card-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
          display: block;
        }

        .doctor-card-content {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          gap: 0;
          padding: 4px 92px 52px 0;
        }

        .doctor-card-name {
          font-family: ${FONT};
          font-size: 28px;
          font-weight: 700;
          line-height: 1.2;
          color: #333333;
          margin: 0 0 18px;
        }

        .doctor-card-title {
          font-family: ${FONT};
          font-size: 18px;
          line-height: 1.5;
          color: #444444;
          margin: 0 0 22px;
          font-weight: 400;
        }

        .doctor-card-text,
        .doctor-card-bio {
          font-family: ${FONT};
          font-size: 17px;
          line-height: 1.45;
          color: #444444;
          margin: 0 0 8px;
        }

        .doctor-card-text:not(.doctor-card-experience) {
          font-size: 22px;
          font-weight: 400;
          color: #333333;
          margin-bottom: 8px;
        }

        .doctor-card-experience {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 17px;
        }

        .doctor-card-clinic {
          font-family: ${FONT};
          font-size: 21px;
          line-height: 1.5;
          color: #333333;
          margin: 8px 0 0;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .clinic-icon {
          width: 24px;
          height: 24px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: ${GREEN};
          background: transparent;
          flex: 0 0 auto;
        }

        .doctor-card-interests {
          font-family: ${FONT};
          font-size: 21px;
          line-height: 1.25;
          color: #333333;
          margin: 22px 0 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .doctor-card-interests span {
          display: block;
          font-size: 21px;
          font-weight: 400;
          color: #333333;
          margin-bottom: 6px;
        }

        .doctor-card-bio {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .doctor-profile-action {
          position: absolute;
          right: 28px;
          bottom: 28px;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          border: 0;
          background: transparent;
          color: ${GREEN_HOVER};
          font-family: ${FONT};
          font-size: 20px;
          font-weight: 500;
          padding: 0;
          cursor: pointer;
        }

        .doctor-arrow {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: ${GREEN};
          color: #FFFFFF;
          transition: background 180ms ease, transform 180ms ease;
        }

        .doctor-profile-action:hover .doctor-arrow,
        .doctor-profile-action:focus-visible .doctor-arrow {
          background: ${GREEN_HOVER};
          transform: translateX(2px);
        }

        .doctor-card-skeleton {
          min-height: 300px;
          border-radius: 30px;
          background: linear-gradient(90deg, rgba(255,255,255,0.55) 25%, #FFFFFF 50%, rgba(255,255,255,0.55) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }

        .doctor-empty-state {
          text-align: center;
          padding: 84px 24px;
          color: #64748B;
          font-family: ${FONT};
          background: rgba(255,255,255,0.7);
          border: 1px solid rgba(255,255,255,0.7);
          border-radius: 28px;
        }

        .doctor-empty-state h3 {
          margin: 0 0 8px;
          font-size: 24px;
          font-weight: 800;
          color: ${NAVY};
        }

        .doctor-empty-state p {
          margin: 0;
          font-size: 16px;
          line-height: 1.6;
        }

        .doctor-listing-footer {
          display: flex;
          justify-content: center;
          margin-top: 36px;
        }

        .doctor-load-button {
          padding: 13px 30px;
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 14px;
          font-size: 14px;
          font-weight: 700;
          color: #64748B;
          cursor: pointer;
          transition: border-color 180ms ease, color 180ms ease, background 180ms ease;
          font-family: ${FONT};
        }

        .doctor-load-button:hover {
          border-color: ${TEAL};
          color: ${TEAL};
        }

        .doctor-load-primary {
          border-color: ${TEAL};
          color: ${TEAL};
        }

        .doctor-load-primary:hover {
          background: ${TEAL};
          color: #FFFFFF;
        }

        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @media (max-width: 1180px) {
          .doctors-page-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .doctor-controls {
            width: 100%;
          }

          .doctor-search {
            flex: 1 1 auto;
            width: auto;
          }

          .doctor-card-content {
            padding-right: 92px;
          }
        }

        @media (max-width: 980px) {
          .doctors-grid {
            grid-template-columns: 1fr;
          }

          .doctor-card-content {
            padding-right: 110px;
          }
        }

        @media (max-width: 720px) {
          .doctors-listing-section {
            padding: 44px 0 64px;
          }

          .doctors-page-container {
            padding: 0 16px;
          }

          .doctors-page-title {
            font-size: 32px;
          }

          .doctors-page-subtitle {
            font-size: 15px;
          }

          .doctor-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .doctor-search,
          .doctor-filter {
            width: 100%;
            min-width: 0;
          }

          .doctor-profile-card {
            flex-direction: column;
            gap: 20px;
            padding: 18px;
            border-radius: 24px;
            min-height: 0;
            height: auto;
          }

          .doctor-card-photo {
            width: 100%;
            height: 280px;
            flex-basis: auto;
          }

          .doctor-card-content {
            width: 100%;
            padding: 0;
          }

          .doctor-card-name {
            font-size: 25px;
            margin-bottom: 12px;
          }

          .doctor-card-title,
          .doctor-card-text,
          .doctor-card-bio {
            font-size: 16px;
          }

          .doctor-card-text:not(.doctor-card-experience) {
            font-size: 19px;
          }

          .doctor-card-clinic {
            font-size: 19px;
          }

          .doctor-card-interests {
            font-size: 18px;
            margin-top: 18px;
          }

          .doctor-card-interests span {
            font-size: 18px;
          }

          .doctor-profile-action {
            position: static;
            align-self: flex-end;
            margin-top: 2px;
            font-size: 18px;
          }
        }
      `}</style>
    </main>
  )
}
