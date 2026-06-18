import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { fadeUp } from '../../utils/animations';

const FONT  = "'Source Sans 3', 'Raleway', sans-serif";
const TEAL  = '#00848e';
const NAVY  = '#071B3B';
const MUTED = '#62718A';

/* ── Service row ─────────────────────────────────────────────────────────── */
function ServiceRow({ service, index }) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  const go = () => navigate(`/services/${service.slug}`);
  const onKey = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } };

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ duration: 0.24, delay: index * 0.05 }}
    >
      <div
        className="svc-row"
        onClick={go}
        onKeyDown={onKey}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        tabIndex={0}
        role="button"
        aria-label={service.name}
        style={{
          display: 'flex',
          alignItems: 'center',
          background: hovered ? 'rgba(0,132,142,0.045)' : '#FFFFFF',
          border: `1px solid ${hovered ? 'rgba(0,132,142,0.48)' : '#DCE5E9'}`,
          borderRadius: 10,
          boxShadow: hovered ? 'inset 3px 0 0 #00848e' : 'none',
          transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
          transition: 'background-color 180ms ease, border-color 180ms ease, transform 180ms ease, box-shadow 180ms ease',
          cursor: 'pointer',
          boxSizing: 'border-box',
          minHeight: 92,
          padding: '0 28px',
          outline: 'none',
        }}
      >
        <h3
          className="svc-name"
          style={{
            fontSize: 17,
            fontWeight: 600,
            color: hovered ? TEAL : NAVY,
            margin: 0,
            fontFamily: FONT,
            lineHeight: 1.35,
            transition: 'color 180ms ease',
          }}
        >
          {service.name}
        </h3>
      </div>
    </motion.div>
  );
}

/* ── Skeleton row ────────────────────────────────────────────────────────── */
function SkeletonRow() {
  return (
    <div
      className="svc-row"
      style={{
        display: 'flex', alignItems: 'center',
        background: '#FFFFFF', border: '1px solid #DCE5E9',
        borderRadius: 10, minHeight: 92,
        padding: '0 28px', boxSizing: 'border-box',
      }}
    >
      <motion.div
        animate={{ opacity: [0.45, 0.8, 0.45] }}
        transition={{ duration: 1.4, repeat: Infinity }}
        style={{ height: 18, width: '38%', borderRadius: 4, background: '#e2e8ed' }}
      />
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */
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

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section
        className="svc-hero"
        style={{
          backgroundImage: "url('/xidmetlaborot.png')",
          backgroundSize: 'contain',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#071424',
          width: '100%',
        }}
      />

      {/* ── Lab section ───────────────────────────────────────────────── */}
      <section className="svc-lab-section" style={{ background: '#F5F8FA' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', boxSizing: 'border-box' }}>

          {/* Heading block */}
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="svc-heading-mb"
            style={{ textAlign: 'center' }}
          >
            <p style={{
              fontSize: 12, fontWeight: 700, color: TEAL,
              letterSpacing: '0.24em', textTransform: 'uppercase',
              margin: '0 0 18px', fontFamily: FONT,
            }}>
              LABORATOR TESTLƏRİ
            </p>
            <h2 className="svc-lab-title" style={{
              fontWeight: 700, color: NAVY,
              margin: 0, fontFamily: "'Raleway', sans-serif", lineHeight: 1.2,
            }}>
              Laboratoriya istiqamətləri
            </h2>
            <p className="svc-lab-sub" style={{
              lineHeight: 1.6, color: MUTED,
              margin: '14px 0 0', fontFamily: FONT,
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
            <div className="svc-grid">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}
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

          {/* Service rows */}
          {!loading && !error && services.length > 0 && (
            <div className="svc-grid">
              {services.map((svc, i) => (
                <ServiceRow key={svc._id ?? i} service={svc} index={i} />
              ))}
            </div>
          )}

        </div>
      </section>

      <style>{`
        /* ── Hero ─────────────────────────────────────────────────────── */
        /* Image is 2072×759 (≈2.73:1). With contain, hero height drives scale.
           At ~980px container width: 980/2.73 ≈ 359px — fits the 320-360px target. */
        .svc-hero            { height: 340px; }

        /* ── Lab section ──────────────────────────────────────────────── */
        .svc-lab-section     { padding: 72px 32px 88px; }
        .svc-heading-mb      { margin-bottom: 44px; }
        .svc-lab-title       { font-size: 34px; }
        .svc-lab-sub         { font-size: 15px; }

        /* ── Grid ─────────────────────────────────────────────────────── */
        .svc-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          column-gap: 20px;
          row-gap: 16px;
        }

        /* ── Focus ring ───────────────────────────────────────────────── */
        .svc-row:focus-visible {
          outline: 2px solid #00848e;
          outline-offset: 2px;
        }

        /* ── Tablet (≤900px) ──────────────────────────────────────────── */
        @media (max-width: 900px) {
          /* At 768px width: 768/2.73 ≈ 281px — reduce slightly */
          .svc-hero          { height: 280px; }
          .svc-lab-section   { padding: 60px 24px 72px; }
          .svc-lab-title     { font-size: 31px !important; }
        }

        /* ── Single-column grid (≤680px) ──────────────────────────────── */
        @media (max-width: 680px) {
          .svc-grid          { grid-template-columns: 1fr; }
        }

        /* ── Mobile (≤600px) ──────────────────────────────────────────── */
        @media (max-width: 600px) {
          /* Switch to 100% width so image fills screen edge-to-edge,
             height auto-fits the 2.73:1 ratio (~143px at 390px width).
             Use padding-bottom trick for aspect-ratio-driven height. */
          .svc-hero {
            height: 0;
            padding-bottom: 36.6%; /* 1/2.73 * 100 */
            background-size: 100% auto;
            background-position: center top;
          }
          .svc-lab-section   { padding: 48px 20px 56px; }
          .svc-heading-mb    { margin-bottom: 32px !important; }
          .svc-lab-title     { font-size: 27px !important; }
          .svc-lab-sub       { font-size: 14px !important; }
          .svc-row           { min-height: 76px !important; padding: 0 20px !important; }
          .svc-name          { font-size: 15.5px !important; }
        }
      `}</style>
    </main>
  );
}
