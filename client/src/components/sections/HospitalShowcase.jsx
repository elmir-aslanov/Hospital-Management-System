import { useState } from 'react'
import { useBreakpoint } from '../../hooks/useBreakpoint'

const FONT = "'Source Sans 3', 'Raleway', sans-serif"
const TEAL = '#00848e'

const hospitals = [
  { name: 'Aslan Medical Center', image: '/AslanMedical2.png', desc: 'Sağlamlıqda multidisiplinar yanaşması, müasir infrastrukturu və texnologiya imkanları ilə Bakının mərkəzində xidmət göstərir.' },
  { name: 'Filial 1', image: '/Filial1.png', desc: 'Müasir tibbi avadanlıqlar və peşəkar heyəti ilə keyfiyyətli səhiyyə xidməti göstərir.' },
  { name: 'Filial 2', image: '/Filial2.png', desc: 'Geniş ixtisas üzrə diaqnostika və müalicə xidmətləri təklif edir.' },
]

export default function HospitalShowcase() {
  const { isMobile } = useBreakpoint()
  const [active, setActive] = useState(0)

  const prev = () => setActive(i => (i - 1 + hospitals.length) % hospitals.length)
  const next = () => setActive(i => (i + 1) % hospitals.length)

  return (
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
            Ekspert həkimlərlə keyfiyyətli səhiyyəyə çevrilmiş qabaqcıl tibbi texnologiyalar!
          </h2>

          {/* Label + arrows */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{
              fontWeight: 600,
              fontSize: '16px',
              color: '#0a1628',
              fontFamily: FONT,
            }}>
              Xəstəxanamız
            </span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
              <button
                onClick={prev}
                aria-label="Əvvəlki"
                style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  border: '1px solid #ccc', background: 'white',
                  color: TEAL, fontSize: '16px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: FONT,
                }}
              >←</button>
              <button
                onClick={next}
                aria-label="Növbəti"
                style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  border: '1px solid #ccc', background: 'white',
                  color: TEAL, fontSize: '16px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: FONT,
                }}
              >→</button>
            </div>
          </div>

          {/* Thumbnails */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px', overflowX: 'hidden' }}>
            {hospitals.map((h, i) => (
              <div
                key={h.name}
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
                  {h.name}
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
              {hospitals[active].name}
            </h3>
            <p style={{
              color: 'white', fontSize: '14px', lineHeight: 1.6,
              margin: 0, fontFamily: FONT,
            }}>
              {hospitals[active].desc}
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
