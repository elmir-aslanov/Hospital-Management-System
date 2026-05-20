import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../../api/axios';
import { useBreakpoint } from '../../hooks/useBreakpoint';

const FONT = "'Source Sans 3', 'Raleway', sans-serif";
const NAVY = '#0a1628';
const TEAL = '#00848e';

const inputStyle = {
  border: '1.5px solid #e2e8f0',
  borderRadius: '10px',
  padding: '12px 14px',
  fontSize: '14px',
  width: '100%',
  outline: 'none',
  fontFamily: FONT,
  boxSizing: 'border-box',
  transition: 'border-color 0.18s',
  background: '#fff',
};

const labelStyle = {
  fontSize: '13px',
  fontWeight: 600,
  color: '#374151',
  marginBottom: '6px',
  display: 'block',
  fontFamily: FONT,
};

function InputField({ label, children }) {
  return (
    <div>
      {label && <label style={labelStyle}>{label}</label>}
      {children}
    </div>
  );
}

function IconCircle({ children }) {
  return (
    <div style={{
      width: 44,
      height: 44,
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.15)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      fontSize: 20,
    }}>
      {children}
    </div>
  );
}

const today = new Date().toISOString().split('T')[0];

function addMinutes(time, mins) {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + mins;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
}

export default function RandevuPage() {
  const navigate = useNavigate();
  const { isMobile } = useBreakpoint();

  const [form, setForm] = useState({
    name: '', email: '', phone: '', doctorId: '',
    startTime: '', date: '', reason: '',
  });
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [booked, setBooked] = useState(null);

  useEffect(() => {
    api.get('/doctors')
      .then(res => setDoctors(res.data?.data ?? res.data ?? []))
      .catch(() => toast.error('Həkimləri yükləmək mümkün olmadı.'))
      .finally(() => setLoadingDoctors(false));
  }, []);

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  })();

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function focusInput(e) { e.target.style.borderColor = TEAL; }
  function blurInput(e)  { e.target.style.borderColor = '#e2e8f0'; }

  async function handleSubmit() {
    if (!form.name || !form.phone || !form.doctorId || !form.startTime || !form.date) {
      toast.warning('Zəhmət olmasa bütün məcburi sahələri doldurun.');
      return;
    }
    if (form.date < today) {
      toast.warning('Keçmiş tarix seçilə bilməz.');
      return;
    }

    setSubmitting(true);
    const endTime = addMinutes(form.startTime, 30);

    try {
      await api.post('/appointments', {
        patientId: user?._id,
        doctorId: form.doctorId,
        date: form.date,
        startTime: form.startTime,
        endTime,
        reason: form.reason,
      });

      const doc = doctors.find(d => d._id === form.doctorId);
      setBooked({
        doctor: doc ? `${doc.userId?.name} — ${doc.specialization}` : form.doctorId,
        date: form.date,
        time: form.startTime,
      });
    } catch (err) {
      const status = err?.response?.status;
      if (status === 409) {
        toast.error('Bu vaxt artıq sifarişlidir. Zəhmət olmasa başqa vaxt seçin.');
      } else if (status === 401) {
        toast.error('Randevu sifariş etmək üçün daxil olun.');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        toast.error('Xəta baş verdi. Yenidən cəhd edin.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      fontFamily: FONT,
    }}>

      {/* ── LEFT COLUMN ── */}
      <div style={{
        width: isMobile ? '100%' : '40%',
        minHeight: isMobile ? 280 : undefined,
        background: 'linear-gradient(135deg, #0a1628 0%, #00848e 100%)',
        padding: isMobile ? '32px 24px' : '60px 48px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        color: '#fff',
      }}>
        <h1 style={{
          fontSize: isMobile ? 26 : 36,
          fontWeight: 800,
          lineHeight: 1.3,
          margin: '0 0 36px',
          fontFamily: FONT,
          whiteSpace: 'pre-line',
        }}>
          {'Pulsuz peşəkar\nkonsultasiya\nalın'}
        </h1>

        {/* Block 1 — Hours */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 20 }}>
          <IconCircle>🕐</IconCircle>
          <div style={{ fontSize: 14, lineHeight: 1.8 }}>
            <div><strong>B.E–Cümə: </strong>09:00 – 20:00</div>
            <div><strong>Şənbə–Bazar: </strong>09:00 – 18:00</div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', margin: '0 0 20px' }} />

        {/* Block 2 — Contact */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 20 }}>
          <IconCircle>📞</IconCircle>
          <div style={{ fontSize: 14, lineHeight: 1.8 }}>
            <div><strong>Telefon: </strong>+994 50 836 36 94</div>
            <div><strong>Email: </strong>info@aslanmedical.az</div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', margin: '0 0 20px' }} />

        {/* Block 3 — Address */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <IconCircle>📍</IconCircle>
          <div style={{ fontSize: 14, lineHeight: 1.8 }}>
            <div><strong>Ünvan: </strong>Aslan Medical Center</div>
            <div>Xətai ray, Afiyəddin Cəlilov küçəsi</div>
            <div>Bakı, Azərbaycan</div>
          </div>
        </div>
      </div>

      {/* ── RIGHT COLUMN ── */}
      <div style={{
        width: isMobile ? '100%' : '60%',
        background: '#fff',
        padding: isMobile ? '32px 24px' : '48px 56px',
        boxShadow: isMobile ? 'none' : '-8px 0 40px rgba(0,0,0,0.08)',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}>

        {booked ? (
          /* ── SUCCESS STATE ── */
          <div style={{ textAlign: 'center', maxWidth: 440, margin: '0 auto' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(16,185,129,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: 32,
            }}>
              <span style={{ color: '#10b981' }}>✓</span>
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: NAVY, margin: '0 0 10px', fontFamily: FONT }}>
              Randevunuz qəbul edildi!
            </h2>
            <p style={{ color: '#718096', fontSize: 14, margin: '0 0 28px', fontFamily: FONT }}>
              Tezliklə sizinlə əlaqə saxlanılacaq.
            </p>

            <div style={{
              background: '#f8fafc', borderRadius: 12, padding: '20px 24px',
              textAlign: 'left', marginBottom: 28,
              border: '1px solid #e2e8f0',
            }}>
              {[
                ['Həkim', booked.doctor],
                ['Tarix', booked.date],
                ['Vaxt',  booked.time],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0', fontSize: 14, fontFamily: FONT }}>
                  <span style={{ color: '#718096', fontWeight: 600 }}>{k}</span>
                  <span style={{ color: NAVY, fontWeight: 700 }}>{v}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
              <button
                onClick={() => { setBooked(null); setForm({ name: '', email: '', phone: '', doctorId: '', startTime: '', date: '', reason: '' }); }}
                style={{
                  padding: '13px', borderRadius: 12, border: `2px solid ${TEAL}`,
                  background: '#fff', color: TEAL, fontSize: 15, fontWeight: 700,
                  cursor: 'pointer', fontFamily: FONT,
                }}
              >
                Yeni Randevu
              </button>
              {user?.role === 'PATIENT' && (
                <button
                  onClick={() => navigate('/patient')}
                  style={{
                    padding: '13px', borderRadius: 12, border: 'none',
                    background: `linear-gradient(135deg, ${NAVY}, ${TEAL})`,
                    color: '#fff', fontSize: 15, fontWeight: 700,
                    cursor: 'pointer', fontFamily: FONT,
                  }}
                >
                  Pasiyent Portalına Keç
                </button>
              )}
            </div>
          </div>
        ) : (
          /* ── FORM ── */
          <>
            <div style={{ marginBottom: 32 }}>
              <button
                onClick={() => navigate('/')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  marginBottom: 20,
                  background: 'none',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: 8,
                  padding: '7px 14px',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#64748b',
                  cursor: 'pointer',
                  fontFamily: FONT,
                  transition: 'border-color 0.18s, color 0.18s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = TEAL; e.currentTarget.style.color = TEAL; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"/>
                  <polyline points="12 19 5 12 12 5"/>
                </svg>
                Ana Səhifə
              </button>
              <h2 style={{ fontSize: 26, fontWeight: 700, color: NAVY, margin: '0 0 6px', fontFamily: FONT }}>
                Randevu Sifariş Et
              </h2>
              <p style={{ fontSize: 14, color: '#718096', margin: 0, fontFamily: FONT }}>
                Həkimimizlə görüş təyin edin
              </p>
            </div>

            {/* Row 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20, marginBottom: 20 }}>
              <InputField label="Ad Soyad *">
                <input
                  type="text"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="Ad Soyad"
                  style={inputStyle}
                  onFocus={focusInput}
                  onBlur={blurInput}
                />
              </InputField>
              <InputField label="E-poçt">
                <input
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="E-poçt ünvanı"
                  style={inputStyle}
                  onFocus={focusInput}
                  onBlur={blurInput}
                />
              </InputField>
            </div>

            {/* Row 2 */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20, marginBottom: 20 }}>
              <InputField label="Telefon *">
                <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #e2e8f0', borderRadius: 10, overflow: 'hidden', transition: 'border-color 0.18s' }}
                  onFocus={e => e.currentTarget.style.borderColor = TEAL}
                  onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                >
                  <span style={{
                    padding: '12px 10px 12px 14px', fontSize: 14, color: '#374151',
                    fontWeight: 700, background: '#f8fafc', borderRight: '1px solid #e2e8f0',
                    flexShrink: 0, fontFamily: FONT,
                  }}>+994</span>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={e => {
                      const v = e.target.value.replace(/\D/g, '').slice(0, 9);
                      set('phone', v);
                    }}
                    placeholder="50 XXX XX XX"
                    style={{ ...inputStyle, border: 'none', borderRadius: 0, outline: 'none' }}
                  />
                </div>
              </InputField>

              <InputField label="Şöbə / Həkim *">
                <select
                  value={form.doctorId}
                  onChange={e => set('doctorId', e.target.value)}
                  style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
                  onFocus={focusInput}
                  onBlur={blurInput}
                >
                  <option value="">
                    {loadingDoctors ? 'Həkimlər yüklənir...' : 'Həkim seçin...'}
                  </option>
                  {doctors.map(doc => (
                    <option key={doc._id} value={doc._id}>
                      {doc.userId?.name} — {doc.specialization}
                    </option>
                  ))}
                </select>
              </InputField>
            </div>

            {/* Row 3 */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20, marginBottom: 20 }}>
              <InputField label="Vaxt *">
                <input
                  type="time"
                  value={form.startTime}
                  onChange={e => set('startTime', e.target.value)}
                  style={inputStyle}
                  onFocus={focusInput}
                  onBlur={blurInput}
                />
              </InputField>
              <InputField label="Tarix *">
                <input
                  type="date"
                  value={form.date}
                  min={today}
                  onChange={e => set('date', e.target.value)}
                  style={inputStyle}
                  onFocus={focusInput}
                  onBlur={blurInput}
                />
              </InputField>
            </div>

            {/* Row 4 */}
            <div style={{ marginBottom: 28 }}>
              <InputField label="Mesaj">
                <textarea
                  rows={4}
                  value={form.reason}
                  onChange={e => set('reason', e.target.value)}
                  placeholder="Əlavə qeydlər və ya şikayətiniz..."
                  style={{ ...inputStyle, resize: 'vertical' }}
                  onFocus={focusInput}
                  onBlur={blurInput}
                />
              </InputField>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 12,
                border: 'none',
                background: submitting ? '#9ca3af' : `linear-gradient(135deg, ${NAVY}, ${TEAL})`,
                color: '#fff',
                fontSize: 16,
                fontWeight: 700,
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontFamily: FONT,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                transition: 'background 0.2s',
              }}
            >
              {submitting ? (
                <>
                  <span style={{
                    width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.4)',
                    borderTopColor: '#fff', borderRadius: '50%',
                    animation: 'spin 0.75s linear infinite', display: 'inline-block',
                  }} />
                  Göndərilir...
                </>
              ) : (
                'Randevu Sifariş Et →'
              )}
            </button>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </>
        )}
      </div>
    </div>
  );
}
