import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

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

const defaultContent = {
  overline: 'XƏSTƏ HEKAYƏLƏRİ',
  title: 'Pasiyent',
  titleHighlight: 'Hekayələri',
  linkLabel: 'Onların dediklərinə bax',
};

function StoryCard({ story, style, animDelay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.06, zIndex: 10 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, ease: 'easeOut', delay: animDelay }}
      style={{
        position: 'absolute',
        overflow: 'hidden',
        cursor: 'pointer',
        background: story.gradient,
        ...style,
      }}
    >
      <img
        src={story.image}
        alt={story.name}
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
        onError={e => { e.target.style.display = 'none'; }}
      />

    </motion.div>
  );
}

export default function PatientStories({
  stories = defaultStories,
  content = defaultContent,
}) {
  const navigate = useNavigate();
  const { overline, title, titleHighlight, linkLabel } = content;

  return (
    <div style={{
      background: '#ffffff',
      padding: '100px 0',
      position: 'relative',
      overflow: 'hidden',
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
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 80px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        alignItems: 'center',
        gap: '80px',
        position: 'relative',
        zIndex: 1,
      }}>

        {/* ── LEFT — Photo collage ── */}
        <div style={{ position: 'relative', width: '100%', height: '520px' }}>
          <div style={{
            position: 'absolute',
            top: '-10px', left: '-20px',
            width: '160px', height: '160px',
            backgroundImage: 'radial-gradient(circle, #cbd5e0 1.5px, transparent 1.5px)',
            backgroundSize: '16px 16px',
            opacity: 0.6, zIndex: 0, pointerEvents: 'none',
          }} />

          <StoryCard
            story={stories[0]}
            animDelay={0}
            style={{
              top: '80px', left: '0',
              width: '240px', height: '240px',
              borderRadius: '24px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
              zIndex: 2,
            }}
          />
          <StoryCard
            story={stories[1]}
            animDelay={0.15}
            style={{
              top: '0', right: '20px',
              width: '280px', height: '320px',
              borderRadius: '32px',
              boxShadow: '0 16px 48px rgba(0,0,0,0.14)',
              zIndex: 3,
            }}
          />
          <StoryCard
            story={stories[2]}
            animDelay={0.3}
            style={{
              bottom: '0', left: '100px',
              width: '260px', height: '220px',
              borderRadius: '24px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
              zIndex: 2,
            }}
          />
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
            "Hər pasiyentin arxasında bir hekayə var.
            Onlar bizə etibar etdi — biz onları sağaltdıq."
          </p>

          <button
            onClick={() => navigate('/pasiyent-hekayeleri')}
            style={{
              display: 'inline-flex', alignItems: 'center',
              gap: '12px', cursor: 'pointer',
              marginTop: '16px', background: 'none',
              border: 'none', padding: 0,
            }}
            onMouseEnter={e => e.currentTarget.querySelector('.label').style.textDecoration = 'underline'}
            onMouseLeave={e => e.currentTarget.querySelector('.label').style.textDecoration = 'none'}
          >
            <span style={{
              width: '38px', height: '38px', borderRadius: '50%',
              background: '#00848e', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: '18px', flexShrink: 0,
            }}>›</span>
            <span className="label" style={{
              color: '#00848e', fontSize: '16px', fontWeight: 700,
            }}>
              {linkLabel}
            </span>
          </button>
        </motion.div>

      </div>
    </div>
  );
}
