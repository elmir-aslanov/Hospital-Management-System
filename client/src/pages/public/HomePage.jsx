import HeroSection      from '../../components/HeroSection';
import PatientStories   from '../../components/sections/PatientStories';
import ClinicalPrograms from '../../components/sections/ClinicalPrograms';
import AwardBanner      from '../../components/sections/AwardBanner';
import DoctorsSection   from '../../components/sections/DoctorsSection';

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <ClinicalPrograms />
      <AwardBanner />
      <DoctorsSection />
      <PatientStories />
    </main>
  );
}
