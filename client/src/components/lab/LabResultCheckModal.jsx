import { useState, useEffect, useRef, useId } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import api from '../../api/axios';

const FONT = "'Source Sans 3', 'Raleway', sans-serif";
const TEAL = '#00848e';
const NAVY = '#071B3B';
const MUTED = '#62718A';

const FIN_RX = /^[A-Za-z0-9]{5,8}$/;

const FLAG_COLOR = { normal: '#15803d', low: '#c2410c', high: '#c2410c', critical: '#b91c1c', pending: '#64748b' };
const FLAG_BG    = { normal: '#dcfce7', low: '#ffedd5', high: '#ffedd5', critical: '#fee2e2', pending: '#f1f5f9' };

function formatDateDisplay(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('az-AZ', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

/**
 * Standalone FIN + protocol lookup modal for a single test (POST /lab-results/test-status).
 * Not currently wired into any page — preserved for potential reuse. See
 * TestDetailPage.jsx for the Fox Qida Həssaslığı Testi flow, which now routes
 * "Nəticəni yoxla" to the general /e-netice page instead of this modal.
 */
export default function LabResultCheckModal({ test, onClose, triggerRef }) {
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
