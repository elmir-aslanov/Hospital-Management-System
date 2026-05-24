import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useBreakpoint } from '../../hooks/useBreakpoint';

const FONT = "'Source Sans 3', 'Raleway', sans-serif";
const NAVY = '#0a1628';
const TEAL = '#00848e';
const GOLD = '#c9a84c';

const SMALL = [
  { src: '/client2.jpeg', alt: 'Klinik 1', bg: 'linear-gradient(135deg,#0a1628 0%,#00848e 100%)', nav: false },
  { src: '/client3.jpeg', alt: 'Klinik 2', bg: 'linear-gradient(135deg,#00848e 0%,#0a1628 100%)', nav: false },
  { src: '/client4.jpeg', alt: 'Klinik 3', bg: 'linear-gradient(135deg,#0a1628 0%,#1a3a5c 100%)', nav: false },
  { src: '/client5.jpeg', alt: 'Klinik 4', bg: 'linear-gradient(135deg,#00848e 0%,#0a1628 100%)', nav: true  },
];

export default function ClinicalPrograms() {
  const navigate    = useNavigate();
  const { isMobile, isTablet } = useBreakpoint();
  const isNarrow    = isMobile || isTablet;

  const py          = isMobile ? 64 : 80;
  const ringSize    = isMobile ? 300 : isTablet ? 370 : 460;
  const imgInset    = isMobile ? 15  : isTablet ? 15  : 20;
  const smallCircle = isMobile ? 130 : isTablet ? 160 : 200;

  return (
    <section style={{ background: '#ffffff', paddingTop: py, paddingBottom: py, fontFamily: FONT }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: isNarrow ? '1fr' : '1fr 1fr',
          gap: isNarrow ? 40 : 56,
          alignItems: 'center',
        }}>

          {/* ── LEFT — Text ───────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ maxWidth: 480 }}
          >
            <h2 style={{
              fontSize: isMobile ? 28 : isTablet ? 34 : 40,
              fontWeight: 800,
              color: NAVY,
              lineHeight: 1.15,
              margin: '0 0 18px',
              fontFamily: FONT,
            }}>
              Klinik Proqramlar
            </h2>

            <p style={{
              fontSize: isMobile ? 15 : 16,
              color: '#4a5568',
              lineHeight: 1.85,
              margin: 0,
              fontFamily: FONT,
            }}>
              Aslan Medical Center təcrübəli həkimlər, müasir tibbi texnologiyalar
              və pasiyent yönümlü xidməti bir araya gətirir. Klinik proqramlarımız
              diaqnostika, cərrahiyyə, kardiologiya, pediatriya, terapiya, təcili
              yardım və profilaktik sağlamlıq xidmətlərini əhatə edir.
            </p>
          </motion.div>

          {/* ── RIGHT — Image collage ─────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.12 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isNarrow ? 'center' : 'flex-end',
              gap: isNarrow ? 20 : 24,
              flexWrap: 'nowrap',
            }}
          >
            {/* Main large circle with decorative gold ring */}
            <div style={{
              position: 'relative',
              width: ringSize,
              height: ringSize,
              flexShrink: 0,
            }}>
              {/* Gold ring */}
              <div style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: `2px solid ${GOLD}`,
                transform: 'rotate(-15deg)',
                pointerEvents: 'none',
              }} />
              {/* Image circle */}
              <div style={{
                position: 'absolute',
                borderRadius: '50%',
                overflow: 'hidden',
                inset: imgInset,
                zIndex: 5,
              }}>
                <img
                  src="/client1.jpeg"
                  alt="Klinik proqramlar"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
                />
              </div>
            </div>

            {/* 2×2 small circles — hidden on mobile */}
            {!isMobile && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: `${smallCircle}px ${smallCircle}px`,
                gridTemplateRows: `${smallCircle}px ${smallCircle}px`,
                gap: 20,
                flexShrink: 0,
              }}>
                {SMALL.map(({ src, alt, bg, nav }) => (
                  <div
                    key={alt}
                    onClick={nav ? () => navigate('/departments') : undefined}
                    style={{
                      width: smallCircle,
                      height: smallCircle,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      background: bg,
                      cursor: nav ? 'pointer' : 'default',
                      flexShrink: 0,
                    }}
                  >
                    <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
