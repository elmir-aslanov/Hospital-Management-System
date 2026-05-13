/* eslint-disable */
import Icons from './Icons';
import { useFetch } from '../hooks/useFetch';

function SkeletonKpi() {
  return (
    <div className="kpi">
      <div style={{ height:12, width:100, borderRadius:4, background:'var(--em-slate-100)', marginBottom:16 }}/>
      <div style={{ height:32, width:80,  borderRadius:4, background:'var(--em-slate-100)', marginBottom:10 }}/>
      <div style={{ height:11, width:120, borderRadius:4, background:'var(--em-slate-100)' }}/>
    </div>
  );
}

function SkeletonRow({ cols }) {
  return (
    <tr>{Array.from({length:cols}).map((_,i)=>(
      <td key={i}><div style={{ height:13, borderRadius:4, background:'var(--em-slate-100)' }}/></td>
    ))}</tr>
  );
}

function ErrorBanner({ msg }) {
  return (
    <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:10, padding:'14px 18px', color:'#991B1B', fontSize:13, display:'flex', gap:10, alignItems:'center', marginBottom:16 }}>
      <Icons.AlertCircle size={16}/> {msg}
    </div>
  );
}

const STATUS_BADGE = {
  scheduled: <span className="bdg bdg-pending"><span className="d"/>Gözləyir</span>,
  confirmed: <span className="bdg bdg-confirmed"><span className="d"/>Təsdiqləndi</span>,
  completed: <span className="bdg bdg-done"><span className="d"/>Tamamlandı</span>,
  cancelled: <span className="bdg bdg-cancelled"><span className="d"/>Ləğv edildi</span>,
  missed:    <span className="bdg bdg-emergency"><span className="d"/>Buraxıldı</span>,
};

export default function AdminDashboard() {
  const { data, loading, error } = useFetch('/dashboard/stats');

  const ov    = data?.overview || {};
  const tod   = data?.today    || {};
  const beds  = data?.beds     || {};
  const week  = data?.weekly   || {};
  const recent = data?.recent  || {};

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p>{new Date().toLocaleDateString('az-AZ',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>
        </div>
        <div className="actions">
          <button className="btn-primary"><Icons.Plus size={16}/>Yeni randevu</button>
        </div>
      </div>

      {error && <ErrorBanner msg={error}/>}

      {/* KPI row */}
      <div className="kpi-grid">
        {loading ? <><SkeletonKpi/><SkeletonKpi/><SkeletonKpi/><SkeletonKpi/></> : (<>
          <div className="kpi">
            <div className="kpi-head"><span className="kpi-lbl">Bugünkü randevular</span><div className="kpi-ico" style={{background:'#CCF5FA',color:'#008793'}}><Icons.Calendar size={20}/></div></div>
            <div className="kpi-num">{tod.appointments ?? 0}</div>
            <div className="kpi-delta up">Həftəlik: {week.appointments ?? 0}</div>
          </div>
          <div className="kpi">
            <div className="kpi-head"><span className="kpi-lbl">Ümumi pasiyentlər</span><div className="kpi-ico" style={{background:'#DCE6F1',color:'#1C2F47'}}><Icons.User size={20}/></div></div>
            <div className="kpi-num">{(ov.totalPatients??0).toLocaleString()}</div>
            <div className="kpi-delta up">Bu gün +{tod.newPatients ?? 0}</div>
          </div>
          <div className="kpi">
            <div className="kpi-head"><span className="kpi-lbl">Boş çarpayılar</span><div className="kpi-ico" style={{background:'#D1FAE5',color:'#065F46'}}><Icons.Bed size={20}/></div></div>
            <div className="kpi-num">{beds.available ?? 0}<span className="sub"> / {beds.total ?? 0}</span></div>
            <div className="kpi-delta">Doluluk {beds.occupancyRate ?? 0}%</div>
          </div>
          <div className="kpi">
            <div className="kpi-head"><span className="kpi-lbl">Həkimlər</span><div className="kpi-ico" style={{background:'#FEEDC9',color:'#92600B'}}><Icons.Stethoscope size={20}/></div></div>
            <div className="kpi-num">{ov.totalDoctors ?? 0}</div>
            <div className="kpi-delta">Aktiv qəbul: {ov.activeAdmissions ?? 0}</div>
          </div>
        </>)}
      </div>

      {/* Recent appointments */}
      <div className="panel">
        <div className="panel-head">
          <h3>Son randevular</h3>
          <span className="sub">Son 5</span>
        </div>
        <table className="tbl">
          <thead><tr><th>Pasiyent</th><th>Həkim</th><th>İxtisas</th><th>Tarix</th><th>Vaxt</th><th>Status</th></tr></thead>
          <tbody>
            {loading
              ? Array.from({length:5}).map((_,i)=><SkeletonRow key={i} cols={6}/>)
              : !(recent.appointments?.length)
                ? <tr><td colSpan={6} style={{textAlign:'center',color:'var(--fg-muted)',padding:'24px 0'}}>Məlumat yoxdur</td></tr>
                : (recent.appointments).map((a,i)=>{
                    const pName = a.patientId?.userId?.fullName || 'N/A';
                    const dName = a.doctorId?.userId?.fullName  || 'N/A';
                    const ini   = pName.split(' ').map(n=>n[0]).join('').slice(0,2);
                    return (
                      <tr key={i}>
                        <td><div className="patient"><div className="av">{ini}</div><div><p className="name">{pName}</p></div></div></td>
                        <td>{dName}</td>
                        <td style={{color:'var(--fg-muted)',fontSize:12}}>{a.doctorId?.specialization||'—'}</td>
                        <td className="id">{new Date(a.date).toLocaleDateString('az-AZ')}</td>
                        <td style={{fontFamily:'JetBrains Mono',fontSize:13}}>{a.startTime}</td>
                        <td>{STATUS_BADGE[a.status]||a.status}</td>
                      </tr>
                    );
                  })
            }
          </tbody>
        </table>
      </div>

      {/* Recent patients */}
      <div className="panel" style={{marginTop:16}}>
        <div className="panel-head">
          <h3>Yeni pasiyentlər</h3>
          <span className="sub">Son qeydiyyatlar</span>
        </div>
        <table className="tbl">
          <thead><tr><th>Ad</th><th>E-poçt</th><th>Qan qrupu</th><th>Pasiyent ID</th><th>Tarix</th></tr></thead>
          <tbody>
            {loading
              ? Array.from({length:5}).map((_,i)=><SkeletonRow key={i} cols={5}/>)
              : !(recent.patients?.length)
                ? <tr><td colSpan={5} style={{textAlign:'center',color:'var(--fg-muted)',padding:'24px 0'}}>Məlumat yoxdur</td></tr>
                : (recent.patients).map((p,i)=>{
                    const n = p.userId?.fullName||'?';
                    const ini = n.split(' ').map(x=>x[0]).join('').slice(0,2);
                    return (
                      <tr key={i}>
                        <td><div className="patient"><div className="av">{ini}</div><div><p className="name">{n}</p></div></div></td>
                        <td style={{color:'var(--fg-muted)',fontSize:12}}>{p.userId?.email||'—'}</td>
                        <td><span className="id">{p.bloodGroup||'—'}</span></td>
                        <td><span className="id">{p.patientId||'—'}</span></td>
                        <td style={{fontSize:12,color:'var(--fg-muted)'}}>{new Date(p.createdAt).toLocaleDateString('az-AZ')}</td>
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
