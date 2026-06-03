import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const FONT = "'Source Sans 3', 'Raleway', sans-serif"
const TEAL = '#00848e'

const hospitals = [
  { name: 'Aslan Medical Center', locationKey: 'baku', image: '/AslanMedical2.png', descKey: 'bakuDesc' },
  { name: 'Aslan Medical Center', locationKey: 'ankara', image: '/Filial1.png', descKey: 'ankaraDesc' },
  { name: 'Aslan Medical Center', locationKey: 'samsun', image: '/Filial2.png', descKey: 'samsunDesc' },
]

export default function HospitalShowcase() {
  const { t } = useTranslation()
  const isMobile = window.innerWidth < 768
  const [active, setActive] = useState(1)

  const prev = () => setActive(i => (i - 1 + hospitals.length) % hospitals.length)
  const next = () => setActive(i => (i + 1) % hospitals.length)

  return (
    <div style={{ width: '100%', boxSizing: 'border-box', margin: 0, background: '#f8fffe' }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: isMobile ? '40px 16px' : '60px 48px',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '32px',
          alignItems: 'stretch',
        }}>

          {/* LEFT COLUMN */}
          <div style={{
            flex: 1,
            background: '#e8f6f8',
            borderRadius: '16px',
            padding: isMobile ? '32px 20px' : '48px 40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            boxSizing: 'border-box',
          }}>

            <h2 style={{
              fontSize: isMobile ? '24px' : '36px',
              fontWeight: 700,
              color: TEAL,
              lineHeight: 1.4,
              margin: 0,
              marginBottom: '40px',
              fontFamily: FONT,
            }}>
              {t('hospitalShowcase.title')}
            </h2>

            {/* Label + arrows */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{
                fontWeight: 600,
                fontSize: '16px',
                color: '#0a1628',
                fontFamily: FONT,
              }}>
                {t('hospitalShowcase.label')}
              </span>
            </div>

            {/* Thumbnails */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px', overflowX: 'hidden' }}>
              {hospitals.map((h, i) => (
                <div
                  key={i}
                  onClick={() => setActive(i)}
                  style={{ width: '140px', flexShrink: 0, cursor: 'pointer' }}
                >
                  <img
                    src={h.image}
                    alt={h.name}
                    style={{
                      width: '140px', height: '90px',
                      objectFit: 'cover', borderRadius: '8px',
                      display: 'block',
                      border: i === active ? `2px solid ${TEAL}` : '2px solid transparent',
                    }}
                    onError={e => { e.currentTarget.style.background = '#c8e6ea'; }}
                  />
                  <p style={{
                    fontSize: '12px', textAlign: 'center',
                    color: i === active ? TEAL : '#666',
                    marginTop: '4px', marginBottom: 0,
                    fontFamily: FONT,
                  }}>
                    {t(`hospitalShowcase.locations.${h.locationKey}`)}
                  </p>
                </div>
              ))}
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div style={{
            flex: 1,
            position: 'relative',
            borderRadius: '16px',
            overflow: 'hidden',
            minHeight: '400px',
          }}>
            <img
              src={hospitals[active].image}
              alt={hospitals[active].name}
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
              onError={e => { e.currentTarget.style.background = '#c8e6ea'; }}
            />

            {/* Overlay card */}
            <div style={{
              position: 'absolute', bottom: '24px', left: '24px',
              background: 'rgba(0,132,142,0.88)',
              borderRadius: '12px', padding: '24px',
              maxWidth: '320px',
            }}>
              <h3 style={{
                color: 'white', fontSize: '20px', fontWeight: 700,
                margin: 0, marginBottom: '8px', fontFamily: FONT,
              }}>
                {t(`hospitalShowcase.locations.${hospitals[active].locationKey}`)}
              </h3>
              <p style={{
                color: 'white', fontSize: '14px', lineHeight: 1.6,
                margin: 0, fontFamily: FONT,
              }}>
                {t(`hospitalShowcase.descriptions.${hospitals[active].descKey}`)}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
