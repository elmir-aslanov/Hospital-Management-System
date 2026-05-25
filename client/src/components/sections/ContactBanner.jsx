import { useNavigate } from 'react-router-dom'

const FONT = "'Source Sans 3', 'Raleway', sans-serif"

const Hex = () => (
  <svg width="70" height="70" viewBox="0 0 70 70" fill="none">
    <polygon
      points="35,4 64,19 64,51 35,66 6,51 6,19"
      stroke="#e53e3e" strokeWidth="1.5" fill="none"
    />
  </svg>
)

export default function ContactBanner() {
  const isMobile = window.innerWidth < 768
  const navigate = useNavigate()

  return (
    <div style={{ width: '100%', boxSizing: 'border-box', background: '#fff5f5' }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: window.innerWidth < 768 ? '60px 16px' : '80px 48px',
        boxSizing: 'border-box',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* Top-left hexagons */}
        <div style={{ position: 'absolute', top: '20px', left: '40px', opacity: 0.4, display: 'flex', gap: '4px', pointerEvents: 'none' }}>
          <Hex /><Hex />
        </div>

        {/* Top-right hexagons */}
        <div style={{ position: 'absolute', top: '10px', right: '60px', opacity: 0.15, display: 'flex', gap: '4px', pointerEvents: 'none' }}>
          <Hex /><Hex />
        </div>

        {/* Bottom-right hexagons */}
        <div style={{ position: 'absolute', bottom: '20px', right: '40px', opacity: 0.2, display: 'flex', gap: '4px', pointerEvents: 'none' }}>
          <Hex /><Hex />
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
            onClick={() => navigate('/elektron-muraciet')}
            style={{
              background: '#e53e3e',
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

      </div>
    </div>
  )
}
