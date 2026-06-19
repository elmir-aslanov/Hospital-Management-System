import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function SiteMapPage() {
  const { t } = useTranslation()
  const links = [
    ['/', 'nav.home'],
    ['/hekimler', 'nav.doctors'],
    ['/departments', 'nav.departments'],
    ['/services', 'nav.services'],
    ['/randevu', 'nav.appointment'],
    ['/e-netice', 'nav.eResult'],
    ['/blog', 'nav.blog'],
    ['/contact', 'nav.contact'],
    ['/visitor-info/atms', 'nav.atms'],
    ['/visitor-info/cafeteria', 'nav.cafeteria'],
    ['/visitor-info/restaurant', 'nav.restaurant'],
    ['/visitor-info/wifi', 'nav.wifi'],
  ]

  return (
    <main style={{ minHeight: '65vh', background: '#f6f9fa', padding: '72px 20px', fontFamily: "'Source Sans 3', 'Raleway', sans-serif" }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <h1 style={{ margin: '0 0 12px', color: '#071B3B', fontSize: 36 }}>{t('accessibility.siteMap')}</h1>
        <p style={{ margin: '0 0 30px', color: '#62718A', fontSize: 16 }}>{t('accessibility.siteMapDescription')}</p>
        <nav aria-label={t('accessibility.siteMap')} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          {links.map(([to, key]) => (
            <Link key={to} to={to} style={{
              minHeight: 54, padding: '14px 16px', display: 'flex', alignItems: 'center',
              border: '1px solid #dce6e9', borderRadius: 12, background: '#fff',
              color: '#071B3B', fontWeight: 700, textDecoration: 'none',
            }}>
              {t(key)}
            </Link>
          ))}
        </nav>
      </div>
    </main>
  )
}

