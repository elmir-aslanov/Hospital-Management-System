import usePageTitle from '../../hooks/usePageTitle'
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/axios';

const FONT = "'Source Sans 3', 'Raleway', sans-serif";
const TEAL = '#00848e';
const NAVY = '#0a1628';
const PER_PAGE = 10;

function FilterIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function ChevronIcon({ open }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 5 16 12 9 19" />
    </svg>
  );
}

function SkeletonRow() {
  return (
    <div className="bg-white rounded-xl p-6 sm:p-8" style={{ border: '1px solid #E2E8F0' }}>
      <motion.div animate={{ opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 1.4, repeat: Infinity }}
        style={{ height: 10, width: 120, borderRadius: 4, background: '#e8edf2', marginBottom: 14 }} />
      <motion.div animate={{ opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 1.4, repeat: Infinity, delay: 0.1 }}
        style={{ height: 22, width: '50%', borderRadius: 6, background: '#e8edf2', marginBottom: 12 }} />
      <motion.div animate={{ opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 1.4, repeat: Infinity, delay: 0.2 }}
        style={{ height: 12, width: '95%', borderRadius: 4, background: '#e8edf2', marginBottom: 6 }} />
      <motion.div animate={{ opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 1.4, repeat: Infinity, delay: 0.3 }}
        style={{ height: 12, width: '80%', borderRadius: 4, background: '#e8edf2' }} />
    </div>
  );
}

function DepartmentRow({ dept }) {
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 md:p-8 hover:shadow-md transition-shadow duration-200">
      <p className="uppercase tracking-widest text-xs text-[#64748B] font-medium mb-2" style={{ fontFamily: FONT }}>
        TİBBİ XİDMƏTLƏR
      </p>
      <div className="flex items-center gap-2">
        <h3 className="text-xl font-bold text-[#0B1D34]" style={{ fontFamily: "'Raleway', sans-serif" }}>
          {dept.name}
        </h3>
        <span className="w-7 h-7 rounded-full border border-[#0B1D34] flex items-center justify-center flex-shrink-0 text-[#0B1D34]">
          <ArrowRightIcon />
        </span>
      </div>
      {dept.description && (
        <p className="text-sm md:text-base text-[#64748B] mt-2 line-clamp-2" style={{ lineHeight: 1.6, fontFamily: FONT }}>
          {dept.description}
        </p>
      )}
    </div>
  );
}

