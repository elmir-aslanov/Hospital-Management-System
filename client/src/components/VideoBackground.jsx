import { useState, useEffect, useRef } from 'react';

const VIDEOS = ['/video1.mp4', '/video2.mp4', '/video3.mp4'];
const INTERVAL      = 6000;
const FADE_DURATION = 1200;

export default function VideoBackground() {
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

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 0,
      background: 'linear-gradient(135deg, #030912 0%, #0a2540 100%)',
      overflow: 'hidden',
    }}>

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
            opacity: active === i && loaded[i] ? 1 : 0,
            transition: `opacity ${FADE_DURATION}ms ease-in-out`,
            zIndex: active === i ? 2 : 1,
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
      `}</style>
    </div>
  );
}
