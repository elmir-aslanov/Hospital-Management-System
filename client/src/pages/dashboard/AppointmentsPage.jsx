/* eslint-disable */
import { useState, useEffect } from 'react';
import '../../styles/dashboard.css';
import { useFetch } from '../../hooks/useFetch';
import Icons from '../../components/Icons';
import { toast } from 'sonner';
import api from '../../api/axios';

function SkeletonRow({ cols }) {
  return (
    <tr>{Array.from({ length: cols }).map((_, i) => (
      <td key={i}><div style={{ height: 13, borderRadius: 4, background: 'var(--em-slate-100)' }} /></td>
    ))}</tr>
  );
}

const STATUS_BADGE = {
  scheduled:  <span className="bdg bdg-pending"><span className="d" />Gözləyir</span>,
  confirmed:  <span className="bdg bdg-confirmed"><span className="d" />Təsdiqləndi</span>,
  completed:  <span className="bdg bdg-done"><span className="d" />Tamamlandı</span>,
  cancelled:  <span className="bdg bdg-cancelled"><span className="d" />Ləğv edildi</span>,
  missed:     <span className="bdg bdg-emergency"><span className="d" />Buraxıldı</span>,
  in_progress:<span className="bdg bdg-pending"><span className="d" />Davam edir</span>,
};

const STATUS_OPTIONS = [
  { value: 'scheduled',   label: 'Gözləyir' },
  { value: 'confirmed',   label: 'Təsdiqləndi' },
  { value: 'completed',   label: 'Tamamlandı' },
  { value: 'cancelled',   label: 'Ləğv edildi' },
  { value: 'missed',      label: 'Buraxıldı' },
  { value: 'in_progress', label: 'Davam edir' },
];

let user = {};
try { user = JSON.parse(localStorage.getItem('user') || '{}'); } catch {}
const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'RECEPTIONIST'].includes(user.role);

export default function AppointmentsPage() {
  const [page, setPage]         = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter]     = useState('');
  const [patchingId, setPatchingId]     = useState(null);

  const params = { page, limit: 20, ...(statusFilter && { status: statusFilter }), ...(dateFilter && { date: dateFilter }) };
  const { data, loading, error, } = useFetch('/appointments', params);

  const appts = data?.appointments || data?.data?.appointments || [];
  const total = data?.total || data?.data?.total || 0;
  const pages = Math.ceil(total / 20) || 1;

  useEffect(() => {
    if (error) toast.error('Randevu məlumatları yüklənmədi.');
  }, [error]);

  async function patchStatus(id, status) {
    setPatchingId(id);
    try {
      await api.patch(`/appointments/${id}/status`, { status });
      toast.success('Status yeniləndi.');
      window.location.reload();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Status yenilənmədi.');
    } finally {
      setPatchingId(null);
    }
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Randevular</h1>
          <p>Cəmi: {loading ? '…' : total}</p>
        </div>
        <div className="actions" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input
            type="date"
            value={dateFilter}
            onChange={e => { setDateFilter(e.target.value); setPage(1); }}
            style={{ height: 36, border: '1px solid var(--border)', borderRadius: 8, padding: '0 10px', fontSize: 13, fontFamily: 'inherit', background: 'var(--bg-surface)', color: 'var(--fg)' }}
          />
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            style={{ height: 36, border: '1px solid var(--border)', borderRadius: 8, padding: '0 12px', fontSize: 13, fontFamily: 'inherit', background: 'var(--bg-surface)', color: 'var(--fg)' }}
          >
            <option value="">Bütün statuslar</option>
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 16px', color: '#991B1B', fontSize: 13, marginBottom: 16, display: 'flex', gap: 8 }}>
          <Icons.AlertCircle size={16} />{error}
        </div>
      )}

      <div className="panel">
        <table className="tbl">
          <thead>
            <tr>
              <th>#</th><th>Pasiyent</th><th>Həkim</th><th>Tarix</th>
              <th>Vaxt</th><th>Səbəb</th><th>Status</th>
              {isAdmin && <th>Əməliyyat</th>}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} cols={isAdmin ? 8 : 7} />)
              : !appts.length
                ? <tr><td colSpan={isAdmin ? 8 : 7} style={{ textAlign: 'center', color: 'var(--fg-muted)', padding: '32px 0' }}>Randevu tapılmadı</td></tr>
                : appts.map((a, i) => {
                    const pn  = a.patientId?.userId?.fullName || a.patientId?.fullName || '—';
                    const dn  = a.doctorId?.userId?.fullName  || '—';
                    const ini = pn.split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase();
                    return (
                      <tr key={a._id || i}>
                        <td className="id">{(page - 1) * 20 + i + 1}</td>
                        <td>
                          <div className="patient">
                            <div className="av">{ini}</div>
                            <div><p className="name">{pn}</p></div>
                          </div>
                        </td>
                        <td>
                          <div>{dn}</div>
                          <div style={{ fontSize: 11, color: 'var(--fg-muted)' }}>{a.doctorId?.specialization || ''}</div>
                        </td>
                        <td className="id">{a.date ? new Date(a.date).toLocaleDateString('az-AZ') : '—'}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{a.startTime} – {a.endTime}</td>
                        <td style={{ color: 'var(--fg-muted)', fontSize: 12, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.reason || '—'}</td>
                        <td>{STATUS_BADGE[a.status] || <span className="id">{a.status}</span>}</td>
                        {isAdmin && (
                          <td>
                            <select
                              value={a.status}
                              disabled={patchingId === a._id}
                              onChange={e => patchStatus(a._id, e.target.value)}
                              style={{ fontSize: 12, border: '1px solid var(--border)', borderRadius: 6, padding: '4px 8px', background: 'var(--bg-surface)', color: 'var(--fg)', cursor: 'pointer' }}
                            >
                              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                          </td>
                        )}
                      </tr>
                    );
                  })
            }
          </tbody>
        </table>

        {pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '16px 0' }}>
            <button className="btn-outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={{ height: 32, padding: '0 12px' }}>‹</button>
            {Array.from({ length: Math.min(pages, 7) }).map((_, i) => {
              const pg = i + 1;
              return <button key={pg} className={pg === page ? 'btn-primary' : 'btn-outline'} onClick={() => setPage(pg)} style={{ height: 32, padding: '0 12px', minWidth: 32 }}>{pg}</button>;
            })}
            <button className="btn-outline" disabled={page >= pages} onClick={() => setPage(p => p + 1)} style={{ height: 32, padding: '0 12px' }}>›</button>
          </div>
        )}
      </div>
    </div>
  );
}
