import { Link } from 'react-router-dom';

const NAVY = '#466B7C';
const TEAL = '#00848e';

// ── Social icons ──────────────────────────────────────────────────────────────
const IgIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
  </svg>
);
const FbIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
const LiIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);
const YtIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.97C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill={NAVY}/>
  </svg>
);
const WaIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
  </svg>
);

const SOCIALS = [
  { Icon: IgIcon, label: 'Instagram', href: 'https://instagram.com' },
  { Icon: FbIcon, label: 'Facebook',  href: 'https://facebook.com' },
  { Icon: LiIcon, label: 'LinkedIn',  href: 'https://linkedin.com' },
  { Icon: YtIcon, label: 'YouTube',   href: 'https://youtube.com' },
  { Icon: WaIcon, label: 'WhatsApp',  href: 'https://wa.me/994508363694' },
];

const KLINIKA_LINKS = [
  { label: 'Haqqımızda', to: '/about' },
  { label: 'Xidmətlər', to: '/services' },
  { label: 'Həkimlər',  to: '/hekimler' },
  { label: 'Əlaqə',     to: '/contact' },
];

const PASIYENT_LINKS = [
  { label: 'Xidmətlər',  to: '/services' },
  { label: 'Randevu',    to: '/randevu' },
  { label: 'Məlumatlar', to: '#' },
];

const linkStyle = {
  fontSize: 14,
  fontWeight: 500,
  color: 'rgba(255,255,255,0.7)',
  textDecoration: 'none',
  lineHeight: 1.7,
  transition: 'color 0.18s',
};

function NavLink({ to, label }) {
  const handleEnter = e => { e.currentTarget.style.color = TEAL; };
  const handleLeave = e => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; };

  if (to === '#') {
    return (
      <li>
        <a href="#" style={linkStyle} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
          {label}
        </a>
      </li>
    );
  }
  return (
    <li>
      <Link to={to} style={linkStyle} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
        {label}
      </Link>
    </li>
  );
}

function ColHead({ children }) {
  return (
    <h3 style={{
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '2px',
      textTransform: 'uppercase',
      color: 'rgba(255,255,255,0.5)',
      margin: '0 0 20px',
    }}>
      {children}
    </h3>
  );
}

export default function Footer() {
  return (
    <footer style={{ background: NAVY, margin: 0, padding: 0 }}>

      {/* ── Wave: white above curve, navy below ──────────────────────────────── */}
      <div style={{ background: 'white', lineHeight: 0, display: 'block', overflow: 'hidden' }}>
        <svg viewBox="0 0 1440 100" xmlns="http://www.w3.org/2000/svg"
          style={{ display: 'block', width: '100%', height: '100px' }}
          preserveAspectRatio="none">
          <path d="M0,40 C240,100 480,0 720,50 C960,100 1200,20 1440,60 L1440,100 L0,100 Z"
            fill={NAVY} />
          <path d="M0,60 C300,20 600,80 900,40 C1100,20 1300,70 1440,50 L1440,100 L0,100 Z"
            fill={NAVY} opacity="0.6" />
        </svg>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <div style={{ background: NAVY, maxWidth: 1200, margin: '0 auto', padding: '60px 40px 0' }}>

        {/* ── 4-column grid ────────────────────────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '48px',
          alignItems: 'start',
        }}>

          {/* Column 1 — Brand */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Link to="/" style={{ alignSelf: 'flex-start' }}>
              <img
                src="/logo.png"
                alt="Aslan Medical Center"
                style={{ height: 96, width: 'auto', objectFit: 'contain', filter: 'none', background: 'transparent', padding: 0, border: 'none', borderRadius: 0 }}
                onError={e => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling.style.display = 'flex';
                }}
              />
              <div style={{ display: 'none', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8, background: TEAL,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 18, fontWeight: 900,
                }}>+</div>
                <span style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>Aslan Medical</span>
              </div>
            </Link>

            <p style={{ fontSize: 13, fontStyle: 'italic', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, margin: 0 }}>
              Sağlamlığınız üçün etibarlı tərəfdaş
            </p>

            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
              BAKI · 24/7
            </p>
          </div>

          {/* Column 2 — Klinika */}
          <div>
            <ColHead>KLİNİKA</ColHead>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {KLINIKA_LINKS.map(l => <NavLink key={l.label} {...l} />)}
            </ul>
          </div>

          {/* Column 3 — Pasiyent */}
          <div>
            <ColHead>PASİYENT</ColHead>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {PASIYENT_LINKS.map(l => <NavLink key={l.label} {...l} />)}
            </ul>
          </div>

          {/* Column 4 — Contact */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <ColHead>ƏLAQƏ</ColHead>

            <a href="tel:+994508363694" style={{
              fontSize: 28, fontWeight: 700, color: '#fff',
              textDecoration: 'none', lineHeight: 1.2, transition: 'color 0.18s',
            }}
              onMouseEnter={e => { e.currentTarget.style.color = TEAL; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#fff'; }}
            >
              +994 50 836 36 94
            </a>

            <a href="mailto:info@aslanmedical.az" style={{
              fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.7)',
              textDecoration: 'none', transition: 'color 0.18s',
            }}
              onMouseEnter={e => { e.currentTarget.style.color = TEAL; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
            >
              info@aslanmedical.az
            </a>

            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.5 }}>
              Xətai ray, Afiyəddin Cəlilov küçəsi, Bakı
            </p>

            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', margin: 0 }}>
              Hər gün: 24/7
            </p>

            <div style={{ marginTop: 4 }}>
              <Link to="/randevu" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                borderRadius: 999, border: '1px solid rgba(255,255,255,0.25)',
                padding: '10px 20px', fontSize: 14, fontWeight: 500,
                color: 'rgba(255,255,255,0.85)', textDecoration: 'none',
                transition: 'border-color 0.18s, color 0.18s, background 0.18s',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = TEAL;
                  e.currentTarget.style.color = TEAL;
                  e.currentTarget.style.background = 'rgba(0,132,142,0.1)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Randevu Al
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </Link>
            </div>

            {/* Social icons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, paddingTop: 8 }}>
              {SOCIALS.map(({ Icon, label, href }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  aria-label={label}
                  style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'color 0.18s' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* ── Bottom row ───────────────────────────────────────────────────────── */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          marginTop: 48,
          padding: '20px 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
            © 2026 Aslan Medical Center
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            {[
              { label: 'Məxfilik', to: '/about' },
              { label: 'Şərtlər',  to: '/about' },
              { label: 'Əlaqə',    to: '/contact' },
            ].map(({ label, to }) => (
              <Link key={label} to={to} style={{
                fontSize: 12, color: 'rgba(255,255,255,0.4)',
                textDecoration: 'none', transition: 'color 0.18s',
              }}
                onMouseEnter={e => { e.currentTarget.style.color = TEAL; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
