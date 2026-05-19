import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const FONT    = "'Source Sans 3', 'Raleway', sans-serif";
const RALEWAY = "'Raleway', sans-serif";
const NAVY    = '#0a1628';
const TEAL    = '#00848e';

// ── Inline SVG social icons ───────────────────────────────────────────────────
const IgIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
  </svg>
);
const FbIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
const LiIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);
const YtIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.97C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#0a1628"/>
  </svg>
);
const WaIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
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

const QUICK_LINKS = [
  { label: 'Ana Səhifə',            to: '/' },
  { label: 'Həkimlər',              to: '/hekimler' },
  { label: 'Şöbələr',              to: '/departments' },
  { label: 'Xidmətlər & Müalicələr', to: '/services' },
  { label: 'Bloq',                  to: '/blog' },
  { label: 'Haqqımızda',            to: '/about' },
];

const PATIENT_LINKS = [
  { label: 'Randevu Al',             to: '/randevu' },
  { label: 'Pasiyent Portalı',       to: '/login' },
  { label: 'Tez-tez verilən suallar', to: '/about' },
  { label: 'Əlaqə',                  to: '/contact' },
];

// ── Reusable link ─────────────────────────────────────────────────────────────
function FootLink({ to, label }) {
  return (
    <li>
      <Link
        to={to}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 14,
          color: 'rgba(255,255,255,0.7)',
          textDecoration: 'none',
          fontFamily: FONT,
          transition: 'color 0.2s',
          lineHeight: 1.6,
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#4DD0E1'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ flexShrink: 0, opacity: 0.5 }}>
          <polyline points="9 18 15 12 9 6"/>
        </svg>
        {label}
      </Link>
    </li>
  );
}

// ── Column heading ────────────────────────────────────────────────────────────
function ColHead({ children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h3 style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: '#ffffff',
        margin: '0 0 8px',
        fontFamily: FONT,
      }}>
        {children}
      </h3>
      <div style={{ width: 28, height: 2, background: TEAL, borderRadius: 2 }} />
    </div>
  );
}

