import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const TEAL = '#00848e'
const NAVY = '#0a1628'
const FONT = "'Source Sans 3', sans-serif"
const BASE = 'http://localhost:5000'

const CV = {
  tahsil: ['İstanbul Universiteti - Cərrahpaşa Tibb Fakültəsi Radiologiya Bölümü'],
  yeterlilik: [
    'Türk Radiologiya Dərnəyi nəzəri yetərlilik imtahanı (17 noyabr 2019)',
    '2015 Aprel TUS imtahanında xarici vətəndaşlar arasında 1.yer',
  ],
  nesrler: [
    'Poster: "Endovaskuler anevrizm tedavisi sonrası endogreft enfeksiyonu" — 38. TRD 2017',
    '"Ekstraosseoz anevrizmal kemik kistinin tanı ve tedavisinde radyolojinin yeri" — 38. TRD 2017',
    '"Sezaryen sonrası mesane flap hematomu vakası" — 38. TRD 2017',
  ],
  uzvlukler: [
    'Türk Radiologiya Dərnəyi (TRD)',
    'Türk Maqnetik Rezonans Dərnəyi (TMRD)',
    'Avropa Radiologiya Dərnəyi (ESR)',
  ],
  kurslar: [
    'Rush Universiteti Nöroradiologiya şöbəsi, Çikago, ABD — 01.10.2017–01.11.2017',
    '"Meme MRG Sempozyumu" — 13 sentyabr 2015, İstanbul',
    'Nöroradyoloji ve Baş-Boyun Radyolojisi toplantısı — 19-21 fevral 2016, İstanbul',
    '"Türk Nöroradyoloji Derneği Diploma 2.Dönem 4.Kursu" — 17-19 kasım 2017',
    '"26. Nöroradyoloji ve Baş-Boyun Radyolojisi toplantısı" — 17-19 fevral 2017',
    'Türk Magnit Rezonans Dərnəyi 22. kongress — 25-27 may 2017, Ankara',
    '"Türk Radyoloji Derneği 38.Ulusal Kongresi" — 31 oktyabr–4 noyabr 2017',
    '"Türk Nöroradyoloji Derneği Yıllık Bilimsel Toplantısı" — 16-18 fevral 2018',
    '"TRD İstanbul Şube Obstetrik Fetal Radyoloji Sempozyumu" — 18 mart 2018',
    '"TRD İstanbul Şube Çocuk Radyolojisi Sempozyumu" — 7 oktyabr 2018',
    '"2.Multiparametrik Prostat MR Görüntüleme Kursu" — 17 noyabr 2018',
    '"Türk Nöroradyoloji Derneği Yıllık Bilimsel Toplantısı" — 15-17 fevral 2019',
    '"Radyoloji Kış Okulu" — 4-10 fevral 2019, Antalya',
    '"Kardiyak MR Görüntüleme Sempozyumu" — 28 sentyabr, İstanbul',
    '"Türk Radyoloji Derneği 40.Uluslarası Kongresi" — 6-10 noyabr 2019',
    'Kore ve Türk Radyoloji Dernekleri Ortak Kardiyak Görüntüleme Kursu — 6 noyabr, Antalya',
  ],
}

