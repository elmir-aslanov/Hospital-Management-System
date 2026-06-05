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
  const navigate  = useNavigate()
  const imgSrc    = getDoctorImage(doctor)
  const doctorId  = getDoctorId(doctor)
  const fullName  = getDoctorName(doctor)
  const specialty = getDoctorSpecialty(doctor)
  const department = getDoctorDepartment(doctor)
  const title = getDoctorTitle(doctor)
  const position = getDoctorPosition(doctor)
  const clinicalInterests = getClinicalInterests(doctor) || specialty || department
  const initials  = fullName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'DR'
  const profilePath = '/hekimler/' + doctorId
  const goProfile = () => navigate(profilePath)

  return (
    <motion.div
      className="doctor-profile-card"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      onClick={goProfile}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          goProfile()
        }
      }}
      role="link"
      tabIndex={0}
    >
      {/* Photo */}
      <div className="doctor-card-photo">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={fullName}
            onError={e => {
              e.currentTarget.style.display = 'none'
              e.currentTarget.nextSibling.style.display = 'flex'
            }}
          />
        ) : null}
        {/* Initials fallback */}
        <div style={{
          display: imgSrc ? 'none' : 'flex',
          width: '100%', height: '100%',
          alignItems: 'center', justifyContent: 'center',
          fontSize: '44px', fontWeight: 700,
          color: 'rgba(255,255,255,0.75)',
          fontFamily: "'Raleway', sans-serif",
        }}>
          {initials}
        </div>
      </div>

      {/* Info */}
      <div className="doctor-card-content">
        <div>
          <h3 className="doctor-card-name">
          {fullName || 'Həkim'}
        </h3>

          {title && <p className="doctor-card-title">{title}</p>}

          {position && <p className="doctor-card-text">{position}</p>}

        {doctor.experience > 0 && (
            <p className="doctor-card-text doctor-card-experience">
            <span style={{ color: TEAL }}>●</span>
            {doctor.experience} il təcrübə
          </p>
        )}

          <p className="doctor-card-clinic">
            <span className="clinic-icon" aria-hidden="true">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18" />
                <path d="M5 21V7l7-4 7 4v14" />
                <path d="M9 21v-6h6v6" />
                <path d="M10 9h4" />
                <path d="M12 7v4" />
              </svg>
            </span>
            Aslan Medical Center
          </p>

          {clinicalInterests && (
            <p className="doctor-card-interests">
              <span>İxtisas sahələri:</span> {clinicalInterests}
            </p>
          )}

          {!clinicalInterests && doctor.bio && (
            <p className="doctor-card-bio">{doctor.bio}</p>
          )}
        </div>

        <button className="doctor-profile-action" type="button" onClick={e => { e.stopPropagation(); goProfile() }}>
          <span>Profilə bax</span>
          <span className="doctor-arrow" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </span>
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

            {/* Search + filter */}
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
              <div className="doctors-grid">
                {filtered.slice(0, visibleCount).map((doc, i) => <DoctorCard key={doc._id ?? i} doctor={doc} />)}
              </div>

              {visibleCount < filtered.length && (
                <div className="doctor-listing-footer">
                  <button
                    className="doctor-load-button doctor-load-primary"
                    onClick={() => setVisibleCount(c => c + 8)}
                  >
                    Daha çox göstər ({filtered.length - visibleCount} həkim)
                  </button>
                </div>
              )}

              {visibleCount >= filtered.length && filtered.length > 8 && (
                <div className="doctor-listing-footer">
                  <button
                    className="doctor-load-button"
                    onClick={() => setVisibleCount(8)}
                  >
                    Daha az göstər ↑
                  </button>
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
