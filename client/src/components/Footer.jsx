import { Link, useNavigate } from 'react-router-dom';
import { useBreakpoint } from '../hooks/useBreakpoint';

const GRADIENT_TOP = '#0F3443';
const GRADIENT_MID = '#0B2B38';
const GRADIENT_BOTTOM = '#082331';
const ACCENT = '#20C7D2';
const TEXT_MAIN = '#F4FAFC';
const TEXT_MUTED = '#BFD0D8';
const BORDER = 'rgba(255, 255, 255, 0.14)';
const FONT = "'Source Sans 3', 'Raleway', sans-serif";

const IgIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const FbIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const LiIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const YtIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#082331" />
  </svg>
);

const WaIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.944-1.418A9.959 9.959 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
  </svg>
);

const MailIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);

const PinIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const ClockIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

const SOCIALS = [
  { Icon: IgIcon, label: 'Instagram', href: 'https://instagram.com' },
  { Icon: FbIcon, label: 'Facebook', href: 'https://facebook.com' },
  { Icon: LiIcon, label: 'LinkedIn', href: 'https://linkedin.com' },
  { Icon: YtIcon, label: 'YouTube', href: 'https://youtube.com' },
  { Icon: WaIcon, label: 'WhatsApp', href: 'https://wa.me/994508363694' },
];

function ColumnTitle({ children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <h3 style={{
        margin: 0,
        color: ACCENT,
        fontSize: 13,
        fontWeight: 800,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        fontFamily: FONT,
      }}>
        {children}
      </h3>
      <div style={{
        width: 34,
        height: 2,
        marginTop: 11,
        borderRadius: 999,
        background: `linear-gradient(90deg, ${ACCENT}, rgba(32,199,210,0))`,
      }} />
    </div>
  );
}

function FooterLink({ to, children }) {
  return (
    <Link
      to={to}
      style={{
        display: 'block',
        width: 'fit-content',
        color: TEXT_MUTED,
        fontSize: 15,
        lineHeight: 1.4,
        padding: '7px 0',
        textDecoration: 'none',
        fontFamily: FONT,
        transition: 'color 0.18s ease, transform 0.18s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = TEXT_MAIN;
        e.currentTarget.style.transform = 'translateX(4px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = TEXT_MUTED;
        e.currentTarget.style.transform = 'translateX(0)';
      }}
    >
      {children}
    </Link>
  );
}

function ContactRow({ Icon, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 13 }}>
      <span style={{
        width: 34,
        height: 34,
        borderRadius: '50%',
        background: 'rgba(32, 199, 210, 0.12)',
        border: '1px solid rgba(32, 199, 210, 0.18)',
        color: ACCENT,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon />
      </span>
      <span style={{ color: TEXT_MUTED, fontSize: 14, lineHeight: 1.55, fontFamily: FONT }}>
        {text}
      </span>
    </div>
  );
}

function SocialButton({ Icon, label, href }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      style={{
        width: 42,
        height: 42,
        borderRadius: 13,
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.13)',
        color: TEXT_MUTED,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        textDecoration: 'none',
        transition: 'background 0.2s ease, border-color 0.2s ease, color 0.2s ease, transform 0.2s ease',
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(32,199,210,0.16)';
        e.currentTarget.style.borderColor = 'rgba(32,199,210,0.36)';
        e.currentTarget.style.color = ACCENT;
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.13)';
        e.currentTarget.style.color = TEXT_MUTED;
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <Icon />
    </a>
  );
}

