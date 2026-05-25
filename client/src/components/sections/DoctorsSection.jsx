import { useState, useEffect } from 'react'

const FONT = "'Source Sans 3', 'Raleway', sans-serif"

const PersonIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#00848e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)

function DoctorCard({ doctor }) {
  return (
    <div style={{ fontFamily: FONT }}>
      {doctor.photo ? (
        <img
          src={doctor.photo}
          alt={doctor.fullName}
          style={{
            width: '100%', aspectRatio: '3/4',
            objectFit: 'cover', borderRadius: '8px',
            marginBottom: '12px', display: 'block',
          }}
          onError={e => {
            e.currentTarget.style.display = 'none'
            e.currentTarget.nextSibling.style.display = 'flex'
          }}
        />
      ) : null}
      <div style={{
        width: '100%', aspectRatio: '3/4',
        background: '#e8f6f8', borderRadius: '8px',
        marginBottom: '12px',
        display: doctor.photo ? 'none' : 'flex',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <PersonIcon />
      </div>
      <h3 style={{
        fontSize: '16px', fontWeight: 700,
        color: '#0a1628', margin: '0 0 4px',
        textAlign: 'left', fontFamily: FONT,
      }}>
        {doctor.fullName}
      </h3>
      <p style={{
        fontSize: '14px', color: '#666',
        margin: 0, textAlign: 'left', fontFamily: FONT,
      }}>
        {doctor.specialization || doctor.department || ''}
      </p>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div style={{
      background: '#f0f0f0', borderRadius: '8px',
      height: '280px', animation: 'pulse 1.5s ease-in-out infinite',
    }} />
  )
}

export default function DoctorsSection() {
  const isMobile = window.innerWidth < 768
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/v1/site-doctors?limit=8')
      .then(r => r.json())
      .then(data => {
        let list = []
        if (Array.isArray(data)) list = data
        else if (Array.isArray(data.doctors)) list = data.doctors
        else if (Array.isArray(data.data)) list = data.data
        setDoctors(list)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (!loading && doctors.length === 0) return null

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      <div style={{ width: '100%', boxSizing: 'border-box', margin: 0, background: '#ffffff' }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: isMobile ? '40px 16px' : '60px 48px',
          textAlign: 'center',
        }}>
          <p style={{
            fontSize: '18px', color: '#666',
            fontWeight: 400, marginBottom: '8px',
            fontFamily: FONT,
          }}>
            Meet Our
          </p>
          <h2 style={{
            fontSize: isMobile ? '28px' : '40px',
            fontWeight: 700, color: '#0a1628',
            margin: '0 0 48px', fontFamily: FONT,
          }}>
            Peşəkar Həkimlərimiz
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
            gap: '24px',
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
