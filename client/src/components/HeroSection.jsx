import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const VIDEOS = ['/video1.mp4', '/video2.mp4', '/video3.mp4'];
const FONT   = "'Source Sans 3', 'Raleway', sans-serif";

const HeroSection = () => {
  const [current, setCurrent] = useState(0);
  const [fading,  setFading]  = useState(false);
  const refs = [useRef(null), useRef(null), useRef(null)];

  /* ── video rotation — unchanged ── */
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
      if (ref.current && i === current) {
        ref.current.currentTime = 0;
        ref.current.play().catch(() => {});
      }
    });
  }, [current]);

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: 'calc(100vh - 176px)',
      overflow: 'hidden',
      background: '#030912',
    }}>

      {/* ── Videos — untouched ── */}
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

      {/* ── Global dark overlay — lighter so video shows ── */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2,
        background: 'rgba(0,0,0,0.35)',
      }} />

      {/* ── Left teal content panel (UCSF style) ── */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        style={{
          position: 'absolute',
          left: 0, top: 0, bottom: 0,
          width: '460px',
          zIndex: 3,
          background: 'linear-gradient(135deg, rgba(0,100,120,0.93) 0%, rgba(0,60,90,0.89) 100%)',
          padding: '60px 48px 60px 40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          clipPath: 'polygon(0 0, 82% 0, 100% 50%, 82% 100%, 0 100%)',
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
          Tibbi Mərkəz &amp; Müayinə
        </p>

        {/* H1 */}
        <h1 style={{
          fontSize: '42px',
          fontWeight: 800,
          color: '#ffffff',
          lineHeight: 1.2,
          marginBottom: '16px',
          fontFamily: FONT,
        }}>
          Azərbaycanda Ən<br />
          Müasir Tibbi Mərkəz
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: '16px',
          color: 'rgba(255,255,255,0.8)',
          marginBottom: '36px',
          fontFamily: FONT,
          fontWeight: 400,
        }}>
          Aslan Medical Clinic
        </p>

        {/* Ghost button */}
        <div>
          <button
            style={{
              border: '2.5px solid white',
              borderRadius: '28px',
              padding: '12px 32px',
              color: 'white',
              background: 'transparent',
              fontSize: '15px',
              fontWeight: 600,
              fontFamily: FONT,
              cursor: 'pointer',
              transition: 'background 0.25s, color 0.25s',
              letterSpacing: '0.3px',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.color = '#00848e'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'white'; }}
          >
            Ətraflı Öyrən
          </button>
        </div>
      </motion.div>

      {/* ── Dot indicators bottom right ── */}
      <div style={{
        position: 'absolute', bottom: 28, right: 40,
        display: 'flex', gap: '8px', zIndex: 5,
      }}>
        {VIDEOS.map((_, i) => (
          <div key={i} onClick={() => setCurrent(i)} style={{
            width: current === i ? 28 : 8,
            height: 8, borderRadius: 4,
            cursor: 'pointer',
            background: current === i ? '#00848e' : 'rgba(255,255,255,0.4)',
            transition: 'all 0.3s ease',
          }} />
        ))}
      </div>

      {/* ── Progress bar bottom ── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0,
        height: '3px', background: '#00848e',
        animation: 'heroProgress 6s linear infinite',
        zIndex: 5,
      }} />

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
        @keyframes heroProgress { from { width: 0% } to { width: 100% } }
        @media (max-width: 768px) {
          h1 { font-size: 30px !important; }
        }
      `}</style>
    </div>
  );
};

export default HeroSection;
