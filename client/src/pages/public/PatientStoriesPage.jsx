import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function PatientStoriesPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const fullStories = [
    { id: 1, name: 'Pasiyent 1', condition: t('patientStoriesPage.condition'), image: '/pasiyent1.jpeg', story: t('patientStoriesPage.story1') },
    { id: 2, name: 'Pasiyent 2', condition: t('patientStoriesPage.condition'), image: '/pasiyent2.jpeg', story: t('patientStoriesPage.story2') },
    { id: 3, name: 'Pasiyent 3', condition: t('patientStoriesPage.condition3'), image: '/pasiyent3.jpeg', story: t('patientStoriesPage.story3') },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #00848e 100%)',
        padding: '80px 6vw',
        textAlign: 'center',
      }}>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            fontSize: '12px', letterSpacing: '3px',
            color: '#4DD0E1', fontWeight: 700,
            textTransform: 'uppercase', marginBottom: '16px',
          }}
        >
          {t('patientStoriesPage.overline')}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            fontSize: '52px', fontWeight: 800,
            color: 'white', lineHeight: 1.2, marginBottom: '16px',
          }}
        >
          {t('patientStoriesPage.title')}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            fontSize: '18px', color: 'rgba(255,255,255,0.75)',
            maxWidth: '560px', margin: '0 auto',
          }}
        >
          {t('patientStoriesPage.subtitle')}
        </motion.p>
      </div>

      {/* Stories grid */}
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        padding: '80px 6vw',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '32px',
      }}>
        {fullStories.map((story, i) => (
          <motion.div
            key={story.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -6, boxShadow: '0 20px 48px rgba(0,0,0,0.12)' }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            style={{
              background: 'white',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
              cursor: 'pointer',
            }}
          >
            {/* Photo */}
            <div style={{ width: '100%', height: '240px', overflow: 'hidden' }}>
              <img
                src={story.image}
                alt={story.name}
                style={{
                  width: '100%', height: '100%',
                  objectFit: 'cover', objectPosition: 'center',
                }}
                onError={e => {
                  e.target.parentElement.style.background = 'linear-gradient(135deg, #0a1628, #00848e)';
                  e.target.style.display = 'none';
                }}
              />
            </div>

            {/* Content */}
            <div style={{ padding: '24px' }}>
              <p style={{
                fontSize: '11px', letterSpacing: '2px',
                color: '#00848e', fontWeight: 700,
                textTransform: 'uppercase', marginBottom: '8px',
              }}>
                {story.condition}
              </p>
              <h3 style={{
                fontSize: '20px', fontWeight: 800,
                color: '#0a1628', marginBottom: '12px',
              }}>
                {story.name}
              </h3>
              <p style={{
                fontSize: '15px', color: '#4a5568',
                lineHeight: 1.7,
              }}>
                {story.story}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Back button */}
      <div style={{ textAlign: 'center', paddingBottom: '80px' }}>
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'none', border: '2px solid #00848e',
            borderRadius: '50px', padding: '12px 28px',
            color: '#00848e', fontSize: '15px', fontWeight: 700,
            cursor: 'pointer',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#00848e'; e.currentTarget.style.color = 'white'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#00848e'; }}
        >
          {t('patientStoriesPage.backHome')}
        </button>
      </div>

    </div>
  );
}
