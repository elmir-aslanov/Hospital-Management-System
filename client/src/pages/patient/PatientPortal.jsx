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
  return (
    <div style={{ width: w, height: h, borderRadius: 6, background: '#e2e8f0', animation: 'skelpulse 1.5s ease-in-out infinite' }} />
  );
}

const STATUS_COLORS = {
  scheduled: { bg: '#dbeafe', color: '#1d4ed8', label: 'Gözləyir' },
  confirmed:  { bg: '#dcfce7', color: '#166534', label: 'Təsdiqləndi' },
  completed:  { bg: '#d1fae5', color: '#065f46', label: 'Tamamlandı' },
  cancelled:  { bg: '#fee2e2', color: '#991b1b', label: 'Ləğv edildi' },
  missed:     { bg: '#fef9c3', color: '#854d0e', label: 'Gəlmədi' },
  no_show:    { bg: '#fef3c7', color: '#92400e', label: 'Gəlmədi' },
};

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || { bg: '#f1f5f9', color: '#475569', label: status };
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: s.bg, color: s.color, fontFamily: FONT, whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  );
}

function Card({ children, style }) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.06)', ...style }}>
      {children}
    </div>
  );
}

function SectionTitle({ children }) {
  return <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: NAVY, fontFamily: FONT }}>{children}</h3>;
}

