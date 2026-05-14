import { useState, useEffect, useRef } from 'react';

const VIDEOS = [
  '/video1.mp4',
  '/video2.mp4',
  '/video3.mp4',
];

export default function VideoBackground() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const activeRef = useRef(null);
  const nextRef = useRef(null);
  const timerRef = useRef(null);

  const switchVideo = () => {
    const next = (activeIndex + 1) % VIDEOS.length;
    setNextIndex(next);
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveIndex(next);
      setIsTransitioning(false);
    }, 1000);
  };

  useEffect(() => {
    timerRef.current = setInterval(switchVideo, 6000);
    return () => clearInterval(timerRef.current);
  }, [activeIndex]);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.currentTime = 0;
      activeRef.current.play().catch(() => {});
    }
  }, [activeIndex]);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      zIndex: 0, overflow: 'hidden', background: '#030912',
    }}>
      {/* Active video */}
      <video
        ref={activeRef}
        key={activeIndex}
        autoPlay
        muted
        playsInline
        loop={false}
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover',
          opacity: isTransitioning ? 0 : 1,
          transition: 'opacity 1s ease',
        }}
      >
        <source src={VIDEOS[activeIndex]} type="video/mp4" />
      </video>

      {/* Next video (pre-loaded, fades in during transition) */}
      <video
        ref={nextRef}
        key={`next-${nextIndex}`}
        autoPlay
        muted
        playsInline
        loop={false}
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover',
          opacity: isTransitioning ? 1 : 0,
          transition: 'opacity 1s ease',
        }}
      >
        <source src={VIDEOS[nextIndex]} type="video/mp4" />
      </video>

      {/* Dark overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(105deg, rgba(3,9,18,0.85) 0%, rgba(3,9,18,0.65) 55%, rgba(3,9,18,0.4) 100%)',
      }} />

      {/* Indicator dots */}
      <div style={{
        position: 'absolute', bottom: 32, right: 40,
        display: 'flex', gap: 8, zIndex: 10,
      }}>
        {VIDEOS.map((_, i) => (
          <div
            key={i}
            onClick={() => setActiveIndex(i)}
            style={{
              width: i === activeIndex ? 28 : 8,
              height: 8, borderRadius: 4, cursor: 'pointer',
              background: i === activeIndex ? '#00BCD4' : 'rgba(255,255,255,0.35)',
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0,
        height: 3, background: '#00BCD4',
        animation: 'progressBar 6s linear infinite',
        zIndex: 10,
      }} />

      <style>{`
        @keyframes progressBar {
          from { width: 0% }
          to { width: 100% }
        }
      `}</style>
    </div>
  );
}
