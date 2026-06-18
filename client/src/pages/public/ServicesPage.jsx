import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { fadeUp } from '../../utils/animations';

const FONT   = "'Source Sans 3', 'Raleway', sans-serif";
const TEAL   = '#148F99';
const NAVY   = '#071B3B';
const MUTED  = '#62718A';
const ICON_BG   = '#EDF7F7';
const CARD_BG   = '#FFFFFF';
const CARD_BDR  = '#D8E2E8';
const SECT_BG   = '#F7FAFC';

/* ── Compact inline SVG icons for lab-specific iconKeys ─────────────────── */
const LAB_DIR_ICONS = {
  molecule: (sz, c) => (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none"
      stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="4.5" r="1.7"/>
      <circle cx="19.8" cy="9" r="1.7"/>
      <circle cx="19.8" cy="15" r="1.7"/>
      <circle cx="12" cy="19.5" r="1.7"/>
      <circle cx="4.2" cy="15" r="1.7"/>
      <circle cx="4.2" cy="9" r="1.7"/>
      <circle cx="12" cy="12" r="2.3"/>
      <line x1="13.5" y1="5.5" x2="18.4" y2="8.1"/>
      <line x1="19.8" y1="10.7" x2="19.8" y2="13.3"/>
      <line x1="18.4" y1="15.9" x2="13.5" y2="18.5"/>
      <line x1="10.5" y1="18.5" x2="5.6" y2="15.9"/>
      <line x1="4.2" y1="13.3" x2="4.2" y2="10.7"/>
      <line x1="5.6" y1="8.1" x2="10.5" y2="5.5"/>
    </svg>
  ),
  flask: (sz, c) => (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none"
      stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 2h7"/>
      <path d="M10 2v7.5L5.5 16.5A2 2 0 0 0 7.3 19h9.4a2 2 0 0 0 1.8-2.5L14 9.5V2"/>
      <line x1="6" y1="14" x2="18" y2="14"/>
      <circle cx="9.5" cy="16.5" r=".75" fill={c} stroke="none"/>
      <circle cx="13.5" cy="17.3" r=".75" fill={c} stroke="none"/>
    </svg>
  ),
  microscope: (sz, c) => (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none"
      stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 21h12"/>
      <path d="M9 21v-3.5"/>
      <path d="M15 21v-3.5"/>
      <ellipse cx="12" cy="14.5" rx="4.5" ry="3"/>
      <rect x="10" y="6" width="4" height="7" rx="1"/>
      <line x1="9" y1="3.5" x2="15" y2="3.5"/>
      <line x1="12" y1="3.5" x2="12" y2="6"/>
    </svg>
  ),
  pill: (sz, c) => (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none"
      stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 14.5 9.5 9.5a5 5 0 1 1 7 7l-5 5a5 5 0 0 1-7-7Z"/>
      <line x1="8" y1="11" x2="14" y2="17"/>
    </svg>
  ),
  cells: (sz, c) => (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none"
      stroke={c} strokeWidth="1.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="9"/>
      <circle cx="9" cy="10" r="2.2"/>
      <circle cx="14.8" cy="9.5" r="1.7"/>
      <circle cx="15.5" cy="14.8" r="2.2"/>
      <circle cx="9.5" cy="15.5" r="1.7"/>
    </svg>
  ),
  'blood-tube': (sz, c) => (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none"
      stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3h8a1 1 0 0 1 1 1v11a5 5 0 0 1-10 0V4a1 1 0 0 1 1-1Z"/>
      <line x1="7" y1="8" x2="17" y2="8"/>
      <path d="M12 12c-1.5 1.5-2.5 2.8-2.5 4a2.5 2.5 0 0 0 5 0c0-1.2-1-2.5-2.5-4Z"
        fill={c} stroke="none" opacity=".65"/>
    </svg>
  ),
};

function LabIcon({ iconKey, size = 64, color = TEAL }) {
  const fn = LAB_DIR_ICONS[iconKey];
  if (fn) return fn(size, color);
  // Fallback: render a simple flask
  return LAB_DIR_ICONS.flask(size, color);
}

/* ── Chevron SVG ────────────────────────────────────────────────────────── */
function Chevron({ size = 26, color = TEAL }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  );
}

