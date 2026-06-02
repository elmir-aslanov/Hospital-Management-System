import { useNavigate } from 'react-router-dom'
import usePageTitle from '../../hooks/usePageTitle'

const FONT = "'Source Sans 3', 'Raleway', sans-serif"
const TEAL = '#00848e'
const NAVY = '#0a1628'

export default function NotFoundPage() {
  usePageTitle('Səhifə tapılmadı')
  const navigate = useNavigate()
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{ fontSize: 120, fontWeight: 900, color: TEAL, lineHeight: 1, fontFamily: "'Raleway', sans-serif", opacity: 0.15 }}>404</div>
        <div style={{ marginTop: -40, marginBottom: 16 }}>
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="1.2" style={{ opacity: 0.6 }}>
            <circle cx="12" cy="12" r="10"/>
            <path d="M16 16s-1.5-2-4-2-4 2-4 2"/>
            <line x1="9" y1="9" x2="9.01" y2="9" strokeLinecap="round" strokeWidth="2.5"/>
            <line x1="15" y1="9" x2="15.01" y2="9" strokeLinecap="round" strokeWidth="2.5"/>
          </svg>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: NAVY, margin: '0 0 12px', fontFamily: "'Raleway', sans-serif" }}>
          Səhifə tapılmadı
        </h1>
        <p style={{ fontSize: 15, color: '#64748b', margin: '0 0 32px', lineHeight: 1.6 }}>
          Axtardığınız səhifə mövcud deyil və ya köçürülmüş ola bilər.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate(-1)}
            style={{ padding: '11px 24px', border: '1.5px solid #e2e8f0', borderRadius: 10, background: 'white', fontSize: 14, fontWeight: 600, color: '#475569', cursor: 'pointer', fontFamily: FONT, transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = TEAL; e.currentTarget.style.color = TEAL }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569' }}
          >← Geri</button>
          <button onClick={() => navigate('/')}
            style={{ padding: '11px 24px', border: 'none', borderRadius: 10, background: TEAL, fontSize: 14, fontWeight: 600, color: 'white', cursor: 'pointer', fontFamily: FONT, boxShadow: '0 4px 16px rgba(0,132,142,0.3)', transition: 'all 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#006b74')}
            onMouseLeave={e => (e.currentTarget.style.background = TEAL)}
          >🏠 Ana Səhifə</button>
        </div>
      </div>
    </div>
  )
}
