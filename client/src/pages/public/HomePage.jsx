import HeroSection      from '../../components/HeroSection';
import PatientStories   from '../../components/sections/PatientStories';
import ClinicalPrograms from '../../components/sections/ClinicalPrograms';
import HospitalShowcase from '../../components/sections/HospitalShowcase';
import DoctorsSection   from '../../components/sections/DoctorsSection';

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <HospitalShowcase />
      <ClinicalPrograms />
      <PatientStories />
      <DoctorsSection />
    </main>
  );
}
