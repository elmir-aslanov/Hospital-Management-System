import { useNavigate } from 'react-router-dom'
import { useBreakpoint } from '../../hooks/useBreakpoint'

const FONT = "'Source Sans 3', 'Raleway', sans-serif"

const Hexagon = ({ width = 80, height = 80, strokeWidth = 2, opacity = 0.3 }) => (
  <svg width={width} height={height} viewBox="0 0 80 80" style={{ opacity }}>
    <polygon points="40,4 74,22 74,58 40,76 6,58 6,22" fill="none" stroke="#00848e" strokeWidth={strokeWidth} />
  </svg>
)

export default function ContactBanner() {
  const { isMobile } = useBreakpoint()
  const navigate = useNavigate()

  return (
    <section style={{
      background: '#e8f6f8',
      padding: isMobile ? '60px 16px' : '80px 48px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Top-left hexagons */}
      <div style={{ position: 'absolute', top: '20px', left: '40px', display: 'flex', gap: '8px', pointerEvents: 'none' }}>
        <Hexagon width={80} height={80} opacity={0.3} />
        <Hexagon width={80} height={80} opacity={0.3} />
      </div>

      {/* Top-right hexagons */}
      <div style={{ position: 'absolute', top: '10px', right: '60px', display: 'flex', gap: '8px', pointerEvents: 'none' }}>
        <Hexagon width={100} height={100} opacity={0.15} />
        <Hexagon width={100} height={100} opacity={0.15} />
      </div>

      {/* Bottom-right hexagons */}
      <div style={{ position: 'absolute', bottom: '20px', right: '40px', display: 'flex', gap: '8px', pointerEvents: 'none' }}>
        <Hexagon width={90} height={90} opacity={0.2} />
        <Hexagon width={90} height={90} opacity={0.2} />
      </div>

      {/* Main content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h2 style={{
          fontSize: isMobile ? '28px' : '42px',
          fontWeight: 500,
          color: '#1a1a1a',
          lineHeight: 1.4,
          marginBottom: '40px',
          fontFamily: FONT,
        }}>
          Təklif və ya tələblərinizi<br />dinləməkdən məmnun olarıq
        </h2>

        <button
          onClick={() => navigate('/elaqe')}
          style={{
            background: '#00848e',
            color: 'white',
            border: 'none',
            padding: '16px 40px',
            fontSize: '16px',
            fontWeight: 500,
            cursor: 'pointer',
            borderRadius: '4px',
            fontFamily: FONT,
          }}
        >
          Elektron müraciət ünvanla
        </button>
      </div>

    </section>
  )
}
