import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { fadeUp } from '../../utils/animations';

const FONT  = "'Source Sans 3', 'Raleway', sans-serif";
const TEAL  = '#00848e';
const NAVY  = '#071B3B';

/* ── helpers ─────────────────────────────────────────────────────────────── */
const fmtPrice = (price) =>
  Number.isInteger(Number(price)) ? String(Math.round(price)) : Number(price).toFixed(2);

/* ── TestCard ────────────────────────────────────────────────────────────── */
function TestCard({ test, serviceName }) {
  const [hov, setHov] = useState(false);
  const { t } = useTranslation();

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      style={{ display: 'flex' }}
    >
      <div
        className="stc"
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          background: '#FFFFFF',
          border: `1px solid ${hov ? 'rgba(0,132,142,0.45)' : '#DDE4E8'}`,
          borderRadius: 8,
          boxShadow: hov
            ? '0 4px 16px rgba(7,27,59,0.07)'
            : '0 4px 16px rgba(7,27,59,0.04)',
          transform: hov ? 'translateY(-1px)' : 'translateY(0)',
          transition: 'border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease',
          padding: '38px 44px',
          boxSizing: 'border-box',
          cursor: 'default',
        }}
      >
        {/* 1 — direction name */}
        <p style={{
          fontSize: 14, fontWeight: 400, color: '#8A96A6',
          margin: '0 0 14px', fontFamily: FONT, lineHeight: 1.4,
        }}>
          {serviceName}
        </p>

        {/* 2 — test name */}
        <h3 style={{
          fontSize: 22, fontWeight: 700, lineHeight: 1.3,
          color: '#172033', margin: '0 0 24px',
          fontFamily: "'Raleway', sans-serif",
          wordBreak: 'break-word',
        }}
          className="stc-name"
        >
          {test.name}
        </h3>

        {/* 3 — test code (hidden if absent) */}
        {test.serviceCode && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 14, color: '#263248', fontFamily: FONT,
            marginBottom: 16,
          }}>
            <span style={{
              width: 4, height: 4, borderRadius: '50%',
              background: TEAL, flexShrink: 0,
            }} />
            <span style={{ color: '#8A96A6' }}>{t('serviceTests.testCode')}:</span>
            &nbsp;
            <span style={{ fontWeight: 600 }}>{test.serviceCode}</span>
          </div>
        )}

        {/* 4 — price (pushed to bottom) */}
        <p style={{
          fontSize: 18, fontWeight: 700, color: '#172033',
          margin: 'auto 0 0', fontFamily: FONT,
          paddingTop: 16,
        }}>
          {fmtPrice(test.price)}&nbsp;
          <span style={{ fontSize: 14, fontWeight: 400, color: '#8A96A6' }}>
            {test.currency || 'AZN'}
          </span>
        </p>
      </div>
    </motion.div>
  );
}

