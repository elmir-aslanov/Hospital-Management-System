import HeroSection      from '../../components/HeroSection';
import AboutDirector   from '../../components/sections/AboutDirector';
import HospitalShowcase from '../../components/sections/HospitalShowcase';
import DoctorsSection  from '../../components/sections/DoctorsSection';
import PatientStories  from '../../components/sections/PatientStories';

export default function HomePage() {
  return (
    <main style={{ background: '#ffffff' }}>
      <HeroSection />
      <AboutDirector />
      <HospitalShowcase />
      <DoctorsSection />
      <PatientStories />
    </main>
  );
}
