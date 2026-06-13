import usePageTitle from '../../hooks/usePageTitle'
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/axios';

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
    document.getElementById(`letter-${letter}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="bg-white" style={{ fontFamily: FONT }}>

      {/* ── Hero / Banner ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${TEAL} 0%, ${NAVY} 100%)`, padding: '90px 0' }}>
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
            opacity: 0.06, right: -120, top: -120, width: 360, height: 360,
            borderRadius: '50%', border: '40px solid #ffffff',
          }}
        />

        <motion.div
          className="relative px-4"
          style={{ maxWidth: 1320, margin: '0 auto' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Title */}
          <h1 className="text-center text-4xl md:text-5xl font-light text-white mb-8">Şöbələrimiz</h1>

          {/* Search bar */}
          <div className="flex items-center gap-2 max-w-lg mx-auto w-full">
            <label className="flex items-center bg-white rounded-full pl-4 pr-4 h-11 flex-1 min-w-0 gap-2 shadow-lg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Şöbə axtarın"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 min-w-0 outline-none text-sm text-gray-700 bg-transparent placeholder:text-[#64748B]"
              />
            </label>
            <button
              type="button"
              className="flex-shrink-0 h-11 flex items-center justify-center whitespace-nowrap rounded-full px-5 text-sm font-semibold text-white shadow-lg transition-colors"
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
        <div className="px-4" style={{ maxWidth: 1320, margin: '0 auto', padding: '32px 16px' }}>
          <div className="flex flex-wrap gap-2">
            {ALPHABET.map(letter => {
              const hasItems = grouped.has(letter);
              return (
                <button
                  key={letter}
                  type="button"
                  onClick={() => hasItems && scrollToLetter(letter)}
                  className={`w-10 h-10 rounded text-base font-medium border transition-all
                    ${hasItems
                      ? 'border-[#E2E8F0] text-[#0B1D34] cursor-pointer hover:bg-[#1D8B95] hover:text-white hover:border-[#1D8B95] hover:scale-105'
                      : 'border-[#E2E8F0] text-[#CBD5E1] cursor-not-allowed'
                    }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Departments List ─────────────────────────────────────────────*/}
      <section className="bg-white">
        <div className="px-4" style={{ maxWidth: 1320, margin: '0 auto', padding: '0 16px 80px' }}>

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
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: (idx % 5) * 0.05 }}
              >
                <div className="md:w-32 flex-shrink-0">
                  <h2 id={`letter-${letter}`} className="text-6xl md:text-8xl font-extralight leading-none" style={{ color: TEAL }}>
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
                      className="flex items-center gap-1 text-sm transition-colors"
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
