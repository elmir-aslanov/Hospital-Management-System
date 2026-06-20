import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../api/axios'
import { clearAuthStorage } from '../../utils/authSession'

const NAV=[
  ['dashboard','/bas-hekim/dashboard','▦'],['doctors','/bas-hekim/hekimler','⚕'],
  ['departments','/bas-hekim/sobeler','⌂'],['appointments','/bas-hekim/randevular','▣'],
  ['laboratory','/bas-hekim/laboratoriya','⌁'],['documents','/bas-hekim/tibbi-senedler','▤'],
  ['councils','/bas-hekim/konsiliumlar','◎'],['incidents','/bas-hekim/kritik-hallar','!'],
  ['reports','/bas-hekim/hesabatlar','▥'],['audit','/bas-hekim/audit','◷'],
  ['clinicalReports','/bas-hekim/klinik-hesabatlar','◫'],
]
const C={navy:'#071B2E',teal:'#168C96',bg:'#f4f7fa',border:'#dce5ec'}

export default function ChiefDoctorLayout({children}){
  const {t}=useTranslation();const nav=useNavigate();const loc=useLocation();const [open,setOpen]=useState(false)
  const user=(()=>{try{return JSON.parse(localStorage.getItem('user')||'{}')}catch{return {}}})()
  const logout=async()=>{try{await api.post('/auth/logout')}catch{/* local logout still continues */}clearAuthStorage();nav('/admin')}
  const sidebar=<div style={{height:'100%',display:'flex',flexDirection:'column'}}>
    <div style={{padding:'19px 16px',display:'flex',gap:10,alignItems:'center'}}>
      <div style={{width:34,height:34,borderRadius:9,background:C.teal,color:'white',display:'grid',placeItems:'center'}}>✚</div>
      <div><div style={{color:'white',fontWeight:700,fontSize:14}}>Aslan Medical</div><div style={{color:'#6f9bb8',fontSize:10}}>{t('chiefDoctor.panel')}</div></div>
    </div>
    <nav style={{padding:'4px 10px',flex:1,overflowY:'auto'}}>
      {NAV.map(([key,path,icon])=>{const active=loc.pathname===path;return <button key={key} onClick={()=>{nav(path);setOpen(false)}} style={{width:'100%',height:42,border:0,borderLeft:`3px solid ${active?C.teal:'transparent'}`,borderRadius:8,background:active?'rgba(22,140,150,.18)':'transparent',color:active?'white':'#82a8c3',display:'flex',alignItems:'center',gap:10,padding:'0 12px',cursor:'pointer',marginBottom:2,textAlign:'left'}}><span aria-hidden="true">{icon}</span><span>{t(`chiefDoctor.nav.${key}`)}</span></button>})}
    </nav>
    <button onClick={logout} style={{margin:12,height:40,border:0,borderRadius:8,background:'rgba(239,68,68,.08)',color:'#f87171',cursor:'pointer'}}>{t('chiefDoctor.logout')}</button>
  </div>
  return <div className="chief-shell" style={{minHeight:'100vh',background:C.bg,fontFamily:"'Source Sans 3','Raleway',sans-serif"}}>
    <aside className="chief-sidebar" style={{position:'fixed',inset:'0 auto 0 0',width:252,background:C.navy,zIndex:50}}>{sidebar}</aside>
    {open&&<div className="chief-overlay" onClick={()=>setOpen(false)} style={{position:'fixed',inset:0,zIndex:90,background:'rgba(7,27,46,.55)'}}><aside onClick={e=>e.stopPropagation()} style={{width:252,height:'100%',background:C.navy}}>{sidebar}</aside></div>}
    <div className="chief-main" style={{marginLeft:252,minWidth:0}}>
      <header style={{height:64,position:'sticky',top:0,zIndex:20,background:'rgba(244,247,250,.95)',borderBottom:`1px solid ${C.border}`,display:'flex',alignItems:'center',padding:'0 28px',justifyContent:'space-between'}}>
        <button className="chief-menu" onClick={()=>setOpen(true)} aria-label={t('chiefDoctor.openMenu')} style={{display:'none',border:0,background:'none',fontSize:22}}>☰</button>
        <div/><div style={{background:'white',border:`1px solid ${C.border}`,borderRadius:9,padding:'7px 12px'}}><div style={{fontSize:12,fontWeight:600,color:C.navy}}>{user.fullName||t('chiefDoctor.role')}</div><div style={{fontSize:10,color:'#64748b'}}>{t('chiefDoctor.role')}</div></div>
      </header>
      <main style={{padding:'24px 28px'}}>{children}</main>
    </div>
    <style>{`@media(max-width:900px){.chief-sidebar{display:none}.chief-main{margin-left:0!important}.chief-menu{display:block!important}}@media(max-width:600px){.chief-main main{padding:16px 12px!important}}`}</style>
  </div>
}