export default function HekimProfilPage() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const [doctor,     setDoctor]     = useState(null)
  const [ratings,    setRatings]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [activeTab,  setActiveTab]  = useState('haqqinda')

  useEffect(() => {
    Promise.all([
      fetch(`${BASE}/api/v1/doctors/${id}`).then(r=>r.json()),
      fetch(`${BASE}/api/v1/ratings/doctor/${id}`).then(r=>r.json()).catch(()=>({ data: [] })),
    ]).then(([dRes, rRes]) => {
      setDoctor(dRes.data || dRes)
      setRatings(rRes.data?.ratings || rRes.data || [])
    }).finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
      <div style={{ width:36, height:36, border:`3px solid #e2e8f0`, borderTopColor:TEAL, borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!doctor) return (
    <div style={{ textAlign:'center', padding:80, fontFamily:FONT }}>
      <p style={{ fontSize:18, color:'#64748b' }}>Həkim tapılmadı</p>
      <button onClick={() => navigate('/hekimler')} style={{ marginTop:16, padding:'10px 24px', background:TEAL, color:'white', border:'none', borderRadius:8, cursor:'pointer' }}>← Geri</button>
    </div>
  )

  const name    = doctor.userId?.fullName || doctor.fullName || '—'
  const spec    = doctor.specialization || doctor.specialty || ''
  const exp     = doctor.experience || 0
  const rating  = doctor.averageRating || 0
  const photo   = doctor.userId?.photoUrl || doctor.image || null
  const initials = name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)

  const StarRating = ({ value }) => (
    <span style={{ display:'flex', gap:2 }}>
      {[1,2,3,4,5].map(s => (
        <svg key={s} width="16" height="16" viewBox="0 0 24 24"
          fill={s <= Math.round(value) ? '#f59e0b' : 'none'}
          stroke="#f59e0b" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </span>
  )

  const TABS = [
    { key:'haqqinda', label:'Tərcümeyi-hal'        },
    { key:'nesrler',  label:'Nəşrlər'               },
    { key:'uzvluk',   label:'Üzvlüklər'             },
    { key:'kurslar',  label:'İştirak Etdiyi Kurslar'},
  ]

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', fontFamily:FONT, paddingTop:130 }}>

      {/* HERO */}
      <div style={{ background:`linear-gradient(135deg, ${NAVY} 0%, ${TEAL} 100%)`, padding:'40px 0' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 32px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:24, flexWrap:'wrap' }}>
          <div style={{ display:'flex', alignItems:'center', gap:24 }}>
            {/* Avatar */}
            <div style={{ width:100, height:100, borderRadius:'50%', border:'3px solid rgba(255,255,255,0.3)', overflow:'hidden', flexShrink:0, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              {photo
                ? <img src={photo} alt={name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                : <span style={{ fontSize:36, fontWeight:800, color:'white' }}>{initials}</span>
              }
            </div>
            {/* Info */}
            <div>
              <p style={{ margin:'0 0 4px', fontSize:13, color:'rgba(255,255,255,0.7)' }}>Həkim</p>
              <h1 style={{ margin:'0 0 8px', fontSize:28, fontWeight:800, color:'white', fontFamily:"'Raleway',sans-serif" }}>Dr. {name}</h1>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:8 }}>
                <span style={{ background:'rgba(255,255,255,0.2)', color:'white', fontSize:12, fontWeight:600, padding:'4px 12px', borderRadius:20 }}>{spec}</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
                {exp > 0 && <span style={{ fontSize:13, color:'rgba(255,255,255,0.8)' }}>🏥 {exp} il təcrübə</span>}
                {spec && <span style={{ fontSize:13, color:'rgba(255,255,255,0.8)' }}>🏷 {spec}</span>}
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:8 }}>
                <StarRating value={rating} />
                <span style={{ fontSize:13, color:'rgba(255,255,255,0.8)' }}>{rating > 0 ? rating.toFixed(1) : '0.0'} · {doctor.totalRatings || 0} rəy</span>
                {doctor.isAvailable !== false && (
                  <span style={{ background:'#22c55e', color:'white', fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20 }}>● Qəbul edir</span>
                )}
              </div>
            </div>
          </div>
          {/* CTA */}
          <button onClick={() => navigate(`/randevu?doctorId=${id}`)}
            style={{ padding:'13px 28px', background:'white', color:NAVY, border:'none', borderRadius:10, fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:FONT, boxShadow:'0 4px 16px rgba(0,0,0,0.15)', flexShrink:0 }}>
            Randevu Al
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'32px 32px 60px', display:'grid', gridTemplateColumns:'1fr 340px', gap:24, alignItems:'start' }}>

        {/* LEFT */}
        <div>
          {/* Tab bar */}
          <div style={{ display:'flex', borderBottom:`2px solid #e2e8f0`, marginBottom:20, background:'white', borderRadius:'12px 12px 0 0', overflow:'hidden' }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                style={{ flex:1, padding:'14px 8px', border:'none', background:'none', cursor:'pointer', fontSize:13, fontWeight: activeTab===t.key ? 700 : 400,
                  color: activeTab===t.key ? '#2563eb' : '#64748b',
                  borderBottom: activeTab===t.key ? '2px solid #2563eb' : '2px solid transparent',
                  marginBottom:-2, fontFamily:FONT, transition:'all 0.15s', whiteSpace:'nowrap' }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ background:'white', borderRadius:'0 0 12px 12px', border:'1px solid #e2e8f0', borderTop:'none', padding:'24px 28px', minHeight:200 }}>

            {activeTab === 'haqqinda' && (
              <div>
                {doctor.bio && <p style={{ fontSize:14, color:'#374151', lineHeight:1.8, marginBottom:24 }}>{doctor.bio}</p>}
                <p style={{ fontSize:14, fontWeight:700, color:'#2563eb', marginBottom:8 }}>Tahsil:</p>
                <ul style={{ margin:'0 0 20px', paddingLeft:20 }}>
                  {CV.tahsil.map((t,i) => <li key={i} style={{ fontSize:14, color:'#374151', marginBottom:6, lineHeight:1.6 }}>{t}</li>)}
                </ul>
                <p style={{ fontSize:14, fontWeight:700, color:'#2563eb', marginBottom:8 }}>Radiologiya sahəsində yetərlilik:</p>
                <ul style={{ margin:0, paddingLeft:20 }}>
                  {CV.yeterlilik.map((t,i) => <li key={i} style={{ fontSize:14, color:'#374151', marginBottom:6, lineHeight:1.6 }}>{t}</li>)}
                </ul>
              </div>
            )}

            {activeTab === 'nesrler' && (
              <div>
                <p style={{ fontSize:14, fontWeight:700, color:'#2563eb', marginBottom:12 }}>Elmi araşdırmalar:</p>
                <ul style={{ margin:0, paddingLeft:20 }}>
                  {CV.nesrler.map((n,i) => <li key={i} style={{ fontSize:14, color:'#374151', marginBottom:10, lineHeight:1.7 }}>{n}</li>)}
                </ul>
              </div>
            )}

            {activeTab === 'uzvluk' && (
              <ul style={{ margin:0, paddingLeft:20 }}>
                {CV.uzvlukler.map((u,i) => <li key={i} style={{ fontSize:14, color:'#374151', marginBottom:8, lineHeight:1.6 }}>{u}</li>)}
              </ul>
            )}

            {activeTab === 'kurslar' && (
              <ul style={{ margin:0, paddingLeft:20 }}>
                {CV.kurslar.map((k,i) => <li key={i} style={{ fontSize:14, color:'#374151', marginBottom:8, lineHeight:1.6 }}>{k}</li>)}
              </ul>
            )}

          </div>
        </div>

        {/* RIGHT */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

          {/* Contact card */}
          <div style={{ background:'white', borderRadius:12, border:'1px solid #e2e8f0', padding:'20px 22px' }}>
            <h3 style={{ margin:'0 0 16px', fontSize:15, fontWeight:700, color:NAVY, display:'flex', alignItems:'center', gap:8 }}>
              📞 Əlaqə məlumatları
            </h3>
            {[
              { label:'Konsultasiya haqqı', value: doctor.consultationFee ? `${doctor.consultationFee} ₼` : '—' },
              { label:'Şöbə',              value: doctor.departmentId?.name || doctor.department || '—' },
              { label:'Telefon',           value: doctor.userId?.phone || '—' },
              { label:'E-poçt',            value: doctor.userId?.email || '—' },
            ].map((row,i,arr) => (
              <div key={i} style={{ padding:'10px 0', borderBottom: i<arr.length-1 ? '1px solid #f1f5f9':'none' }}>
                <div style={{ fontSize:11, color:'#94a3b8', marginBottom:3 }}>{row.label}</div>
                <div style={{ fontSize:14, fontWeight:500, color:NAVY }}>{row.value}</div>
              </div>
            ))}
          </div>

          {/* Ratings card */}
          <div style={{ background:'white', borderRadius:12, border:'1px solid #e2e8f0', padding:'20px 22px' }}>
            <h3 style={{ margin:'0 0 16px', fontSize:15, fontWeight:700, color:NAVY }}>Rəylər</h3>
            {ratings.length === 0
              ? <p style={{ fontSize:13, color:'#94a3b8', margin:0 }}>Hələ rəy yoxdur</p>
              : ratings.slice(0,5).map((r,i) => (
                <div key={i} style={{ borderBottom: i<ratings.length-1 ? '1px solid #f1f5f9':'none', paddingBottom:12, marginBottom:12 }}>
                  <StarRating value={r.rating || r.score || 0} />
                  {r.comment && <p style={{ fontSize:13, color:'#374151', margin:'6px 0 0', lineHeight:1.6 }}>{r.comment}</p>}
                  <span style={{ fontSize:11, color:'#94a3b8' }}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString('az-AZ') : ''}</span>
                </div>
              ))
            }
          </div>

        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
