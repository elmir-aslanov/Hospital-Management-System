import HeroSection    from '../../components/HeroSection';
import PatientStories from '../../components/sections/PatientStories';

export default function HomePage() {
  return (
    <main>
      <HeroSection />

      {/* Wave: hero (dark) → white */}
      <div style={{ lineHeight: 0, overflow: 'hidden', background: '#0a1628' }}>
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none"
          style={{ width: '100%', height: '80px', display: 'block' }}>
          <path
            d="M0,0 C480,80 960,0 1440,60 L1440,80 L0,80 Z"
            fill="#ffffff"
          />
        </svg>
      </div>

      <PatientStories />

      {/* Wave: white → light gray */}
      <div style={{ lineHeight: 0, overflow: 'hidden', background: '#ffffff' }}>
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none"
          style={{ width: '100%', height: '80px', display: 'block' }}>
          <path
            d="M0,40 C360,0 1080,80 1440,20 L1440,80 L0,80 Z"
            fill="#f0f4f8"
          />
        </svg>
      </div>
    </main>
  );
}
