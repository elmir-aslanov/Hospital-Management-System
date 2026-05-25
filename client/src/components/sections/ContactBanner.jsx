import { useNavigate } from 'react-router-dom'

const FONT = "'Source Sans 3', 'Raleway', sans-serif"

const Hex = ({ size = 80, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" style={style}>
    <polygon points="40,4 74,22 74,58 40,76 6,58 6,22" fill="none" stroke="#00848e" strokeWidth="1.5" />
  </svg>
)

export default function ContactBanner() {
  const isMobile = window.innerWidth < 768
  const navigate = useNavigate()

  return (
    <div style={{ width: '100%', boxSizing: 'border-box', background: '#e8f6f8' }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: isMobile ? '60px 16px' : '80px 48px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* Background hexagons — left */}
        <div style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', opacity: 0.12 }}>
          <Hex size={100} style={{ position: 'absolute', top: '10px', left: '20px' }} />
          <Hex size={70}  style={{ position: 'absolute', top: '80px', left: '100px' }} />
          <Hex size={60}  style={{ position: 'absolute', top: '160px', left: '30px' }} />
          <Hex size={80}  style={{ position: 'absolute', top: '0px', left: '150px' }} />
        </div>

        {/* Background hexagons — right */}
        <div style={{ position: 'absolute', top: 0, right: 0, pointerEvents: 'none', opacity: 0.12 }}>
          <Hex size={100} style={{ position: 'absolute', top: '10px', right: '20px' }} />
          <Hex size={70}  style={{ position: 'absolute', top: '80px', right: '100px' }} />
          <Hex size={60}  style={{ position: 'absolute', top: '160px', right: '30px' }} />
          <Hex size={80}  style={{ position: 'absolute', top: '0px', right: '150px' }} />
        </div>

        {/* Main content */}
        <div style={{ position: 'relative', zIndex: 1 }}>

          {/* Heading */}
          <h2 style={{
            fontSize: isMobile ? '26px' : '38px',
            fontWeight: 700,
            color: '#0a1628',
            lineHeight: 1.4,
            marginBottom: '12px',
            fontFamily: FONT,
          }}>
            Təklif və ya tələblərinizi<br />dinləməkdən məmnun olarıq
          </h2>

          {/* Subtext */}
          <p style={{
            fontSize: '15px',
            color: '#555',
            marginBottom: '32px',
            fontFamily: FONT,
          }}>
            Rəy və təkliflərinizi bizimlə paylaşın, xidmət keyfiyyətimizi birlikdə artıraq.
          </p>

          {/* Button */}
          <button
            onClick={() => navigate('/elektron-muraciet')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              background: '#00848e', color: 'white', border: 'none',
              padding: '14px 36px', fontSize: '16px', fontWeight: 500,
              borderRadius: '8px', cursor: 'pointer', fontFamily: FONT,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            Elektron müraciət ünvanla
          </button>

        </div>
      </div>
    </div>
  )
}