export default function PatientPortal() {
  const navigate = useNavigate();
  let user = {};
  try { user = JSON.parse(localStorage.getItem('user') || '{}'); } catch {}

  const [patient, setPatient]           = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [vitals, setVitals]             = useState(null);
  const [loading, setLoading]           = useState(true);
  const [notFound, setNotFound]         = useState(false);
  const [labResults,  setLabResults]    = useState([]);
  const [invoices,    setInvoices]      = useState([]);
  const [notifs,      setNotifs]        = useState([]);
  const [unreadCount, setUnreadCount]   = useState(0);
  const [notifOpen,   setNotifOpen]     = useState(false);

  useEffect(() => {
    if (!user._id) { setLoading(false); return; }

    api.get(`/patients/by-user/${user._id}`)
      .then(res => {
        const pat = res.data?.data?.patient ?? res.data?.patient;
        setPatient(pat);
        const pid = pat._id;

        return Promise.allSettled([
          api.get(`/appointments/patient/${pid}`, { params: { limit: 10 } }),
          api.get(`/prescriptions/patient/${pid}`, { params: { limit: 5 } }),
          api.get(`/vitals/patient/${pid}/latest`),
          api.get(`/lab/results/patient/${pid}`),
          api.get(`/billing/patient/${pid}`),
        ]);
      })
      .then(results => {
        if (!results) return;
        const [apptR, presR, vitR, labR, billR] = results;

        if (apptR.status === 'fulfilled') {
          const d = apptR.value.data?.data;
          setAppointments(d?.appointments ?? (Array.isArray(d) ? d : []));
        }
        if (presR.status === 'fulfilled') {
          const d = presR.value.data?.data;
          setPrescriptions(d?.prescriptions ?? (Array.isArray(d) ? d : []));
        }
        if (vitR.status === 'fulfilled') {
          const d = vitR.value.data?.data;
          setVitals(d?.vitals ?? d ?? null);
        }
        if (labR.status === 'fulfilled') {
          const d = labR.value.data?.data;
          setLabResults(Array.isArray(d) ? d : []);
        }
        if (billR.status === 'fulfilled') {
          const d = billR.value.data?.data;
          setInvoices(Array.isArray(d) ? d : []);
        }
      })
      .catch(err => {
        if (err.response?.status === 404) {
          setNotFound(true);
        } else {
          toast.error('Məlumatlar yüklənmədi.');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const t = localStorage.getItem('token')
    if (!t) return
    fetch('http://localhost:5000/api/v1/notifications?page=1&limit=20', {
      headers: { Authorization: `Bearer ${t}` },
    })
      .then(r => r.json())
      .then(d => {
        const list   = d.data?.notifications || []
        const now    = Date.now()
        const last24 = list.filter(n => now - new Date(n.createdAt).getTime() < 86400000)
        setNotifs(last24)
        setUnreadCount(d.data?.unreadCount || 0)
      })
      .catch(() => {})
  }, [])

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('storage'));
    toast.success('Sistemdən uğurla çıxdınız.');
    navigate('/');
  };

  const upcomingAppts   = appointments.filter(a => a.status === 'scheduled');
  const completedAppts  = appointments.filter(a => a.status === 'completed').sort((a, b) => new Date(b.date) - new Date(a.date));
  const nextAppt        = [...upcomingAppts].sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  const unpaidTotal = invoices
    .filter(inv => ['issued', 'partially_paid', 'overdue'].includes(inv.status))
    .reduce((s, inv) => s + (inv.total || 0), 0);

  const STATS = [
    { label: 'Gözləyən Randevular', value: upcomingAppts.length,                                        color: TEAL      },
    { label: 'Aktiv Reseptlər',     value: prescriptions.length,                                         color: TEAL      },
    { label: 'Lab Nəticəsi',        value: labResults.length,                                            color: '#2563eb' },
    { label: 'Ödənilməmiş',        value: unpaidTotal > 0 ? unpaidTotal.toFixed(0) + ' ₼' : '—',       color: unpaidTotal > 0 ? '#dc2626' : '#16a34a' },
  ];

  const markAllRead = () => {
    const t = localStorage.getItem('token')
    fetch('http://localhost:5000/api/v1/notifications/read-all', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${t}` },
    }).then(() => {
      setNotifs(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    }).catch(() => {})
  }

  const markOneRead = (id) => {
    const t = localStorage.getItem('token')
    fetch(`http://localhost:5000/api/v1/notifications/${id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${t}` },
    }).then(() => {
      setNotifs(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    }).catch(() => {})
  }

  const notifTypeColor = (type) => ({
    appointment: { bg: '#eff6ff', color: '#2563eb', label: 'Randevu' },
    lab:         { bg: '#f0fdf4', color: '#16a34a', label: 'Lab'     },
    billing:     { bg: '#fefce8', color: '#ca8a04', label: 'Ödəniş' },
    admission:   { bg: '#fdf4ff', color: '#9333ea', label: 'Qəbul'  },
    general:     { bg: '#f8fafc', color: '#64748b', label: 'Ümumi'  },
  }[type] || { bg: '#f8fafc', color: '#64748b', label: 'Ümumi' })

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const m    = Math.floor(diff / 60000)
    if (m < 1)  return 'İndicə'
    if (m < 60) return `${m} dəq əvvəl`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h} saat əvvəl`
    return `${Math.floor(h / 24)} gün əvvəl`
  }

  /* ── Header (shared across all states) ── */
  const Header = (
    <div style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${TEAL} 100%)`, padding: '20px 6vw', marginBottom: 0 }}>
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
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {/* Notification Bell */}
          <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setNotifOpen(o => !o)}
              style={{
                width: 38, height: 38, background: 'white',
                border: '1px solid #e2e8f0', borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', position: 'relative',
              }}
            >
              <svg width="16" height="16" fill="none" stroke="#475569" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {unreadCount > 0 && (
                <div style={{
                  position: 'absolute', top: 4, right: 4,
                  minWidth: 16, height: 16, background: '#ef4444',
                  borderRadius: 8, border: '1.5px solid white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 9, fontWeight: 700, color: 'white', padding: '0 3px',
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </div>
              )}
            </button>

            {notifOpen && (
              <div style={{
                position: 'absolute', top: 46, right: 0, width: 320,
                background: 'white', borderRadius: 14,
                boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
                border: '1px solid #f1f5f9', zIndex: 999, overflow: 'hidden',
              }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 10px', borderBottom: '1px solid #f1f5f9' }}>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0f1b2d' }}>Bildirişlər</span>
                    <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 6 }}>Son 24 saat</span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      style={{ fontSize: 11, color: '#00848e', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      Hamısını oxu
                    </button>
                  )}
                </div>

                {/* List */}
                <div style={{ maxHeight: 340, overflowY: 'auto' }}>
                  {notifs.length === 0 ? (
                    <div style={{ padding: '32px 16px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                      Son 24 saatda bildiriş yoxdur
                    </div>
                  ) : notifs.map(n => {
                    const tc = notifTypeColor(n.type)
                    return (
                      <div
                        key={n._id}
                        onClick={() => !n.isRead && markOneRead(n._id)}
                        style={{
                          display: 'flex', gap: 10, padding: '11px 16px',
                          borderBottom: '1px solid #f8fafc',
                          background: n.isRead ? 'white' : '#f0fafb',
                          cursor: n.isRead ? 'default' : 'pointer',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => { if (!n.isRead) e.currentTarget.style.background = '#e6f7f8' }}
                        onMouseLeave={e => { e.currentTarget.style.background = n.isRead ? 'white' : '#f0fafb' }}
                      >
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: n.isRead ? 'transparent' : '#00848e', marginTop: 5, flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#0f1b2d' }}>{n.title}</span>
                            <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 10, background: tc.bg, color: tc.color, flexShrink: 0 }}>{tc.label}</span>
                          </div>
                          <p style={{ margin: 0, fontSize: 11, color: '#64748b', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.message}</p>
                          <span style={{ fontSize: 10, color: '#94a3b8', marginTop: 3, display: 'block' }}>{timeAgo(n.createdAt)}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

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
  );

  /* ── Loading state ── */
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f0f4f8', fontFamily: FONT }}>
        {Header}
        <div style={{ padding: '28px 6vw' }}>
          <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
            {[...Array(4)].map((_, i) => <Skel key={i} h={90} />)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <Skel h={260} /><Skel h={180} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <Skel h={220} /><Skel h={200} />
            </div>
          </div>
        </div>
        <style>{`@keyframes skelpulse{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
      </div>
    );
  }

  /* ── 404 — patient profile not found ── */
  if (notFound) {
    return (
      <div style={{ minHeight: '100vh', background: '#f0f4f8', fontFamily: FONT }}>
        {Header}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 20 }}>🏥</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: NAVY, margin: '0 0 12px', fontFamily: FONT }}>
            Pasiyent profili tapılmadı
          </h2>
          <p style={{ fontSize: 14, color: '#718096', margin: '0 0 28px', fontFamily: FONT }}>
            Hesabınız hələ pasiyent kimi qeydiyyatdan keçməyib.
          </p>
          <button onClick={() => navigate('/register')}
            style={{ padding: '12px 28px', background: `linear-gradient(135deg, ${NAVY}, ${TEAL})`, border: 'none', borderRadius: 10, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>
            Qeydiyyatdan Keç
          </button>
        </div>
      </div>
    );
  }

  /* ── Main content ── */
  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8', fontFamily: FONT }} onClick={() => notifOpen && setNotifOpen(false)}>
      {Header}

      <div style={{ padding: '28px 6vw' }}>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
          {STATS.map(s => (
            <div key={s.label} style={{ flex: 1, background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: s.color, marginBottom: 6, fontFamily: FONT }}>{s.value}</div>
              <div style={{ fontSize: 13, color: '#718096', fontFamily: FONT }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* 2-column grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 24, alignItems: 'start' }}>

          {/* ── LEFT ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Appointments */}
            <Card>
              <SectionTitle>Randevularım</SectionTitle>

              {appointments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
                  <p style={{ color: '#718096', fontSize: 14, margin: '0 0 16px', fontFamily: FONT }}>Randevunuz yoxdur</p>
                  <button onClick={() => navigate('/randevu')}
                    style={{ padding: '10px 22px', background: TEAL, border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>
                    Randevu Al
                  </button>
                </div>
              ) : (
                <>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr>
                        {['Tarix', 'Vaxt', 'Həkim', 'Status'].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '0 8px 12px', fontSize: 11, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: FONT }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...appointments].sort((a, b) => new Date(b.date) - new Date(a.date)).map((a, i) => (
                        <tr key={a._id || i} style={{ borderTop: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '11px 8px', fontWeight: 600, color: NAVY, fontFamily: FONT }}>{fmt(a.date)}</td>
                          <td style={{ padding: '11px 8px', color: '#475569', fontFamily: FONT }}>{a.startTime || '—'}</td>
                          <td style={{ padding: '11px 8px', color: '#475569', fontFamily: FONT }}>{a.doctorId?.userId?.fullName || '—'}</td>
                          <td style={{ padding: '11px 8px' }}><StatusBadge status={a.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ marginTop: 18, textAlign: 'right' }}>
                    <button onClick={() => navigate('/randevu')}
                      style={{ background: TEAL, border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 700, padding: '9px 18px', cursor: 'pointer', fontFamily: FONT }}>
                      Yeni Randevu Al →
                    </button>
                  </div>
                </>
              )}
            </Card>

            {/* Prescriptions */}
            <Card>
              <SectionTitle>Reseptlərim</SectionTitle>
              {prescriptions.length === 0 ? (
                <p style={{ color: '#9ca3af', fontSize: 14, margin: 0, textAlign: 'center', padding: '20px 0', fontFamily: FONT }}>Resept tapılmadı</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {prescriptions.map((p, i) => (
                    <div key={p._id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, fontFamily: FONT }}>
                          {p.medications?.[0]?.name || p.medicationName || '—'}
                        </div>
                        <div style={{ fontSize: 12, color: '#718096', marginTop: 3, fontFamily: FONT }}>
                          {p.medications?.[0]?.dosage || p.dosage || '—'} · {p.doctorId?.userId?.fullName || '—'}
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: '#9ca3af', flexShrink: 0, marginLeft: 12, fontFamily: FONT }}>
                        {fmt(p.createdAt || p.prescribedDate)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Lab Results */}
            <Card>
              <SectionTitle>Lab Nəticələrim</SectionTitle>
              {labResults.length === 0 ? (
                <p style={{ color: '#9ca3af', fontSize: 14, margin: 0, textAlign: 'center', padding: '20px 0', fontFamily: FONT }}>
                  Lab nəticəsi tapılmadı
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {labResults.slice(0, 5).map((r, i) => {
                    const orderNum = r.labOrderId?.orderNumber || '—'
                    const date     = r.createdAt ? new Date(r.createdAt).toLocaleDateString('az-AZ') : '—'
                    const verified = r.isVerified
                    return (
                      <div key={r._id || i} style={{ padding: '14px 16px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, fontFamily: FONT }}>{orderNum}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
                              background: verified ? '#f0fdf4' : '#fefce8',
                              color:      verified ? '#16a34a' : '#ca8a04' }}>
                              {verified ? '✓ Təsdiqləndi' : 'Gözləyir'}
                            </span>
                            <span style={{ fontSize: 11, color: '#9ca3af', fontFamily: FONT }}>{date}</span>
                          </div>
                        </div>
                        {r.results?.slice(0, 3).map((res, j) => {
                          const statusColor = { normal: '#16a34a', low: '#2563eb', high: '#ea580c', critical: '#dc2626' }[res.status] || '#64748b'
                          return (
                            <div key={j} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderTop: j > 0 ? '1px solid #f1f5f9' : 'none' }}>
                              <span style={{ fontSize: 12, color: '#475569', fontFamily: FONT }}>{res.testName}</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: NAVY, fontFamily: FONT }}>
                                  {res.value} {res.unit || ''}
                                </span>
                                <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 8, background: statusColor + '18', color: statusColor }}>
                                  {({ normal: 'Normal', low: 'Aşağı', high: 'Yüksək', critical: 'Kritik' })[res.status] || res.status}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                        {r.results?.length > 3 && (
                          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6, fontFamily: FONT }}>
                            +{r.results.length - 3} daha...
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* ── RIGHT ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Vitals */}
            <Card>
              <SectionTitle>Həyati Göstəricilər</SectionTitle>
              {!vitals ? (
                <p style={{ color: '#9ca3af', fontSize: 14, margin: 0, textAlign: 'center', padding: '20px 0', fontFamily: FONT }}>Ölçü qeyd edilməyib</p>
              ) : (
                <div>
                  {[
                    { icon: '🫀', label: 'Qan təzyiqi', value: vitals.bloodPressure ? `${vitals.bloodPressure.systolic}/${vitals.bloodPressure.diastolic} mmHg` : '—' },
                    { icon: '❤️', label: 'Nəbz',         value: vitals.heartRate  ? `${vitals.heartRate} bpm`   : '—' },
                    { icon: '🌡️', label: 'Hərarət',      value: vitals.temperature ? `${vitals.temperature} °C` : '—' },
                    { icon: '⚖️', label: 'Çəki',          value: vitals.weight     ? `${vitals.weight} kg`      : '—' },
                    { icon: '📏', label: 'Boy',           value: vitals.height     ? `${vitals.height} cm`      : '—' },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: 13, color: '#718096', fontFamily: FONT }}>{row.icon} {row.label}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: TEAL, fontFamily: FONT }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Profile */}
            <Card>
              <SectionTitle>Profil</SectionTitle>
              <div>
                {[
                  ['Ad Soyad',     user.fullName || '—'],
                  ['E-poçt',       user.email || '—'],
                  ['Qan qrupu',    patient?.bloodGroup || '—'],
                  ['Doğum tarixi', fmt(patient?.dateOfBirth)],
                  ['Cins',         patient?.gender ? (patient.gender === 'male' ? 'Kişi' : patient.gender === 'female' ? 'Qadın' : patient.gender) : '—'],
                  ['Telefon',      patient?.phone || patient?.userId?.phone || '—'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13 }}>
                    <span style={{ color: '#718096', fontWeight: 600, fontFamily: FONT }}>{k}</span>
                    <span style={{ color: NAVY, fontWeight: 700, fontFamily: FONT, textAlign: 'right', maxWidth: '60%', wordBreak: 'break-word' }}>{v}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Billing */}
            <Card>
              <SectionTitle>Ödənişlərim</SectionTitle>
              {invoices.length === 0 ? (
                <p style={{ color: '#9ca3af', fontSize: 14, margin: 0, textAlign: 'center', padding: '20px 0', fontFamily: FONT }}>
                  Faktura tapılmadı
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {invoices.slice(0, 5).map((inv, i) => {
                    const STATUS_INV = {
                      draft:          { label: 'Qaralama', bg: '#f8fafc', color: '#64748b' },
                      issued:         { label: 'Kəsildi',  bg: '#eff6ff', color: '#2563eb' },
                      paid:           { label: 'Ödənildi', bg: '#f0fdf4', color: '#16a34a' },
                      partially_paid: { label: 'Qismən',   bg: '#fefce8', color: '#ca8a04' },
                      cancelled:      { label: 'Ləğv',     bg: '#fef2f2', color: '#dc2626' },
                      overdue:        { label: 'Gecikmiş', bg: '#fff7ed', color: '#ea580c' },
                    }
                    const s    = STATUS_INV[inv.status] || STATUS_INV.draft
                    const date = inv.createdAt ? new Date(inv.createdAt).toLocaleDateString('az-AZ') : '—'
                    return (
                      <div key={inv._id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, fontFamily: FONT }}>{inv.invoiceNumber || '—'}</div>
                          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2, fontFamily: FONT }}>{date}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 14, fontWeight: 800, color: TEAL, fontFamily: FONT }}>{inv.total} ₼</span>
                          <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10, background: s.bg, color: s.color }}>{s.label}</span>
                        </div>
                      </div>
                    )
                  })}
                  {invoices.length > 5 && (
                    <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', margin: '4px 0 0', fontFamily: FONT }}>
                      Ümumi {invoices.length} faktura
                    </p>
                  )}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      <style>{`@keyframes skelpulse{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
    </div>
  );
}
