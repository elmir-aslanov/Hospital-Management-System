import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { DeptIcon } from '../../components/Icons';
import { fadeUp } from '../../utils/animations';

const FONT       = "'Source Sans 3', 'Raleway', sans-serif";
const TEAL       = '#1D8B95';
const NAVY       = '#0B1F3A';
const SECTION_BG = '#F5F8FA';
const BORDER     = '#DDE6EC';

const CATEGORIES = [
  { key: 'all',          label: 'Hamısı'        },
  { key: 'blood',        label: 'Qan analizləri' },
  { key: 'biochemistry', label: 'Biokimya'       },
  { key: 'hormones',     label: 'Hormonlar'      },
  { key: 'immunology',   label: 'İmmunologiya'   },
];

function SkeletonCard() {
  return (
    <div style={{
      background: '#fff', borderRadius: 8, border: `1px solid ${BORDER}`,
      padding: '20px 20px 16px',
    }}>
      <motion.div
        animate={{ opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 1.4, repeat: Infinity }}
        style={{ width: 44, height: 44, borderRadius: 10, background: '#e8edf2', marginBottom: 16 }}
      />
      {[70, 95, 55, 80].map((w, i) => (
        <motion.div key={i}
          animate={{ opacity: [0.5, 0.85, 0.5] }}
          transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.08 }}
          style={{ height: i === 0 ? 15 : 12, width: `${w}%`, borderRadius: 4, background: '#e8edf2', marginBottom: 8 }}
        />
      ))}
    </div>
  );
}