function Sidebar({ searchInput, onSearchChange, filterGroups, openGroups, onToggleGroup }) {
  return (
    <aside className="w-full lg:w-[280px] flex-shrink-0">
      <div className="lg:sticky lg:top-24">
        {/* Search */}
        <div className="relative mb-6">
          <span className="absolute inset-y-0 left-3 flex items-center" style={{ color: '#94A3B8' }}>
            <SearchIcon />
          </span>
          <input
            type="text"
            value={searchInput}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Şöbə axtar..."
            aria-label="Şöbə axtar"
            className="w-full text-sm rounded-lg outline-none"
            style={{
              padding: '10px 14px 10px 36px', border: '1.5px solid #E2E8F0',
              color: NAVY, fontFamily: FONT,
            }}
          />
        </div>

        {/* Heading */}
        <div className="flex items-center gap-2 mb-3" style={{ color: NAVY }}>
          <FilterIcon />
          <h2 className="text-xl font-bold" style={{ fontFamily: "'Raleway', sans-serif" }}>Filtrlər</h2>
        </div>
        <div className="mb-4" style={{ borderBottom: '1px solid #E2E8F0' }} />

        {/* Filter groups */}
        {filterGroups.map(group => {
          const isOpen = openGroups.has(group.title);
          return (
            <div key={group.title} className="mb-4 pb-4" style={{ borderBottom: '1px solid #E2E8F0' }}>
              <button
                type="button"
                onClick={() => onToggleGroup(group.title)}
                className="w-full flex items-center justify-between text-left"
                style={{ color: NAVY, fontFamily: FONT }}
                aria-expanded={isOpen}
              >
                <span className="text-sm font-bold">{group.title}</span>
                <ChevronIcon open={isOpen} />
              </button>

              {isOpen && (
                <div className="mt-3 flex flex-col gap-2">
                  {group.options.map(opt => (
                    <label key={opt.label} className="flex items-center gap-2 text-sm cursor-default" style={{ color: '#334155', fontFamily: FONT }}>
                      <input type="radio" checked readOnly style={{ accentColor: TEAL }} />
                      <span>{opt.label} ({opt.count})</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}

function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  const items = Array.from({ length: pages }, (_, i) => i + 1);

  return (
    <nav aria-label="Şöbə səhifələri" className="flex justify-center gap-2 flex-wrap" style={{ marginTop: 32 }}>
      {items.map(item => (
        <button
          key={item}
          type="button"
          onClick={() => onChange(item)}
          style={{
            minWidth: 36, height: 36, borderRadius: 8, padding: '0 10px',
            border: `1.5px solid ${item === page ? TEAL : '#E2E8F0'}`,
            background: item === page ? TEAL : '#fff',
            color: item === page ? '#fff' : '#64748B',
            fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: FONT,
          }}
        >
          {item}
        </button>
      ))}
    </nav>
  );
}

export default function DepartmentsPage() {
  usePageTitle('Şöbələr', 'Tibbi mərkəzimizin ixtisaslaşmış şöbələri.')

  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('axtar') || '';
  const page  = Math.max(1, parseInt(searchParams.get('sehife'), 10) || 1);
  const sort  = searchParams.get('siralama') === 'za' ? 'za' : 'az';

  const [searchInput, setSearchInput] = useState(query);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(false);
  const [openGroups, setOpenGroups]   = useState(() => new Set(['Məzmun növü']));

  useEffect(() => { setSearchInput(query); }, [query]);

  const updateParams = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    setSearchParams(next);
  };

  // Debounced search -> sync to URL
  useEffect(() => {
    const handle = setTimeout(() => {
      const trimmed = searchInput.trim();
      if (trimmed !== query) updateParams({ axtar: trimmed, sehife: '' });
    }, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  useEffect(() => {
    api.get('/departments')
      .then(res => {
        const data = res.data?.data ?? res.data;
        setDepartments(Array.isArray(data) ? data : []);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const toggleGroup = (title) => {
    setOpenGroups(prev => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  };

  const filtered = useMemo(() => {
    let list = departments;
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(d =>
        (d.name || '').toLowerCase().includes(q) ||
        (d.description || '').toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      const cmp = (a.name || '').localeCompare(b.name || '', 'az');
      return sort === 'za' ? -cmp : cmp;
    });
  }, [departments, query, sort]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const startIdx = total === 0 ? 0 : (currentPage - 1) * PER_PAGE + 1;
  const endIdx = Math.min(currentPage * PER_PAGE, total);
  const paged = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const filterGroups = useMemo(() => ([
    {
      title: 'Məzmun növü',
      options: [
        { label: 'Tibbi xidmətlər', count: departments.length },
      ],
    },
  ]), [departments.length]);

  const handlePageChange = (next) => {
    updateParams({ sehife: next > 1 ? String(next) : '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (value) => {
    updateParams({ siralama: value === 'az' ? '' : value, sehife: '' });
  };

  const resetSearch = () => {
    setSearchInput('');
    updateParams({ axtar: '', sehife: '' });
  };

  return (
    <main style={{ fontFamily: FONT }}>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #0a1628 0%, #00848e 100%)', padding: '72px 0 80px', textAlign: 'center', width: '100%' }}>
        <div className="page-container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(77,208,225,0.85)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 14, fontFamily: FONT }}>
              Aslan Medical Center
            </p>
            <h1 style={{ fontSize: 42, fontWeight: 800, color: '#ffffff', margin: '0 0 16px', fontFamily: "'Raleway', sans-serif", lineHeight: 1.15 }}>
              Tibbi Şöbələrimiz
            </h1>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', maxWidth: 520, margin: '0 auto', fontFamily: FONT, lineHeight: 1.75 }}>
              Müasir tibbi texnologiyalar və peşəkar mütəxəssislərlə hər şöbədə keyfiyyətli xidmət.
            </p>
          </motion.div>
        </div>
      </section>

      {/* List + sidebar */}
      <section style={{ background: '#f8fafc', padding: '64px 0 80px' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 32px', boxSizing: 'border-box' }}>

          {error && !loading && (
            <p style={{ textAlign: 'center', color: '#ef4444', padding: '60px 0', fontFamily: FONT }}>
              Şöbələr yüklənərkən xəta baş verdi.
            </p>
          )}

          {!error && (
            <div className="flex flex-col lg:flex-row gap-10">
              <Sidebar
                searchInput={searchInput}
                onSearchChange={setSearchInput}
                filterGroups={filterGroups}
                openGroups={openGroups}
                onToggleGroup={toggleGroup}
              />

              <div className="flex-1 min-w-0">
                {/* Top bar */}
                <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
                  <p className="text-sm" style={{ color: '#64748B', fontFamily: FONT }}>
                    {loading ? ' ' : `${total} nəticədən ${startIdx}-${endIdx} göstərilir`}
                  </p>
                  <div className="flex items-center gap-2">
                    <label htmlFor="dept-sort" className="text-sm" style={{ color: '#64748B', fontFamily: FONT }}>Sırala</label>
                    <select
                      id="dept-sort"
                      value={sort}
                      onChange={e => handleSortChange(e.target.value)}
                      className="text-sm rounded-lg outline-none"
                      style={{ padding: '8px 12px', border: '1.5px solid #E2E8F0', color: NAVY, fontFamily: FONT, background: '#fff' }}
                    >
                      <option value="az">Əlifba (A-Z)</option>
                      <option value="za">Əlifba (Z-A)</option>
                    </select>
                  </div>
                </div>

                {loading && (
                  <div className="flex flex-col gap-5">
                    {[...Array(4)].map((_, i) => <SkeletonRow key={i} />)}
                  </div>
                )}

                {!loading && total === 0 && (
                  <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8', fontFamily: FONT }}>
                    <p style={{ fontSize: 16, fontWeight: 600, marginBottom: query ? 16 : 0 }}>
                      {query ? 'Nəticə tapılmadı' : 'Hazırda şöbə məlumatı əlavə edilməyib.'}
                    </p>
                    {query && (
                      <button
                        type="button"
                        onClick={resetSearch}
                        style={{
                          padding: '9px 22px', borderRadius: 20, border: `1.5px solid ${TEAL}`,
                          background: '#fff', color: TEAL, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                        }}
                      >
                        Sıfırla
                      </button>
                    )}
                  </div>
                )}

                {!loading && total > 0 && (
                  <>
                    <div className="flex flex-col gap-5">
                      {paged.map((dept, i) => <DepartmentRow key={dept._id ?? i} dept={dept} />)}
                    </div>
                    <Pagination page={currentPage} pages={totalPages} onChange={handlePageChange} />
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
