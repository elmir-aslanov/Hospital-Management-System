import { useState } from 'react'
import { motion } from 'framer-motion'
import { showSuccess, showError, showWarning } from '../../utils/alert'
import { fadeUp } from '../../utils/animations'

const FONT  = "'Source Sans 3', 'Raleway', sans-serif"
const TEAL  = '#1D8B95'
const TEAL_HVR = 'linear-gradient(135deg, #0E8F96 0%, #159f92 100%)'
const TEAL_GRAD = 'linear-gradient(135deg, #1D8B95 0%, #1DB6A6 100%)'

/* ── Inline SVG icons ──────────────────────────────────────────────────── */
const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
)
const IconMail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
  </svg>
)
const IconPhone = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 5.5 5.5l.76-.76a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z"/>
  </svg>
)
const IconMapPin = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)
const IconMsg = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)
const IconSend = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
)

/* ── Shared styles ─────────────────────────────────────────────────────── */
const inputBase = {
  width: '100%', height: 60, padding: '0 16px 0 44px',
  borderRadius: 12, border: '1.5px solid #D7E5EA',
  fontSize: 14, fontFamily: FONT, boxSizing: 'border-box',
  outline: 'none', color: '#0B1D34', background: '#FAFEFF',
  transition: 'border-color 0.18s, box-shadow 0.18s',
}
const labelStyle = {
  fontSize: 13, fontWeight: 700, color: '#0B1D34',
  marginBottom: 8, display: 'block', fontFamily: FONT,
}
const iconPos = {
  position: 'absolute', left: 15, top: '50%',
  transform: 'translateY(-50%)', color: TEAL,
  pointerEvents: 'none', display: 'flex', alignItems: 'center',
}
const iconPosTop = {
  position: 'absolute', left: 15, top: 17,
  color: TEAL, pointerEvents: 'none',
  display: 'flex', alignItems: 'center',
}

function focusIn(e)  { e.target.style.borderColor = TEAL;   e.target.style.boxShadow = '0 0 0 3px rgba(29, 139, 149, 0.12)' }
function focusOut(e) { e.target.style.borderColor = '#D7E5EA'; e.target.style.boxShadow = 'none' }

/* ── Icon map keyed by field name ──────────────────────────────────────── */
const ICON_MAP = {
  ad:      <IconUser />,
  soyad:   <IconUser />,
  ataAdi:  <IconUser />,
  epoct:   <IconMail />,
  telefon: <IconPhone />,
  unvan:   <IconMapPin />,
}

const PLACEHOLDERS = {
  ad: 'Adınızı daxil edin',
  soyad: 'Soyadınızı daxil edin',
  ataAdi: 'Ata adınızı daxil edin',
  epoct: 'E-poçt ünvanınızı daxil edin',
  telefon: 'Telefon nömrənizi daxil edin',
  unvan: 'Ünvanınızı daxil edin',
}

/* ── Field row — defined OUTSIDE main component to prevent remount on each render ── */
function FieldGroup({ label, name, type = 'text', form, onChange }) {
  return (
    <div>
      <label style={labelStyle}>{label} <span style={{ color: '#E85D3F' }}>*</span></label>
      <div style={{ position: 'relative' }}>
        {ICON_MAP[name] && <span style={iconPos}>{ICON_MAP[name]}</span>}
        <input
          className="muraciet-input"
          type={type}
          name={name}
          value={form[name]}
          onChange={onChange}
          placeholder={PLACEHOLDERS[name]}
          style={inputBase}
          onFocus={focusIn}
          onBlur={focusOut}
        />
      </div>
    </div>
  )
}

