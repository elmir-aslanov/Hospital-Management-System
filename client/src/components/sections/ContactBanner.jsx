import { useNavigate } from 'react-router-dom'

const FONT = "'Source Sans 3', 'Raleway', sans-serif"

export default function ContactBanner() {
  const isMobile = window.innerWidth < 768
  const navigate = useNavigate()

  return (
    <div style={{ width: '100%', boxSizing: 'border-box', background: '#e8f6f8' }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: window.innerWidth < 768 ? '60px 16px' : '80px 48px',
        boxSizing: 'border-box',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>

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
    </div>
  )
}
