import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from '../../api/axios'

const TEAL = '#2b8ec5'
const FONT = "'Source Sans 3', sans-serif"
const MONTHS = ['Yanvar','Fevral','Mart','Aprel','May','İyun','İyul','Avqust','Sentyabr','Oktyabr','Noyabr','Dekabr']
const DAYS = Array.from({length:31},(_,i)=>i+1)
const YEARS = Array.from({length:80},(_,i)=>new Date().getFullYear()-i)
const COUNTRIES = ['Azərbaycan','Türkiyə','Rusiya','Gürcüstan','Digər']

export default function RandevuPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState('erandevu')
  const [step, setStep] = useState(1)
  const [country, setCountry] = useState('Azərbaycan')
  const [fin, setFin] = useState('')
  const [birthDay, setBirthDay] = useState('')
  const [birthMonth, setBirthMonth] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [patient, setPatient] = useState(null)
  const [departments, setDepartments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [selectedDept, setSelectedDept] = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState(searchParams.get('doctorId')||'')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')
  const [slots, setSlots] = useState([])
  const [note, setNote] = useState('')
  const [appointment, setAppointment] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(()=>{ axios.get('/departments').then(r=>setDepartments(r.data.data||[])).catch(()=>{}) },[])
  useEffect(()=>{ if(selectedDept) axios.get(`/doctors?department=${selectedDept}`).then(r=>setDoctors(r.data.data||[])).catch(()=>{}) },[selectedDept])
  useEffect(()=>{ if(selectedDoctor&&selectedDate) axios.get(`/appointments/slots?doctorId=${selectedDoctor}&date=${selectedDate}`).then(r=>setSlots(r.data.data||[])).catch(()=>setSlots([])) },[selectedDoctor,selectedDate])

  const handleStep1 = async () => {
    if(!fin||!birthDay||!birthMonth||!birthYear||!agreed) return setError('Bütün xanaları doldurun')
    setLoading(true); setError('')
    try {
      const bd = `${birthYear}-${String(MONTHS.indexOf(birthMonth)+1).padStart(2,'0')}-${String(birthDay).padStart(2,'0')}`
      const r = await axios.post('/patients/search-public',{patientId:fin,birthDate:bd})
      setPatient(r.data.data)
    } catch(e){ setPatient(null) }
    finally{ setLoading(false); setStep(2) }
  }

  const handleStep2 = async () => {
    if(!selectedDoctor||!selectedDate||!selectedSlot) return setError('Bütün xanaları doldurun')
    setLoading(true); setError('')
    try {
      const r = await axios.post('/appointments',{doctorId:selectedDoctor,departmentId:selectedDept,date:selectedDate,timeSlot:selectedSlot,note,patientFin:fin})
      setAppointment(r.data.data)
      setStep(3)
    } catch(e){ setError(e.response?.data?.message||'Xəta baş verdi') }
    finally{ setLoading(false) }
  }

  const F = {
    wrap: { position:'relative', marginBottom:20 },
    lbl: { position:'absolute', top:-9, left:12, fontSize:11, color:TEAL, background:'white', padding:'0 4px', fontWeight:600, zIndex:1, letterSpacing:'0.3px' },
    inp: { width:'100%', padding:'13px 16px', border:'1.5px solid #c8d8e8', borderRadius:6, fontSize:15, color:'#1e293b', outline:'none', fontFamily:FONT, boxSizing:'border-box', background:'white' },
  }

  const steps = ['İstifadəçi məlumatı','Randevu detalları','Tasdiq etmək']

  return (
    <div style={{fontFamily:FONT, paddingTop:80, minHeight:'100vh', background:'#f0f4f8'}}>

      {/* TOP TABS */}
      <div style={{background:'white', borderBottom:'1px solid #e0eaf2', display:'flex', height:56}}>
        {[{k:'erandevu',label:'E-randevu'},{k:'legv',label:'Randevunu ləğv etmək'}].map(t=>(
          <button key={t.k} onClick={()=>setActiveTab(t.k)} style={{flex:1, border:'none', background:'none', cursor:'pointer', fontSize:15, fontFamily:FONT, color:activeTab===t.k?TEAL:'#888', fontWeight:activeTab===t.k?600:400, borderBottom:activeTab===t.k?`3px solid ${TEAL}`:'3px solid transparent', display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'all 0.15s'}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            {t.label}
          </button>
        ))}
      </div>

      {/* STEP BAR */}
      <div style={{display:'flex', background:'white', borderBottom:'1px solid #e0eaf2', boxShadow:'0 2px 4px rgba(0,0,0,0.06)'}}>
        {steps.map((s,i)=>{
          const active = step===i+1
          const done = step>i+1
          const isFirst = i===0
          const isLast = i===2
          return (
            <div key={i} style={{flex:1, height:48, display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontSize:14, fontWeight:active?600:400, color:active||done?'white':'#666', background:active||done?TEAL:'white', clipPath: isLast ? 'polygon(20px 0,100% 0,100% 100%,0 100%,0 50%)' : isFirst ? 'polygon(0 0,calc(100% - 20px) 0,100% 50%,calc(100% - 20px) 100%,0 100%)' : 'polygon(0 0,calc(100% - 20px) 0,100% 50%,calc(100% - 20px) 100%,0 100%,20px 50%)', position:'relative', zIndex:steps.length-i}}>
              <div style={{width:20, height:20, borderRadius:'50%', border:`2px solid ${active||done?'white':'#aaa'}`, display:'flex', alignItems:'center', justifyContent:'center'}}>
                {done||active ? <svg width="10" height="10" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg> : <div style={{width:8,height:8,borderRadius:'50%',background:'#aaa'}}/>}
              </div>
              {s}
            </div>
          )
        })}
      </div>

      {/* CONTENT */}
      <div style={{padding:'40px 16px'}}>
        <div style={{maxWidth:520, margin:'0 auto', background:'white', borderRadius:8, padding:'48px 40px', boxShadow:'0 2px 12px rgba(0,0,0,0.08)'}}>

          {error && <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:6,padding:'12px 16px',color:'#dc2626',fontSize:14,marginBottom:16}}>{error}</div>}

          {/* STEP 1 */}
          {step===1 && <>
            <h2 style={{fontSize:28,fontWeight:600,color:TEAL,marginBottom:32,fontFamily:"'Raleway',sans-serif"}}>Giriş Məlumatları</h2>

            <div style={F.wrap}>
              <span style={F.lbl}>Ölkə</span>
              <select value={country} onChange={e=>setCountry(e.target.value)} style={F.inp}>
                {COUNTRIES.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>

            <div style={F.wrap}>
              <span style={F.lbl}>ŞV FİN kod</span>
              <input value={fin} onChange={e=>setFin(e.target.value)} placeholder="ŞV FİN kod" style={F.inp}/>
            </div>

            <div style={F.wrap}>
              <span style={F.lbl}>Doğum tarixi</span>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginTop:4}}>
                <select value={birthDay} onChange={e=>setBirthDay(e.target.value)} style={F.inp}>
                  <option value=''>Gün</option>
                  {DAYS.map(d=><option key={d}>{d}</option>)}
                </select>
                <select value={birthMonth} onChange={e=>setBirthMonth(e.target.value)} style={F.inp}>
                  <option value=''>Ay</option>
                  {MONTHS.map(m=><option key={m}>{m}</option>)}
                </select>
                <select value={birthYear} onChange={e=>setBirthYear(e.target.value)} style={F.inp}>
                  <option value=''>İl</option>
                  {YEARS.map(y=><option key={y}>{y}</option>)}
                </select>
              </div>
            </div>

            <div style={{display:'flex',alignItems:'flex-start',gap:10,marginBottom:28}}>
              <div onClick={()=>setAgreed(!agreed)} style={{width:18,height:18,border:`1.5px solid ${agreed?TEAL:'#94a3b8'}`,borderRadius:3,background:agreed?TEAL:'white',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,marginTop:2}}>
                {agreed&&<svg width="11" height="11" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>}
              </div>
              <span style={{fontSize:14,color:'#374151',lineHeight:1.6}}>
                Oxumuşam <a href="#" style={{color:TEAL,textDecoration:'underline'}}>Fərdi Məlumatların Mühafizəsi Qanununa uyğun müvafiq məlumat</a> və şəxsi məlumatlarımın işlənməsini qəbul etdim.
              </span>
            </div>

            <button onClick={handleStep1} disabled={loading||!agreed} style={{width:'100%',height:52,background:(!agreed||loading)?'#b0cfe0':TEAL,color:'white',border:'none',borderRadius:6,fontSize:16,fontWeight:700,cursor:(!agreed||loading)?'not-allowed':'pointer',fontFamily:FONT}}>
              {loading?'Yüklənir...':'Taqdim etmək'}
            </button>
          </>}

          {/* STEP 2 */}
          {step===2 && <>
            <h2 style={{fontSize:28,fontWeight:600,color:TEAL,marginBottom:32,fontFamily:"'Raleway',sans-serif"}}>Randevu Detalları</h2>

            <div style={F.wrap}>
              <span style={F.lbl}>Şöbə</span>
              <select value={selectedDept} onChange={e=>{setSelectedDept(e.target.value);setSelectedDoctor('');setSlots([])}} style={F.inp}>
                <option value=''>Şöbə seçin</option>
                {departments.map(d=><option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>

            <div style={F.wrap}>
              <span style={F.lbl}>Həkim</span>
              <select value={selectedDoctor} onChange={e=>{setSelectedDoctor(e.target.value);setSelectedSlot('')}} style={F.inp}>
                <option value=''>Həkim seçin</option>
                {doctors.map(d=><option key={d._id} value={d._id}>{d.userId?.fullName||d.fullName}</option>)}
              </select>
            </div>

            <div style={F.wrap}>
              <span style={F.lbl}>Tarix</span>
              <input type="date" value={selectedDate} onChange={e=>{setSelectedDate(e.target.value);setSelectedSlot('')}} min={new Date().toISOString().split('T')[0]} style={F.inp}/>
            </div>

            {selectedDoctor&&selectedDate&&(
              <div style={{marginBottom:20}}>
                <div style={{fontSize:13,fontWeight:600,color:TEAL,marginBottom:10}}>Vaxt seçin</div>
                {slots.length===0
                  ? <p style={{fontSize:14,color:'#94a3b8'}}>Bu tarix üçün boş vaxt yoxdur</p>
                  : <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
                      {slots.map(s=>(
                        <button key={s} onClick={()=>setSelectedSlot(s)} style={{padding:'8px 4px',border:`1.5px solid ${TEAL}`,borderRadius:20,fontSize:13,background:selectedSlot===s?TEAL:'white',color:selectedSlot===s?'white':TEAL,cursor:'pointer',fontFamily:FONT,fontWeight:500}}>
                          {s}
                        </button>
                      ))}
                    </div>
                }
              </div>
            )}

            <div style={F.wrap}>
              <span style={F.lbl}>Qeyd (ixtiyari)</span>
              <textarea value={note} onChange={e=>setNote(e.target.value)} rows={3} style={{...F.inp,resize:'vertical'}}/>
            </div>

            <button onClick={handleStep2} disabled={loading||!selectedDoctor||!selectedDate||!selectedSlot} style={{width:'100%',height:52,background:(loading||!selectedDoctor||!selectedDate||!selectedSlot)?'#b0cfe0':TEAL,color:'white',border:'none',borderRadius:6,fontSize:16,fontWeight:700,cursor:'pointer',fontFamily:FONT}}>
              {loading?'Yüklənir...':'Davam et'}
            </button>
          </>}

          {/* STEP 3 */}
          {step===3 && (
            <div style={{textAlign:'center'}}>
              <div style={{width:72,height:72,borderRadius:'50%',background:TEAL,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 24px'}}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h2 style={{fontSize:24,fontWeight:700,color:TEAL,marginBottom:8}}>Randevunuz təsdiqləndi!</h2>
              <p style={{color:'#64748b',marginBottom:28}}>Randevunuz uğurla qeydiyyata alındı</p>
              {appointment&&(
                <div style={{border:'1px solid #e2e8f0',borderRadius:10,padding:24,textAlign:'left',marginBottom:28}}>
                  {[
                    ['Həkim', appointment.doctorId?.userId?.fullName||'—'],
                    ['Şöbə', appointment.departmentId?.name||'—'],
                    ['Tarix', new Date(appointment.date).toLocaleDateString('az-AZ')],
                    ['Vaxt', appointment.timeSlot],
                    ['Randevu №', appointment._id?.slice(0,8).toUpperCase()],
                  ].map(([k,v],i,arr)=>(
                    <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:i<arr.length-1?'1px solid #f1f5f9':'none'}}>
                      <span style={{fontSize:13,color:'#94a3b8'}}>{k}</span>
                      <span style={{fontSize:14,fontWeight:600,color:'#0f172a'}}>{v}</span>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={()=>navigate('/')} style={{width:'100%',height:52,background:TEAL,color:'white',border:'none',borderRadius:6,fontSize:16,fontWeight:700,cursor:'pointer',fontFamily:FONT}}>
                Ana səhifəyə qayıt
              </button>
            </div>
          )}
        </div>
      </div>

      {/* WHATSAPP */}
      <a href="https://wa.me" target="_blank" rel="noreferrer" style={{position:'fixed',bottom:24,right:24,width:52,height:52,borderRadius:'50%',background:'#25d366',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 16px rgba(37,211,102,0.4)',zIndex:999}}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L.057 23.885a.5.5 0 00.606.61l6.198-1.63A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.894a9.88 9.88 0 01-5.031-1.373l-.361-.214-3.736.983.999-3.648-.235-.374A9.865 9.865 0 012.106 12C2.106 6.53 6.53 2.106 12 2.106S21.894 6.53 21.894 12 17.47 21.894 12 21.894z"/></svg>
      </a>

      <style>{`select,input,textarea{transition:border-color 0.15s,box-shadow 0.15s}select:focus,input:focus,textarea:focus{border-color:${TEAL}!important;box-shadow:0 0 0 3px rgba(43,142,197,0.12)!important;outline:none}`}</style>
    </div>
  )
}
