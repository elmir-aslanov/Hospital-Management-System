import { useState } from 'react';
import api from '../../api/axios';

const FONT  = "'Source Sans 3', 'Raleway', sans-serif";
const TEAL  = '#00848e';
const NAVY  = '#0a1628';
const ORANGE = '#e8622a';

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
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
  fontSize: 13,
  fontWeight: 600,
  color: '#374151',
  marginBottom: 6,
  fontFamily: FONT,
};

function Spinner() {
  return (
    <span style={{
      display: 'inline-block',
      width: 16, height: 16,
      border: '2.5px solid rgba(255,255,255,0.4)',
      borderTopColor: '#fff',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
      verticalAlign: 'middle',
      marginRight: 8,
    }} />
  );
}

const TYPE_LABELS = {
  lab_result:     'Laboratoriya nəticəsi',
  imaging:        'Görüntüləmə',
  clinical_note:  'Klinik qeyd',
  procedure:      'Prosedur',
  vaccination:    'Peyvənd',
  other:          'Digər',
};

function fmt(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function ENeticePage() {
  const [patientId, setPatientId]   = useState('');
  const [dateOfBirth, setDob]       = useState('');
  const [phone, setPhone]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [result, setResult]         = useState(null); // { patient, records }

  function focusIn(e)  { e.target.style.borderColor = TEAL; }
  function focusOut(e) { e.target.style.borderColor = '#e2e8f0'; }

  async function search(params) {
    setError(null);
    setLoading(true);
    try {
      const res = await api.get('/ehr/patient-results', { params });
      setResult(res.data?.data ?? res.data);
    } catch (err) {
      const status = err.response?.status;
      if (status === 404) {
        setError('Pasiyent tapılmadı. ID-nizi yoxlayın.');
      } else if (status === 401) {
        setError('Məlumatlar uyğun gəlmir. Doğum tarixinizi yoxlayın.');
      } else if (status === 400) {
        setError(err.response?.data?.message || 'Zəhmət olmasa məlumatları doldurun.');
      } else {
        setError('Server xətası. Bir az sonra yenidən cəhd edin.');
      }
    } finally {
      setLoading(false);
    }
  }

  function handleIdSearch(e) {
    e.preventDefault();
    if (!patientId.trim()) { setError('Pasiyent ID daxil edin.'); return; }
    search({ patientId: patientId.trim(), ...(dateOfBirth && { dateOfBirth }) });
  }

  function handlePhoneSearch(e) {
    e.preventDefault();
    if (!phone.trim()) { setError('Telefon nömrəsi daxil edin.'); return; }
    search({ phone: phone.trim() });
  }

  function reset() {
    setResult(null);
    setError(null);
    setPatientId('');
    setDob('');
    setPhone('');
  }

  /* ── RESULTS VIEW ── */
  if (result) {
    const { patient, records = [] } = result;
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0fafa 0%, #e8f4f8 100%)', fontFamily: FONT, padding: '40px 16px' }}>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @media print {
            body * { visibility: hidden; }
            #print-results, #print-results * { visibility: visible; }
            #print-results { position: absolute; left: 0; top: 0; width: 100%; padding: 24px; }
            .no-print { display: none !important; }
            .print-header { display: block !important; }
          }
        `}</style>

        <div style={{ maxWidth: 720, margin: '0 auto' }}>

          {/* Actions */}
          <div className="no-print" style={{ display: 'flex', gap: 10, marginBottom: 20, justifyContent: 'flex-end' }}>
            <button
              className="no-print"
              onClick={() => window.print()}
              style={{ padding: '10px 22px', background: TEAL, border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}
            >
              PDF Yüklə
            </button>
            <button
              className="no-print"
              onClick={reset}
              style={{ padding: '10px 22px', background: 'transparent', border: `2px solid ${TEAL}`, borderRadius: 10, color: TEAL, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}
            >
              Yeni Sorğu
            </button>
          </div>

          <div id="print-results">

            {/* Print-only header */}
            <div className="print-header" style={{ display: 'none', marginBottom: 24, textAlign: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: 16 }}>
              <img src="/logo.png" alt="Aslan Medical Center" style={{ height: 48, marginBottom: 8 }} />
              <div style={{ fontSize: 20, fontWeight: 800, color: NAVY }}>Aslan Medical Center</div>
              <div style={{ fontSize: 13, color: '#718096' }}>Laboratoriya Nəticələri</div>
            </div>

            {/* Patient info */}
            <div style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${TEAL} 100%)`, borderRadius: 16, padding: '24px 28px', marginBottom: 24, color: '#fff' }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 8 }}>Pasiyent məlumatları</div>
              <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>{patient.fullName || '—'}</div>
              <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
                {[
                  ['Pasiyent ID',   patient.patientId || '—'],
                  ['Doğum tarixi',  fmt(patient.dateOfBirth)],
                  ['Telefon',       patient.phone || '—'],
                  ['Nəticə sayı',   records.length],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>{k}</div>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Records */}
            {records.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: 14, padding: 40, textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
                <p style={{ fontSize: 15, color: '#718096', margin: 0, fontFamily: FONT }}>
                  Nəticə tapılmadı. Zəhmət olmasa laboratoriya ilə əlaqə saxlayın.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {records.map((rec, i) => (
                  <div key={rec._id || i} style={{ background: '#fff', borderRadius: 14, padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: `4px solid ${TEAL}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#e0f2fe', color: '#0369a1', marginBottom: 8, display: 'inline-block' }}>
                          {TYPE_LABELS[rec.type] || rec.type}
                        </span>
                        <div style={{ fontSize: 15, fontWeight: 700, color: NAVY, marginTop: 6 }}>{rec.description}</div>
                      </div>
                      <div style={{ fontSize: 12, color: '#9ca3af', flexShrink: 0, marginLeft: 12 }}>{fmt(rec.createdAt)}</div>
                    </div>
                    {rec.doctorId?.specialization && (
                      <div style={{ fontSize: 12, color: '#718096' }}>
                        İxtisas: <strong>{rec.doctorId.specialization}</strong>
                      </div>
                    )}
                    {rec.attachments?.length > 0 && (
                      <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {rec.attachments.map((url, j) => (
                          <a key={j} href={url} target="_blank" rel="noreferrer"
                            style={{ fontSize: 12, color: TEAL, fontWeight: 600, textDecoration: 'none', border: `1px solid ${TEAL}`, borderRadius: 6, padding: '3px 10px' }}>
                            Fayl {j + 1} ↗
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── LOOKUP FORM ── */
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0fafa 0%, #e8f4f8 100%)', fontFamily: FONT, padding: '80px 16px 40px' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ maxWidth: 560, margin: '0 auto' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img src="/logo.png" alt="Aslan Medical" style={{ height: 52, marginBottom: 16 }}
            onError={e => e.currentTarget.style.display = 'none'} />
          <h1 style={{ fontSize: 28, fontWeight: 800, color: NAVY, margin: '0 0 10px', fontFamily: FONT }}>
            E-Nəticə Sorğusu
          </h1>
          <p style={{ fontSize: 14, color: '#718096', margin: 0, fontFamily: FONT }}>
            Nəticənizi almaq üçün məlumatlarınızı daxil edin
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 16px', color: '#991B1B', fontSize: 13, marginBottom: 20, fontFamily: FONT }}>
            {error}
          </div>
        )}

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: 20, padding: 40, boxShadow: '0 8px 40px rgba(0,0,0,0.1)' }}>

          {/* Method 1 — ID + DOB */}
          <form onSubmit={handleIdSearch}>
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Sənəd nömrəsi / Pasiyent ID</label>
              <input
                type="text"
                value={patientId}
                onChange={e => setPatientId(e.target.value)}
                placeholder="P-2024-XXXXX"
                style={inputStyle}
                onFocus={focusIn}
                onBlur={focusOut}
              />
            </div>
            <div style={{ marginBottom: 22 }}>
              <label style={labelStyle}>Doğum tarixi</label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={e => setDob(e.target.value)}
                style={inputStyle}
                onFocus={focusIn}
                onBlur={focusOut}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '13px', borderRadius: 12, border: 'none',
                background: loading ? '#9ca3af' : `linear-gradient(135deg, ${NAVY} 0%, ${TEAL} 100%)`,
                color: '#fff', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {loading && <Spinner />}
              Nəticəni Axtar →
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '28px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            <span style={{ fontSize: 13, color: '#9ca3af', fontFamily: FONT }}>və ya</span>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
          </div>

          {/* Method 2 — Phone */}
          <form onSubmit={handlePhoneSearch}>
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Telefon nömrəsi</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+994 XX XXX XX XX"
                style={inputStyle}
                onFocus={focusIn}
                onBlur={focusOut}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '13px', borderRadius: 12,
                border: `2px solid ${TEAL}`,
                background: 'transparent',
                color: TEAL, fontSize: 14, fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {loading && <Spinner />}
              SMS ilə Axtar
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 24, fontFamily: FONT }}>
          Məlumatlarınız tam məxfi saxlanılır. © Aslan Medical Center
        </p>
      </div>
    </div>
  );
}
