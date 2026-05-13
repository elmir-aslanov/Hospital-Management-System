export default function ContactPage() {
  return (
    <div style={{ background:'#050c17', minHeight:'100vh', color:'#fff', fontFamily:'var(--font-sans)', paddingTop:80 }}>
      <div style={{ maxWidth:700, margin:'0 auto', padding:'64px 48px', textAlign:'center' }}>
        <h1 style={{ fontSize:48, fontWeight:900, marginBottom:16 }}>Əlaqə</h1>
        <p style={{ color:'rgba(255,255,255,0.5)', marginBottom:48 }}>Bizimlə əlaqə saxlayın</p>
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {[['📍','Ünvan','Bakı, Nərimanov r., Tibb şəhərciyi, 1'],
            ['📞','Telefon','+994 12 000 00 00'],
            ['🚨','Təcili yardım','112'],
            ['✉️','E-poçt','info@elmirmed.az'],
            ['🕐','İş saatları','Bazar ertəsi — Şənbə, 08:00–20:00 | Bazar 09:00–17:00']].map(([ico,label,val])=>(
            <div key={label} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:'20px 28px', display:'flex', alignItems:'center', gap:20, textAlign:'left' }}>
              <span style={{ fontSize:28 }}>{ico}</span>
              <div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:4 }}>{label}</div>
                <div style={{ fontSize:15, fontWeight:500 }}>{val}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
