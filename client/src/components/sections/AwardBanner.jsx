import { motion } from 'framer-motion';
import { useBreakpoint } from '../../hooks/useBreakpoint';

const FONT    = "'Source Sans 3', 'Raleway', sans-serif";
const RALEWAY = "'Raleway', sans-serif";
const NAVY    = '#0a1628';
const TEAL    = '#00848e';

// max-w-7xl  = 1280px
// px-4       = 16px   (mobile)
// sm:px-6    = 24px   (tablet)
// lg:px-8    = 32px   (desktop)
const CONTAINER = { maxWidth: 1280, marginLeft: 'auto', marginRight: 'auto' };

const STATS = [
  { value: '10+',  label: 'İl Təcrübə'    },
  { value: '50+',  label: 'Peşəkar Həkim' },
  { value: '24/7', label: 'Xidmət'         },
];

export default function AwardBanner() {
  const { isMobile, isTablet } = useBreakpoint();
  const isNarrow = isMobile || isTablet;

  const px       = isMobile ? 16 : isTablet ? 24 : 32;
  const py       = isMobile ? 64 : 96;
  const imgH     = isMobile ? 280 : isTablet ? 380 : 480;

  return (
    <section style={{ background: '#ffffff', paddingTop: py, paddingBottom: py, fontFamily: FONT }}>
      <div style={{ ...CONTAINER, paddingLeft: px, paddingRight: px, boxSizing: 'border-box' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isNarrow ? '1fr' : '1fr 1fr',
          gap: isNarrow ? 40 : 64,
          alignItems: 'center',
        }}>

          {/* ══ LEFT — Text ══════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ display: 'flex', flexDirection: 'column', maxWidth: 520 }}
          >
            {/* Eyebrow */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(0,132,142,0.07)',
              border: '1px solid rgba(0,132,142,0.18)',
              borderRadius: 20,
              padding: '6px 14px',
              marginBottom: 20,
              alignSelf: 'flex-start',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: TEAL, display: 'block', flexShrink: 0 }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: TEAL, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: FONT }}>
                Aslan Medical Center
              </span>
            </div>

            {/* Heading */}
            <h2 style={{
              fontSize: isMobile ? 30 : isTablet ? 38 : 46,
              fontWeight: 800,
              color: NAVY,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              margin: '0 0 16px',
              fontFamily: RALEWAY,
            }}>
              Sağlamlığınız —<br />
              <span style={{ color: TEAL }}>Bizim Prioritetimiz.</span>
            </h2>

            {/* Paragraph */}
            <p style={{
              fontSize: 15,
              color: '#4a5568',
              lineHeight: 1.85,
              margin: '0 0 32px',
              fontFamily: FONT,
            }}>
              Aslan Medical Center müasir tibbi texnologiyalar və peşəkar həkimlər
              heyəti ilə hər bir pasiyentə fərdi yanaşır. Sağlamlığınız üçün
              etibarlı tərəfdaşınız.
            </p>

            {/* Award badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 16,
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderLeft: `4px solid ${TEAL}`,
              borderRadius: 14,
              padding: '14px 20px',
              boxShadow: '0 4px 24px rgba(10,22,40,0.07)',
              marginBottom: 28,
              alignSelf: 'flex-start',
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 16, letterSpacing: 4, color: '#f59e0b', lineHeight: 1 }}>★★★★★</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: NAVY, letterSpacing: '0.5px', fontFamily: FONT }}>ƏN YAXŞI KLİNİKA</span>
                <span style={{ fontSize: 11, color: TEAL, fontFamily: FONT }}>2025 – 2026</span>
              </div>
              <div style={{ width: 1, height: 44, background: '#e2e8f0', flexShrink: 0 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: NAVY, letterSpacing: '0.3px', fontFamily: FONT }}>Aslan Medical Center</span>
                <span style={{ fontSize: 10, color: '#94a3b8', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: FONT }}>Azərbaycan</span>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {STATS.map(s => (
                <div key={s.value} style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderTop: `3px solid ${TEAL}`,
                  borderRadius: 12,
                  padding: '12px 18px',
                  minWidth: 84,
                  textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(10,22,40,0.04)',
                }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: TEAL, lineHeight: 1, fontFamily: RALEWAY }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 5, fontWeight: 500, fontFamily: FONT, whiteSpace: 'nowrap' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ══ RIGHT — Hospital image ════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, scale: 1.04 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.75 }}
            style={{
              position: 'relative',
              borderRadius: 24,
              overflow: 'hidden',
              boxShadow: '0 24px 64px rgba(10,22,40,0.13), 0 6px 20px rgba(10,22,40,0.07)',
            }}
          >
            <img
              src="/hospital.png"
              alt="Aslan Medical Center"
              style={{
                width: '100%',
                height: imgH,
                objectFit: 'cover',
                objectPosition: 'center',
                display: 'block',
              }}
            />
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to bottom, rgba(10,22,40,0.02) 0%, rgba(10,22,40,0.00) 40%, rgba(10,22,40,0.25) 100%)',
              pointerEvents: 'none',
            }} />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
