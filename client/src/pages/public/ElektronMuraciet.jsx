const FONT = "'Source Sans 3', 'Raleway', sans-serif"

export default function ElektronMuraciet() {
  const isMobile = window.innerWidth < 768

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
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 48px 60px',
        border: '1px solid #e0e0e0',
        borderRadius: '4px',
        boxSizing: 'border-box',
      }}>
        <form onSubmit={e => e.preventDefault()}>

          {/* Row 1 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr',
            gap: '24px',
            marginBottom: '24px',
            paddingTop: '32px',
          }}>
            {[['Ad', 'ad'], ['Soyad', 'soyad'], ['Ata adı', 'ataAdi']].map(([label, name]) => (
              <div key={name}>
                <label style={{ fontSize: '13px', color: '#333', marginBottom: '6px', display: 'block' }}>
                  {label} *
                </label>
                <input
                  type="text"
                  name={name}
                  style={{
                    width: '100%', border: '1px solid #ccc', borderRadius: '4px',
                    padding: '10px 12px', fontSize: '14px', boxSizing: 'border-box',
                    outline: 'none', fontFamily: FONT,
                  }}
                />
              </div>
            ))}
          </div>

          {/* Row 2 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr',
            gap: '24px',
            marginBottom: '24px',
          }}>
            {[['E-poçt', 'email', 'email'], ['Telefon', 'telefon', 'tel'], ['Ünvan', 'unvan', 'text']].map(([label, name, type]) => (
              <div key={name}>
                <label style={{ fontSize: '13px', color: '#333', marginBottom: '6px', display: 'block' }}>
                  {label} *
                </label>
                <input
                  type={type}
                  name={name}
                  style={{
                    width: '100%', border: '1px solid #ccc', borderRadius: '4px',
                    padding: '10px 12px', fontSize: '14px', boxSizing: 'border-box',
                    outline: 'none', fontFamily: FONT,
                  }}
                />
              </div>
            ))}
          </div>

          {/* Row 3 — textarea */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '13px', color: '#333', marginBottom: '6px', display: 'block' }}>
              Mətn *
            </label>
            <textarea
              name="metn"
              style={{
                width: '100%', border: '1px solid #ccc', borderRadius: '4px',
                padding: '10px 12px', fontSize: '14px', boxSizing: 'border-box',
                minHeight: '200px', resize: 'vertical', outline: 'none',
                fontFamily: FONT,
              }}
            />
          </div>

          {/* Bottom row */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}>
            {/* reCAPTCHA placeholder */}
            <div style={{
              border: '1px solid #ccc', borderRadius: '4px',
              padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px',
              background: '#f9f9f9',
            }}>
              <input type="checkbox" id="captcha" style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
              <label htmlFor="captcha" style={{ fontSize: '14px', color: '#333', cursor: 'pointer', userSelect: 'none' }}>
                Mən robot deyiləm
              </label>
              <span style={{ fontSize: '10px', color: '#4285f4', marginLeft: '8px', fontWeight: 600 }}>
                reCAPTCHA
              </span>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              style={{
                background: '#e53e3e', color: 'white', border: 'none',
                padding: '14px 48px', fontSize: '16px', borderRadius: '4px',
                cursor: 'pointer', fontFamily: FONT, fontWeight: 500,
              }}
            >
              Müraciət et
            </button>
          </div>

        </form>
      </div>

    </div>
  )
}
