import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useFetch }      from '../../hooks/useFetch';
import { useBreakpoint } from '../../hooks/useBreakpoint';

const FONT    = "'Source Sans 3', 'Raleway', sans-serif";
const RALEWAY = "'Raleway', sans-serif";
const NAVY    = '#0a1628';
const TEAL    = '#00848e';

// max-w-7xl equivalent — aligns with all other homepage sections
const CONTAINER = { maxWidth: 1280, marginLeft: 'auto', marginRight: 'auto' };

// ── Skeleton card ──────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <motion.div
        animate={{ opacity: [0.45, 0.85, 0.45] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ height: 300, borderRadius: 20, background: '#e8edf2' }}
      />
      <div style={{ marginTop: 18 }}>
        <motion.div
          animate={{ opacity: [0.45, 0.85, 0.45] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.1 }}
          style={{ height: 18, width: '65%', borderRadius: 6, background: '#e8edf2' }}
        />
        <motion.div
          animate={{ opacity: [0.45, 0.85, 0.45] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
          style={{ height: 14, width: '45%', borderRadius: 6, background: '#e8edf2', marginTop: 8 }}
        />
      </div>
    </div>
  );
}

// ── Doctor card ────────────────────────────────────────────────────────────────
// Resolve image URL: external http → use directly; / path → prepend backend origin;
// empty → return null (falls back to initials).
function resolveImage(src) {
  if (!src) return null;
  if (src.startsWith('http')) return src;
  if (src.startsWith('/')) return `${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000'}${src}`;
  return src;
}

function DoctorCard({ doctor, index, navigate }) {
  const name     = doctor.userId?.fullName || doctor.fullName || doctor.name || 'Həkim';
  const imgSrc   = resolveImage(doctor.image);
  const initials = name.split(' ').map(w => w?.[0] || '').join('').toUpperCase().slice(0, 2) || 'DR';

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: 'easeOut' }}
      style={{ display: 'flex', flexDirection: 'column' }}
    >
      {/* Image block */}
      <div style={{
        position: 'relative',
        borderRadius: 20,
        overflow: 'hidden',
        background: 'linear-gradient(140deg, #0a1628 0%, #00848e 100%)',
        flexShrink: 0,
        boxShadow: '0 4px 20px rgba(10,22,40,0.10)',
        transition: 'box-shadow 0.3s, transform 0.3s',
        cursor: 'pointer',
      }}
        onClick={() => navigate('/doctors')}
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow = '0 12px 36px rgba(0,132,142,0.20)';
          e.currentTarget.style.transform = 'translateY(-4px)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(10,22,40,0.10)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={name}
            style={{ width: '100%', height: 300, objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
            onError={e => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}

        {/* Initials fallback */}
        <div style={{
          display: imgSrc ? 'none' : 'flex',
          width: '100%',
          height: 300,
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 52,
          fontWeight: 800,
          color: 'rgba(255,255,255,0.75)',
          fontFamily: RALEWAY,
          letterSpacing: '-0.02em',
        }}>
          {initials}
        </div>
      </div>

      {/* Text info */}
      <div style={{ marginTop: 18, paddingLeft: 2 }}>
        <div style={{ width: 32, height: 3, background: TEAL, borderRadius: 2, marginBottom: 10 }} />

        <h3 style={{ fontSize: 17, fontWeight: 700, color: NAVY, margin: 0, fontFamily: FONT, lineHeight: 1.3 }}>
          {name}
        </h3>

        <p style={{ fontSize: 13.5, color: '#64748b', margin: '4px 0 0', fontFamily: FONT, fontWeight: 500 }}>
          {doctor.specialty}
        </p>

        {doctor.department && (
          <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0', fontFamily: FONT }}>
            {doctor.department}
          </p>
        )}

        {doctor.experience > 0 && (
          <p style={{ fontSize: 12, color: '#94a3b8', margin: '3px 0 0', fontFamily: FONT }}>
            {doctor.experience} il təcrübə
          </p>
        )}
      </div>
    </motion.article>
  );
}

