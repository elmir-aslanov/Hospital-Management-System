import { useState, useEffect, useRef } from 'react';
import { media } from '../config/media';
import { useBreakpoint } from '../hooks/useBreakpoint';

const VIDEOS = [media.heroVideo1, media.heroVideo2, media.heroVideo3];
const INTERVAL      = 6000;
const FADE_DURATION = 1200;

export default function VideoBackground() {
  const { isMobile } = useBreakpoint();
  const [active, setActive]   = useState(0);
  const [loaded, setLoaded]   = useState([false, false, false]);
  const videoRefs = useRef([]);
  const timerRef  = useRef(null);

  /* ── Preload all videos on mount ── */
  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (!video) return;
      video.load();
      const onCanPlay = () => {
        setLoaded(prev => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
        video.removeEventListener('canplay', onCanPlay);
      };
      video.addEventListener('canplay', onCanPlay);
    });
  }, []);

  /* ── Play the active video from start ── */
  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (!video) return;
      if (i === active) {
        video.currentTime = 0;
        video.play().catch(() => {});
      }
    });
  }, [active]);

  /* ── Auto-advance ── */
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setActive(prev => (prev + 1) % VIDEOS.length);
    }, INTERVAL);
    return () => clearInterval(timerRef.current);
  }, []);

  const goTo = (i) => {
    setActive(i);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActive(prev => (prev + 1) % VIDEOS.length);
    }, INTERVAL);
  };

  /*
    VIDEO QUALITY TIPS:
    For best quality compress with HandBrake (free):
    - Resolution: 1920x1080 (1080p)
    - Video Codec: H.264
    - Quality RF: 20-22 (lower = better quality)
    - Audio: None (muted anyway)
    - Format: MP4
    Target file size: 8-15MB per video
  */

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 0,
      background: 'linear-gradient(135deg, #030912 0%, #0a2540 100%)',
      overflow: 'hidden',
    }}>

      {/* Always visible background — shows until video loads */}
      <div style={{
        position: 'absolute', inset: 0,
        zIndex: 0,
        background: `
          linear-gradient(135deg,
            #030912 0%,
            #0a1f3a 40%,
            #0d2d4a 70%,
            #0a1628 100%)
        `
      }}>
        {/* Animated pulse circles to fill the black screen */}
        <div style={{
          position: 'absolute',
          top: '30%', right: '25%',
          width: '400px', height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,188,212,0.08) 0%, transparent 70%)',
          animation: 'pulse-bg 4s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '20%', right: '10%',
          width: '300px', height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,132,142,0.06) 0%, transparent 70%)',
          animation: 'pulse-bg 4s ease-in-out infinite 1.5s'
        }} />
        {/* Subtle grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(0,188,212,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,188,212,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Loading spinner — shows only while first video loading */}
      {!loaded[0] && (
        <div style={{
          position: 'absolute',
          bottom: '48px', right: '48px',
          zIndex: 10,
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <div style={{
            width: '16px', height: '16px',
            borderRadius: '50%',
            border: '2px solid rgba(0,188,212,0.3)',
            borderTopColor: '#00BCD4',
            animation: 'spin 0.8s linear infinite'
          }} />
          <span style={{
            fontSize: '11px', color: 'rgba(255,255,255,0.4)',
            letterSpacing: '1px'
          }}>Yüklənir...</span>
        </div>
      )}

      {/* All videos rendered at once — opacity crossfade only, never unmounted */}
      {VIDEOS.map((src, i) => (
        <video
          key={src}
          ref={el => videoRefs.current[i] = el}
          muted
          playsInline
          loop={false}
          preload="auto"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            objectPosition: isMobile ? 'center center' : 'center',
            opacity: active === i && loaded[i] ? 1 : 0,
            transition: `opacity ${FADE_DURATION}ms ease-in-out`,
            zIndex: active === i ? 2 : 1,
            imageRendering: 'high-quality',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'translateZ(0)',
            willChange: 'opacity',
          }}
        >
          <source src={src} type="video/mp4" />
        </video>
      ))}

      {/* Dark gradient overlay */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 3,
        background: 'linear-gradient(105deg, rgba(3,9,18,0.55) 0%, rgba(3,9,18,0.35) 55%, rgba(3,9,18,0.15) 100%)',
      }} />

      {/* Dot indicators */}
      <div style={{
        position: 'absolute', bottom: '28px', right: '40px',
        display: 'flex', gap: '8px', zIndex: 10,
      }}>
        {VIDEOS.map((_, i) => (
          <div key={i} onClick={() => goTo(i)}
            style={{
              width: active === i ? '28px' : '8px',
              height: '8px', borderRadius: '4px',
              background: active === i ? '#00848e' : 'rgba(255,255,255,0.35)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0,
        height: '3px', background: '#00848e', zIndex: 10,
        animation: 'videoProgress 6s linear infinite',
      }} />

      <style>{`
        @keyframes videoProgress { from { width: 0% } to { width: 100% } }
        @keyframes pulse-bg {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.6; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
