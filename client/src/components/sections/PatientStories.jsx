import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '../../hooks/useBreakpoint';

const defaultStories = [
  {
    id: 1,
    name: 'Pasiyent 1',
    condition: 'Müalicə, Bakı',
    image: '/pasiyent1.jpeg',
    gradient: 'linear-gradient(135deg, #0a1628 0%, #006b74 100%)',
  },
  {
    id: 2,
    name: 'Pasiyent 2',
    condition: 'Müalicə, Bakı',
    image: '/pasiyent2.jpeg',
    gradient: 'linear-gradient(135deg, #0a1628 0%, #00848e 100%)',
  },
  {
    id: 3,
    name: 'Pasiyent 3',
    condition: 'Cərrahiyyə, Bakı',
    image: '/pasiyent3.jpeg',
    gradient: 'linear-gradient(135deg, #023e5e 0%, #00848e 100%)',
  },
];

const defaultContent = null;

function StoryCard({ story, gridStyle, animDelay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03, boxShadow: '0 16px 48px rgba(0,132,142,0.2)' }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: animDelay }}
      style={{
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        borderRadius: '20px',
        background: story.gradient,
        ...gridStyle,
      }}
    >
      <img
        src={story.image}
        alt={story.name}
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
        onError={e => { e.target.style.display = 'none'; }}
      />
    </motion.div>
  );
}

export default function PatientStories({ stories = defaultStories }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isMobile, isTablet } = useBreakpoint();
  const overline      = t('patientStories.overline');
  const title         = t('patientStories.title1');
  const titleHighlight= t('patientStories.title2');

  const px = isMobile ? 16 : isTablet ? 24 : 32;

  return (
    <div style={{
      background: '#ffffff',
      padding: isMobile ? '64px 0' : '88px 0',
      position: 'relative',
    }}>

      {/* Top-right curved decoration */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: '220px', height: '220px',
        opacity: 0.07, zIndex: 0, pointerEvents: 'none',
      }}>
        <svg viewBox="0 0 220 220" fill="none">
          <path d="M220,0 C220,120 120,220 0,220" stroke="#00848e" strokeWidth="50" fill="none"/>
          <path d="M220,50 C220,150 150,220 50,220" stroke="#00848e" strokeWidth="25" fill="none"/>
        </svg>
      </div>

      <div style={{
        maxWidth: 1280,
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: px,
        paddingRight: px,
        boxSizing: 'border-box',
        display: 'grid',
        gridTemplateColumns: isMobile || isTablet ? '1fr' : '1fr 1fr',
        alignItems: 'center',
        gap: isMobile ? 40 : 64,
        position: 'relative',
        zIndex: 1,
      }}>

        {/* ── LEFT — Staggered grid ── */}
        <div style={isMobile ? {
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          width: '100%',
        } : {
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: 'auto auto',
          gap: '16px',
          width: '100%',
          maxWidth: '480px',
        }}>
          <StoryCard story={stories[0]} animDelay={0} gridStyle={isMobile ? {
            width: '100%', height: '220px', borderRadius: '16px',
            boxShadow: '0 8px 28px rgba(0,0,0,0.1)',
          } : {
            gridColumn: '1', gridRow: '1', height: '240px',
            boxShadow: '0 8px 28px rgba(0,0,0,0.1)', transform: 'translateY(0px)',
          }} />
          <StoryCard story={stories[1]} animDelay={0.15} gridStyle={isMobile ? {
            width: '100%', height: '220px', borderRadius: '16px',
            boxShadow: '0 12px 36px rgba(0,0,0,0.12)',
          } : {
            gridColumn: '2', gridRow: '1', height: '240px',
            boxShadow: '0 12px 36px rgba(0,0,0,0.12)', transform: 'translateY(0px)',
          }} />
          <StoryCard story={stories[2]} animDelay={0.3} gridStyle={isMobile ? {
            width: '100%', height: '220px', borderRadius: '16px',
            boxShadow: '0 8px 28px rgba(0,0,0,0.1)',
          } : {
            gridColumn: '1 / span 2', gridRow: '2', height: '240px',
            boxShadow: '0 8px 28px rgba(0,0,0,0.1)', transform: 'translateY(0px)',
          }} />
        </div>

        {/* ── RIGHT — Text content ── */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <p style={{
            fontSize: '11px', letterSpacing: '3px',
            color: '#00848e', fontWeight: 700,
            textTransform: 'uppercase', marginBottom: '14px',
          }}>
            {overline}
          </p>

          <h2 style={{ lineHeight: 1.2, marginBottom: 0 }}>
            <span style={{ color: '#0a1628', fontWeight: 800, fontSize: '40px' }}>{title} </span>
            <span style={{ color: '#00848e', fontWeight: 800, fontSize: '40px' }}>{titleHighlight}</span>
          </h2>

          <div style={{
            width: '60px', height: '3px',
            background: '#00848e', borderRadius: '2px',
            margin: '14px 0 28px',
          }} />

          <p style={{
            fontSize: '18px', color: '#4a5568',
            lineHeight: 1.8, marginBottom: '28px',
            fontStyle: 'italic',
          }}>
            {t('patientStories.quote')}
          </p>

        </motion.div>

      </div>
    </div>
  );
}
