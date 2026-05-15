import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '../hooks/useBreakpoint';
import VideoBackground from './VideoBackground';

const FONT = "'Source Sans 3', 'Raleway', sans-serif";

const HeroSection = () => {
  const { t } = useTranslation();
  const { isMobile, isTablet } = useBreakpoint();
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: isMobile ? '85vh' : 'calc(100vh - 176px)',
      overflow: 'hidden',
      background: '#030912',
    }}>

      {/* ── Video layer — preloaded crossfade ── */}
      <VideoBackground />

      {/* ── Left teal content panel (UCSF style) ── */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        style={{
          position: 'absolute',
          left: 0, top: 0, bottom: 0,
          width: isMobile ? '100%' : isTablet ? '60%' : '460px',
          zIndex: 4,
          background: isMobile
            ? 'rgba(0,80,90,0.88)'
            : 'linear-gradient(135deg, rgba(0,100,120,0.78) 0%, rgba(0,60,90,0.72) 100%)',
          padding: isMobile ? '40px 24px' : '60px 48px 60px 40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          clipPath: isMobile ? 'none' : 'polygon(0 0, 82% 0, 100% 50%, 82% 100%, 0 100%)',
        }}
      >
        {/* Overline label */}
        <p style={{
          fontSize: '12px',
          color: 'rgba(255,255,255,0.8)',
          letterSpacing: '2.5px',
          textTransform: 'uppercase',
          marginBottom: '20px',
          fontFamily: FONT,
          fontWeight: 600,
        }}>
          {t('hero.badge')}
        </p>

        {/* H1 */}
        <h1 style={{
          fontSize: isMobile ? '36px' : isTablet ? '38px' : '42px',
          fontWeight: 800,
          color: '#ffffff',
          lineHeight: 1.2,
          marginBottom: '16px',
          fontFamily: FONT,
        }}>
          {t('hero.title').split('\n').map((line, i) => (
            <span key={i}>{line}{i === 0 && <br />}</span>
          ))}
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: '16px',
          color: 'rgba(255,255,255,0.8)',
          marginBottom: '36px',
          fontFamily: FONT,
          fontWeight: 400,
        }}>
          {t('hero.subtitle')}
        </p>

        {/* Ghost button */}
        <div>
          <button
            style={{
              border: '2.5px solid white',
              borderRadius: '28px',
              padding: '12px 32px',
              width: isMobile ? '100%' : 'auto',
              color: 'white',
              background: 'transparent',
              fontSize: '15px',
              fontWeight: 600,
              fontFamily: FONT,
              cursor: 'pointer',
              transition: 'background 0.25s, color 0.25s',
              letterSpacing: '0.3px',
            }}
            onClick={() => window.location.href = '/about'}
            onMouseEnter={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.color = '#00848e'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'white'; }}
          >
            {t('hero.learnMore')}
          </button>
        </div>
      </motion.div>

      {/* ── Multi-wave transition to white below ── */}
      <div style={{
        position: 'absolute', bottom: -2, left: 0, right: 0,
        zIndex: 5, lineHeight: 0, pointerEvents: 'none',
      }}>
        <svg viewBox="0 0 1440 130" preserveAspectRatio="none"
          style={{ width: '100%', height: '130px', display: 'block' }}>
          <path d="M0,40 C180,90 360,10 540,50 C720,90 900,20 1080,55 C1260,88 1380,30 1440,45 L1440,130 L0,130 Z"
            fill="white" opacity="0.2"/>
          <path d="M0,55 C200,20 400,95 600,65 C800,35 1000,85 1200,60 C1320,45 1400,70 1440,75 L1440,130 L0,130 Z"
            fill="white" opacity="0.35"/>
          <path d="M0,70 C150,45 350,100 550,78 C750,55 950,95 1150,72 C1300,55 1400,80 1440,85 L1440,130 L0,130 Z"
            fill="white" opacity="0.55"/>
          <path d="M0,85 C200,65 420,108 640,92 C860,76 1080,105 1280,88 C1370,80 1420,92 1440,96 L1440,130 L0,130 Z"
            fill="white" opacity="0.75"/>
          <path d="M0,100 C180,82 380,112 580,102 C780,92 980,110 1180,100 C1320,93 1400,103 1440,106 L1440,130 L0,130 Z"
            fill="white"/>
        </svg>
      </div>

      <style>{`
        @media (max-width: 768px) {
          h1 { font-size: 30px !important; }
        }
      `}</style>
    </div>
  );
};

export default HeroSection;
