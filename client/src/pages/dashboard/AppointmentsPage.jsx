/* eslint-disable */
import { useState, useEffect } from 'react';
import '../../styles/dashboard.css';
import { useFetch } from '../../hooks/useFetch';
import Icons from '../../components/Icons';
import { toast } from 'sonner';

function SkeletonRow({cols}){return<tr>{Array.from({length:cols}).map((_,i)=><td key={i}><div style={{height:13,borderRadius:4,background:'var(--em-slate-100)'}}/></td>)}</tr>}

const STATUS_BADGE = {
  scheduled: <span className="bdg bdg-pending"><span className="d"/>Gözləyir</span>,
  confirmed: <span className="bdg bdg-confirmed"><span className="d"/>Təsdiqləndi</span>,
  completed: <span className="bdg bdg-done"><span className="d"/>Tamamlandı</span>,
  cancelled: <span className="bdg bdg-cancelled"><span className="d"/>Ləğv edildi</span>,
  missed:    <span className="bdg bdg-emergency"><span className="d"/>Buraxıldı</span>,
};

export default function AppointmentsPage() {
  const [page, setPage]     = useState(1);
  const [status, setStatus] = useState('');
  const { data, loading, error } = useFetch('/appointments', { page, limit:15, ...(status && {status}) });
  const appts = data?.appointments || [];
  const total = data?.total || 0;
  const pages = Math.ceil(total / 15) || 1;

  useEffect(() => {
    if (error) toast.error('Randevu məlumatları yüklənmədi. Serverlə əlaqəni yoxlayın.');
  }, [error]);

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Randevular</h1>
          <p>Cəmi: {loading ? '…' : total}</p>
        </div>
        <div className="actions">
          <select value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}} style={{height:36,border:'1px solid var(--border)',borderRadius:8,padding:'0 12px',fontSize:13,fontFamily:'inherit',background:'var(--bg-surface)',color:'var(--fg)'}}>
            <option value="">Bütün statuslar</option>
            <option value="scheduled">Gözləyir</option>
            <option value="confirmed">Təsdiqləndi</option>
            <option value="completed">Tamamlandı</option>
            <option value="cancelled">Ləğv edildi</option>
            <option value="missed">Buraxıldı</option>
          </select>
        </div>
      </div>

      {error && (
        <div style={{background:'#FEF2F2',border:'1px solid #FECACA',borderRadius:10,padding:'12px 16px',color:'#991B1B',fontSize:13,marginBottom:16,display:'flex',gap:8}}>
          <Icons.AlertCircle size={16}/>{error}
        </div>
      )}

      <div className="panel">
        <table className="tbl">
          <thead>
            <tr><th>Pasiyent</th><th>Həkim</th><th>Tarix</th><th>Vaxt</th><th>Səbəb</th><th>Status</th></tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({length:10}).map((_,i)=><SkeletonRow key={i} cols={6}/>)
              : !appts.length
                ? <tr><td colSpan={6} style={{textAlign:'center',color:'var(--fg-muted)',padding:'32px 0'}}>Randevu tapılmadı</td></tr>
                : appts.map((a,i)=>{
                    const pn  = a.patientId?.userId?.fullName || '—';
                    const dn  = a.doctorId?.userId?.fullName  || '—';
                    const ini = pn.split(' ').map(x=>x[0]).join('').slice(0,2);
                    return (
                      <tr key={i}>
                        <td><div className="patient"><div className="av">{ini}</div><div><p className="name">{pn}</p></div></div></td>
                        <td>{dn}</td>
                        <td className="id">{new Date(a.date).toLocaleDateString('az-AZ')}</td>
                        <td style={{fontFamily:'JetBrains Mono',fontSize:13}}>{a.startTime} – {a.endTime}</td>
                        <td style={{color:'var(--fg-muted)',fontSize:12,maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.reason||'—'}</td>
                        <td>{STATUS_BADGE[a.status]||a.status}</td>
                      </tr>
                    );
                  })
            }
          </tbody>
        </table>

        {pages > 1 && (
          <div style={{display:'flex',justifyContent:'center',gap:6,padding:'16px 0'}}>
            <button className="btn-outline" disabled={page<=1} onClick={()=>setPage(p=>p-1)} style={{height:32,padding:'0 12px'}}>‹</button>
            {Array.from({length:Math.min(pages,7)}).map((_,i)=>{
              const pg=i+1;
              return <button key={pg} className={pg===page?'btn-primary':'btn-outline'} onClick={()=>setPage(pg)} style={{height:32,padding:'0 12px',minWidth:32}}>{pg}</button>;
            })}
            <button className="btn-outline" disabled={page>=pages} onClick={()=>setPage(p=>p+1)} style={{height:32,padding:'0 12px'}}>›</button>
          </div>
        )}
      </div>
    </div>
  );
}
