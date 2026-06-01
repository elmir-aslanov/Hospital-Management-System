import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';

const FALLBACK_STORIES = [
  { id: 1, name: 'Pasiyent A.', condition: 'Kardiologiya', image: '/pasiyent1.jpeg', story: 'Müalicədən sonra özümü çox yaxşı hiss edirəm. Həkimlər peşəkar və mehriban idi.' },
  { id: 2, name: 'Pasiyent B.', condition: 'Ortopediya',   image: '/pasiyent2.jpeg', story: 'Əməliyyat uğurla keçdi. Klinikanın xidmət keyfiyyəti çox yüksəkdir.' },
  { id: 3, name: 'Pasiyent C.', condition: 'Nevrologiya',  image: '/pasiyent3.jpeg', story: 'Diaqnoz tez qoyuldu, müalicə effektiv oldu. Tövsiyə edirəm.' },
];

export default function PatientStoriesPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [stories,  setStories]  = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    api.get('/consultations?status=closed&limit=6')
      .then(res => {
        const list = res.data?.data || res.data || [];
        const mapped = Array.isArray(list) && list.length > 0
          ? list.map((c, i) => ({
              id:        c._id || i,
              name:      c.name || `Pasiyent ${i + 1}`,
              condition: c.subject || 'Müalicə',
              image:     `/pasiyent${(i % 3) + 1}.jpeg`,
              story:     c.aiResponse || c.message || '',
            }))
          : FALLBACK_STORIES;
        setStories(mapped);
      })
      .catch(() => setStories(FALLBACK_STORIES))
      .finally(() => setLoading(false));
  }, []);

  const fullStories = stories;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #00848e 100%)',
        padding: '80px 0',
        textAlign: 'center',
        width: '100%',
      }}>
        <div className="page-container">
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
      </div>

      {/* Stories grid */}
      <div style={{
        maxWidth: '1280px', margin: '0 auto',
        padding: '80px 24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '32px',
      }}>
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} style={{ height: 380, borderRadius: 20, background: 'linear-gradient(90deg,#e8eef4 25%,#f0f4f8 50%,#e8eef4 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
          ))
        ) : fullStories.map((story, i) => (
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
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

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
