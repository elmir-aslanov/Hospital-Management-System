import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const ContactBanner = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const isMobile = window.innerWidth < 768

  return (
    <div style={{
      width: '100%',
      boxSizing: 'border-box',
      position: 'relative',
      overflow: 'hidden',
      background: 'radial-gradient(circle at top left, rgba(29,182,166,0.12), transparent 35%), radial-gradient(circle at top right, rgba(29,182,166,0.10), transparent 35%), linear-gradient(180deg, #F8FCFD 0%, #EAF8FA 55%, #FFFFFF 100%)',
      padding: isMobile ? '60px 16px 80px' : '80px 48px 100px',
    }}>

      {/* Hexagons left */}
      {!isMobile && (
        <div style={{ position: 'absolute', left: 40, top: 40, opacity: 0.3 }}>
          <svg width="220" height="260" viewBox="0 0 220 260" fill="none">
            <polygon points="60,10 110,10 135,52 110,94 60,94 35,52" stroke="#1DB6A6" strokeWidth="1.5" fill="none"/>
            <polygon points="10,90 60,90 85,132 60,174 10,174 -15,132" stroke="#1DB6A6" strokeWidth="1" fill="none" opacity="0.6"/>
            <polygon points="100,150 150,150 175,192 150,234 100,234 75,192" stroke="#1DB6A6" strokeWidth="1" fill="none" opacity="0.4"/>
            <polygon points="0,180 40,180 60,214 40,248 0,248 -20,214" stroke="#1DB6A6" strokeWidth="1" fill="none" opacity="0.3"/>
          </svg>
        </div>
      )}

      {/* Hexagons right */}
      {!isMobile && (
        <div style={{ position: 'absolute', right: 40, top: 30, opacity: 0.3 }}>
          <svg width="220" height="260" viewBox="0 0 220 260" fill="none">
            <polygon points="110,10 160,10 185,52 160,94 110,94 85,52" stroke="#1DB6A6" strokeWidth="1.5" fill="none"/>
            <polygon points="150,90 200,90 225,132 200,174 150,174 125,132" stroke="#1DB6A6" strokeWidth="1" fill="none" opacity="0.6"/>
            <polygon points="60,150 110,150 135,192 110,234 60,234 35,192" stroke="#1DB6A6" strokeWidth="1" fill="none" opacity="0.4"/>
            <polygon points="170,170 210,170 230,204 210,238 170,238 150,204" stroke="#1DB6A6" strokeWidth="1" fill="none" opacity="0.3"/>
          </svg>
        </div>
      )}

      {/* Dot pattern left */}
      {!isMobile && (
        <div style={{ position: 'absolute', bottom: 60, left: 60, opacity: 0.25 }}>
          <svg width="80" height="80" viewBox="0 0 80 80">
            {[0,1,2,3,4].map(row => [0,1,2,3,4].map(col => (
              <circle key={`${row}-${col}`} cx={col*16+8} cy={row*16+8} r="2" fill="#1DB6A6"/>
            )))}
          </svg>
        </div>
      )}

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '760px', minWidth: 0, margin: '0 auto' }}>

        {/* Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 8, maxWidth: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.65)', border: '1px solid rgba(29,182,166,0.18)', borderRadius: 999, padding: '7px 18px', marginBottom: 24, backdropFilter: 'blur(8px)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0E8F96" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span style={{ minWidth: 0, fontSize: 11, fontWeight: 700, color: '#0E8F96', letterSpacing: '0.08em', textTransform: 'uppercase', textAlign: 'center', overflowWrap: 'break-word', wordBreak: 'normal', hyphens: 'auto' }}>
            {t('contactBanner.badge')}
          </span>
        </div>

        {/* Heading */}
        <h2 style={{ fontSize: isMobile ? 'clamp(26px, 8vw, 28px)' : 44, fontWeight: 800, color: '#0B1D34', lineHeight: 1.15, marginBottom: 20, maxWidth: '100%', overflowWrap: 'break-word', wordBreak: 'normal', hyphens: 'auto' }}>
          {t('contactBanner.titleLine1')}<br/>{t('contactBanner.titleLine2')}
        </h2>

        {/* Subtitle */}
        <p style={{ fontSize: 16, color: '#4B6473', lineHeight: 1.7, maxWidth: 560, margin: '0 auto 36px', overflowWrap: 'break-word', wordBreak: 'normal', hyphens: 'auto' }}>
          {t('contactBanner.subtitle')}
        </p>

        {/* Button */}
        <button
          onClick={() => navigate('/elektron-muraciet')}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 18px 40px rgba(14,143,150,0.35)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 14px 32px rgba(14,143,150,0.28)'
          }}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            background: 'linear-gradient(135deg, #1DB6A6 0%, #0E8F96 100%)',
            color: 'white', border: 'none', borderRadius: 14,
            padding: isMobile ? '14px 28px' : '16px 36px',
            fontSize: 16, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 14px 32px rgba(14,143,150,0.28)',
            transition: 'all 0.2s ease',
            maxWidth: '100%', boxSizing: 'border-box',
            whiteSpace: 'normal', textAlign: 'center',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
          </svg>
          <span style={{ minWidth: 0, overflowWrap: 'break-word', wordBreak: 'normal', hyphens: 'auto' }}>
            {t('contactBanner.button')}
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>

      {/* Bottom wave */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, lineHeight: 0 }}>
        <svg viewBox="0 0 1440 50" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%' }}>
          <path d="M0,25 C360,50 1080,0 1440,25 L1440,50 L0,50 Z" fill="rgba(255,255,255,0.5)"/>
        </svg>
      </div>
    </div>
  )
}

export default ContactBanner
