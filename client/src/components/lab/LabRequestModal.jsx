import { useState, useEffect, useRef, useId } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const FONT = "'Source Sans 3', 'Raleway', sans-serif";
const TEAL = '#00848e';
const NAVY = '#071B3B';
const MUTED = '#62718A';

const BRANCHES = [
  'Aslan Medical — Xətai',
  'Aslan Medical — Vadi İstanbul',
  'Aslan Medical — Ankara',
];

const FIN_RX = /^[A-Za-z0-9]{5,8}$/;
const PHONE_RX = /^[+]?[\d\s()-]{7,20}$/;
const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const todayStr = () => new Date().toISOString().split('T')[0];

const fmtPrice = (price) =>
  Number.isInteger(Number(price)) ? String(Math.round(price)) : Number(price).toFixed(2);

const labelStyle = { fontSize: 13, fontWeight: 600, color: '#111827', display: 'block', marginBottom: 5, fontFamily: FONT };
const inputStyle = {
  width: '100%', height: 38, padding: '0 14px', border: '1px solid #d1d5db', borderRadius: 10,
  fontSize: 13.5, fontFamily: FONT, outline: 'none', boxSizing: 'border-box', background: 'white', color: '#1f2937',
};
const errStyle = { color: '#ef4444', fontSize: 12, marginTop: 4 };

function StepDots({ step, total }) {
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} style={{
          flex: 1, height: 4, borderRadius: 4,
          background: i < step ? TEAL : '#e2e8f0',
        }} />
      ))}
    </div>
  );
}

