import HeroSection         from '../../components/HeroSection';
import AboutDirector       from '../../components/sections/AboutDirector';
import MedicalConsultation from '../../components/sections/MedicalConsultation';
import PatientStories      from '../../components/sections/PatientStories';

export default function HomePage() {
  return (
    <main style={{ background: '#ffffff' }}>
      <HeroSection />
      <AboutDirector />
      <MedicalConsultation />
      <PatientStories />
    </main>
  );
}
