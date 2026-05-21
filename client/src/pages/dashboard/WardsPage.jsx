/* eslint-disable */
import { useState, useEffect } from 'react';
import '../../styles/dashboard.css';
import { useFetch } from '../../hooks/useFetch';
import Icons from '../../components/Icons';
import { toast } from 'sonner';
import api from '../../api/axios';

let user = {};
try { user = JSON.parse(localStorage.getItem('user') || '{}'); } catch {}
const canEdit = ['ADMIN', 'SUPER_ADMIN', 'NURSE'].includes(user.role);

const BED_BADGE = {
  available:    { bg: '#dcfce7', color: '#166534', label: 'Boş' },
  occupied:     { bg: '#fee2e2', color: '#991b1b', label: 'Dolu' },
  maintenance:  { bg: '#fef9c3', color: '#854d0e', label: 'Texniki' },
};

function WardCard({ ward }) {
  const [expanded, setExpanded]     = useState(false);
  const [beds, setBeds]             = useState([]);
  const [loadingBeds, setLoadingBeds] = useState(false);
  const [patchingId, setPatchingId] = useState(null);

  function toggle() {
    if (!expanded && !beds.length) {
      setLoadingBeds(true);
      api.get(`/wards/${ward._id}/beds`)
        .then(res => {
          const d = res.data?.data ?? res.data;
          setBeds(Array.isArray(d) ? d : d?.beds || []);
        })
        .catch(() => toast.error('Çarpayılar yüklənmədi.'))
        .finally(() => setLoadingBeds(false));
    }
    setExpanded(e => !e);
  }

  async function patchBed(bedId, status) {
    setPatchingId(bedId);
    try {
      await api.patch(`/wards/${ward._id}/beds/${bedId}/status`, { status });
      setBeds(prev => prev.map(b => b._id === bedId ? { ...b, status } : b));
      toast.success('Status yeniləndi.');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Yenilənmədi.');
    } finally {
      setPatchingId(null);
    }
  }

  const occupancyPct = ward.totalBeds > 0 ? Math.round((ward.occupiedBeds / ward.totalBeds) * 100) : 0;

  return (
    <div className="panel" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
      {/* Ward Header */}
      <div
        onClick={toggle}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', cursor: 'pointer', borderBottom: expanded ? '1px solid var(--border)' : 'none' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: '#DCE6F1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1C2F47' }}>
            <Icons.Bed size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--fg)' }}>{ward.name}</div>
            <div style={{ fontSize: 12, color: 'var(--fg-muted)', textTransform: 'capitalize' }}>{ward.type}{ward.floor ? ` · ${ward.floor}-ci mərtəbə` : ''}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--fg)' }}>{ward.totalBeds}</div>
            <div style={{ fontSize: 11, color: 'var(--fg-muted)' }}>Cəmi</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#10b981' }}>{ward.availableBeds ?? '—'}</div>
            <div style={{ fontSize: 11, color: 'var(--fg-muted)' }}>Boş</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#ef4444' }}>{ward.occupiedBeds ?? '—'}</div>
            <div style={{ fontSize: 11, color: 'var(--fg-muted)' }}>Dolu</div>
          </div>

          {/* Progress bar */}
          <div style={{ width: 80 }}>
            <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginBottom: 4, textAlign: 'right' }}>{occupancyPct}%</div>
            <div style={{ height: 6, borderRadius: 3, background: 'var(--em-slate-100)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${occupancyPct}%`, borderRadius: 3, background: occupancyPct > 80 ? '#ef4444' : occupancyPct > 50 ? '#f59e0b' : '#10b981', transition: 'width 0.4s' }} />
            </div>
          </div>

          <span style={{ fontSize: 18, color: 'var(--fg-muted)', transition: 'transform 0.2s', transform: expanded ? 'rotate(90deg)' : 'none' }}>›</span>
        </div>
      </div>

      {/* Beds Panel */}
      {expanded && (
        <div style={{ padding: '16px 22px' }}>
          {loadingBeds ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ height: 60, borderRadius: 8, background: 'var(--em-slate-100)', animation: 'pulse 1.5s ease-in-out infinite' }} />
              ))}
            </div>
          ) : !beds.length ? (
            <p style={{ color: 'var(--fg-muted)', fontSize: 13, margin: 0 }}>Çarpayı tapılmadı.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 10 }}>
              {beds.map(bed => {
                const badge = BED_BADGE[bed.status] || { bg: '#f1f5f9', color: '#475569', label: bed.status };
                return (
                  <div key={bed._id} style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--fg)' }}>#{bed.bedNumber}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 12, background: badge.bg, color: badge.color }}>{badge.label}</span>
                    </div>
                    {canEdit && (
                      <select
                        value={bed.status}
                        disabled={patchingId === bed._id}
                        onChange={e => patchBed(bed._id, e.target.value)}
                        style={{ width: '100%', fontSize: 12, padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--fg)', cursor: 'pointer' }}
                      >
                        <option value="available">Boş</option>
                        <option value="occupied">Dolu</option>
                        <option value="maintenance">Texniki</option>
                      </select>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function WardsPage() {
  const { data, loading, error } = useFetch('/wards');
  const wards = data?.wards || data?.data?.wards || [];

  useEffect(() => {
    if (error) toast.error('Palata məlumatları yüklənmədi.');
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
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 16px', color: '#991B1B', fontSize: 13, marginBottom: 16, display: 'flex', gap: 8 }}>
          <Icons.AlertCircle size={16} />{error}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ height: 80, borderRadius: 12, background: '#e2e8f0', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      ) : !wards.length ? (
        <div className="panel" style={{ textAlign: 'center', padding: '48px 0', color: 'var(--fg-muted)' }}>Palata tapılmadı</div>
      ) : (
        wards.map(w => <WardCard key={w._id} ward={w} />)
      )}

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
    </div>
  );
}
