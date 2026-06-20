import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import AdminLayout from '../../components/admin/AdminLayout'
import api from '../../api/axios'
import { getErrorMessage } from '../../utils/alert'
const TEAL  = '#00848e'
const NAVY  = '#0a1628'
const FONT  = "'Source Sans 3', sans-serif"

const fmt = (d) => d ? new Date(d).toLocaleDateString('az-AZ') : '—'
const trunc = (s, n = 40) => s && s.length > n ? s.slice(0, n) + '…' : (s || '—')

const entityName = (entity) => {
  if (!entity || typeof entity !== 'object') return ''
  const user = entity.userId && typeof entity.userId === 'object' ? entity.userId : entity
  return [user.name, user.surname].filter(Boolean).join(' ').trim() || user.fullName || ''
}

const patientName = (summary) =>
  summary?.patientName || entityName(summary?.patientId) || entityName(summary?.visitId?.patientId) || '—'

const doctorName = (summary) =>
  summary?.doctorName
  || entityName(summary?.dischargingDoctor)
  || entityName(summary?.doctorId)
  || entityName(summary?.visitId?.doctorId)
  || '—'

const printDischarge = (d, t) => {
  const w     = window.open('', '_blank')
  if (!w) return
  const pName = patientName(d)
  const dName = doctorName(d)
  const date  = fmt(d.dischargeDate)
  w.document.write(`<!DOCTYPE html><html><head>
<title>${t('adminDischarge.detailTitle')}</title>
<style>
  body{font-family:Arial,sans-serif;padding:40px;color:#0a1628}
  .header{display:flex;justify-content:space-between;border-bottom:2px solid #00848e;padding-bottom:16px;margin-bottom:24px}
  .logo{font-size:20px;font-weight:900}.logo span{color:#00848e;font-size:11px;display:block}
  h2{font-size:18px;color:#00848e;margin:0 0 20px}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px}
  .field{margin-bottom:14px}
  .label{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8;margin-bottom:4px}
  .value{font-size:14px;color:#0a1628;font-weight:500}
  .section{background:#f8fafc;border-radius:8px;padding:14px;margin-bottom:14px}
  .footer{margin-top:40px;border-top:1px solid #e2e8f0;padding-top:16px;text-align:center;font-size:12px;color:#94a3b8}
</style></head><body>
<div class="header">
  <div class="logo">ASLAN <span>MEDICAL CENTER</span></div>
  <div><div style="font-size:13px;font-weight:700;color:#00848e">${t('adminDischarge.detailTitle').toUpperCase()}</div><div style="font-size:12px;color:#64748b">${date}</div></div>
</div>
<div class="grid">
  <div class="field"><div class="label">${t('adminDischarge.patient')}</div><div class="value">${pName}</div></div>
  <div class="field"><div class="label">${t('adminDischarge.doctor')}</div><div class="value">${dName}</div></div>
</div>
<div class="section"><div class="label">${t('adminDischarge.diagnosis')}</div><div class="value">${d.finalDiagnosis || d.diagnosis || '—'}</div></div>
<div class="section"><div class="label">${t('adminDischarge.treatment')}</div><div class="value">${d.treatmentSummary || d.treatment || '—'}</div></div>
${d.followUpInstructions || d.recommendations ? `<div class="section"><div class="label">${t('adminDischarge.recommendations')}</div><div class="value">${d.followUpInstructions || d.recommendations}</div></div>` : ''}
${d.followUpDate ? `<div class="field"><div class="label">${t('adminDischarge.nextVisit')}</div><div class="value">${fmt(d.followUpDate)}</div></div>` : ''}
${d.notes ? `<div class="section"><div class="label">${t('adminDischarge.notes')}</div><div class="value">${d.notes}</div></div>` : ''}
<div class="footer">Aslan Medical Center • info@aslanmedical.az • +994 50 836 36 94</div>
</body></html>`)
  w.document.close(); w.focus()
  setTimeout(() => { w.print(); w.close() }, 500)
}

