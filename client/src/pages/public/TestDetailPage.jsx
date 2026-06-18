import { useState, useEffect, useRef, useId } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import api from '../../api/axios';
import useSeoMeta from '../../hooks/useSeoMeta';

const FONT = "'Source Sans 3', 'Raleway', sans-serif";
const TEAL = '#00848e';
const NAVY = '#071B3B';
const MUTED = '#62718A';
const BORDER = '#DDE4E8';

const fmtPrice = (price) =>
  Number.isInteger(Number(price)) ? String(Math.round(price)) : Number(price).toFixed(2);

const PHONE_RX = /^[+]?[\d\s()-]{7,20}$/;
const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ── HomeServiceModal ────────────────────────────────────────────────────── */
function HomeServiceModal({ test, onClose, triggerRef }) {
  const { t } = useTranslation();
  const titleId = useId();
  const dialogRef = useRef(null);
  const firstFieldRef = useRef(null);

  const [form, setForm] = useState({
    fullName: '', phone: '', email: '', address: '',
    preferredDate: '', preferredTimeRange: '', note: '', consent: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    firstFieldRef.current?.focus();
    const onKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKeyDown);
    const triggerEl = triggerRef?.current;
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      triggerEl?.focus?.();
    };
  }, [onClose, triggerRef]);

  const validate = () => {
    const errs = {};
    const name = form.fullName.trim();
    if (!name || name.length < 2 || name.length > 100) errs.fullName = t('testDetail.fullNameRequired');
    if (!form.phone.trim() || !PHONE_RX.test(form.phone.trim())) errs.phone = form.phone.trim() ? t('testDetail.phoneInvalid') : t('testDetail.phoneRequired');
    if (form.email.trim() && !EMAIL_RX.test(form.email.trim())) errs.email = t('testDetail.emailInvalid');
    if (!form.address.trim()) errs.address = t('testDetail.addressRequired');
    if (!form.consent) errs.consent = t('testDetail.consentRequired');
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting || submitted) return;
    if (!validate()) return;

    setSubmitting(true);
    try {
      await api.post('/contact/home-service', {
        fullName:           form.fullName.trim(),
        phone:               form.phone.trim(),
        email:               form.email.trim(),
        address:             form.address.trim(),
        preferredDate:       form.preferredDate || undefined,
        preferredTimeRange:  form.preferredTimeRange.trim(),
        note:                form.note.trim(),
        consentAccepted:     true,
        priceListId:         test._id,
      });
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || t('testDetail.genericError'));
    } finally {
      setSubmitting(false);
    }
  };

  const labelStyle = { fontSize: 13, fontWeight: 600, color: '#111827', display: 'block', marginBottom: 5, fontFamily: FONT };
  const inputStyle = {
    width: '100%', height: 38, padding: '0 14px', border: '1px solid #d1d5db', borderRadius: 10,
    fontSize: 13.5, fontFamily: FONT, outline: 'none', boxSizing: 'border-box', background: 'white', color: '#1f2937',
  };
  const errStyle = { color: '#ef4444', fontSize: 12, marginTop: 4 };

  return (
    <div
      className="hsm-overlay"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={dialogRef}
        className="hsm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <h2 id={titleId} style={{ margin: 0, fontSize: 18, fontWeight: 700, color: NAVY, fontFamily: "'Raleway', sans-serif" }}>
            {t('testDetail.modalTitle')}
          </h2>
          <button type="button" onClick={onClose} aria-label={t('testDetail.closeButton')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 22, lineHeight: 1 }}>×</button>
        </div>

        {submitted ? (
          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 14, padding: 24, fontFamily: FONT }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#15803d', margin: '0 0 6px' }}>{t('testDetail.successTitle')}</p>
            <p style={{ fontSize: 13.5, color: '#166534', margin: 0, lineHeight: 1.6 }}>{t('testDetail.successMsg')}</p>
            <button type="button" onClick={onClose}
              style={{ marginTop: 16, padding: '9px 20px', borderRadius: 9, border: 'none', background: TEAL, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              {t('testDetail.closeButton')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            <div>
              <label style={labelStyle}>{t('contact.fullNameLabel')} *</label>
              <input ref={firstFieldRef} type="text" value={form.fullName} onChange={e => set('fullName', e.target.value)}
                placeholder={t('contact.fullNamePlaceholder')} style={inputStyle} required />
              {fieldErrors.fullName && <div style={errStyle}>{fieldErrors.fullName}</div>}
            </div>

            <div>
              <label style={labelStyle}>{t('testDetail.phoneLabel')} *</label>
              <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                placeholder={t('testDetail.phonePlaceholder')} style={inputStyle} required />
              {fieldErrors.phone && <div style={errStyle}>{fieldErrors.phone}</div>}
            </div>

            <div>
              <label style={labelStyle}>{t('contact.emailLabel')}</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                placeholder={t('contact.emailPlaceholder')} style={inputStyle} />
              {fieldErrors.email && <div style={errStyle}>{fieldErrors.email}</div>}
            </div>

            <div>
              <label style={labelStyle}>{t('testDetail.selectedServiceLabel')}</label>
              <input type="text" value={`${test.name} — ${fmtPrice(test.price)} ${test.currency || 'AZN'}`} readOnly disabled
                style={{ ...inputStyle, background: '#f1f5f9', color: '#475569', cursor: 'not-allowed' }} />
            </div>

            <div>
              <label style={labelStyle}>{t('testDetail.addressLabel')} *</label>
              <input type="text" value={form.address} onChange={e => set('address', e.target.value)}
                placeholder={t('testDetail.addressPlaceholder')} style={inputStyle} required />
              {fieldErrors.address && <div style={errStyle}>{fieldErrors.address}</div>}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>{t('testDetail.preferredDateLabel')}</label>
                <input type="date" value={form.preferredDate} onChange={e => set('preferredDate', e.target.value)} style={inputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>{t('testDetail.preferredTimeRangeLabel')}</label>
                <input type="text" value={form.preferredTimeRange} onChange={e => set('preferredTimeRange', e.target.value)}
                  placeholder={t('testDetail.preferredTimeRangePlaceholder')} style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>{t('testDetail.noteLabel')}</label>
              <textarea value={form.note} onChange={e => set('note', e.target.value)}
                placeholder={t('testDetail.notePlaceholder')} rows={3}
                style={{ ...inputStyle, height: 'auto', padding: '10px 14px', resize: 'none' }} />
            </div>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, cursor: 'pointer', fontSize: 12.5, color: '#6b7280', fontFamily: FONT, lineHeight: 1.5 }}>
              <input type="checkbox" checked={form.consent} onChange={e => set('consent', e.target.checked)}
                style={{ width: 14, height: 14, marginTop: 2, accentColor: TEAL, cursor: 'pointer', flexShrink: 0 }} required />
              <span>
                <a href="#" style={{ color: TEAL, textDecoration: 'none', fontWeight: 600 }}>{t('contact.agree')}</a>
                {' '}{t('contact.and')}{' '}
                <a href="#" style={{ color: TEAL, textDecoration: 'none', fontWeight: 600 }}>{t('contact.privacyPolicy')}</a>
                {' '}{t('contact.acceptText')}
              </span>
            </label>
            {fieldErrors.consent && <div style={errStyle}>{fieldErrors.consent}</div>}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
              <button type="button" onClick={onClose}
                style={{ padding: '9px 18px', borderRadius: 9, border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                {t('testDetail.cancelButton')}
              </button>
              <button type="submit" disabled={submitting}
                style={{
                  padding: '9px 22px', borderRadius: 9, border: 'none',
                  background: submitting ? '#94a3b8' : TEAL, color: 'white', fontSize: 13, fontWeight: 700,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                }}>
                {submitting ? t('testDetail.submitting') : t('testDetail.submitButton')}
              </button>
            </div>
          </form>
        )}
      </div>

      <style>{`
        .hsm-overlay {
          position: fixed; inset: 0; background: rgba(7,27,59,0.45); z-index: 1100;
          display: flex; align-items: center; justify-content: center; padding: 16px;
        }
        .hsm-dialog {
          background: white; border-radius: 16px; width: 100%; max-width: 480px;
          max-height: 92vh; overflow-y: auto; padding: 26px; box-sizing: border-box;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        }
        @media (max-width: 600px) {
          .hsm-overlay { padding: 0; align-items: flex-end; }
          .hsm-dialog { max-width: 100%; border-radius: 16px 16px 0 0; max-height: 88vh; }
        }
      `}</style>
    </div>
  );
}

/* ── Tabs ────────────────────────────────────────────────────────────────── */
function Tabs({ tabs, active, onChange }) {
  return (
    <div role="tablist" aria-label="Test detail tabs" className="td-tabs">
      {tabs.map(tab => (
        <button
          key={tab.key}
          role="tab"
          id={`tab-${tab.key}`}
          aria-selected={active === tab.key}
          aria-controls={`panel-${tab.key}`}
          tabIndex={active === tab.key ? 0 : -1}
          className={`td-tab ${active === tab.key ? 'td-tab-active' : ''}`}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function TestDetailPage() {
  const { slug, testId } = useParams();
  const { t } = useTranslation();

  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [activeTab, setActiveTab] = useState('about');
  const [modalOpen, setModalOpen] = useState(false);
  const ctaRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [testId]);

  useEffect(() => {
    const controller = new AbortController();
    let isCurrent = true;

    const load = async () => {
      setLoading(true);
      setError(false);
      setNotFound(false);

      try {
        const res = await api.get(`/pricelist/${testId}`, { signal: controller.signal });
        if (!isCurrent) return;
        const data = res.data?.data ?? res.data;
        if (!data) { setNotFound(true); return; }
        setTest(data);
      } catch (err) {
        if (!isCurrent || err?.code === 'ERR_CANCELED') return;
        if (err?.response?.status === 404) setNotFound(true);
        else setError(true);
      } finally {
        if (isCurrent) setLoading(false);
      }
    };

    load();

    return () => { isCurrent = false; controller.abort(); };
  }, [testId, reloadKey]);

  const canonicalUrl = test ? `${window.location.origin}/services/${slug}/tests/${test._id}` : undefined;
  useSeoMeta({
    title: test?.name,
    description: test?.about || test?.description || 'Aslan Medical Center laboratoriya testi.',
    canonical: canonicalUrl,
    type: 'article',
  });

  if (loading) {
    return (
      <main style={{ fontFamily: FONT, background: '#F8FAFB', minHeight: '70vh' }}>
        <div className="td-wrap" style={{ display: 'flex', justifyContent: 'center', padding: '120px 0' }}>
          <div style={{ width: 36, height: 36, border: `3px solid ${BORDER}`, borderTopColor: TEAL, borderRadius: '50%', animation: 'td-spin 0.8s linear infinite' }} />
        </div>
        <style>{`@keyframes td-spin { to { transform: rotate(360deg) } }`}</style>
      </main>
    );
  }

  if (notFound) {
    return (
      <main style={{ fontFamily: FONT, background: '#F8FAFB', minHeight: '70vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 56, fontWeight: 800, color: NAVY, margin: '0 0 16px', fontFamily: "'Raleway', sans-serif" }}>404</p>
          <p style={{ fontSize: 17, fontWeight: 700, color: NAVY, margin: '0 0 8px', fontFamily: "'Raleway', sans-serif" }}>
            {t('testDetail.notFoundTitle')}
          </p>
          <p style={{ fontSize: 15, color: MUTED, margin: '0 0 28px' }}>{t('testDetail.notFoundText')}</p>
          <Link to={`/services/${slug}`} style={{
            display: 'inline-block', padding: '10px 24px', borderRadius: 8,
            background: TEAL, color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 600,
          }}>
            ← {t('testDetail.backToService')}
          </Link>
        </div>
      </main>
    );
  }

  if (error || !test) {
    return (
      <main style={{ fontFamily: FONT, background: '#F8FAFB', minHeight: '70vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#ef4444', fontSize: 15, marginBottom: 16 }}>{t('testDetail.loadError')}</p>
          <button onClick={() => setReloadKey(k => k + 1)} style={{
            padding: '9px 24px', borderRadius: 8, border: `1px solid ${TEAL}`,
            background: 'transparent', color: TEAL, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: FONT,
          }}>
            {t('testDetail.retry')}
          </button>
        </div>
      </main>
    );
  }

  const tech = test.technicalDetails || {};
  const techRows = [
    [t('testDetail.techDepartment'),  tech.department],
    [t('testDetail.techMethod'),       tech.method],
    [t('testDetail.techTransport'),    tech.transport],
    [t('testDetail.techTurnaround'),   tech.turnaround],
    [t('testDetail.techSampleVolume'), tech.sampleVolume],
    [t('testDetail.techSampleType'),   tech.sampleType],
    [t('testDetail.techRejection'),    tech.rejectionCriteria],
    [t('testDetail.techSynonyms'),     tech.synonyms],
    [t('testDetail.techPreparation'),  tech.preparation],
    [t('testDetail.techTube'),         tech.tube],
  ].filter(([, v]) => v);

  const tabs = [
    { key: 'about',      label: t('testDetail.aboutTab') },
    { key: 'technical',  label: t('testDetail.technicalTab') },
    { key: 'reference',  label: t('testDetail.referenceTab') },
  ];

  return (
    <main style={{ fontFamily: FONT, background: '#F8FAFB', minHeight: '70vh', paddingBottom: 96 }}>
      <div className="td-wrap">

        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" style={{
          display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
          fontSize: 13, fontFamily: FONT, marginBottom: 22,
        }}>
          <Link to="/services" style={{ color: TEAL, textDecoration: 'none', fontWeight: 500 }}>
            {t('serviceTests.services')}
          </Link>
          <span style={{ color: '#8A96A6' }}>/</span>
          <Link to={`/services/${slug}`} style={{ color: TEAL, textDecoration: 'none', fontWeight: 500 }}>
            {test.serviceName || slug}
          </Link>
          <span style={{ color: '#8A96A6' }}>/</span>
          <span style={{ color: '#8A96A6' }}>{test.name}</span>
        </nav>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{
            fontSize: 32, fontWeight: 700, color: NAVY, margin: '0 0 10px',
            fontFamily: "'Raleway', sans-serif", lineHeight: 1.2,
          }}>
            {test.name}
          </h1>
          {test.description && (
            <p style={{ fontSize: 16, color: MUTED, lineHeight: 1.6, margin: 0, maxWidth: 720 }}>
              {test.description}
            </p>
          )}
        </div>

        {/* CTA */}
        <div className="td-cta" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
          background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 10, padding: '20px 28px', marginBottom: 28,
        }}>
          <div>
            <div style={{ fontSize: 13, color: MUTED, marginBottom: 4 }}>{t('serviceTests.testCode')}: <strong style={{ color: '#263248' }}>{test.serviceCode || '—'}</strong></div>
            <div style={{ fontSize: 26, fontWeight: 700, color: NAVY, fontFamily: FONT }}>
              {fmtPrice(test.price)}&nbsp;<span style={{ fontSize: 14, fontWeight: 400, color: MUTED }}>{test.currency || 'AZN'}</span>
            </div>
          </div>
          {test.homeServiceAvailable && (
            <button
              ref={ctaRef}
              type="button"
              onClick={() => setModalOpen(true)}
              style={{
                padding: '12px 26px', borderRadius: 9, border: 'none', background: TEAL, color: 'white',
                fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, whiteSpace: 'nowrap',
              }}
            >
              {t('testDetail.homeServiceCta')}
            </button>
          )}
        </div>

        {/* Tabs */}
        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

        <div className="td-panel">
          {activeTab === 'about' && (
            <div role="tabpanel" id="panel-about" aria-labelledby="tab-about">
              {test.about
                ? <p style={{ fontSize: 15, color: '#334155', lineHeight: 1.75, margin: 0, whiteSpace: 'pre-wrap' }}>{test.about}</p>
                : <p style={{ fontSize: 14, color: MUTED, margin: 0 }}>{t('testDetail.noAboutInfo')}</p>}
            </div>
          )}

          {activeTab === 'technical' && (
            <div role="tabpanel" id="panel-technical" aria-labelledby="tab-technical">
              {techRows.length > 0 ? (
                <dl className="td-dl">
                  {techRows.map(([label, value]) => (
                    <div key={label} className="td-dl-row">
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p style={{ fontSize: 14, color: MUTED, margin: 0 }}>{t('testDetail.noTechnicalInfo')}</p>
              )}
            </div>
          )}

          {activeTab === 'reference' && (
            <div role="tabpanel" id="panel-reference" aria-labelledby="tab-reference">
              {test.referenceInfo
                ? <p style={{ fontSize: 15, color: '#334155', lineHeight: 1.75, margin: 0, whiteSpace: 'pre-wrap' }}>{test.referenceInfo}</p>
                : <p style={{ fontSize: 14, color: MUTED, margin: 0 }}>{t('testDetail.noReferenceInfo')}</p>}
            </div>
          )}
        </div>

        {/* Back link */}
        <div style={{ marginTop: 36 }}>
          <Link to={`/services/${slug}`} style={{ color: TEAL, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
            ← {t('testDetail.backToService')}
          </Link>
        </div>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <HomeServiceModal test={test} onClose={() => setModalOpen(false)} triggerRef={ctaRef} />
        )}
      </AnimatePresence>

      <style>{`
        .td-wrap {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding: 52px 32px 0;
          box-sizing: border-box;
        }

        .td-tabs {
          display: flex; gap: 4px; border-bottom: 1px solid ${BORDER}; margin-bottom: 24px;
          overflow-x: auto;
        }
        .td-tab {
          background: none; border: none; cursor: pointer; font-family: ${FONT};
          font-size: 14px; font-weight: 600; color: ${MUTED};
          padding: 12px 18px; border-bottom: 2px solid transparent; white-space: nowrap;
        }
        .td-tab-active { color: ${TEAL}; border-bottom-color: ${TEAL}; }
        .td-tab:focus-visible { outline: 2px solid ${TEAL}; outline-offset: 2px; }

        .td-panel {
          background: #fff; border: 1px solid ${BORDER}; border-radius: 10px; padding: 28px 32px;
        }

        .td-dl { margin: 0; display: grid; gap: 14px; }
        .td-dl-row { display: flex; justify-content: space-between; gap: 16px; border-bottom: 1px solid #F1F5F9; padding-bottom: 12px; }
        .td-dl-row:last-child { border-bottom: none; padding-bottom: 0; }
        .td-dl dt { font-size: 13px; color: ${MUTED}; font-weight: 500; }
        .td-dl dd { margin: 0; font-size: 14px; color: #263248; font-weight: 600; text-align: right; max-width: 60%; }

        @media (max-width: 1100px) {
          .td-wrap { padding: 44px 24px 0; }
        }

        @media (max-width: 768px) {
          .td-wrap { padding: 32px 16px 0; }
          .td-panel { padding: 22px 20px; }
          .td-cta { padding: 18px 20px; }
          .td-dl-row { flex-direction: column; gap: 4px; }
          .td-dl dd { text-align: left; max-width: 100%; }
        }
      `}</style>
    </main>
  );
}
