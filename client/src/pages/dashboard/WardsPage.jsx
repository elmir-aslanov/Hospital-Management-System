/* eslint-disable */
import { useEffect } from 'react';
import { useFetch } from '../../hooks/useFetch';
import Icons from '../../components/Icons';
import { toast } from 'sonner';

export default function WardsPage() {
  const { data, loading, error } = useFetch('/wards');
  const wards = data?.wards || [];

  useEffect(() => {
    if (error) toast.error('Palata məlumatları yüklənmədi. Serverlə əlaqəni yoxlayın.');
  }, [error]);

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Palatalar</h1>
          <p>Cəmi: {loading ? '…' : wards.length} palata</p>
        </div>
      </div>

      {error && (
        <div style={{background:'#FEF2F2',border:'1px solid #FECACA',borderRadius:10,padding:'12px 16px',color:'#991B1B',fontSize:13,marginBottom:16,display:'flex',gap:8}}>
          <Icons.AlertCircle size={16}/>{error}
        </div>
      )}

      {loading
        ? <div className="kpi-grid">{Array.from({length:4}).map((_,i)=><div key={i} className="kpi" style={{animation:'pulse 1.5s ease-in-out infinite'}}><div style={{height:14,borderRadius:4,background:'var(--em-slate-100)',marginBottom:12}}/><div style={{height:28,borderRadius:4,background:'var(--em-slate-100)',width:60,marginBottom:8}}/></div>)}</div>
        : !wards.length
          ? <div className="panel" style={{textAlign:'center',padding:'48px 0',color:'var(--fg-muted)'}}>Palata tapılmadı</div>
          : (
            <div className="kpi-grid">
              {wards.map((w,i)=>(
                <div key={i} className="kpi">
                  <div className="kpi-head">
                    <span className="kpi-lbl">{w.name}</span>
                    <div className="kpi-ico" style={{background:'#DCE6F1',color:'#1C2F47'}}><Icons.Bed size={20}/></div>
                  </div>
                  <div className="kpi-num">{w.totalBeds}<span className="sub"> çarpayı</span></div>
                  <div className="kpi-delta" style={{textTransform:'capitalize'}}>{w.type} · {w.floor}-ci mərtəbə</div>
                </div>
              ))}
            </div>
          )
      }
    </div>
  );
}
