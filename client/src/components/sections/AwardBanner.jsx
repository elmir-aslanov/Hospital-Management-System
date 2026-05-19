import { motion } from 'framer-motion';
import { useBreakpoint } from '../../hooks/useBreakpoint';

const FONT    = "'Source Sans 3', 'Raleway', sans-serif";
const RALEWAY = "'Raleway', sans-serif";
const NAVY    = '#0a1628';
const TEAL    = '#00848e';
const BG      = '#f4f6f7';                    // section background
const CONTAINER = { maxWidth: 1280, marginLeft: 'auto', marginRight: 'auto' };

export default function AwardBanner() {
  const navigate = useNavigate();
  const { isMobile, isTablet } = useBreakpoint();
  const isDesktop = !isMobile && !isTablet;

  const px = isMobile ? 16 : isTablet ? 24 : 32;

  return (
    <section style={{ background: BG, paddingTop: isMobile ? 56 : 104, paddingBottom: isMobile ? 56 : 104, fontFamily: FONT }}>
      {/* ── Controlled outer container ─────────────────────────────────────── */}
      <div style={{ ...CONTAINER, paddingLeft: px, paddingRight: px, boxSizing: 'border-box' }}>

        {/* ════════════════════════════════════════════════════════════════════
            DESKTOP — relative wrapper: image absolute-right, card in normal flow
            MOBILE  — block: image on top, card below
        ════════════════════════════════════════════════════════════════════ */}
        <div style={{
          position: 'relative',
          // On desktop the image is absolute so we give the wrapper a min-height
          // and center the card vertically with flexbox.
          ...(isDesktop ? {
            display: 'flex',
            alignItems: 'center',
            minHeight: 620,
          } : {
            display: 'block',
          }),
        }}>

          {/* ── IMAGE ─────────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, scale: 1.04 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.85, ease: 'easeOut' }}
            style={{
              ...(isDesktop ? {
                // Absolute: fills right 72% of the wrapper height
                position: 'absolute',
                top: 0,
                right: 0,
                width: '72%',
                height: '100%',
              } : {
                // Normal flow on narrow screens
                width: '100%',
                height: isTablet ? 380 : 260,
                marginBottom: 24,
              }),
              borderRadius: 28,
              overflow: 'hidden',
              boxShadow: '0 32px 80px rgba(10,22,40,0.18), 0 8px 24px rgba(10,22,40,0.08)',
            }}
          >
            <img
              src="/hospital.png"
              alt="Aslan Medical Center"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
            />

            {/* Left-side gradient: blends image edge into section bg so card sits cleanly on top */}
            {isDesktop && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(to right, ${BG} 0%, rgba(244,246,247,0.55) 22%, transparent 46%)`,
                pointerEvents: 'none',
              }} />
            )}

            {/* Bottom gradient for depth */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to bottom, rgba(10,22,40,0.01) 0%, rgba(10,22,40,0.00) 55%, rgba(10,22,40,0.22) 100%)',
              pointerEvents: 'none',
            }} />
          </motion.div>

          {/* ── CONTENT CARD ──────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            style={{
              position: 'relative',
              zIndex: 10,
              background: '#ffffff',
              borderRadius: 24,
              padding: isMobile ? '28px 22px' : isTablet ? '40px' : '52px 48px',
              boxShadow: '0 24px 64px rgba(10,22,40,0.14), 0 4px 16px rgba(10,22,40,0.06)',
              // On desktop: fixed width so the card overlaps ~180px into the image
              ...(isDesktop ? { width: 520, flexShrink: 0 } : { width: '100%' }),
            }}
          >
            {/* Eyebrow */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              background: 'rgba(0,132,142,0.07)',
              border: '1px solid rgba(0,132,142,0.16)',
              borderRadius: 20,
              padding: '5px 12px',
              marginBottom: 20,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: TEAL, display: 'block', flexShrink: 0 }} />
              <span style={{ fontSize: 10.5, fontWeight: 700, color: TEAL, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: FONT }}>
                Aslan Medical Center
              </span>
            </div>

            {/* Heading */}
            <h2 style={{
              fontSize: isMobile ? 27 : isTablet ? 34 : 42,
              fontWeight: 800,
              color: NAVY,
              lineHeight: 1.18,
              letterSpacing: '-0.02em',
              margin: '0 0 16px',
              fontFamily: RALEWAY,
            }}>
              Sağlamlığınız —<br />
              <span style={{ color: TEAL }}>Bizim Prioritetimiz.</span>
            </h2>

            {/* Paragraph */}
            <p style={{
              fontSize: 14,
              color: '#4a5568',
              lineHeight: 1.9,
              margin: '0 0 28px',
              fontFamily: FONT,
            }}>
              Aslan Medical Center müasir tibbi texnologiyalar, peşəkar həkim heyəti
              və pasiyentyönümlü xidmət yanaşması ilə hər bir pasiyentə etibarlı və
              fərdi qayğı təqdim edir. Diaqnostikadan müalicəyə qədər bütün
              mərhələlərdə sağlamlığınız üçün güvənli tərəfdaşınızıq.
            </p>

            {/* Award badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderLeft: `4px solid ${TEAL}`,
              borderRadius: 14,
              padding: '13px 16px',
              marginBottom: 28,
            }}>
              {/* Stars + title + year */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flexShrink: 0 }}>
                <span style={{ fontSize: 14, letterSpacing: '3px', color: '#f59e0b', lineHeight: 1 }}>★★★★★</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: NAVY, letterSpacing: '0.4px', fontFamily: FONT }}>
                  ƏN YAXŞI KLİNİKA
                </span>
                <span style={{ fontSize: 10.5, color: TEAL, fontFamily: FONT }}>2025 – 2026</span>
              </div>

              <div style={{ width: 1, height: 38, background: '#dde4ea', flexShrink: 0 }} />

              {/* Clinic name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: NAVY, letterSpacing: '0.3px', fontFamily: FONT }}>
                  Aslan Medical Center
                </span>
                <span style={{ fontSize: 10, color: '#94a3b8', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: FONT }}>
                  Azərbaycan
                </span>
              </div>
            </div>


          </motion.div>
        </div>
      </div>
    </section>
  );
}
