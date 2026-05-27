import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import api from '../../api/axios';

const FONT      = "'Source Sans 3', 'Raleway', sans-serif";
const TEAL      = '#1DB6A6';
const TEAL_HVR  = '#178f84';
const NAVY      = '#0a1628';

/* ── Icon helpers (inline SVG, no external dep) ─────────────────────────── */
const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconMail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
  </svg>
);
const IconPhone = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 5.5 5.5l.76-.76a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z"/>
  </svg>
);
const IconTag = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);
const IconMsg = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const IconSend = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

/* ── Shared styles ──────────────────────────────────────────────────────── */
const inputBase = {
  width: '100%', height: 50, padding: '0 16px 0 44px', borderRadius: 10,
  border: '1.5px solid #e2e8f0', fontSize: 14.5, fontFamily: FONT,
  background: '#ffffff', outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.18s, box-shadow 0.18s', color: '#1a2b4a',
};
const iconWrap = {
  position: 'relative',
};
const iconPos = {
  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
  color: '#94a3b8', pointerEvents: 'none', display: 'flex', alignItems: 'center',
};
const iconPosTop = {
  position: 'absolute', left: 14, top: 14,
  color: '#94a3b8', pointerEvents: 'none', display: 'flex', alignItems: 'center',
};

function focusIn(e)  { e.target.style.borderColor = TEAL; e.target.style.boxShadow = '0 0 0 3px rgba(29,182,166,0.12)'; }
function focusOut(e) { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }

/* ── Contact info panel data ─────────────────────────────────────────────── */
const CONTACT_INFO = [
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
    label: 'Ünvan',
    value: 'Bakı, Azərbaycan',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 5.5 5.5l.76-.76a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z"/></svg>,
    label: 'Telefon',
    value: '+994 50 836 36 94',
    href: 'tel:+994508363694',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    label: 'E-poçt',
    value: 'info@aslanmedical.az',
    href: 'mailto:info@aslanmedical.az',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    label: 'İş saatları',
    value: 'Həftə içi: 09:00 – 18:00  |  Təcili: 24/7',
  },
];

