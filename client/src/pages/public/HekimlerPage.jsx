import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import AboutDirector from '../../components/sections/AboutDirector'
import api from '../../api/axios'

const FONT = "'Source Sans 3', 'Raleway', sans-serif"
const TEAL = '#00848e'
const NAVY = '#0a1628'

// Resolve image: http → direct, /path → backend origin, empty → null
const BACKEND = import.meta.env.VITE_API_URL?.replace('/api/v1', '') ?? 'http://localhost:5000'
function resolveImage(src) {
  if (!src) return null
  if (src.startsWith('http')) return src
  if (src.startsWith('/')) return `${BACKEND}${src}`
  return src
}

const SPECIALTIES = [
  'Hamısı', 'Kardioloq', 'Nevroloq', 'Cərrah',
  'Pediatr', 'Ortoped', 'Dermatoloq', 'Göz həkimi',
]

function DoctorCard({ doctor }) {
  const navigate  = useNavigate()
  const imgSrc    = resolveImage(doctor.image)
  const fullName  = doctor.name || doctor.userId?.fullName || doctor.fullName || ''
  const initials  = fullName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'DR'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      style={{
        background: '#ffffff',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
        border: '1px solid #e8eef4',
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow 0.2s, transform 0.2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,132,142,0.15)'
        e.currentTarget.style.transform = 'translateY(-4px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.07)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Photo */}
      <div style={{
        position: 'relative', height: '220px', flexShrink: 0,
        background: 'linear-gradient(140deg, #0a1628 0%, #00848e 100%)',
      }}>
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={fullName}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
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
          fontSize: '52px', fontWeight: 800,
          color: 'rgba(255,255,255,0.75)',
          fontFamily: "'Raleway', sans-serif",
        }}>
          {initials}
        </div>

        {/* Specialty badge */}
        {doctor.specialty && (
          <div style={{
            position: 'absolute', bottom: '12px', left: '12px',
            background: TEAL, color: 'white',
            fontSize: '11px', fontWeight: 600,
            padding: '4px 10px', borderRadius: '20px', fontFamily: FONT,
          }}>
            {doctor.specialty}
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 style={{ fontSize: '17px', fontWeight: 800, color: NAVY, margin: '0 0 4px', fontFamily: FONT }}>
          {fullName || 'Həkim'}
        </h3>

        {doctor.department && (
          <p style={{ fontSize: '12px', color: TEAL, margin: '0 0 8px', fontFamily: FONT, fontWeight: 500 }}>
            {doctor.department}
          </p>
        )}

        {doctor.experience > 0 && (
          <p style={{ fontSize: '13px', color: '#718096', margin: '0 0 12px', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ color: TEAL }}>●</span>
            {doctor.experience} il təcrübə
          </p>
        )}

        {doctor.bio && (
          <p style={{
            fontSize: '13px', color: '#4a5568', lineHeight: 1.6, margin: '0 0 16px',
            fontFamily: FONT, flex: 1,
            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {doctor.bio}
          </p>
        )}

        <button
          onClick={() => navigate('/randevu')}
          style={{
            display: 'inline-block', padding: '9px 20px', borderRadius: '22px',
            border: `2px solid ${TEAL}`, background: 'transparent', color: TEAL,
            fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: FONT,
            transition: 'all 0.2s', marginTop: 'auto',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = TEAL; e.currentTarget.style.color = 'white' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = TEAL }}
        >
          Randevu Al
        </button>
      </div>
    </motion.div>
  )
}

export default function HekimlerPage() {
  const [doctors, setDoctors]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(false)
  const [search, setSearch]         = useState('')
  const [activeSpec, setActiveSpec] = useState('Hamısı')

  useEffect(() => {
    // Public site-doctors endpoint — no auth required
    api.get('/site-doctors')
      .then(res => {
        const data = res.data?.data ?? res.data
        setDoctors(Array.isArray(data) ? data : [])
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const filtered = doctors.filter(d => {
    const name = d.name || ''
    const matchSearch = !search ||
      name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialty?.toLowerCase().includes(search.toLowerCase()) ||
      d.department?.toLowerCase().includes(search.toLowerCase())
    const matchSpec = activeSpec === 'Hamısı' ||
      d.specialty?.toLowerCase().includes(activeSpec.toLowerCase())
    return matchSearch && matchSpec
  })

  return (
    <main style={{ fontFamily: FONT }}>
      <AboutDirector />

      {/* Wave: white → light grey */}
      <div style={{ lineHeight: 0, overflow: 'hidden', background: '#ffffff' }}>
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ width: '100%', height: '60px', display: 'block' }}>
          <path d="M0,30 C360,0 1080,60 1440,20 L1440,60 L0,60 Z" fill="#f0f4f8" />
        </svg>
      </div>

      <section style={{ background: '#f0f4f8', padding: '60px 0 80px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{ marginBottom: '40px' }}
          >
            <h2 style={{ fontSize: '30px', fontWeight: 800, color: NAVY, margin: '0 0 8px', fontFamily: FONT }}>
              Həkim Komandamız
            </h2>
            <p style={{ fontSize: '15px', color: '#718096', margin: 0, fontFamily: FONT }}>
              Sahəsinin mütəxəssisləri ilə tanış olun
            </p>
          </motion.div>

          {/* Search + filter */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '36px', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Həkim adı və ya ixtisas axtar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                flex: '1 1 240px', padding: '11px 16px', borderRadius: '10px',
                border: '1.5px solid #e2e8f0', fontSize: '14px', fontFamily: FONT,
                background: '#fff', outline: 'none', boxSizing: 'border-box',
              }}
              onFocus={e => { e.target.style.borderColor = TEAL }}
              onBlur={e => { e.target.style.borderColor = '#e2e8f0' }}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {SPECIALTIES.map(spec => (
                <button key={spec} onClick={() => setActiveSpec(spec)} style={{
                  padding: '8px 16px', borderRadius: '20px',
                  border: `1.5px solid ${activeSpec === spec ? TEAL : '#d1d9e0'}`,
                  background: activeSpec === spec ? TEAL : '#ffffff',
                  color: activeSpec === spec ? '#ffffff' : '#4a5568',
                  fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: FONT, transition: 'all 0.18s',
                }}>
                  {spec}
                </button>
              ))}
            </div>
          </div>

          {/* States */}
          {error && !loading && (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#ef4444', fontFamily: FONT }}>
              Həkimlər yüklənərkən xəta baş verdi.
            </div>
          )}

          {loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} style={{
                  height: '340px', borderRadius: '16px',
                  background: 'linear-gradient(90deg, #e8eef4 25%, #f0f4f8 50%, #e8eef4 75%)',
                  backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite',
                }} />
              ))}
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#a0aec0', fontFamily: FONT }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
              <p style={{ fontSize: '16px' }}>
                {doctors.length === 0 ? 'Hazırda həkim məlumatı əlavə edilməyib.' : 'Axtarışa uyğun həkim tapılmadı.'}
              </p>
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
              {filtered.map((doc, i) => <DoctorCard key={doc._id ?? i} doctor={doc} />)}
            </div>
          )}
        </div>
      </section>

      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </main>
  )
}
