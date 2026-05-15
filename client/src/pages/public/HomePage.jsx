import HeroSection    from '../../components/HeroSection';
import PatientStories from '../../components/sections/PatientStories';
import WaveDivider    from '../../components/ui/WaveDivider';

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      {/* white → light blue-gray for PatientStories */}
      <WaveDivider fromColor="#ffffff" toColor="#f8fafc" height={100} />
      <PatientStories />
      {/* light blue-gray → white */}
      <WaveDivider fromColor="#f8fafc" toColor="#ffffff" height={100} />
    </main>
  );
}
