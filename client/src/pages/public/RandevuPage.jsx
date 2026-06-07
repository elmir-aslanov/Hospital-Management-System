import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from '../../api/axios'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

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

  useEffect(()=>{ axios.get('/api/v1/departments').then(r=>setDepartments(r.data.data||[])).catch(()=>{}) },[])
  useEffect(()=>{ if(selectedDept) axios.get(`/api/v1/doctors?department=${selectedDept}`).then(r=>setDoctors(r.data.data||[])).catch(()=>{}) },[selectedDept])
  useEffect(()=>{ if(selectedDoctor&&selectedDate) axios.get(`/api/v1/appointments/slots?doctorId=${selectedDoctor}&date=${selectedDate}`).then(r=>setSlots(r.data.data||[])).catch(()=>setSlots([])) },[selectedDoctor,selectedDate])

  const handleStep1 = async () => {
    if(!fin||!birthDay||!birthMonth||!birthYear||!agreed) return setError('Bütün xanaları doldurun')
    setLoading(true); setError('')
    try {
      const bd = `${birthYear}-${String(MONTHS.indexOf(birthMonth)+1).padStart(2,'0')}-${String(birthDay).padStart(2,'0')}`
      const r = await axios.post('/api/v1/patients/search-public',{patientId:fin,birthDate:bd})
      setPatient(r.data.data)
    } catch(e){ setPatient(null) }
    finally{ setLoading(false); setStep(2) }
  }

  const handleStep2 = async () => {
    if(!selectedDoctor||!selectedDate||!selectedSlot) return setError('Bütün xanaları doldurun')
    setLoading(true); setError('')
    try {
      const r = await axios.post('/api/v1/appointments',{doctorId:selectedDoctor,departmentId:selectedDept,date:selectedDate,timeSlot:selectedSlot,note,patientFin:fin})
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

  const STEP_LABELS = ['İstifadəçi məlumatı','Randevu detalları','Tasdiq etmək']

  return (
    <div style={{fontFamily:FONT, minHeight:'100vh', background:'#f0f4f8'}}>

      {/* TOP TABS — sticky, sits right under Navbar */}
      <div style={{position:'sticky', top:0, zIndex:100, background:'white', borderBottom:'1px solid #e0eaf2', display:'flex', height:56, boxShadow:'0 1px 3px rgba(0,0,0,0.06)'}}>
        {[{k:'erandevu',label:'E-randevu'},{k:'legv',label:'Randevunu ləğv etmək'}].map(t=>(
          <button key={t.k} onClick={()=>setActiveTab(t.k)} style={{flex:1, border:'none', background:'none', cursor:'pointer', fontSize:15, fontFamily:FONT, color:activeTab===t.k?TEAL:'#888', fontWeight:activeTab===t.k?600:400, borderBottom:activeTab===t.k?`3px solid ${TEAL}`:'3px solid transparent', display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'all 0.15s'}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            {t.label}
          </button>
        ))}
      </div>

      {/* STEP BAR — sticky below tabs */}
      <div style={{position:'sticky', top:56, zIndex:99, display:'flex', background:'white', borderBottom:'1px solid #e0eaf2', boxShadow:'0 2px 4px rgba(0,0,0,0.06)'}}>
        {STEP_LABELS.map((s,i)=>{
          const active = step===i+1
          const done = step>i+1
          const isFirst = i===0
          const isLast = i===2
          const cp = isFirst
            ? 'polygon(0 0, calc(100% - 20px) 0, 100% 50%, calc(100% - 20px) 100%, 0 100%)'
            : isLast
            ? 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 20px 50%)'
            : 'polygon(0 0, calc(100% - 20px) 0, 100% 50%, calc(100% - 20px) 100%, 0 100%, 20px 50%)'
          return (
            <div key={i} style={{flex:1, height:48, display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontSize:14, fontWeight:active?600:400, color:active||done?'white':'#666', background:active||done?TEAL:'white', clipPath:cp, position:'relative', zIndex:STEP_LABELS.length-i}}>
              <div style={{width:20,height:20,borderRadius:'50%',border:`2px solid ${active||done?'white':'#aaa'}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                {active||done
                  ? <svg width="10" height="10" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
                  : <div style={{width:6,height:6,borderRadius:'50%',background:'#aaa'}}/>
                }
              </div>
              {s}
            </div>
          )
        })}
      </div>

      {/* CONTENT */}
      <div style={{padding:'40px 16px 60px'}}>
        <div style={{maxWidth:520, margin:'0 auto', background:'white', borderRadius:8, padding:'40px 40px', boxShadow:'0 2px 12px rgba(0,0,0,0.08)'}}>

          {error && <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:6,padding:'12px 16px',color:'#dc2626',fontSize:14,marginBottom:16}}>{error}</div>}

          {step===1 && <>
            <h2 style={{fontSize:26,fontWeight:600,color:TEAL,marginBottom:28,fontFamily:"'Raleway',sans-serif",marginTop:0}}>Giriş Məlumatları</h2>

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
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginTop:4}}>
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

            <div style={{display:'flex',alignItems:'flex-start',gap:10,marginBottom:24}}>
              <div onClick={()=>setAgreed(!agreed)} style={{width:18,height:18,border:`1.5px solid ${agreed?TEAL:'#94a3b8'}`,borderRadius:3,background:agreed?TEAL:'white',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,marginTop:2}}>
                {agreed&&<svg width="11" height="11" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>}
              </div>
              <span style={{fontSize:14,color:'#374151',lineHeight:1.6}}>
                Oxumuşam <a href="#" style={{color:TEAL,textDecoration:'underline'}}>Fərdi Məlumatların Mühafizəsi Qanununa uyğun müvafiq məlumat</a> və şəxsi məlumatlarımın işlənməsini qəbul etdim.
              </span>
            </div>

            <button onClick={handleStep1} disabled={loading||!agreed} style={{width:'100%',height:50,background:(!agreed||loading)?'#b0cfe0':TEAL,color:'white',border:'none',borderRadius:6,fontSize:16,fontWeight:700,cursor:(!agreed||loading)?'not-allowed':'pointer',fontFamily:FONT,transition:'background 0.2s'}}>
              {loading?'Yüklənir...':'Taqdim etmək'}
            </button>
          </>}

          {step===2 && <>
            <h2 style={{fontSize:26,fontWeight:600,color:TEAL,marginBottom:28,fontFamily:"'Raleway',sans-serif",marginTop:0}}>Randevu Detalları</h2>

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
                  ? <p style={{fontSize:14,color:'#94a3b8',margin:0}}>Bu tarix üçün boş vaxt yoxdur</p>
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

            <button onClick={handleStep2} disabled={loading||!selectedDoctor||!selectedDate||!selectedSlot} style={{width:'100%',height:50,background:(loading||!selectedDoctor||!selectedDate||!selectedSlot)?'#b0cfe0':TEAL,color:'white',border:'none',borderRadius:6,fontSize:16,fontWeight:700,cursor:'pointer',fontFamily:FONT,transition:'background 0.2s'}}>
              {loading?'Yüklənir...':'Davam et'}
            </button>
          </>}

          {step===3&&(
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
              <button onClick={()=>navigate('/')} style={{width:'100%',height:50,background:TEAL,color:'white',border:'none',borderRadius:6,fontSize:16,fontWeight:700,cursor:'pointer',fontFamily:FONT}}>
                Ana səhifəyə qayıt
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        select,input,textarea{transition:border-color 0.15s,box-shadow 0.15s}
        select:focus,input:focus,textarea:focus{border-color:${TEAL}!important;box-shadow:0 0 0 3px rgba(43,142,197,0.12)!important;outline:none}
      `}</style>
    </div>
  )
}
