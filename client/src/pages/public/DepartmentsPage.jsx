import usePageTitle from '../../hooks/usePageTitle'
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { fadeUp } from '../../utils/animations';

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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="bg-white" style={{ fontFamily: FONT }}>

      {/* ── Hero / Banner ─────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${TEAL} 0%, #176F7E 48%, ${NAVY} 100%)`,
          padding: '72px 0 76px',
        }}
      >
        {/* subtle diagonal geometric overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: 0.08,
            backgroundImage: 'repeating-linear-gradient(45deg, #ffffff 0px, #ffffff 2px, transparent 2px, transparent 64px)',
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            opacity: 0.07, right: -128, top: -128, width: 390, height: 390,
            borderRadius: '50%', border: '42px solid #ffffff',
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            opacity: 0.08,
            right: 78,
            bottom: -96,
            width: 220,
            height: 220,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 46%, rgba(255,255,255,0) 70%)',
          }}
        />
        <style>{`
          .departments-hero-content {
            position: relative;
            width: 100%;
            max-width: 900px;
            margin: 0 auto;
            padding: 0 16px;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          .departments-hero-title {
            margin: 0;
            color: #ffffff;
            font-size: clamp(40px, 5vw, 64px);
            font-weight: 700;
            line-height: 1.08;
          }
          .departments-hero-subtitle {
            max-width: 760px;
            margin: 14px auto 0;
            color: rgba(255,255,255,0.86);
            font-size: clamp(16px, 1.8vw, 18px);
            line-height: 1.55;
            text-align: center;
          }
          .departments-hero-search {
            width: min(100%, 780px);
            margin: 28px auto 0;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 14px;
          }
          .departments-hero-field {
            height: 56px;
            flex: 1 1 auto;
            min-width: 0;
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 0 22px;
            background: #ffffff;
            border-radius: 999px;
            box-shadow: 0 18px 32px rgba(6,28,48,0.18);
          }
          .departments-hero-input {
            width: 100%;
            min-width: 0;
            border: 0;
            outline: 0;
            background: transparent;
            color: #1f2937;
            font-size: 16px;
          }
          .departments-hero-input::placeholder {
            color: #64748B;
          }
          .departments-hero-button {
            width: 132px;
            min-width: 132px;
            height: 56px;
            border: 0;
            border-radius: 999px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-size: 16px;
            font-weight: 700;
            line-height: 1;
            white-space: nowrap;
            cursor: pointer;
            box-shadow: 0 18px 32px rgba(6,28,48,0.18);
            transition: background 180ms ease, transform 180ms ease;
          }
          .departments-hero-button:hover {
            transform: translateY(-1px);
          }
          @media (max-width: 640px) {
            .departments-hero-search {
              max-width: 420px;
              flex-direction: column;
              gap: 12px;
            }
            .departments-hero-field,
            .departments-hero-button {
              width: 100%;
              min-width: 0;
            }
          }
        `}</style>

        <motion.div
          className="departments-hero-content"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          {/* Title */}
          <h1 className="departments-hero-title">
            Şöbələrimiz
          </h1>

          <p className="departments-hero-subtitle">
            Aslan Medical Center-də fəaliyyət göstərən bütün şöbələrə bağlı ətraflı məlumat əldə edə bilərsiniz.
          </p>

          {/* Search bar */}
          <div className="departments-hero-search">
            <label className="departments-hero-field">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Şöbə axtarın"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="departments-hero-input"
              />
            </label>
            <button
              type="button"
              className="departments-hero-button"
              style={{ background: TEAL }}
              onMouseEnter={e => { e.currentTarget.style.background = TEAL_HOVER }}
              onMouseLeave={e => { e.currentTarget.style.background = TEAL }}
            >
              Axtarın
            </button>
          </div>
        </motion.div>
      </section>

      {/* ── A-Z Letter Navigation ────────────────────────────────────────*/}
      <section className="bg-white">
        <div className="px-4" style={{ maxWidth: 1280, width: '100%', margin: '0 auto', padding: '32px 16px' }}>
          <motion.div
            className="flex flex-wrap gap-2"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {ALPHABET.map(letter => {
              const hasItems = grouped.has(letter);
              const isActive = hasItems && activeLetter === letter;
              return (
                <button
                  key={letter}
                  type="button"
                  onClick={() => hasItems && scrollToLetter(letter)}
                  className={`w-10 h-10 rounded text-base font-medium border transition-all
                    ${hasItems
                      ? (isActive
                          ? 'bg-[#1D8B95] text-white border-[#1D8B95] cursor-pointer hover:bg-[#1D8B95] hover:text-white hover:border-[#1D8B95] hover:scale-105'
                          : 'border-[#E2E8F0] text-[#0B1D34] cursor-pointer hover:bg-[#1D8B95] hover:text-white hover:border-[#1D8B95] hover:scale-105')
                      : 'border-[#E2E8F0] text-[#CBD5E1] cursor-not-allowed'
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
        <div className="px-4" style={{ maxWidth: 1280, width: '100%', margin: '0 auto', padding: '0 16px 80px' }}>

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

          {!error && !loading && grouped.size > 0 && ALPHABET.filter(letter => grouped.has(letter)).map((letter, idx) => {
            const items = grouped.get(letter);
            return (
              <motion.div
                key={letter}
                className="border-t border-[#E2E8F0] py-10 md:py-14 flex flex-col md:flex-row gap-6 md:gap-12"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ ...fadeUp.visible.transition, delay: (idx % 5) * 0.05 }}
              >
                <div className="md:w-32 flex-shrink-0">
                  <h2 id={`letter-${letter}`} className="text-6xl md:text-8xl font-extralight leading-none" style={{ color: TEAL, scrollMarginTop: 180 }}>
                    {letter}
                  </h2>
                </div>

                <div className="flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3">
                    {items.map(dept => (
                      <Link
                        key={dept._id}
                        to={`/departments/${dept.slug}`}
                        className="text-[15px] md:text-base hover:underline"
                        style={{ color: TEAL }}
                        onMouseEnter={e => { e.currentTarget.style.color = TEAL_HOVER }}
                        onMouseLeave={e => { e.currentTarget.style.color = TEAL }}
                      >
                        {dept.name}
                      </Link>
                    ))}
                  </div>

                  <div className="flex justify-end mt-6">
                    <button
                      type="button"
                      onClick={scrollToTop}
                      className="flex items-center gap-1 text-sm transition-colors transition-transform duration-200 hover:scale-105"
                      style={{ color: '#64748B' }}
                      onMouseEnter={e => { e.currentTarget.style.color = TEAL }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#64748B' }}
                    >
                      <span>↑</span> Yuxarı qayıt
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
