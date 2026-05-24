import { Link, useNavigate } from 'react-router-dom';
import { useBreakpoint } from '../hooks/useBreakpoint';

const BG      = '#0B1D34';
const NAVY2   = '#122A4A';
const TEAL    = '#1DB6A6';
const MUTED   = '#AFC7D6';
const LIGHT   = '#E6EDF3';
const WHITE   = '#FFFFFF';
const FONT    = "'Source Sans 3', 'Raleway', sans-serif";

/* ── Social SVG icons ─────────────────────────────────────────────────────── */
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
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);
const YtIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill={NAVY2}/>
  </svg>
);
const WaIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.944-1.418A9.959 9.959 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
  </svg>
);

const SOCIALS = [
  { Icon: IgIcon, label: 'Instagram', href: 'https://instagram.com' },
  { Icon: FbIcon, label: 'Facebook',  href: 'https://facebook.com' },
  { Icon: LiIcon, label: 'LinkedIn',  href: 'https://linkedin.com' },
  { Icon: YtIcon, label: 'YouTube',   href: 'https://youtube.com'  },
  { Icon: WaIcon, label: 'WhatsApp',  href: 'https://wa.me/994508363694' },
];

/* ── Reusable sub-components ─────────────────────────────────────────────── */
function ColHead({ children }) {
  return (
    <>
      <h3 style={{
        margin: 0, fontSize: 11, fontWeight: 700,
        letterSpacing: '2.5px', textTransform: 'uppercase',
        color: TEAL, fontFamily: FONT,
      }}>
        {children}
      </h3>
      <div style={{ width: 28, height: 2, background: TEAL, margin: '8px 0 18px', borderRadius: 2, opacity: 0.7 }} />
    </>
  );
}

function FooterLink({ to, children }) {
  return (
    <Link
      to={to}
      style={{
        color: LIGHT, fontSize: 14, display: 'block',
        padding: '5px 0', textDecoration: 'none',
        fontFamily: FONT, transition: 'color 0.25s',
      }}
      onMouseEnter={e => e.currentTarget.style.color = TEAL}
      onMouseLeave={e => e.currentTarget.style.color = LIGHT}
    >
      {children}
    </Link>
  );
}

function ContactRow({ icon, text }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
      <div style={{
        width: 30, height: 30, borderRadius: '50%',
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, fontSize: 13, color: TEAL,
      }}>
        {icon}
      </div>
      <span style={{ color: MUTED, fontSize: 13, fontFamily: FONT, lineHeight: 1.6, paddingTop: 5 }}>{text}</span>
    </div>
  );
}