export default function LabRequestModal({ test, onClose, triggerRef }) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const titleId = useId();
  const dialogRef = useRef(null);

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successData, setSuccessData] = useState(null);

  // Step 1
  const [agreed, setAgreed] = useState(false);
  const [agreeError, setAgreeError] = useState('');

  // Step 2
  const [patientType, setPatientType] = useState('existing');
  const [existingCardNumber, setExistingCardNumber] = useState('');
  const [lookupStatus, setLookupStatus] = useState('idle'); // idle | checking | found | error
  const [maskedName, setMaskedName] = useState('');
  const [newPatient, setNewPatient] = useState({ firstName: '', lastName: '', fin: '', birthDate: '', phone: '', email: '' });
  const [step2Errors, setStep2Errors] = useState({});

  // Step 3
  const [branchName, setBranchName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [note, setNote] = useState('');
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState('');
  const [step3Errors, setStep3Errors] = useState({});

  useEffect(() => {
    const onKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKeyDown);
    const triggerEl = triggerRef?.current;
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      triggerEl?.focus?.();
    };
  }, [onClose, triggerRef]);

  const redirectToLogin = () => {
    onClose();
    navigate('/login', {
      state: { from: `${location.pathname}${location.search}` },
    });
  };

  const selectExistingPatient = () => {
    if (!isAuthenticated) {
      redirectToLogin();
      return;
    }
    setPatientType('existing');
    setStep2Errors({});
  };

  // Existing patient profile — resolved from the authenticated session
  useEffect(() => {
    let isCurrent = true;

    const loadPatientProfile = async () => {
      setLookupStatus('checking');
      try {
        const res = await api.get('/lab-results/requests/current-patient');
        if (!isCurrent) return;
        const data = res.data?.data;
        if (data?.cardNumber) {
          setLookupStatus('found');
          setExistingCardNumber(data.cardNumber);
          setMaskedName(data.maskedName || '');
        } else {
          setLookupStatus('error');
          setExistingCardNumber('');
          setMaskedName('');
        }
      } catch {
        if (isCurrent) {
          setLookupStatus('error');
          setExistingCardNumber('');
          setMaskedName('');
        }
      }
    };

    const reset = () => {
      setLookupStatus('idle');
      setExistingCardNumber('');
      setMaskedName('');
    };

    if (patientType !== 'existing' || !isAuthenticated) {
      reset();
      return () => { isCurrent = false; };
    }

    loadPatientProfile();
    return () => { isCurrent = false; };
  }, [patientType, isAuthenticated]);

  // Slot availability — fetch when branch+date chosen
  useEffect(() => {
    let isCurrent = true;

    const loadSlots = async () => {
      setSlotsLoading(true);
      setSlotsError('');
      try {
        const res = await api.get('/lab-results/requests/slots', { params: { branchName, date } });
        if (!isCurrent) return;
        const data = res.data?.data;
        if (!data?.available) {
          setSlots([]);
          setSlotsError(data?.reason || t('labRequest.noSlots'));
        } else {
          setSlots(data.slots || []);
          if (time && !data.slots?.some((s) => s.time === time && s.available)) setTime('');
        }
      } catch {
        if (isCurrent) { setSlots([]); setSlotsError(t('labRequest.genericError')); }
      } finally {
        if (isCurrent) setSlotsLoading(false);
      }
    };

    const clearSlots = () => setSlots([]);
    if (!branchName || !date) { clearSlots(); return () => { isCurrent = false; }; }
    loadSlots();
    return () => { isCurrent = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchName, date]);

  const tech = test.technicalDetails || {};

  const validateStep1 = () => {
    if (!agreed) { setAgreeError(t('labRequest.agreementRequired')); return false; }
    setAgreeError('');
    return true;
  };

  const validateStep2 = () => {
    const errs = {};
    if (patientType === 'existing') {
      if (!isAuthenticated) {
        redirectToLogin();
        return false;
      }
      if (lookupStatus !== 'found' || !existingCardNumber) {
        errs.lookup = lookupStatus === 'checking'
          ? t('labRequest.step2.checking')
          : t('labRequest.step2.profileNotFoundText');
      }
    } else {
      if (!newPatient.firstName.trim()) errs.firstName = t('labRequest.firstNameRequired');
      if (!newPatient.lastName.trim()) errs.lastName = t('labRequest.lastNameRequired');
      if (!newPatient.fin.trim() || !FIN_RX.test(newPatient.fin.trim())) errs.fin = t('labRequest.finInvalid');
      if (!newPatient.birthDate) errs.birthDate = t('labRequest.birthDateRequired');
      if (!newPatient.phone.trim() || !PHONE_RX.test(newPatient.phone.trim())) errs.phone = t('labRequest.phoneInvalid');
      if (newPatient.email.trim() && !EMAIL_RX.test(newPatient.email.trim())) errs.email = t('labRequest.emailInvalid');
    }
    setStep2Errors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep3 = () => {
    const errs = {};
    if (!branchName) errs.branchName = t('labRequest.branchRequired');
    if (!date) errs.date = t('labRequest.dateRequired');
    else if (date < todayStr()) errs.date = t('labRequest.dateRequired');
    if (!time) errs.time = t('labRequest.timeRequired');
    setStep3Errors(errs);
    return Object.keys(errs).length === 0;
  };

  const goNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;
    setStep((s) => Math.min(4, s + 1));
  };
  const goBack = () => setStep((s) => Math.max(1, s - 1));

  const handleConfirm = async () => {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const payload = {
        testSlug: test.slug,
        patientType,
        branchName,
        date,
        time,
        note: note.trim(),
        agreedToTerms: agreed,
      };
      if (patientType === 'new') {
        payload.patient = {
          firstName: newPatient.firstName.trim(),
          lastName:  newPatient.lastName.trim(),
          fin:       newPatient.fin.trim().toUpperCase(),
          birthDate: newPatient.birthDate,
          phone:     newPatient.phone.trim(),
          email:     newPatient.email.trim(),
        };
      }
      const res = await api.post('/lab-results/requests', payload);
      setSuccessData(res.data?.data || null);
    } catch (err) {
      const status = err.response?.status;
      const message = patientType === 'existing' && status === 401
        ? t('labRequest.step2.loginRequiredText')
        : patientType === 'existing' && status === 404
          ? t('labRequest.step2.profileNotFoundText')
          : err.response?.data?.message || t('labRequest.genericError');
      setSubmitError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const patientDisplayName = patientType === 'new'
    ? `${newPatient.firstName.trim()} ${newPatient.lastName.trim()}`.trim()
    : maskedName;

  return (
    <div className="hsm-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={dialogRef} className="hsm-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 id={titleId} style={{ margin: 0, fontSize: 18, fontWeight: 700, color: NAVY, fontFamily: "'Raleway', sans-serif" }}>
            {t('labRequest.title')}
          </h2>
          <button type="button" onClick={onClose} aria-label={t('labRequest.closeButton')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 22, lineHeight: 1 }}>×</button>
        </div>

        {!successData && <StepDots step={step} total={4} />}

        {successData ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontFamily: FONT }}>
            <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 14, padding: 20 }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#15803d', margin: '0 0 6px' }}>{t('labRequest.successTitle')}</p>
              <p style={{ fontSize: 13.5, color: '#166534', margin: 0 }}>
                {t('labRequest.requestNumberLabel')}: <strong>{successData.requestNumber}</strong>
              </p>
            </div>

            <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px', margin: 0 }}>
              <div>
                <dt style={{ fontSize: 11.5, color: MUTED, margin: '0 0 2px' }}>{t('labRequest.summaryTestLabel')}</dt>
                <dd style={{ fontSize: 13.5, fontWeight: 600, color: NAVY, margin: 0 }}>{successData.testName}</dd>
              </div>
              <div>
                <dt style={{ fontSize: 11.5, color: MUTED, margin: '0 0 2px' }}>{t('labRequest.summaryBranchLabel')}</dt>
                <dd style={{ fontSize: 13.5, fontWeight: 600, color: NAVY, margin: 0 }}>{successData.branchName}</dd>
              </div>
              <div>
                <dt style={{ fontSize: 11.5, color: MUTED, margin: '0 0 2px' }}>{t('labRequest.summaryDateTimeLabel')}</dt>
                <dd style={{ fontSize: 13.5, fontWeight: 600, color: NAVY, margin: 0 }}>{successData.date} {successData.time}</dd>
              </div>
              {successData.preparation && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <dt style={{ fontSize: 11.5, color: MUTED, margin: '0 0 2px' }}>{t('labRequest.step1.preparationLabel')}</dt>
                  <dd style={{ fontSize: 13, color: '#334155', margin: 0, lineHeight: 1.5 }}>{successData.preparation}</dd>
                </div>
              )}
            </dl>

            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 14px', fontSize: 12.5, color: '#92400e', lineHeight: 1.5 }}>
              {t('labRequest.protocolNotice')}
            </div>

            <button type="button" onClick={onClose}
              style={{ marginTop: 4, alignSelf: 'flex-end', padding: '9px 20px', borderRadius: 9, border: 'none', background: TEAL, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              {t('labRequest.closeButton')}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontFamily: FONT }}>

            {step === 1 && (
              <div>
                <h3 style={{ fontSize: 14.5, fontWeight: 700, color: NAVY, margin: '0 0 10px' }}>{t('labRequest.step1.title')}</h3>
                {test.shortDescription && (
                  <p style={{ fontSize: 13, color: '#334155', margin: '0 0 12px', lineHeight: 1.6 }}>{test.shortDescription}</p>
                )}
                <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', margin: '0 0 12px' }}>
                  {tech.sampleType && (
                    <div>
                      <dt style={{ fontSize: 11.5, color: MUTED, margin: '0 0 2px' }}>{t('labRequest.step1.sampleTypeLabel')}</dt>
                      <dd style={{ fontSize: 13, fontWeight: 600, color: NAVY, margin: 0 }}>{tech.sampleType}</dd>
                    </div>
                  )}
                  {tech.turnaround && (
                    <div>
                      <dt style={{ fontSize: 11.5, color: MUTED, margin: '0 0 2px' }}>{t('labRequest.step1.turnaroundLabel')}</dt>
                      <dd style={{ fontSize: 13, fontWeight: 600, color: NAVY, margin: 0 }}>{tech.turnaround}</dd>
                    </div>
                  )}
                  <div>
                    <dt style={{ fontSize: 11.5, color: MUTED, margin: '0 0 2px' }}>{t('labRequest.step1.priceLabel')}</dt>
                    <dd style={{ fontSize: 13, fontWeight: 600, color: NAVY, margin: 0 }}>{fmtPrice(test.price)} {test.currency || 'AZN'}</dd>
                  </div>
                </dl>
                {tech.preparation && (
                  <div style={{ marginBottom: 12 }}>
                    <p style={{ fontSize: 11.5, color: MUTED, margin: '0 0 2px' }}>{t('labRequest.step1.preparationLabel')}</p>
                    <p style={{ fontSize: 13, color: '#334155', margin: 0, lineHeight: 1.6 }}>{tech.preparation}</p>
                  </div>
                )}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', fontSize: 12.5, color: '#475569', lineHeight: 1.6, marginBottom: 14 }}>
                  {t('labRequest.step1.clinicVisitNotice')}
                </div>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, cursor: 'pointer', fontSize: 12.5, color: '#334155', lineHeight: 1.5 }}>
                  <input type="checkbox" checked={agreed} onChange={(e) => { setAgreed(e.target.checked); setAgreeError(''); }}
                    style={{ width: 14, height: 14, marginTop: 2, accentColor: TEAL, cursor: 'pointer', flexShrink: 0 }} />
                  <span>{t('labRequest.step1.agreementCheckbox')}</span>
                </label>
                {agreeError && <div style={errStyle}>{agreeError}</div>}
              </div>
            )}

            {step === 2 && (
              <div>
                <h3 style={{ fontSize: 14.5, fontWeight: 700, color: NAVY, margin: '0 0 10px' }}>{t('labRequest.step2.title')}</h3>

                <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                  <button type="button" onClick={selectExistingPatient}
                    style={{
                      flex: 1, padding: '9px 12px', borderRadius: 9, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                      border: patientType === 'existing' ? `1.5px solid ${TEAL}` : '1px solid #d1d5db',
                      background: patientType === 'existing' ? 'rgba(0,132,142,0.08)' : 'white',
                      color: patientType === 'existing' ? TEAL : '#475569',
                    }}>
                    {t('labRequest.step2.existingPatientOption')}
                  </button>
                  <button type="button" onClick={() => setPatientType('new')}
                    style={{
                      flex: 1, padding: '9px 12px', borderRadius: 9, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                      border: patientType === 'new' ? `1.5px solid ${TEAL}` : '1px solid #d1d5db',
                      background: patientType === 'new' ? 'rgba(0,132,142,0.08)' : 'white',
                      color: patientType === 'new' ? TEAL : '#475569',
                    }}>
                    {t('labRequest.step2.newPatientOption')}
                  </button>
                </div>

                {patientType === 'existing' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <label style={labelStyle}>{t('labRequest.step2.cardNumberLabel')}</label>
                      <input
                        type="text"
                        value={existingCardNumber}
                        readOnly
                        aria-readonly="true"
                        placeholder={t('labRequest.step2.cardNumberPlaceholder')}
                        style={{ ...inputStyle, background: '#f1f5f9', color: '#475569', cursor: 'default' }}
                      />
                    </div>

                    {!isAuthenticated && (
                      <div style={errStyle}>{t('labRequest.step2.loginRequiredText')}</div>
                    )}
                    {isAuthenticated && lookupStatus === 'checking' && (
                      <div style={{ fontSize: 12.5, color: MUTED }}>{t('labRequest.step2.checking')}</div>
                    )}
                    {isAuthenticated && lookupStatus === 'found' && (
                      <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 9, padding: '8px 12px', fontSize: 12.5, color: '#15803d' }}>
                        {t('labRequest.step2.patientFoundLabel')} <strong>{maskedName}</strong>
                      </div>
                    )}
                    {isAuthenticated && lookupStatus === 'error' && (
                      <div style={errStyle}>{t('labRequest.step2.profileNotFoundText')}</div>
                    )}
                    {step2Errors.lookup && <div style={errStyle}>{step2Errors.lookup}</div>}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <label style={labelStyle}>{t('labRequest.step2.firstNameLabel')} *</label>
                        <input type="text" value={newPatient.firstName}
                          onChange={(e) => setNewPatient((f) => ({ ...f, firstName: e.target.value }))} style={inputStyle} />
                        {step2Errors.firstName && <div style={errStyle}>{step2Errors.firstName}</div>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={labelStyle}>{t('labRequest.step2.lastNameLabel')} *</label>
                        <input type="text" value={newPatient.lastName}
                          onChange={(e) => setNewPatient((f) => ({ ...f, lastName: e.target.value }))} style={inputStyle} />
                        {step2Errors.lastName && <div style={errStyle}>{step2Errors.lastName}</div>}
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>{t('labRequest.step2.finLabel')} *</label>
                      <input type="text" value={newPatient.fin}
                        onChange={(e) => setNewPatient((f) => ({ ...f, fin: e.target.value }))} style={inputStyle} />
                      {step2Errors.fin && <div style={errStyle}>{step2Errors.fin}</div>}
                    </div>
                    <div>
                      <label style={labelStyle}>{t('labRequest.step2.birthDateLabel')} *</label>
                      <input type="date" value={newPatient.birthDate} max={todayStr()}
                        onChange={(e) => setNewPatient((f) => ({ ...f, birthDate: e.target.value }))} style={inputStyle} />
                      {step2Errors.birthDate && <div style={errStyle}>{step2Errors.birthDate}</div>}
                    </div>
                    <div>
                      <label style={labelStyle}>{t('labRequest.step2.phoneLabel')} *</label>
                      <input type="tel" value={newPatient.phone}
                        onChange={(e) => setNewPatient((f) => ({ ...f, phone: e.target.value }))} style={inputStyle} />
                      {step2Errors.phone && <div style={errStyle}>{step2Errors.phone}</div>}
                    </div>
                    <div>
                      <label style={labelStyle}>{t('labRequest.step2.emailLabel')}</label>
                      <input type="email" value={newPatient.email}
                        onChange={(e) => setNewPatient((f) => ({ ...f, email: e.target.value }))} style={inputStyle} />
                      {step2Errors.email && <div style={errStyle}>{step2Errors.email}</div>}
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <h3 style={{ fontSize: 14.5, fontWeight: 700, color: NAVY, margin: '0 0 4px' }}>{t('labRequest.step3.title')}</h3>

                <div>
                  <label style={labelStyle}>{t('labRequest.step3.branchLabel')} *</label>
                  <select value={branchName} onChange={(e) => { setBranchName(e.target.value); setTime(''); }} style={inputStyle}>
                    <option value="">{t('labRequest.step3.branchPlaceholder')}</option>
                    {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                  {step3Errors.branchName && <div style={errStyle}>{step3Errors.branchName}</div>}
                </div>

                <div>
                  <label style={labelStyle}>{t('labRequest.step3.dateLabel')} *</label>
                  <input type="date" value={date} min={todayStr()}
                    onChange={(e) => { setDate(e.target.value); setTime(''); }} style={inputStyle} />
                  {step3Errors.date && <div style={errStyle}>{step3Errors.date}</div>}
                </div>

                <div>
                  <label style={labelStyle}>{t('labRequest.step3.timeLabel')} *</label>
                  <select value={time} onChange={(e) => setTime(e.target.value)} disabled={!branchName || !date || slotsLoading} style={inputStyle}>
                    <option value="">{t('labRequest.step3.timePlaceholder')}</option>
                    {slots.map((s) => (
                      <option key={s.time} value={s.time} disabled={!s.available}>
                        {s.time}{!s.available ? ' —' : ''}
                      </option>
                    ))}
                  </select>
                  {slotsError && <div style={errStyle}>{slotsError}</div>}
                  {step3Errors.time && <div style={errStyle}>{step3Errors.time}</div>}
                </div>

                <div>
                  <label style={labelStyle}>{t('labRequest.step3.noteLabel')}</label>
                  <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
                    style={{ ...inputStyle, height: 'auto', padding: '10px 14px', resize: 'none' }} />
                </div>
              </div>
            )}

            {step === 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <h3 style={{ fontSize: 14.5, fontWeight: 700, color: NAVY, margin: '0 0 4px' }}>{t('labRequest.step4.title')}</h3>
                <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px', margin: 0 }}>
                  <div>
                    <dt style={{ fontSize: 11.5, color: MUTED, margin: '0 0 2px' }}>{t('labRequest.summaryTestLabel')}</dt>
                    <dd style={{ fontSize: 13.5, fontWeight: 600, color: NAVY, margin: 0 }}>{test.name}</dd>
                  </div>
                  <div>
                    <dt style={{ fontSize: 11.5, color: MUTED, margin: '0 0 2px' }}>{t('labRequest.summaryPatientLabel')}</dt>
                    <dd style={{ fontSize: 13.5, fontWeight: 600, color: NAVY, margin: 0 }}>{patientDisplayName || '—'}</dd>
                  </div>
                  <div>
                    <dt style={{ fontSize: 11.5, color: MUTED, margin: '0 0 2px' }}>{t('labRequest.summaryBranchLabel')}</dt>
                    <dd style={{ fontSize: 13.5, fontWeight: 600, color: NAVY, margin: 0 }}>{branchName}</dd>
                  </div>
                  <div>
                    <dt style={{ fontSize: 11.5, color: MUTED, margin: '0 0 2px' }}>{t('labRequest.summaryDateTimeLabel')}</dt>
                    <dd style={{ fontSize: 13.5, fontWeight: 600, color: NAVY, margin: 0 }}>{date} {time}</dd>
                  </div>
                  <div>
                    <dt style={{ fontSize: 11.5, color: MUTED, margin: '0 0 2px' }}>{t('labRequest.summaryPriceLabel')}</dt>
                    <dd style={{ fontSize: 13.5, fontWeight: 600, color: NAVY, margin: 0 }}>{fmtPrice(test.price)} {test.currency || 'AZN'}</dd>
                  </div>
                </dl>
                {submitError && <div style={errStyle}>{submitError}</div>}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', marginTop: 4 }}>
              <button type="button" onClick={step === 1 ? onClose : goBack}
                style={{ padding: '9px 18px', borderRadius: 9, border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                {step === 1 ? t('labRequest.cancelButton') : t('labRequest.backButton')}
              </button>

              {step < 4 ? (
                <button type="button" onClick={goNext}
                  style={{ padding: '9px 22px', borderRadius: 9, border: 'none', background: TEAL, color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  {t('labRequest.nextButton')}
                </button>
              ) : (
                <button type="button" onClick={handleConfirm} disabled={submitting}
                  style={{
                    padding: '9px 22px', borderRadius: 9, border: 'none',
                    background: submitting ? '#94a3b8' : TEAL, color: 'white', fontSize: 13, fontWeight: 700,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                  }}>
                  {submitting ? t('labRequest.submitting') : t('labRequest.confirmButton')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .hsm-overlay {
          position: fixed; inset: 0; background: rgba(7,27,59,0.45); z-index: 1100;
          display: flex; align-items: center; justify-content: center; padding: 16px;
        }
        .hsm-dialog {
          background: white; border-radius: 16px; width: 100%; max-width: 520px;
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
