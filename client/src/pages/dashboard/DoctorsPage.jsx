/* eslint-disable */
import { useEffect } from 'react';
import '../../styles/dashboard.css';
import { useFetch } from '../../hooks/useFetch';
import Icons from '../../components/Icons';
import { toast } from 'sonner';

function SkeletonRow({cols}){return<tr>{Array.from({length:cols}).map((_,i)=><td key={i}><div style={{height:13,borderRadius:4,background:'var(--em-slate-100)'}}/></td>)}</tr>}

export default function DoctorsPage() {
  const { data, loading, error } = useFetch('/doctors', { limit: 50 });
  const doctors = data?.doctors || [];

  useEffect(() => {
    if (error) toast.error('Həkim məlumatları yüklənmədi. Serverlə əlaqəni yoxlayın.');
  }, [error]);

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Həkimlər</h1>
          <p>Cəmi: {loading ? '…' : data?.total || 0} həkim</p>
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
            <tr><th>Həkim</th><th>İxtisas</th><th>Lisenziya</th><th>Təcrübə</th><th>Reytinq</th><th>Status</th></tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({length:8}).map((_,i)=><SkeletonRow key={i} cols={6}/>)
              : !doctors.length
                ? <tr><td colSpan={6} style={{textAlign:'center',color:'var(--fg-muted)',padding:'32px 0'}}>Həkim tapılmadı</td></tr>
                : doctors.map((d,i)=>{
                    const n   = d.userId?.fullName || '—';
                    const ini = n.split(' ').map(x=>x[0]).join('').slice(0,2);
                    return (
                      <tr key={i}>
                        <td>
                          <div className="patient">
                            <div className="av">{ini}</div>
                            <div><p className="name">{n}</p><p className="meta">{d.userId?.email||''}</p></div>
                          </div>
                        </td>
                        <td>{d.specialization||'—'}</td>
                        <td><span className="id">{d.licenseNumber||'—'}</span></td>
                        <td>{d.experience != null ? `${d.experience} il` : '—'}</td>
                        <td>{d.averageRating != null ? `⭐ ${d.averageRating.toFixed(1)} / 5` : '—'}</td>
                        <td>
                          {d.isAvailable
                            ? <span className="bdg bdg-confirmed"><span className="d"/>Aktiv</span>
                            : <span className="bdg bdg-cancelled"><span className="d"/>Deaktiv</span>}
                        </td>
                      </tr>
                    );
                  })
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
