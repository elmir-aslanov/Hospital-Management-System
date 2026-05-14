import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const VIDEOS = ['/video1.mp4', '/video2.mp4', '/video3.mp4'];

function PlayButton() {
  return (
    <div style={{
      position: 'absolute',
      right: '15%',
      top: '50%',
      transform: 'translateY(-50%)',
      zIndex: 4,
    }}>
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          width: '64px', height: '64px',
          borderRadius: '50%',
          background: '#00BCD4',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 0 0 0 rgba(0,188,212,0.5)',
        }}
      >
        {/* Play triangle */}
        <div style={{
          width: 0, height: 0,
          borderTop: '11px solid transparent',
          borderBottom: '11px solid transparent',
          borderLeft: '18px solid #ffffff',
          marginLeft: '4px',
        }} />
      </motion.div>
      {/* Ripple ring */}
      <motion.div
        animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: '2px solid #00BCD4',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

function SliderArrow({ direction, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'absolute',
        [direction === 'left' ? 'left' : 'right']: '20px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 4,
        width: '44px', height: '44px',
        borderRadius: '50%',
        border: `2px solid ${hovered ? '#00BCD4' : 'rgba(255,255,255,0.5)'}`,
        background: 'transparent',
        color: hovered ? '#00BCD4' : '#ffffff',
        fontSize: '20px',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'border-color 0.2s, color 0.2s',
        lineHeight: 1,
      }}
    >
      {direction === 'left' ? '‹' : '›'}
    </button>
  );
}

const HeroSection = () => {
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);
  const refs = [useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setCurrent(prev => (prev + 1) % 3);
        setFading(false);
      }, 800);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    refs.forEach((ref, i) => {
      if (ref.current) {
        if (i === current) {
          ref.current.currentTime = 0;
          ref.current.play().catch(() => {});
        }
      }
    });
  }, [current]);

  const prev = () => {
    setFading(true);
    setTimeout(() => { setCurrent(p => (p - 1 + 3) % 3); setFading(false); }, 800);
  };
  const next = () => {
    setFading(true);
    setTimeout(() => { setCurrent(p => (p + 1) % 3); setFading(false); }, 800);
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: 'calc(100vh - 80px)',
      overflow: 'hidden',
      background: '#030912',
    }}>

      {/* Videos */}
      {VIDEOS.map((src, i) => (
        <video
          key={i}
          ref={refs[i]}
          autoPlay={i === 0}
          muted
          playsInline
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            opacity: current === i ? (fading ? 0 : 1) : 0,
            transition: 'opacity 0.8s ease',
            zIndex: 1,
          }}
        >
          <source src={src} type="video/mp4" />
        </video>
      ))}

      {/* Overlay — lighter so video is more visible */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2,
        background: 'rgba(10,22,40,0.55)',
      }} />

      {/* Left/right arrows */}
      <SliderArrow direction="left" onClick={prev} />
      <SliderArrow direction="right" onClick={next} />


      {/* Text content */}
      <div style={{
        position: 'relative', zIndex: 3,
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '6vw',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          style={{ maxWidth: '560px' }}
        >
          {/* Label */}
          <p style={{
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: 700,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginBottom: '16px',
            fontFamily: "'Raleway', sans-serif",
          }}>
            Tibbi Mərkəz &amp; Müayinə
          </p>

          {/* H1 */}
          <h1 style={{
            fontSize: '62px',
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1.1,
            marginBottom: '20px',
            fontFamily: "'Raleway', sans-serif",
          }}>
            Azərbaycanda Ən<br />
            Müasir Tibbi<br />
            <span style={{ color: '#00BCD4' }}>Mərkəz</span>
          </h1>

          {/* Description */}
          <p style={{
            color: 'rgba(255,255,255,0.85)',
            fontSize: '16px',
            lineHeight: 1.7,
            maxWidth: '560px',
            marginBottom: '32px',
            fontFamily: "'Raleway', sans-serif",
          }}>
            Müasir avadanlıq və təcrübəli həkimlərimizlə
            sağlamlığınızı qoruyuruq. Sağlamlığınız — Prioritetimiz.
          </p>

          {/* Button */}
          <button
            style={{
              padding: '14px 36px',
              background: '#00BCD4',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '15px',
              fontWeight: 700,
              fontFamily: "'Raleway', sans-serif",
              cursor: 'pointer',
              letterSpacing: '0.5px',
              transition: 'background 0.2s, transform 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#0096C7'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#00BCD4'; e.currentTarget.style.transform = 'none'; }}
          >
            Randevu Al
          </button>
        </motion.div>
      </div>

      {/* Indicator dots */}
      <div style={{
        position: 'absolute', bottom: 28, right: 40,
        display: 'flex', gap: 8, zIndex: 10,
      }}>
        {VIDEOS.map((_, i) => (
          <div key={i} onClick={() => setCurrent(i)}
            style={{
              width: current === i ? 28 : 8, height: 8,
              borderRadius: 4, cursor: 'pointer',
              background: current === i ? '#00BCD4' : 'rgba(255,255,255,0.35)',
              transition: 'all 0.3s',
            }}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0,
        height: '3px', background: '#00BCD4', zIndex: 10,
        animation: 'heroProgress 6s linear infinite',
      }} />

      <style>{`
        @keyframes heroProgress { from { width: 0% } to { width: 100% } }
        @media (max-width: 768px) {
          h1 { font-size: 38px !important; }
        }
      `}</style>
    </div>
  );
};

export default HeroSection;
