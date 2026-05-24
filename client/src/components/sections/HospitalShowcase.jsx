import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const TEAL = '#00848e';
const NAVY = '#0a1628';
const FONT = "'Source Sans 3','Raleway',sans-serif";
const SERIF_FONT = "'Cormorant Garamond','Playfair Display',Georgia,serif";

const features = [
  '24/7 Təcili yardım',
  'Beynəlxalq sığorta',
  'Online qəbul',
  'Lüks otaqlar',
];

export default function HospitalShowcase() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 900px)');
    const handleChange = () => setIsMobile(mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <section
      style={{
        background: '#f5fbfc',
        padding: isMobile ? '70px 24px' : '90px 72px',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: isMobile ? '56px' : '80px',
        alignItems: 'center',
        overflow: 'hidden',
        fontFamily: FONT,
      }}
    >
      <div
        style={{
          position: 'relative',
          borderRadius: '28px',
          overflow: 'visible',
        }}
      >
        <img
          src="/AslanMedical2.png"
          alt="Aslan Medical Center"
          style={{
            width: '100%',
            height: isMobile ? '420px' : '520px',
            objectFit: 'cover',
            borderRadius: '28px',
            display: 'block',
            boxShadow: '0 30px 80px rgba(10,22,40,0.16)',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        style={{
          maxWidth: '720px',
        }}
      >
        <div
          style={{
            color: TEAL,
            fontSize: '13px',
            fontWeight: 800,
            letterSpacing: '7px',
            textTransform: 'uppercase',
            marginBottom: '24px',
            fontFamily: FONT,
          }}
        >
          HAQQIMIZDA
        </div>

        <h2
          style={{
            margin: '0 0 32px',
            fontFamily: SERIF_FONT,
            color: NAVY,
            fontSize: isMobile ? 'clamp(42px, 12vw, 62px)' : 'clamp(54px, 6vw, 84px)',
            lineHeight: 0.95,
            fontWeight: 400,
            letterSpacing: '-1.5px',
          }}
        >
          Bakının qəlbində{' '}
          <em
            style={{
              fontStyle: 'italic',
              fontWeight: 300,
            }}
          >
            qayğı
          </em>{' '}
          mərkəzi.
        </h2>

        <p
          style={{
            margin: '0 0 20px',
            fontFamily: FONT,
            fontSize: isMobile ? '18px' : '21px',
            lineHeight: 1.55,
            color: 'rgba(10,22,40,0.68)',
            fontWeight: 400,
            maxWidth: '680px',
            marginBottom: '28px',
          }}
        >
          Aslan Medical Center yalnız bir xəstəxana deyil — burada hər xəstə üçün fərdi yanaşma, beş ulduzlu komfort və ən yüksək tibbi standartlar bir araya gəlir.
        </p>

        <p
          style={{
            margin: 0,
            fontFamily: FONT,
            fontSize: isMobile ? '18px' : '21px',
            lineHeight: 1.55,
            color: 'rgba(10,22,40,0.68)',
            fontWeight: 400,
            maxWidth: '680px',
            marginBottom: '28px',
          }}
        >
          30+ ixtisas üzrə xidmət göstərən mərkəzimiz, son texnologiyalı diaqnostika avadanlıqları və beynəlxalq sertifikatlı həkimlərlə sizə dəstək olur.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: '18px 28px',
            marginTop: '34px',
            maxWidth: '560px',
          }}
        >
          {features.map((feature) => (
            <div
              key={feature}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: '#18C4CF',
                  flex: '0 0 10px',
                }}
              />
              <span
                style={{
                  color: NAVY,
                  fontFamily: FONT,
                  fontWeight: 700,
                  fontSize: '17px',
                }}
              >
                {feature}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
