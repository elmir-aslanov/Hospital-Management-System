import usePageTitle from '../../hooks/usePageTitle'
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axios';

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
    <div style={{ borderRadius: 16, overflow: 'hidden', background: '#fff', border: '1px solid #e8eef4' }}>
      <motion.div animate={{ opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 1.4, repeat: Infinity }}
        style={{ height: 160, background: '#e8edf2' }} />
      <div style={{ padding: '20px' }}>
        <motion.div animate={{ opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 1.4, repeat: Infinity, delay: 0.1 }}
          style={{ height: 18, width: '60%', borderRadius: 6, background: '#e8edf2', marginBottom: 10 }} />
        <motion.div animate={{ opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 1.4, repeat: Infinity, delay: 0.2 }}
          style={{ height: 12, width: '90%', borderRadius: 4, background: '#e8edf2', marginBottom: 6 }} />
        <motion.div animate={{ opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 1.4, repeat: Infinity, delay: 0.3 }}
          style={{ height: 12, width: '70%', borderRadius: 4, background: '#e8edf2' }} />
      </div>
    </div>
  );
}

function DepartmentCard({ dept, index }) {
  const imgSrc = resolveImage(dept.image);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      style={{
        background: '#ffffff', borderRadius: 16, overflow: 'hidden',
        border: '1px solid #e8eef4', boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
        transition: 'box-shadow 0.2s, transform 0.2s', display: 'flex', flexDirection: 'column',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,132,142,0.14)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {/* Image / icon area */}
      <div style={{
        height: 140, background: 'linear-gradient(135deg, #0a1628 0%, #00848e 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0,
      }}>
        {imgSrc ? (
          <img src={imgSrc} alt={dept.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
            onError={e => { e.currentTarget.style.display = 'none'; }} />
        ) : null}
        <span style={{ fontSize: 40, position: 'relative', zIndex: 1 }}>
          {dept.icon || '🏥'}
        </span>
      </div>

      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ width: 28, height: 3, background: TEAL, borderRadius: 2 }} />
        <h3 style={{ fontSize: 17, fontWeight: 700, color: NAVY, margin: 0, fontFamily: FONT }}>{dept.name}</h3>
        {dept.description && (
          <p style={{
            fontSize: 13.5, color: '#4a5568', lineHeight: 1.65, margin: 0, fontFamily: FONT,
            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {dept.description}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default function DepartmentsPage() {
  usePageTitle('Şöbələr', 'Tibbi mərkəzimizin ixtisaslaşmış şöbələri.')
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(false);

  useEffect(() => {
    api.get('/departments')
      .then(res => {
        const data = res.data?.data ?? res.data;
        setDepartments(Array.isArray(data) ? data : []);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main style={{ fontFamily: FONT }}>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #0a1628 0%, #00848e 100%)', padding: '72px 0 80px', textAlign: 'center', width: '100%' }}>
        <div className="page-container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(77,208,225,0.85)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 14, fontFamily: FONT }}>
            Aslan Medical Center
          </p>
          <h1 style={{ fontSize: 42, fontWeight: 800, color: '#ffffff', margin: '0 0 16px', fontFamily: "'Raleway', sans-serif", lineHeight: 1.15 }}>
            Tibbi Şöbələrimiz
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', maxWidth: 520, margin: '0 auto', fontFamily: FONT, lineHeight: 1.75 }}>
            Müasir tibbi texnologiyalar və peşəkar mütəxəssislərlə hər şöbədə keyfiyyətli xidmət.
          </p>
        </motion.div>
        </div>
      </section>

      {/* Grid */}
      <section style={{ background: '#f8fafc', padding: '64px 0 80px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px', boxSizing: 'border-box' }}>

          {error && !loading && (
            <p style={{ textAlign: 'center', color: '#ef4444', padding: '60px 0', fontFamily: FONT }}>
              Şöbələr yüklənərkən xəta baş verdi.
            </p>
          )}

          {loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {!loading && !error && departments.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8', fontFamily: FONT }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🏥</div>
              <p style={{ fontSize: 16, fontWeight: 600 }}>Hazırda şöbə məlumatı əlavə edilməyib.</p>
            </div>
          )}

          {!loading && !error && departments.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
              {departments.map((dept, i) => <DepartmentCard key={dept._id ?? i} dept={dept} index={i} />)}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
