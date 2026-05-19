import { motion } from 'framer-motion';
import { useBreakpoint } from '../../hooks/useBreakpoint';

const FONT    = "'Source Sans 3', 'Raleway', sans-serif";
const RALEWAY = "'Raleway', sans-serif";
const NAVY    = '#0a1628';
const TEAL    = '#00848e';

const STATS = [
  { value: '10+',  label: 'İl Təcrübə'     },
  { value: '50+',  label: 'Peşəkar Həkim'  },
  { value: '24/7', label: 'Xidmət'          },
];

export default function AwardBanner() {
  const { isMobile } = useBreakpoint();

  return (
    <section style={{
      background: '#ffffff',
      padding: isMobile ? '56px 0' : '88px 0',
      fontFamily: FONT,
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: isMobile ? '0 20px' : '0 52px',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: 'stretch',
        gap: isMobile ? 40 : 64,
      }}>

        {/* ══ LEFT — Text ══════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          {/* Eyebrow chip */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(0,132,142,0.07)',
            border: '1px solid rgba(0,132,142,0.18)',
            borderRadius: 20,
            padding: '6px 14px',
            marginBottom: 22,
            alignSelf: 'flex-start',
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: TEAL }} />
            <span style={{
              fontSize: 12, fontWeight: 700, color: TEAL,
              letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: FONT,
            }}>
              Aslan Medical Center
            </span>
          </div>

          {/* Heading */}
          <h2 style={{
            fontSize: isMobile ? '30px' : '46px',
            fontWeight: 800,
            color: NAVY,
            lineHeight: 1.15,
            letterSpacing: '-0.025em',
            margin: '0 0 18px',
            fontFamily: RALEWAY,
          }}>
            Sağlamlığınız —<br />
            <span style={{ color: TEAL }}>Bizim Prioritetimiz.</span>
          </h2>

          {/* Paragraph */}
          <p style={{
            fontSize: '15px',
            color: '#4a5568',
            lineHeight: 1.85,
            maxWidth: '440px',
            margin: '0 0 36px',
            fontFamily: FONT,
          }}>
            Aslan Medical Center müasir tibbi texnologiyalar və peşəkar həkimlər
            heyəti ilə hər bir pasiyentə fərdi yanaşır. Sağlamlığınız üçün
            etibarlı tərəfdaşınız.
          </p>

          {/* ── Award badge — horizontal trust card ── */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 18,
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderLeft: `4px solid ${TEAL}`,
            borderRadius: 14,
            padding: '16px 22px',
            boxShadow: '0 4px 24px rgba(10,22,40,0.07)',
            marginBottom: 32,
            alignSelf: 'flex-start',
          }}>
            {/* Stars + title + year */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{
                fontSize: 16, letterSpacing: 4, color: '#f59e0b', lineHeight: 1,
              }}>
                ★★★★★
              </span>
              <span style={{
                fontSize: 12, fontWeight: 800, color: NAVY,
                letterSpacing: '0.5px', fontFamily: FONT,
              }}>
                ƏN YAXŞI KLİNİKA
              </span>
              <span style={{ fontSize: 11, color: TEAL, fontFamily: FONT }}>
                2025 – 2026
              </span>
            </div>

            {/* Divider */}
            <div style={{ width: 1, height: 46, background: '#e2e8f0', flexShrink: 0 }} />

            {/* Clinic name */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span style={{
                fontSize: 12, fontWeight: 700, color: NAVY,
                letterSpacing: '0.3px', fontFamily: FONT,
              }}>
                Aslan Medical Center
              </span>
              <span style={{
                fontSize: 10, color: '#94a3b8',
                letterSpacing: '2px', textTransform: 'uppercase', fontFamily: FONT,
              }}>
                Azərbaycan
              </span>
            </div>
          </div>

          {/* ── Stat cards ── */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {STATS.map(s => (
              <div key={s.value} style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderTop: `3px solid ${TEAL}`,
                borderRadius: 12,
                padding: '14px 20px',
                minWidth: 88,
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(10,22,40,0.04)',
              }}>
                <div style={{
                  fontSize: 22, fontWeight: 800,
                  color: TEAL, lineHeight: 1, fontFamily: RALEWAY,
                }}>
                  {s.value}
                </div>
                <div style={{
                  fontSize: 11, color: '#64748b',
                  marginTop: 5, fontWeight: 500,
                  fontFamily: FONT, whiteSpace: 'nowrap',
                }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ══ RIGHT — Image ════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, scale: 1.05 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{
            flex: 1,
            position: 'relative',
            borderRadius: 24,
            overflow: 'hidden',
            minHeight: isMobile ? 260 : 480,
            boxShadow: [
              '0 32px 80px rgba(10,22,40,0.14)',
              '0 8px 24px rgba(10,22,40,0.08)',
            ].join(', '),
          }}
        >
          <img
            src="/hospital.png"
            alt="Aslan Medical Center"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              display: 'block',
            }}
          />
          {/* Bottom-to-top gradient — adds depth without hiding the logo */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: [
              'linear-gradient(to bottom,',
              '  rgba(10,22,40,0.03) 0%,',
              '  rgba(10,22,40,0.00) 40%,',
              '  rgba(10,22,40,0.28) 100%)',
            ].join(' '),
          }} />
        </motion.div>

      </div>
    </section>
  );
}
