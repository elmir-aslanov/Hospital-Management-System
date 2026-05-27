import { useNavigate } from 'react-router-dom'

const FONT = "'Source Sans 3', 'Raleway', sans-serif"

/* ── Inline SVG atoms ──────────────────────────────────────────────────── */
const Hex = ({ size = 80, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" style={style}>
    <polygon
      points="40,4 74,22 74,58 40,76 6,58 6,22"
      fill="none"
      stroke="rgba(29,182,166,0.22)"
      strokeWidth="1.5"
    />
  </svg>
)

const DotGrid = ({ style = {} }) => (
  <svg
    width="88" height="88" viewBox="0 0 88 88"
    style={{ pointerEvents: 'none', ...style }}
  >
    {[0, 1, 2, 3, 4, 5, 6].flatMap(row =>
      [0, 1, 2, 3, 4, 5, 6].map(col => (
        <circle
          key={`${row}-${col}`}
          cx={4 + col * 14} cy={4 + row * 14}
          r="2" fill="rgba(29,182,166,0.22)"
        />
      ))
    )}
  </svg>
)

const HeartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#1DB6A6">
    <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z" />
  </svg>
)

const BadgeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0E8F96" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)

const MailIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
)

const ArrowRight = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
)

/* ── Component ─────────────────────────────────────────────────────────── */
export default function ContactBanner() {
  const isMobile = window.innerWidth < 768
  const navigate = useNavigate()

  return (
    <div style={{
      width: '100%',
      boxSizing: 'border-box',
      background: `
        radial-gradient(circle at top left,  rgba(29,182,166,0.12), transparent 35%),
        radial-gradient(circle at top right, rgba(29,182,166,0.10), transparent 35%),
        linear-gradient(180deg, #F8FCFD 0%, #EAF8FA 55%, #FFFFFF 100%)
      `,
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Hexagon cluster — left */}
      {!isMobile && (
        <div style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', opacity: 0.3 }}>
          <Hex size={130} style={{ position: 'absolute', top: '-15px', left: '-25px' }} />
          <Hex size={85}  style={{ position: 'absolute', top: '95px',  left: '85px'  }} />
          <Hex size={58}  style={{ position: 'absolute', top: '190px', left: '15px'  }} />
          <Hex size={44}  style={{ position: 'absolute', top: '50px',  left: '175px' }} />
        </div>
      )}

      {/* Hexagon cluster — right */}
      {!isMobile && (
        <div style={{ position: 'absolute', top: 0, right: 0, pointerEvents: 'none', opacity: 0.3 }}>
          <Hex size={130} style={{ position: 'absolute', top: '-15px', right: '-25px' }} />
          <Hex size={85}  style={{ position: 'absolute', top: '95px',  right: '85px'  }} />
          <Hex size={58}  style={{ position: 'absolute', top: '190px', right: '15px'  }} />
          <Hex size={44}  style={{ position: 'absolute', top: '50px',  right: '175px' }} />
        </div>
      )}

      {/* Dot grid accents */}
      {!isMobile && (
        <>
          <DotGrid style={{ position: 'absolute', bottom: 44, left: 52 }} />
          <DotGrid style={{ position: 'absolute', bottom: 44, right: 52 }} />
        </>
      )}

      {/* ── Main content ──────────────────────────────────────────────── */}
      <div style={{
        maxWidth: 760,
        margin: '0 auto',
        padding: isMobile ? '56px 20px 72px' : '88px 32px 100px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1,
      }}>

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          background: 'rgba(255,255,255,0.72)',
          border: '1px solid rgba(29,182,166,0.2)',
          borderRadius: 100,
          padding: '7px 16px',
          marginBottom: 28,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}>
          <BadgeIcon />
          <span style={{
            fontSize: 13, fontWeight: 600, color: '#0E8F96',
            letterSpacing: '0.01em', fontFamily: FONT,
          }}>
            Sizin rəyiniz bizim üçün dəyərlidir
          </span>
        </div>

        {/* Heading */}
        <h2 style={{
          fontSize: isMobile ? '28px' : '42px',
          fontWeight: 800,
          color: '#0B1D34',
          lineHeight: 1.15,
          marginBottom: 22,
          fontFamily: "'Raleway', sans-serif",
          letterSpacing: '-0.02em',
        }}>
          Təklif və ya tələblərinizi<br />dinləməkdən məmnun olarıq
        </h2>

        {/* Decorative divider */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 14, marginBottom: 22,
        }}>
          <div style={{
            width: 52, height: 1.5,
            background: 'linear-gradient(to right, transparent, #1DB6A6)',
            borderRadius: 2,
          }} />
          <HeartIcon />
          <div style={{
            width: 52, height: 1.5,
            background: 'linear-gradient(to left, transparent, #1DB6A6)',
            borderRadius: 2,
          }} />
        </div>

        {/* Subtitle */}
        <p style={{
          fontSize: isMobile ? '15px' : '17px',
          color: '#4B6473',
          lineHeight: 1.75,
          maxWidth: 580,
          margin: '0 auto 40px',
          fontFamily: FONT,
        }}>
          Rəy və təkliflərinizi bizimlə paylaşın, xidmət keyfiyyətimizi birlikdə artıraq və daha yaxşısını birlikdə edək.
        </p>

        {/* CTA button */}
        <button
          onClick={() => navigate('/elektron-muraciet')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: 'linear-gradient(135deg, #1DB6A6 0%, #0E8F96 100%)',
            color: 'white', border: 'none',
            padding: '0 36px', height: 56,
            fontSize: 16, fontWeight: 600,
            borderRadius: 14, cursor: 'pointer', fontFamily: FONT,
            boxShadow: '0 14px 32px rgba(14,143,150,0.28)',
            transition: 'transform 0.22s, box-shadow 0.22s, background 0.22s',
            letterSpacing: '0.01em',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 20px 44px rgba(14,143,150,0.38)'
            e.currentTarget.style.background = 'linear-gradient(135deg, #22c5b4 0%, #0c7e86 100%)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 14px 32px rgba(14,143,150,0.28)'
            e.currentTarget.style.background = 'linear-gradient(135deg, #1DB6A6 0%, #0E8F96 100%)'
          }}
        >
          <MailIcon />
          Elektron müraciət ünvanla
          <ArrowRight />
        </button>

      </div>

      {/* Bottom wave */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, overflow: 'hidden', lineHeight: 0 }}>
        <svg viewBox="0 0 1440 40" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%' }}>
          <path d="M0,20 C360,40 1080,0 1440,20 L1440,40 L0,40 Z" fill="white" opacity="0.7" />
        </svg>
      </div>

    </div>
  )
}
