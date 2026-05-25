import HeroSection      from '../../components/HeroSection';
import AboutDirector   from '../../components/sections/AboutDirector';
import HospitalShowcase from '../../components/sections/HospitalShowcase';
import PatientStories  from '../../components/sections/PatientStories';

export default function HomePage() {
  return (
    <main style={{ background: '#ffffff' }}>
      <HeroSection />
      <AboutDirector />
      <HospitalShowcase />
      <PatientStories />
    </main>
  );
}
