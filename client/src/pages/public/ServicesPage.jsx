import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { fadeUp } from '../../utils/animations';

const FONT = "'Source Sans 3', 'Raleway', sans-serif";
const TEAL = '#00848e';
const NAVY = '#0a1628';

const BACKEND = import.meta.env.VITE_API_URL?.replace('/api/v1', '') ?? 'http://localhost:5000';
function resolveImage(src) {
  if (!src) return null;
  if (src.startsWith('http')) return src;
  if (src.startsWith('/')) return `${BACKEND}${src}`;
  return src;
}

function SkeletonCard() {
  return (
    <div style={{ borderRadius: 16, background: '#fff', border: '1px solid #e8eef4', padding: '24px' }}>
      {[80, 60, 100, 70].map((w, i) => (
        <motion.div key={i} animate={{ opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.08 }}
          style={{ height: i === 0 ? 20 : 13, width: `${w}%`, borderRadius: 5, background: '#e8edf2', marginBottom: i === 0 ? 14 : 8 }} />
      ))}
    </div>
  );
}

function ServiceCard({ service, index }) {
  const imgSrc = resolveImage(service.image);
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ ...fadeUp.visible.transition, delay: index * 0.06 }}
      style={{
        background: '#ffffff', borderRadius: 16, padding: '28px 24px',
        border: '1px solid #e8eef4', boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
        transition: 'box-shadow 0.2s, transform 0.2s',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,132,142,0.13)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {/* Icon */}
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: 'rgba(0,132,142,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24,
      }}>
        {imgSrc
          ? <img src={imgSrc} alt={service.name} style={{ width: 32, height: 32, objectFit: 'cover' }} onError={e => { e.currentTarget.style.display = 'none'; }} />
          : (service.icon || '⚕️')}
      </div>

      <div style={{ width: 28, height: 3, background: TEAL, borderRadius: 2 }} />

      <h3 style={{ fontSize: 17, fontWeight: 700, color: NAVY, margin: 0, fontFamily: FONT }}>{service.name}</h3>

      {service.department && (
        <span style={{ fontSize: 12, color: TEAL, fontWeight: 600, fontFamily: FONT }}>{service.department}</span>
      )}

      {service.description && (
        <p style={{
          fontSize: 13.5, color: '#4a5568', lineHeight: 1.65, margin: 0, fontFamily: FONT,
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {service.description}
        </p>
      )}

      {service.duration && (
        <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, fontFamily: FONT }}>
          Müddət: {service.duration}
        </p>
      )}
    </motion.div>
  );
}

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);

  useEffect(() => {
    api.get('/services')
      .then(res => {
        const data = res.data?.data ?? res.data;
        setServices(Array.isArray(data) ? data : []);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main style={{ fontFamily: FONT }}>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #0a1628 0%, #00848e 100%)', padding: '72px 0 80px', textAlign: 'center', width: '100%' }}>
        <div className="page-container">
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(77,208,225,0.85)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 14, fontFamily: FONT }}>
            Aslan Medical Center
          </p>
          <h1 style={{ fontSize: 42, fontWeight: 800, color: '#ffffff', margin: '0 0 16px', fontFamily: "'Raleway', sans-serif", lineHeight: 1.15 }}>
            Xidmətlər & Müalicələr
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', maxWidth: 520, margin: '0 auto', fontFamily: FONT, lineHeight: 1.75 }}>
            Geniş xidmət çeşidi ilə sağlamlığınızın hər aspektinə diqqət yetiririk.
          </p>
        </motion.div>
        </div>
      </section>

      {/* Grid */}
      <section style={{ background: '#f8fafc', padding: '64px 0 80px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px', boxSizing: 'border-box' }}>

          {error && !loading && (
            <p style={{ textAlign: 'center', color: '#ef4444', padding: '60px 0', fontFamily: FONT }}>
              Xidmətlər yüklənərkən xəta baş verdi.
            </p>
          )}

          {loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {!loading && !error && services.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8', fontFamily: FONT }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>⚕️</div>
              <p style={{ fontSize: 16, fontWeight: 600 }}>Hazırda xidmət məlumatı əlavə edilməyib.</p>
            </div>
          )}

          {!loading && !error && services.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
              {services.map((svc, i) => <ServiceCard key={svc._id ?? i} service={svc} index={i} />)}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