// ── Main section ──────────────────────────────────────────────────────────────
export default function DoctorsSection() {
  const navigate  = useNavigate();
  const { isMobile, isTablet } = useBreakpoint();

  const px   = isMobile ? 16 : isTablet ? 24 : 32;
  const py   = isMobile ? 64 : 96;
  const cols = isMobile ? 1 : isTablet ? 2 : 4;

  const { data, loading, error } = useFetch('/doctors', { limit: 8 });
  const doctors = Array.isArray(data) ? data : (Array.isArray(data?.doctors) ? data.doctors : []);

  return (
    <section style={{ background: '#f8fafc', paddingTop: py, paddingBottom: py, fontFamily: FONT }}>
      <div style={{ ...CONTAINER, paddingLeft: px, paddingRight: px, boxSizing: 'border-box' }}>

        {/* ── Section header ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: isMobile ? 40 : 60 }}
        >
          {/* Eyebrow */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(0,132,142,0.07)',
            border: '1px solid rgba(0,132,142,0.16)',
            borderRadius: 20,
            padding: '6px 16px',
            marginBottom: 18,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: TEAL, display: 'block' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: TEAL, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: FONT }}>
              Həkimlər
            </span>
          </div>

          {/* Heading */}
          <h2 style={{
            fontSize: isMobile ? 28 : 40,
            fontWeight: 800,
            color: NAVY,
            margin: '0 0 14px',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            fontFamily: RALEWAY,
          }}>
            Peşəkar Həkim Heyətimiz
          </h2>

          {/* Description */}
          <p style={{
            fontSize: 15,
            color: '#64748b',
            lineHeight: 1.8,
            maxWidth: 540,
            margin: '0 auto',
            fontFamily: FONT,
          }}>
            Aslan Medical Center-də pasiyentlərə fərdi yanaşma göstərən
            təcrübəli və ixtisaslaşmış həkimlər çalışır.
          </p>
        </motion.div>

        {/* ── Error ─────────────────────────────────────────────────────── */}
        {error && !loading && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#ef4444', fontFamily: FONT }}>
            Həkimlər yüklənərkən xəta baş verdi.
          </div>
        )}

        {/* ── Loading skeletons ─────────────────────────────────────────── */}
        {loading && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: isMobile ? 24 : 32,
          }}>
            {Array.from({ length: cols }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* ── Empty state ───────────────────────────────────────────────── */}
        {!loading && !error && doctors.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 0',
            color: '#94a3b8',
            fontFamily: FONT,
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e0"
              strokeWidth="1.5" style={{ marginBottom: 16, display: 'block', margin: '0 auto 16px' }}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <p style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>
              Hazırda həkim məlumatı əlavə edilməyib.
            </p>
          </div>
        )}

        {/* ── Doctor cards grid ─────────────────────────────────────────── */}
        {!loading && doctors.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: isMobile ? 24 : 32,
          }}>
            {doctors.map((doctor, i) => (
              <DoctorCard
                key={doctor._id}
                doctor={doctor}
                index={i}
                navigate={navigate}
              />
            ))}
          </div>
        )}

        {/* ── CTA ───────────────────────────────────────────────────────── */}
        {!loading && doctors.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            style={{ textAlign: 'center', marginTop: isMobile ? 40 : 56 }}
          >
            <button
              onClick={() => navigate('/doctors')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: NAVY,
                color: '#ffffff',
                border: 'none',
                borderRadius: 12,
                padding: '13px 32px',
                fontSize: 14,
                fontWeight: 700,
                fontFamily: FONT,
                cursor: 'pointer',
                letterSpacing: '0.01em',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = TEAL; }}
              onMouseLeave={e => { e.currentTarget.style.background = NAVY; }}
            >
              Bütün həkimlərə bax
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </motion.div>
        )}

      </div>
    </section>
  );
}
