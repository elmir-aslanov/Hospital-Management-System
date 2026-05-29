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
      zIndex: 1,
      width: '100%',
      height: isMobile ? 'calc(100svh - 60px)' : 'min(70vh, 700px)',
      minHeight: isMobile ? '480px' : '560px',
      overflow: 'hidden',
      background: '#030912',
    }}>

      <VideoBackground />

      {/* Left teal content panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        style={{
          position: 'absolute',
          left: 0, top: 0, bottom: 0,
          width: isMobile ? '100%' : isTablet ? '60%' : '460px',
          zIndex: 4,
          background: isMobile
            ? 'linear-gradient(160deg, rgba(0,80,90,0.88) 0%, rgba(0,40,60,0.82) 100%)'
            : 'linear-gradient(135deg, rgba(0,100,120,0.78) 0%, rgba(0,60,90,0.72) 100%)',
          padding: isMobile ? '32px 24px 40px' : '60px 48px 60px 80px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          clipPath: isMobile ? 'none' : 'polygon(0 0, 82% 0, 100% 50%, 82% 100%, 0 100%)',
        }}
      >
        {/* Badge */}
        <p style={{
          fontSize: isMobile ? '10px' : '12px',
          color: 'rgba(255,255,255,0.8)',
          letterSpacing: isMobile ? '2px' : '2.5px',
          textTransform: 'uppercase',
          marginBottom: isMobile ? '12px' : '20px',
          fontFamily: FONT,
          fontWeight: 600,
        }}>
          {t('hero.badge')}
        </p>

        {/* H1 */}
        <h1 style={{
          fontSize: isMobile ? '32px' : isTablet ? '38px' : '42px',
          fontWeight: 800,
          color: '#ffffff',
          lineHeight: isMobile ? 1.15 : 1.2,
          marginBottom: isMobile ? '8px' : '16px',
          fontFamily: FONT,
        }}>
          {t('hero.title').split('\n').map((line, i) => (
            <span key={i}>{line}{i === 0 && <br />}</span>
          ))}
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: isMobile ? '13px' : '16px',
          color: isMobile ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.8)',
          marginBottom: isMobile ? '24px' : '36px',
          fontFamily: FONT,
          fontWeight: 400,
        }}>
          {t('hero.subtitle')}
        </p>

        {/* Button */}
        <div>
          <button
            style={{
              border: '2px solid white',
              borderRadius: '28px',
              padding: '12px 28px',
              width: 'fit-content',
              color: 'white',
              background: 'transparent',
              fontSize: isMobile ? '14px' : '15px',
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

      {/* Multi-wave transition */}
      <div style={{
        position: 'absolute', bottom: -2, left: 0, right: 0,
        zIndex: 5, lineHeight: 0, pointerEvents: 'none',
      }}>
        <svg viewBox="0 0 1440 130" preserveAspectRatio="none"
          style={{ width: '100%', height: isMobile ? '60px' : '130px', display: 'block' }}>
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
    </div>
  );
};

export default HeroSection;
