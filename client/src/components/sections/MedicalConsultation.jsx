import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useBreakpoint } from '../../hooks/useBreakpoint'
import api from '../../api/axios'

const FONT = "'Source Sans 3', 'Raleway', sans-serif"
const TEAL = '#00848e'

const inputStyle = {
  width: '100%', padding: '13px 14px 13px 44px',
  border: '1.5px solid #e2e8f0', borderRadius: '10px',
  fontSize: '14px', outline: 'none',
  fontFamily: FONT, boxSizing: 'border-box',
  transition: 'border-color 0.18s',
}

function Field({ icon, children }) {
  return (
    <div style={{ position: 'relative' }}>
      <span style={{
        position: 'absolute', left: '14px', top: '50%',
        transform: 'translateY(-50%)', fontSize: '16px', pointerEvents: 'none',
      }}>{icon}</span>
      {children}
    </div>
  )
}

function focusIn(e)  { e.target.style.borderColor = TEAL; }
function focusOut(e) { e.target.style.borderColor = '#e2e8f0'; }

export default function MedicalConsultation() {
  const { isMobile } = useBreakpoint()
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [loading,    setLoading]    = useState(false)
  const [aiResponse, setAiResponse] = useState('')
  const [submitted,  setSubmitted]  = useState(false)
  const [agreed,     setAgreed]     = useState(false)

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.phone.trim() || !form.message.trim()) {
      toast.warning('Zəhmət olmasa bütün məcburi sahələri doldurun.')
      return
    }
    if (!agreed) {
      toast.warning('Şərtləri qəbul edin.')
      return
    }

    setLoading(true)
    try {
      // 1. Get AI response
      const aiRes = await api.post('/ai/medical-consult', {
        message: form.message,
        name:    form.name,
      })
      const responseText = aiRes.data?.data?.response ?? ''
      setAiResponse(responseText)

      // 2. Save consultation + AI response to DB
      await api.post('/consultations', {
        ...form,
        phone:      '+994' + form.phone,
        aiResponse: responseText,
      })

      setSubmitted(true)
      toast.success('Müraciətiniz qəbul edildi!')
    } catch {
      toast.error('Xəta baş verdi. Yenidən cəhd edin.')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setSubmitted(false)
    setForm({ name: '', email: '', phone: '', message: '' })
    setAiResponse('')
    setAgreed(false)
  }

  return (
    <section style={{
      background: 'linear-gradient(135deg, #f0f7ff 0%, #e8f4f8 100%)',
      padding: isMobile ? '60px 0' : '80px 0',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: FONT,
    }}>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: isMobile ? '0 20px' : '0 40px',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: isMobile ? '40px' : '60px',
        alignItems: 'center',
      }}>

        {/* ── LEFT — Visual + Features ── */}
        {!isMobile && (
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 style={{
              fontSize: '48px', fontWeight: 800,
              color: '#0a1628', lineHeight: 1.15, marginBottom: '20px', fontFamily: FONT,
            }}>
              Tibbi<br/>
              <span style={{ color: TEAL }}>Danışma</span>
            </h2>

            <p style={{
              fontSize: '16px', color: '#4a5568',
              lineHeight: 1.8, marginBottom: '40px',
              maxWidth: '380px', fontFamily: FONT,
            }}>
              Həkimlərimizlə onlayn əlaqə qurun,
              sağlamlığınız ilə bağlı suallarınıza
              tez və etibarlı cavab alın.
            </p>

            {/* AI badge card */}
            <div style={{
              background: 'linear-gradient(135deg, #0a1628 0%, #00848e 100%)',
              borderRadius: '20px', padding: '32px',
              marginBottom: '24px', position: 'relative',
              overflow: 'hidden', minHeight: '200px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                position: 'absolute', top: -20, right: -20,
                width: '150px', height: '150px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)',
              }} />
              <div style={{
                position: 'absolute', bottom: -30, left: -20,
                width: '120px', height: '120px', borderRadius: '50%',
                background: 'rgba(0,188,212,0.1)',
              }} />
              <div style={{
                background: 'rgba(255,255,255,0.12)',
                borderRadius: '16px', padding: '20px 28px',
                textAlign: 'center', position: 'relative', zIndex: 1,
              }}>
                <div style={{ fontSize: '40px', marginBottom: '8px' }}>🤖</div>
                <p style={{ color: 'white', fontWeight: 700, fontSize: '18px', margin: '0 0 6px', fontFamily: FONT }}>
                  AI Tibbi Köməkçi
                </p>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: 0, fontFamily: FONT }}>
                  Claude AI ilə dəstəklənir
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '12px' }}>
                  <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4DD0E1' }}
                  />
                  <span style={{ color: '#4DD0E1', fontSize: '12px', fontWeight: 600, fontFamily: FONT }}>
                    Canlı · 24/7 Aktiv
                  </span>
                </div>
              </div>
            </div>

            {/* Feature pills */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              {[
                { icon: '🔒', title: 'Gizlilik',   desc: 'Məlumatlarınız qorunur' },
                { icon: '👨‍⚕️', title: 'Ekspert AI', desc: 'Tibbi tövsiyələr' },
                { icon: '⚡', title: 'Sürətli',    desc: 'Dərhal cavab' },
              ].map((f, i) => (
                <div key={i} style={{
                  background: 'white', borderRadius: '12px',
                  padding: '14px 12px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                }}>
                  <div style={{ fontSize: '20px', marginBottom: '6px' }}>{f.icon}</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#0a1628', marginBottom: '2px', fontFamily: FONT }}>{f.title}</div>
                  <div style={{ fontSize: '11px', color: '#718096', fontFamily: FONT }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── RIGHT — Form card ── */}
        <motion.div
          initial={{ opacity: 0, x: isMobile ? 0 : 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: isMobile ? 0 : 0.15 }}
        >
          {isMobile && (
            <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#0a1628', marginBottom: '24px', fontFamily: FONT }}>
              Tibbi <span style={{ color: TEAL }}>Danışma</span>
            </h2>
          )}

          <div style={{
            background: 'white', borderRadius: '24px',
            padding: isMobile ? '24px 20px' : '36px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'rgba(0,132,142,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
              }}>🩺</div>
              <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#0a1628', margin: 0, fontFamily: FONT }}>
                Tibbi Danışma
              </h3>
            </div>
            <div style={{
              width: '40px', height: '3px', background: TEAL,
              borderRadius: '2px', marginBottom: '28px', marginLeft: '52px',
            }} />

            {!submitted ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                {/* Name */}
                <Field icon="👤">
                  <input
                    placeholder="Adınız Soyadınız *"
                    value={form.name} onChange={set('name')}
                    style={inputStyle} onFocus={focusIn} onBlur={focusOut}
                  />
                </Field>

                {/* Email */}
                <Field icon="✉️">
                  <input
                    type="email" placeholder="E-Poçt Adresiniz"
                    value={form.email} onChange={set('email')}
                    style={inputStyle} onFocus={focusIn} onBlur={focusOut}
                  />
                </Field>

                {/* Phone */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{
                    padding: '13px 14px', border: '1.5px solid #e2e8f0',
                    borderRadius: '10px', background: '#f8fafc',
                    display: 'flex', alignItems: 'center', gap: '6px',
                    fontSize: '14px', color: '#4a5568', fontWeight: 600,
                    fontFamily: FONT, flexShrink: 0,
                  }}>
                    🇦🇿 +994
                  </div>
                  <input
                    placeholder="5XX XXX XX XX *"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))}
                    maxLength={9}
                    style={{ ...inputStyle, paddingLeft: '14px', flex: 1 }}
                    onFocus={focusIn} onBlur={focusOut}
                  />
                </div>

                {/* Message */}
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '16px', fontSize: '16px' }}>✏️</span>
                  <textarea
                    placeholder="Şikayətiniz və ya sualınız... *"
                    value={form.message} onChange={set('message')}
                    maxLength={1000} rows={4}
                    style={{
                      ...inputStyle,
                      resize: 'none',
                      paddingTop: '13px', paddingBottom: '28px',
                    }}
                    onFocus={focusIn} onBlur={focusOut}
                  />
                  <span style={{
                    position: 'absolute', bottom: '10px', right: '12px',
                    fontSize: '11px', color: '#a0aec0', fontFamily: FONT,
                  }}>
                    {form.message.length} / 1000
                  </span>
                </div>

                {/* Agreement */}
                <label style={{
                  display: 'flex', gap: '10px', alignItems: 'flex-start',
                  cursor: 'pointer', fontSize: '12px', color: '#4a5568',
                  lineHeight: 1.6, fontFamily: FONT,
                }}>
                  <input
                    type="checkbox" checked={agreed}
                    onChange={e => setAgreed(e.target.checked)}
                    style={{ marginTop: '2px', accentColor: TEAL, flexShrink: 0 }}
                  />
                  Aslan Medical Clinic-in məxfilik siyasətini oxudum
                  və şəxsi məlumatlarımın işlənməsinə razıyam.
                </label>

                {/* Submit */}
                <button
                  onClick={handleSubmit} disabled={loading}
                  style={{
                    width: '100%', padding: '14px',
                    background: loading ? '#a0aec0' : `linear-gradient(135deg, #0a1628, ${TEAL})`,
                    color: 'white', border: 'none', borderRadius: '12px',
                    fontSize: '15px', fontWeight: 700,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontFamily: FONT,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    transition: 'opacity 0.2s',
                  }}
                >
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                        style={{
                          width: '16px', height: '16px',
                          border: '2px solid rgba(255,255,255,0.3)',
                          borderTopColor: 'white', borderRadius: '50%',
                        }}
                      />
                      AI cavab hazırlayır...
                    </>
                  ) : '✈️ Müraciəti Göndər'}
                </button>

                <p style={{ textAlign: 'center', fontSize: '11px', color: '#a0aec0', margin: 0, fontFamily: FONT }}>
                  🔒 Məlumatlarınız 256-bit SSL şifrələmə ilə qorunur
                </p>
              </div>
            ) : (
              /* AI Response view */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div style={{
                  background: 'rgba(0,132,142,0.04)',
                  border: '1px solid rgba(0,132,142,0.2)',
                  borderRadius: '16px', padding: '20px', marginBottom: '20px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '24px' }}>🤖</span>
                    <div>
                      <p style={{ fontWeight: 700, color: '#0a1628', fontSize: '14px', margin: 0, fontFamily: FONT }}>
                        AI Tibbi Köməkçi
                      </p>
                      <p style={{ fontSize: '11px', color: TEAL, margin: 0, fontFamily: FONT }}>
                        Claude AI · Dərhal cavab
                      </p>
                    </div>
                  </div>
                  <p style={{ fontSize: '14px', color: '#2d3748', lineHeight: 1.8, margin: 0, fontFamily: FONT }}>
                    {aiResponse}
                  </p>
                </div>

                <div style={{
                  background: 'rgba(245,158,11,0.06)',
                  border: '1px solid rgba(245,158,11,0.2)',
                  borderRadius: '10px', padding: '12px 14px', marginBottom: '16px',
                }}>
                  <p style={{ fontSize: '12px', color: '#92400e', margin: 0, lineHeight: 1.6, fontFamily: FONT }}>
                    ⚠️ Bu AI tövsiyəsi məlumat xarakteri daşıyır.
                    Dəqiq diaqnoz üçün həkiminizlə əlaqə saxlayın.
                  </p>
                </div>

                <button
                  onClick={reset}
                  style={{
                    width: '100%', padding: '12px', background: 'white',
                    border: `2px solid ${TEAL}`, borderRadius: '10px',
                    color: TEAL, fontSize: '14px', fontWeight: 600,
                    cursor: 'pointer', fontFamily: FONT, transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = TEAL; e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = TEAL; }}
                >
                  Yeni Sual Ver
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>

      </div>
    </section>
  )
}
