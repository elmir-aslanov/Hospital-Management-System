import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
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

  const titles = [
    'Təsisçi və Direktor, Aslan Medical Clinic',
    'Səhiyyə idarəçiliyi və pasiyent yönümlü xidmət',
    'Müasir tibbi xidmətlərin inkişafı',
    'Keyfiyyətli və etibarlı müalicə yanaşması',
  ]


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
            Müasir Tibbi Xidmət, Peşəkar Komanda və Güvənli Müalicə
          </motion.h2>

          {/* Two column layout */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '320px 1fr',
            gap: isMobile ? '32px' : '64px',
            alignItems: 'flex-start',
          }}>

            {/* LEFT — Photo + Name + Titles */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {/* Photo — UCSF style */}
              <div style={{
                position: 'relative',
                display: 'inline-block',
                marginBottom: '20px',
              }}>
                {/* Teal corner bracket — top left */}
                <div style={{
                  position: 'absolute',
                  top: -10, left: -10,
                  width: '44px', height: '44px',
                  borderTop: `4px solid ${TEAL}`,
                  borderLeft: `4px solid ${TEAL}`,
                  zIndex: 2,
                  borderRadius: '2px 0 0 0',
                }} />

                <img
                  src="/mainphoto.png"
                  alt="Elmir Aslan — Aslan Medical Clinic"
                  style={{
                    width: isMobile ? '100%' : '300px',
                    height: isMobile ? '260px' : '360px',
                    objectFit: 'cover',
                    objectPosition: 'center top',
                    display: 'block',
                    borderRadius: '0 0 80px 0',
                    filter: 'contrast(1.02) brightness(1.01)',
                  }}
                  onError={e => {
                    e.target.src = 'https://placehold.co/300x360/e8f0f4/0a1628?text=Elmir+Aslan'
                  }}
                />
              </div>

              {/* Name */}
              <h3 style={{
                fontSize: '20px', fontWeight: 800,
                color: TEAL, marginBottom: '8px',
                lineHeight: 1.3, fontFamily: FONT,
              }}>
                Elmir Aslan
              </h3>

              <div style={{ width: '40px', height: '2px', background: TEAL, marginBottom: '12px' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {titles.map((title, i) => (
                  <p key={i} style={{
                    fontSize: '13px', color: '#4a5568',
                    lineHeight: 1.5, margin: 0,
                    paddingLeft: '10px',
                    borderLeft: '2px solid rgba(0,132,142,0.25)',
                    fontFamily: FONT,
                  }}>
                    {title}
                  </p>
                ))}
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
