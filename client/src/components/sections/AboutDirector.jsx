import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  const { isMobile } = useBreakpoint()
  const [modalOpen, setModalOpen] = useState(false)
  const navigate = useNavigate()

  const circleSize = isMobile ? '110px' : '165px'

  return (
    <>
      <section style={{
        background: '#ffffff',
        padding: isMobile ? '60px 0' : '80px 0',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: isMobile ? '0 20px' : '0 40px',
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? '32px' : '60px',
          flexDirection: isMobile ? 'column' : 'row',
        }}>

          {/* COLUMN 1 — Left text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ flex: 1, minWidth: 0 }}
          >
            <h2 style={{
              fontSize: 'clamp(28px, 3.5vw, 42px)',
              fontWeight: 800,
              color: '#0a1628',
              lineHeight: 1.2,
              marginBottom: '20px',
              fontFamily: FONT,
            }}>
              Klinik Proqramlar
            </h2>
            <p style={{
              fontSize: '15px',
              color: '#4a5568',
              lineHeight: 1.8,
              marginBottom: 0,
              fontFamily: FONT,
            }}>
              Aslan Medical Center 30-dan çox ixtisas üzrə diaqnostika, cərrahiyyə, kardiologiya, pediatriya və terapiya xidmətləri göstərir. Beynəlxalq sertifikatlı həkimlərimiz və son texnologiyalı avadanlıqlarımız hər pasiyentə dəqiq müalicə təmin edir.
            </p>
          </motion.div>

          {/* COLUMN 2 — Center large circle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            style={{ flexShrink: 0 }}
          >
            <div style={{
              width: isMobile ? '240px' : '380px',
              height: isMobile ? '240px' : '380px',
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
                  width: '91%', height: '91%',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  display: 'block',
                }}
                onError={e => { e.currentTarget.style.background = '#e8f4f8'; }}
              />
            </div>
          </motion.div>

          {/* COLUMN 3 — Right 2x2 mini circles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ flexShrink: 0 }}
          >
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: isMobile ? '10px' : '16px',
            }}>
              {['/client2.jpeg', '/client3.jpeg', '/client4.jpeg'].map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  style={{
                    width: circleSize, height: circleSize,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                  onError={e => { e.currentTarget.style.background = '#e8f4f8'; }}
                />
              ))}
              <img
                src="/client5.jpeg"
                alt=""
                style={{
                  width: isMobile ? '110px' : '165px',
                  height: isMobile ? '110px' : '165px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  display: 'block',
                }}
                onError={e => { e.currentTarget.style.background = '#e8f4f8'; }}
              />
            </div>
          </motion.div>

        </div>
      </section>

      {/* ── Modal ── */}
      <AnimatePresence>
        {modalOpen && (
          <>
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
            <div style={{
              position: 'fixed', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 9999, padding: '20px', pointerEvents: 'none',
            }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                style={{
                  width: '640px', maxWidth: '100%', maxHeight: '85vh',
                  overflowY: 'auto', background: 'white', borderRadius: '20px',
                  boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
                  fontFamily: FONT, pointerEvents: 'all',
                }}
              >
                <div style={{
                  background: 'linear-gradient(135deg, #0a1628 0%, #00848e 100%)',
                  padding: '32px 36px', borderRadius: '20px 20px 0 0', position: 'relative',
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
