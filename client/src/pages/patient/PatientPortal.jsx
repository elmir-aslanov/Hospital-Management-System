import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../../api/axios';

const FONT = "'Source Sans 3', 'Raleway', sans-serif";
const TEAL = '#00848e';
const NAVY = '#0a1628';

function fmt(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function Skel({ w = '100%', h = 16 }) {
  return <div style={{ width: w, height: h, borderRadius: 6, background: '#e2e8f0', animation: 'pulse 1.5s ease-in-out infinite' }} />;
}

function Card({ children, style }) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.06)', ...style }}>
      {children}
    </div>
  );
}

function CardTitle({ children }) {
  return <h3 style={{ margin: '0 0 18px', fontSize: 16, fontWeight: 700, color: NAVY, fontFamily: FONT }}>{children}</h3>;
}

function Empty({ icon, text }) {
  return (
    <div style={{ textAlign: 'center', padding: '28px 0', color: '#718096' }}>
      <div style={{ fontSize: 36, marginBottom: 10 }}>{icon}</div>
      <p style={{ margin: 0, fontSize: 13, fontFamily: FONT }}>{text}</p>
    </div>
  );
}

export default function PatientPortal() {
  const navigate = useNavigate();
  let user = {};
  try { user = JSON.parse(localStorage.getItem('user') || '{}'); } catch {}

  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [vitals, setVitals] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user._id) { setLoading(false); return; }

    api.get(`/patients/by-user/${user._id}`)
      .then(res => {
        const pat = res.data?.data?.patient ?? res.data?.patient;
        setPatient(pat);
        const pid = pat._id;
        return Promise.allSettled([
          api.get(`/appointments/patient/${pid}`, { params: { limit: 5, sort: 'date' } }),
          api.get(`/prescriptions/patient/${pid}`, { params: { limit: 5 } }),
          api.get(`/vitals/patient/${pid}/latest`),
        ]);
      })
      .then(results => {
        if (!results) return;
        const [apptR, presR, vitR] = results;
        if (apptR.status === 'fulfilled') {
          const d = apptR.value.data?.data ?? apptR.value.data;
          setAppointments(Array.isArray(d) ? d : d?.appointments || []);
        }
        if (presR.status === 'fulfilled') {
          const d = presR.value.data?.data ?? presR.value.data;
          setPrescriptions(Array.isArray(d) ? d : d?.prescriptions || []);
        }
        if (vitR.status === 'fulfilled') {
          const d = vitR.value.data?.data ?? vitR.value.data;
          setVitals(d);
        }
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Məlumatlar yüklənmədi.');
      })
      .finally(() => setLoading(false));
  }, []);

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('storage'));
    toast.success('Sistemdən uğurla çıxdınız.');
    navigate('/');
  };

  const upcomingAppts = appointments.filter(a => a.status === 'scheduled');
  const lastCompleted = [...appointments].filter(a => a.status === 'completed').sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  const nextAppt = [...upcomingAppts].sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  const STATS = [
    { label: 'Gəlməkdə olan randevular', value: upcomingAppts.length, color: '#3b82f6', icon: '📅' },
    { label: 'Aktiv reseptlər',           value: prescriptions.length,  color: '#10b981', icon: '💊' },
    { label: 'Son ziyarət',               value: fmt(lastCompleted?.date), color: '#8b5cf6', icon: '🏥' },
    { label: 'Növbəti randevu',           value: fmt(nextAppt?.date),   color: TEAL,      icon: '⏰' },
  ];

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f0f4f8', fontFamily: FONT, padding: '32px 6vw' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <Skel w={220} h={44} />
          <Skel w={140} h={36} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {[...Array(4)].map((_, i) => <Skel key={i} h={90} />)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '60% 1fr', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Skel h={260} /><Skel h={180} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Skel h={240} /><Skel h={180} />
          </div>
        </div>
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8', fontFamily: FONT }}>

      {/* ── Header ── */}
      <div style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${TEAL} 100%)`, padding: '20px 6vw' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <img src="/logo.png" alt="logo" style={{ height: 44 }} onError={e => e.currentTarget.style.display = 'none'} />
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: FONT }}>Pasiyent Portalı</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', fontFamily: FONT }}>
                Xoş gəldiniz, {user.fullName?.split(' ')[0] || 'Pasiyent'} 👋
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => navigate('/')}
              style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: FONT }}>
              Ana Səhifə
            </button>
            <button onClick={logout}
              style={{ padding: '8px 16px', background: 'rgba(220,38,38,0.8)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: FONT }}>
              Çıxış
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: '28px 6vw' }}>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 16px', color: '#991B1B', fontSize: 13, marginBottom: 20, fontFamily: FONT }}>
            {error} —{' '}
            <button onClick={() => window.location.reload()} style={{ background: 'none', border: 'none', color: '#991B1B', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', fontFamily: FONT }}>
              Yenidən cəhd et
            </button>
          </div>
        )}

        {/* ── Stats Row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {STATS.map(s => (
            <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: s.color + '1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 11, color: '#718096', fontWeight: 600, marginBottom: 4, fontFamily: FONT }}>{s.label}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: NAVY, fontFamily: FONT }}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Main Grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '60% 1fr', gap: 20, alignItems: 'start' }}>

          {/* LEFT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Appointments */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <CardTitle>Gəlməkdə olan Randevular</CardTitle>
                <button onClick={() => navigate('/randevu')}
                  style={{ padding: '7px 14px', background: TEAL, border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: FONT }}>
                  + Randevu Al
                </button>
              </div>

              {upcomingAppts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '28px 0', color: '#718096' }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>📅</div>
                  <p style={{ margin: '0 0 14px', fontSize: 13, fontFamily: FONT }}>Aktiv randevunuz yoxdur</p>
                  <button onClick={() => navigate('/randevu')}
                    style={{ padding: '9px 20px', background: TEAL, border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: FONT }}>
                    Randevu Al
                  </button>
                </div>
              ) : (
                <>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        {['Tarix', 'Vaxt', 'Həkim', 'Status'].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '0 8px 10px', fontSize: 11, color: '#718096', fontWeight: 700, fontFamily: FONT, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...upcomingAppts].sort((a, b) => new Date(a.date) - new Date(b.date)).map((a, i) => (
                        <tr key={a._id || i} style={{ borderBottom: '1px solid #f8fafc' }}>
                          <td style={{ padding: '11px 8px', fontWeight: 600, color: NAVY, fontFamily: FONT }}>{fmt(a.date)}</td>
                          <td style={{ padding: '11px 8px', color: '#475569', fontFamily: FONT }}>{a.startTime || '—'}</td>
                          <td style={{ padding: '11px 8px', color: '#475569', fontFamily: FONT }}>{a.doctorId?.userId?.fullName || '—'}</td>
                          <td style={{ padding: '11px 8px' }}>
                            <span style={{ background: '#dbeafe', color: '#1d4ed8', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, fontFamily: FONT }}>Gözləyir</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ textAlign: 'right', marginTop: 14 }}>
                    <button onClick={() => navigate('/randevu')} style={{ background: 'none', border: 'none', color: TEAL, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>
                      Hamısına bax →
                    </button>
                  </div>
                </>
              )}
            </Card>

            {/* Prescriptions */}
            <Card>
              <CardTitle>Son Reseptlər</CardTitle>
              {prescriptions.length === 0 ? (
                <Empty icon="💊" text="Resept tapılmadı" />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {prescriptions.slice(0, 3).map((p, i) => (
                    <div key={p._id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, fontFamily: FONT }}>
                          {p.medications?.[0]?.name || p.medicationName || '—'}
                        </div>
                        <div style={{ fontSize: 12, color: '#718096', marginTop: 3, fontFamily: FONT }}>
                          {p.medications?.[0]?.dosage || p.dosage || '—'} · {p.doctorId?.userId?.fullName || '—'}
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: '#718096', flexShrink: 0, fontFamily: FONT }}>{fmt(p.createdAt || p.prescribedDate)}</div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* RIGHT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Vitals */}
            <Card>
              <CardTitle>Son Həyati Göstəricilər</CardTitle>
              {!vitals ? (
                <Empty icon="🩺" text="Həyati göstərici qeyd edilməyib" />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {[
                    { icon: '❤️', label: 'Qan təzyiqi', value: vitals.bloodPressure ? `${vitals.bloodPressure.systolic}/${vitals.bloodPressure.diastolic} mmHg` : '—' },
                    { icon: '💓', label: 'Nəbz',         value: vitals.heartRate  ? `${vitals.heartRate} bpm`  : '—' },
                    { icon: '🌡️', label: 'Hərarət',      value: vitals.temperature ? `${vitals.temperature} °C` : '—' },
                    { icon: '⚖️', label: 'Çəki',          value: vitals.weight     ? `${vitals.weight} kg`    : '—' },
                    { icon: '📏', label: 'Boy',           value: vitals.height     ? `${vitals.height} cm`    : '—' },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 9, background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{row.icon}</div>
                      <div style={{ flex: 1, fontSize: 13, color: '#475569', fontFamily: FONT }}>{row.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, fontFamily: FONT }}>{row.value}</div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Profile */}
            <Card>
              <CardTitle>Profil Məlumatları</CardTitle>
              <div>
                {[
                  ['Ad Soyad',    user.fullName || '—'],
                  ['E-poçt',      user.email || '—'],
                  ['Qan qrupu',   patient?.bloodGroup || '—'],
                  ['Doğum tarixi', fmt(patient?.dateOfBirth)],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13 }}>
                    <span style={{ color: '#718096', fontWeight: 600, fontFamily: FONT }}>{k}</span>
                    <span style={{ color: NAVY, fontWeight: 700, fontFamily: FONT, maxWidth: '60%', textAlign: 'right', wordBreak: 'break-word' }}>{v}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
    </div>
  );
}
