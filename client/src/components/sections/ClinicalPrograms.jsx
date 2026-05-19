import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useBreakpoint } from '../../hooks/useBreakpoint';

const FONT = "'Source Sans 3', 'Raleway', sans-serif";
const NAVY = '#0a1628';
const TEAL = '#00848e';
const GOLD = '#c9a84c';

export default function ClinicalPrograms() {
  const navigate = useNavigate();
  const { isMobile } = useBreakpoint();

  const ringSize  = isMobile ? 290 : 380;
  const imgSize   = isMobile ? 260 : 340;
  const smallSize = isMobile ? 120 : 160;

  return (
    <section style={{ background: '#ffffff', padding: '80px 0', fontFamily: FONT }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 40px',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr auto auto',
        alignItems: 'center',
        gap: isMobile ? 48 : 56,
      }}>

        {/* ── COLUMN 1 — Left text block ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 style={{
            fontSize: isMobile ? 30 : 42,
            fontWeight: 800,
            color: NAVY,
            lineHeight: 1.15,
            margin: '0 0 20px',
            fontFamily: FONT,
          }}>
            Klinik Proqramlar
          </h2>

          <p style={{
            fontSize: 16,
            color: '#4a5568',
            lineHeight: 1.8,
            margin: 0,
            maxWidth: 380,
            fontFamily: FONT,
          }}>
            Aslan Medical Center təcrübəli həkimlər, müasir tibbi texnologiyalar
            və pasiyent yönümlü xidməti bir araya gətirir. Klinik proqramlarımız
            diaqnostika, cərrahiyyə, kardiologiya, pediatriya, terapiya, təcili
            yardım və profilaktik sağlamlıq xidmətlərini əhatə edir.
          </p>
        </motion.div>

        {/* ── COLUMN 2 — Large center circle image ───────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          style={{
            position: 'relative',
            width: ringSize,
            height: ringSize,
            flexShrink: 0,
            margin: isMobile ? '0 auto' : undefined,
          }}
        >
          {/* Outer decorative gold ring — only this rotates */}
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: `2px solid ${GOLD}`,
            transform: 'rotate(-15deg)',
            pointerEvents: 'none',
          }} />

          {/* Inner image circle — NOT rotated */}
          <div style={{
            position: 'absolute',
            width: imgSize,
            height: imgSize,
            borderRadius: '50%',
            overflow: 'hidden',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 5,
          }}>
            <img
              src="/client1.jpeg"
              alt="Klinik proqramlar"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
            />
          </div>
        </motion.div>

        {/* ── COLUMN 3 — 2×2 circle grid ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            display: 'grid',
            gridTemplateColumns: `${smallSize}px ${smallSize}px`,
            gridTemplateRows: `${smallSize}px ${smallSize}px`,
            gap: 16,
            flexShrink: 0,
            margin: isMobile ? '0 auto' : undefined,
          }}
        >
          {/* Top-left */}
          <div style={{
            width: smallSize,
            height: smallSize,
            borderRadius: '50%',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #0a1628 0%, #00848e 100%)',
          }}>
            <img
              src="/client2.jpeg"
              alt="Klinik 1"
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
            />
          </div>

          {/* Top-right */}
          <div style={{
            width: smallSize,
            height: smallSize,
            borderRadius: '50%',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #00848e 0%, #0a1628 100%)',
          }}>
            <img
              src="/client3.jpeg"
              alt="Klinik 2"
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
            />
          </div>

          {/* Bottom-left */}
          <div style={{
            width: smallSize,
            height: smallSize,
            borderRadius: '50%',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #0a1628 0%, #1a3a5c 100%)',
          }}>
            <img
              src="/client4.jpeg"
              alt="Klinik 3"
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
            />
          </div>

          {/* Bottom-right */}
          <div
            onClick={() => navigate('/departments')}
            style={{
              width: smallSize,
              height: smallSize,
              borderRadius: '50%',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #00848e 0%, #0a1628 100%)',
              cursor: 'pointer',
            }}
          >
            <img
              src="/client5.jpeg"
              alt="Klinik 4"
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
            />
          </div>
        </motion.div>

      </div>
    </section>
  );
}
