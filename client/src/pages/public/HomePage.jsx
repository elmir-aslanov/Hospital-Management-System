import usePageTitle from '../../hooks/usePageTitle'
import { motion } from 'framer-motion';
import HeroSection       from '../../components/HeroSection';
import AboutDirector    from '../../components/sections/AboutDirector';
import ContactBanner    from '../../components/sections/ContactBanner';
import PatientStories   from '../../components/sections/PatientStories';
import PartnersCarousel from '../../components/sections/PartnersCarousel';
import FilialSection    from '../../components/sections/FilialSection';
import VisitorInfoSection from '../../components/sections/VisitorInfoSection';
import { fadeUp } from '../../utils/animations';

export default function HomePage() {
  usePageTitle('Ana Səhifə', 'Azərbaycanda ən müasir tibbi mərkəz. Peşəkar həkimlər, müasir avadanlıq.')
  return (
    <main style={{ background: '#ffffff' }}>
      <HeroSection />
      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <VisitorInfoSection />
      </motion.div>
      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <AboutDirector />
      </motion.div>
      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <PatientStories />
      </motion.div>
      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <FilialSection />
      </motion.div>
      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <ContactBanner />
      </motion.div>
      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <PartnersCarousel />
      </motion.div>
    </main>
  );
}
