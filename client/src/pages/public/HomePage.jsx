import usePageTitle from '../../hooks/usePageTitle'
import HeroSection       from '../../components/HeroSection';
import AboutDirector    from '../../components/sections/AboutDirector';
import HospitalShowcase from '../../components/sections/HospitalShowcase';
import ContactBanner    from '../../components/sections/ContactBanner';
import PatientStories   from '../../components/sections/PatientStories';
import PartnersCarousel from '../../components/sections/PartnersCarousel';

export default function HomePage() {
  usePageTitle('Ana Səhifə', 'Azərbaycanda ən müasir tibbi mərkəz. Peşəkar həkimlər, müasir avadanlıq.')
  return (
    <main style={{ background: '#ffffff' }}>
      <HeroSection />
      <AboutDirector />
      <HospitalShowcase />
      <PatientStories />
      <PartnersCarousel />
      <ContactBanner />
    </main>
  );
}
