export default function AboutPage() {
  return (
    <div style={{ background:'#050c17', minHeight:'100vh', color:'#fff', fontFamily:'var(--font-sans)', paddingTop:80 }}>
      <div style={{ maxWidth:900, margin:'0 auto', padding:'64px 48px' }}>
        <h1 style={{ fontSize:48, fontWeight:900, marginBottom:16 }}>Haqqımızda</h1>
        <p style={{ color:'rgba(255,255,255,0.6)', fontSize:17, lineHeight:1.8, marginBottom:32 }}>
          ElmirMed 2015-ci ildə yaradılmış, Azərbaycanın ən müasir tibb mərkəzlərindən biridir.
          Peşəkar komandamız, qabaqcıl avadanlığımız və fərdi yanaşmamız ilə hər bir pasiyentə keyfiyyətli tibbi xidmət göstəririk.
        </p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24 }}>
          {[['Missiya','Hər pasiyentə ən yüksək keyfiyyətli tibbi xidmət göstərmək.'],
            ['Görüş','Sağlamlıq xidmətlərini hamı üçün əlçatan etmək.'],
            ['Dəyərlər','Peşəkarlıq, şəffaflıq, empatiya.']].map(([t,d])=>(
            <div key={t} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:28 }}>
              <h3 style={{ color:'#00BCD4', fontSize:14, letterSpacing:'0.15em', textTransform:'uppercase', fontWeight:700, marginBottom:12 }}>{t}</h3>
              <p style={{ color:'rgba(255,255,255,0.6)', fontSize:14, lineHeight:1.7 }}>{d}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
