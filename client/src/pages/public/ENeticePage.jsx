import { useState } from 'react';
import api from '../../api/axios';

const FONT = "'Source Sans 3', 'Raleway', sans-serif";
const TEAL = '#00848e';
const NAVY = '#0a1628';

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  fontSize: 14,
  border: '1.5px solid #e2e8f0',
  borderRadius: 10,
  fontFamily: FONT,
  outline: 'none',
  boxSizing: 'border-box',
  background: '#fff',
  color: NAVY,
  transition: 'border-color 0.18s',
};

const labelStyle = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: '#374151',
  marginBottom: 5,
  fontFamily: FONT,
};

function Spinner() {
  return (
    <span style={{
      display: 'inline-block', width: 15, height: 15,
      border: '2.5px solid rgba(255,255,255,0.4)', borderTopColor: '#fff',
      borderRadius: '50%', animation: 'spin 0.7s linear infinite',
      verticalAlign: 'middle', marginRight: 8,
    }} />
  );
}

export default function ENeticePage() {
  const [patientId, setPatientId] = useState('');
  const [dateOfBirth, setDob]     = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [result, setResult]       = useState(null);

  const focusIn  = e => e.target.style.borderColor = TEAL;
  const focusOut = e => e.target.style.borderColor = '#e2e8f0';

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!patientId.trim()) { setError('Pasiyent ID daxil edin'); return; }
    if (!dateOfBirth)      { setError('Doğum tarixini daxil edin'); return; }
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await api.get('/patients/search-public', {
        params: { patientId: patientId.trim().toUpperCase(), birthDate: dateOfBirth }
      });
      setResult(res.data?.data || res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Məlumat tapılmadı. Pasiyent ID və ya doğum tarixi yanlışdır.');
    } finally {
      setLoading(false);
    }
  };

  function reset() {
    setResult(null); setError(null);
    setPatientId(''); setDob('');
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f0fafa 0%, #e8f4f8 100%)', fontFamily: FONT, padding: '20px 16px' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ width: '100%', maxWidth: 480, borderRadius: 20, padding: '32px 36px', boxShadow: '0 8px 40px rgba(0,0,0,0.10)', background: 'white' }}>

        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <img src="/logo.png" alt="Aslan Medical" style={{ height: 44, marginBottom: 10 }} onError={e => e.currentTarget.style.display = 'none'} />
          <h1 style={{ fontSize: 22, fontWeight: 800, color: NAVY, margin: '0 0 4px', fontFamily: FONT }}>E-Nəticə Sorğusu</h1>
          <p style={{ fontSize: 13, color: '#718096', margin: 0 }}>Nəticənizi almaq üçün məlumatlarınızı daxil edin</p>
        </div>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 14px', color: '#991B1B', fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSearch}>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Pasiyent ID</label>
            <input type="text" value={patientId} onChange={e => setPatientId(e.target.value)}
              placeholder="P-ABC123" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Doğum tarixi</label>
            <input type="date" value={dateOfBirth} onChange={e => setDob(e.target.value)}
              style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', borderRadius: 12, border: 'none', background: loading ? '#9ca3af' : `linear-gradient(135deg, ${NAVY} 0%, ${TEAL} 100%)`, color: '#fff', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {loading && <Spinner />} Nəticəni Axtar →
          </button>
        </form>

        {result && (
          <div style={{ marginTop: 24 }}>
            <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 12, padding: '16px 20px', marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#15803d', marginBottom: 4 }}>✓ Pasiyent tapıldı</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0a1628', fontFamily: FONT }}>{result.fullName}</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>ID: {result.patientId}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Qan qrupu</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: result.bloodGroup ? '#dc2626' : '#9ca3af' }}>
                  {result.bloodGroup || '—'}
                </div>
              </div>
              <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Allergiyalar</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                  {result.allergies?.length ? result.allergies.join(', ') : 'Yoxdur'}
                </div>
              </div>
            </div>

            {result.medicalHistory?.length > 0 && (
              <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Son tibbi qeydlər</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {result.medicalHistory.map((h, i) => (
                    <div key={i} style={{ fontSize: 13, color: '#4b5563', borderLeft: '3px solid #00848e', paddingLeft: 10 }}>
                      <span style={{ fontWeight: 600, color: '#0a1628' }}>{h.condition}</span>
                      {h.notes && <span style={{ color: '#9ca3af' }}> — {h.notes}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={reset} style={{ marginTop: 16, width: '100%', padding: '10px', borderRadius: 10, border: `2px solid ${TEAL}`, background: 'transparent', color: TEAL, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>
              Yeni Sorğu
            </button>
          </div>
        )}

        <p style={{ textAlign: 'center', fontSize: 11, color: '#9ca3af', marginTop: 16, marginBottom: 0 }}>
          Məlumatlarınız tam məxfi saxlanılır. © Aslan Medical Center
        </p>
      </div>
    </div>
  );
}
