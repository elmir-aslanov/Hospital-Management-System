import usePageTitle from '../../hooks/usePageTitle'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import AboutDirector from '../../components/sections/AboutDirector'
import api from '../../api/axios'
import { fadeUp } from '../../utils/animations'

const FONT = "'Source Sans 3', 'Raleway', sans-serif"
const TEAL = '#1D8B95'
const NAVY = '#0B1D34'
const GREEN = '#16A34A'
const GREEN_HOVER = '#159947'

// Resolve image: http → direct, /path → backend origin, empty → null
const BACKEND = import.meta.env.VITE_API_URL?.replace('/api/v1', '') ?? 'http://localhost:5000'
function resolveImage(src) {
  if (!src) return null
  if (typeof src === 'object') src = src.url || src.secure_url || src.path || ''
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
  const [imageFailed, setImageFailed] = useState(false)
  const fullName   = doctor.userId?.fullName || doctor.fullName || doctor.name || 'Həkim'
  const spec       = doctor.specialization || doctor.specialty || doctor.department || ''
  const exp        = doctor.experience || 0
  const rating     = doctor.averageRating || 0
  const ratingCount = doctor.totalRatings || 0
  const photo      = getDoctorImage(doctor)
  const showPhoto  = photo && !imageFailed
  const initials   = fullName.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) || 'DR'
  const isAvailable = doctor.isAvailable !== false

  const days = []
  let d = new Date()
  d.setDate(d.getDate() + 1)
  while (days.length < 2) {
    if (d.getDay() !== 0) {
      days.push({
        label: (() => {
          const DAYS   = ['Bazar','Bazar ertəsi','Çərşənbə axşamı','Çərşənbə','Cümə axşamı','Cümə','Şənbə']
          const MONTHS = ['yanvar','fevral','mart','aprel','may','iyun','iyul','avqust','sentyabr','oktyabr','noyabr','dekabr']
          return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
        })(),
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

  const fmtTime = (t) => t

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      style={{ background: '#F8FAFC', borderRadius: 8, boxShadow: '0 4px 16px rgba(29, 139, 149, 0.08)', border: '1px solid #E2E8F0', fontFamily: FONT, overflow: 'hidden' }}
    >
      {/* ── MAIN: Photo col + Info col + Appointment col ── */}
      <div style={{ display: 'flex', gap: 0 }}>

        {/* Photo + button */}
        <div style={{ width: 200, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ width: 200, height: 260, background: '#EEF2F6', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {showPhoto
              ? <img src={photo} alt={fullName} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center top' }} onError={() => setImageFailed(true)} />
              : <span style={{ fontSize: 44, fontWeight: 800, color: '#94A3B8', fontFamily:"'Raleway',sans-serif" }}>{initials}</span>
            }
          </div>
          <button
            onClick={() => navigate(`/hekimler/${doctor._id}`)}
            style={{ margin: 12, padding: '9px 12px', border: `2px solid ${NAVY}`, borderRadius: 5, background: 'white', color: NAVY, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, transition: 'all 0.18s', textAlign: 'center' }}
            onMouseEnter={e => { e.currentTarget.style.background = NAVY; e.currentTarget.style.color = 'white' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = NAVY }}
          >
            Tam Profili Gör
          </button>
        </div>

        {/* Info col */}
        <div style={{ flex: 1, padding: '18px 20px 14px', minWidth: 0, borderRight: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 3px', fontSize: 19, fontWeight: 800, color: NAVY, fontFamily: "'Raleway', sans-serif" }}>
            Dr. {fullName}
          </h3>
          <p style={{ margin: '0 0 10px', fontSize: 13.5, color: '#475569' }}>{spec}</p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 12 }}>
            <span style={{ display:'flex', alignItems:'center', gap: 5, fontSize: 12.5, fontWeight: 600, color: isAvailable ? '#16a34a' : '#94a3b8' }}>
              {isAvailable && <svg width="13" height="13" fill="none" stroke="#16a34a" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>}
              {isAvailable ? 'Qəbul edir' : 'Məşğul'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <svg width="15" height="15" fill={TEAL} viewBox="0 0 24 24" style={{ flexShrink:0 }}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            <span style={{ fontSize: 12, color: '#475569', whiteSpace: 'nowrap' }}>Aslan Medical Center, Bakı</span>
          </div>
          <a href="tel:+994508363694" style={{ display:'flex', alignItems:'center', gap: 6, textDecoration:'none', marginBottom: 8 }}>
            <svg width="15" height="15" fill="none" stroke={TEAL} strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 5.5 5.5l.76-.76a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z"/></svg>
            <span style={{ fontSize: 13, color: TEAL, fontWeight: 700 }}>+994 50 836 36 94</span>
          </a>

          {exp > 0 && (
            <div style={{ display: 'flex', gap: 16 }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>{exp} il təcrübə</span>
            </div>
          )}
        </div>

        {/* ── RANDEVU AL — sağ sütun ── */}
        <div style={{ width: 320, flexShrink: 0, padding: '18px 20px 20px', background: '#E8F7F8' }}>
          <p style={{ margin: '0 0 14px', fontSize: 11, fontWeight: 800, color: NAVY, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            RANDEVU AL
          </p>

          {days.map((day, di) => (
            <div key={di} style={{ marginBottom: di < days.length - 1 ? 16 : 0 }}>
              <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: '#111827' }}>{day.label}</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {day.slots.map(slot => (
                  <button
                    key={slot}
                    onClick={() => navigate(`/randevu?doctorId=${doctor._id}&date=${day.date}&time=${slot}`)}
                    style={{ padding: '8px 12px', background: NAVY, color: 'white', border: 'none', borderRadius: 4, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, transition: 'background 0.15s' }}
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
            style={{ marginTop: 14, width: '100%', padding: '10px', border: '1.5px solid #d1d5db', borderRadius: 5, background: 'white', color: '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: FONT, transition: 'all 0.18s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = TEAL; e.currentTarget.style.color = TEAL }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.color = '#374151' }}
          >
            Daha çox vaxt göstər
          </button>
        </div>
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
  const [expandedId, setExpandedId] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const DOCTORS_PER_PAGE = 10

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

  const filtered = [...doctors].sort((a, b) => {
    const nameA = a.userId?.fullName || a.fullName || ''
    const nameB = b.userId?.fullName || b.fullName || ''
    if (nameA.includes('Muradov')) return -1
    if (nameB.includes('Muradov')) return 1
    return 0
  }).filter(d => {
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

  // Reset to page 1 whenever search or filter changes
  useEffect(() => { setCurrentPage(1) }, [search, activeSpec])

  // Clamp currentPage if the filtered list shrinks below the current page
  useEffect(() => {
    const total = Math.ceil(filtered.length / DOCTORS_PER_PAGE)
    if (total > 0 && currentPage > total) setCurrentPage(total)
  }, [filtered.length, currentPage])

  const totalPages = Math.ceil(filtered.length / DOCTORS_PER_PAGE)
  const paginatedDoctors = filtered.slice(
    (currentPage - 1) * DOCTORS_PER_PAGE,
    currentPage * DOCTORS_PER_PAGE,
  )

  // Build compact page-number list (shows ellipsis when totalPages > 7)
  const pageNumbers = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages = [1]
    if (currentPage > 3) pages.push('…')
    const start = Math.max(2, currentPage - 1)
    const end   = Math.min(totalPages - 1, currentPage + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (currentPage < totalPages - 2) pages.push('…')
    pages.push(totalPages)
    return pages
  })()

  return (
    <main style={{ fontFamily: FONT }}>
      <AboutDirector />


      <section className="doctors-listing-section">
        <div className="doctors-page-container">

          <motion.div
            className="doctors-page-header"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
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
                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'visible', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', fontFamily: "'Source Sans 3', system-ui, sans-serif" }}>

                  {/* Header */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '14px 24px', borderBottom: '2px solid #e5e7eb', background: '#f9fafb', borderRadius: '12px 12px 0 0' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ad</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Şöbə</span>
                  </div>

                  {/* Rows */}
                  {paginatedDoctors.map((doc, i) => {
                    const name      = doc.userId?.fullName || doc.fullName || doc.name || '—'
                    const dept      = doc.specialization || doc.department || doc.specialty || '—'
                    const isLinked  = !!doc._id
                    const isOpen    = expandedId === doc._id
                    return (
                      <div key={doc._id || i}>
                        <div
                          style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '14px 24px', borderBottom: '1px solid #f3f4f6', cursor: isLinked ? 'pointer' : 'default', transition: 'background 0.1s', background: isOpen ? '#f0fafb' : 'white' }}
                          onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background = '#f9fafb' }}
                          onMouseLeave={e => { if (!isOpen) e.currentTarget.style.background = 'white' }}
                          onClick={() => isLinked && setExpandedId(isOpen ? null : doc._id)}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: isLinked ? '#1d4ed8' : '#1f2937', fontWeight: isLinked ? 600 : 400 }}>
                            Dr {name}
                            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', opacity: 0.5 }}>
                              <path d="m6 9 6 6 6-6"/>
                            </svg>
                          </span>
                          <span style={{ fontSize: 14, color: '#374151', fontWeight: 400 }}>{dept}</span>

                          {isOpen && (
                            <div
                              style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                zIndex: 20,
                                marginTop: 6,
                                borderRadius: 10,
                                boxShadow: '0 12px 32px rgba(11, 29, 52, 0.14)',
                              }}
                            >
                              <DoctorCard doctor={doc} />
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}

                </div>
              )}

              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 20, flexWrap: 'wrap' }}>
                  {/* Əvvəlki */}
                  <button
                    onClick={() => { setCurrentPage(p => p - 1); setExpandedId(null) }}
                    disabled={currentPage === 1}
                    style={{
                      padding: '7px 14px', borderRadius: 8,
                      border: '1px solid #e2e8f0', background: 'white',
                      color: currentPage === 1 ? '#94a3b8' : NAVY,
                      fontSize: 13, fontWeight: 600, fontFamily: FONT,
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      opacity: currentPage === 1 ? 0.5 : 1,
                      transition: 'all 0.15s',
                    }}
                  >
                    Əvvəlki
                  </button>

                  {/* Page numbers */}
                  {pageNumbers.map((page, idx) =>
                    page === '…'
                      ? <span key={`ell-${idx}`} style={{ padding: '0 2px', color: '#94a3b8', fontSize: 13, userSelect: 'none' }}>…</span>
                      : (
                        <button
                          key={page}
                          onClick={() => { setCurrentPage(page); setExpandedId(null) }}
                          style={{
                            width: 36, height: 36, borderRadius: 8,
                            border: page === currentPage ? 'none' : '1px solid #e2e8f0',
                            background: page === currentPage ? TEAL : 'white',
                            color: page === currentPage ? 'white' : NAVY,
                            fontSize: 13, fontWeight: 600, fontFamily: FONT,
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                          }}
                        >
                          {page}
                        </button>
                      )
                  )}

                  {/* Növbəti */}
                  <button
                    onClick={() => { setCurrentPage(p => p + 1); setExpandedId(null) }}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: '7px 14px', borderRadius: 8,
                      border: '1px solid #e2e8f0', background: 'white',
                      color: currentPage === totalPages ? '#94a3b8' : NAVY,
                      fontSize: 13, fontWeight: 600, fontFamily: FONT,
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      opacity: currentPage === totalPages ? 0.5 : 1,
                      transition: 'all 0.15s',
                    }}
                  >
                    Növbəti
                  </button>
                </div>
              )}

            </>
          )}
        </div>
      </section>

      <style>{`
        .doctors-listing-section {
          background: #FFFFFF;
          padding: 24px 0 68px;
        }

        .doctors-page-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 40px;
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

        @keyframes doctorPreviewFade {
          from { opacity: 0; transform: translateY(-4px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .doctor-hover-preview {
          animation: doctorPreviewFade 0.18s ease forwards;
          transform-origin: top center;
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