function SocialBtn({ Icon, label, href }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
      style={{
        width: 40, height: 40, borderRadius: 9,
        background: 'rgba(255,255,255,0.07)',
        border: '1px solid rgba(255,255,255,0.12)',
        color: LIGHT,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', textDecoration: 'none',
        transition: 'background 0.25s, color 0.25s, border-color 0.25s, transform 0.2s',
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = TEAL;
        e.currentTarget.style.color = BG;
        e.currentTarget.style.borderColor = TEAL;
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
        e.currentTarget.style.color = LIGHT;
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <Icon />
    </a>
  );
}

/* ── Footer ──────────────────────────────────────────────────────────────── */
export default function Footer() {
  const navigate = useNavigate();
  const { isMobile } = useBreakpoint();

  return (
    <footer style={{
      background: `linear-gradient(135deg, ${BG} 0%, ${NAVY2} 100%)`,
      margin: 0, padding: 0, fontFamily: FONT,
      boxShadow: 'inset 0 1px 0 rgba(29,182,166,0.15)',
    }}>

      {/* Wave */}
      <div style={{ background: 'white', lineHeight: 0 }}>
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none"
          style={{ display: 'block', width: '100%', height: isMobile ? 60 : 120 }}>
          <path d="M0,40 C180,100 360,0 540,60 C720,120 900,20 1080,70 C1260,115 1380,45 1440,60 L1440,120 L0,120 Z"
            fill="rgba(175,199,214,0.45)"/>
          <path d="M0,60 C200,20 400,100 600,55 C800,10 1000,85 1200,50 C1340,25 1410,65 1440,55 L1440,120 L0,120 Z"
            fill="rgba(18,42,74,0.65)"/>
          <path d="M0,80 C240,40 480,110 720,65 C960,20 1200,90 1440,70 L1440,120 L0,120 Z"
            fill={BG}/>
        </svg>
      </div>

      {/* Main grid */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '32px 20px 0' : '60px 40px 0' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1.4fr 1fr 1fr 1.6fr',
          gap: isMobile ? 32 : 48,
        }}>

          {/* Col 1 — Brand */}
          <div>
            <img
              src="/logo.png"
              alt="Aslan Medical"
              style={{
                height: 56, display: 'block',
                filter: 'brightness(1.1)',
                borderRadius: 6,
              }}
              onError={e => e.currentTarget.style.display = 'none'}
            />
            <p style={{
              fontSize: 14, color: MUTED,
              fontStyle: 'italic', marginTop: 16, marginBottom: 0,
              lineHeight: 1.7, fontFamily: FONT,
            }}>
              Sağlamlığınız üçün etibarlı tərəfdaş
            </p>
          </div>

          {/* Col 2 — Klinika */}
          <div>
            <ColHead>KLİNİKA</ColHead>
            <FooterLink to="/about">Haqqımızda</FooterLink>
            <FooterLink to="/services">Xidmətlər</FooterLink>
            <FooterLink to="/hekimler">Həkimlər</FooterLink>
            <FooterLink to="/contact">Əlaqə</FooterLink>
          </div>

          {/* Col 3 — Pasiyent */}
          <div>
            <ColHead>PASİYENT</ColHead>
            <FooterLink to="/services">Xidmətlər</FooterLink>
            <FooterLink to="/randevu">Randevu</FooterLink>
            <FooterLink to="/about">Məlumatlar</FooterLink>
          </div>

          {/* Col 4 — Əlaqə */}
          <div>
            <ColHead>ƏLAQƏ</ColHead>

            <a href="tel:+994508363694" style={{
              color: WHITE, fontSize: 24, fontWeight: 800,
              display: 'block', marginBottom: 18,
              textDecoration: 'none', fontFamily: FONT,
              transition: 'color 0.25s',
              letterSpacing: '-0.3px',
            }}
              onMouseEnter={e => e.currentTarget.style.color = TEAL}
              onMouseLeave={e => e.currentTarget.style.color = WHITE}
            >
              +994 50 836 36 94
            </a>

            <ContactRow icon="✉" text="info@aslanmedical.az" />
            <ContactRow icon="📍" text="Xətai ray, Afiyəddin Cəlilov küçəsi, Bakı" />
            <ContactRow icon="🕐" text="Hər gün: 24/7" />

            <button
              onClick={() => navigate('/randevu')}
              style={{
                marginTop: 20,
                border: `1.5px solid ${TEAL}`,
                borderRadius: 8, padding: '10px 22px',
                color: WHITE, background: 'transparent',
                fontSize: 14, fontWeight: 600,
                cursor: 'pointer', fontFamily: FONT,
                display: 'inline-flex', alignItems: 'center', gap: 8,
                transition: 'background 0.25s, color 0.25s',
                letterSpacing: '0.2px',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = TEAL;
                e.currentTarget.style.color = BG;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = WHITE;
              }}
            >
              Randevu Al →
            </button>

            <div style={{ marginTop: 24, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {SOCIALS.map(s => <SocialBtn key={s.label} {...s} />)}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          marginTop: 48, padding: '20px 0',
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: 12,
        }}>
          <span style={{ fontSize: 13, color: MUTED, fontFamily: FONT }}>
            © 2026 Aslan Medical Center
          </span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {['Məxfilik', 'Şərtlər', 'Əlaqə'].map((label, i) => (
              <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {i > 0 && <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 12 }}>|</span>}
                <a href="#" style={{
                  fontSize: 13, color: MUTED,
                  textDecoration: 'none', fontFamily: FONT,
                  transition: 'color 0.25s',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = TEAL}
                  onMouseLeave={e => e.currentTarget.style.color = MUTED}
                >{label}</a>
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
