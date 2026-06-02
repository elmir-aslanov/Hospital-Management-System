import { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'

import { BASE } from '../../api/config.js'

const STATUS = {
  draft:          { label: 'Qaralama', bg: '#f8fafc', color: '#64748b' },
  issued:         { label: 'Kəsildi',  bg: '#eff6ff', color: '#2563eb' },
  paid:           { label: 'Ödənildi', bg: '#f0fdf4', color: '#16a34a' },
  partially_paid: { label: 'Qismən',   bg: '#fefce8', color: '#ca8a04' },
  cancelled:      { label: 'Ləğv',     bg: '#fef2f2', color: '#dc2626' },
  overdue:        { label: 'Gecikmiş', bg: '#fff7ed', color: '#ea580c' },
}

const METHOD_LABELS = {
  cash: 'Nağd', card: 'Kart', bank_transfer: 'Bank', insurance: 'Sığorta', online: 'Online',
}

const emptyItem = () => ({ description: '', quantity: 1, unitPrice: 0, total: 0 })
const emptyForm = { patientId: '', notes: '', discount: 0, tax: 0, status: 'draft' }
const emptyPay  = { amount: '', method: 'cash', transactionId: '', note: '', terminalRef: '', cardLast4: '', bankRef: '', bankName: '', insuranceRef: '', insuranceCo: '', platform: '', onlineCode: '' }

const METHOD_FIELDS = {
  card:          [{ key: 'terminalRef', label: 'Terminal qəbz nömrəsi *', req: true }, { key: 'cardLast4', label: 'Kartın son 4 rəqəmi', placeholder: '•••• 1234' }],
  bank_transfer: [{ key: 'bankRef',     label: 'Köçürmə sənəd nömrəsi *', req: true }, { key: 'bankName', label: 'Bank adı', placeholder: 'Kapital Bank...' }],
  insurance:     [{ key: 'insuranceRef',label: 'Sığorta polisi nömrəsi *', req: true }, { key: 'insuranceCo', label: 'Sığorta şirkəti *', placeholder: 'AXA, AzSigorta...', req: true }],
  online:        [{ key: 'platform',    label: 'Platforma', placeholder: 'Kapital, ABB, PAŞA...' }, { key: 'onlineCode', label: 'Ödəniş kodu / Referans' }],
}

const fmt = (n) => Number(n || 0).toFixed(2)
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('az-AZ') : '—'
const patFull = (p) => p?.userId?.fullName || p?.fullName || '—'

export default function AdminBilling() {
  const token   = localStorage.getItem('adminToken') || localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  const [invoices,   setInvoices]   = useState([])
  const [summary,    setSummary]    = useState({})
  const [patients,   setPatients]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')

  const [showModal,  setShowModal]  = useState(false)
  const [form,       setForm]       = useState(emptyForm)
  const [formItems,  setFormItems]  = useState([emptyItem()])
  const [saving,     setSaving]     = useState(false)
  const [formErr,    setFormErr]    = useState('')

  const [showPayModal, setShowPayModal] = useState(false)
  const [payForm,      setPayForm]      = useState(emptyPay)
  const [paySaving,    setPaySaving]    = useState(false)
  const [payErr,       setPayErr]       = useState('')
  const [paySuccess,   setPaySuccess]   = useState(null)   // saved payment object for receipt

  const [selected,   setSelected]   = useState(null)
  const [detail,     setDetail]     = useState(null)
  const [detailLoad, setDetailLoad] = useState(false)

  /* ── load ──────────────────────────────────────────────────────────── */
  useEffect(() => {
    Promise.all([
      fetch(`${BASE}/api/v1/billing/summary`,            { headers }).then(r => r.json()),
      fetch(`${BASE}/api/v1/billing?limit=50`,           { headers }).then(r => r.json()),
      fetch(`${BASE}/api/v1/patients?page=1&limit=200`,  { headers }).then(r => r.json()),
    ]).then(([s, inv, pat]) => {
      setSummary(s.data || {})
      setInvoices(inv.data?.invoices || [])
      setPatients(pat.data?.patients || [])
    }).finally(() => setLoading(false))
  }, [])

  /* ── search ─────────────────────────────────────────────────────────── */
  const filtered = invoices.filter(inv =>
    !search ||
    (inv.invoiceNumber || '').toLowerCase().includes(search.toLowerCase()) ||
    patFull(inv.patientId).toLowerCase().includes(search.toLowerCase())
  )

  /* ── detail ─────────────────────────────────────────────────────────── */
  const openDetail = (inv) => {
    setSelected(inv._id)
    setDetail(inv)
    setDetailLoad(true)
    fetch(`${BASE}/api/v1/billing/${inv._id}`, { headers })
      .then(r => r.json())
      .then(d => setDetail(d.data || inv))
      .catch(() => {})
      .finally(() => setDetailLoad(false))
  }

  /* ── invoice form ───────────────────────────────────────────────────── */
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const updateItem = (i, k, v) => {
    setFormItems(prev => prev.map((it, idx) => {
      if (idx !== i) return it
      const updated = { ...it, [k]: v }
      updated.total = (Number(updated.unitPrice) || 0) * (Number(updated.quantity) || 1)
      return updated
    }))
  }

  const subtotal = formItems.reduce((s, it) => s + (Number(it.unitPrice) || 0) * (Number(it.quantity) || 1), 0)
  const total    = subtotal - (Number(form.discount) || 0) + (Number(form.tax) || 0)

  const saveInvoice = async () => {
    if (!form.patientId) { setFormErr('Pasiyent seçin'); return }
    if (formItems.some(it => !it.description.trim())) { setFormErr('Xidmət adı boş ola bilməz'); return }
    setSaving(true); setFormErr('')
    try {
      const body = {
        patientId: form.patientId,
        notes:     form.notes,
        status:    form.status,
        discount:  Number(form.discount) || 0,
        tax:       Number(form.tax) || 0,
        items:     formItems.map(it => ({
          description: it.description,
          quantity:    Number(it.quantity) || 1,
          unitPrice:   Number(it.unitPrice) || 0,
          total:       (Number(it.unitPrice) || 0) * (Number(it.quantity) || 1),
        })),
      }
      const r    = await fetch(`${BASE}/api/v1/billing`, {
        method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await r.json()
      if (!r.ok) {
        const detail = data.errors?.map(e => `${e.field}: ${e.message}`).join('; ')
        throw new Error(detail ? `${data.message} — ${detail}` : data.message || 'Xəta baş verdi')
      }
      setInvoices(prev => [data.data, ...prev])
      setShowModal(false)
      setForm(emptyForm); setFormItems([emptyItem()])
    } catch (e) { setFormErr(e.message) }
    finally { setSaving(false) }
  }

  /* ── payment form ───────────────────────────────────────────────────── */
  const savePayment = async () => {
    if (!payForm.amount || Number(payForm.amount) <= 0) { setPayErr('Məbləğ daxil edin'); return }
    // validate method-specific required fields
    const extraFields = METHOD_FIELDS[payForm.method] || []
    for (const f of extraFields.filter(f => f.req)) {
      if (!payForm[f.key]?.trim()) { setPayErr(`${f.label.replace(' *', '')} daxil edin`); return }
    }
    setPaySaving(true); setPayErr('')
    // build transactionId from method-specific refs
    const txId = payForm.transactionId ||
      payForm.terminalRef || payForm.bankRef || payForm.insuranceRef ||
      payForm.onlineCode  || undefined
    // build note enriched with method details
    const extraNote = [
      payForm.cardLast4   && `Kart: ****${payForm.cardLast4}`,
      payForm.bankName    && `Bank: ${payForm.bankName}`,
      payForm.insuranceCo && `Sığorta şirkəti: ${payForm.insuranceCo}`,
      payForm.platform    && `Platform: ${payForm.platform}`,
      payForm.note,
    ].filter(Boolean).join(' | ')
    try {
      const body = {
        invoiceId:     selected,
        amount:        Number(payForm.amount),
        method:        payForm.method,
        transactionId: txId,
        note:          extraNote || undefined,
      }
      const r    = await fetch(`${BASE}/api/v1/billing/payments`, {
        method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.message || 'Xəta baş verdi')
      // refresh invoice + summary
      fetch(`${BASE}/api/v1/billing/${selected}`, { headers })
        .then(r => r.json()).then(d => {
          const updated = d.data
          setInvoices(prev => prev.map(inv => inv._id === selected ? updated : inv))
          setDetail(updated)
        }).catch(() => {})
      fetch(`${BASE}/api/v1/billing/summary`, { headers })
        .then(r => r.json()).then(d => setSummary(d.data || {})).catch(() => {})
      // show receipt instead of closing
      setPaySuccess({ ...body, txId, extraNote, createdAt: new Date().toISOString(), invoiceNumber: detail?.invoiceNumber, patientName: patFull(detail?.patientId) })
    } catch (e) { setPayErr(e.message) }
    finally { setPaySaving(false) }
  }

  const closePayModal = () => { setShowPayModal(false); setPayForm(emptyPay); setPaySuccess(null); setPayErr('') }

  const printReceipt = () => {
    const ps = paySuccess
    const win = window.open('', '_blank', 'width=400,height=600')
    win.document.write(`<!DOCTYPE html><html><head><title>Ödəniş Qəbzi</title>
<style>body{font-family:Arial,sans-serif;padding:24px;max-width:340px;margin:0 auto}h2{text-align:center;font-size:16px;margin-bottom:4px}p.sub{text-align:center;font-size:12px;color:#666;margin:0 0 16px}.row{display:flex;justify-content:space-between;font-size:13px;padding:5px 0;border-bottom:1px solid #eee}.row.total{font-weight:700;font-size:15px;border-bottom:2px solid #000}.sig{margin-top:40px;display:flex;justify-content:space-between;font-size:11px;color:#888}.brand{text-align:center;margin-top:24px;font-size:11px;color:#aaa}@media print{button{display:none}}</style>
</head><body>
<h2>Aslan Medical Center</h2><p class="sub">Ödəniş Qəbzi</p>
<div class="row"><span>Faktura №</span><span>${ps.invoiceNumber || '—'}</span></div>
<div class="row"><span>Pasiyent</span><span>${ps.patientName}</span></div>
<div class="row"><span>Tarix</span><span>${new Date(ps.createdAt).toLocaleDateString('az-AZ')}</span></div>
<div class="row"><span>Ödəniş üsulu</span><span>${METHOD_LABELS[ps.method]}</span></div>
${ps.txId ? `<div class="row"><span>Sənəd / Ref №</span><span>${ps.txId}</span></div>` : ''}
${ps.extraNote ? `<div class="row"><span>Ətraflı</span><span style="max-width:160px;text-align:right">${ps.extraNote}</span></div>` : ''}
<div class="row total"><span>Ödənildi</span><span>${fmt(ps.amount)} AZN</span></div>
<div class="sig"><span>Qəbul edən: ___________</span><span>Möhür</span></div>
<div class="brand">Aslan Medical Center — aslanmedical.az</div>
<br><button onclick="window.print()" style="width:100%;padding:10px;background:#00848e;color:white;border:none;border-radius:6px;cursor:pointer;font-size:14px">🖨 Çap et</button>
</body></html>`)
    win.document.close()
    win.focus()
  }

  /* ── print invoice ─────────────────────────────────────────────────── */
  const printInvoice = (invoice) => {
    const win = window.open('', '_blank')
    const items = invoice.items?.map(it => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">${it.description}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;text-align:center">${it.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;text-align:right">${it.unitPrice} ₼</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:600">${it.total} ₼</td>
      </tr>
    `).join('') || ''

    const patientName = invoice.patientId?.userId?.fullName || invoice.patientId?.fullName || '—'
    const date = new Date(invoice.createdAt).toLocaleDateString('az-AZ')

    win.document.write(`
      <!DOCTYPE html><html><head>
      <title>Faktura ${invoice.invoiceNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 32px; color: #0a1628; }
        .header { display: flex; justify-content: space-between; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 2px solid #00848e; }
        .logo { font-size: 22px; font-weight: 900; color: #0a1628; }
        .logo span { color: #00848e; font-size: 11px; display: block; letter-spacing: 0.1em; text-transform: uppercase; }
        .invoice-no { font-size: 18px; font-weight: 700; color: #00848e; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px; }
        .info-box h4 { margin: 0 0 8px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; }
        .info-box p { margin: 0; font-size: 14px; line-height: 1.6; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background: #f8fafc; padding: 10px 12px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; color: #64748b; }
        th:last-child, td:last-child { text-align: right; }
        .totals { float: right; width: 260px; }
        .totals table { width: 100%; }
        .totals td { padding: 6px 0; font-size: 14px; }
        .totals .total-row td { font-weight: 700; font-size: 16px; color: #00848e; border-top: 2px solid #00848e; padding-top: 10px; }
        .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 12px; color: #94a3b8; }
        @media print { body { padding: 16px; } }
      </style>
      </head><body>
      <div class="header">
        <div class="logo">ASLAN <span>Medical Center</span></div>
        <div>
          <div class="invoice-no">${invoice.invoiceNumber}</div>
          <div style="font-size:13px;color:#64748b;margin-top:4px">${date}</div>
        </div>
      </div>
      <div class="info-grid">
        <div class="info-box"><h4>Pasiyent</h4><p>${patientName}</p></div>
        <div class="info-box"><h4>Status</h4><p>${invoice.status}</p></div>
      </div>
      <table>
        <thead><tr>
          <th>Xidmət</th><th style="text-align:center">Miqdar</th>
          <th style="text-align:right">Vahid qiyməti</th><th style="text-align:right">Cəmi</th>
        </tr></thead>
        <tbody>${items}</tbody>
      </table>
      <div class="totals">
        <table>
          <tr><td>Ara cəm</td><td>${invoice.subtotal} ₼</td></tr>
          ${invoice.discount ? `<tr><td>Endirim</td><td>-${invoice.discount} ₼</td></tr>` : ''}
          ${invoice.tax ? `<tr><td>Vergi</td><td>${invoice.tax} ₼</td></tr>` : ''}
          <tr class="total-row"><td>CƏMİ</td><td>${invoice.total} ₼</td></tr>
        </table>
      </div>
      <div style="clear:both"></div>
      <div class="footer">Aslan Medical Center • info@aslanmedical.az • +994 50 836 36 94</div>
      </body></html>
    `)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 500)
  }

  /* ── summary counts ─────────────────────────────────────────────────── */
  const unpaidCount    = invoices.filter(i => i.status === 'issued' || i.status === 'overdue').length
  const cancelledCount = invoices.filter(i => i.status === 'cancelled').length

  /* ── shared styles ──────────────────────────────────────────────────── */
  const inp = { width: '100%', border: '1px solid #e2e8f0', borderRadius: 9, padding: '9px 12px', fontSize: 13, color: '#334155', outline: 'none', boxSizing: 'border-box', background: 'white' }
  const lbl = { fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }
  const btn = (bg, color, border) => ({ padding: '6px 12px', borderRadius: 8, border: border || 'none', background: bg, color, fontSize: 12, fontWeight: 600, cursor: 'pointer' })

  /* ════════════════════════════════════════════════════════════════════ */
  return (
    <AdminLayout activePage="billing">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f1b2d' }}>Billing</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>{invoices.length} faktura</p>
        </div>
        <button onClick={() => { setForm(emptyForm); setFormItems([emptyItem()]); setFormErr(''); setShowModal(true) }}
          style={{ background: '#00848e', color: 'white', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Yeni Faktura
        </button>
      </div>

      {/* ── Summary cards ───────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Ümumi gəlir',    value: `${fmt(summary.totalRevenue)} AZN`, color: '#00848e', bg: '#f0fdfa' },
          { label: 'Bu gün',         value: `${fmt(summary.todayRevenue)} AZN`, color: '#16a34a', bg: '#f0fdf4' },
          { label: 'Ödənilməmiş',    value: unpaidCount,                         color: '#ea580c', bg: '#fff7ed' },
          { label: 'Ləğv edilmiş',   value: cancelledCount,                      color: '#dc2626', bg: '#fef2f2' },
        ].map(c => (
          <div key={c.label} style={{ background: c.bg, border: `1px solid ${c.color}20`, borderRadius: 14, padding: '16px 20px' }}>
            <p style={{ margin: 0, fontSize: 12, color: '#64748b', fontWeight: 500 }}>{c.label}</p>
            <p style={{ margin: '6px 0 0', fontSize: 22, fontWeight: 700, color: c.color }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* ── Main layout ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 18, height: 'calc(100vh - 290px)' }}>

        {/* Left — table */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ position: 'relative', marginBottom: 14 }}>
            <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
              <svg width="14" height="14" fill="none" stroke="#94a3b8" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Faktura №, pasiyent axtar..."
              style={{ ...inp, paddingLeft: 36 }} />
          </div>

          <div style={{ flex: 1, background: 'white', borderRadius: 14, border: '1px solid #f1f5f9', overflow: 'auto' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#00848e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8', fontSize: 14 }}>Faktura tapılmadı</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    {['Faktura №', 'Pasiyent', 'Məbləğ', 'Status', 'Tarix', ''].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(inv => {
                    const s = STATUS[inv.status] || STATUS.draft
                    const isSel = selected === inv._id
                    return (
                      <tr key={inv._id} onClick={() => openDetail(inv)}
                        style={{ borderBottom: '1px solid #f8fafc', cursor: 'pointer', background: isSel ? '#f0fafb' : 'white', transition: 'background 0.1s' }}
                        onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = '#f8fafc' }}
                        onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = 'white' }}
                      >
                        <td style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: '#0f1b2d' }}>{inv.invoiceNumber || '—'}</td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#334155' }}>{patFull(inv.patientId)}</td>
                        <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#0f1b2d' }}>{fmt(inv.total)} AZN</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: s.bg, color: s.color }}>{s.label}</span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: '#64748b' }}>{fmtDate(inv.createdAt)}</td>
                        <td style={{ padding: '12px 16px' }} onClick={e => e.stopPropagation()}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => { setSelected(inv._id); setDetail(inv); setPayForm(emptyPay); setPayErr(''); setShowPayModal(true) }}
                              style={btn('white', '#00848e', '1px solid #00848e')}>Ödəniş</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right — detail panel */}
        <div style={{ width: selected ? 320 : 0, transition: 'width 0.25s', overflow: 'hidden', flexShrink: 0 }}>
          {selected && detail && (
            <div style={{ width: 320, background: 'white', borderRadius: 14, border: '1px solid #f1f5f9', height: '100%', overflow: 'auto', padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#0f1b2d' }}>Faktura məlumatı</span>
                <button onClick={() => { setSelected(null); setDetail(null) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 20 }}>×</button>
              </div>

              {detailLoad ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                  <div style={{ width: 28, height: 28, border: '3px solid #e2e8f0', borderTopColor: '#00848e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: 14 }}>
                    <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f1b2d' }}>{detail.invoiceNumber || '—'}</p>
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>{fmtDate(detail.createdAt)}</p>
                  </div>

                  {(() => { const s = STATUS[detail.status] || STATUS.draft; return (
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: s.bg, color: s.color, display: 'inline-block', marginBottom: 14 }}>{s.label}</span>
                  )})()}

                  <div style={{ fontSize: 13, color: '#334155', marginBottom: 4 }}>
                    <strong>{patFull(detail.patientId)}</strong>
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 14 }}>
                    {detail.patientId?.userId?.email || ''}
                  </div>

                  {/* Items */}
                  <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 12px', marginBottom: 14 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          {['Xidmət', 'Miqdar', 'Qiymət', 'Cəm'].map(h => (
                            <th key={h} style={{ fontSize: 10, color: '#94a3b8', textAlign: 'left', padding: '4px 6px', fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(detail.items || []).map((it, i) => (
                          <tr key={i}>
                            <td style={{ fontSize: 12, padding: '4px 6px', color: '#334155' }}>{it.description}</td>
                            <td style={{ fontSize: 12, padding: '4px 6px', color: '#64748b' }}>{it.quantity}</td>
                            <td style={{ fontSize: 12, padding: '4px 6px', color: '#64748b' }}>{fmt(it.unitPrice)}</td>
                            <td style={{ fontSize: 12, padding: '4px 6px', fontWeight: 600, color: '#0f1b2d' }}>{fmt(it.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Totals */}
                  {[
                    ['Aralıq cəm', detail.subtotal],
                    ['Endirim', -(detail.discount || 0)],
                    ['Vergi', detail.tax || 0],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 4 }}>
                      <span>{k}</span><span>{fmt(v)} AZN</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, color: '#0f1b2d', borderTop: '1px solid #f1f5f9', paddingTop: 8, marginTop: 8 }}>
                    <span>TOPLAM</span><span>{fmt(detail.total)} AZN</span>
                  </div>

                  <button onClick={() => { setPayForm(emptyPay); setPayErr(''); setShowPayModal(true) }}
                    style={{ marginTop: 16, width: '100%', padding: '10px', background: '#00848e', color: 'white', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    Ödəniş əlavə et
                  </button>
                  <button
                    onClick={() => printInvoice(detail)}
                    style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: 9, background: 'white', fontSize: 13, fontWeight: 600, color: '#475569', cursor: 'pointer', marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#00848e'; e.currentTarget.style.color = '#00848e' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569' }}
                  >
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                      <rect x="6" y="14" width="12" height="8"/>
                    </svg>
                    Çap et / PDF
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ════ ADD INVOICE MODAL ════════════════════════════════════════ */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div style={{ background: 'white', borderRadius: 16, width: 600, maxWidth: '95vw', maxHeight: '90vh', overflow: 'auto', padding: 28 }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f1b2d' }}>Yeni Faktura</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 22 }}>×</button>
            </div>

            {formErr && <div style={{ background: '#fef2f2', color: '#ef4444', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>{formErr}</div>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Patient */}
              <div>
                <label style={lbl}>Pasiyent *</label>
                <select style={inp} value={form.patientId} onChange={e => setF('patientId', e.target.value)}>
                  <option value="">Pasiyent seçin...</option>
                  {patients.map(p => (
                    <option key={p._id} value={p._id}>
                      {patFull(p)}{p.patientId ? ` (${p.patientId})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Items */}
              <div>
                <label style={lbl}>Xidmətlər *</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {formItems.map((it, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 90px 70px 28px', gap: 6, alignItems: 'center' }}>
                      <input style={inp} placeholder="Xidmət adı" value={it.description} onChange={e => updateItem(i, 'description', e.target.value)} />
                      <input style={inp} type="number" min="1" placeholder="Miq." value={it.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} />
                      <input style={inp} type="number" min="0" step="0.01" placeholder="Qiymət" value={it.unitPrice} onChange={e => updateItem(i, 'unitPrice', e.target.value)} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#0f1b2d', textAlign: 'right' }}>{fmt((Number(it.unitPrice)||0)*(Number(it.quantity)||1))}</span>
                      {formItems.length > 1 && (
                        <button onClick={() => setFormItems(prev => prev.filter((_, idx) => idx !== i))}
                          style={{ width: 24, height: 24, background: '#fef2f2', border: 'none', borderRadius: 6, color: '#ef4444', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => setFormItems(prev => [...prev, emptyItem()])}
                    style={{ padding: '7px 14px', border: '1px dashed #e2e8f0', borderRadius: 8, background: 'white', color: '#64748b', fontSize: 12, cursor: 'pointer', textAlign: 'left' }}>
                    + Xidmət əlavə et
                  </button>
                </div>
              </div>

              {/* Discount / Tax */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={lbl}>Endirim (AZN)</label>
                  <input style={inp} type="number" min="0" step="0.01" value={form.discount} onChange={e => setF('discount', e.target.value)} />
                </div>
                <div>
                  <label style={lbl}>Vergi (AZN)</label>
                  <input style={inp} type="number" min="0" step="0.01" value={form.tax} onChange={e => setF('tax', e.target.value)} />
                </div>
              </div>

              {/* Totals preview */}
              <div style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 4 }}>
                  <span>Aralıq cəm</span><span>{fmt(subtotal)} AZN</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, color: '#0f1b2d', borderTop: '1px solid #e2e8f0', paddingTop: 8, marginTop: 4 }}>
                  <span>TOPLAM</span><span>{fmt(total)} AZN</span>
                </div>
              </div>

              {/* Status + Notes */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 14 }}>
                <div>
                  <label style={lbl}>Status</label>
                  <select style={inp} value={form.status} onChange={e => setF('status', e.target.value)}>
                    <option value="draft">Qaralama</option>
                    <option value="issued">Kəsildi</option>
                  </select>
                </div>
                <div>
                  <label style={lbl}>Qeyd</label>
                  <input style={inp} value={form.notes} onChange={e => setF('notes', e.target.value)} placeholder="Əlavə qeydlər..." />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '10px 20px', border: '1px solid #e2e8f0', borderRadius: 9, background: 'white', fontSize: 13, cursor: 'pointer', color: '#475569' }}>Ləğv et</button>
              <button onClick={saveInvoice} disabled={saving} style={{ padding: '10px 24px', border: 'none', borderRadius: 9, background: '#00848e', color: 'white', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saxlanır...' : 'Faktura Yarat'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════ ADD PAYMENT MODAL ════════════════════════════════════════ */}
      {showPayModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => { if (e.target === e.currentTarget) closePayModal() }}>
          <div style={{ background: 'white', borderRadius: 16, width: 440, maxWidth: '95vw', maxHeight: '90vh', overflow: 'auto', padding: 28 }}>

            {/* ── Receipt view after success ── */}
            {paySuccess ? (
              <>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 24 }}>✓</div>
                  <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#16a34a' }}>Ödəniş qeyd edildi!</h2>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>{new Date(paySuccess.createdAt).toLocaleString('az-AZ')}</p>
                </div>

                <div style={{ background: '#f8fafc', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
                  {[
                    ['Faktura №',      paySuccess.invoiceNumber || '—'],
                    ['Pasiyent',       paySuccess.patientName],
                    ['Ödəniş üsulu',   METHOD_LABELS[paySuccess.method]],
                    ['Sənəd / Ref №',  paySuccess.txId || '—'],
                    ['Ətraflı',        paySuccess.extraNote || '—'],
                    ['Məbləğ',         `${fmt(paySuccess.amount)} AZN`],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '5px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ color: '#64748b' }}>{k}</span>
                      <span style={{ fontWeight: k === 'Məbləğ' ? 700 : 500, color: k === 'Məbləğ' ? '#16a34a' : '#0f1b2d', maxWidth: '55%', textAlign: 'right' }}>{v}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button onClick={closePayModal} style={{ padding: '10px 20px', border: '1px solid #e2e8f0', borderRadius: 9, background: 'white', fontSize: 13, cursor: 'pointer', color: '#475569' }}>Bağla</button>
                  <button onClick={printReceipt} style={{ padding: '10px 20px', border: 'none', borderRadius: 9, background: '#00848e', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                    Çap et
                  </button>
                </div>
              </>
            ) : (
              /* ── Form view ── */
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f1b2d' }}>Ödəniş Qeyd Et</h2>
                    {detail && <p style={{ margin: '3px 0 0', fontSize: 12, color: '#64748b' }}>{detail.invoiceNumber} — {fmt(detail.total)} AZN</p>}
                  </div>
                  <button onClick={closePayModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 22 }}>×</button>
                </div>

                {payErr && <div style={{ background: '#fef2f2', color: '#ef4444', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>{payErr}</div>}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Amount */}
                  <div>
                    <label style={lbl}>Məbləğ (AZN) *</label>
                    <input style={inp} type="number" min="0" step="0.01" value={payForm.amount}
                      onChange={e => setPayForm(f => ({ ...f, amount: e.target.value }))} />
                  </div>

                  {/* Method */}
                  <div>
                    <label style={lbl}>Ödəniş üsulu *</label>
                    <select style={inp} value={payForm.method}
                      onChange={e => setPayForm(f => ({ ...f, method: e.target.value }))}>
                      {Object.entries(METHOD_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>

                  {/* Method-specific fields */}
                  {(METHOD_FIELDS[payForm.method] || []).map(f => (
                    <div key={f.key}>
                      <label style={lbl}>{f.label}</label>
                      <input style={inp} value={payForm[f.key]}
                        placeholder={f.placeholder || ''}
                        onChange={e => setPayForm(prev => ({ ...prev, [f.key]: e.target.value }))} />
                    </div>
                  ))}

                  {/* Note */}
                  <div>
                    <label style={lbl}>Əlavə qeyd</label>
                    <input style={inp} value={payForm.note}
                      onChange={e => setPayForm(f => ({ ...f, note: e.target.value }))}
                      placeholder="Opsional..." />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
                  <button onClick={closePayModal} style={{ padding: '10px 20px', border: '1px solid #e2e8f0', borderRadius: 9, background: 'white', fontSize: 13, cursor: 'pointer', color: '#475569' }}>Ləğv et</button>
                  <button onClick={savePayment} disabled={paySaving}
                    style={{ padding: '10px 24px', border: 'none', borderRadius: 9, background: '#00848e', color: 'white', fontSize: 13, fontWeight: 600, cursor: paySaving ? 'not-allowed' : 'pointer', opacity: paySaving ? 0.7 : 1 }}>
                    {paySaving ? 'Qeyd edilir...' : 'Ödənişi Qeyd Et'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </AdminLayout>
  )
}
