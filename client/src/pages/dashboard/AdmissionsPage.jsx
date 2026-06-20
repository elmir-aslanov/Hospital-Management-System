import { useState, useEffect, useRef, useCallback } from 'react';
import '../../styles/dashboard.css';
import Icons from '../../components/Icons';
import { toast } from 'sonner';
import api from '../../api/axios';

let user = {};
try { user = JSON.parse(localStorage.getItem('user') || '{}'); } catch {}
const canManage = ['ADMIN', 'SUPER_ADMIN', 'DOCTOR'].includes(user.role);
const canTransfer = canManage || user.role === 'NURSE';

const inp = { width: '100%', border: '1px solid var(--border)', borderRadius: 9, padding: '9px 12px', fontSize: 13, color: 'var(--fg)', outline: 'none', background: 'var(--bg-surface)', boxSizing: 'border-box' };
const lbl = { fontSize: 12, fontWeight: 600, color: 'var(--fg-muted)', display: 'block', marginBottom: 6 };

function AdmitModal({ onClose, onAdmitted }) {
  const [patientSearch, setPatientSearch] = useState('');
  const [patientResults, setPatientResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [wards, setWards] = useState([]);
  const [wardId, setWardId] = useState('');
  const [beds, setBeds] = useState([]);
  const [bedId, setBedId] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const searchTimer = useRef(null);

  useEffect(() => {
    api.get('/wards').then(({ data }) => {
      const d = data?.data;
      setWards(Array.isArray(d) ? d : d?.wards || []);
    }).catch(() => setWards([]));
  }, []);

  useEffect(() => {
    if (!wardId) { setBeds([]); setBedId(''); return; }
    api.get(`/wards/${wardId}/beds`).then(({ data }) => {
      const d = data?.data;
      const list = Array.isArray(d) ? d : d?.beds || [];
      setBeds(list.filter(b => b.status === 'available'));
    }).catch(() => setBeds([]));
    setBedId('');
  }, [wardId]);

  const handlePatientSearch = (val) => {
    setPatientSearch(val);
    setSelectedPatient(null);
    clearTimeout(searchTimer.current);
    if (!val.trim()) { setPatientResults([]); return; }
    searchTimer.current = setTimeout(() => {
      api.get('/patients/search', { params: { q: val } })
        .then(({ data: d }) => {
          const list = Array.isArray(d.data) ? d.data : d.data?.patients || [];
          setPatientResults(list.slice(0, 6));
        })
        .catch(() => setPatientResults([]));
    }, 350);
  };

  const selectPatient = (p) => {
    setSelectedPatient(p);
    setPatientSearch(p.userId?.fullName || p.fullName || '');
    setPatientResults([]);
  };

  const handleSave = async () => {
    if (!selectedPatient) { setErr('Pasiyent seçin'); return; }
    if (!wardId || !bedId) { setErr('Palata və çarpayı seçin'); return; }
    if (!reason.trim() || reason.trim().length < 3) { setErr('Səbəb tələb olunur (min. 3 simvol)'); return; }
    setSaving(true);
    setErr('');
    try {
      await api.post('/admissions', { patientId: selectedPatient._id, wardId, bedId, reason: reason.trim() });
      toast.success('Pasiyent qəbul edildi.');
      onAdmitted();
      onClose();
    } catch (e) {
      setErr(e.response?.data?.message || 'Xəta baş verdi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="panel" style={{ width: 480, maxWidth: '95vw', maxHeight: '90vh', overflow: 'auto', padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--fg)' }}>Pasiyent Qəbulu</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-muted)' }}><Icons.X size={18} /></button>
        </div>

        {err && <div style={{ background: '#FEF2F2', color: '#991B1B', borderRadius: 8, padding: '9px 12px', fontSize: 12, marginBottom: 14 }}>{err}</div>}

        <div style={{ marginBottom: 12, position: 'relative' }}>
          <label style={lbl}>Pasiyent *</label>
          <input style={inp} value={patientSearch} onChange={e => handlePatientSearch(e.target.value)} placeholder="Ad, FİN və ya telefon ilə axtar" />
          {patientResults.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, marginTop: 4, zIndex: 10, maxHeight: 180, overflow: 'auto' }}>
              {patientResults.map(p => (
                <div key={p._id} onClick={() => selectPatient(p)} style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 13 }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--em-slate-100)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  {p.userId?.fullName || p.fullName || '—'} <span style={{ color: 'var(--fg-muted)', fontSize: 11 }}>{p.cardNumber || ''}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={lbl}>Palata *</label>
            <select style={inp} value={wardId} onChange={e => setWardId(e.target.value)}>
              <option value="">— Seçin —</option>
              {wards.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Çarpayı *</label>
            <select style={inp} value={bedId} onChange={e => setBedId(e.target.value)} disabled={!wardId}>
              <option value="">{wardId ? (beds.length ? '— Seçin —' : 'Boş çarpayı yoxdur') : '— Əvvəlcə palata seçin —'}</option>
              {beds.map(b => <option key={b._id} value={b._id}>#{b.bedNumber} {b.roomId?.roomNumber ? `(otaq ${b.roomId.roomNumber})` : ''}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={lbl}>Qəbul səbəbi *</label>
          <textarea rows={2} style={{ ...inp, resize: 'vertical' }} value={reason} onChange={e => setReason(e.target.value)} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} style={{ padding: '9px 18px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg-surface)', color: 'var(--fg)', fontSize: 13, cursor: 'pointer' }}>Ləğv et</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: '9px 22px', border: 'none', borderRadius: 8, background: '#00848e', color: 'white', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saxlanır...' : 'Qəbul et'}
          </button>
        </div>
      </div>
    </div>
  );
}

function TransferModal({ admission, onClose, onTransferred }) {
  const [wards, setWards] = useState([]);
  const [wardId, setWardId] = useState('');
  const [beds, setBeds] = useState([]);
  const [bedId, setBedId] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get('/wards').then(({ data }) => {
      const d = data?.data;
      setWards(Array.isArray(d) ? d : d?.wards || []);
    }).catch(() => setWards([]));
  }, []);

  useEffect(() => {
    if (!wardId) { setBeds([]); setBedId(''); return; }
    api.get(`/wards/${wardId}/beds`).then(({ data }) => {
      const d = data?.data;
      const list = Array.isArray(d) ? d : d?.beds || [];
      setBeds(list.filter(b => b.status === 'available'));
    }).catch(() => setBeds([]));
    setBedId('');
  }, [wardId]);

  const handleSave = async () => {
    if (!bedId) { setErr('Yeni çarpayı seçin'); return; }
    setSaving(true);
    setErr('');
    try {
      await api.patch(`/admissions/${admission._id}/transfer`, { bedId });
      toast.success('Pasiyent köçürüldü.');
      onTransferred();
      onClose();
    } catch (e) {
      setErr(e.response?.data?.message || 'Xəta baş verdi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="panel" style={{ width: 420, maxWidth: '95vw', padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--fg)' }}>Çarpayı Dəyişdir</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-muted)' }}><Icons.X size={18} /></button>
        </div>
        <p style={{ fontSize: 13, color: 'var(--fg-muted)', marginTop: 0 }}>
          Hazırkı: {admission.wardId?.name || '—'} / #{admission.bedId?.bedNumber || '—'}
        </p>

        {err && <div style={{ background: '#FEF2F2', color: '#991B1B', borderRadius: 8, padding: '9px 12px', fontSize: 12, marginBottom: 14 }}>{err}</div>}

        <div style={{ marginBottom: 18 }}>
          <label style={lbl}>Yeni palata</label>
          <select style={{ ...inp, marginBottom: 12 }} value={wardId} onChange={e => setWardId(e.target.value)}>
            <option value="">— Seçin —</option>
            {wards.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
          </select>
          <label style={lbl}>Yeni çarpayı</label>
          <select style={inp} value={bedId} onChange={e => setBedId(e.target.value)} disabled={!wardId}>
            <option value="">{wardId ? (beds.length ? '— Seçin —' : 'Boş çarpayı yoxdur') : '— Əvvəlcə palata seçin —'}</option>
            {beds.map(b => <option key={b._id} value={b._id}>#{b.bedNumber} {b.roomId?.roomNumber ? `(otaq ${b.roomId.roomNumber})` : ''}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} style={{ padding: '9px 18px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg-surface)', color: 'var(--fg)', fontSize: 13, cursor: 'pointer' }}>Ləğv et</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: '9px 22px', border: 'none', borderRadius: 8, background: '#00848e', color: 'white', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saxlanır...' : 'Köçür'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdmissionsPage() {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdmit, setShowAdmit] = useState(false);
  const [transferTarget, setTransferTarget] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/admissions/active')
      .then(({ data }) => setAdmissions(Array.isArray(data?.data) ? data.data : []))
      .catch(err => setError(err.response?.data?.message || 'Yüklənmədi'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const discharge = async (admission) => {
    if (!confirm(`${admission.patientId?.userId?.fullName || 'Pasiyent'} buraxılsın?`)) return;
    try {
      await api.patch(`/admissions/${admission._id}/discharge`);
      toast.success('Pasiyent buraxıldı.');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Xəta baş verdi');
    }
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Stasionar Pasiyentlər</h1>
          <p>Aktiv qəbullar: {loading ? '…' : admissions.length}</p>
        </div>
        {canManage && (
          <button onClick={() => setShowAdmit(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icons.Plus size={14} /> Pasiyent qəbul et
          </button>
        )}
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 16px', color: '#991B1B', fontSize: 13, marginBottom: 16, display: 'flex', gap: 8 }}>
          <Icons.AlertCircle size={16} />{error}
        </div>
      )}

      <div className="panel" style={{ padding: 0, overflow: 'auto' }}>
        {loading ? (
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[...Array(4)].map((_, i) => <div key={i} style={{ height: 48, borderRadius: 8, background: 'var(--em-slate-100)', animation: 'pulse 1.5s ease-in-out infinite' }} />)}
          </div>
        ) : !admissions.length ? (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--fg-muted)' }}>Aktiv qəbul yoxdur</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Pasiyent', 'Palata', 'Çarpayı', 'Qəbul tarixi', 'Səbəb', 'Əməliyyat'].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--fg-muted)', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {admissions.map(a => (
                <tr key={a._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>{a.patientId?.userId?.fullName || '—'}</td>
                  <td style={{ padding: '11px 16px', fontSize: 12, color: 'var(--fg-muted)' }}>{a.wardId?.name || '—'}</td>
                  <td style={{ padding: '11px 16px', fontSize: 12, color: 'var(--fg-muted)' }}>#{a.bedId?.bedNumber || '—'}</td>
                  <td style={{ padding: '11px 16px', fontSize: 12, color: 'var(--fg-muted)' }}>{new Date(a.admissionDate).toLocaleDateString('az-AZ')}</td>
                  <td style={{ padding: '11px 16px', fontSize: 12, color: 'var(--fg-muted)', maxWidth: 220 }}>{a.reason}</td>
                  <td style={{ padding: '11px 16px', display: 'flex', gap: 8 }}>
                    {canTransfer && (
                      <button onClick={() => setTransferTarget(a)} style={{ fontSize: 11, padding: '5px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--fg)', cursor: 'pointer' }}>Köçür</button>
                    )}
                    {canManage && (
                      <button onClick={() => discharge(a)} style={{ fontSize: 11, padding: '5px 10px', borderRadius: 6, border: 'none', background: '#fee2e2', color: '#991b1b', cursor: 'pointer' }}>Buraxılış</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAdmit && <AdmitModal onClose={() => setShowAdmit(false)} onAdmitted={load} />}
      {transferTarget && <TransferModal admission={transferTarget} onClose={() => setTransferTarget(null)} onTransferred={load} />}

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
    </div>
  );
}