/* ── SkeletonCard ─────────────────────────────────────────────────────────── */
function SkeletonCard() {
  const pulse = { opacity: [0.45, 0.8, 0.45] };
  const trans = { duration: 1.4, repeat: Infinity };
  return (
    <div className="stc" style={{
      display: 'flex', flexDirection: 'column',
      background: '#FFFFFF', border: '1px solid #DDE4E8',
      borderRadius: 8, padding: '38px 44px',
      boxSizing: 'border-box', minHeight: 220,
    }}>
      <motion.div animate={pulse} transition={trans}
        style={{ height: 14, width: '35%', borderRadius: 4, background: '#e8edf2', marginBottom: 18 }} />
      <motion.div animate={pulse} transition={{ ...trans, delay: 0.1 }}
        style={{ height: 22, width: '70%', borderRadius: 4, background: '#e8edf2', marginBottom: 28 }} />
      <motion.div animate={pulse} transition={{ ...trans, delay: 0.2 }}
        style={{ height: 14, width: '40%', borderRadius: 4, background: '#e8edf2', marginBottom: 'auto' }} />
      <motion.div animate={pulse} transition={{ ...trans, delay: 0.3 }}
        style={{ height: 20, width: '25%', borderRadius: 4, background: '#e8edf2', marginTop: 28 }} />
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function ServiceTestsPage() {
  const { slug }   = useParams();
  const { t }      = useTranslation();

  const [service,  setService]  = useState(null);
  const [tests,    setTests]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(false);
  const [notFound, setNotFound] = useState(false);

  const load = async () => {
    setLoading(true); setError(false); setNotFound(false);
    try {
      const svcRes = await api.get(`/services/${slug}`);
      const svc = svcRes.data?.data ?? svcRes.data;
      if (!svc) { setNotFound(true); setLoading(false); return; }
      setService(svc);

      const plRes = await api.get('/pricelist', { params: { serviceSlug: slug, limit: 200 } });
      const pl    = plRes.data?.data?.prices ?? plRes.data?.data ?? plRes.data ?? [];
      setTests(Array.isArray(pl) ? pl : []);
    } catch (err) {
      if (err?.response?.status === 404) setNotFound(true);
      else setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [slug]);

  /* ── 404 ── */
  if (!loading && notFound) {
    return (
      <main style={{ fontFamily: FONT, background: '#F8FAFB', minHeight: '70vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 48, fontWeight: 800, color: NAVY, margin: '0 0 12px',
            fontFamily: "'Raleway', sans-serif" }}>404</p>
          <p style={{ fontSize: 16, color: '#62718A', margin: '0 0 28px', fontFamily: FONT }}>
            Bu istiqamət tapılmadı.
          </p>
          <Link to="/services" style={{
            display: 'inline-block', padding: '10px 24px', borderRadius: 8,
            background: TEAL, color: '#fff', textDecoration: 'none',
            fontSize: 14, fontWeight: 600, fontFamily: FONT,
          }}>
            ← Xidmətlərə qayıt
          </Link>
        </div>
      </main>
    );
  }

  const serviceName = service?.name ?? '';

  return (
    <main style={{ fontFamily: FONT, background: '#F8FAFB', minHeight: '70vh', paddingBottom: 80 }}>
      <div className="stc-wrap" style={{ maxWidth: 1180, margin: '0 auto', boxSizing: 'border-box' }}>

        {/* ── Header block ─────────────────────────────────────────────── */}
        <div className="stc-header">

          {/* Breadcrumb */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 13, fontFamily: FONT, marginBottom: 20 }}>
            <Link to="/services" style={{
              color: TEAL, textDecoration: 'none', fontWeight: 500,
            }}
              onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
            >
              Xidmətlər
            </Link>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="#8A96A6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6"/>
            </svg>
            <span style={{ color: '#8A96A6' }}>{serviceName}</span>
          </nav>

          {/* Title */}
          <h1 className="stc-title" style={{
            fontWeight: 700, color: NAVY, margin: '0 0 12px',
            fontFamily: "'Raleway', sans-serif", lineHeight: 1.2,
          }}>
            {serviceName ? `${serviceName} testləri` : '…'}
          </h1>

          {/* Subtitle — real service description */}
          {service?.description && (
            <p style={{
              fontSize: 16, color: '#62718A', fontFamily: FONT,
              lineHeight: 1.65, margin: 0,
            }}>
              {service.description}
            </p>
          )}
        </div>

        {/* ── Error ────────────────────────────────────────────────────── */}
        {error && (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <p style={{ color: '#ef4444', fontSize: 14, fontFamily: FONT, marginBottom: 14 }}>
              {t('serviceTests.loadError')}
            </p>
            <button onClick={load} style={{
              padding: '8px 22px', borderRadius: 8, border: `1px solid ${TEAL}`,
              background: 'transparent', color: TEAL, fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: FONT,
            }}>
              {t('serviceTests.retry')}
            </button>
          </div>
        )}

        {/* ── Skeleton ─────────────────────────────────────────────────── */}
        {loading && (
          <div className="stc-grid">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* ── Empty ────────────────────────────────────────────────────── */}
        {!loading && !error && tests.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', fontFamily: FONT }}>
            <p style={{ fontSize: 15, color: '#62718A', margin: 0 }}>
              {t('serviceTests.empty')}
            </p>
          </div>
        )}

        {/* ── Cards ────────────────────────────────────────────────────── */}
        {!loading && !error && tests.length > 0 && (
          <div className="stc-grid">
            {tests.map((test, i) => (
              <TestCard key={test._id ?? i} test={test} serviceName={serviceName} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        .stc-wrap   { padding: 48px 28px 0; }
        .stc-header { margin-bottom: 40px; }
        .stc-title  { font-size: 32px; }

        .stc-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          column-gap: 30px;
          row-gap: 26px;
          align-items: stretch;
        }

        .stc:focus-visible { outline: 2px solid #00848e; outline-offset: 2px; }

        @media (max-width: 900px) {
          .stc { padding: 32px !important; }
        }

        @media (max-width: 760px) {
          .stc-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 600px) {
          .stc-wrap   { padding: 32px 20px 0; }
          .stc-header { margin-bottom: 32px; }
          .stc-title  { font-size: 26px !important; }
          .stc        { padding: 26px 22px !important; }
          .stc-name   { font-size: 19px !important; }
        }
      `}</style>
    </main>
  );
}
