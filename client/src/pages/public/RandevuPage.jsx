import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../../api/axios';
import { useBreakpoint } from '../../hooks/useBreakpoint';

const BASE  = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';
const FONT  = "'Source Sans 3', 'Raleway', sans-serif";
const NAVY  = '#0a1628';
const TEAL  = '#00848e';
const today = new Date().toISOString().split('T')[0];

/* ── tiny helpers ─────────────────────────────────────────────── */
function addMinutes(time, mins) {
  const [h, m] = time.split(':').map(Number);
  const total  = h * 60 + m + mins;
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}
const getUser = () => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } };

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
const STEPS = ['Şəxsi məlumatlar', 'Randevu detalları', 'Təsdiq'];

function StepIndicator({ current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
      {STEPS.map((label, i) => {
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
                {label}
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
function GuestForm({ doctors, loadingDoctors, preselectedDoctorId, navigate }) {
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

  const doctor = doctors.find(d => d._id === doctorId);
  const doctorName = doctor
    ? `${doctor.userId?.fullName || ''} — ${doctor.specialization || ''}`.trim().replace(/^—|—$/, '').trim()
    : 'Seçilməyib';

  /* step validation */
  const validateStep1 = () => {
    if (!name.trim())  { setErr('Ad Soyad tələb olunur'); return false; }
    if (!email.trim()) { setErr('E-poçt tələb olunur'); return false; }
    if (!phone.trim()) { setErr('Telefon tələb olunur'); return false; }
    return true;
  };
  const validateStep2 = () => {
    if (!date) { setErr('Tarix seçilməlidir'); return false; }
    if (!time) { setErr('Vaxt seçilməlidir'); return false; }
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
        body: JSON.stringify({ name, email, phone: `+994${phone}`, subject: 'Randevu Müraciəti', message }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.message || 'Xəta baş verdi');
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
        Müraciətiniz qəbul edildi!
      </h2>
      <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7, margin: '0 0 8px', fontFamily: FONT }}>
        Tezliklə sizinlə əlaqə saxlanılacaq.
      </p>
      <p style={{ color: '#64748b', fontSize: 13, margin: '0 0 28px', fontFamily: FONT }}>
        Ətraflı məlumat üçün: <strong style={{ color: NAVY }}>+994 50 836 36 94</strong>
      </p>
      <div style={{ background: '#f8fafc', borderRadius: 12, padding: '16px 20px', textAlign: 'left', marginBottom: 28, border: '1px solid #e2e8f0' }}>
        {[['Ad Soyad', name], ['Həkim', doctorName], ['Tarix', date], ['Vaxt', time]].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13, fontFamily: FONT }}>
            <span style={{ color: '#718096', fontWeight: 600 }}>{k}</span>
            <span style={{ color: NAVY, fontWeight: 700 }}>{v || '—'}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button onClick={() => navigate('/login')}
          style={{ padding: 13, borderRadius: 12, border: 'none', background: `linear-gradient(135deg,${NAVY},${TEAL})`, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>
          Daxil olun
        </button>
        <button onClick={() => navigate('/register')}
          style={{ padding: 13, borderRadius: 12, border: `2px solid ${TEAL}`, background: '#fff', color: TEAL, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>
          Qeydiyyatdan keçin
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
          Ana Səhifə
        </button>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: NAVY, margin: '0 0 4px', fontFamily: FONT }}>Randevu Sifariş Et</h2>
        <p style={{ fontSize: 13, color: '#718096', margin: 0, fontFamily: FONT }}>Qeydiyyatsız randevu müraciəti göndərin</p>
      </div>

      <StepIndicator current={step} />

      {err && (
        <div style={{ background: '#fef2f2', color: '#dc2626', borderRadius: 10, padding: '11px 16px', fontSize: 13, marginBottom: 20, fontFamily: FONT }}>
          {err}
        </div>
      )}

      {/* ── STEP 1 ── */}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Field label="Ad Soyad *">
            <input style={iStyle} value={name} onChange={e => setName(e.target.value)} placeholder="Adınız və soyadınız" onFocus={focusB} onBlur={blurB} />
          </Field>
          <Field label="E-poçt *">
            <input type="email" style={iStyle} value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" onFocus={focusB} onBlur={blurB} />
          </Field>
          <Field label="Telefon *">
            <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #e2e8f0', borderRadius: 10, overflow: 'hidden', transition: 'border-color .18s' }}
              onFocusCapture={e => e.currentTarget.style.borderColor = TEAL}
              onBlurCapture={e  => e.currentTarget.style.borderColor = '#e2e8f0'}>
              <span style={{ padding: '12px 10px 12px 14px', fontSize: 14, fontWeight: 700, color: '#374151', background: '#f8fafc', borderRight: '1px solid #e2e8f0', flexShrink: 0, fontFamily: FONT }}>+994</span>
              <input style={{ ...iStyle, border: 'none', borderRadius: 0 }} value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                placeholder="50 XXX XX XX" />
            </div>
          </Field>
        </div>
      )}

      {/* ── STEP 2 ── */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Field label="Həkim seçin (istəyə bağlı)">
            <select style={{ ...iStyle, appearance: 'none', cursor: 'pointer' }} value={doctorId} onChange={e => setDoctorId(e.target.value)} onFocus={focusB} onBlur={blurB}>
              <option value="">{loadingDoctors ? 'Yüklənir...' : 'Həkim seçin...'}</option>
              {doctors.map(d => (
                <option key={d._id} value={d._id}>
                  {d.userId?.fullName || d.fullName || d.name || 'Həkim'} — {d.specialization || d.specialty || ''}
                </option>
              ))}
            </select>
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="İstədiyiniz tarix *">
              <input type="date" style={iStyle} min={today} value={date} onChange={e => setDate(e.target.value)} onFocus={focusB} onBlur={blurB} />
            </Field>
            <Field label="İstədiyiniz vaxt *">
              <input type="time" style={iStyle} value={time} onChange={e => setTime(e.target.value)} onFocus={focusB} onBlur={blurB} />
            </Field>
          </div>
          <Field label="Müayinə səbəbi">
            <textarea rows={4} style={{ ...iStyle, resize: 'vertical', fontFamily: FONT }} value={reason} onChange={e => setReason(e.target.value)} placeholder="Şikayətiniz və ya müayinənin məqsədi..." onFocus={focusB} onBlur={blurB} />
          </Field>
        </div>
      )}

      {/* ── STEP 3 — summary ── */}
      {step === 3 && (
        <div>
          <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 20px', fontFamily: FONT }}>
            Məlumatlarınızı yoxlayın və göndərin.
          </p>
          <div style={{ background: '#f8fafc', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: 8 }}>
            {[
              ['👤 Ad Soyad',     name],
              ['✉️ E-poçt',       email],
              ['📱 Telefon',      `+994 ${phone}`],
              ['👨‍⚕️ Həkim',       doctorName],
              ['📅 Tarix',        date],
              ['🕐 Vaxt',         time],
              ['📋 Müayinə səbəbi', reason || '—'],
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
            ← Geri
          </button>
        )}
        {step < 3 ? (
          <button onClick={next}
            style={{ flex: 1, padding: 13, borderRadius: 12, border: 'none', background: `linear-gradient(135deg,${NAVY},${TEAL})`, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>
            İrəli →
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={sending}
            style={{ flex: 1, padding: 13, borderRadius: 12, border: 'none', background: sending ? '#9ca3af' : `linear-gradient(135deg,${NAVY},${TEAL})`, color: '#fff', fontSize: 15, fontWeight: 700, cursor: sending ? 'not-allowed' : 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            {sending ? (<><Spinner />Göndərilir...</>) : 'Göndər ✓'}
          </button>
        )}
      </div>

      <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 16, fontFamily: FONT }}>
        Artıq hesabınız var?{' '}
        <span onClick={() => navigate('/login')} style={{ color: TEAL, fontWeight: 600, cursor: 'pointer' }}>Daxil olun</span>
      </p>
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
   LOGGED-IN FORM (existing logic, unchanged)
════════════════════════════════════════════════════════════════ */
function LoggedInForm({ doctors, loadingDoctors, isMobile, preselectedDoctorId, navigate }) {
  const user = getUser();
  const [form, setForm]         = useState({ name: '', email: '', phone: '', doctorId: preselectedDoctorId || '', startTime: '', date: '', reason: '' });
  const [submitting, setSubmit] = useState(false);
  const [booked, setBooked]     = useState(null);

  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.doctorId || !form.startTime || !form.date) {
      toast.warning('Zəhmət olmasa bütün məcburi sahələri doldurun.'); return;
    }
    if (form.date < today) { toast.warning('Keçmiş tarix seçilə bilməz.'); return; }
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
      if (s === 409) toast.error('Bu vaxt artıq sifarişlidir.');
      else if (s === 401) { toast.error('Daxil olun.'); navigate('/login'); }
      else if (s === 400) toast.error(err.response?.data?.message || 'Məlumatlar yanlışdır.');
      else toast.error('Xəta baş verdi. Yenidən cəhd edin.');
    } finally { setSubmit(false); }
  };

  if (booked) return (
    <div style={{ textAlign: 'center', maxWidth: 440, margin: '0 auto' }}>
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 32 }}>
        <span style={{ color: '#10b981' }}>✓</span>
      </div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: NAVY, margin: '0 0 10px', fontFamily: FONT }}>Randevunuz qəbul edildi!</h2>
      <p style={{ color: '#718096', fontSize: 14, margin: '0 0 28px', fontFamily: FONT }}>Tezliklə sizinlə əlaqə saxlanılacaq.</p>
      <div style={{ background: '#f8fafc', borderRadius: 12, padding: '20px 24px', textAlign: 'left', marginBottom: 28, border: '1px solid #e2e8f0' }}>
        {[['Həkim', booked.doctor], ['Tarix', booked.date], ['Vaxt', booked.time]].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0', fontSize: 14, fontFamily: FONT }}>
            <span style={{ color: '#718096', fontWeight: 600 }}>{k}</span>
            <span style={{ color: NAVY, fontWeight: 700 }}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
        <button onClick={() => { setBooked(null); setForm({ name: '', email: '', phone: '', doctorId: '', startTime: '', date: '', reason: '' }); }}
          style={{ padding: 13, borderRadius: 12, border: `2px solid ${TEAL}`, background: '#fff', color: TEAL, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>
          Yeni Randevu
        </button>
        {user?.role === 'PATIENT' && (
          <button onClick={() => navigate('/patient')}
            style={{ padding: 13, borderRadius: 12, border: 'none', background: `linear-gradient(135deg,${NAVY},${TEAL})`, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>
            Pasiyent Portalına Keç
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
          Ana Səhifə
        </button>
        <h2 style={{ fontSize: 26, fontWeight: 700, color: NAVY, margin: '0 0 6px', fontFamily: FONT }}>Randevu Sifariş Et</h2>
        <p style={{ fontSize: 14, color: '#718096', margin: 0, fontFamily: FONT }}>Həkimimizlə görüş təyin edin</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <Field label="Ad Soyad *">
          <input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ad Soyad" style={iStyle} onFocus={focusB} onBlur={blurB} />
        </Field>
        <Field label="E-poçt">
          <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="E-poçt ünvanı" style={iStyle} onFocus={focusB} onBlur={blurB} />
        </Field>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <Field label="Telefon *">
          <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}
            onFocusCapture={e => e.currentTarget.style.borderColor = TEAL}
            onBlurCapture={e  => e.currentTarget.style.borderColor = '#e2e8f0'}>
            <span style={{ padding: '12px 10px 12px 14px', fontSize: 14, fontWeight: 700, color: '#374151', background: '#f8fafc', borderRight: '1px solid #e2e8f0', flexShrink: 0, fontFamily: FONT }}>+994</span>
            <input type="text" value={form.phone} onChange={e => set('phone', e.target.value.replace(/\D/g, '').slice(0, 9))}
              placeholder="50 XXX XX XX" style={{ ...iStyle, border: 'none', borderRadius: 0 }} />
          </div>
        </Field>
        <Field label="Şöbə / Həkim *">
          <select value={form.doctorId} onChange={e => set('doctorId', e.target.value)} style={{ ...iStyle, appearance: 'none', cursor: 'pointer' }} onFocus={focusB} onBlur={blurB}>
            <option value="">{loadingDoctors ? 'Həkimlər yüklənir...' : 'Həkim seçin...'}</option>
            {doctors.map(doc => (
              <option key={doc._id} value={doc._id}>{doc.userId?.fullName || doc.fullName || doc.name || 'Həkim'} — {doc.specialization || doc.specialty || ''}</option>
            ))}
          </select>
        </Field>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <Field label="Vaxt *">
          <input type="time" value={form.startTime} onChange={e => set('startTime', e.target.value)} style={iStyle} onFocus={focusB} onBlur={blurB} />
        </Field>
        <Field label="Tarix *">
          <input type="date" value={form.date} min={today} onChange={e => set('date', e.target.value)} style={iStyle} onFocus={focusB} onBlur={blurB} />
        </Field>
      </div>

      <div style={{ marginBottom: 28 }}>
        <Field label="Mesaj">
          <textarea rows={4} value={form.reason} onChange={e => set('reason', e.target.value)}
            placeholder="Əlavə qeydlər və ya şikayətiniz..." style={{ ...iStyle, resize: 'vertical', fontFamily: FONT }} onFocus={focusB} onBlur={blurB} />
        </Field>
      </div>

      <button onClick={handleSubmit} disabled={submitting}
        style={{ width: '100%', padding: 14, borderRadius: 12, border: 'none', background: submitting ? '#9ca3af' : `linear-gradient(135deg,${NAVY},${TEAL})`, color: '#fff', fontSize: 16, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        {submitting ? (<><Spinner />Göndərilir...</>) : 'Randevu Sifariş Et →'}
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
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const { isMobile }   = useBreakpoint();

  const preselectedDoctorId = searchParams.get('doctorId') || '';
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

  const sharedProps = { doctors, loadingDoctors, preselectedDoctorId, navigate };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: isMobile ? 'column' : 'row', fontFamily: FONT }}>

      {/* ── LEFT panel ────────────────────────────────────── */}
      <div style={{ width: isMobile ? '100%' : '40%', minHeight: isMobile ? 280 : undefined, background: 'linear-gradient(135deg,#0a1628 0%,#00848e 100%)', padding: isMobile ? '32px 24px' : '60px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', color: '#fff' }}>
        <h1 style={{ fontSize: isMobile ? 26 : 36, fontWeight: 800, lineHeight: 1.3, margin: '0 0 36px', fontFamily: FONT, whiteSpace: 'pre-line' }}>
          {'Pulsuz peşəkar\nkonsultasiya\nalın'}
        </h1>

        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 20 }}>
          <IconCircle>🕐</IconCircle>
          <div style={{ fontSize: 14, lineHeight: 1.8 }}>
            <div><strong>B.E–Cümə: </strong>09:00 – 20:00</div>
            <div><strong>Şənbə–Bazar: </strong>09:00 – 18:00</div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', margin: '0 0 20px' }} />

        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 20 }}>
          <IconCircle>📞</IconCircle>
          <div style={{ fontSize: 14, lineHeight: 1.8 }}>
            <div><strong>Telefon: </strong>+994 50 836 36 94</div>
            <div><strong>Email: </strong>info@aslanmedical.az</div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', margin: '0 0 20px' }} />

        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <IconCircle>📍</IconCircle>
          <div style={{ fontSize: 14, lineHeight: 1.8 }}>
            <div><strong>Ünvan: </strong>Aslan Medical Center</div>
            <div>Xətai ray, Afiyəddin Cəlilov küçəsi</div>
            <div>Bakı, Azərbaycan</div>
          </div>
        </div>

        {!isLoggedIn && (
          <>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', margin: '24px 0 20px' }} />
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 18px', fontSize: 13, lineHeight: 1.7 }}>
              <p style={{ margin: '0 0 10px', fontWeight: 600 }}>💡 Qeydiyyatlı olmaq üstünlükləri:</p>
              <p style={{ margin: 0, opacity: 0.85 }}>✓ Randevularınızı izləyin<br/>✓ Tibbi tarixi saxlayın<br/>✓ Nəticələrə onlayn baxın</p>
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
