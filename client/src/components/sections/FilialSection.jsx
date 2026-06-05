import { useExternalLink } from '../../hooks/useExternalLink'
import ExternalLinkModal   from '../ui/ExternalLinkModal'

const LOCATIONS = [
  {
    name:    'Aslan Medical — Xətai',
    phone:   '+994 50 836 36 94',
    address: 'Xətai ray., A. Cəlilov küçəsi, Bakı',
    image:   '/Filial1.png',
    link:    'https://maps.google.com',
  },
  {
    name:    'Aslan Medical — Vadi İstanbul',
    phone:   '+90 212 444 55 66',
    address: 'Vadi İstanbul, İstanbul, Türkiyə',
    image:   '/filial24.jpeg',
    link:    'https://www.google.com/maps/search/Vadi+İstanbul,+İstanbul',
  },
  {
    name:    'Aslan Medical — Ankara',
    phone:   '+90 312 444 55 66',
    address: 'Ankara, Türkiyə',
    image:   '/filial11.jpeg',
    link:    'https://www.google.com/maps/search/Ankara,+Türkiye',
  },
]

export default function FilialSection() {
  const { modal, openExternalLink, handleConfirm, handleCancel } = useExternalLink()

  return (
    <section style={{ background: 'white', padding: '64px 0', fontFamily: "'Source Sans 3', sans-serif" }}>
      <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 32px' }}>

        {/* Title */}
        <h2 style={{ fontSize: 32, fontWeight: 800, color: '#0a1628', margin: '0 0 32px', fontFamily: "'Raleway', sans-serif" }}>
          Xəstəxanalarımız
        </h2>

        {/* Cards grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {LOCATIONS.map((loc, i) => (
            <div key={i} style={{ position: 'relative', height: 320, borderRadius: 8, overflow: 'hidden', cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
              onClick={() => openExternalLink(loc.link, loc.name)}
            >
              {/* Background image */}
              <img src={loc.image} alt={loc.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              />

              {/* Dark gradient overlay */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%)' }} />

              {/* Content overlay */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 20px 16px', color: 'white' }}>
                {/* Location name with pin icon */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="14" height="14" fill="white" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '0.02em' }}>{loc.name}</span>
                </div>

                {/* Phone */}
                <div style={{ fontSize: 15, fontWeight: 700, color: 'white', marginBottom: 4 }}>{loc.phone}</div>

                {/* Address */}
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 12 }}>{loc.address}</div>

                {/* Link */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#93c5fd' }}>
                  <span style={{ borderBottom: '1px solid #93c5fd', paddingBottom: 1 }}>Xəritədə göstər</span>
                  <span>→</span>
                </div>
              </div>

              {/* Blue bottom accent border */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: '#2563eb' }} />
            </div>
          ))}
        </div>

      </div>

      <ExternalLinkModal
        url={modal.url}
        siteName={modal.siteName}
        isOpen={modal.isOpen}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </section>
  )
}
