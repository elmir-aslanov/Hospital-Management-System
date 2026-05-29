import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useBreakpoint } from '../../hooks/useBreakpoint';

const FONT = "'Source Sans 3', 'Raleway', sans-serif";
const NAVY = '#0a1628';
const TEAL = '#00848e';
const GOLD = '#c89c2a';

// ── Small circle image ────────────────────────────────────────────────────────
function SmallCircle({ src, alt, size, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.82 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.48, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        border: '3px solid #dde4ea',
        background: '#d0dae3',
        boxShadow: '0 6px 22px rgba(10,22,40,0.10)',
        flexShrink: 0,
      }}
    >
      {/* Replace src with your actual image path */}
      <img
        src={src}
        alt={alt}
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
        onError={e => {
          e.currentTarget.style.display = 'none';
          e.currentTarget.nextSibling.style.display = 'block';
        }}
      />
      <div style={{
        display: 'none', width: '100%', height: '100%',
        background: `linear-gradient(135deg, #1a3050 0%, ${TEAL} 100%)`,
      }} />
    </motion.div>
  );
}

// ── "Learn More" circle CTA ───────────────────────────────────────────────────
function LearnMoreCircle({ size, onClick, delay }) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.82 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.48, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: '#fff',
        border: `2.5px solid ${TEAL}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        flexShrink: 0,
        fontFamily: FONT,
        transition: 'background 0.2s',
        boxShadow: 'none',
        outline: 'none',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,132,142,0.06)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
    >
      <span style={{
        color: TEAL,
        fontSize: 15,
        fontWeight: 700,
        letterSpacing: '0.01em',
        fontFamily: FONT,
      }}>
        Learn More
      </span>
    </motion.button>
  );
}

// ── Main section ──────────────────────────────────────────────────────────────
export default function ClinicalProgramsSection() {
  const navigate = useNavigate();
  const { isMobile, isTablet } = useBreakpoint();
  const isNarrow = isMobile || isTablet;

  // Sizes
  const mainImgSize = isMobile ? 210 : isTablet ? 250 : 295;
  const arcPad      = 28; // extra space around image for the arc
  const arcSize     = mainImgSize + arcPad * 2;
  const smallSize   = isMobile ? 114 : isTablet ? 128 : 146;
  const gridGap     = 14;

  // SVG arc — 84% dash, 16% gap, gap sits at top (12 o'clock)
  const r           = arcSize / 2 - 4;
  const cx          = arcSize / 2;
  const cy          = arcSize / 2;
  const circ        = 2 * Math.PI * r;
  const dashLen     = circ * 0.84;
  const gapLen      = circ * 0.16;
  // rotate(-60) puts the gap opening centered near the top of the circle
  const arcRotate   = `rotate(-60 ${cx} ${cy})`;

  return (
    <section style={{
      background: '#ffffff',
      padding: isMobile ? '64px 0' : '96px 0',
      fontFamily: FONT,
      width: '100%',
    }}>
      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: isMobile ? '0 22px' : isTablet ? '0 44px' : '0 80px',
        display: 'grid',
        /* Desktop: text | large-circle | 2×2-grid */
        gridTemplateColumns: isNarrow
          ? '1fr'
          : `1fr ${arcSize}px ${smallSize * 2 + gridGap}px`,
        alignItems: 'center',
        gap: isMobile ? 44 : isTablet ? 48 : 56,
      }}>

        {/* ══ COLUMN 1 — Text ══════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, x: -28 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h2 style={{
            fontSize: isMobile ? 30 : isTablet ? 36 : 42,
            fontWeight: 800,
            color: NAVY,
            lineHeight: 1.15,
            letterSpacing: '-0.015em',
            margin: '0 0 22px',
            fontFamily: FONT,
          }}>
            Clinical Programs
          </h2>

          <p style={{
            fontSize: isMobile ? 15 : 16.5,
            color: '#374151',
            lineHeight: 1.9,
            margin: 0,
            maxWidth: 480,
            fontFamily: FONT,
          }}>
            Aslan Medical Center brings together experienced doctors, modern medical
            technology, and patient-centered care across a wide range of specialties.
            Our clinical programs cover diagnostics, surgery, cardiology, pediatrics,
            therapy, emergency care, and preventive health services, providing reliable
            and compassionate care for every patient.
          </p>
        </motion.div>

        {/* ══ COLUMN 2 — Large circle with golden arc ══════════════════════ */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, delay: 0.12, ease: 'easeOut' }}
          style={{
            position: 'relative',
            width: arcSize,
            height: arcSize,
            margin: isNarrow ? '0 auto' : undefined,
            flexShrink: 0,
          }}
        >
          {/* Golden decorative arc (SVG) */}
          <svg
            width={arcSize}
            height={arcSize}
            viewBox={`0 0 ${arcSize} ${arcSize}`}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 3,
              pointerEvents: 'none',
              overflow: 'visible',
            }}
          >
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={GOLD}
              strokeWidth={3.5}
              strokeLinecap="round"
              strokeDasharray={`${dashLen} ${gapLen}`}
              transform={arcRotate}
            />
          </svg>

          {/* Teal solid dot — sits inside the arc gap at top */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.55, duration: 0.4 }}
            style={{
              position: 'absolute',
              width: isMobile ? 24 : 32,
              height: isMobile ? 24 : 32,
              borderRadius: '50%',
              background: TEAL,
              // positioned at the top-right of the arc gap (~1 o'clock)
              top: isMobile ? 8 : 10,
              right: isMobile ? arcPad + 4 : arcPad + 10,
              zIndex: 10,
            }}
          />

          {/* Main image circle */}
          {/* Replace /images/clinical-main.jpg with your primary group/team photo */}
          <div style={{
            position: 'absolute',
            width: mainImgSize,
            height: mainImgSize,
            borderRadius: '50%',
            overflow: 'hidden',
            border: '4px solid #e0e8ef',
            background: '#c8d5de',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 5,
            boxShadow: '0 16px 52px rgba(10,22,40,0.14)',
          }}>
            <img
              src="/images/clinical-main.jpg"
              alt="Clinical programs"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
              onError={e => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextSibling.style.display = 'block';
              }}
            />
            <div style={{
              display: 'none',
              width: '100%',
              height: '100%',
              background: `linear-gradient(145deg, ${NAVY} 0%, ${TEAL} 100%)`,
            }} />
          </div>
        </motion.div>

        {/* ══ COLUMN 3 — 2×2 circles grid ═════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, x: 28 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.22, ease: 'easeOut' }}
          style={{
            display: 'grid',
            gridTemplateColumns: `${smallSize}px ${smallSize}px`,
            gridTemplateRows: `${smallSize}px ${smallSize}px`,
            gap: gridGap,
            margin: isNarrow ? '0 auto' : undefined,
          }}
        >
          {/* Replace each src below with your image paths */}

          {/* Top-left: clinical-1.jpg */}
          <SmallCircle
            src="/images/clinical-1.jpg"
            alt="Clinical program 1"
            size={smallSize}
            delay={0.28}
          />

          {/* Top-right: clinical-2.jpg */}
          <SmallCircle
            src="/images/clinical-2.jpg"
            alt="Clinical program 2"
            size={smallSize}
            delay={0.36}
          />

          {/* Bottom-left: clinical-3.jpg */}
          <SmallCircle
            src="/images/clinical-3.jpg"
            alt="Clinical program 3"
            size={smallSize}
            delay={0.44}
          />

          {/* Bottom-right: "Learn More" circle CTA */}
          <LearnMoreCircle
            size={smallSize}
            onClick={() => navigate('/departments')}
            delay={0.52}
          />
        </motion.div>

      </div>
    </section>
  );
}