export default function ElektronMuraciet() {
  const isMobile = window.innerWidth < 768

  const [form, setForm] = useState({ ad: '', soyad: '', ataAdi: '', epoct: '', telefon: '', unvan: '', metn: '' })
  const [loading,  setLoading]  = useState(false)
  const [hovering, setHovering] = useState(false)

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()

    const { ad, soyad, ataAdi, epoct, telefon, unvan, metn } = form
    if (!ad.trim() || !soyad.trim() || !ataAdi.trim() || !epoct.trim() || !telefon.trim() || !unvan.trim() || !metn.trim()) {
      showWarning('Zəhmət olmasa bütün vacib xanaları doldurun.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL?.replace('/api/v1','') || 'http://localhost:5000'}/api/v1/muraciet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ad, soyad, ataAdi, epoct, telefon, unvan, metn }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Xəta baş verdi')
      showSuccess('Müraciətiniz uğurla göndərildi.')
      setForm({ ad: '', soyad: '', ataAdi: '', epoct: '', telefon: '', unvan: '', metn: '' })
    } catch (err) {
      showError(err.message || 'Müraciət göndərilmədi. Yenidən cəhd edin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '40px 0', fontFamily: FONT }}>
      <style>{`
        .muraciet-input::placeholder,
        .muraciet-textarea::placeholder {
          color: #94A3B8;
          opacity: 1;
        }
      `}</style>

      {/* Info text section */}
      <motion.div
        style={{ maxWidth: 1280, margin: '0 auto', padding: isMobile ? '32px 16px 28px' : '48px 48px 40px' }}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <h2 style={{ fontSize: isMobile ? 24 : 28, fontWeight: 800, lineHeight: 1.25, color: '#0B1D34', marginBottom: 22, fontFamily: FONT }}>
          Hörmətli istifadəçi!
        </h2>
        <p style={{ maxWidth: 1200, fontSize: isMobile ? 15 : 16, fontWeight: 400, color: '#475569', lineHeight: isMobile ? 1.7 : 1.85, marginBottom: 18 }}>
          Aslan Medical Center-ə olan müraciətlər "Vətəndaşların müraciətləri haqqında" Azərbaycan Respublikasının Qanunu və digər qanunvericilik aktlarına uyğun olaraq qeydiyyata alınır və baxılır. Müraciətin mətni oxunaqlı olmalı, müraciətdə edilən təklif və ya tələb aydın ifadə edilməli, təhqir və böhtana yol verilməməlidir.
        </p>
        <p style={{ maxWidth: 1200, fontSize: isMobile ? 15 : 16, fontWeight: 400, color: '#475569', lineHeight: isMobile ? 1.7 : 1.85, marginBottom: 18 }}>
          Müraciətdə təhqir və böhtana yol verildikdə, yaxud müəllif özü barədə məlumatları dəqiq göstərmədikdə müraciətə baxılmır.
        </p>
        <p style={{ maxWidth: 1200, fontSize: isMobile ? 15 : 16, fontWeight: 400, color: '#475569', lineHeight: isMobile ? 1.7 : 1.85, marginBottom: 0 }}>
          Aslan Medical Center təhlükəsizlik səbəbindən bu domenlərdən məktub qəbul etmir: yandex.ru, mail.ru, list.ru, inbox.ru, bk.ru, yahoo.com.
        </p>
      </motion.div>

      {/* Form card */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: isMobile ? '0 16px 40px' : '0 48px 60px' }}>
        <motion.div
          style={{
            background: '#FFFFFF', borderRadius: 20, padding: isMobile ? 24 : 40,
            border: '1px solid rgba(29, 139, 149, 0.10)',
            boxShadow: '0 12px 35px rgba(11, 29, 52, 0.06)',
          }}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <form onSubmit={handleSubmit}>

            {/* Row 1 — Ad, Soyad, Ata adı */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr',
              gap: 24, marginBottom: 24,
            }}>
              <FieldGroup label="Ad"      name="ad"     form={form} onChange={handleChange} />
              <FieldGroup label="Soyad"  name="soyad"  form={form} onChange={handleChange} />
              <FieldGroup label="Ata adı" name="ataAdi" form={form} onChange={handleChange} />
            </div>

            {/* Row 2 — E-poçt, Telefon, Ünvan */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr',
              gap: 24, marginBottom: 24,
            }}>
              <FieldGroup label="E-poçt"  name="epoct"   type="email" form={form} onChange={handleChange} />
              <FieldGroup label="Telefon" name="telefon" type="tel"   form={form} onChange={handleChange} />
              <FieldGroup label="Ünvan"   name="unvan"               form={form} onChange={handleChange} />
            </div>

            {/* Row 3 — Mətn */}
            <div style={{ marginBottom: 28 }}>
              <label style={labelStyle}>Mətn <span style={{ color: '#E85D3F' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <span style={iconPosTop}><IconMsg /></span>
                <textarea
                  className="muraciet-textarea"
                  name="metn"
                  value={form.metn}
                  onChange={handleChange}
                  placeholder="Mesajınızı yazın..."
                  style={{
                    ...inputBase,
                    height: 'auto', minHeight: 200,
                    padding: '15px 16px 15px 44px',
                    resize: 'vertical',
                  }}
                  onFocus={focusIn}
                  onBlur={focusOut}
                />
              </div>
            </div>

            {/* Bottom row — messages + button */}
            <div style={{
              display: 'flex',
              justifyContent: isMobile ? 'stretch' : 'flex-end',
              alignItems: 'center',
              flexDirection: isMobile ? 'column' : 'row',
              gap: 16,
            }}>
              <div style={{ flex: 1 }} />

              <button
                type="submit"
                disabled={loading}
                style={{
                  background: loading ? '#7ec8cc' : (hovering ? TEAL_HVR : TEAL_GRAD),
                  color: '#fff', border: 'none',
                  padding: '14px 34px', fontSize: 14, fontWeight: 700,
                  borderRadius: 12, cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: FONT, display: 'inline-flex', alignItems: 'center', gap: 8,
                  transition: 'background 0.2s, box-shadow 0.2s, transform 0.2s',
                  boxShadow: loading ? 'none' : '0 12px 24px rgba(29, 139, 149, 0.22)',
                  width: isMobile ? '100%' : 'auto',
                  justifyContent: 'center',
                  transform: hovering && !loading ? 'scale(1.03)' : 'scale(1)',
                }}
                onMouseEnter={() => setHovering(true)}
                onMouseLeave={() => setHovering(false)}
              >
                {loading ? 'Göndərilir...' : <><IconSend /> Müraciət et</>}
              </button>
            </div>

          </form>
        </motion.div>
      </div>

    </div>
  )
}
