import usePageTitle from '../../hooks/usePageTitle'
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const FONT = "'Source Sans 3', 'Raleway', sans-serif";
const TEAL = '#0B6E99';

const ALPHABET = [
  'A','B','C','Ç','D','E','Ə','F','G','H','X','I','İ','J','K','L','M',
  'N','O','Ö','P','Q','R','S','Ş','T','U','Ü','V','W','Y','Z',
];

const firstLetter = (name) => (name || '').trim().charAt(0).toLocaleUpperCase('az-AZ');

export default function DepartmentsPage() {
  usePageTitle('Şöbələr', 'Tibbi mərkəzimizin ixtisaslaşmış şöbələri.')

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(false);

  useEffect(() => {
    api.get('/departments')
      .then(res => {
        const data = res.data?.data ?? res.data;
        setDepartments(Array.isArray(data) ? data : []);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => {
    const sorted = [...departments].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'az'));
    const map = new Map();
    sorted.forEach(dept => {
      const letter = firstLetter(dept.name);
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter).push(dept);
    });
    return map;
  }, [departments]);

  const scrollToLetter = (letter) => {
    document.getElementById(`letter-${letter}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="bg-white" style={{ fontFamily: FONT }}>
      <div className="px-4" style={{ maxWidth: 1320, margin: '0 auto', padding: '40px 16px 80px' }}>

        {/* Breadcrumb */}
        <nav className="text-sm mb-8" style={{ color: '#6b7280' }}>
          <Link to="/" className="hover:underline" style={{ color: TEAL }}>Ana Səhifə</Link>
          <span className="mx-2">›</span>
          <Link to="/services" className="hover:underline" style={{ color: TEAL }}>Tibbi Xidmətlər</Link>
          <span className="mx-2">›</span>
          <span>Şöbələr</span>
        </nav>

        {error && !loading && (
          <p style={{ textAlign: 'center', color: '#ef4444', padding: '60px 0' }}>
            Şöbələr yüklənərkən xəta baş verdi.
          </p>
        )}

        {!error && loading && (
          <p style={{ textAlign: 'center', color: '#94a3b8', padding: '60px 0' }}>Yüklənir...</p>
        )}

        {!error && !loading && departments.length === 0 && (
          <p style={{ textAlign: 'center', color: '#94a3b8', padding: '60px 0' }}>Hazırda şöbə məlumatı əlavə edilməyib.</p>
        )}

        {!error && !loading && departments.length > 0 && (
          <>
            {/* A-Z navigation */}
            <div className="flex flex-wrap gap-1.5 mb-12">
              {ALPHABET.map(letter => (
                grouped.has(letter) ? (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => scrollToLetter(letter)}
                    className="w-10 h-10 border border-gray-400 flex items-center justify-center text-sm font-medium cursor-pointer hover:bg-gray-100"
                    style={{ color: TEAL }}
                  >
                    {letter}
                  </button>
                ) : (
                  <span
                    key={letter}
                    className="w-10 h-10 border border-gray-200 flex items-center justify-center text-sm font-medium text-gray-300"
                  >
                    {letter}
                  </span>
                )
              ))}
            </div>

            {/* Department list, grouped by letter */}
            {ALPHABET.filter(letter => grouped.has(letter)).map(letter => (
              <section key={letter} className="mb-12">
                <h2 id={`letter-${letter}`} className="text-5xl md:text-6xl font-light text-gray-800 mb-6">
                  {letter}
                </h2>

                {grouped.get(letter).map(dept => {
                  const phone = dept.phone || dept.contactPhone;
                  const fax   = dept.fax;
                  const room  = dept.room || dept.location || dept.floor;
                  const hasContact = phone || fax || room;

                  return (
                    <div key={dept._id} className="border-b border-gray-200 py-5">
                      <div className="font-bold text-[#111827] text-base">{dept.name}</div>

                      {hasContact && (
                        <div className="text-sm text-gray-700 leading-relaxed mt-1">
                          {phone && <div>Tel: {phone}</div>}
                          {fax   && <div>Faks: {fax}</div>}
                          {room  && <div>Otaq: {room}</div>}
                        </div>
                      )}
                    </div>
                  );
                })}

                <div className="mt-4 mb-8 flex items-center gap-1 justify-end">
                  <button type="button" onClick={scrollToTop} className="text-sm hover:underline flex items-center gap-1 cursor-pointer" style={{ color: TEAL, background: 'none', border: 'none', padding: 0 }}>
                    ↑ Yuxarı qayıt
                  </button>
                </div>
              </section>
            ))}
          </>
        )}
      </div>
    </main>
  );
}
