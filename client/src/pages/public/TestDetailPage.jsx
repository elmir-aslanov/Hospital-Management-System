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

/* ── Document icon (CTA card, left side) ─────────────────────────────────── */
function DocIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="1.6" aria-hidden="true">
      <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="15" y2="17" />
    </svg>
  );
}

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

/* ── LabResultCheckModal (Fox Qida Həssaslığı Testi) ─────────────────────── */
const FIN_RX = /^[A-Za-z0-9]{5,8}$/;

const FLAG_COLOR = { normal: '#15803d', low: '#c2410c', high: '#c2410c', critical: '#b91c1c', pending: '#64748b' };
const FLAG_BG    = { normal: '#dcfce7', low: '#ffedd5', high: '#ffedd5', critical: '#fee2e2', pending: '#f1f5f9' };

function formatDateDisplay(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('az-AZ', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function LabResultCheckModal({ test, onClose, triggerRef }) {
  const { t } = useTranslation();
  const titleId = useId();
  const dialogRef = useRef(null);
  const firstFieldRef = useRef(null);

  const [fin, setFin] = useState('');
  const [protocolNo, setProtocolNo] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showProtocolHelp, setShowProtocolHelp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [outcome, setOutcome] = useState(null);
  const [downloading, setDownloading] = useState(false);

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
    const cleanFin = fin.trim();
    if (!cleanFin) errs.fin = t('labResultCheck.finRequired');
    else if (!FIN_RX.test(cleanFin)) errs.fin = t('labResultCheck.finInvalid');
    if (!protocolNo.trim()) errs.protocolNo = t('labResultCheck.protocolRequired');
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!validate()) return;

    setLoading(true);
    setError('');
    setOutcome(null);
    try {
      const res = await api.post('/lab-results/test-status', {
        fin: fin.trim().toUpperCase(),
        protocolNo: protocolNo.trim().toUpperCase(),
        testSlug: test.slug,
      });
      setOutcome(res.data?.data || { state: 'not_found' });
    } catch (err) {
      if (!err.response) setError(t('labResultCheck.genericError'));
      else setError(err.response.data?.message || t('labResultCheck.genericError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!outcome?.id || !outcome?.accessToken || downloading) return;
    setDownloading(true);
    try {
      const res = await api.get(`/lab-results/${outcome.id}/pdf`, {
        params: { accessToken: outcome.accessToken },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${outcome.protocolNo || 'lab-result'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error(t('labResultCheck.genericError'));
    } finally {
      setDownloading(false);
    }
  };

  const reset = () => {
    setOutcome(null);
    setError('');
    setFieldErrors({});
  };

  const labelStyle = { fontSize: 13, fontWeight: 600, color: '#111827', display: 'block', marginBottom: 5, fontFamily: FONT };
  const inputStyle = {
    width: '100%', height: 38, padding: '0 14px', border: '1px solid #d1d5db', borderRadius: 10,
    fontSize: 13.5, fontFamily: FONT, outline: 'none', boxSizing: 'border-box', background: 'white', color: '#1f2937',
  };
  const errStyle = { color: '#ef4444', fontSize: 12, marginTop: 4 };

  const renderStatusNotice = (titleKey, color, bg) => (
    <div style={{ background: bg, border: `1px solid ${color}33`, borderRadius: 14, padding: 22, fontFamily: FONT }}>
      <p style={{ fontSize: 14.5, fontWeight: 700, color, margin: '0 0 6px' }}>{t(titleKey)}</p>
      <p style={{ fontSize: 13, color: '#475569', margin: 0, lineHeight: 1.6 }}>
        {t(outcome.state === 'not_found' ? 'labResultCheck.notFoundText' : 'labResultCheck.notReadyText')}
      </p>
      <button type="button" onClick={reset}
        style={{ marginTop: 14, padding: '8px 18px', borderRadius: 9, border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
        {t('labResultCheck.newCheckButton')}
      </button>
    </div>
  );

  return (
    <div className="hsm-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={dialogRef} className="hsm-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 id={titleId} style={{ margin: 0, fontSize: 18, fontWeight: 700, color: NAVY, fontFamily: "'Raleway', sans-serif" }}>
            {t('labResultCheck.title')}
          </h2>
          <button type="button" onClick={onClose} aria-label={t('labResultCheck.closeButton')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 22, lineHeight: 1 }}>×</button>
        </div>

        {!outcome && (
          <p style={{ fontSize: 13.5, color: MUTED, margin: '0 0 18px', lineHeight: 1.6, fontFamily: FONT }}>
            {t('labResultCheck.description')}
          </p>
        )}

        {!outcome ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={labelStyle}>{t('labResultCheck.finLabel')} *</label>
              <input ref={firstFieldRef} type="text" value={fin} onChange={e => setFin(e.target.value)}
                placeholder={t('labResultCheck.finPlaceholder')} style={inputStyle} required />
              {fieldErrors.fin && <div style={errStyle}>{fieldErrors.fin}</div>}
            </div>

            <div>
              <label style={labelStyle}>{t('labResultCheck.protocolLabel')} *</label>
              <input type="text" value={protocolNo} onChange={e => setProtocolNo(e.target.value)}
                placeholder={t('labResultCheck.protocolPlaceholder')} style={inputStyle} required />
              {fieldErrors.protocolNo && <div style={errStyle}>{fieldErrors.protocolNo}</div>}
            </div>

            <button type="button" onClick={() => setShowProtocolHelp(v => !v)}
              style={{ background: 'none', border: 'none', padding: 0, color: TEAL, fontSize: 12.5, fontWeight: 600, textAlign: 'left', cursor: 'pointer', fontFamily: FONT }}>
              {t('labResultCheck.protocolHelpLink')}
            </button>
            {showProtocolHelp && (
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', fontSize: 12.5, color: '#475569', lineHeight: 1.6, fontFamily: FONT }}>
                {t('labResultCheck.protocolHelpText')}
              </div>
            )}

            {error && <div style={errStyle}>{error}</div>}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
              <button type="button" onClick={onClose}
                style={{ padding: '9px 18px', borderRadius: 9, border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                {t('labResultCheck.cancelButton')}
              </button>
              <button type="submit" disabled={loading}
                style={{
                  padding: '9px 22px', borderRadius: 9, border: 'none',
                  background: loading ? '#94a3b8' : TEAL, color: 'white', fontSize: 13, fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}>
                {loading ? t('labResultCheck.submitting') : t('labResultCheck.submitButton')}
              </button>
            </div>
          </form>
        ) : outcome.state === 'ready' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 12, padding: '10px 16px' }}>
              <p style={{ fontSize: 13.5, fontWeight: 700, color: '#15803d', margin: 0 }}>{t('labResultCheck.statusReadyTitle')}</p>
            </div>

            <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px', margin: 0, fontFamily: FONT }}>
              <div>
                <dt style={{ fontSize: 11.5, color: MUTED, margin: '0 0 2px' }}>{t('labResultCheck.resultPatientName')}</dt>
                <dd style={{ fontSize: 13.5, fontWeight: 600, color: NAVY, margin: 0 }}>{outcome.patientFullName || '—'}</dd>
              </div>
              <div>
                <dt style={{ fontSize: 11.5, color: MUTED, margin: '0 0 2px' }}>{t('labResultCheck.resultTestName')}</dt>
                <dd style={{ fontSize: 13.5, fontWeight: 600, color: NAVY, margin: 0 }}>{outcome.testName || '—'}</dd>
              </div>
              <div>
                <dt style={{ fontSize: 11.5, color: MUTED, margin: '0 0 2px' }}>{t('labResultCheck.resultProtocol')}</dt>
                <dd style={{ fontSize: 13.5, fontWeight: 600, color: NAVY, margin: 0 }}>{outcome.protocolNo || '—'}</dd>
              </div>
              <div>
                <dt style={{ fontSize: 11.5, color: MUTED, margin: '0 0 2px' }}>{t('labResultCheck.resultStatus')}</dt>
                <dd style={{ fontSize: 13.5, fontWeight: 600, color: NAVY, margin: 0 }}>{t('labResult.statusApproved')}</dd>
              </div>
              <div>
                <dt style={{ fontSize: 11.5, color: MUTED, margin: '0 0 2px' }}>{t('labResultCheck.resultSampleDate')}</dt>
                <dd style={{ fontSize: 13.5, fontWeight: 600, color: NAVY, margin: 0 }}>{formatDateDisplay(outcome.sampleDate)}</dd>
              </div>
              <div>
                <dt style={{ fontSize: 11.5, color: MUTED, margin: '0 0 2px' }}>{t('labResultCheck.resultDate')}</dt>
                <dd style={{ fontSize: 13.5, fontWeight: 600, color: NAVY, margin: 0 }}>{formatDateDisplay(outcome.resultDate)}</dd>
              </div>
            </dl>

            {Array.isArray(outcome.results) && outcome.results.length > 0 && (
              <div>
                <p style={{ fontSize: 12.5, fontWeight: 700, color: NAVY, margin: '0 0 8px', fontFamily: FONT }}>
                  {t('labResultCheck.resultParameters')}
                </p>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONT }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        <th style={{ textAlign: 'left', fontSize: 11, color: MUTED, padding: '8px 10px' }}>{t('labResultCheck.resultParameterName')}</th>
                        <th style={{ textAlign: 'left', fontSize: 11, color: MUTED, padding: '8px 10px' }}>{t('labResultCheck.resultValue')}</th>
                        <th style={{ textAlign: 'left', fontSize: 11, color: MUTED, padding: '8px 10px' }}>{t('labResultCheck.resultReferenceRange')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {outcome.results.map((item, i) => (
                        <tr key={i} style={{ borderTop: '1px solid #e2e8f0' }}>
                          <td style={{ fontSize: 12.5, color: '#1f2937', padding: '8px 10px' }}>{item.parameterName || '—'}</td>
                          <td style={{ fontSize: 12.5, padding: '8px 10px' }}>
                            <span style={{
                              color: FLAG_COLOR[item.status] || '#1f2937',
                              background: FLAG_BG[item.status] || 'transparent',
                              borderRadius: 6, padding: '2px 7px', fontWeight: 600,
                            }}>
                              {item.value || '—'}{item.unit ? ` ${item.unit}` : ''}
                            </span>
                          </td>
                          <td style={{ fontSize: 12.5, color: '#64748b', padding: '8px 10px' }}>{item.referenceRange || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
              <button type="button" onClick={reset}
                style={{ padding: '9px 18px', borderRadius: 9, border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                {t('labResultCheck.newCheckButton')}
              </button>
              <button type="button" onClick={handleDownload} disabled={downloading}
                style={{
                  padding: '9px 22px', borderRadius: 9, border: 'none',
                  background: downloading ? '#94a3b8' : TEAL, color: 'white', fontSize: 13, fontWeight: 700,
                  cursor: downloading ? 'not-allowed' : 'pointer',
                }}>
                {t('labResultCheck.downloadPdf')}
              </button>
            </div>
          </div>
        ) : outcome.state === 'in_progress' ? (
          renderStatusNotice('labResultCheck.statusInProgressTitle', '#c2410c', '#ffedd5')
        ) : outcome.state === 'pending_approval' ? (
          renderStatusNotice('labResultCheck.statusPendingApprovalTitle', '#c2410c', '#ffedd5')
        ) : (
          renderStatusNotice('labResultCheck.statusNotFoundTitle', '#b91c1c', '#fee2e2')
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
  const { slug, testSlug } = useParams();
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
  }, [testSlug]);

  useEffect(() => {
    const controller = new AbortController();
    let isCurrent = true;

    const load = async () => {
      setLoading(true);
      setError(false);
      setNotFound(false);

      try {
        const res = await api.get(`/pricelist/${testSlug}`, { signal: controller.signal });
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
  }, [testSlug, reloadKey]);

  const canonicalUrl = test ? `${window.location.origin}/services/${slug}/${test.slug || test._id}` : undefined;
  useSeoMeta({
    title: test?.name,
    description: test?.shortDescription || test?.aboutIntro || 'Aslan Medical Center laboratoriya testi.',
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

  const isLabResultCheckTest = test.slug === 'fox-qida-hessasligi-testi';

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

  const aboutFeatures   = Array.isArray(test.aboutFeatures)   ? test.aboutFeatures.filter(Boolean)   : [];
  const benefits        = Array.isArray(test.benefits)        ? test.benefits.filter(Boolean)        : [];
  const procedureSteps  = Array.isArray(test.procedureSteps)  ? test.procedureSteps.filter(Boolean)  : [];
  const hasAboutContent = test.aboutIntro || aboutFeatures.length || benefits.length || procedureSteps.length || test.medicalNotice;

  const refRange    = test.referenceRange || {};
  const refCategories = Array.isArray(refRange.categories) ? refRange.categories.filter(Boolean) : [];
  const hasRefContent = refRange.mainText || refCategories.length || refRange.notice;

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
          {test.shortDescription && (
            <p style={{ fontSize: 16, color: MUTED, lineHeight: 1.6, margin: 0, maxWidth: 720 }}>
              {test.shortDescription}
            </p>
          )}
        </div>

        {/* CTA card */}
        <div className="td-cta">
          <span className="td-cta-icon"><DocIcon /></span>
          {test.homeServiceDescription && (
            <p className="td-cta-text">{test.homeServiceDescription}</p>
          )}
          <div className="td-cta-price">
            {fmtPrice(test.price)}&nbsp;<span className="td-cta-currency">{test.currency || 'AZN'}</span>
          </div>
          {test.homeServiceAvailable && (
            <button
              ref={ctaRef}
              type="button"
              onClick={() => setModalOpen(true)}
              className="td-cta-btn"
            >
              {t(isLabResultCheckTest ? 'testDetail.checkResultCta' : 'testDetail.homeServiceCta')}
            </button>
          )}
        </div>

        {/* Tabs */}
        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

        <div className="td-panel">
          {activeTab === 'about' && (
            <div role="tabpanel" id="panel-about" aria-labelledby="tab-about">
              {hasAboutContent ? (
                <>
                  {test.aboutIntro && (
                    <p className="td-paragraph">{test.aboutIntro}</p>
                  )}

                  {aboutFeatures.length > 0 && (
                    <ul className="td-dash-list">
                      {aboutFeatures.map((line, i) => <li key={i}>{line}</li>)}
                    </ul>
                  )}

                  {benefits.length > 0 && (
                    <>
                      <h2 className="td-section-heading">{t('testDetail.benefitsHeading')}</h2>
                      <ul className="td-dash-list">
                        {benefits.map((line, i) => <li key={i}>{line}</li>)}
                      </ul>
                    </>
                  )}

                  {procedureSteps.length > 0 && (
                    <>
                      <h2 className="td-section-heading">{t('testDetail.procedureHeading')}</h2>
                      <ol className="td-numbered-list">
                        {procedureSteps.map((line, i) => <li key={i}>{line}</li>)}
                      </ol>
                    </>
                  )}

                  {test.medicalNotice && (
                    <div className="td-notice">{test.medicalNotice}</div>
                  )}
                </>
              ) : (
                <p className="td-empty">{t('testDetail.noAboutInfo')}</p>
              )}
            </div>
          )}

          {activeTab === 'technical' && (
            <div role="tabpanel" id="panel-technical" aria-labelledby="tab-technical">
              <h2 className="td-section-heading td-section-heading-first">{t('testDetail.technicalTab')}</h2>
              {techRows.length > 0 ? (
                <dl className="td-dl">
                  {techRows.map(([label, value]) => (
                    <div key={label} className="td-dl-row">
                      <dt>{label}</dt>
                      <span className="td-dl-leader" aria-hidden="true" />
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="td-empty">{t('testDetail.noTechnicalInfo')}</p>
              )}
            </div>
          )}

          {activeTab === 'reference' && (
            <div role="tabpanel" id="panel-reference" aria-labelledby="tab-reference">
              <h2 className="td-section-heading td-section-heading-first">{t('testDetail.referenceTab')}</h2>
              {hasRefContent ? (
                <>
                  {refRange.mainText && <p className="td-paragraph">{refRange.mainText}</p>}

                  {refCategories.length > 0 && (
                    <div className="td-chip-row">
                      {refCategories.map((cat, i) => <span key={i} className="td-chip">{cat}</span>)}
                    </div>
                  )}

                  {refRange.notice && <div className="td-notice">{refRange.notice}</div>}
                </>
              ) : (
                <p className="td-empty">{t('testDetail.noReferenceInfo')}</p>
              )}
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
          isLabResultCheckTest
            ? <LabResultCheckModal test={test} onClose={() => setModalOpen(false)} triggerRef={ctaRef} />
            : <HomeServiceModal test={test} onClose={() => setModalOpen(false)} triggerRef={ctaRef} />
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

        /* ── CTA card ──────────────────────────────────────────────────── */
        .td-cta {
          display: flex;
          align-items: center;
          gap: 18px;
          width: 100%;
          background: #fff;
          border: 1px solid ${BORDER};
          border-radius: 10px;
          padding: 18px 24px;
          margin-bottom: 28px;
          box-sizing: border-box;
        }
        .td-cta-icon {
          flex-shrink: 0;
          width: 40px; height: 40px;
          border-radius: 50%;
          border: 1.5px solid rgba(0,132,142,0.35);
          display: flex; align-items: center; justify-content: center;
        }
        .td-cta-text {
          flex: 1 1 auto;
          min-width: 0;
          margin: 0;
          font-size: 14px;
          line-height: 1.6;
          color: #334155;
        }
        .td-cta-price {
          flex-shrink: 0;
          font-size: 22px;
          font-weight: 700;
          color: ${NAVY};
          white-space: nowrap;
        }
        .td-cta-currency { font-size: 13px; font-weight: 400; color: ${MUTED}; }
        .td-cta-btn {
          flex-shrink: 0;
          padding: 11px 24px;
          border-radius: 8px;
          border: none;
          background: ${TEAL};
          color: white;
          font-size: 14px;
          font-weight: 700;
          font-family: ${FONT};
          cursor: pointer;
          white-space: nowrap;
        }
        .td-cta-btn:hover { background: #006b74; }

        /* ── Tabs ──────────────────────────────────────────────────────── */
        .td-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 0;
          overflow-x: auto;
        }
        .td-tab {
          background: #fff;
          border: 1px solid ${BORDER};
          border-top: 3px solid ${BORDER};
          cursor: pointer;
          font-family: ${FONT};
          font-size: 14px;
          font-weight: 600;
          color: ${MUTED};
          padding: 13px 22px;
          white-space: nowrap;
        }
        .td-tab-active { color: ${TEAL}; border-top-color: ${TEAL}; }
        .td-tab:focus-visible { outline: 2px solid ${TEAL}; outline-offset: 2px; }

        .td-panel {
          background: #fff;
          border: 1px solid ${BORDER};
          border-radius: 0 10px 10px 10px;
          padding: 28px 32px;
          margin-top: -1px;
        }

        .td-paragraph { font-size: 15px; color: #334155; line-height: 1.75; margin: 0 0 18px; }
        .td-paragraph:last-child { margin-bottom: 0; }
        .td-empty { font-size: 14px; color: ${MUTED}; margin: 0; }

        .td-section-heading {
          font-size: 17px; font-weight: 700; color: ${NAVY};
          font-family: 'Raleway', sans-serif; margin: 24px 0 12px;
        }
        .td-section-heading-first { margin-top: 0; }

        .td-dash-list, .td-numbered-list {
          margin: 0 0 18px; padding-left: 20px; color: #334155; font-size: 15px; line-height: 1.7;
        }
        .td-dash-list { list-style: none; padding-left: 0; }
        .td-dash-list li { position: relative; padding-left: 20px; margin-bottom: 8px; }
        .td-dash-list li::before { content: '–'; position: absolute; left: 0; color: ${TEAL}; font-weight: 700; }
        .td-numbered-list li { margin-bottom: 8px; }

        .td-notice {
          margin-top: 8px;
          background: #F8FAFC;
          border-left: 3px solid ${TEAL};
          border-radius: 0 8px 8px 0;
          padding: 14px 18px;
          font-size: 13.5px;
          color: #475569;
          line-height: 1.65;
        }

        /* ── Technical table ──────────────────────────────────────────── */
        .td-dl { margin: 0; display: grid; gap: 0; }
        .td-dl-row {
          display: flex; align-items: baseline; gap: 8px;
          padding: 12px 0; border-bottom: 1px solid #F1F5F9;
        }
        .td-dl-row:last-child { border-bottom: none; }
        .td-dl dt { font-size: 14px; color: #334155; font-weight: 500; white-space: nowrap; flex-shrink: 0; }
        .td-dl-leader {
          flex: 1 1 auto; min-width: 16px; height: 0;
          border-bottom: 1px dotted #CBD5E1;
          transform: translateY(-3px);
        }
        .td-dl dd { margin: 0; font-size: 14px; color: #172033; font-weight: 700; white-space: nowrap; flex-shrink: 0; text-align: right; }

        /* ── Reference chips ──────────────────────────────────────────── */
        .td-chip-row { display: flex; gap: 10px; flex-wrap: wrap; margin: 0 0 18px; }
        .td-chip {
          padding: 7px 16px; border-radius: 999px; border: 1px solid ${BORDER};
          background: #F8FAFB; font-size: 13px; font-weight: 600; color: #334155;
        }

        @media (max-width: 1100px) {
          .td-wrap { padding: 44px 24px 0; }
        }

        @media (max-width: 768px) {
          .td-wrap { padding: 32px 16px 0; }
          .td-panel { padding: 22px 20px; }

          .td-cta { flex-direction: column; align-items: flex-start; padding: 18px 20px; }
          .td-cta-text { order: 2; }
          .td-cta-price { order: 3; }
          .td-cta-btn { order: 4; width: 100%; text-align: center; }

          .td-dl-row { flex-direction: column; align-items: flex-start; gap: 2px; }
          .td-dl-leader { display: none; }
          .td-dl dd { text-align: left; white-space: normal; }
        }
      `}</style>
    </main>
  );
}
