import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useBreakpoint } from '../../hooks/useBreakpoint'

const FONT = "'Source Sans 3', 'Raleway', sans-serif"
const TEAL = '#00848e'

const DOT = () => (
  <span style={{
    width: '6px', height: '6px',
    borderRadius: '50%', background: TEAL,
    display: 'inline-block', flexShrink: 0,
  }} />
)

export default function AboutDirector() {
  const { t } = useTranslation()
  const { isMobile } = useBreakpoint()
  const [modalOpen, setModalOpen] = useState(false)
  const navigate = useNavigate()


  return (
    <>
      <section style={{
        background: '#ffffff',
        padding: isMobile ? '60px 0' : '80px 0',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        fontFamily: FONT,
        overflowX: 'hidden',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: isMobile ? '0 20px' : '0 80px',
        }}>

          {/* Section title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{
              fontSize: isMobile ? '22px' : '28px',
              fontWeight: 800,
              color: '#0a1628',
              marginBottom: '48px',
              lineHeight: 1.3,
              borderBottom: `3px solid ${TEAL}`,
              paddingBottom: '20px',
              fontFamily: FONT,
            }}
          >
            <span style={{ display: 'block' }}>Sağlamlığınız —</span>
            <span style={{ display: 'block', color: TEAL }}>Bizim Prioritetimiz.</span>
          </motion.h2>

          {/* Two column layout */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'auto 1fr',
            gap: isMobile ? '32px' : '64px',
            alignItems: 'flex-start',
          }}>

            {/* LEFT — Circular image grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '16px' : '24px', flexDirection: isMobile ? 'column' : 'row', flexShrink: 0 }}
            >
              {/* Large center circle */}
              <div style={{
                width: isMobile ? '220px' : '320px',
                height: isMobile ? '220px' : '320px',
                borderRadius: '50%',
                border: '2.5px solid #c9a84c',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <img
                  src="/client1.jpeg"
                  alt="Aslan Medical"
                  style={{
                    width: '92%', height: '92%',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                  onError={e => { e.currentTarget.style.background = '#e8f4f8'; }}
                />
                {/* ... badge */}
                <div style={{
                  position: 'absolute', top: '-8px', right: '20px',
                  background: TEAL, borderRadius: '20px', padding: '5px 12px',
                  color: 'white', fontSize: '18px', fontWeight: 700, letterSpacing: '3px',
                }}>···</div>
              </div>

              {/* 2x2 mini circles */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: isMobile ? '10px' : '14px',
                flexShrink: 0,
              }}>
                {['/client2.jpeg', '/client3.jpeg', '/client4.jpeg'].map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    style={{
                      width: isMobile ? '100px' : '140px',
                      height: isMobile ? '100px' : '140px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                    onError={e => { e.currentTarget.style.background = '#e8f4f8'; e.currentTarget.style.display = 'block'; }}
                  />
                ))}
                {/* "Həkimlərə bax" outline circle */}
                <div
                  onClick={() => navigate('/hekimler')}
                  style={{
                    width: isMobile ? '100px' : '140px',
                    height: isMobile ? '100px' : '140px',
                    borderRadius: '50%',
                    border: '2px solid #00848e',
                    background: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#00848e'; e.currentTarget.querySelector('span').style.color = 'white'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.querySelector('span').style.color = '#00848e'; }}
                >
                  <span style={{
                    fontSize: '13px', fontWeight: 700,
                    color: '#00848e', textAlign: 'center',
                    padding: '8px', fontFamily: FONT,
                    lineHeight: 1.3,
                    transition: 'color 0.2s',
                  }}>
                    Həkimlərə<br/>bax
                  </span>
                </div>
              </div>
            </motion.div>

            {/* RIGHT — Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <p style={{
                fontSize: isMobile ? '14px' : '16px', color: '#2d3748',
                lineHeight: isMobile ? 1.7 : 1.9, marginBottom: '20px', fontFamily: FONT,
              }}>
                Aslan Medical Center müasir tibbi xidmətləri, peşəkar həkim
                komandasını və pasiyent yönümlü yanaşmanı bir araya gətirən
                özəl tibb mərkəzidir. Mərkəzimizin əsas məqsədi hər bir
                pasiyentə təhlükəsiz, etibarlı və yüksək keyfiyyətli tibbi
                xidmət təqdim etməkdir.
              </p>

              <p style={{
                fontSize: isMobile ? '14px' : '16px', color: '#2d3748',
                lineHeight: isMobile ? 1.7 : 1.9, marginBottom: '20px', fontFamily: FONT,
              }}>
                Biz müayinə, diaqnostika, terapiya, cərrahiyyə və
                ixtisaslaşmış həkim konsultasiyaları üzrə xidmətlər
                göstəririk. Müasir avadanlıqlar, təcrübəli tibbi heyət
                və fərdi yanaşma sayəsində pasiyentlərin sağlamlıq
                ehtiyaclarına daha dəqiq və effektiv cavab verməyə çalışırıq.
              </p>

              <p style={{
                fontSize: isMobile ? '14px' : '16px', color: '#2d3748',
                lineHeight: isMobile ? 1.7 : 1.9, marginBottom: '32px', fontFamily: FONT,
              }}>
                Aslan Medical Center-də əsas dəyərimiz güvən və qayğıdır.
                Hər bir pasiyentin özünü rahat, məlumatlı və diqqətlə
                əhatə olunmuş hiss etməsi bizim üçün önəmlidir. Məqsədimiz
                yalnız müalicə etmək deyil, həm də insanların sağlam həyat
                keyfiyyətini dəstəkləməkdir.
              </p>

              <button
                onClick={() => setModalOpen(true)}
                style={{
                  padding: '11px 28px', borderRadius: '24px',
                  border: `2px solid ${TEAL}`, background: 'transparent',
                  color: TEAL, fontSize: '14px', fontWeight: 600,
                  cursor: 'pointer', fontFamily: FONT,
                  transition: 'all 0.2s', letterSpacing: '0.3px',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = TEAL; e.currentTarget.style.color = 'white'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = TEAL; }}
              >
                Ətraflı Oxu
              </button>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── Modal ── */}
      <AnimatePresence>
        {modalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              style={{
                position: 'fixed', inset: 0,
                background: 'rgba(10,22,40,0.7)',
                zIndex: 9998,
                backdropFilter: 'blur(6px)',
              }}
            />

            {/* Centering wrapper */}
            <div style={{
              position: 'fixed',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '20px',
              pointerEvents: 'none',
            }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              style={{
                width: '640px',
                maxWidth: '100%',
                maxHeight: '85vh',
                overflowY: 'auto',
                background: 'white',
                borderRadius: '20px',
                boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
                fontFamily: FONT,
                pointerEvents: 'all',
              }}
            >
              {/* Header */}
              <div style={{
                background: 'linear-gradient(135deg, #0a1628 0%, #00848e 100%)',
                padding: '32px 36px',
                borderRadius: '20px 20px 0 0',
                position: 'relative',
              }}>
                <button
                  onClick={() => setModalOpen(false)}
                  style={{
                    position: 'absolute', top: '16px', right: '16px',
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.15)', border: 'none',
                    color: 'white', fontSize: '18px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: FONT,
                  }}
                >✕</button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <img
                    src="/mainphoto.png"
                    alt="Elmir Aslan"
                    style={{
                      width: '72px', height: '72px', borderRadius: '50%',
                      objectFit: 'cover', objectPosition: 'center top',
                      border: '3px solid rgba(255,255,255,0.3)', flexShrink: 0,
                    }}
                    onError={e => { e.currentTarget.style.display = 'none'; }}
                  />
                  <div>
                    <h2 style={{ color: 'white', fontSize: '22px', fontWeight: 800, margin: '0 0 4px', fontFamily: FONT }}>
                      Elmir Aslan
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', margin: 0, fontFamily: FONT }}>
                      Təsisçi və Direktor — Aslan Medical Clinic
                    </p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: '36px' }}>

                {[
                  {
                    heading: 'Aslan Medical Clinic Haqqında',
                    text: 'Aslan Medical Clinic müasir tibbi xidmətləri, peşəkar həkim komandasını və pasiyent yönümlü yanaşmanı bir araya gətirən özəl tibb mərkəzidir. Mərkəzimizin əsas məqsədi hər bir pasiyentə təhlükəsiz, etibarlı və yüksək keyfiyyətli tibbi xidmət təqdim etməkdir.',
                  },
                  {
                    heading: 'Xidmətlərimiz',
                    text: 'Biz müayinə, diaqnostika, terapiya, cərrahiyyə və ixtisaslaşmış həkim konsultasiyaları üzrə xidmətlər göstəririk. Müasir avadanlıqlar, təcrübəli tibbi heyət və fərdi yanaşma sayəsində pasiyentlərin sağlamlıq ehtiyaclarına daha dəqiq və effektiv cavab verməyə çalışırıq.',
                  },
                  {
                    heading: 'Dəyərlərimiz',
                    text: 'Aslan Medical Center-də əsas dəyərimiz güvən və qayğıdır. Hər bir pasiyentin özünü rahat, məlumatlı və diqqətlə əhatə olunmuş hiss etməsi bizim üçün önəmlidir. Məqsədimiz yalnız müalicə etmək deyil, həm də insanların sağlam həyat keyfiyyətini dəstəkləməkdir.',
                  },
                ].map((s, i) => (
                  <div key={i} style={{ marginBottom: '28px' }}>
                    <h3 style={{
                      fontSize: '16px', fontWeight: 700, color: TEAL,
                      marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px',
                      fontFamily: FONT,
                    }}>
                      <DOT /> {s.heading}
                    </h3>
                    <p style={{ fontSize: '15px', color: '#2d3748', lineHeight: 1.85, margin: 0, fontFamily: FONT }}>
                      {s.text}
                    </p>
                  </div>
                ))}


              </div>
            </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