export default function Footer() {
  const navigate = useNavigate();
  const { isMobile } = useBreakpoint();

  return (
    <footer
      style={{
        position: 'relative',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        color: TEXT_MAIN,
        fontFamily: FONT,
        background: `linear-gradient(180deg, ${GRADIENT_TOP} 0%, ${GRADIENT_MID} 48%, ${GRADIENT_BOTTOM} 100%)`,
      }}
    >
      <div style={{ background: '#fff', lineHeight: 0 }}>
        <svg
          viewBox="0 0 1440 132"
          preserveAspectRatio="none"
          style={{ display: 'block', width: '100%', height: isMobile ? 82 : 132 }}
        >
          <path
            d="M0,52 C190,108 356,18 548,70 C740,124 916,24 1092,74 C1262,122 1368,62 1440,78 L1440,132 L0,132 Z"
            fill="#20C7D2"
            opacity="0.12"
          />
          <path
            d="M0,72 C220,26 412,116 626,66 C838,18 1018,98 1218,58 C1348,32 1406,64 1440,58 L1440,132 L0,132 Z"
            fill="#0F3443"
            opacity="0.72"
          />
          <path
            d="M0,92 C250,44 488,112 724,72 C960,30 1192,94 1440,74 L1440,132 L0,132 Z"
            fill="#0F3443"
          />
        </svg>
      </div>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(circle at 12% 28%, rgba(32,199,210,0.13), transparent 28%), radial-gradient(circle at 88% 20%, rgba(255,255,255,0.06), transparent 24%)',
        }}
      />

      <div
        style={{
          position: 'relative',
          maxWidth: 1220,
          margin: '0 auto',
          padding: isMobile ? '36px 22px 0' : '66px 42px 0',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1.35fr 0.82fr 0.82fr 1.42fr',
            gap: isMobile ? 34 : 42,
            alignItems: 'start',
          }}
        >
          <div style={{ paddingRight: isMobile ? 0 : 30 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255,255,255,0.96)',
                borderRadius: 18,
                padding: '13px 18px',
                boxShadow: '0 22px 58px rgba(0,0,0,0.16)',
                border: '1px solid rgba(255,255,255,0.35)',
              }}
            >
              <img
                src="/logo.png"
                alt="Aslan Medical"
                style={{ height: 58, display: 'block' }}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>

            <p
              style={{
                margin: '22px 0 0',
                color: TEXT_MUTED,
                fontSize: 15,
                lineHeight: 1.75,
                maxWidth: 310,
                fontFamily: FONT,
              }}
            >
              Sağlamlığınız üçün etibarlı tərəfdaş.
              <br />
              Peşəkar həkimlər və müasir tibbi
              <br />
              xidmətlərlə yanınızdayıq.
            </p>
          </div>

          <div style={{ borderLeft: isMobile ? 'none' : `1px solid ${BORDER}`, paddingLeft: isMobile ? 0 : 28 }}>
            <ColumnTitle>KLINIKA</ColumnTitle>
            <FooterLink to="/about">Haqqımızda</FooterLink>
            <FooterLink to="/services">Xidmətlər</FooterLink>
            <FooterLink to="/hekimler">Həkimlər</FooterLink>
            <FooterLink to="/contact">Əlaqə</FooterLink>
          </div>

          <div style={{ borderLeft: isMobile ? 'none' : `1px solid ${BORDER}`, paddingLeft: isMobile ? 0 : 28 }}>
            <ColumnTitle>PASIYENT</ColumnTitle>
            <FooterLink to="/services">Xidmətlər</FooterLink>
            <FooterLink to="/randevu">Randevu</FooterLink>
            <FooterLink to="/about">Məlumatlar</FooterLink>
          </div>

          <div style={{ borderLeft: isMobile ? 'none' : `1px solid ${BORDER}`, paddingLeft: isMobile ? 0 : 30 }}>
            <ColumnTitle>ƏLAQƏ</ColumnTitle>

            <a
              href="tel:+994508363694"
              style={{
                display: 'block',
                width: 'fit-content',
                color: TEXT_MAIN,
                fontSize: isMobile ? 24 : 29,
                fontWeight: 800,
                letterSpacing: '-0.2px',
                textDecoration: 'none',
                marginBottom: 18,
                fontFamily: FONT,
              }}
            >
              +994 50 836 36 94
            </a>

            <ContactRow Icon={MailIcon} text="info@aslanmedical.az" />
            <ContactRow Icon={PinIcon} text="Xətai ray, Afiyəddin Cəlilov küçəsi, Bakı" />
            <ContactRow Icon={ClockIcon} text="Hər gün: 24/7" />

            <button
              type="button"
              onClick={() => navigate('/randevu')}
              style={{
                marginTop: 16,
                border: `1px solid ${ACCENT}`,
                borderRadius: 12,
                padding: '13px 24px',
                background: 'transparent',
                color: TEXT_MAIN,
                fontSize: 14,
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: FONT,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                transition: 'background 0.2s ease, border-color 0.2s ease, color 0.2s ease, transform 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = ACCENT;
                e.currentTarget.style.borderColor = ACCENT;
                e.currentTarget.style.color = GRADIENT_BOTTOM;
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = ACCENT;
                e.currentTarget.style.color = TEXT_MAIN;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Randevu Al →
            </button>

            <div style={{ marginTop: 24, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {SOCIALS.map((social) => (
                <SocialButton key={social.label} {...social} />
              ))}
            </div>
          </div>
        </div>

        <div
          style={{
            borderTop: `1px solid ${BORDER}`,
            marginTop: isMobile ? 38 : 58,
            padding: '22px 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 14,
          }}
        >
          <span style={{ color: TEXT_MUTED, fontSize: 13, lineHeight: 1.5, fontFamily: FONT }}>
            © 2026 Aslan Medical Center. Bütün hüquqlar qorunur.
          </span>

          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px 12px' }}>
            {['Məxfilik siyasəti', 'İstifadə şərtləri', 'Əlaqə'].map((label, index) => (
              <span key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
                {index > 0 && <span style={{ color: 'rgba(255,255,255,0.22)' }}>|</span>}
                <a
                  href="#"
                  style={{
                    color: TEXT_MUTED,
                    fontSize: 13,
                    textDecoration: 'none',
                    fontFamily: FONT,
                    transition: 'color 0.18s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = ACCENT; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = TEXT_MUTED; }}
                >
                  {label}
                </a>
              </span>
            ))}
          </div>
        </div>
      </div>

      <a
        href="https://wa.me/994508363694"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        style={{
          position: 'fixed',
          right: isMobile ? 18 : 26,
          bottom: isMobile ? 18 : 26,
          zIndex: 60,
          width: isMobile ? 54 : 60,
          height: isMobile ? 54 : 60,
          borderRadius: '50%',
          background: '#20C7D2',
          color: '#082331',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 18px 42px rgba(8,35,49,0.28)',
          border: '1px solid rgba(255,255,255,0.32)',
          textDecoration: 'none',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = '0 22px 48px rgba(8,35,49,0.34)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 18px 42px rgba(8,35,49,0.28)';
        }}
      >
        <WaIcon />
      </a>
    </footer>
  );
}
