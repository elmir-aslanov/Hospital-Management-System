import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import api from '../../api/axios';

export default function BookingPage() {
  const { data } = useFetch('/doctors', { limit: 50 });
  const doctors  = data?.doctors || [];
  const [form, setForm]       = useState({ doctorId:'', date:'', startTime:'09:00', endTime:'09:30', reason:'' });
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState('');

  const inp = (k, v) => setForm(f => ({...f, [k]: v}));

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) { setError('Randevu üçün daxil olun'); setLoading(false); return; }
      await api.post('/appointments', form);
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  if (done) return (
    <div style={{ background:'#050c17', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontFamily:'var(--font-sans)', paddingTop:64 }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:64, marginBottom:16 }}>✅</div>
        <h2 style={{ fontSize:28, fontWeight:800, marginBottom:10 }}>Randevunuz qeydə alındı!</h2>
        <p style={{ color:'rgba(255,255,255,0.55)' }}>Həkiminiz tezliklə sizinlə əlaqə saxlayacaq.</p>
      </div>
    </div>
  );

  return (
    <div style={{ background:'#050c17', minHeight:'100vh', paddingTop:80, fontFamily:'var(--font-sans)', color:'#fff' }}>
      <div style={{ maxWidth:580, margin:'64px auto', padding:'0 24px' }}>
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <h1 style={{ fontSize:36, fontWeight:900, marginBottom:8 }}>Randevu Al</h1>
          <p style={{ color:'rgba(255,255,255,0.5)' }}>Aşağıdakı formu doldurun</p>
        </div>
        <form onSubmit={submit} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:20, padding:'40px 36px', display:'flex', flexDirection:'column', gap:18 }}>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.6)', display:'block', marginBottom:6 }}>Həkim</label>
            <select value={form.doctorId} onChange={e=>inp('doctorId',e.target.value)} required
              style={{ width:'100%', height:46, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:10, padding:'0 14px', color: form.doctorId ? '#fff' : 'rgba(255,255,255,0.4)', fontSize:14, fontFamily:'inherit', outline:'none' }}>
              <option value="">Həkim seçin…</option>
              {doctors.map(d => <option key={d._id} value={d._id} style={{background:'#0a1628'}}>{d.userId?.fullName} — {d.specialization}</option>)}
            </select>
          </div>
          {[
            { k:'date',      l:'Tarix',     t:'date' },
            { k:'startTime', l:'Başlama',   t:'time' },
            { k:'endTime',   l:'Bitmə',     t:'time' },
          ].map(f => (
            <div key={f.k}>
              <label style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.6)', display:'block', marginBottom:6 }}>{f.l}</label>
              <input type={f.t} value={form[f.k]} onChange={e=>inp(f.k,e.target.value)} required
                style={{ width:'100%', height:46, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:10, padding:'0 14px', color:'#fff', fontSize:14, fontFamily:'inherit', outline:'none', colorScheme:'dark', boxSizing:'border-box' }}/>
            </div>
          ))}
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.6)', display:'block', marginBottom:6 }}>Müraciət səbəbi</label>
            <textarea value={form.reason} onChange={e=>inp('reason',e.target.value)} required rows={3} placeholder="Şikayəti qısaca izah edin…"
              style={{ width:'100%', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:10, padding:'12px 14px', color:'#fff', fontSize:14, fontFamily:'inherit', outline:'none', resize:'vertical', boxSizing:'border-box' }}/>
          </div>
          {error && <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:8, padding:'10px 14px', color:'#FCA5A5', fontSize:13 }}>{error}</div>}
          <button type="submit" disabled={loading} style={{ height:50, background:'#00BCD4', border:'none', borderRadius:10, color:'#fff', fontSize:16, fontWeight:700, cursor:'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Göndərilir…' : 'Randevunu Təsdiqlə'}
          </button>
        </form>
      </div>
    </div>
  );
}