// ── Main Footer ───────────────────────────────────────────────────────────────
export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer style={{ background: NAVY, fontFamily: FONT, position: 'relative' }}>

      {/* ── Wave divider — transitions from page white into navy ── */}
      <div style={{ lineHeight: 0, overflow: 'hidden' }}>
        <svg
          viewBox="0 0 1440 72"
          preserveAspectRatio="none"
          style={{ display: 'block', width: '100%', height: 72 }}
        >
          <path
            d="M0,0 C240,72 480,0 720,36 C960,72 1200,0 1440,36 L1440,72 L0,72 Z"
            fill={NAVY}
          />
          {/* Teal accent wave line */}
          <path
            d="M0,0 C240,72 480,0 720,36 C960,72 1200,0 1440,36"
            fill="none"
            stroke={TEAL}
            strokeWidth="1.5"
            opacity="0.5"
          />
        </svg>
      </div>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '0 32px 56px',
        boxSizing: 'border-box',
      }}>

        {/* 4-column grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '40px 48px',
          paddingTop: 8,
        }}>

          {/* ── Column 1 — Brand ─────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            {/* Logo */}
            <div
              onClick={() => navigate('/')}
              style={{ cursor: 'pointer', alignSelf: 'flex-start' }}
            >
              <img
                src="/logo.png"
                alt="Aslan Medical Center"
                style={{
                  height: 52,
                  width: 'auto',
                  background: 'rgba(255,255,255,0.92)',
                  borderRadius: 10,
                  padding: '6px 14px',
                  display: 'block',
                }}
                onError={e => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextSibling.style.display = 'flex';
                }}
              />
              {/* Fallback */}
              <div style={{
                display: 'none',
                alignItems: 'center',
                gap: 8,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: TEAL,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 18, fontWeight: 900,
                }}>+</div>
                <span style={{ color: '#fff', fontSize: 16, fontWeight: 800, fontFamily: RALEWAY }}>
                  Aslan Medical
                </span>
              </div>
            </div>

            {/* Description */}
            <p style={{
              fontSize: 13.5,
              color: 'rgba(255,255,255,0.62)',
              lineHeight: 1.85,
              margin: 0,
              maxWidth: 260,
              fontFamily: FONT,
            }}>
              Aslan Medical Center müasir tibbi texnologiyalar və peşəkar həkim heyəti
              ilə sağlamlığınız üçün etibarlı tərəfdaşınızdır.
            </p>

            {/* Trust pills */}
            <p style={{
              fontSize: 11.5,
              color: 'rgba(0,188,212,0.75)',
              fontFamily: FONT,
              letterSpacing: '0.04em',
              margin: 0,
            }}>
              24/7 xidmət · Peşəkar həkimlər · Müasir diaqnostika
            </p>

            {/* Award badge */}
            <div style={{
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderLeft: `3px solid ${TEAL}`,
              borderRadius: 12,
              padding: '12px 16px',
              alignSelf: 'flex-start',
              gap: 3,
            }}>
              <span style={{ fontSize: 13, letterSpacing: '2.5px', color: '#f59e0b' }}>★★★★★</span>
              <span style={{ fontSize: 10, fontWeight: 800, color: '#fff', letterSpacing: '0.8px', fontFamily: FONT }}>
                ƏN YAXŞI KLİNİKA
              </span>
              <span style={{ fontSize: 10, color: 'rgba(0,188,212,0.8)', fontFamily: FONT }}>
                2025 – 2026
              </span>
              <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.12)', margin: '3px 0' }} />
              <span style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: FONT }}>
                Azərbaycan
              </span>
            </div>
          </motion.div>

          {/* ── Column 2 — Quick Links ────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.08 }}
          >
            <ColHead>Sürətli Keçidlər</ColHead>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {QUICK_LINKS.map(l => <FootLink key={l.to} {...l} />)}
            </ul>
          </motion.div>

          {/* ── Column 3 — Patient Center ─────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.16 }}
          >
            <ColHead>Pasiyent Mərkəzi</ColHead>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {PATIENT_LINKS.map(l => <FootLink key={l.label} {...l} />)}
            </ul>
          </motion.div>

          {/* ── Column 4 — Contact ───────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.24 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            <ColHead>Əlaqə</ColHead>

            {/* Contact items */}
            {[
              {
                icon: (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                ),
                text: 'Bakı, Azərbaycan',
              },
              {
                icon: (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 5.5 5.5l.76-.76a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z"/>
                  </svg>
                ),
                text: '+994 50 836 36 94',
                href: 'tel:+994508363694',
              },
              {
                icon: (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                ),
                text: 'info@aslanmedical.az',
                href: 'mailto:info@aslanmedical.az',
              },
              {
                icon: (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                ),
                text: 'Həftə içi: 09:00 – 18:00',
              },
              {
                icon: null,
                text: 'Təcili xidmət: 24/7',
                accent: true,
              },
            ].map(({ icon, text, href, accent }, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                {icon && (
                  <span style={{ color: TEAL, marginTop: 1, flexShrink: 0 }}>{icon}</span>
                )}
                {href ? (
                  <a
                    href={href}
                    style={{
                      fontSize: 13.5, color: 'rgba(255,255,255,0.7)',
                      textDecoration: 'none', fontFamily: FONT,
                      transition: 'color 0.2s',
                      marginLeft: icon ? 0 : 25,
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#4DD0E1'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                  >
                    {text}
                  </a>
                ) : (
                  <span style={{
                    fontSize: 13.5,
                    color: accent ? 'rgba(0,188,212,0.85)' : 'rgba(255,255,255,0.65)',
                    fontFamily: FONT,
                    marginLeft: icon ? 0 : 25,
                    fontWeight: accent ? 600 : 400,
                  }}>
                    {text}
                  </span>
                )}
              </div>
            ))}

            {/* Social icons */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
              {SOCIALS.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  style={{
                    width: 36, height: 36,
                    borderRadius: 10,
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(255,255,255,0.6)',
                    textDecoration: 'none',
                    transition: 'background 0.2s, color 0.2s, border-color 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = TEAL;
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.borderColor = TEAL;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  }}
                >
                  <Icon />
                </a>
              ))}
            </div>
          </motion.div>

        </div>
      </div>

      {/* ── Bottom bar ───────────────────────────────────────────────────── */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.08)',
        maxWidth: 1280,
        margin: '0 auto',
        padding: '20px 32px',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <span style={{
          fontSize: 13,
          color: 'rgba(255,255,255,0.45)',
          fontFamily: FONT,
        }}>
          © 2026 Aslan Medical Center. Bütün hüquqlar qorunur.
        </span>

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {[
            { label: 'Məxfilik Siyasəti', to: '/about' },
            { label: 'İstifadə Şərtləri', to: '/about' },
            { label: 'Əlaqə',             to: '/contact' },
          ].map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              style={{
                fontSize: 13,
                color: 'rgba(255,255,255,0.45)',
                textDecoration: 'none',
                fontFamily: FONT,
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#4DD0E1'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

    </footer>
  );
}
