import { useBreakpoint } from '../../hooks/useBreakpoint'

const FONT = "'Source Sans 3', 'Raleway', sans-serif"
const TEAL = '#00848e'

export default function HospitalShowcase() {
  const { isMobile } = useBreakpoint()

  return (
    <div style={{
      maxWidth: '1280px',
      margin: '0 auto',
      padding: isMobile ? '40px 16px' : '60px 48px',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: '40px',
        alignItems: 'stretch',
      }}>

        {/* LEFT COLUMN */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: '#e8f6f8',
          borderRadius: '16px',
          padding: '40px 32px',
          boxSizing: 'border-box',
        }}>

          <h2 style={{
            fontSize: isMobile ? '24px' : '36px',
            fontWeight: 700,
            color: TEAL,
            lineHeight: 1.4,
            margin: 0,
            marginBottom: '32px',
            fontFamily: FONT,
          }}>
            Ekspert həkimlərlə keyfiyyətli səhiyyəyə çevrilmiş qabaqcıl tibbi texnologiyalar!
          </h2>

          {/* Label + arrows */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <span style={{
              fontWeight: 600,
              color: '#0a1628',
              fontSize: '18px',
              fontFamily: FONT,
            }}>
              Xəstəxanamız
            </span>
            <button
              aria-label="Əvvəlki"
              style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'white', border: '1px solid #ddd',
                color: TEAL, fontSize: '16px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >←</button>
            <button
              aria-label="Növbəti"
              style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'white', border: '1px solid #ddd',
                color: TEAL, fontSize: '16px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >→</button>
          </div>

          {/* Thumbnail row */}
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              <img
                src="/AslanMedical2.png"
                alt="Aslan Medical Center"
                style={{
                  width: '160px', height: '100px',
                  borderRadius: '8px', objectFit: 'cover',
                  display: 'block',
                }}
                onError={e => { e.currentTarget.style.background = '#c8e6ea'; }}
              />
              <span style={{ fontSize: '12px', textAlign: 'center', color: '#555', fontFamily: FONT }}>
                Aslan Medical Center
              </span>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div style={{
          flex: 1,
          borderRadius: '16px',
          overflow: 'hidden',
          minHeight: '400px',
          position: 'relative',
        }}>
          <img
            src="/AslanMedical2.png"
            alt="Aslan Medical Center"
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
            background: 'rgba(0,132,142,0.85)',
            borderRadius: '12px', padding: '24px',
            maxWidth: '320px',
          }}>
            <h3 style={{
              color: 'white', fontSize: '22px', fontWeight: 700,
              margin: '0 0 10px', fontFamily: FONT,
            }}>
              Aslan Medical Center
            </h3>
            <p style={{
              color: 'white', fontSize: '14px', lineHeight: 1.6,
              margin: 0, fontFamily: FONT,
            }}>
              Sağlamlıqda multidisiplinar yanaşması, müasir infrastrukturu və texnologiya imkanları ilə Bakının mərkəzində xidmət göstərir.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
