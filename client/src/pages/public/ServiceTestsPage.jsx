import { useState, useEffect, useLayoutEffect } from 'react';
import { useParams, Link }     from 'react-router-dom';
import { motion }              from 'framer-motion';
import { useTranslation }      from 'react-i18next';
import api                     from '../../api/axios';

const FONT = "'Source Sans 3', 'Raleway', sans-serif";
const TEAL = '#00848e';
const NAVY = '#071B3B';

/* ── price formatter (no trailing .00) ──────────────────────────────────── */
const fmtPrice = (price) =>
  Number.isInteger(Number(price)) ? String(Math.round(price)) : Number(price).toFixed(2);

/* ── TestCard ────────────────────────────────────────────────────────────── */
function TestCard({ test, directionName, slug }) {
  const [hov, setHov] = useState(false);
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.26 }}
      style={{ display: 'flex' }}
    >
      <Link
        to={`/services/${slug}/tests/${test._id}`}
        className="stc"
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          display:       'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          width:         '100%',
          background:    '#FFFFFF',
          border:        `1px solid ${hov ? 'rgba(0,132,142,0.40)' : '#DDE4E8'}`,
          borderRadius:  8,
          boxShadow:     'none',
          transition:    'border-color 180ms ease',
          padding:       '32px 36px',
          minHeight:     220,
          boxSizing:     'border-box',
          cursor:        'pointer',
          textDecoration: 'none',
          color:         'inherit',
        }}
      >
        {/* Direction / category label */}
        <p style={{
          fontSize: 14, fontWeight: 400, color: '#8A96A6',
          margin: '0 0 10px', fontFamily: FONT, lineHeight: 1.4,
        }}>
          {directionName}
        </p>

        {/* Test name */}
        <h3 style={{
          fontSize: 24, fontWeight: 700, lineHeight: 1.25,
          color: '#172033', margin: '0 0 14px',
          fontFamily: "'Raleway', sans-serif",
          wordBreak: 'break-word',
        }}
          className="stc-name"
        >
          {test.name}
        </h3>

        {/* Test code */}
        {test.serviceCode && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 15, color: '#263248', fontFamily: FONT,
            marginBottom: 14,
          }}>
            <span style={{
              width: 5, height: 5, borderRadius: '50%',
              background: TEAL, flexShrink: 0,
            }} />
            <span style={{ color: '#8A96A6' }}>{t('serviceTests.testCode')}:</span>
            &nbsp;
            <span style={{ fontWeight: 600 }}>{test.serviceCode}</span>
          </div>
        )}

        {/* Price */}
        <p style={{
          fontSize: 22, fontWeight: 700, color: '#172033',
          margin: '6px 0 0', fontFamily: FONT,
        }}>
          {fmtPrice(test.price)}&nbsp;
          <span style={{ fontSize: 13, fontWeight: 400, color: '#8A96A6' }}>
            {test.currency || 'AZN'}
          </span>
        </p>
      </Link>
    </motion.div>
  );
}

