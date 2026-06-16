import usePageTitle from '../../hooks/usePageTitle'
import { useBreakpoint } from '../../hooks/useBreakpoint'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import api from '../../api/axios'
import { useTranslation } from 'react-i18next'
import { fadeUp } from '../../utils/animations'

const FONT = "'Source Sans 3', 'Raleway', sans-serif"
const TEAL = '#00848e'
const NAVY = '#0a1628'

export default function ContactPage() {
  usePageTitle('Əlaqə', 'Aslan Medical Center ilə əlaqə saxlayın. Bakı, Azərbaycan.')
  const { t } = useTranslation()
  const { isMobile, isTablet } = useBreakpoint()
  const [form, setForm]       = useState({ name: '', email: '', message: '', agreed: false })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.warning('Ad, e-poçt və mesaj məcburidir.'); return
    }
    if (!form.agreed) { toast.warning('Şərtləri qəbul edin.'); return }
    setLoading(true)
    try {
      await api.post('/contact', { name: form.name, email: form.email, message: form.message })
      setSuccess(true)
      toast.success('Mesajınız göndərildi!')
      setForm({ name: '', email: '', message: '', agreed: false })
    } catch (e) {
      toast.error(e.response?.data?.message || 'Xəta baş verdi.')
    } finally { setLoading(false) }
  }

  const inputStyle = {
    width: '100%', height: 38, padding: '0 40px 0 14px',
    border: '1px solid #d1d5db', borderRadius: 10,
    fontSize: 13.5, fontFamily: FONT, outline: 'none',
    boxSizing: 'border-box', background: 'white', color: '#1f2937',
    transition: 'border-color 0.2s',
  }

  const labelStyle = {
    fontSize: 13, fontWeight: 600, color: '#111827',
    display: 'block', marginBottom: 5, fontFamily: FONT,
  }

  return (
    <main style={{ background: '#eef2f7', fontFamily: FONT, paddingTop: 110 }}>

      <section style={{ maxWidth: 1100, margin: '0 auto', padding: isMobile ? '16px 16px 16px' : '0px 40px 16px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr' : '420px 1fr', gap: 56, alignItems: 'center' }}>

        {/* LEFT — circular photo */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
          style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>

          <div style={{
            width: '100%',
            maxWidth: 300,
            aspectRatio: '1 / 1',
            borderRadius: '50%',
            overflow: 'hidden',
            boxShadow: '0 16px 56px rgba(0,0,0,0.15)',
            flexShrink: 0,
          }}>
            <img src="/contact.png" alt="Tibbi mütəxəssis"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
          </div>

          {/* Logo card */}
          <div style={{
            position: 'absolute', bottom: 12, left: 12,
            background: 'white', borderRadius: 14,
            padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10,
            boxShadow: '0 8px 32px rgba(0,0,0,0.14)', minWidth: 190,
          }}>
            <img src="/yenilogo.png" alt="Aslan Medical"
              style={{ height: 36, maxWidth: 140, width: 'auto', objectFit: 'contain' }}
              onError={e => e.target.style.display = 'none'} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 900, color: NAVY, letterSpacing: '0.1em', fontFamily: "'Raleway', sans-serif" }}>ASLAN</div>
              <div style={{ fontSize: 8.5, fontWeight: 700, color: TEAL, letterSpacing: '0.18em', textTransform: 'uppercase' }}>MEDICAL CENTER</div>
            </div>
          </div>
        </motion.div>

        {/* RIGHT — form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }} style={{ paddingTop: 8 }}>

<h1 style={{ fontSize: 32, fontWeight: 900, color: NAVY, margin: '0 0 14px', lineHeight: 1.05, fontFamily: "'Raleway', sans-serif" }}>
            {t('contact.title')}
          </h1>

          {success && (
            <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: '10px 14px', marginBottom: 14, color: '#15803d', fontSize: 13, fontFamily: FONT }}>
              ✓ {t('contact.successMsg')}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* Name */}
            <div>
              <label style={labelStyle}>{t('contact.nameLabel')}</label>
              <div style={{ position: 'relative' }}>
                <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                  placeholder={t('contact.namePlaceholder')} style={inputStyle}
                  onFocus={e => e.target.style.borderColor = TEAL}
                  onBlur={e => e.target.style.borderColor = '#d1d5db'} />
                <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }}>
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </span>
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={labelStyle}>{t('contact.emailLabel')}</label>
              <div style={{ position: 'relative' }}>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  placeholder={t('contact.emailPlaceholder')} style={inputStyle}
                  onFocus={e => e.target.style.borderColor = TEAL}
                  onBlur={e => e.target.style.borderColor = '#d1d5db'} />
                <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }}>
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </span>
              </div>
            </div>

            {/* Message */}
            <div>
              <label style={labelStyle}>{t('contact.messageLabel')}</label>
              <textarea value={form.message} onChange={e => set('message', e.target.value)}
                placeholder={t('contact.messagePlaceholder')}
                rows={3}
                style={{ ...inputStyle, height: 'auto', padding: '10px 14px', resize: 'none', minHeight: 68 }}
                onFocus={e => e.target.style.borderColor = TEAL}
                onBlur={e => e.target.style.borderColor = '#d1d5db'} />
            </div>

            {/* Checkbox */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, cursor: 'pointer', fontSize: 12.5, color: '#6b7280', fontFamily: FONT, lineHeight: 1.5 }}>
              <input type="checkbox" checked={form.agreed} onChange={e => set('agreed', e.target.checked)}
                style={{ width: 14, height: 14, marginTop: 2, accentColor: TEAL, cursor: 'pointer', flexShrink: 0 }} />
              <span>
                <a href="#" style={{ color: TEAL, textDecoration: 'none', fontWeight: 600 }}>{t('contact.agree')}</a>
                {' '}{t('contact.and')}{' '}
                <a href="#" style={{ color: TEAL, textDecoration: 'none', fontWeight: 600 }}>{t('contact.privacyPolicy')}</a>
                {' '}{t('contact.acceptText')}
              </span>
            </label>

            {/* Submit */}
            <button onClick={handleSubmit} disabled={loading}
              style={{
                width: '100%', height: 42, background: loading ? '#6b7280' : TEAL,
                color: 'white', border: 'none', borderRadius: 10,
                fontSize: 13.5, fontWeight: 700, fontFamily: FONT,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(0,132,142,0.3)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = '#006b74'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(0,132,142,0.4)' }}}
              onMouseLeave={e => { if (!loading) { e.currentTarget.style.background = TEAL; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,132,142,0.3)' }}}
            >
              {loading ? 'Göndərilir...' : (
                <>
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  {t('contact.sendButton')}
                </>
              )}
            </button>

          </div>
        </motion.div>
      </section>
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: isMobile ? '0 16px 24px' : '0 40px 40px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2,1fr)' : 'repeat(3,1fr)', gap: 16 }}>

        <motion.div
          style={{ background: 'white', borderRadius: 16, padding: '20px 20px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #E2E8F0' }}
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          transition={{ ...fadeUp.visible.transition, delay: 0 }}
          whileHover={{ scale: 1.02 }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#1D8B95'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(29, 139, 149, 0.12)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.06)' }}
        >
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#e0f7fa', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <svg width="20" height="20" fill="none" stroke="#00848e" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 5.5 5.5l.76-.76a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z"/></svg>
          </div>
          <h3 style={{ fontSize: 12, fontWeight: 800, color: '#0a1628', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 10px', fontFamily: "'Source Sans 3', sans-serif" }}>{t('contact.callUs')}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {['+994 50 836 36 94'].map(p => (
              <a key={p} href={`tel:${p.replace(/\s/g,'')}`}
                style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#4b5563', fontSize: 13, textDecoration: 'none', fontFamily: "'Source Sans 3', sans-serif" }}>
                <svg width="12" height="12" fill="none" stroke="#00848e" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 5.5 5.5l.76-.76a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z"/></svg>
                {p}
              </a>
            ))}
          </div>
        </motion.div>

        <motion.div
          style={{ background: 'white', borderRadius: 16, padding: '20px 20px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #E2E8F0' }}
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          transition={{ ...fadeUp.visible.transition, delay: 0.05 }}
          whileHover={{ scale: 1.02 }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#1D8B95'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(29, 139, 149, 0.12)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.06)' }}
        >
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#e0f7fa', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <svg width="20" height="20" fill="none" stroke="#00848e" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
          <h3 style={{ fontSize: 12, fontWeight: 800, color: '#0a1628', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 10px', fontFamily: "'Source Sans 3', sans-serif" }}>{t('contact.location')}</h3>
          <p style={{ color: '#4b5563', fontSize: 13, margin: 0, lineHeight: 1.65, fontFamily: "'Source Sans 3', sans-serif" }}>
            Xətai ray., A. Cəlilov küçəsi<br />Bakı, Azərbaycan
          </p>
        </motion.div>

        <motion.div
          style={{ background: 'white', borderRadius: 16, padding: '20px 20px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #E2E8F0' }}
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          transition={{ ...fadeUp.visible.transition, delay: 0.1 }}
          whileHover={{ scale: 1.02 }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#1D8B95'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(29, 139, 149, 0.12)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.06)' }}
        >
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#e0f7fa', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <svg width="20" height="20" fill="none" stroke="#00848e" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <h3 style={{ fontSize: 12, fontWeight: 800, color: '#0a1628', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 10px', fontFamily: "'Source Sans 3', sans-serif" }}>{t('contact.hours')}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { day: 'B.E – Cümə', hours: '09:00 – 19:00', closed: false },
            ].map(r => (
              <div key={r.day} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontFamily: "'Source Sans 3', sans-serif" }}>
                <span style={{ color: '#6b7280', fontWeight: 500 }}>{r.day}</span>
                <span style={{ fontWeight: 700, color: r.closed ? '#ef4444' : '#111827' }}>{r.hours}</span>
              </div>
            ))}
          </div>
        </motion.div>

      </section>
    </main>
  )
}
