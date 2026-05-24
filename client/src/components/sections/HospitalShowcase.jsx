import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const TEAL = '#00848e';
const NAVY = '#0a1628';
const FONT = "'Source Sans 3','Raleway',sans-serif";

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
        padding: isMobile ? '64px 24px 72px' : '80px 72px 90px',
        overflow: 'hidden',
        fontFamily: FONT,
      }}
    >
      <div
        style={{
          maxWidth: '1320px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '0.95fr 1.05fr',
          gap: isMobile ? '42px' : '64px',
          alignItems: 'center',
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
              height: isMobile ? '340px' : '440px',
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
              marginBottom: '20px',
              fontFamily: FONT,
            }}
          >
            HAQQIMIZDA
          </div>

        <h2
          style={{
            margin: '0 0 24px',
            fontFamily: FONT,
            color: NAVY,
            fontSize: isMobile ? 'clamp(34px, 9vw, 44px)' : 'clamp(40px, 4vw, 56px)',
            lineHeight: 1.08,
            fontWeight: 800,
            letterSpacing: '-0.8px',
          }}
        >
          Bakının qəlbində{' '}
          <em
            style={{
              color: TEAL,
              fontStyle: 'normal',
              fontWeight: 800,
            }}
          >
            qayğı
          </em>{' '}
          mərkəzi.
        </h2>

        <p
          style={{
            margin: '0 0 24px',
            fontFamily: FONT,
            fontSize: isMobile ? '17px' : '18px',
            lineHeight: 1.7,
            color: 'rgba(10,22,40,0.68)',
            fontWeight: 400,
            maxWidth: '620px',
          }}
        >
          Aslan Medical Center yalnız bir xəstəxana deyil — burada hər xəstə üçün fərdi yanaşma, beş ulduzlu komfort və ən yüksək tibbi standartlar bir araya gəlir.
        </p>

        <p
          style={{
            margin: '0 0 24px',
            fontFamily: FONT,
            fontSize: isMobile ? '17px' : '18px',
            lineHeight: 1.7,
            color: 'rgba(10,22,40,0.68)',
            fontWeight: 400,
            maxWidth: '620px',
          }}
        >
          30+ ixtisas üzrə xidmət göstərən mərkəzimiz, son texnologiyalı diaqnostika avadanlıqları və beynəlxalq sertifikatlı həkimlərlə sizə dəstək olur.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))',
            columnGap: '40px',
            rowGap: '20px',
            marginTop: '30px',
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
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  background: '#18C4CF',
                  flex: '0 0 9px',
                }}
              />
              <span
                style={{
                  color: NAVY,
                  fontFamily: FONT,
                  fontWeight: 700,
                  fontSize: '16px',
                }}
              >
                {feature}
              </span>
            </div>
          ))}
        </div>
        </motion.div>
      </div>
    </section>
  );
}
