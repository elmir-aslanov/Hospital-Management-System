import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const FONT = "'Source Sans 3', 'Raleway', sans-serif"

const Hexagon = ({ width = 80, height = 80, strokeWidth = 2, opacity = 0.3, animate }) => (
  <motion.svg
    width={width} height={height} viewBox="0 0 80 80" style={{ opacity }}
    animate={animate}
    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
  >
    <polygon points="40,4 74,22 74,58 40,76 6,58 6,22" fill="none" stroke="#00848e" strokeWidth={strokeWidth} />
  </motion.svg>
)

export default function ContactBanner() {
  const isMobile = window.innerWidth < 768
  const navigate = useNavigate()

  return (
    <section style={{
      width: '100%',
      boxSizing: 'border-box',
      background: '#e8f6f8',
      overflow: 'hidden',
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: isMobile ? '60px 16px' : '80px 48px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* Top-left hexagons */}
        <div style={{ position: 'absolute', top: '20px', left: '40px', display: 'flex', gap: '8px', pointerEvents: 'none' }}>
          <Hexagon width={80} height={80} opacity={0.3} animate={{ y: [0, -10, 0], rotate: [0, 10, 0] }} />
          <Hexagon width={80} height={80} opacity={0.3} animate={{ y: [0, 10, 0], rotate: [0, -8, 0] }} />
        </div>

        {/* Top-right hexagons */}
        <div style={{ position: 'absolute', top: '10px', right: '60px', display: 'flex', gap: '8px', pointerEvents: 'none' }}>
          <Hexagon width={100} height={100} opacity={0.15} animate={{ y: [0, 12, 0], rotate: [0, -12, 0] }} />
          <Hexagon width={100} height={100} opacity={0.15} animate={{ y: [0, -8, 0], rotate: [0, 10, 0] }} />
        </div>

        {/* Bottom-right hexagons */}
        <div style={{ position: 'absolute', bottom: '20px', right: '40px', display: 'flex', gap: '8px', pointerEvents: 'none' }}>
          <Hexagon width={90} height={90} opacity={0.2} animate={{ y: [0, -12, 0], rotate: [0, 8, 0] }} />
          <Hexagon width={90} height={90} opacity={0.2} animate={{ y: [0, 10, 0], rotate: [0, -10, 0] }} />
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
              background: '#e53e3e',
              color: 'white',
              border: 'none',
              padding: '16px 40px',
              fontSize: '16px',
              fontWeight: 500,
              cursor: 'pointer',
              borderRadius: '8px',
              fontFamily: FONT,
            }}
          >
            Elektron müraciət ünvanla
          </button>
        </div>

      </div>
    </section>
  )
}
