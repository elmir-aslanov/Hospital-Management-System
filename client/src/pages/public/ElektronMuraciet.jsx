import { useState } from 'react'

const FONT = "'Source Sans 3', 'Raleway', sans-serif"

export default function ElektronMuraciet() {
  const isMobile = window.innerWidth < 768

  const [form, setForm] = useState({ ad: '', soyad: '', ataAdi: '', epoct: '', telefon: '', unvan: '', metn: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const { ad, soyad, ataAdi, epoct, telefon, unvan, metn } = form
    if (!ad.trim() || !soyad.trim() || !ataAdi.trim() || !epoct.trim() || !telefon.trim() || !unvan.trim() || !metn.trim()) {
      setError('Bütün sahələri doldurun')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/v1/muraciet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ad, soyad, ataAdi, epoct, telefon, unvan, metn }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Xəta baş verdi')
      setSuccess('Müraciətiniz qəbul edildi')
      setForm({ ad: '', soyad: '', ataAdi: '', epoct: '', telefon: '', unvan: '', metn: '' })
    } catch (err) {
      setError(err.message || 'Xəta baş verdi')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', border: '1px solid #ccc', borderRadius: '4px',
    padding: '10px 12px', fontSize: '14px', boxSizing: 'border-box',
    outline: 'none', fontFamily: FONT,
  }
  const labelStyle = { fontSize: '13px', color: '#333', marginBottom: '6px', display: 'block' }

  return (
    <div style={{ background: '#fff', minHeight: '100vh', fontFamily: FONT }}>

      {/* Top text section */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 48px' }}>
        <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 16, color: '#1a1a1a' }}>
          Hörmətli istifadəçi!
        </h2>
        <p style={{ fontSize: 14, color: '#333', lineHeight: 1.7, marginBottom: 12 }}>
          Aslan Medical Center-ə olan müraciətlər "Vətəndaşların müraciətləri haqqında" Azərbaycan Respublikasının Qanunu və digər qanunvericilik aktlarına uyğun olaraq qeydiyyata alınır və baxılır. Müraciətin mətni oxunaqlı olmalı, müraciətdə edilən təklif və ya tələb aydın ifadə edilməli, təhqir və böhtana yol verilməməlidir.
        </p>
        <p style={{ fontSize: 14, color: '#333', lineHeight: 1.7, marginBottom: 12 }}>
          Müraciətdə təhqir və böhtana yol verildikdə, yaxud müəllif özü barədə məlumatları dəqiq göstərmədikdə müraciətə baxılmır.
        </p>
        <p style={{ fontSize: 14, color: '#333', lineHeight: 1.7, marginBottom: 0 }}>
          Aslan Medical Center təhlükəsizlik səbəbindən bu domenlərdən məktub qəbul etmir: yandex.ru, mail.ru, list.ru, inbox.ru, bk.ru, yahoo.com.
        </p>
      </div>

      {/* Form section */}
      <div style={{
        maxWidth: '1280px', margin: '0 auto',
        padding: '0 48px 60px',
        border: '1px solid #e0e0e0', borderRadius: '4px',
        boxSizing: 'border-box',
      }}>
        <form onSubmit={handleSubmit}>

          {/* Row 1 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr',
            gap: '24px', marginBottom: '24px', paddingTop: '32px',
          }}>
            {[['Ad', 'ad'], ['Soyad', 'soyad'], ['Ata adı', 'ataAdi']].map(([label, name]) => (
              <div key={name}>
                <label style={labelStyle}>{label} *</label>
                <input type="text" name={name} value={form[name]} onChange={handleChange} style={inputStyle} />
              </div>
            ))}
          </div>

          {/* Row 2 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr',
            gap: '24px', marginBottom: '24px',
          }}>
            {[['E-poçt', 'epoct', 'email'], ['Telefon', 'telefon', 'tel'], ['Ünvan', 'unvan', 'text']].map(([label, name, type]) => (
              <div key={name}>
                <label style={labelStyle}>{label} *</label>
                <input type={type} name={name} value={form[name]} onChange={handleChange} style={inputStyle} />
              </div>
            ))}
          </div>

          {/* Row 3 — textarea */}
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Mətn *</label>
            <textarea
              name="metn"
              value={form.metn}
              onChange={handleChange}
              style={{ ...inputStyle, minHeight: '200px', resize: 'vertical' }}
            />
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? '#aaa' : '#e53e3e',
                color: 'white', border: 'none',
                padding: '14px 48px', fontSize: '16px', borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: FONT, fontWeight: 500,
              }}
            >
              {loading ? 'Göndərilir...' : 'Müraciət et'}
            </button>
          </div>

          {/* Messages */}
          {error && (
            <p style={{ marginTop: '16px', color: '#e53e3e', fontSize: '14px', textAlign: 'right' }}>
              {error}
            </p>
          )}
          {success && (
            <p style={{ marginTop: '16px', color: '#38a169', fontSize: '14px', textAlign: 'right' }}>
              {success}
            </p>
          )}

        </form>
      </div>

    </div>
  )
}
