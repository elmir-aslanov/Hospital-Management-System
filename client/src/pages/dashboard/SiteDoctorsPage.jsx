import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '../../api/axios';
import Icons from '../../components/Icons';
import '../../styles/dashboard.css';

const FONT = "'Source Sans 3', 'Raleway', sans-serif";
const TEAL = '#00848e';

const EMPTY = { name: '', specialty: '', department: '', experience: '', bio: '', image: '', order: '', isActive: true };

function Modal({ doctor, onClose, onSaved }) {
  const [form, setForm] = useState(doctor ?? EMPTY);
  const [saving, setSaving] = useState(false);
  const isEdit = !!doctor?._id;

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const setCheck = k => e => setForm(f => ({ ...f, [k]: e.target.checked }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.specialty.trim()) {
      toast.warning('Ad və ixtisas məcburidir.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        experience: form.experience === '' ? 0 : Number(form.experience),
        order: form.order === '' ? 0 : Number(form.order),
      };
      if (isEdit) {
        await api.put(`/doctors/${doctor._id}`, payload);
        toast.success('Həkim yeniləndi.');
      } else {
        await api.post('/doctors', payload);
        toast.success('Həkim əlavə edildi.');
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Xəta baş verdi.');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '9px 12px', borderRadius: 8,
    border: '1.5px solid #e2e8f0', fontSize: 14, fontFamily: FONT,
    outline: 'none', boxSizing: 'border-box', background: '#fff', color: '#1a2b4a',
  };

  const labelStyle = { fontSize: 12, fontWeight: 600, color: '#4a5568', marginBottom: 4, display: 'block', fontFamily: FONT };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 24,
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: 32,
        width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0a1628', margin: 0, fontFamily: FONT }}>
            {isEdit ? 'Həkimi Redaktə Et' : 'Yeni Həkim Əlavə Et'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4 }}>
            <Icons.X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Ad Soyad *</label>
              <input value={form.name} onChange={set('name')} placeholder="Dr. Ad Soyad" style={inputStyle}
                onFocus={e => e.target.style.borderColor = TEAL}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
            </div>
            <div>
              <label style={labelStyle}>İxtisas *</label>
              <input value={form.specialty} onChange={set('specialty')} placeholder="Kardioloq" style={inputStyle}
                onFocus={e => e.target.style.borderColor = TEAL}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Şöbə</label>
            <input value={form.department} onChange={set('department')} placeholder="Kardiologiya" style={inputStyle}
              onFocus={e => e.target.style.borderColor = TEAL}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Təcrübə (il)</label>
              <input type="number" min="0" value={form.experience} onChange={set('experience')} placeholder="10" style={inputStyle}
                onFocus={e => e.target.style.borderColor = TEAL}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
            </div>
            <div>
              <label style={labelStyle}>Sıra (order)</label>
              <input type="number" min="0" value={form.order} onChange={set('order')} placeholder="1" style={inputStyle}
                onFocus={e => e.target.style.borderColor = TEAL}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Şəkil URL (istəyə bağlı)</label>
            <input value={form.image} onChange={set('image')} placeholder="https://..." style={inputStyle}
              onFocus={e => e.target.style.borderColor = TEAL}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
          </div>

          <div>
            <label style={labelStyle}>Bioqrafiya</label>
            <textarea value={form.bio} onChange={set('bio')} rows={3}
              placeholder="Həkim haqqında qısa məlumat..."
              style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
              onFocus={e => e.target.style.borderColor = TEAL}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, fontFamily: FONT, color: '#4a5568' }}>
            <input type="checkbox" checked={form.isActive} onChange={setCheck('isActive')} style={{ accentColor: TEAL, width: 16, height: 16 }} />
            Aktiv (saytda görünsün)
          </label>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" onClick={onClose}
              style={{ padding: '9px 20px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', color: '#4a5568', fontSize: 14, fontFamily: FONT, cursor: 'pointer' }}>
              Ləğv et
            </button>
            <button type="submit" disabled={saving}
              style={{ padding: '9px 24px', borderRadius: 8, border: 'none', background: saving ? '#7ec8cc' : TEAL, color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: FONT, cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Saxlanılır…' : isEdit ? 'Yenilə' : 'Əlavə Et'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SiteDoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(null); // null | 'add' | doctor-object
  const [deleting, setDeleting] = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/doctors/all')
      .then(res => {
        const data = res.data?.data ?? res.data;
        setDoctors(Array.isArray(data) ? data : []);
      })
      .catch(() => toast.error('Həkimlər yüklənmədi.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`"${name}" silinsin?`)) return;
    setDeleting(id);
    try {
      await api.delete(`/doctors/${id}`);
      toast.success('Həkim silindi.');
      load();
    } catch {
      toast.error('Silmə zamanı xəta baş verdi.');
    } finally {
      setDeleting(null);
    }
  };

  const handleSaved = () => {
    setModal(null);
    load();
  };

  return (
    <div>
      {/* Header */}
      <div className="page-head">
        <div>
          <h1>Site Həkimləri</h1>
          <p>Cəmi: {loading ? '…' : doctors.length} həkim</p>
        </div>
        <button
          onClick={() => setModal('add')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 10,
            background: TEAL, color: '#fff', border: 'none',
            fontSize: 14, fontWeight: 600, fontFamily: FONT,
            cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,132,142,0.3)',
          }}
        >
          <Icons.Plus size={17} />
          Həkim Əlavə Et
        </button>
      </div>

      {/* Table */}
      <div className="panel">
        <table className="tbl">
          <thead>
            <tr>
              <th>Həkim</th>
              <th>İxtisas</th>
              <th>Şöbə</th>
              <th>Təcrübə</th>
              <th>Sıra</th>
              <th>Status</th>
              <th>Əməliyyat</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j}><div style={{ height: 13, borderRadius: 4, background: 'var(--em-slate-100)' }} /></td>
                    ))}
                  </tr>
                ))
              : doctors.length === 0
                ? <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--fg-muted)', padding: '40px 0' }}>Həkim tapılmadı</td></tr>
                : doctors.map(d => {
                    const initials = (d.name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
                    return (
                      <tr key={d._id}>
                        <td>
                          <div className="patient">
                            <div className="av">{initials}</div>
                            <div>
                              <p className="name">{d.name}</p>
                              {d.bio && <p className="meta" style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.bio}</p>}
                            </div>
                          </div>
                        </td>
                        <td>{d.specialty || '—'}</td>
                        <td>{d.department || '—'}</td>
                        <td>{d.experience != null ? `${d.experience} il` : '—'}</td>
                        <td>{d.order ?? '—'}</td>
                        <td>
                          {d.isActive
                            ? <span className="bdg bdg-confirmed"><span className="d" />Aktiv</span>
                            : <span className="bdg bdg-cancelled"><span className="d" />Deaktiv</span>}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              onClick={() => setModal(d)}
                              style={{ padding: '5px 12px', borderRadius: 7, border: `1.5px solid ${TEAL}`, background: 'transparent', color: TEAL, fontSize: 12, fontFamily: FONT, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                            >
                              <Icons.Edit size={13} /> Redaktə
                            </button>
                            <button
                              onClick={() => handleDelete(d._id, d.name)}
                              disabled={deleting === d._id}
                              style={{ padding: '5px 12px', borderRadius: 7, border: '1.5px solid #fecaca', background: 'transparent', color: '#ef4444', fontSize: 12, fontFamily: FONT, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                            >
                              <Icons.Trash size={13} /> Sil
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
            }
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <Modal
          doctor={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
