import { motion } from 'framer-motion';

const defaultStories = [
  {
    id: 1,
    name: 'Ad Soyad',
    condition: 'Xəstəlik, Ölkə',
    image: '/images/patient1.jpg',
  },
  {
    id: 2,
    name: 'Ad Soyad',
    condition: 'Xəstəlik, Ölkə',
    image: '/images/patient2.jpg',
  },
  {
    id: 3,
    name: 'Ad Soyad',
    condition: 'Xəstəlik, Ölkə',
    image: '/images/patient3.jpg',
  },
];

const defaultContent = {
  title: 'Pasiyent',
  titleHighlight: 'Hekayələri',
  description1:
    'Bunlar Aslan Medical Clinic-i seçən pasiyentlərin və ailələrinin təcrübələridir. Diaqnozdan müalicəyə, sağalmadan sonrakı mərhələyə qədər şəxsi səyahətlərini izləyin.',
  description2:
    'Komandamız pasiyentlərimizin həyatında fərq yaratmağa həvəslidir və real insanların ilhamverici şəhadətlərini paylaşmaqdan şərəf duyuruq.',
  linkHref: '/pasiyentler',
  linkLabel: 'Onların dediklərinə bax',
};

function PatientCard({ story, style }) {
  const fallback = `https://placehold.co/${Math.round(style.width)}x${Math.round(style.height)}/0a1628/ffffff?text=Patient`;
  return (
    <motion.div
      whileHover={{ scale: 1.03, zIndex: 10 }}
      style={{
        position: 'absolute',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        cursor: 'pointer',
        ...style,
      }}
    >
      <img
        src={story.image}
        alt={story.name}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        onError={e => { e.target.src = fallback; }}
      />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(0deg, rgba(0,0,0,0.7) 0%, transparent 100%)',
        padding: '20px 14px 14px',
        color: 'white',
      }}>
        <div style={{ fontWeight: 700, fontSize: '14px' }}>{story.name}</div>
        <div style={{ fontSize: '12px', opacity: 0.85 }}>{story.condition}</div>
      </div>
    </motion.div>
  );
}

export default function PatientStories({
  stories = defaultStories,
  content = defaultContent,
}) {
  const { title, titleHighlight, description1, description2, linkHref, linkLabel } = content;

  return (
    <section style={{
      background: '#ffffff',
      padding: '80px 6vw',
      display: 'flex',
      alignItems: 'center',
      gap: '80px',
      overflow: 'hidden',
    }}>

      {/* LEFT — Photo collage */}
      <div style={{
        position: 'relative',
        width: '480px',
        height: '480px',
        flexShrink: 0,
      }}>

        {/* Dot pattern background */}
        <div style={{
          position: 'absolute',
          top: '10%', left: '5%',
          width: '200px', height: '200px',
          backgroundImage: 'radial-gradient(circle, #00BCD4 1px, transparent 1px)',
          backgroundSize: '16px 16px',
          opacity: 0.25,
          zIndex: 0,
        }} />

        {/* Card 1 — top left */}
        <PatientCard
          story={stories[0]}
          style={{ top: '5%', left: '0%', width: '220px', height: '220px', zIndex: 2 }}
        />

        {/* Card 2 — top right (larger, higher) */}
        <PatientCard
          story={stories[1]}
          style={{ top: '0%', left: '42%', width: '260px', height: '260px', zIndex: 3 }}
        />

        {/* Card 3 — bottom center */}
        <PatientCard
          story={stories[2]}
          style={{ top: '50%', left: '15%', width: '240px', height: '220px', zIndex: 2 }}
        />

      </div>

      {/* RIGHT — Text content */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{ maxWidth: '520px' }}
      >
        <h2 style={{
          fontSize: '40px',
          fontWeight: 800,
          color: '#0a1628',
          marginBottom: '20px',
          lineHeight: 1.2,
        }}>
          {title}{' '}
          <span style={{ color: '#00BCD4' }}>{titleHighlight}</span>
        </h2>

        <p style={{
          fontSize: '16px',
          color: '#4a5568',
          lineHeight: 1.8,
          marginBottom: '16px',
        }}>
          {description1}
        </p>

        <p style={{
          fontSize: '16px',
          color: '#4a5568',
          lineHeight: 1.8,
          marginBottom: '32px',
        }}>
          {description2}
        </p>

        <a href={linkHref} style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          color: '#00BCD4',
          fontWeight: 700,
          fontSize: '16px',
          textDecoration: 'none',
        }}>
          <span style={{
            width: '32px', height: '32px',
            borderRadius: '50%',
            background: '#00BCD4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '14px',
          }}>›</span>
          {linkLabel}
        </a>
      </motion.div>

    </section>
  );
}
