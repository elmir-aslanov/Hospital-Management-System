import usePageTitle from '../../hooks/usePageTitle'
import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import api from '../../api/axios';
import { useBreakpoint } from '../../hooks/useBreakpoint';

const BASE  = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';
const FONT  = "'Source Sans 3', 'Raleway', sans-serif";
const NAVY  = '#0a1628';
const TEAL  = '#00848e';
const CLINIC_HOURS = {
  weekday: { start: '09:00', end: '20:00', slotDuration: 30 },
  saturday: { start: '09:00', end: '18:00', slotDuration: 30 },
  sunday: null,
};
const formatLocalDate = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};
const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};
const getToday = () => formatLocalDate();
const getMaxDate = () => formatLocalDate(addDays(new Date(), 90));
const timeToMinutes = (time) => {
  const [h, m] = String(time || '').split(':').map(Number);
  return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : null;
};
const parseLocalDate = (date) => {
  const [y, m, d] = String(date || '').split('-').map(Number);
  return Number.isFinite(y) && Number.isFinite(m) && Number.isFinite(d)
    ? new Date(y, m - 1, d)
    : null;
};
const getDayOfWeek = (date) => parseLocalDate(date)?.getDay();
const isToday = (date) => date === getToday();
const isPastDate = (date) => !!date && date < getToday();
const isPastTimeToday = (date, time) => {
  if (!isToday(date)) return false;
  const minutes = timeToMinutes(time);
  const now = new Date();
  return minutes !== null && minutes <= now.getHours() * 60 + now.getMinutes();
};
const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
const clinicWindowForDate = (date) => {
  if (!date) return null;
  const day = getDayOfWeek(date);
  if (day === 0) return CLINIC_HOURS.sunday;
  return day === 6 ? CLINIC_HOURS.saturday : CLINIC_HOURS.weekday;
};
const generateTimeSlots = (start, end, step = 30) => {
  const slots = [];
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);
  if (startMinutes === null || endMinutes === null || startMinutes >= endMinutes) return slots;
  for (let minutes = startMinutes; minutes < endMinutes; minutes += step) {
    slots.push(`${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`);
  }
  return slots;
};
const getFallbackSlots = (date) => {
  const window = clinicWindowForDate(date);
  return window ? generateTimeSlots(window.start, window.end, window.slotDuration).map(time => ({ time, available: true })) : [];
};
const normalizeAvailabilitySlots = (slots = []) => slots
  .map(slot => {
    if (typeof slot === 'string') return { time: slot, available: true };
    const time = slot?.time || slot?.startTime || slot?.value;
    if (!time) return null;
    return { time, available: slot?.available !== false && slot?.isAvailable !== false && slot?.booked !== true };
  })
  .filter(Boolean);
const hasNoDoctorSchedule = (availability) => /no schedule/i.test(String(availability?.reason || ''));
const filterPastSlots = (date, slots) => slots.map(slot => ({
  ...slot,
  available: slot.available && !isPastTimeToday(date, slot.time),
}));

/* ── tiny helpers ─────────────────────────────────────────────── */
function addMinutes(time, mins) {
  const [h, m] = time.split(':').map(Number);
  const total  = h * 60 + m + mins;
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}
const getUser = () => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } };
const formatPhoneInput = (value) => value
  .replace(/[^\d+]/g, '')
  .replace(/(?!^)\+/g, '')
  .slice(0, 13);

/* ── shared atoms ─────────────────────────────────────────────── */
const iStyle = {
  border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '12px 14px',
  fontSize: 14, width: '100%', outline: 'none', fontFamily: FONT,
  boxSizing: 'border-box', transition: 'border-color .18s', background: '#fff',
};
const lStyle = { fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block', fontFamily: FONT };
const focusB = e => (e.target.style.borderColor = TEAL);
const blurB  = e => (e.target.style.borderColor = '#e2e8f0');

function Field({ label, children }) {
  return <div><label style={lStyle}>{label}</label>{children}</div>;
}
function IconCircle({ children }) {
  return (
    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 20 }}>
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   STEP INDICATOR
════════════════════════════════════════════════════════════════ */
const STEPS = ['personal', 'details', 'confirm'];

function StepIndicator({ current, t }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
      {STEPS.map((stepKey, i) => {
        const num      = i + 1;
        const done     = num < current;
        const active   = num === current;
        const circleColor = done || active ? TEAL : '#e2e8f0';
        const textColor   = active ? NAVY : done ? TEAL : '#94a3b8';
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : undefined }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', border: `2px solid ${circleColor}`,
                background: done || active ? circleColor : 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, color: done || active ? 'white' : '#94a3b8',
                transition: 'all .2s', flexShrink: 0,
              }}>
                {done ? '✓' : num}
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: textColor, fontFamily: FONT, whiteSpace: 'nowrap' }}>
                {t(`randevuPage.steps.${stepKey}`)}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: 2, background: done ? TEAL : '#e2e8f0', margin: '0 6px', marginBottom: 20, transition: 'background .2s' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   GUEST FORM (3 steps)
