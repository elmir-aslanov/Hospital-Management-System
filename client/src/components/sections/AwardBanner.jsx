import { motion } from 'framer-motion';
import { useBreakpoint } from '../../hooks/useBreakpoint';

const FONT    = "'Source Sans 3', 'Raleway', sans-serif";
const RALEWAY = "'Raleway', sans-serif";
const NAVY    = '#0a1628';
const TEAL    = '#00848e';

const CONTAINER = { maxWidth: 1280, marginLeft: 'auto', marginRight: 'auto' };

export default function AwardBanner() {
  const { isMobile, isTablet } = useBreakpoint();
  const isNarrow = isMobile || isTablet;

  const px  = isMobile ? 16 : isTablet ? 24 : 32;
  const py  = isMobile ? 56 : 96;
  const gap = isMobile ? 32 : isTablet ? 40 : 64;

  return (
    <section style={{ background: '#f6f9fa', paddingTop: py, paddingBottom: py, fontFamily: FONT, width: '100%' }}>
      <div style={{ ...CONTAINER, paddingLeft: px, paddingRight: px, boxSizing: 'border-box' }}>

        {/* ── Two-column grid ───────────────────────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isNarrow ? '1fr' : '1fr 1fr',
          gap,
          alignItems: 'center',
        }}>

          {/* ══ LEFT — Content card ══════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              background:   '#ffffff',
              borderRadius: 28,
              border:       '1px solid rgba(203,213,225,0.6)',
              padding:      isMobile ? '28px 22px' : isTablet ? '36px 32px' : '48px 44px',
              boxShadow:    '0 24px 70px rgba(15,23,42,0.08), 0 4px 16px rgba(15,23,42,0.04)',
              display:      'flex',
              flexDirection:'column',
            }}
          >
            {/* Eyebrow */}
            <div style={{
              display:      'inline-flex',
              alignItems:   'center',
              gap:          7,
              alignSelf:    'flex-start',
              background:   'rgba(0,132,142,0.06)',
              border:       '1px solid rgba(0,132,142,0.2)',
              borderRadius: 50,
              padding:      '5px 14px',
              marginBottom: 22,
            }}>
              <span style={{
                width: 5, height: 5, borderRadius: '50%',
                background: TEAL, display: 'block', flexShrink: 0,
              }} />
              <span style={{
                fontSize: 10, fontWeight: 700, color: TEAL,
                letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: FONT,
              }}>
                Aslan Medical Center
              </span>
            </div>

            {/* Heading */}
            <h2 style={{
              fontSize:      isMobile ? 28 : isTablet ? 34 : 44,
              fontWeight:    800,
              color:         '#0f172a',
              lineHeight:    1.08,
              letterSpacing: '-0.025em',
              margin:        '0 0 16px',
              fontFamily:    RALEWAY,
            }}>
              Sağlamlığınız —
              <span style={{ display: 'block', color: TEAL }}>
                Bizim Prioritetimiz.
              </span>
            </h2>

            {/* Paragraph */}
            <p style={{
              fontSize:   isMobile ? 14.5 : 15.5,
              color:      '#475569',
              lineHeight: 1.85,
              margin:     '0 0 30px',
              fontFamily: FONT,
            }}>
              Aslan Medical Center müasir tibbi texnologiyalar, peşəkar həkim heyəti
              və pasiyentyönümlü xidmət yanaşması ilə hər bir pasiyentə etibarlı
              və fərdi qayğı təqdim edir. Diaqnostikadan müalicəyə qədər bütün
              mərhələlərdə sağlamlığınız üçün güvənli tərəfdaşınızdır.
            </p>

            {/* Award badge */}
            <div style={{
              display:      'flex',
              alignItems:   'center',
              flexWrap:     'wrap',
              gap:          16,
              background:   'rgba(248,250,252,0.9)',
              border:       '1px solid #e2e8f0',
              borderLeft:   `3px solid ${TEAL}`,
              borderRadius: 16,
              padding:      '16px 18px',
              marginBottom: 30,
            }}>
              {/* Stars + label + year */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
                <span style={{ fontSize: 14, letterSpacing: '2px', color: '#f59e0b', lineHeight: 1 }}>
                  ★★★★★
                </span>
                <span style={{
                  fontSize: 11, fontWeight: 800,
                  color: NAVY, letterSpacing: '0.5px', fontFamily: FONT,
                }}>
                  ƏN YAXŞI KLİNİKA
                </span>
                <span style={{ fontSize: 10.5, color: TEAL, fontFamily: FONT }}>
                  2025 – 2026
                </span>
              </div>

              {/* Divider */}
              <div style={{ width: 1, height: 40, background: '#dde4ea', flexShrink: 0 }} />

              {/* Clinic name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <span style={{
                  fontSize: 12, fontWeight: 700,
                  color: NAVY, letterSpacing: '0.2px', fontFamily: FONT,
                }}>
                  Aslan Medical Center
                </span>
                <span style={{
                  fontSize: 10, color: '#94a3b8',
                  letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: FONT,
                }}>
                  Azərbaycan
                </span>
              </div>
            </div>

          </motion.div>

          {/* ══ RIGHT — Hospital image ════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
            style={{
              position:     'relative',
              borderRadius: 28,
              overflow:     'hidden',
              border:       '1px solid rgba(203,213,225,0.5)',
              boxShadow:    '0 30px 80px rgba(15,23,42,0.13), 0 6px 20px rgba(15,23,42,0.06)',
            }}
          >
            <img
              src="/hospital.png"
              alt="Aslan Medical Center"
              style={{
                width:          '100%',
                height:         isMobile ? 260 : isTablet ? 400 : 580,
                objectFit:      'cover',
                objectPosition: 'center',
                display:        'block',
              }}
            />
            {/* Subtle overlay */}
            <div style={{
              position:      'absolute',
              inset:         0,
              background:    'linear-gradient(to bottom, rgba(255,255,255,0.06) 0%, transparent 40%, rgba(15,23,42,0.12) 100%)',
              pointerEvents: 'none',
            }} />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
