import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

const FONT = "'Source Sans 3', 'Raleway', sans-serif"
const TEAL = '#00848e'

const hospitals = [
  { name: 'Aslan Medical Center', locationKey: 'baku', image: '/filial11.jpeg', descKey: 'bakuDesc' },
  { name: 'Aslan Medical Center', locationKey: 'ankara', image: '/Filial1.png', descKey: 'ankaraDesc' },
  { name: 'Aslan Medical Center', locationKey: 'samsun', image: '/filial24.jpeg', descKey: 'samsunDesc' },
]

export default function HospitalShowcase() {
  const { t } = useTranslation()
  const isMobile = window.innerWidth < 768
  const [active, setActive] = useState(0)
  const activeHospital = hospitals[active]

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActive(current => (current + 1) % hospitals.length)
    }, 6000)

    return () => window.clearInterval(intervalId)
  }, [])

  return (
    <div style={{ width: '100%', boxSizing: 'border-box', margin: 0, background: '#f8fffe' }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: isMobile ? '44px 16px' : '72px 48px',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '24px' : '36px',
          alignItems: 'stretch',
        }}>

          {/* LEFT COLUMN */}
          <div style={{
            flex: '0 0 42%',
            background: 'linear-gradient(145deg, #effafa 0%, #dff3f5 100%)',
            border: '1px solid rgba(0,132,142,0.12)',
            borderRadius: '18px',
            padding: isMobile ? '28px 20px' : '42px 38px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
            boxShadow: '0 18px 50px rgba(8,42,58,0.08)',
          }}>

            <div>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                width: 'fit-content',
                borderRadius: '999px',
                background: 'rgba(0,132,142,0.10)',
                color: TEAL,
                border: '1px solid rgba(0,132,142,0.18)',
                padding: '7px 13px',
                fontWeight: 700,
                fontSize: '13px',
                letterSpacing: '0.02em',
                fontFamily: FONT,
                marginBottom: '18px',
              }}>
                {t('hospitalShowcase.label')}
              </span>

            <h2 style={{
                fontSize: isMobile ? '28px' : '42px',
                fontWeight: 800,
                color: '#0a1628',
                lineHeight: 1.12,
                letterSpacing: 0,
              margin: 0,
              fontFamily: FONT,
            }}>
              {t('hospitalShowcase.title')}
            </h2>

              <p style={{
                color: 'rgba(10,22,40,0.68)',
                fontSize: isMobile ? '15px' : '16px',
                lineHeight: 1.7,
                margin: '18px 0 0',
                fontFamily: FONT,
              }}>
                {t('hospitalShowcase.subtitle')}
              </p>
            </div>

            {/* Thumbnails */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(3, minmax(96px, 1fr))' : 'repeat(3, minmax(0, 1fr))',
              gap: '12px',
              marginTop: isMobile ? '28px' : '38px',
            }}>
              {hospitals.map((h, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActive(i)}
                  style={{
                    appearance: 'none',
                    border: i === active ? `2px solid ${TEAL}` : '1px solid rgba(10,22,40,0.08)',
                    background: i === active ? '#ffffff' : 'rgba(255,255,255,0.62)',
                    borderRadius: '14px',
                    padding: '8px',
                    boxShadow: i === active ? '0 12px 28px rgba(0,132,142,0.18)' : '0 8px 18px rgba(8,42,58,0.06)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    position: 'relative',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
                    fontFamily: FONT,
                  }}
                >
                  <img
                    src={h.image}
                    alt={h.name}
                    style={{
                      width: '100%',
                      aspectRatio: '1.35 / 1',
                      objectFit: 'cover',
                      borderRadius: '10px',
                      display: 'block',
                    }}
                    onError={e => { e.currentTarget.style.background = '#c8e6ea'; }}
                  />
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isMobile ? '12px' : '13px',
                    color: i === active ? TEAL : '#52616f',
                    marginTop: '8px',
                    fontWeight: i === active ? 800 : 700,
                    fontFamily: FONT,
                  }}>
                    {t(`hospitalShowcase.locations.${h.locationKey}`)}
                  </span>
                </button>
              ))}
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div style={{
            flex: 1,
            position: 'relative',
            borderRadius: '20px',
            overflow: 'hidden',
            minHeight: isMobile ? '340px' : '520px',
            boxShadow: '0 26px 70px rgba(8,42,58,0.18)',
            border: '1px solid rgba(255,255,255,0.85)',
            background: '#c8e6ea',
          }}>
            <img
              src={activeHospital.image}
              alt={activeHospital.name}
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover',
                display: 'block',
                position: 'absolute',
                inset: 0,
              }}
              onError={e => { e.currentTarget.style.background = '#c8e6ea'; }}
            />

            {/* Overlay card */}
            <div style={{
              position: 'absolute',
              bottom: isMobile ? '16px' : '24px',
              left: isMobile ? '16px' : '24px',
              right: isMobile ? '16px' : 'auto',
              background: 'linear-gradient(135deg, rgba(3,58,67,0.88), rgba(0,132,142,0.78))',
              border: '1px solid rgba(255,255,255,0.22)',
              backdropFilter: 'blur(14px)',
              borderRadius: '16px',
              padding: isMobile ? '18px' : '22px 24px',
              maxWidth: isMobile ? 'none' : '360px',
              boxShadow: '0 16px 36px rgba(3,58,67,0.28)',
            }}>
              <h3 style={{
                color: 'white', fontSize: isMobile ? '20px' : '24px', fontWeight: 800,
                margin: 0, marginBottom: '8px', fontFamily: FONT,
              }}>
                {t(`hospitalShowcase.locations.${activeHospital.locationKey}`)}
              </h3>
              <p style={{
                color: 'rgba(255,255,255,0.86)', fontSize: '14px', lineHeight: 1.65,
                margin: 0, fontFamily: FONT,
              }}>
                {t(`hospitalShowcase.descriptions.${activeHospital.descKey}`)}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
