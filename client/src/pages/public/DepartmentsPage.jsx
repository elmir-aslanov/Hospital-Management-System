import usePageTitle from '../../hooks/usePageTitle'
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { fadeUp } from '../../utils/animations';
import { DeptIcon } from '../../components/Icons';

const FONT = "'Source Sans 3', 'Raleway', sans-serif";
const TEAL = '#1D8B95';
const TEAL_HOVER = '#0E8F96';
const NAVY = '#0B1D34';

const ALPHABET = [
  'A','B','C','Ç','D','E','Ə','F','G','Ğ','H','X','I','İ','J','K','Q',
  'L','M','N','O','Ö','P','R','S','Ş','T','U','Ü','V','Y','Z',
];

const firstLetter = (name) => (name || '').trim().charAt(0).toLocaleUpperCase('az-AZ');

const EmptyState = ({ icon, message }) => (
  <div style={{ textAlign: 'center', color: '#64748B', padding: '60px 0' }}>
    <div className="flex justify-center mb-3">{icon}</div>
    <p>{message}</p>
  </div>
);

export default function DepartmentsPage() {
  usePageTitle('Şöbələr', 'Tibbi mərkəzimizin ixtisaslaşmış şöbələri.')

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(false);
  const [search, setSearch]           = useState('');
  const [activeLetter, setActiveLetter] = useState(null);

  useEffect(() => {
    api.get('/departments')
      .then(res => {
        const data = res.data?.data ?? res.data;
        setDepartments(Array.isArray(data) ? data : []);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return departments;
    return departments.filter(dept => (dept.name || '').toLowerCase().includes(q));
  }, [departments, search]);

  const grouped = useMemo(() => {
    const sorted = [...filtered].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'az'));
    const map = new Map();
    sorted.forEach(dept => {
      const letter = firstLetter(dept.name);
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter).push(dept);
    });
    return map;
  }, [filtered]);

  const scrollToLetter = (letter) => {
    setActiveLetter(letter);
    document.getElementById(`letter-${letter}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Reset active letter if search filters out the currently highlighted section
  useEffect(() => {
    if (activeLetter && !grouped.has(activeLetter)) setActiveLetter(null);
  }, [grouped, activeLetter]);

  useEffect(() => {
    if (grouped.size === 0) return;
    const letters = ALPHABET.filter(letter => grouped.has(letter));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveLetter(entry.target.id.replace('letter-', ''));
          }
        });
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    );
    letters.forEach(letter => {
      const el = document.getElementById(`letter-${letter}`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [grouped]);

  return (
    <main className="bg-white" style={{ fontFamily: FONT }}>

      {/* ── Hero / Banner ─────────────────────────────────────────────── */}
      <style>{`
        .hero-search-input::placeholder { color: #94a3b8; }
        .hero-search-input::-webkit-input-placeholder { color: #94a3b8; }
        .hero-search-input::-moz-placeholder { color: #94a3b8; opacity: 1; }
      `}</style>
      <section
        className="relative overflow-hidden flex items-center"
        style={{
          backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.72) 35%, rgba(255,255,255,0.18) 100%), url('/sobeler.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center right',
          backgroundRepeat: 'no-repeat',
          minHeight: '480px',
          padding: '90px 0 100px',
        }}
      >
        <motion.div
          className="w-full flex flex-col items-center px-6"
          style={{ maxWidth: 1100, marginLeft: 'auto', marginRight: 'auto' }}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          {/* Split-colour title */}
          <h1
            className="m-0 text-center"
            style={{
              fontSize: 'clamp(42px, 6.5vw, 74px)',
              fontWeight: 700,
              letterSpacing: '0.1em',
              lineHeight: 1.05,
              userSelect: 'none',
              margin: 0,
            }}
          >
            <span style={{ color: TEAL }}>ŞÖBƏ </span>
            <span style={{ color: NAVY }}>TAPIN</span>
          </h1>

          {/* Underline search */}
          <div className="w-full mt-12" style={{ maxWidth: 880 }}>
            <form
              onSubmit={e => e.preventDefault()}
              style={{ position: 'relative', width: '100%' }}
            >
              <input
                type="text"
                placeholder="Şöbə axtarın..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="hero-search-input"
                style={{
                  width: '100%',
                  height: 60,
                  background: 'transparent',
                  border: 'none',
                  borderBottom: `2px solid ${NAVY}`,
                  outline: 'none',
                  fontSize: 'clamp(20px, 2.8vw, 32px)',
                  fontWeight: 400,
                  color: NAVY,
                  paddingLeft: 2,
                  paddingRight: 56,
                  boxSizing: 'border-box',
                  caretColor: TEAL,
                  fontFamily: FONT,
                  transition: 'border-color 0.25s',
                  display: 'block',
                }}
                onFocus={e => { e.currentTarget.style.borderBottomColor = TEAL }}
                onBlur={e => { e.currentTarget.style.borderBottomColor = NAVY }}
              />
              {/* Search icon — right side, acts as submit */}
              <button
                type="submit"
                aria-label="Axtarın"
                style={{
                  position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '4px 2px',
                  display: 'flex', alignItems: 'center',
                  color: '#b0bec5',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = TEAL }}
                onMouseLeave={e => { e.currentTarget.style.color = '#b0bec5' }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
              </button>
            </form>
          </div>
        </motion.div>
      </section>

      {/* ── A-Z Letter Navigation ────────────────────────────────────────*/}
      <section className="bg-white">
        <div style={{ maxWidth: 1280, width: '100%', margin: '0 auto', padding: '22px 24px 16px', boxSizing: 'border-box' }}>
          <motion.div
            className="flex flex-wrap justify-center gap-2.5"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {ALPHABET.filter(l => grouped.has(l)).map(letter => {
              const isActive = activeLetter === letter;
              return (
                <button
                  key={letter}
                  type="button"
                  onClick={() => scrollToLetter(letter)}
                  className={`w-11 h-11 md:w-14 md:h-[52px] rounded-lg text-lg md:text-xl font-semibold border transition-colors cursor-pointer
                    ${isActive
                      ? 'bg-[#1D8B95] text-white border-[#1D8B95]'
                      : 'border-[#E2E8F0] text-[#0B1D34] hover:bg-[#1D8B95] hover:text-white hover:border-[#1D8B95]'
                    }`}
                >
                  {letter}
                </button>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── Departments List ─────────────────────────────────────────────*/}
      <section className="bg-white">
        <div style={{ maxWidth: 1280, width: '100%', margin: '0 auto', padding: '0 24px 80px', boxSizing: 'border-box' }}>

          {error && !loading && (
            <EmptyState
              icon={
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              }
              message="Şöbələr yüklənərkən xəta baş verdi."
            />
          )}

          {!error && loading && (
            <>
              {[0, 1, 2].map(i => (
                <div key={i} className="border-t border-[#E2E8F0] py-10 md:py-14 flex flex-col md:flex-row gap-6 md:gap-12">
                  <div className="md:w-32 flex-shrink-0">
                    <div className="dept-skeleton-block" style={{ width: 56, height: 56, borderRadius: 8 }} />
                  </div>
                  <div className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <div key={j} className="dept-skeleton-block" style={{ height: 16, width: `${60 + (j % 3) * 10}%`, borderRadius: 4 }} />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              <style>{`
                .dept-skeleton-block { background: linear-gradient(90deg, #E2E8F0 25%, #F8FAFC 37%, #E2E8F0 63%); background-size: 400% 100%; animation: dept-skeleton-pulse 1.4s ease infinite; }
                @keyframes dept-skeleton-pulse { 0% { background-position: 100% 50% } 100% { background-position: 0 50% } }
              `}</style>
            </>
          )}

          {!error && !loading && departments.length === 0 && (
            <EmptyState
              icon={
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21h18" />
                  <path d="M5 21V7l7-4 7 4v14" />
                  <path d="M9 21v-6h6v6" />
                </svg>
              }
              message="Hazırda şöbə məlumatı əlavə edilməyib."
            />
          )}

          {!error && !loading && departments.length > 0 && grouped.size === 0 && (
            <EmptyState
              icon={
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              }
              message="Axtarışınıza uyğun şöbə tapılmadı."
            />
          )}

          {!error && !loading && grouped.size > 0 && (
            <>
              <style>{`
                .dept-groups-grid {
                  display: grid;
                  grid-template-columns: repeat(3, 1fr);
                  column-gap: 36px;
                  row-gap: 42px;
                }
                .dept-card-link {
                  display: flex;
                  align-items: center;
                  gap: 14px;
                  min-height: 58px;
                  padding: 0 20px;
                  background: #f6f8fa;
                  border-radius: 12px;
                  border: 1.5px solid transparent;
                  color: #0B1D34;
                  font-size: 16px;
                  font-weight: 600;
                  font-family: 'Source Sans 3', 'Raleway', sans-serif;
                  text-decoration: none;
                  margin-bottom: 8px;
                  transition: border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
                }
                .dept-card-link:last-child { margin-bottom: 0; }
                .dept-card-link:hover {
                  border-color: rgba(29, 139, 149, 0.28);
                  background: #ffffff;
                  box-shadow: 0 4px 14px rgba(29, 139, 149, 0.12);
                  color: #0B1D34;
                }
                .dept-card-arrow {
                  flex-shrink: 0;
                  transition: transform 0.18s ease;
                }
                .dept-card-link:hover .dept-card-arrow {
                  transform: translateX(3px);
                }
                @media (max-width: 1024px) {
                  .dept-groups-grid {
                    grid-template-columns: repeat(2, 1fr);
                    column-gap: 26px;
                    row-gap: 34px;
                  }
                }
                @media (max-width: 640px) {
                  .dept-groups-grid {
                    grid-template-columns: 1fr;
                    row-gap: 26px;
                  }
                  .dept-card-link {
                    min-height: 52px;
                    padding: 0 16px;
                    font-size: 15px;
                    gap: 12px;
                  }
                }
              `}</style>
              <div style={{
                background: '#ffffff',
                borderRadius: 12,
                border: '1px solid #e8edf2',
                boxShadow: '0 2px 10px rgba(11, 29, 52, 0.05)',
                padding: '28px 28px 34px',
              }}>
                <div className="dept-groups-grid">
                  {ALPHABET.filter(letter => grouped.has(letter)).map((letter, idx) => {
                    const items = grouped.get(letter);
                    return (
                      <motion.div
                        key={letter}
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        transition={{ ...fadeUp.visible.transition, delay: (idx % 6) * 0.05 }}
                      >
                        <div id={`letter-${letter}`} style={{ scrollMarginTop: 180 }}>
                          <h2 style={{ color: NAVY, margin: 0, fontSize: 28, fontWeight: 700, fontFamily: "'Raleway', sans-serif", lineHeight: 1 }}>{letter}</h2>
                          <span aria-hidden="true" style={{ display: 'block', width: 56, height: 3, borderRadius: 2, background: TEAL, marginTop: 8, marginBottom: 16 }} />
                        </div>
                        <div>
                          {items.map(dept => (
                            <Link
                              key={dept._id}
                              to={`/departments/${dept.slug}`}
                              className="dept-card-link"
                            >
                              <DeptIcon icon={dept.icon} name={dept.name} size={18} color="#1D8B95" />
                              <span>{dept.name}</span>
                              <svg className="dept-card-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1D8B95" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginLeft: 'auto' }}>
                                <path d="m9 18 6-6-6-6"/>
                              </svg>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