/* ── Lab direction card ─────────────────────────────────────────────────── */
function LabCard({ service, index }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ duration: 0.28, delay: index * 0.06 }}
    >
      <div
        className="lab-card"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          background: CARD_BG,
          border: `1px solid ${hovered ? TEAL : '#DCDCDC'}`,
          borderRadius: 5,
          paddingLeft: 50,
          paddingRight: 24,
          boxSizing: 'border-box',
          height: 138,
          boxShadow: hovered ? '0 2px 12px rgba(20,143,153,0.08)' : 'none',
          transition: 'border-color 0.16s, box-shadow 0.16s',
          cursor: 'pointer',
        }}
      >
        <h3
          className="lab-title"
          style={{
            fontSize: 27, fontWeight: 600,
            color: hovered ? TEAL : NAVY,
            margin: 0, fontFamily: FONT,
            lineHeight: 1.25,
            letterSpacing: 'normal',
            transition: 'color 0.16s',
          }}
        >
          {service.name}
        </h3>
      </div>
    </motion.div>
  );
}

/* ── Skeleton card ───────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div
      className="lab-card"
      style={{
        display: 'flex', alignItems: 'center',
        background: CARD_BG, border: '1px solid #DCDCDC',
        borderRadius: 5, paddingLeft: 50, paddingRight: 24,
        height: 138, boxSizing: 'border-box',
      }}
    >
      <motion.div
        animate={{ opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 1.4, repeat: Infinity }}
        style={{ height: 22, width: '40%', borderRadius: 4, background: '#e8edf2' }}
      />
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(false);

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

  return (
    <main style={{ fontFamily: FONT }}>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
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

      {/* ── Laboratory directions section ──────────────────────────────────── */}
      <section style={{ background: SECT_BG, padding: '72px 0 80px' }}>
        <div style={{
          maxWidth: 1400, margin: '0 auto',
          padding: '0 36px', boxSizing: 'border-box',
        }}>

          {/* Heading */}
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: 52 }}
          >
            <p style={{
              fontSize: 13, fontWeight: 700, color: TEAL,
              letterSpacing: '3px', lineHeight: 1.4, textTransform: 'uppercase',
              marginBottom: 16, fontFamily: FONT,
            }}>
              LABORATOR TESTLƏRİ
            </p>
            <h2 className="lab-section-title" style={{
              fontSize: 42, fontWeight: 700, color: NAVY,
              margin: '0 0 18px', fontFamily: "'Raleway', sans-serif", lineHeight: 1.15,
            }}>
              Laboratoriya istiqamətləri
            </h2>
            <p className="lab-section-sub" style={{
              fontSize: 17, fontWeight: 400, color: MUTED,
              margin: 0, fontFamily: FONT, lineHeight: 1.6,
            }}>
              Ehtiyacınıza uyğun laboratoriya istiqamətini seçin.
            </p>
          </motion.div>

          {/* Error */}
          {error && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
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

          {/* Skeleton */}
          {loading && (
            <div className="lab-grid">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* Empty */}
          {!loading && !error && services.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', fontFamily: FONT }}>
              <p style={{ fontSize: 15, color: MUTED, margin: 0 }}>
                Hazırda aktiv laboratoriya xidməti yoxdur.
              </p>
            </div>
          )}

          {/* Cards */}
          {!loading && !error && services.length > 0 && (
            <div className="lab-grid">
              {services.map((svc, i) => (
                <LabCard key={svc._id ?? i} service={svc} index={i} />
              ))}
            </div>
          )}

        </div>
      </section>

      <style>{`
        .lab-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          column-gap: 40px;
          row-gap: 40px;
        }

        /* Tablet — single column */
        @media (max-width: 900px) {
          .lab-grid {
            grid-template-columns: 1fr;
            column-gap: 0;
            row-gap: 18px;
          }
          .lab-section-title {
            font-size: 36px !important;
          }
          .lab-section-sub {
            font-size: 16px !important;
          }
          .lab-card {
            height: 110px !important;
            padding-left: 28px !important;
          }
          .lab-title {
            font-size: 22px !important;
          }
        }

        /* Mobile */
        @media (max-width: 600px) {
          .lab-section-title {
            font-size: 30px !important;
          }
          .lab-section-sub {
            font-size: 15px !important;
          }
          .lab-card {
            height: 100px !important;
            padding-left: 24px !important;
          }
          .lab-title {
            font-size: 20px !important;
          }
        }
      `}</style>
    </main>
  );
}