function ServiceCard({ service }) {
  const duration = service.resultDuration || service.duration;
  return (
    <div
      style={{
        background: '#fff', borderRadius: 8, border: `1px solid ${BORDER}`,
        padding: '20px 20px 16px', display: 'flex', flexDirection: 'column',
        height: '100%', boxSizing: 'border-box',
        transition: 'border-color 0.18s, box-shadow 0.18s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = TEAL;
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(29,139,149,0.10)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = BORDER;
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Icon */}
      <div style={{
        width: 44, height: 44, borderRadius: 10,
        background: 'rgba(29,139,149,0.09)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 14, flexShrink: 0,
      }}>
        <DeptIcon icon={service.iconKey || service.icon} name={service.name} size={22} color={TEAL} />
      </div>

      {/* Name */}
      <h3 style={{
        fontSize: 15, fontWeight: 700, color: NAVY, margin: '0 0 8px',
        fontFamily: FONT, lineHeight: 1.35,
      }}>
        {service.name}
      </h3>

      {/* Description */}
      <p style={{
        fontSize: 13, color: '#5a6a7a', lineHeight: 1.6,
        margin: '0 0 14px', fontFamily: FONT, flex: 1,
        display: '-webkit-box', WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        {service.description || ' '}
      </p>

      {/* Footer */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 12, borderTop: `1px solid ${BORDER}`, marginTop: 'auto',
      }}>
        <span style={{
          display: 'flex', alignItems: 'center', gap: 5,
          fontSize: 12, color: '#7a8fa3', fontFamily: FONT,
        }}>
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          {duration ? `Nəticə: ${duration}` : 'Nəticə: 1 iş günü'}
        </span>
        <Link
          to="/randevu"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 13, fontWeight: 600, color: TEAL,
            textDecoration: 'none', fontFamily: FONT,
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#0E8F96'; }}
          onMouseLeave={e => { e.currentTarget.style.color = TEAL; }}
        >
          Ətraflı
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </Link>
      </div>
    </div>
  );
}

export default function ServicesPage() {
  const [services,       setServices]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(false);
  const [query,          setQuery]          = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const load = () => {
    setError(false);
    setLoading(true);
    api.get('/services')
      .then(res => {
        const data = res.data?.data ?? res.data;
        setServices(Array.isArray(data) ? data : []);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return services
      .filter(s => activeCategory === 'all' || s.category === activeCategory)
      .filter(s => !q ||
        s.name.toLowerCase().includes(q) ||
        (s.description || '').toLowerCase().includes(q)
      )
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name, 'az'));
  }, [services, activeCategory, query]);

  return (
    <main style={{ fontFamily: FONT }}>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section style={{
        backgroundImage: "linear-gradient(to right, rgba(10,22,40,0.62) 0%, rgba(0,132,142,0.35) 100%), url('/xidmetler.png')",
        backgroundSize: '100% auto',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        minHeight: 390,
        padding: '88px 0 96px',
        textAlign: 'center',
        width: '100%',
      }}>
        <div className="page-container">
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <p style={{
              fontSize: 11, fontWeight: 700, color: 'rgba(77,208,225,0.85)',
              letterSpacing: '0.14em', textTransform: 'uppercase',
              marginBottom: 14, fontFamily: FONT,
            }}>
              Aslan Medical Center
            </p>
            <h1 style={{
              fontSize: 42, fontWeight: 800, color: '#ffffff',
              margin: '0 0 16px', fontFamily: "'Raleway', sans-serif", lineHeight: 1.15,
            }}>
              Xidmətlər &amp; Müalicələr
            </h1>
            <p style={{
              fontSize: 16, color: 'rgba(255,255,255,0.7)',
              maxWidth: 520, margin: '0 auto', fontFamily: FONT, lineHeight: 1.75,
            }}>
              Geniş xidmət çeşidi ilə sağlamlığınızın hər aspektinə diqqət yetiririk.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Laboratory services section ───────────────────────────────────────── */}
      <section style={{ background: SECTION_BG, padding: '60px 0 80px' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px', boxSizing: 'border-box' }}>

          {/* Section heading */}
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: 40 }}
          >
            <p style={{
              fontSize: 11, fontWeight: 700, color: TEAL,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              marginBottom: 10, fontFamily: FONT,
            }}>
              LABORATORİYA
            </p>
            <h2 style={{
              fontSize: 32, fontWeight: 700, color: NAVY,
              margin: '0 0 12px', fontFamily: "'Raleway', sans-serif", lineHeight: 1.2,
            }}>
              Laboratoriya xidmətləri
            </h2>
            <p style={{
              fontSize: 15, color: '#5a6a7a', maxWidth: 520,
              margin: '0 auto', fontFamily: FONT, lineHeight: 1.7,
            }}>
              Dəqiq nəticələr, müasir avadanlıq və peşəkar tibbi yanaşma.
            </p>
          </motion.div>

          {/* Search */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: 520 }}>
              <svg
                width="16" height="16" fill="none" stroke="#9aacb8" strokeWidth="2" viewBox="0 0 24 24"
                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              >
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Analiz axtarın"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '11px 16px 11px 40px',
                  border: `1px solid ${BORDER}`, borderRadius: 8,
                  fontSize: 14, color: NAVY, fontFamily: FONT,
                  background: '#fff', outline: 'none',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onFocus={e => {
                  e.target.style.borderColor = TEAL;
                  e.target.style.boxShadow = '0 0 0 3px rgba(29,139,149,0.12)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = BORDER;
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Category filters */}
          <div style={{
            display: 'flex', justifyContent: 'center',
            flexWrap: 'wrap', gap: 8, marginBottom: 36,
          }}>
            {CATEGORIES.map(cat => {
              const active = activeCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  style={{
                    padding: '7px 18px', borderRadius: 999,
                    border: `1px solid ${active ? TEAL : BORDER}`,
                    background: active ? TEAL : '#fff',
                    color: active ? '#fff' : '#4a6170',
                    fontSize: 13, fontWeight: 600, fontFamily: FONT,
                    cursor: 'pointer', transition: 'all 0.15s',
                    lineHeight: 1.4,
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Error state */}
          {error && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <p style={{ color: '#ef4444', marginBottom: 14, fontFamily: FONT, fontSize: 14 }}>
                Xidmətlər yüklənmədi.
              </p>
              <button
                onClick={load}
                style={{
                  padding: '8px 22px', borderRadius: 8,
                  border: `1px solid ${TEAL}`, background: 'transparent',
                  color: TEAL, fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', fontFamily: FONT,
                }}
              >
                Yenidən cəhd et
              </button>
            </div>
          )}

          {/* Loading skeletons */}
          {loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', fontFamily: FONT }}>
              <svg
                width="40" height="40" fill="none" stroke="#c0d0d8"
                strokeWidth="1.5" viewBox="0 0 24 24"
                style={{ display: 'block', margin: '0 auto 14px' }}
              >
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#7a8fa3', margin: 0 }}>
                Uyğun laboratoriya xidməti tapılmadı.
              </p>
            </div>
          )}

          {/* Card grid */}
          {!loading && !error && filtered.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {filtered.map((svc, i) => (
                <motion.div
                  key={svc._id ?? i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: (i % 6) * 0.05 }}
                  style={{ height: '100%' }}
                >
                  <ServiceCard service={svc} />
                </motion.div>
              ))}
            </div>
          )}

        </div>
      </section>

      <style>{`
        @media (max-width: 640px) {
          .lab-search { max-width: 100% !important; }
        }
      `}</style>
    </main>
  );
}
