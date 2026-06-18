import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { BASE } from '../../api/config.js';
import { DEPT_ICON_OPTIONS, DeptIcon } from '../../components/Icons';

const TEAL = '#00848e';
const NAVY = '#0a1628';
const FONT = "'Source Sans 3', sans-serif";

const CATEGORY_OPTIONS = [
  { value: '',              label: '— Kateqoriya yoxdur —' },
  { value: 'blood',         label: 'Qan analizləri'        },
  { value: 'biochemistry',  label: 'Biokimya'              },
  { value: 'hormones',      label: 'Hormonlar'             },
  { value: 'immunology',    label: 'İmmunologiya'          },
  { value: 'urine',         label: 'Sidik analizləri'      },
  { value: 'vitamins',      label: 'Vitaminlər'            },
  { value: 'microbiology',  label: 'Mikrobiologiya'        },
  { value: 'other',         label: 'Digər'                 },
];

const CATEGORY_LABELS = Object.fromEntries(
  CATEGORY_OPTIONS.filter(o => o.value).map(o => [o.value, o.label])
);

const getToken  = () => localStorage.getItem('token') || localStorage.getItem('adminToken');
const authHdrs  = () => ({ Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' });

const toSlug = (str) =>
  str.toLowerCase()
    .replace(/ə/g, 'e').replace(/ı/g, 'i').replace(/ö/g, 'o')
    .replace(/ü/g, 'u').replace(/ç/g, 'c').replace(/ş/g, 's').replace(/ğ/g, 'g')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const EMPTY_FORM = {
  name: '', slug: '', department: '', category: '',
  description: '', iconKey: 'flask',
  resultDuration: '', duration: '', order: 0, isActive: true,
};

/* ── Modal ─────────────────────────────────────────────────────────────────── */
function Modal({ service, onClose, onSaved }) {
  const [form,   setForm]   = useState(service ?? EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState('');
  const isEdit = !!service?._id;

  const set      = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const setCheck = k => e => setForm(f => ({ ...f, [k]: e.target.checked }));

  const handleNameBlur = (e) => {
    if (!isEdit && e.target.value && !form.slug) {
      setForm(f => ({ ...f, slug: toSlug(e.target.value) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setErr('Ad boş ola bilməz'); return; }
    if (!form.slug.trim()) { setErr('Slug boş ola bilməz'); return; }
    setSaving(true); setErr('');
    try {
      const url    = isEdit ? `${BASE}/api/v1/services/${service._id}` : `${BASE}/api/v1/services`;
      const method = isEdit ? 'PUT' : 'POST';
      const res    = await fetch(url, {
        method,
        headers: authHdrs(),
        body: JSON.stringify({ ...form, order: Number(form.order) || 0 }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.message || 'Xəta baş verdi'); return; }
      onSaved();
    } catch {
      setErr('Şəbəkə xətası baş verdi');
    } finally {
      setSaving(false);
    }
  };

  const inp = {
    width: '100%', padding: '9px 12px', borderRadius: 8,
    border: '1.5px solid #e2e8f0', fontSize: 14, fontFamily: FONT,
    outline: 'none', boxSizing: 'border-box', background: '#fff', color: '#1a2b4a',
  };
  const lbl = { fontSize: 12, fontWeight: 600, color: '#4a5568', marginBottom: 4, display: 'block', fontFamily: FONT };

  const focusBorder = e => { e.target.style.borderColor = TEAL; };
  const blurBorder  = e => { e.target.style.borderColor = '#e2e8f0'; };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: '100%', maxWidth: 620, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: NAVY, margin: 0, fontFamily: FONT }}>
            {isEdit ? 'Xidməti Redaktə Et' : 'Yeni Xidmət Əlavə Et'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4 }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Error */}
        {err && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>
            {err}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Name + Slug */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={lbl}>Xidmət adı *</label>
              <input
                value={form.name}
                onChange={set('name')}
                onBlur={e => { handleNameBlur(e); blurBorder(e); }}
                onFocus={focusBorder}
                placeholder="Ümumi qan analizi"
                style={inp}
              />
            </div>
            <div>
              <label style={lbl}>Slug *</label>
              <input
                value={form.slug}
                onChange={set('slug')}
                onFocus={focusBorder} onBlur={blurBorder}
                placeholder="umumi-qan-analizi"
                style={inp}
              />
            </div>
          </div>

          {/* Category + Icon */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={lbl}>Kateqoriya</label>
              <select value={form.category} onChange={set('category')} onFocus={focusBorder} onBlur={blurBorder} style={inp}>
                {CATEGORY_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>İkon</label>
              <select value={form.iconKey} onChange={set('iconKey')} onFocus={focusBorder} onBlur={blurBorder} style={inp}>
                {DEPT_ICON_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Department */}
          <div>
            <label style={lbl}>Şöbə</label>
            <input
              value={form.department}
              onChange={set('department')}
              onFocus={focusBorder} onBlur={blurBorder}
              placeholder="Laboratoriya"
              style={inp}
            />
          </div>

          {/* Description */}
          <div>
            <label style={lbl}>Açıqlama</label>
            <textarea
              value={form.description}
              onChange={set('description')}
              onFocus={focusBorder} onBlur={blurBorder}
              rows={3}
              placeholder="Xidmət haqqında qısa məlumat..."
              style={{ ...inp, resize: 'vertical', minHeight: 72 }}
            />
          </div>

          {/* Result duration + Duration + Order */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={lbl}>Nəticə müddəti</label>
              <input
                value={form.resultDuration}
                onChange={set('resultDuration')}
                onFocus={focusBorder} onBlur={blurBorder}
                placeholder="1 iş günü"
                style={inp}
              />
            </div>
            <div>
              <label style={lbl}>Müddət</label>
              <input
                value={form.duration}
                onChange={set('duration')}
                onFocus={focusBorder} onBlur={blurBorder}
                placeholder="30 dəq"
                style={inp}
              />
            </div>
            <div>
              <label style={lbl}>Sıra</label>
              <input
                type="number" min="0"
                value={form.order}
                onChange={set('order')}
                onFocus={focusBorder} onBlur={blurBorder}
                placeholder="0"
                style={inp}
              />
            </div>
          </div>

          {/* Active toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, fontFamily: FONT, color: '#4a5568' }}>
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={setCheck('isActive')}
              style={{ accentColor: TEAL, width: 16, height: 16 }}
            />
            Aktiv (saytda görünsün)
          </label>

          {/* Actions */}
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

/* ── Main page ─────────────────────────────────────────────────────────────── */
export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(null);   // null | 'add' | service-object
  const [deleting, setDeleting] = useState(null);

  const load = () => {
    setLoading(true);
    fetch(`${BASE}/api/v1/services/admin/all`, { headers: authHdrs() })
      .then(r => r.json())
      .then(d => setServices(Array.isArray(d.data) ? d.data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`"${name}" deaktiv edilsin?`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`${BASE}/api/v1/services/${id}`, { method: 'DELETE', headers: authHdrs() });
      if (res.ok) load();
    } catch {
      // ignore
    } finally {
      setDeleting(null);
    }
  };

  return (
    <AdminLayout activePage="services">
      <div>

        {/* Page header */}
        <div className="page-head">
          <div>
            <h1>Xidmətlər</h1>
            <p>Cəmi: {loading ? '…' : services.length} xidmət</p>
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
            <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Xidmət Əlavə Et
          </button>
        </div>

        {/* Table */}
        <div className="panel">
          <table className="tbl">
            <thead>
              <tr>
                <th>Xidmət</th>
                <th>Kateqoriya</th>
                <th>Nəticə müddəti</th>
                <th>Sıra</th>
                <th>Status</th>
                <th>Əməliyyat</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j}><div style={{ height: 13, borderRadius: 4, background: 'var(--em-slate-100)' }} /></td>
                      ))}
                    </tr>
                  ))
                : services.length === 0
                  ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', color: 'var(--fg-muted)', padding: '40px 0' }}>
                          Xidmət tapılmadı
                        </td>
                      </tr>
                    )
                  : services.map(s => (
                      <tr key={s._id}>
                        <td>
                          <div className="patient">
                            <div className="av" style={{ background: 'rgba(0,132,142,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <DeptIcon icon={s.iconKey || s.icon} name={s.name} size={16} color={TEAL} />
                            </div>
                            <div>
                              <p className="name">{s.name}</p>
                              {s.slug && <p className="meta">{s.slug}</p>}
                            </div>
                          </div>
                        </td>
                        <td>{CATEGORY_LABELS[s.category] || s.category || '—'}</td>
                        <td>{s.resultDuration || s.duration || '—'}</td>
                        <td>{s.order ?? 0}</td>
                        <td>
                          {s.isActive
                            ? <span className="bdg bdg-confirmed"><span className="d" />Aktiv</span>
                            : <span className="bdg bdg-cancelled"><span className="d" />Deaktiv</span>}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              onClick={() => setModal(s)}
                              style={{ padding: '5px 12px', borderRadius: 7, border: `1.5px solid ${TEAL}`, background: 'transparent', color: TEAL, fontSize: 12, fontFamily: FONT, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                            >
                              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                              Redaktə
                            </button>
                            <button
                              onClick={() => handleDelete(s._id, s.name)}
                              disabled={deleting === s._id}
                              style={{ padding: '5px 12px', borderRadius: 7, border: '1.5px solid #fecaca', background: 'transparent', color: '#ef4444', fontSize: 12, fontFamily: FONT, cursor: deleting === s._id ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 4, opacity: deleting === s._id ? 0.5 : 1 }}
                            >
                              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                              </svg>
                              Sil
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
              }
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {modal && (
          <Modal
            service={modal === 'add' ? null : modal}
            onClose={() => setModal(null)}
            onSaved={() => { setModal(null); load(); }}
          />
        )}

      </div>
    </AdminLayout>
  );
}