/* ── Page ──────────────────────────────────────────────────────────────── */
export default function ContactPage() {
  const [form, setForm]       = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.warning('Ad, e-poçt və mesaj sahələri məcburidir.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/contact', form);
      setSuccess(true);
      toast.success('Mesajınız uğurla göndərildi!');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Xəta baş verdi. Yenidən cəhd edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ fontFamily: FONT }}>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #0a1628 0%, #1DB6A6 100%)', padding: '72px 32px 80px', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(77,208,225,0.85)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 14, fontFamily: FONT }}>
            Aslan Medical Center
          </p>
          <h1 style={{ fontSize: 42, fontWeight: 800, color: '#ffffff', margin: '0 0 16px', fontFamily: "'Raleway', sans-serif", lineHeight: 1.15 }}>
            Bizimlə Əlaqə
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', maxWidth: 500, margin: '0 auto', fontFamily: FONT, lineHeight: 1.75 }}>
            Suallarınız üçün bizimlə əlaqə saxlayın. Ən qısa müddətdə cavab verəcəyik.
          </p>
        </motion.div>
      </section>

      {/* Content */}
      <section style={{ background: '#f8fafc', padding: '56px 0 64px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px', boxSizing: 'border-box' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 40, alignItems: 'start' }}>

            {/* Contact info panel */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: NAVY, margin: '0 0 8px', fontFamily: FONT }}>Əlaqə Məlumatları</h2>
              <div style={{ width: 32, height: 3, background: TEAL, borderRadius: 2, marginBottom: 28 }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {CONTACT_INFO.map(({ icon, label, value, href }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(29,182,166,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEAL, flexShrink: 0 }}>
                      {icon}
                    </div>
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 4px', fontFamily: FONT }}>{label}</p>
                      {href
                        ? <a href={href} style={{ fontSize: 14.5, color: NAVY, textDecoration: 'none', fontFamily: FONT, fontWeight: 500 }}>{value}</a>
                        : <p style={{ fontSize: 14.5, color: NAVY, margin: 0, fontFamily: FONT, fontWeight: 500 }}>{value}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Form card */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}>
              <div style={{
                background: '#ffffff', borderRadius: 16, padding: 40,
                border: '1px solid rgba(15,23,42,0.08)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
              }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: NAVY, margin: '0 0 8px', fontFamily: FONT }}>Mesaj Göndər</h2>
                <div style={{ width: 32, height: 3, background: TEAL, borderRadius: 2, marginBottom: 28 }} />

                {success && (
                  <div style={{ background: 'rgba(29,182,166,0.07)', border: '1px solid rgba(29,182,166,0.2)', borderRadius: 12, padding: '14px 18px', marginBottom: 24, color: TEAL, fontSize: 14, fontFamily: FONT, fontWeight: 500 }}>
                    ✓ Mesajınız qəbul edildi. Ən qısa müddətdə sizinlə əlaqə saxlayacağıq.
                  </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Name + Email row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#4a5568', marginBottom: 6, display: 'block', fontFamily: FONT }}>Ad Soyad *</label>
                      <div style={iconWrap}>
                        <span style={iconPos}><IconUser /></span>
                        <input type="text" placeholder="Adınız" value={form.name} onChange={set('name')} style={inputBase} onFocus={focusIn} onBlur={focusOut} />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#4a5568', marginBottom: 6, display: 'block', fontFamily: FONT }}>E-poçt *</label>
                      <div style={iconWrap}>
                        <span style={iconPos}><IconMail /></span>
                        <input type="email" placeholder="email@example.com" value={form.email} onChange={set('email')} style={inputBase} onFocus={focusIn} onBlur={focusOut} />
                      </div>
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#4a5568', marginBottom: 6, display: 'block', fontFamily: FONT }}>Telefon</label>
                    <div style={iconWrap}>
                      <span style={iconPos}><IconPhone /></span>
                      <input type="tel" placeholder="+994 XX XXX XX XX" value={form.phone} onChange={set('phone')} style={inputBase} onFocus={focusIn} onBlur={focusOut} />
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#4a5568', marginBottom: 6, display: 'block', fontFamily: FONT }}>Mövzu</label>
                    <div style={iconWrap}>
                      <span style={iconPos}><IconTag /></span>
                      <input type="text" placeholder="Mesajın mövzusu" value={form.subject} onChange={set('subject')} style={inputBase} onFocus={focusIn} onBlur={focusOut} />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#4a5568', marginBottom: 6, display: 'block', fontFamily: FONT }}>Mesaj *</label>
                    <div style={iconWrap}>
                      <span style={iconPosTop}><IconMsg /></span>
                      <textarea
                        placeholder="Mesajınızı yazın..."
                        value={form.message}
                        onChange={set('message')}
                        rows={5}
                        style={{ ...inputBase, height: 'auto', padding: '12px 16px 12px 44px', resize: 'vertical', minHeight: 120 }}
                        onFocus={focusIn}
                        onBlur={focusOut}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      padding: '12px 32px', background: loading ? '#7ec8cc' : TEAL,
                      color: '#fff', border: 'none', borderRadius: 10,
                      fontSize: 15, fontWeight: 700, fontFamily: FONT,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'background 0.2s',
                      boxShadow: loading ? 'none' : '0 4px 14px rgba(29,182,166,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}
                    onMouseEnter={e => { if (!loading) e.currentTarget.style.background = TEAL_HVR; }}
                    onMouseLeave={e => { if (!loading) e.currentTarget.style.background = TEAL; }}
                  >
                    {loading ? 'Göndərilir…' : <><IconSend /> Mesaj Göndər</>}
                  </button>
                </form>
              </div>
            </motion.div>

          </div>
        </div>
      </section>
    </main>
  );
}