/* ── SkeletonCard ────────────────────────────────────────────────────────── */
function SkeletonCard() {
  const pulse = { opacity: [0.45, 0.8, 0.45] };
  const tr    = { duration: 1.4, repeat: Infinity };
  return (
    <div className="stc" style={{
      display: 'flex', flexDirection: 'column',
      background: '#FFFFFF', border: '1px solid #DDE4E8',
      borderRadius: 8, padding: '32px 36px',
      minHeight: 220, boxSizing: 'border-box',
    }}>
      <motion.div animate={pulse} transition={tr}
        style={{ height: 13, width: '32%', borderRadius: 4, background: '#e8edf2', marginBottom: 14 }} />
      <motion.div animate={pulse} transition={{ ...tr, delay: 0.1 }}
        style={{ height: 22, width: '68%', borderRadius: 4, background: '#e8edf2', marginBottom: 18 }} />
      <motion.div animate={pulse} transition={{ ...tr, delay: 0.2 }}
        style={{ height: 13, width: '40%', borderRadius: 4, background: '#e8edf2', marginBottom: 14 }} />
      <motion.div animate={pulse} transition={{ ...tr, delay: 0.3 }}
        style={{ height: 20, width: '22%', borderRadius: 4, background: '#e8edf2', marginTop: 6 }} />
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function ServiceTestsPage() {
  const { slug } = useParams();
  const { t }    = useTranslation();

  const [service,  setService]  = useState(null);
  const [tests,    setTests]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [slug]);

  useEffect(() => {
    const controller = new AbortController();
    let isCurrent = true;

    const load = async () => {
      setLoading(true);
      setError(false);
      setNotFound(false);
      setService(null);
      setTests([]);

      try {
        const svcRes = await api.get(`/services/${slug}`, {
          signal: controller.signal,
        });
        const svc = svcRes.data?.data ?? svcRes.data;

        if (!svc) {
          if (isCurrent) setNotFound(true);
          return;
        }

        const plRes = await api.get('/pricelist', {
          params: { serviceSlug: slug, category: 'lab', limit: 200 },
          signal: controller.signal,
        });
        const list = plRes.data?.data?.prices ?? plRes.data?.data ?? plRes.data ?? [];

        if (!isCurrent) return;
        setService(svc);
        setTests(Array.isArray(list) ? list : []);
      } catch (err) {
        if (!isCurrent || err?.code === 'ERR_CANCELED') return;
        if (err?.response?.status === 404) setNotFound(true);
        else setError(true);
      } finally {
        if (isCurrent) setLoading(false);
      }
    };

    load();

    return () => {
      isCurrent = false;
      controller.abort();
    };
  }, [slug, reloadKey]);

  /* ── 404 ── */
  if (!loading && notFound) {
    return (
      <main style={{ fontFamily: FONT, background: '#F8FAFB', minHeight: '70vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 56, fontWeight: 800, color: NAVY, margin: '0 0 16px',
            fontFamily: "'Raleway', sans-serif" }}>404</p>
          <p style={{ fontSize: 16, color: '#62718A', margin: '0 0 28px', fontFamily: FONT }}>
            {t('serviceTests.notFound')}
          </p>
          <Link to="/services" style={{
            display: 'inline-block', padding: '10px 24px', borderRadius: 8,
            background: TEAL, color: '#fff', textDecoration: 'none',
            fontSize: 14, fontWeight: 600, fontFamily: FONT,
          }}>
            ← {t('serviceTests.backToServices')}
          </Link>
        </div>
      </main>
    );
  }

  const serviceName = service?.name ?? '';
  const description = service?.description ?? '';

  return (
    <main className="stc-main" style={{ fontFamily: FONT, background: '#F8FAFB', minHeight: '70vh' }}>
      <div className="stc-wrap">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="stc-header">

          {/* Breadcrumb */}
          <nav aria-label="breadcrumb" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 13, fontFamily: FONT, marginBottom: 22,
          }}>
            <Link to="/services" style={{ color: TEAL, textDecoration: 'none', fontWeight: 500 }}
              onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
            >
              {t('serviceTests.services')}
            </Link>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="#8A96A6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6"/>
            </svg>
            <span style={{ color: '#8A96A6' }}>{serviceName}</span>
          </nav>

          {/* Page title */}
          <h1 className="stc-title" style={{
            fontWeight: 700, color: NAVY, margin: '0 0 14px',
            fontFamily: "'Raleway', sans-serif", lineHeight: 1.2,
          }}>
            {loading ? '…' : (serviceName ? `${serviceName} ${t('serviceTests.testsSuffix')}` : '')}
          </h1>

          {/* Service description */}
          {description && (
            <p style={{
              fontSize: 16, color: '#62718A', fontFamily: FONT,
              lineHeight: 1.65, margin: 0, maxWidth: 700,
            }}>
              {description}
            </p>
          )}
        </div>

        {/* ── Error ───────────────────────────────────────────────────── */}
        {error && (
          <div style={{ textAlign: 'center', padding: '52px 0' }}>
            <p style={{ color: '#ef4444', fontSize: 14, fontFamily: FONT, marginBottom: 16 }}>
              {t('serviceTests.loadError')}
            </p>
            <button onClick={() => setReloadKey(key => key + 1)} style={{
              padding: '9px 24px', borderRadius: 8, border: `1px solid ${TEAL}`,
              background: 'transparent', color: TEAL, fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: FONT,
            }}>
              {t('serviceTests.retry')}
            </button>
          </div>
        )}

        {/* ── Skeleton ────────────────────────────────────────────────── */}
        {loading && !error && (
          <div className="stc-grid">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* ── Empty ───────────────────────────────────────────────────── */}
        {!loading && !error && tests.length === 0 && (
          <div style={{ textAlign: 'center', padding: '52px 0', fontFamily: FONT }}>
            <p style={{ fontSize: 15, color: '#62718A', margin: 0 }}>
              {t('serviceTests.empty')}
            </p>
          </div>
        )}

        {/* ── Cards ───────────────────────────────────────────────────── */}
        {!loading && !error && tests.length > 0 && (
          <div className="stc-grid">
            {tests.map((test, i) => (
              <TestCard key={test._id ?? i} test={test} directionName={serviceName} slug={slug} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        .stc-main { padding-bottom: 96px; box-sizing: border-box; overflow-x: hidden; }

        .stc-wrap {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding: 52px 32px 0;
          box-sizing: border-box;
        }
        .stc-header { margin-bottom: 44px; }
        .stc-title  { font-size: 36px; }

        .stc-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          column-gap: 28px;
          row-gap: 24px;
          align-items: stretch;
        }
        .stc-grid > * { min-width: 0; }

        .stc:focus-visible { outline: 2px solid #00848e; outline-offset: 2px; }

        @media (max-width: 1100px) {
          .stc-wrap { padding: 44px 24px 0; }
        }

        @media (max-width: 768px) {
          .stc-main   { padding-bottom: 140px; }
          .stc-wrap   { padding: 32px 16px 0; }
          .stc-header { margin-bottom: 32px; }
          .stc-title  { font-size: 28px !important; }
          .stc-grid {
            grid-template-columns: 1fr;
            column-gap: 0;
            row-gap: 20px;
          }
          .stc        { padding: 24px !important; min-height: 190px !important; }
          .stc-name   { font-size: 21px !important; }
        }
      `}</style>
    </main>
  );
}
