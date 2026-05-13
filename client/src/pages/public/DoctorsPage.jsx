import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePublicFetch } from '../../hooks/useFetch';
import { ErrorCard } from '../../components/Skeleton';

const DEPT_META = {
  Cardiology:  { color:'#EF4444', label:'Kardiologiya' },
  Neurology:   { color:'#8B5CF6', label:'Nevrologiya'  },
  Pediatrics:  { color:'#F59E0B', label:'Pediatriya'   },
  Surgery:     { color:'#10B981', label:'Cərrahiyyə'   },
  Orthopedics: { color:'#3B82F6', label:'Ortopediya'   },
  Radiology:   { color:'#00BCD4', label:'Radiologiya'  },
};

export default function DoctorsPage() {
  const [search, setSearch] = useState('');
  const { data, loading, error } = usePublicFetch('/doctors', { limit: 50 });
  const doctors = (data?.doctors || []).filter(d =>
    !search || (d.userId?.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
    d.specialization.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ background:'#050c17', minHeight:'100vh', color:'#fff', fontFamily:'var(--font-sans)', paddingTop:80 }}>
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'64px 48px' }}>
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <h1 style={{ fontSize:'clamp(32px,4vw,52px)', fontWeight:900, marginBottom:12 }}>Həkimlərimiz</h1>
          <p style={{ color:'rgba(255,255,255,0.5)', fontSize:16, marginBottom:28 }}>Peşəkar komandamız sizə hər zaman hazırdır</p>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Həkim adı və ya ixtisas axtar…"
            style={{ width:'100%', maxWidth:400, height:46, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:10, padding:'0 16px', color:'#fff', fontSize:14, fontFamily:'inherit', outline:'none' }}/>
        </div>

        {error && <ErrorCard message={error}/>}

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:20 }}>
          {loading
            ? Array.from({length:6}).map((_,i)=>(
                <div key={i} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:28, textAlign:'center' }}>
                  <div style={{ width:72, height:72, borderRadius:'50%', background:'rgba(255,255,255,0.06)', margin:'0 auto 16px' }}/>
                  <div style={{ height:14, background:'rgba(255,255,255,0.06)', borderRadius:4, marginBottom:8 }}/>
                  <div style={{ height:11, background:'rgba(255,255,255,0.06)', borderRadius:4, width:'60%', margin:'0 auto' }}/>
                </div>
              ))
            : doctors.map((d, i) => {
                const name = d.userId?.fullName || 'Həkim';
                const initials = name.split(' ').map(n=>n[0]).join('').slice(0,2);
                const m = DEPT_META[d.specialization] || { color:'#00BCD4', label:d.specialization };
                return (
                  <div key={i} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:28, textAlign:'center', transition:'all .3s', cursor:'default' }}
                    onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.03)'}>
                    <div style={{ width:72, height:72, borderRadius:'50%', background:`linear-gradient(135deg,${m.color},${m.color}66)`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', fontSize:22, fontWeight:700 }}>{initials}</div>
                    <h3 style={{ fontSize:16, fontWeight:700, marginBottom:4 }}>{name}</h3>
                    <p style={{ color:m.color, fontSize:13, fontWeight:600, marginBottom:6 }}>{m.label}</p>
                    {d.experience && <p style={{ color:'rgba(255,255,255,0.35)', fontSize:12, marginBottom:12 }}>{d.experience} il təcrübə</p>}
                    {d.consultationFee && <p style={{ color:'rgba(255,255,255,0.5)', fontSize:13 }}>₼{d.consultationFee}</p>}
                    <Link to="/randevu" style={{ display:'inline-block', marginTop:14, padding:'8px 18px', background:'rgba(0,188,212,0.15)', border:'1px solid rgba(0,188,212,0.4)', borderRadius:8, color:'#00BCD4', fontSize:13, fontWeight:600, textDecoration:'none' }}>Randevu Al</Link>
                  </div>
                );
              })
          }
        </div>
      </div>
    </div>
  );
}
