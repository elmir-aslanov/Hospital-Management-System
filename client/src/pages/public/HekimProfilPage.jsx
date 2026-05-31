import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const BASE  = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000'
const TEAL  = '#00848e'
const NAVY  = '#0a1628'
const FONT  = "'Source Sans 3', 'Raleway', sans-serif"

const DAY_AZ = {
  0: 'Bazar',
  1: 'B.ertəsi',
  2: 'Ç.axşamı',
  3: 'Çərşənbə',
  4: 'C.axşamı',
  5: 'Cümə',
  6: 'Şənbə',
}

function Stars({ rating = 0, size = 16 }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i <= Math.round(rating) ? '#f59e0b' : '#e2e8f0'}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </span>
  )
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: 'white', borderRadius: 16, border: '1px solid #f1f5f9',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '24px',
      ...style,
    }}>
      {children}
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <h2 style={{ fontSize: 16, fontWeight: 700, color: NAVY, margin: '0 0 16px', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 8 }}>
      {children}
    </h2>
  )
}

export default function HekimProfilPage() {
  const { id }     = useParams()
  const navigate   = useNavigate()

  const [doctor,   setDoctor]   = useState(null)
  const [ratings,  setRatings]  = useState([])
  const [schedule, setSchedule] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.allSettled([
      fetch(`${BASE}/api/v1/doctors/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
      }).then(r => { if (!r.ok) throw new Error(); return r.json() }),
      fetch(`${BASE}/api/v1/doctor-ratings?doctorId=${id}`).then(r => r.ok ? r.json() : { data: [] }),
      fetch(`${BASE}/api/v1/doctors/${id}/schedule`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
      }).then(r => r.ok ? r.json() : { data: [] }),
    ]).then(([docRes, ratingRes, schedRes]) => {
      if (docRes.status === 'rejected') { setError(true); return }
      const docData = docRes.value?.data || docRes.value
      setDoctor(docData)
      setRatings(ratingRes.value?.data || [])
      const schedData = schedRes.value?.data
      setSchedule(Array.isArray(schedData) ? schedData : [])
    }).finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT }}>
      <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: TEAL, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  if (error || !doctor) return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, fontFamily: FONT, padding: 24 }}>
      <div style={{ fontSize: 48 }}>🔍</div>
      <p style={{ fontSize: 16, color: '#64748b' }}>Həkim tapılmadı.</p>
      <button onClick={() => navigate('/hekimler')}
        style={{ padding: '10px 22px', background: TEAL, color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: FONT }}>
        ← Həkimlər
      </button>
    </div>
  )

  const u        = doctor.userId || {}
  const fullName = u.fullName || ((u.name || '') + ' ' + (u.surname || '')).trim() || 'Həkim'
  const initials = fullName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'DR'
  const deptName = doctor.departmentId?.name || doctor.department || '—'
  const photo    = u.photoUrl || doctor.image || null

  const sortedSchedule = [...schedule].sort((a, b) => a.dayOfWeek - b.dayOfWeek)
  const shownRatings   = ratings.slice(0, 5)

  return (
    <main style={{ fontFamily: FONT, background: '#f0f4f8', minHeight: '100vh' }}>

      {/* ── Back button ─────────────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 24px 0' }}>
        <button onClick={() => navigate('/hekimler')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: 14, fontWeight: 600, fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 6, padding: 0 }}
          onMouseEnter={e => e.currentTarget.style.color = TEAL}
          onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>
          ← Həkimlər
        </button>
      </div>

      {/* ── Hero ────────────────────────────────────────────── */}
      <div style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${TEAL} 100%)`, padding: '48px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>

          {/* Avatar */}
          <div style={{ flexShrink: 0 }}>
            {photo ? (
              <img src={photo} alt={fullName}
                style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', border: '4px solid rgba(255,255,255,0.3)' }}
                onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex' }} />
            ) : null}
            <div style={{
              display: photo ? 'none' : 'flex', width: 120, height: 120, borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)', border: '4px solid rgba(255,255,255,0.3)',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 42, fontWeight: 800, color: 'white',
            }}>
              {initials}
            </div>
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginBottom: 4 }}>Həkim</div>
            <h1 style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 800, color: 'white', fontFamily: FONT }}>
              Dr. {fullName}
            </h1>

            {doctor.specialization && (
              <span style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', color: 'white', borderRadius: 20, padding: '4px 14px', fontSize: 13, fontWeight: 600, marginBottom: 10 }}>
                {doctor.specialization}
              </span>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', color: 'rgba(255,255,255,0.85)', fontSize: 14, marginBottom: 10 }}>
              {doctor.experience > 0 && <span>🎓 {doctor.experience} il təcrübə</span>}
              <span>🏥 {deptName}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <Stars rating={doctor.averageRating} size={18} />
              <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>
                {Number(doctor.averageRating || 0).toFixed(1)} · {doctor.totalRatings || 0} rəy
              </span>
              <span style={{
                padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                background: doctor.isAvailable ? 'rgba(34,197,94,0.25)' : 'rgba(148,163,184,0.25)',
                color: doctor.isAvailable ? '#86efac' : '#cbd5e1',
                border: `1px solid ${doctor.isAvailable ? 'rgba(34,197,94,0.4)' : 'rgba(148,163,184,0.4)'}`,
              }}>
                {doctor.isAvailable ? '● Qəbul edir' : '● Məşğul'}
              </span>
            </div>
          </div>

          {/* CTA */}
          <div style={{ flexShrink: 0 }}>
            <button
              onClick={() => navigate(`/randevu?doctorId=${id}`)}
              style={{ padding: '13px 28px', background: 'white', color: TEAL, border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', transition: 'transform .15s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              Randevu Al
            </button>
          </div>
        </div>
      </div>

      {/* ── Two column body ─────────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: '32px auto', padding: '0 24px 60px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, alignItems: 'start' }}>

        {/* ── LEFT ──────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* About */}
          <Card>
            <SectionTitle>📋 Haqqında</SectionTitle>
            {doctor.bio
              ? <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.75, margin: 0 }}>{doctor.bio}</p>
              : <p style={{ fontSize: 14, color: '#94a3b8', margin: 0 }}>Məlumat yoxdur</p>
            }
          </Card>

          {/* Schedule */}
          <Card>
            <SectionTitle>📅 İş Cədvəli</SectionTitle>
            {sortedSchedule.length === 0 ? (
              <p style={{ fontSize: 14, color: '#94a3b8', margin: 0 }}>Cədvəl məlumatı yoxdur</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['Gün', 'Saat', 'Status'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', fontSize: 12, fontWeight: 600, color: '#64748b', textAlign: 'left', borderBottom: '1px solid #f1f5f9' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedSchedule.map(s => (
                    <tr key={s.dayOfWeek}
                      style={{ borderBottom: '1px solid #f8fafc' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                      onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                      <td style={{ padding: '11px 14px', fontSize: 14, fontWeight: 600, color: NAVY }}>
                        {DAY_AZ[s.dayOfWeek] ?? `Gün ${s.dayOfWeek}`}
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: 14, color: '#334155' }}>
                        {s.isOff ? '—' : `${s.startTime} – ${s.endTime}`}
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        {s.isOff
                          ? <span style={{ fontSize: 12, fontWeight: 600, background: '#fef2f2', color: '#dc2626', borderRadius: 6, padding: '3px 9px' }}>İstirahət</span>
                          : <span style={{ fontSize: 12, fontWeight: 600, background: '#f0fdf4', color: '#16a34a', borderRadius: 6, padding: '3px 9px' }}>İşləyir</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>

          {/* Reviews */}
          <Card>
            <SectionTitle>⭐ Rəylər</SectionTitle>
            {shownRatings.length === 0 ? (
              <p style={{ fontSize: 14, color: '#94a3b8', margin: 0 }}>Hələ rəy yoxdur</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {shownRatings.map((r, i) => (
                  <div key={r._id ?? i} style={{ borderBottom: i < shownRatings.length - 1 ? '1px solid #f1f5f9' : 'none', paddingBottom: i < shownRatings.length - 1 ? 16 : 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <Stars rating={r.rating} size={14} />
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString('az-AZ') : ''}
                      </span>
                    </div>
                    {r.comment && <p style={{ fontSize: 14, color: '#475569', margin: 0, lineHeight: 1.6 }}>{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* ── RIGHT ─────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Contact info */}
          <Card>
            <SectionTitle>📞 Əlaqə məlumatları</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <InfoRow icon="₼" label="Konsultasiya haqqı"
                value={doctor.consultationFee ? `${doctor.consultationFee} ₼` : 'Məlumat yoxdur'} />
              <InfoRow icon="🏥" label="Şöbə" value={deptName} />
              <InfoRow icon="📱" label="Telefon" value={u.phone || '—'} />
              {u.email && <InfoRow icon="✉️" label="E-poçt" value={u.email} />}
            </div>
          </Card>

          {/* CTA card */}
          <Card style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #0d2240 100%)`, border: 'none' }}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: '0 0 4px', fontFamily: FONT }}>Onlayn randevu alın</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'white', margin: '0 0 20px', fontFamily: FONT, lineHeight: 1.4 }}>
              Dr. {fullName} ilə görüş təyin edin
            </p>
            <button
              onClick={() => navigate(`/randevu?doctorId=${id}`)}
              style={{ width: '100%', padding: '13px 0', background: TEAL, color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, transition: 'opacity .15s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              Randevu Al
            </button>
          </Card>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @media (max-width: 768px) {
          main > div:last-of-type { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  )
}

function InfoRow({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 14, color: '#334155', fontWeight: 500 }}>{value}</div>
      </div>
    </div>
  )
}
