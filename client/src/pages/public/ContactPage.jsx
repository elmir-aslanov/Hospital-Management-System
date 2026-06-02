import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import api from '../../api/axios'

const FONT = "'Source Sans 3', 'Raleway', sans-serif"
const TEAL = '#00848e'
const NAVY = '#0a1628'

export default function ContactPage() {
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
    width: '100%', height: 42, padding: '0 40px 0 14px',
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
    <main style={{ background: '#eef2f7', minHeight: '100vh', fontFamily: FONT }}>

      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 40px 28px', display: 'grid', gridTemplateColumns: '420px 1fr', gap: 56, alignItems: 'start' }}>

        {/* LEFT — circular photo */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
          style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          <div style={{
            width: '100%',
            maxWidth: 380,
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
            <img src="/logo.png" alt="Aslan Medical"
              style={{ height: 36, width: 36, objectFit: 'contain' }}
              onError={e => e.target.style.display = 'none'} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 900, color: NAVY, letterSpacing: '0.1em', fontFamily: "'Raleway', sans-serif" }}>ASLAN</div>
              <div style={{ fontSize: 8.5, fontWeight: 700, color: TEAL, letterSpacing: '0.18em', textTransform: 'uppercase' }}>MEDICAL CENTER</div>
            </div>
          </div>
        </motion.div>

        {/* RIGHT — form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }} style={{ paddingTop: 8 }}>

<h1 style={{ fontSize: 40, fontWeight: 900, color: NAVY, margin: '0 0 18px', lineHeight: 1.05, fontFamily: "'Raleway', sans-serif" }}>
            Bizimlə<br />Əlaqə
          </h1>

          {success && (
            <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: '10px 14px', marginBottom: 14, color: '#15803d', fontSize: 13, fontFamily: FONT }}>
              ✓ Mesajınız qəbul edildi. Tezliklə sizinlə əlaqə saxlayacağıq.
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Name */}
            <div>
              <label style={labelStyle}>Ad</label>
              <div style={{ position: 'relative' }}>
                <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                  placeholder="Tam adınızı daxil edin" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = TEAL}
                  onBlur={e => e.target.style.borderColor = '#d1d5db'} />
                <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }}>
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </span>
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={labelStyle}>E-poçt</label>
              <div style={{ position: 'relative' }}>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  placeholder="E-poçt ünvanınızı daxil edin" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = TEAL}
                  onBlur={e => e.target.style.borderColor = '#d1d5db'} />
                <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }}>
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </span>
              </div>
            </div>

            {/* Message */}
            <div>
              <label style={labelStyle}>Mesaj</label>
              <textarea value={form.message} onChange={e => set('message', e.target.value)}
                placeholder="Sizə necə kömək edə bilərik?"
                rows={3}
                style={{ ...inputStyle, height: 'auto', padding: '10px 14px', resize: 'none', minHeight: 76 }}
                onFocus={e => e.target.style.borderColor = TEAL}
                onBlur={e => e.target.style.borderColor = '#d1d5db'} />
            </div>

            {/* Checkbox */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, cursor: 'pointer', fontSize: 12.5, color: '#6b7280', fontFamily: FONT, lineHeight: 1.5 }}>
              <input type="checkbox" checked={form.agreed} onChange={e => set('agreed', e.target.checked)}
                style={{ width: 14, height: 14, marginTop: 2, accentColor: TEAL, cursor: 'pointer', flexShrink: 0 }} />
              <span>
                <a href="#" style={{ color: TEAL, textDecoration: 'none', fontWeight: 600 }}>Xidmət Şərtlərini</a>
                {' '}və{' '}
                <a href="#" style={{ color: TEAL, textDecoration: 'none', fontWeight: 600 }}>Məxfilik Siyasətini</a>
                {' '}qəbul edirəm
              </span>
            </label>

            {/* Submit */}
            <button onClick={handleSubmit} disabled={loading}
              style={{
                width: '100%', height: 46, background: loading ? '#6b7280' : TEAL,
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
                  MESAJ GÖNDƏR
                </>
              )}
            </button>

          </div>
        </motion.div>
      </section>
    </main>
  )
}