export default function AdminDischarge() {
  const { t } = useTranslation()
  const [discharges, setDischarges] = useState([])
  const [total,      setTotal]      = useState(0)
  const [loading,    setLoading]    = useState(true)
  const [loadError,  setLoadError]  = useState('')
  const [selected,   setSelected]   = useState(null)
  const [showForm,   setShowForm]   = useState(false)
  const [admissions, setAdmissions] = useState([])
  const [saving,     setSaving]     = useState(false)
  const [saveError,  setSaveError]  = useState('')
  const [form, setForm] = useState({
    admissionId: '', patientId: '', doctorId: '',
    diagnosis: '', treatment: '', recommendations: '',
    followUpDate: '', notes: '',
  })

  useEffect(() => {
    let active = true
    api.get('/discharge')
      .then(({ data }) => {
        if (!active) return
        const items = data.data?.items || data.data || []
        setDischarges(Array.isArray(items) ? items : [])
        setTotal(data.data?.total ?? (Array.isArray(items) ? items.length : 0))
      })
      .catch((err) => {
        if (!active) return
        setDischarges([])
        setLoadError(getErrorMessage(err, t('adminDischarge.loadError')))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    api.get('/admissions', { params: { status: 'active', limit: 100 } })
      .then(({ data }) => {
        if (!active) return
        const list = data.data?.admissions || data.data?.items || data.data || []
        setAdmissions(Array.isArray(list) ? list : [])
      })
      .catch((err) => {
        if (!active) return
        setAdmissions([])
        setLoadError((current) => current || getErrorMessage(err, t('adminDischarge.admissionsLoadError')))
      })

    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleAdmissionSelect = (admissionId) => {
    const adm = admissions.find(a => a._id === admissionId)
    setForm(f => ({
      ...f,
      admissionId,
      patientId: adm?.patientId?._id || adm?.patientId || '',
      doctorId:  adm?.doctorId?._id  || adm?.doctorId  || '',
    }))
  }

  const handleSave = async () => {
    if (!form.admissionId || !form.diagnosis || !form.treatment) return
    setSaving(true)
    setSaveError('')
    try {
      const { data } = await api.post('/discharge', form)
      setDischarges(prev => [data.data, ...prev])
      setTotal(current => current + 1)
      setShowForm(false)
      setForm({ admissionId: '', patientId: '', doctorId: '', diagnosis: '', treatment: '', recommendations: '', followUpDate: '', notes: '' })
    } catch (err) {
      // Keep the form open so the user can retry without losing entered data.
      setSaveError(getErrorMessage(err, t('adminDischarge.saveError')))
    }
    finally { setSaving(false) }
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0',
    borderRadius: 10, fontSize: 13, fontFamily: FONT, color: NAVY,
    background: '#fff', outline: 'none', boxSizing: 'border-box',
    resize: 'vertical',
  }

  return (
    <AdminLayout activePage="discharge">
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        .dis-row:hover { background: #f8fafc !important }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: NAVY, margin: 0, fontFamily: FONT }}>{t('adminDischarge.title')}</h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0', fontFamily: FONT }}>{t('adminDischarge.summaryCount', { count: total })}</p>
        </div>
        <button onClick={() => { setSaveError(''); setShowForm(true) }} style={{
          display: 'flex', alignItems: 'center', gap: 7,
          background: TEAL, color: '#fff', border: 'none',
          borderRadius: 10, padding: '10px 18px', fontSize: 13,
          fontWeight: 600, fontFamily: FONT, cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(0,132,142,0.3)',
        }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          {t('adminDischarge.newSummary')}
        </button>
      </div>

      {loadError && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 16, fontFamily: FONT }}>
          {loadError}
        </div>
      )}

      {/* ── Table ── */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONT }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
              {['patient', 'doctor', 'dischargeDate', 'diagnosis', 'actions'].map(key => (
                <th key={key} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t(`adminDischarge.${key}`)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40 }}>
                <div style={{ width: 28, height: 28, border: `3px solid #e2e8f0`, borderTop: `3px solid ${TEAL}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
              </td></tr>
            ) : discharges.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: '#94a3b8', fontSize: 13 }}>{t('adminDischarge.empty')}</td></tr>
            ) : discharges.map(d => (
              <tr key={d._id} className="dis-row" style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}>
                <td style={{ padding: '14px 16px', fontSize: 13, color: NAVY, fontWeight: 600 }}>
                  {patientName(d)}
                </td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: '#475569' }}>
                  {doctorName(d)}
                </td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: '#475569' }}>{fmt(d.dischargeDate)}</td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: '#475569' }}>
                  {trunc(d.finalDiagnosis || d.diagnosis)}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setSelected(d)} style={{ padding: '5px 12px', background: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: FONT }}>{t('adminDischarge.view')}</button>
                    <button onClick={() => printDischarge(d, t)} style={{ padding: '5px 12px', background: '#f0fdf4', color: '#16a34a', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: FONT }}>{t('adminDischarge.print')}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Detail Panel ── */}
      {selected && (
        <>
          <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 100 }} />
          <div style={{
            position: 'fixed', top: 0, right: 0, width: 480, height: '100vh',
            background: '#fff', zIndex: 101, overflowY: 'auto',
            boxShadow: '-8px 0 32px rgba(0,0,0,0.15)',
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #f1f5f9', flexShrink: 0 }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: NAVY, fontFamily: FONT }}>{t('adminDischarge.detailTitle')}</h2>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 20, lineHeight: 1 }}>×</button>
            </div>

            <div style={{ padding: 24, flex: 1, fontFamily: FONT }}>
              {/* Patient card */}
              <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>{t('adminDischarge.patientInfo')}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: NAVY }}>{patientName(selected)}</div>
                {selected.patientId?.userId?.email && <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{selected.patientId.userId.email}</div>}
                {selected.patientId?.userId?.phone && <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{selected.patientId.userId.phone}</div>}
              </div>

              {/* Dates + doctor */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div style={{ background: '#f8fafc', borderRadius: 10, padding: 12 }}>
                  <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{t('adminDischarge.doctor')}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>{doctorName(selected)}</div>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 10, padding: 12 }}>
                  <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{t('adminDischarge.dischargeDate')}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>{fmt(selected.dischargeDate)}</div>
                </div>
              </div>

              {/* Clinical fields */}
              {[
                { label: t('adminDischarge.diagnosis'), value: selected.finalDiagnosis || selected.diagnosis },
                { label: t('adminDischarge.treatment'), value: selected.treatmentSummary || selected.treatment },
                { label: t('adminDischarge.recommendations'), value: selected.followUpInstructions || selected.recommendations },
                { label: t('adminDischarge.notes'), value: selected.notes },
              ].map(({ label, value }) => value ? (
                <div key={label} style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</div>
                  <div style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: NAVY, lineHeight: 1.6 }}>{value}</div>
                </div>
              ) : null)}

              {selected.followUpDate && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{t('adminDischarge.nextVisitDate')}</div>
                  <div style={{ background: '#f0fdf4', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#16a34a', fontWeight: 600 }}>{fmt(selected.followUpDate)}</div>
                </div>
              )}
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', flexShrink: 0 }}>
              <button onClick={() => printDischarge(selected, t)} style={{
                width: '100%', padding: '12px', background: TEAL, color: '#fff',
                border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700,
                cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 8,
              }}>
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                {t('adminDischarge.printPdf')}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Create Form Modal ── */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.2)', fontFamily: FONT }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: NAVY }}>{t('adminDischarge.createTitle')}</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 20 }}>×</button>
            </div>

            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {saveError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 10, padding: '10px 14px', fontSize: 13 }}>
                  {saveError}
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>{t('adminDischarge.selectAdmission')} *</label>
                <select value={form.admissionId} onChange={e => handleAdmissionSelect(e.target.value)} style={{ ...inputStyle, resize: 'none' }}>
                  <option value="">— {t('adminDischarge.selectAdmission')} —</option>
                  {admissions.map(a => (
                    <option key={a._id} value={a._id}>
                      {a.patientId?.userId?.fullName || a.patientId?.fullName || a._id} — {fmt(a.admissionDate)}
                    </option>
                  ))}
                </select>
              </div>

              {[
                { key: 'diagnosis',       label: `${t('adminDischarge.diagnosis')} *`, required: true  },
                { key: 'treatment',       label: `${t('adminDischarge.treatment')} *`, required: true  },
                { key: 'recommendations', label: t('adminDischarge.recommendations'), required: false },
                { key: 'notes',           label: t('adminDischarge.notes'), required: false },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>{label}</label>
                  <textarea rows={3} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={inputStyle} />
                </div>
              ))}

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>{t('adminDischarge.nextVisitDate')}</label>
                <input type="date" value={form.followUpDate} onChange={e => setForm(f => ({ ...f, followUpDate: e.target.value }))} style={{ ...inputStyle, resize: 'none' }} />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: '11px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{t('adminDischarge.cancel')}</button>
                <button onClick={handleSave} disabled={saving || !form.admissionId || !form.diagnosis || !form.treatment}
                  style={{ flex: 1, padding: '11px', background: saving ? '#7ec8cc' : TEAL, color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>
                  {saving ? t('adminDischarge.saving') : t('adminDischarge.save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
