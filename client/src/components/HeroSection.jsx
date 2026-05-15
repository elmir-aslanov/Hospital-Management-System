import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const VIDEOS = ['/video1.mp4', '/video2.mp4', '/video3.mp4'];


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


      <style>{`
        @media (max-width: 768px) {
          h1 { font-size: 38px !important; }
        }
      `}</style>
    </div>
  );
};

export default HeroSection;