════════════════════════════════════════════════════════════════ */
function GuestForm({ doctors, loadingDoctors, preselectedDoctorId, navigate, t }) {
  const today = getToday();
  const maxDate = getMaxDate();
  const [step,      setStep]      = useState(1);
  const [name,      setName]      = useState('');
  const [email,     setEmail]     = useState('');
  const [phone,     setPhone]     = useState('');
  const [doctorId,  setDoctorId]  = useState(preselectedDoctorId || '');
  const [date,      setDate]      = useState('');
  const [time,      setTime]      = useState('');
  const [reason,    setReason]    = useState('');
  const [sending,   setSending]   = useState(false);
  const [err,       setErr]       = useState('');
  const [done,      setDone]      = useState(false);
  const [availability, setAvailability] = useState(null);

  const doctor = doctors.find(d => d._id === doctorId);
  const doctorName = doctor
    ? `${doctor.userId?.fullName || ''} — ${doctor.specialization || ''}`.trim().replace(/^—|—$/, '').trim()
    : t('randevuPage.noDoctor');
  const dayWindow = clinicWindowForDate(date);
  const availabilityMatches = availability?.doctorId === doctorId && availability?.date === date;
  const availabilitySlots = availability?.slots;
  const shouldBlockByAvailability = availabilityMatches && availability?.available === false && doctorId && !hasNoDoctorSchedule(availability);
  const rawSlots = useMemo(() => {
    if (availabilityMatches && availability?.available !== false && availabilitySlots?.length) {
      return normalizeAvailabilitySlots(availabilitySlots);
    }
    return getFallbackSlots(date);
  }, [availabilityMatches, availability?.available, availabilitySlots, date]);
  const timeSlots = useMemo(() => filterPastSlots(date, rawSlots), [date, rawSlots]);
  const availableTimeValues = useMemo(() => new Set(timeSlots.filter(slot => slot.available).map(slot => slot.time)), [timeSlots]);
  const closedDateMessage = date && !dayWindow
    ? t('randevuPage.validation.sundayClosed')
    : shouldBlockByAvailability
      ? t('randevuPage.validation.doctorUnavailable')
      : '';

  useEffect(() => {
    if (!date || !doctorId) return;

    let cancelled = false;
    api.get(`/doctors/${doctorId}/availability`, { params: { date } })
      .then(res => {
        if (!cancelled) setAvailability({ ...(res.data?.data || res.data || {}), doctorId, date });
      })
      .catch(() => {
        if (!cancelled) setAvailability({ doctorId, date, available: true, slots: [] });
      });

    return () => { cancelled = true; };
  }, [date, doctorId]);

  /* step validation */
  const validateStep1 = () => {
    if (!name.trim())  { setErr(t('randevuPage.validation.fullNameRequired')); return false; }
    if (!email.trim()) { setErr(t('randevuPage.validation.emailRequired')); return false; }
    if (!isValidEmail(email)) { setErr(t('randevuPage.validation.emailInvalid')); return false; }
    if (!phone.trim()) { setErr(t('randevuPage.validation.phoneRequired')); return false; }
    return true;
  };
  const validateStep2 = () => {
    if (!date) { setErr(t('randevuPage.validation.dateRequired')); return false; }
    if (isPastDate(date)) { setErr(t('randevuPage.pastDate')); return false; }
    if (date > maxDate) { setErr(t('randevuPage.validation.futureRange')); return false; }
    if (closedDateMessage) { setErr(closedDateMessage); return false; }
    if (!time) { setErr(t('randevuPage.timeRequired')); return false; }
    if (!availableTimeValues.has(time)) { setErr(t('randevuPage.validation.invalidWorkingTime')); return false; }
    if (isPastTimeToday(date, time)) { setErr(t('randevuPage.validation.pastTimeToday')); return false; }
    return true;
  };

  const next = () => {
    setErr('');
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(s => s + 1);
  };
  const back = () => { setErr(''); setStep(s => s - 1); };

  const handleSubmit = async () => {
    if (isPastDate(date)) {
      setErr(t('randevuPage.pastDate'));
      return;
    }
    if (date > maxDate) {
      setErr(t('randevuPage.validation.futureRange'));
      return;
    }
    if (closedDateMessage) {
      setErr(closedDateMessage);
      return;
    }
    if (!time) {
      setErr(t('randevuPage.timeRequired'));
      return;
    }
    if (!availableTimeValues.has(time)) {
      setErr(t('randevuPage.validation.invalidWorkingTime'));
      return;
    }
    if (isPastTimeToday(date, time)) {
      setErr(t('randevuPage.validation.pastTimeToday'));
      return;
    }
    setSending(true); setErr('');
    const message = [
      `Həkim: ${doctorName}`,
      `Tarix: ${date}`,
      `Vaxt: ${time}`,
      reason ? `Səbəb: ${reason}` : null,
    ].filter(Boolean).join(' | ');
    try {
      const r = await fetch(`${BASE}/api/v1/contact-messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, subject: 'Randevu Müraciəti', message }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.message || t('randevuPage.errors.generic'));
      setDone(true);
    } catch (e) { setErr(e.message); }
    finally { setSending(false); }
  };

  /* ── success screen ──────────────────────────────────────── */
  if (done) return (
    <div style={{ textAlign: 'center', maxWidth: 440, margin: '0 auto' }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 36 }}>
        ✅
      </div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: NAVY, margin: '0 0 10px', fontFamily: FONT }}>
        {t('randevuPage.success.guestTitle')}
      </h2>
      <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7, margin: '0 0 8px', fontFamily: FONT }}>
        {t('randevuPage.success.contactSoon')}
      </p>
      <p style={{ color: '#64748b', fontSize: 13, margin: '0 0 28px', fontFamily: FONT }}>
        {t('randevuPage.success.moreInfo')} <strong style={{ color: NAVY }}>+994 50 836 36 94</strong>
      </p>
      <div style={{ background: '#f8fafc', borderRadius: 12, padding: '16px 20px', textAlign: 'left', marginBottom: 28, border: '1px solid #e2e8f0' }}>
        {[[t('randevuPage.fields.fullName'), name], [t('randevuPage.fields.doctor'), doctorName], [t('randevuPage.fields.date'), date], [t('randevuPage.fields.time'), time]].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13, fontFamily: FONT }}>
            <span style={{ color: '#718096', fontWeight: 600 }}>{k}</span>
            <span style={{ color: NAVY, fontWeight: 700 }}>{v || t('randevuPage.noValue')}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button onClick={() => navigate('/login')}
          style={{ padding: 13, borderRadius: 12, border: 'none', background: `linear-gradient(135deg,${NAVY},${TEAL})`, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>
          {t('randevuPage.buttons.login')}
        </button>
        <button onClick={() => navigate('/register')}
          style={{ padding: 13, borderRadius: 12, border: `2px solid ${TEAL}`, background: '#fff', color: TEAL, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>
          {t('randevuPage.buttons.register')}
        </button>
      </div>
    </div>
  );

  /* ── form steps ──────────────────────────────────────────── */
  return (
    <>
      <div style={{ marginBottom: 28 }}>
        <button onClick={() => navigate('/')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20, background: 'none', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 600, color: '#64748b', cursor: 'pointer', fontFamily: FONT }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = TEAL; e.currentTarget.style.color = TEAL; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          {t('randevuPage.backHome')}
        </button>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: NAVY, margin: '0 0 4px', fontFamily: FONT }}>{t('randevuPage.orderTitle')}</h2>
        <p style={{ fontSize: 13, color: '#718096', margin: 0, fontFamily: FONT }}>{t('randevuPage.guestSubtitle')}</p>
      </div>

      <StepIndicator current={step} t={t} />

      {err && (
        <div style={{ background: '#fef2f2', color: '#dc2626', borderRadius: 10, padding: '11px 16px', fontSize: 13, marginBottom: 20, fontFamily: FONT }}>
          {err}
        </div>
      )}

      {/* ── STEP 1 ── */}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Field label={`${t('randevuPage.fields.fullName')} *`}>
            <input style={iStyle} value={name} onChange={e => setName(e.target.value)} placeholder={t('randevuPage.placeholders.fullName')} onFocus={focusB} onBlur={blurB} />
          </Field>
          <Field label={`${t('randevuPage.fields.email')} *`}>
            <input type="email" style={iStyle} value={email} onChange={e => setEmail(e.target.value)} placeholder={t('randevuPage.placeholders.email')} onFocus={focusB} onBlur={blurB} />
          </Field>
          <Field label={`${t('randevuPage.fields.phone')} *`}>
            <input
              style={iStyle}
              value={phone}
              onChange={e => setPhone(formatPhoneInput(e.target.value))}
              placeholder={t('randevuPage.phonePlaceholder')}
              onFocus={focusB}
              onBlur={blurB}
            />
          </Field>
        </div>
      )}

      {/* ── STEP 2 ── */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Field label={t('randevuPage.fields.doctorOptional')}>
            <select
              style={{ ...iStyle, appearance: 'none', cursor: 'pointer' }}
              value={doctorId}
              onChange={e => {
                setDoctorId(e.target.value);
                setTime('');
                setAvailability(null);
              }}
              onFocus={focusB}
              onBlur={blurB}
            >
              <option value="">{loadingDoctors ? t('randevuPage.placeholders.doctorLoading') : t('randevuPage.placeholders.doctorSelect')}</option>
              {doctors.map(d => (
                <option key={d._id} value={d._id}>
                  {d.userId?.fullName || d.fullName || d.name || t('randevuPage.fields.doctor')} — {d.specialization || d.specialty || ''}
                </option>
              ))}
            </select>
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label={`${t('randevuPage.fields.dateWanted')} *`}>
              <input
                type="date"
                style={iStyle}
                min={today}
                max={maxDate}
                value={date}
                onChange={e => {
                  const val = e.target.value;
                  if (val && (val < today || val > maxDate)) {
                    setDate('');
                    setTime('');
                    setAvailability(null);
                    return;
                  }
                  setDate(val);
                  setTime('');
                  setAvailability(null);
                }}
                onFocus={focusB}
                onBlur={blurB}
              />
            </Field>
            <Field label={`${t('randevuPage.fields.timeWanted')} *`}>
              <select
                value={time}
                onChange={e => setTime(e.target.value)}
                disabled={!date || !!closedDateMessage || availableTimeValues.size === 0}
                style={{ ...iStyle, appearance: 'none', cursor: !date || closedDateMessage || availableTimeValues.size === 0 ? 'not-allowed' : 'pointer', opacity: !date || closedDateMessage || availableTimeValues.size === 0 ? 0.72 : 1 }}
                onFocus={focusB}
                onBlur={blurB}
              >
                <option value="">{date ? t('randevuPage.selectTime') : t('randevuPage.selectDateFirst')}</option>
                {timeSlots.map(slot => (
                  <option key={slot.time} value={slot.time} disabled={!slot.available}>{slot.time}</option>
                ))}
              </select>
            </Field>
          </div>
          {closedDateMessage && (
            <div style={{ background: '#fef2f2', color: '#dc2626', borderRadius: 10, padding: '10px 14px', fontSize: 13, fontFamily: FONT }}>
              {closedDateMessage}
            </div>
          )}
          {date && !closedDateMessage && availableTimeValues.size === 0 && (
            <div style={{ background: '#fef2f2', color: '#dc2626', borderRadius: 10, padding: '10px 14px', fontSize: 13, fontFamily: FONT }}>
              {t('randevuPage.validation.noSlots')}
            </div>
          )}
          <Field label={t('randevuPage.fields.reason')}>
            <textarea rows={4} style={{ ...iStyle, resize: 'vertical', fontFamily: FONT }} value={reason} onChange={e => setReason(e.target.value)} placeholder={t('randevuPage.placeholders.reason')} onFocus={focusB} onBlur={blurB} />
          </Field>
        </div>
      )}

      {/* ── STEP 3 — summary ── */}
      {step === 3 && (
        <div>
          <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 20px', fontFamily: FONT }}>
            {t('randevuPage.summaryText')}
          </p>
          <div style={{ background: '#f8fafc', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: 8 }}>
            {[
              [`👤 ${t('randevuPage.fields.fullName')}`, name],
              [`✉️ ${t('randevuPage.fields.email')}`, email],
              [`📱 ${t('randevuPage.fields.phone')}`, phone],
              [`👨‍⚕️ ${t('randevuPage.fields.doctor')}`, doctorName],
              [`📅 ${t('randevuPage.fields.date')}`, date],
              [`🕐 ${t('randevuPage.fields.time')}`, time],
              [`📋 ${t('randevuPage.fields.reason')}`, reason || t('randevuPage.noValue')],
            ].map(([k, v], i, arr) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '13px 18px', borderBottom: i < arr.length - 1 ? '1px solid #f1f5f9' : 'none', gap: 12 }}>
                <span style={{ fontSize: 13, color: '#718096', fontWeight: 600, fontFamily: FONT, flexShrink: 0 }}>{k}</span>
                <span style={{ fontSize: 13, color: NAVY, fontWeight: 700, fontFamily: FONT, textAlign: 'right', wordBreak: 'break-word' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── nav buttons ── */}
      <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
        {step > 1 && (
          <button onClick={back}
            style={{ flex: 1, padding: 13, borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: FONT }}>
            {t('randevuPage.buttons.back')}
          </button>
        )}
        {step < 3 ? (
          <button onClick={next}
            style={{ flex: 1, padding: 13, borderRadius: 12, border: 'none', background: `linear-gradient(135deg,${NAVY},${TEAL})`, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>
            {t('randevuPage.buttons.next')}
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={sending || !!closedDateMessage}
            style={{ flex: 1, padding: 13, borderRadius: 12, border: 'none', background: sending || closedDateMessage ? '#9ca3af' : `linear-gradient(135deg,${NAVY},${TEAL})`, color: '#fff', fontSize: 15, fontWeight: 700, cursor: sending || closedDateMessage ? 'not-allowed' : 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            {sending ? (<><Spinner />{t('randevuPage.buttons.sending')}</>) : t('randevuPage.buttons.send')}
          </button>
        )}
      </div>

      <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 16, fontFamily: FONT }}>
        {t('randevuPage.authQuestion')}{' '}
        <span onClick={() => navigate('/login')} style={{ color: TEAL, fontWeight: 600, cursor: 'pointer' }}>{t('randevuPage.buttons.login')}</span>
      </p>
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
   LOGGED-IN FORM (existing logic, unchanged)
════════════════════════════════════════════════════════════════ */
function LoggedInForm({ doctors, loadingDoctors, isMobile, preselectedDoctorId, navigate, t }) {
  const user = getUser();
  const today = getToday();
  const maxDate = getMaxDate();
  const [form, setForm]         = useState({ name: '', email: '', phone: '', doctorId: preselectedDoctorId || '', startTime: '', date: '', reason: '' });
  const [submitting, setSubmit] = useState(false);
  const [booked, setBooked]     = useState(null);
  const [availability, setAvailability] = useState(null);

  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));
  const dayWindow = clinicWindowForDate(form.date);
  const availabilityMatches = availability?.doctorId === form.doctorId && availability?.date === form.date;
  const availabilitySlots = availability?.slots;
  const shouldBlockByAvailability = availabilityMatches && availability?.available === false && form.doctorId && !hasNoDoctorSchedule(availability);
  const rawSlots = useMemo(() => {
    if (availabilityMatches && availability?.available !== false && availabilitySlots?.length) {
      return normalizeAvailabilitySlots(availabilitySlots);
    }
    return getFallbackSlots(form.date);
  }, [availabilityMatches, availability?.available, availabilitySlots, form.date]);
  const timeSlots = useMemo(() => filterPastSlots(form.date, rawSlots), [form.date, rawSlots]);
  const availableTimeValues = useMemo(() => new Set(timeSlots.filter(slot => slot.available).map(slot => slot.time)), [timeSlots]);
  const closedDateMessage = form.date && !dayWindow
    ? t('randevuPage.validation.sundayClosed')
    : shouldBlockByAvailability
      ? t('randevuPage.validation.doctorUnavailable')
      : '';

  useEffect(() => {
    if (!form.date || !form.doctorId) return;

    let cancelled = false;
    api.get(`/doctors/${form.doctorId}/availability`, { params: { date: form.date } })
      .then(res => {
        if (!cancelled) setAvailability({ ...(res.data?.data || res.data || {}), doctorId: form.doctorId, date: form.date });
      })
      .catch(() => {
        if (!cancelled) setAvailability({ doctorId: form.doctorId, date: form.date, available: true, slots: [] });
      });

    return () => { cancelled = true; };
  }, [form.date, form.doctorId]);

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.phone || !form.doctorId || !form.date) {
      toast.warning(t('randevuPage.validation.requiredFields')); return;
    }
    if (!isValidEmail(form.email)) { toast.warning(t('randevuPage.validation.emailInvalid')); return; }
    if (isPastDate(form.date)) { toast.warning(t('randevuPage.pastDate')); return; }
    if (form.date > maxDate) { toast.warning(t('randevuPage.validation.futureRange')); return; }
    if (closedDateMessage) { toast.warning(closedDateMessage); return; }
    if (!form.startTime) { toast.warning(t('randevuPage.timeRequired')); return; }
    if (!availableTimeValues.has(form.startTime)) { toast.warning(t('randevuPage.validation.invalidWorkingTime')); return; }
    if (isPastTimeToday(form.date, form.startTime)) { toast.warning(t('randevuPage.validation.pastTimeToday')); return; }
    setSubmit(true);
    const endTime = addMinutes(form.startTime, 30);
    try {
      let patientId = null;
      if (user?.role === 'PATIENT') {
        const patRes  = await api.get(`/patients/by-user/${user._id}`);
        const pat     = patRes.data?.data?.patient ?? patRes.data?.patient;
        patientId     = pat?._id;
      }
      await api.post('/appointments', { patientId, doctorId: form.doctorId, date: form.date, startTime: form.startTime, endTime, reason: form.reason });
      const doc = doctors.find(d => d._id === form.doctorId);
      setBooked({ doctor: doc ? `${doc.userId?.fullName} — ${doc.specialization}` : form.doctorId, date: form.date, time: form.startTime });
    } catch (err) {
      const s = err?.response?.status;
      if (s === 409) toast.error(t('randevuPage.errors.slotBooked'));
      else if (s === 401) { toast.error(t('randevuPage.errors.loginRequired')); navigate('/login'); }
      else if (s === 400) toast.error(err.response?.data?.message || t('randevuPage.errors.badData'));
      else toast.error(t('randevuPage.errors.retry'));
    } finally { setSubmit(false); }
  };

  if (booked) return (
    <div style={{ textAlign: 'center', maxWidth: 440, margin: '0 auto' }}>
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 32 }}>
        <span style={{ color: '#10b981' }}>✓</span>
      </div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: NAVY, margin: '0 0 10px', fontFamily: FONT }}>{t('randevuPage.success.loggedTitle')}</h2>
      <p style={{ color: '#718096', fontSize: 14, margin: '0 0 28px', fontFamily: FONT }}>{t('randevuPage.success.contactSoon')}</p>
      <div style={{ background: '#f8fafc', borderRadius: 12, padding: '20px 24px', textAlign: 'left', marginBottom: 28, border: '1px solid #e2e8f0' }}>
        {[[t('randevuPage.fields.doctor'), booked.doctor], [t('randevuPage.fields.date'), booked.date], [t('randevuPage.fields.time'), booked.time]].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0', fontSize: 14, fontFamily: FONT }}>
            <span style={{ color: '#718096', fontWeight: 600 }}>{k}</span>
            <span style={{ color: NAVY, fontWeight: 700 }}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
        <button onClick={() => { setBooked(null); setForm({ name: '', email: '', phone: '', doctorId: '', startTime: '', date: '', reason: '' }); }}
          style={{ padding: 13, borderRadius: 12, border: `2px solid ${TEAL}`, background: '#fff', color: TEAL, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>
          {t('randevuPage.buttons.newAppointment')}
        </button>
        {user?.role === 'PATIENT' && (
          <button onClick={() => navigate('/patient')}
            style={{ padding: 13, borderRadius: 12, border: 'none', background: `linear-gradient(135deg,${NAVY},${TEAL})`, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>
            {t('randevuPage.buttons.patientPortal')}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div style={{ marginBottom: 32 }}>
        <button onClick={() => navigate('/')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20, background: 'none', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 600, color: '#64748b', cursor: 'pointer', fontFamily: FONT }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = TEAL; e.currentTarget.style.color = TEAL; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          {t('randevuPage.backHome')}
        </button>
        <h2 style={{ fontSize: 26, fontWeight: 700, color: NAVY, margin: '0 0 6px', fontFamily: FONT }}>{t('randevuPage.orderTitle')}</h2>
        <p style={{ fontSize: 14, color: '#718096', margin: 0, fontFamily: FONT }}>{t('randevuPage.loggedSubtitle')}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <Field label={`${t('randevuPage.fields.fullName')} *`}>
          <input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder={t('randevuPage.fields.fullName')} style={iStyle} onFocus={focusB} onBlur={blurB} />
        </Field>
        <Field label={t('randevuPage.fields.email')}>
          <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder={t('randevuPage.fields.email')} style={iStyle} onFocus={focusB} onBlur={blurB} />
        </Field>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <Field label={`${t('randevuPage.fields.phone')} *`}>
          <input
            type="text"
            value={form.phone}
            onChange={e => set('phone', formatPhoneInput(e.target.value))}
            placeholder={t('randevuPage.phonePlaceholder')}
            style={iStyle}
            onFocus={focusB}
            onBlur={blurB}
          />
        </Field>
        <Field label={`${t('randevuPage.fields.departmentDoctor')} *`}>
          <select
            value={form.doctorId}
            onChange={e => {
              setForm(p => ({ ...p, doctorId: e.target.value, startTime: '' }));
              setAvailability(null);
            }}
            style={{ ...iStyle, appearance: 'none', cursor: 'pointer' }}
            onFocus={focusB}
            onBlur={blurB}
          >
            <option value="">{loadingDoctors ? t('randevuPage.placeholders.doctorLoading') : t('randevuPage.placeholders.doctorSelect')}</option>
            {doctors.map(doc => (
              <option key={doc._id} value={doc._id}>{doc.userId?.fullName || doc.fullName || doc.name || t('randevuPage.fields.doctor')} — {doc.specialization || doc.specialty || ''}</option>
            ))}
          </select>
        </Field>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <Field label={`${t('randevuPage.fields.time')} *`}>
          <select
            value={form.startTime}
            onChange={e => set('startTime', e.target.value)}
            disabled={!form.date || !!closedDateMessage || availableTimeValues.size === 0}
            style={{ ...iStyle, appearance: 'none', cursor: !form.date || closedDateMessage || availableTimeValues.size === 0 ? 'not-allowed' : 'pointer', opacity: !form.date || closedDateMessage || availableTimeValues.size === 0 ? 0.72 : 1 }}
            onFocus={focusB}
            onBlur={blurB}
          >
            <option value="">{form.date ? t('randevuPage.selectTime') : t('randevuPage.selectDateFirst')}</option>
            {timeSlots.map(slot => (
              <option key={slot.time} value={slot.time} disabled={!slot.available}>{slot.time}</option>
            ))}
          </select>
        </Field>
        <Field label={`${t('randevuPage.fields.date')} *`}>
          <input
            type="date"
            value={form.date}
            min={today}
            max={maxDate}
            onChange={e => {
              const val = e.target.value;
              if (val && (val < today || val > maxDate)) {
                set('date', '');
                set('startTime', '');
                setAvailability(null);
                return;
              }
              set('date', val);
              set('startTime', '');
              setAvailability(null);
            }}
            style={iStyle}
            onFocus={focusB}
            onBlur={blurB}
          />
        </Field>
      </div>
      {closedDateMessage && (
        <div style={{ background: '#fef2f2', color: '#dc2626', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 20, fontFamily: FONT }}>
          {closedDateMessage}
        </div>
      )}
      {form.date && !closedDateMessage && availableTimeValues.size === 0 && (
        <div style={{ background: '#fef2f2', color: '#dc2626', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 20, fontFamily: FONT }}>
          {t('randevuPage.validation.noSlots')}
        </div>
      )}

      <div style={{ marginBottom: 28 }}>
        <Field label={t('randevuPage.fields.message')}>
          <textarea rows={4} value={form.reason} onChange={e => set('reason', e.target.value)}
            placeholder={t('randevuPage.placeholders.message')} style={{ ...iStyle, resize: 'vertical', fontFamily: FONT }} onFocus={focusB} onBlur={blurB} />
        </Field>
      </div>

      <button onClick={handleSubmit} disabled={submitting || !!closedDateMessage}
        style={{ width: '100%', padding: 14, borderRadius: 12, border: 'none', background: submitting || closedDateMessage ? '#9ca3af' : `linear-gradient(135deg,${NAVY},${TEAL})`, color: '#fff', fontSize: 16, fontWeight: 700, cursor: submitting || closedDateMessage ? 'not-allowed' : 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        {submitting ? (<><Spinner />{t('randevuPage.buttons.sending')}</>) : t('randevuPage.buttons.order')}
      </button>
    </>
  );
}

/* ── tiny spinner ─────────────────────────────────────────────── */
function Spinner() {
  return (
    <span style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .75s linear infinite', display: 'inline-block' }} />
  );
}

/* ════════════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════════════ */
export default function RandevuPage() {
  const { t } = useTranslation();
  usePageTitle(t('randevuPage.pageTitle'), t('randevuPage.pageDescription'))
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const { isMobile }   = useBreakpoint();

  const doctorIdFromUrl     = searchParams.get('doctorId') || '';
  const preselectedDoctorId = doctorIdFromUrl;
  const isLoggedIn          = !!localStorage.getItem('token');

  const [doctors,        setDoctors]        = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  useEffect(() => {
    fetch(`${BASE}/api/v1/doctors/public/all`)
      .then(r => r.json())
      .then(d => {
        const list = d.data || [];
        setDoctors(Array.isArray(list) ? list : []);
      })
      .catch(() => {})
      .finally(() => setLoadingDoctors(false));
  }, []);

  const sharedProps = { doctors, loadingDoctors, preselectedDoctorId, navigate, t };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: isMobile ? 'column' : 'row', fontFamily: FONT }}>

      {/* ── LEFT panel ────────────────────────────────────── */}
      <div style={{ width: isMobile ? '100%' : '40%', minHeight: isMobile ? 280 : undefined, background: 'linear-gradient(135deg,#0a1628 0%,#00848e 100%)', padding: isMobile ? '32px 24px' : '60px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', color: '#fff' }}>
        <h1 style={{ fontSize: isMobile ? 26 : 36, fontWeight: 800, lineHeight: 1.3, margin: '0 0 36px', fontFamily: FONT, whiteSpace: 'pre-line' }}>
          {t('randevuPage.headline')}
        </h1>

        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 20 }}>
          <IconCircle>🕐</IconCircle>
          <div style={{ fontSize: 14, lineHeight: 1.8 }}>
            <div><strong>{t('randevuPage.weekdays')}: </strong>09:00 – 20:00</div>
            <div><strong>{t('randevuPage.saturday')}: </strong>09:00 – 18:00</div>
            <div><strong>{t('randevuPage.sunday')}: </strong>{t('randevuPage.closed')}</div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', margin: '0 0 20px' }} />

        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 20 }}>
          <IconCircle>📞</IconCircle>
          <div style={{ fontSize: 14, lineHeight: 1.8 }}>
            <div><strong>{t('randevuPage.phone')}: </strong>+994 50 836 36 94</div>
            <div><strong>{t('randevuPage.email')}: </strong>info@aslanmedical.az</div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', margin: '0 0 20px' }} />

        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <IconCircle>📍</IconCircle>
          <div style={{ fontSize: 14, lineHeight: 1.8 }}>
            <div><strong>{t('randevuPage.address')}: </strong>Aslan Medical Center</div>
            <div>{t('randevuPage.addressLine')}</div>
            <div>{t('randevuPage.cityCountry')}</div>
          </div>
        </div>

        {!isLoggedIn && (
          <>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', margin: '24px 0 20px' }} />
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 18px', fontSize: 13, lineHeight: 1.7 }}>
              <p style={{ margin: '0 0 10px', fontWeight: 600 }}>{t('randevuPage.benefitsTitle')}</p>
              <p style={{ margin: 0, opacity: 0.85 }} dangerouslySetInnerHTML={{ __html: t('randevuPage.benefitsText') }} />
            </div>
          </>
        )}
      </div>

      {/* ── RIGHT panel ───────────────────────────────────── */}
      <div style={{ width: isMobile ? '100%' : '60%', background: '#fff', padding: isMobile ? '32px 24px' : '48px 56px', boxShadow: isMobile ? 'none' : '-8px 0 40px rgba(0,0,0,0.08)', overflowY: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {isLoggedIn
          ? <LoggedInForm {...sharedProps} isMobile={isMobile} />
          : <GuestForm    {...sharedProps} />
        }
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
