import { useBreakpoint } from '../../hooks/useBreakpoint'

const LOCATIONS = [
  {
    name:    'Aslan Medical — Xətai',
    phone:   '+994 50 836 36 94',
    address: 'Xətai ray., A. Cəlilov küçəsi',
    city:    'Bakı',
    image:   '/Filial1.png',
  },
  {
    name:    'Aslan Medical — Nəsimi',
    phone:   '+994 12 XXX XX XX',
    address: 'Nəsimi ray.',
    city:    'Bakı',
    image:   '/Filial1.png',
  },
  {
    name:    'Aslan Medical — Mərkəz',
    phone:   '+994 50 836 36 94',
    address: 'Nizami küçəsi',
    city:    'Bakı',
    image:   '/Filial2.png',
  },
]

export default function HospitalShowcase() {
  const { isMobile, isTablet } = useBreakpoint()
  return (
    <section style={{ background: 'white', padding: '64px 0', fontFamily: "'Source Sans 3', sans-serif" }}>
      <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 32px' }}>

        <h2 style={{ fontSize: 34, fontWeight: 800, color: '#0a1628', margin: '0 0 32px', fontFamily: "'Raleway', sans-serif" }}>
          Xəstəxanalarımız
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2,1fr)' : 'repeat(3,1fr)', gap: isMobile ? 16 : 24 }}>
          {LOCATIONS.map((loc, i) => (
            <div key={i} style={{ position: 'relative', height: isMobile ? 260 : 340, borderRadius: 8, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', cursor: 'pointer' }}>

              {/* Background image with zoom on hover */}
              <img
                src={loc.image}
                alt={loc.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              />

              {/* Full overlay gradient — transparent top, dark bottom */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.55) 35%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.0) 100%)',
              }} />

              {/* TOP — location pin icon + name */}
              <div style={{ position: 'absolute', top: 18, left: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                </div>
                <span style={{ fontSize: 16, fontWeight: 700, color: 'white', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                  {loc.name}
                </span>
              </div>

              {/* BOTTOM — phone, address, link */}
              <div style={{ position: 'absolute', top: 72, left: 0, right: 0, padding: '0 20px 16px' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 4 }}>{loc.phone}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 2 }}>{loc.address}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 14 }}>{loc.city}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                  <span style={{ color: '#93c5fd', fontWeight: 700, borderBottom: '1px solid #93c5fd', paddingBottom: 1, cursor: 'pointer' }}>
                    Xəritədə göstər
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.7)' }}>və xidmətlər</span>
                </div>
              </div>

              {/* Blue bottom border */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: '#2563eb' }} />

            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
