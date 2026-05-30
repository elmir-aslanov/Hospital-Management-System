import { useState, useEffect } from 'react'

const FONT = "'Source Sans 3', 'Raleway', sans-serif"

const PersonIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#00848e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)

function DoctorCard({ doctor }) {
  const name  = doctor.userId?.fullName || doctor.fullName || doctor.name || '—'
  const photo = doctor.image || doctor.userId?.photoUrl || doctor.photo || null
  return (
    <div style={{ fontFamily: FONT }}>
      <div style={{ width: '100%', aspectRatio: '3/4', overflow: 'hidden', borderRadius: '8px', marginBottom: '16px', background: '#f0f0f0' }}>
        {photo ? (
          <img
            src={photo}
            alt={name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }}
            onError={e => {
              e.currentTarget.style.display = 'none'
              e.currentTarget.nextSibling.style.display = 'flex'
            }}
          />
        ) : null}
        <div style={{
          width: '100%', height: '100%',
          background: '#e8f6f8',
          display: photo ? 'none' : 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <PersonIcon />
        </div>
      </div>
      <p style={{ fontSize: '16px', fontWeight: 700, color: '#0a1628', marginBottom: '4px', margin: '0 0 4px', fontFamily: FONT }}>
        {name}
      </p>
      <p style={{ fontSize: '14px', color: '#888', fontWeight: 400, margin: 0, fontFamily: FONT }}>
        {doctor.specialization || doctor.department || 'Həkim'}
      </p>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div style={{ aspectRatio: '3/4', background: '#f5f5f5', borderRadius: '8px', animation: 'pulse 1.5s ease-in-out infinite' }} />
  )
}

export default function DoctorsSection() {
  const isMobile = window.innerWidth < 768
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:5000/api/v1/doctors/public?limit=8')
      .then(r => r.json())
      .then(data => {
        let list = []
        if (Array.isArray(data)) list = data
        else if (data && Array.isArray(data.doctors)) list = data.doctors
        else if (data && Array.isArray(data.data)) list = data.data
        else if (data && Array.isArray(data.result)) list = data.result
        setDoctors(list)
        setLoading(false)
      })
      .catch(() => {
        setDoctors([])
        setLoading(false)
      })
  }, [])

  if (!loading && doctors.length === 0) return null

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>

      <div style={{ width: '100%', boxSizing: 'border-box', background: 'white' }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: isMobile ? '40px 16px' : '60px 48px',
        }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ fontSize: '20px', fontWeight: 400, color: '#666', marginBottom: '8px', fontFamily: FONT }}>
              Meet Our
            </p>
            <h2 style={{ fontSize: isMobile ? '28px' : '40px', fontWeight: 700, color: '#0a1628', margin: 0, fontFamily: FONT }}>
              Peşəkar Həkimlərimiz
            </h2>
          </div>

          {/* Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
            gap: '32px',
          }}>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
              : doctors.map((doc, i) => <DoctorCard key={doc._id || i} doctor={doc} />)
            }
          </div>

        </div>
      </div>
    </>
  )
}
