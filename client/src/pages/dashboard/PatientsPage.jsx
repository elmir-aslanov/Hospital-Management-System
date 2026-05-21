/* eslint-disable */
import { useState, useEffect, useRef } from 'react';
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

const FONT = 'inherit';

const inputSt = {
  width: '100%', padding: '10px 12px', fontSize: 13,
  border: '1px solid var(--border)', borderRadius: 8,
  background: 'var(--bg-surface)', color: 'var(--fg)',
  fontFamily: FONT, boxSizing: 'border-box', outline: 'none',
};

let user = {};
try { user = JSON.parse(localStorage.getItem('user') || '{}'); } catch {}
const canCreate = ['ADMIN', 'SUPER_ADMIN', 'RECEPTIONIST'].includes(user.role);

export default function PatientsPage() {
  const [page, setPage]         = useState(1);
  const [q, setQ]               = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [showModal, setShowModal]   = useState(false);
  const [saving, setSaving]         = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', dateOfBirth: '', gender: '', phone: '', bloodGroup: '', address: '' });

  // Debounce search
  const timer = useRef(null);
  function handleSearch(val) {
    setQ(val);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { setDebouncedQ(val); setPage(1); }, 400);
  }

  const url    = debouncedQ ? '/patients/search' : '/patients';
  const params = debouncedQ ? { q: debouncedQ, limit: 20 } : { page, limit: 20 };
  const { data, loading, error } = useFetch(url, params);

  const patients = data?.patients || data?.results || data?.data?.patients || [];
  const total    = data?.total    || data?.data?.total || 0;
  const pages    = Math.ceil(total / 20) || 1;

  useEffect(() => {
    if (error) toast.error('Pasiyent məlumatları yüklənmədi.');
  }, [error]);

  function setField(k, v) { setForm(prev => ({ ...prev, [k]: v })); }

  async function handleCreate(e) {
    e.preventDefault();
    const { fullName, email, dateOfBirth, gender, phone } = form;
    if (!fullName || !email || !dateOfBirth || !gender || !phone) {
      toast.warning('Məcburi sahələri doldurun.');
      return;
    }
    setSaving(true);
    try {
      await api.post('/patients', form);
      toast.success('Pasiyent əlavə edildi.');
      setShowModal(false);
      setForm({ fullName: '', email: '', dateOfBirth: '', gender: '', phone: '', bloodGroup: '', address: '' });
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xəta baş verdi.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Pasiyentlər</h1>
          <p>Cəmi: {loading ? '…' : total} qeydiyyat</p>
        </div>
        <div className="actions">
          <div className="search" style={{ width: 280 }}>
            <Icons.Search size={16} style={{ color: 'var(--fg-muted)' }} />
            <input placeholder="Ad, ID axtar…" value={q} onChange={e => handleSearch(e.target.value)} />
          </div>
          {canCreate && (
            <button className="btn-primary" onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icons.Plus size={15} /> Yeni Pasiyent
            </button>
          )}
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
              <th>ID</th><th>Ad Soyad</th><th>E-poçt</th>
              <th>Doğum tarixi</th><th>Cins</th><th>Qan qrupu</th><th>Qeydiyyat</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} cols={7} />)
              : !patients.length
                ? <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--fg-muted)', padding: '32px 0' }}>Pasiyent tapılmadı</td></tr>
                : patients.map((p, i) => {
                    const n   = p.userId?.fullName || '—';
                    const ini = n.split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase();
                    const dob = p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString('az-AZ') : '—';
                    return (
                      <tr key={p._id || i}>
                        <td><span className="id">{p.patientId || '—'}</span></td>
                        <td>
                          <div className="patient">
                            <div className="av">{ini}</div>
                            <div><p className="name">{n}</p></div>
                          </div>
                        </td>
                        <td style={{ color: 'var(--fg-muted)', fontSize: 12 }}>{p.userId?.email || '—'}</td>
                        <td style={{ fontSize: 12 }}>{dob}</td>
                        <td style={{ fontSize: 12, textTransform: 'capitalize' }}>{p.gender || '—'}</td>
                        <td><span className="id">{p.bloodGroup || '—'}</span></td>
                        <td style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{p.createdAt ? new Date(p.createdAt).toLocaleDateString('az-AZ') : '—'}</td>
                      </tr>
                    );
                  })
            }
          </tbody>
        </table>

        {!debouncedQ && pages > 1 && (
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

      {/* ── New Patient Modal ── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--bg-surface)', borderRadius: 14, padding: 28, width: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--fg)' }}>Yeni Pasiyent</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--fg-muted)' }}>×</button>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { key: 'fullName',    label: 'Ad Soyad *',      type: 'text' },
                { key: 'email',       label: 'E-poçt *',        type: 'email' },
                { key: 'phone',       label: 'Telefon *',        type: 'text', placeholder: '+994501234567' },
                { key: 'dateOfBirth', label: 'Doğum tarixi *',   type: 'date' },
                { key: 'address',     label: 'Ünvan',            type: 'text' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg-muted)', display: 'block', marginBottom: 6 }}>{f.label}</label>
                  <input
                    type={f.type}
                    value={form[f.key]}
                    placeholder={f.placeholder}
                    onChange={e => setField(f.key, e.target.value)}
                    style={inputSt}
                  />
                </div>
              ))}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg-muted)', display: 'block', marginBottom: 6 }}>Cins *</label>
                  <select value={form.gender} onChange={e => setField('gender', e.target.value)} style={inputSt}>
                    <option value="">Seçin</option>
                    <option value="male">Kişi</option>
                    <option value="female">Qadın</option>
                    <option value="other">Digər</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg-muted)', display: 'block', marginBottom: 6 }}>Qan qrupu</label>
                  <select value={form.bloodGroup} onChange={e => setField('bloodGroup', e.target.value)} style={inputSt}>
                    <option value="">—</option>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-outline" style={{ flex: 1, padding: '10px 0' }}>Ləğv et</button>
                <button type="submit" className="btn-primary" disabled={saving} style={{ flex: 1, padding: '10px 0' }}>
                  {saving ? 'Saxlanılır…' : 'Əlavə Et'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
