import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useBreakpoint } from '../hooks/useBreakpoint'

const FONT = "'Source Sans 3', 'Raleway', sans-serif"
const TEAL = '#00848e'
const NAVY = '#0a1628'

export default function Footer() {
  const { t } = useTranslation()
  const { isMobile, isTablet } = useBreakpoint()
  const year = new Date().getFullYear()
  return (
    <footer style={{ background: NAVY, color: 'white', fontFamily: FONT }}>
      <div
        className="footer-wave"
        aria-hidden="true"
        style={{
          height: 'clamp(86px, 9vw, 132px)',
          background: '#ffffff',
          lineHeight: 0,
          overflow: 'hidden',
        }}
      >
        <svg
          viewBox="0 0 1440 170"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: 'block', width: '100%', height: '100%' }}
        >
          <path
            d="M0 44 C165 18 310 74 470 48 C620 24 760 23 910 50 C1085 82 1235 28 1440 46"
            fill="none"
            stroke="rgba(100,116,139,0.45)"
            strokeWidth="1.2"
          />
          <path
            d="M0 67 C190 35 350 91 545 64 C720 40 875 35 1045 66 C1205 95 1335 58 1440 62"
            fill="none"
            stroke="rgba(148,163,184,0.55)"
            strokeWidth="1.1"
          />
          <path
            d="M0 88 C180 58 345 111 535 86 C735 60 880 55 1065 86 C1218 112 1350 83 1440 82"
            fill="none"
            stroke="rgba(11,29,52,0.35)"
            strokeWidth="1.2"
          />
          <path
            d="M0 116 C155 84 320 129 505 108 C700 86 850 76 1040 104 C1190 126 1320 104 1440 94 L1440 170 L0 170 Z"
            fill={NAVY}
          />
        </svg>
      </div>

      {/* Main footer grid */}
      <div style={{ maxWidth: 1140, margin: '0 auto', padding: isMobile ? '32px 16px 24px' : '52px 32px 36px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : '2fr 1fr 1fr 1.5fr', gap: 48 }}>

        {/* Col 1 — Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <img src="/logonew.jpg" alt="Aslan Medical" style={{ height: isMobile ? 48 : 60, maxWidth: isMobile ? 170 : 210, width: 'auto', objectFit: 'contain' }} onError={e => (e.target.style.display = 'none')} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: '0.08em' }}>ASLAN</div>
              <div style={{ fontSize: 9, color: TEAL, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>MEDICAL CENTER</div>
            </div>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, margin: '0 0 20px', maxWidth: 260 }}>
            Azərbaycanda ən müasir tibbi texnologiyalar və peşəkar həkim heyəti ilə xidmətinizdəyik.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { label: 'X',        href: 'https://x.com',         svg: <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
              { label: 'Instagram', href: 'https://instagram.com', svg: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg> },
              { label: 'LinkedIn',  href: 'https://linkedin.com',  svg: <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg> },
              { label: 'Facebook',  href: 'https://facebook.com',  svg: <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg> },
            ].map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = TEAL; e.currentTarget.style.color = 'white' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
              >{s.svg}</a>
            ))}
          </div>
        </div>

        {/* Col 2 — Quick links */}
        <div>
          <h4 style={{ fontSize: 13, fontWeight: 700, color: 'white', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 18px' }}>{t('footer.quickLinks')}</h4>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Ana Səhifə', to: '/'            },
              { label: 'Həkimlər',   to: '/hekimler'    },
              { label: 'Şöbələr',    to: '/departments'  },
              { label: 'Bloq',       to: '/blog'         },
              { label: 'Əlaqə',      to: '/contact'      },
            ].map(l => (
              <Link key={l.to} to={l.to}
                style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = TEAL)}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
              >{l.label}</Link>
            ))}
          </nav>
        </div>

        {/* Col 3 — Services */}
        <div>
          <h4 style={{ fontSize: 13, fontWeight: 700, color: 'white', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 18px' }}>{t('footer.services')}</h4>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {['Randevu Al', 'E-Nəticə', 'Laboratoriya', 'Kardiologiya', 'Nevrologiya', 'Cərrahiyyə'].map(s => (
              <span key={s} style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>{s}</span>
            ))}
          </nav>
        </div>

        {/* Col 4 — Contact */}
        <div>
          <h4 style={{ fontSize: 13, fontWeight: 700, color: 'white', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 18px' }}>{t('footer.contactInfo')}</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { icon: <svg width="14" height="14" fill="none" stroke={TEAL} strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>, text: 'Xətai ray., A. Cəlilov küçəsi, Bakı' },
              { icon: <svg width="14" height="14" fill="none" stroke={TEAL} strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 5.5 5.5l.76-.76a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z"/></svg>, text: '+994 50 836 36 94', href: 'tel:+994508363694' },
              { icon: <svg width="14" height="14" fill="none" stroke={TEAL} strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>, text: 'info@aslanmedical.az', href: 'mailto:info@aslanmedical.az' },
              { icon: <svg width="14" height="14" fill="none" stroke={TEAL} strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, text: 'B.E–Cümə: 08:00–20:00' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ marginTop: 1, flexShrink: 0 }}>{item.icon}</span>
                {item.href
                  ? <a href={item.href}
                      style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', textDecoration: 'none', transition: 'color 0.2s', lineHeight: 1.5 }}
                      onMouseEnter={e => (e.currentTarget.style.color = TEAL)}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
                    >{item.text}</a>
                  : <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>{item.text}</span>
                }
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '18px 32px' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 8 : 0, textAlign: isMobile ? 'center' : 'left' }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
            © {year} Aslan Medical Center. {t('footer.rights')}.
          </span>
          <div style={{ display: 'flex', gap: 20 }}>
            {[[t('footer.privacy'), '/gizlilik'], [t('footer.terms'), '/xidmet-shertleri']].map(([label, to]) => (
              <Link key={to} to={to}
                style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = TEAL)}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
              >{label}</Link>
            ))}
          </div>
        </div>
      </div>

    </footer>
  )
}
