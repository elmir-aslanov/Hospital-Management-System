/* eslint-disable */
import { useState, useEffect } from 'react';
import '../../styles/dashboard.css';
import { useFetch } from '../../hooks/useFetch';
import Icons from '../../components/Icons';
import { toast } from 'sonner';

function SkeletonRow({cols}){return<tr>{Array.from({length:cols}).map((_,i)=><td key={i}><div style={{height:13,borderRadius:4,background:'var(--em-slate-100)'}}/></td>)}</tr>}

export default function PatientsPage() {
  const [page, setPage] = useState(1);
  const [q, setQ]       = useState('');
  const { data, loading, error } = useFetch(q ? '/patients/search' : '/patients', q ? { query: q, limit:15 } : { page, limit:15 });

  const patients = data?.patients || data?.results || [];
  const total    = data?.total || 0;
  const pages    = Math.ceil(total / 15) || 1;

  useEffect(() => {
    if (error) toast.error('Pasiyent məlumatları yüklənmədi. Serverlə əlaqəni yoxlayın.');
  }, [error]);

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Pasiyentlər</h1>
          <p>Cəmi: {loading ? '…' : total} qeydiyyat</p>
        </div>
        <div className="actions">
          <div className="search" style={{width:280}}>
            <Icons.Search size={16} style={{color:'var(--fg-muted)'}}/>
            <input placeholder="Ad, ID axtar…" value={q} onChange={e=>{setQ(e.target.value);setPage(1);}}/>
          </div>
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
            <tr><th>Pasiyent</th><th>E-poçt</th><th>Qan qrupu</th><th>ID</th><th>Xroniki</th><th>Tarix</th></tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({length:10}).map((_,i)=><SkeletonRow key={i} cols={6}/>)
              : !patients.length
                ? <tr><td colSpan={6} style={{textAlign:'center',color:'var(--fg-muted)',padding:'32px 0'}}>Pasiyent tapılmadı</td></tr>
                : patients.map((p,i)=>{
                    const n   = p.userId?.fullName || '—';
                    const ini = n.split(' ').map(x=>x[0]).join('').slice(0,2);
                    return (
                      <tr key={i}>
                        <td>
                          <div className="patient">
                            <div className="av">{ini}</div>
                            <div><p className="name">{n}</p><p className="meta">{p.patientId}</p></div>
                          </div>
                        </td>
                        <td style={{color:'var(--fg-muted)',fontSize:12}}>{p.userId?.email||'—'}</td>
                        <td><span className="id">{p.bloodGroup||'—'}</span></td>
                        <td><span className="id">{p.patientId||'—'}</span></td>
                        <td style={{fontSize:12,color:'var(--fg-muted)'}}>{(p.chronicConditions||[]).join(', ')||'—'}</td>
                        <td style={{fontSize:12,color:'var(--fg-muted)'}}>{new Date(p.createdAt).toLocaleDateString('az-AZ')}</td>
                      </tr>
                    );
                  })
            }
          </tbody>
        </table>

        {/* Pagination */}
        {pages > 1 && (
          <div style={{display:'flex',justifyContent:'center',gap:6,padding:'16px 0'}}>
            <button className="btn-outline" disabled={page<=1} onClick={()=>setPage(p=>p-1)} style={{height:32,padding:'0 12px'}}>‹</button>
            {Array.from({length:Math.min(pages,7)}).map((_,i)=>{
              const pg = i+1;
              return <button key={pg} className={pg===page?'btn-primary':'btn-outline'} onClick={()=>setPage(pg)} style={{height:32,padding:'0 12px',minWidth:32}}>{pg}</button>;
            })}
            <button className="btn-outline" disabled={page>=pages} onClick={()=>setPage(p=>p+1)} style={{height:32,padding:'0 12px'}}>›</button>
          </div>
        )}
      </div>
    </div>
  );
}
