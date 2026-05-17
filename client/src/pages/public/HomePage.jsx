import HeroSection      from '../../components/HeroSection';
import PatientStories   from '../../components/sections/PatientStories';
import ClinicalPrograms from '../../components/sections/ClinicalPrograms';

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <ClinicalPrograms />
      <PatientStories />
    </main>
  );
}
