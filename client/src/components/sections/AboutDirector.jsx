import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useBreakpoint } from '../../hooks/useBreakpoint'

const FONT = "'Source Sans 3', 'Raleway', sans-serif"
const TEAL = '#00848e'

export default function AboutDirector() {
  const { t } = useTranslation()
  const { isMobile } = useBreakpoint()

  const titles = [
    'Təsisçi və Direktor, Aslan Medical Clinic',
    'Səhiyyə idarəçiliyi və pasiyent yönümlü xidmət',
    'Müasir tibbi xidmətlərin inkişafı',
    'Keyfiyyətli və etibarlı müalicə yanaşması',
  ]

  return (
    <section style={{
      background: '#ffffff',
      padding: isMobile ? '60px 0' : '80px 0',
      borderBottom: '1px solid rgba(0,0,0,0.06)',
      fontFamily: FONT,
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
            initial={{ opacity: 0, x: isMobile ? 0 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Photo with teal corner bracket */}
            <div style={{
              position: 'relative',
              marginBottom: '20px',
              display: 'inline-block',
              width: '100%',
            }}>
              <div style={{
                position: 'absolute',
                top: -8, left: -8,
                width: '40px', height: '40px',
                borderTop: `4px solid ${TEAL}`,
                borderLeft: `4px solid ${TEAL}`,
                borderRadius: '2px',
                zIndex: 2,
              }} />

              <img
                src="/mainphoto.png"
                alt="Elmir Aslan — Aslan Medical Clinic"
                style={{
                  width: '100%',
                  maxWidth: isMobile ? '100%' : '300px',
                  height: isMobile ? '280px' : '340px',
                  objectFit: 'cover',
                  objectPosition: 'center top',
                  borderRadius: '4px',
                  display: 'block',
                }}
                onError={e => {
                  e.target.src = 'https://placehold.co/300x340/0a1628/ffffff?text=Aslan+Medical'
                }}
              />
            </div>

            {/* Name */}
            <h3 style={{
              fontSize: '20px',
              fontWeight: 800,
              color: TEAL,
              marginBottom: '8px',
              lineHeight: 1.3,
              fontFamily: FONT,
            }}>
              Elmir Aslan
            </h3>

            {/* Teal divider */}
            <div style={{
              width: '40px', height: '2px',
              background: TEAL,
              marginBottom: '12px',
            }} />

            {/* Titles list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {titles.map((title, i) => (
                <p key={i} style={{
                  fontSize: '13px',
                  color: '#4a5568',
                  lineHeight: 1.5,
                  margin: 0,
                  paddingLeft: '10px',
                  borderLeft: '2px solid rgba(0,132,142,0.25)',
                  fontFamily: FONT,
                }}>
                  {title}
                </p>
              ))}
            </div>
          </motion.div>

          {/* RIGHT — Text content */}
          <motion.div
            initial={{ opacity: 0, x: isMobile ? 0 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <p style={{
              fontSize: '16px', color: '#2d3748',
              lineHeight: 1.9, marginBottom: '20px', fontFamily: FONT,
            }}>
              Aslan Medical Center müasir tibbi xidmətləri, peşəkar həkim
              komandasını və pasiyent yönümlü yanaşmanı bir araya gətirən
              özəl tibb mərkəzidir. Mərkəzimizin əsas məqsədi hər bir
              pasiyentə təhlükəsiz, etibarlı və yüksək keyfiyyətli tibbi
              xidmət təqdim etməkdir.
            </p>

            <p style={{
              fontSize: '16px', color: '#2d3748',
              lineHeight: 1.9, marginBottom: '20px', fontFamily: FONT,
            }}>
              Biz müayinə, diaqnostika, terapiya, cərrahiyyə və
              ixtisaslaşmış həkim konsultasiyaları üzrə xidmətlər
              göstəririk. Müasir avadanlıqlar, təcrübəli tibbi heyət
              və fərdi yanaşma sayəsində pasiyentlərin sağlamlıq
              ehtiyaclarına daha dəqiq və effektiv cavab verməyə çalışırıq.
            </p>

            <p style={{
              fontSize: '16px', color: '#2d3748',
              lineHeight: 1.9, marginBottom: '32px', fontFamily: FONT,
            }}>
              Aslan Medical Center-də əsas dəyərimiz güvən və qayğıdır.
              Hər bir pasiyentin özünü rahat, məlumatlı və diqqətlə
              əhatə olunmuş hiss etməsi bizim üçün önəmlidir. Məqsədimiz
              yalnız müalicə etmək deyil, həm də insanların sağlam həyat
              keyfiyyətini dəstəkləməkdir.
            </p>

            <button
              onClick={() => window.location.href = '/about'}
              style={{
                padding: '11px 28px',
                borderRadius: '24px',
                border: `2px solid ${TEAL}`,
                background: 'transparent',
                color: TEAL,
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: FONT,
                transition: 'all 0.2s',
                letterSpacing: '0.3px',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = TEAL
                e.currentTarget.style.color = 'white'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = TEAL
              }}
            >
              Ətraflı Oxu
            </button>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
