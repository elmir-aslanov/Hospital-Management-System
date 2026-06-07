import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from '../../api/axios'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  teal:       '#1D8B95',
  tealHov:    '#0E8F96',
  tealLight:  '#E6F7F8',
  tealBorder: '#A8D8DC',
  navy:       '#0B1D34',
  bg:         '#F8FAFC',
  card:       '#FFFFFF',
  border:     '#E2E8F0',
  muted:      '#64748B',
  errorBg:    '#FEF2F2',
  errorBdr:   '#FECACA',
  errorTxt:   '#DC2626',
  okBg:       '#F0FDF4',
  okBdr:      '#86EFAC',
  okTxt:      '#15803D',
  font:       "'Source Sans 3', sans-serif",
}

const MONTHS   = ['Yanvar','Fevral','Mart','Aprel','May','İyun','İyul','Avqust','Sentyabr','Oktyabr','Noyabr','Dekabr']
const DAYS     = Array.from({ length: 31 }, (_, i) => i + 1)
const YEARS    = Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - i)
const COUNTRIES = ['Azərbaycan','Türkiyə','Rusiya','Gürcüstan','Digər']
const STEPS    = ['Pasiyent məlumatları', 'Randevu detalları', 'Təsdiq']

// ── Shared UI helpers ─────────────────────────────────────────────────────────
const inp = {
  width: '100%', padding: '11px 14px', border: `1px solid ${T.border}`, borderRadius: 8,
  fontSize: 14, color: '#1e293b', outline: 'none', fontFamily: T.font,
  boxSizing: 'border-box', background: T.card, transition: 'border-color .15s, box-shadow .15s',
}

function Err({ msg }) {
  if (!msg) return null
  return (
    <div style={{ background: T.errorBg, border: `1px solid ${T.errorBdr}`, borderRadius: 8,
      padding: '10px 14px', color: T.errorTxt, fontSize: 13, marginBottom: 18, lineHeight: 1.5 }}>
      {msg}
    </div>
  )
}

function Ok({ msg }) {
  if (!msg) return null
  return (
    <div style={{ background: T.okBg, border: `1px solid ${T.okBdr}`, borderRadius: 8,
      padding: '10px 14px', color: T.okTxt, fontSize: 13, marginBottom: 18,
      display: 'flex', alignItems: 'center', gap: 8 }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
      {msg}
    </div>
  )
}

function Field({ label, helper, required, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#344054',
        marginBottom: 5, fontFamily: T.font }}>
        {label}{required && <span style={{ color: T.errorTxt, marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {helper && <p style={{ margin: '4px 0 0', fontSize: 12, color: T.muted }}>{helper}</p>}
    </div>
  )
}

function PrimaryBtn({ onClick, disabled, loading, children, style = {} }) {
  return (
    <button onClick={onClick} disabled={disabled || loading} style={{
      padding: '12px 24px', background: T.teal, color: 'white', border: 'none',
      borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: disabled || loading ? 'not-allowed' : 'pointer',
      fontFamily: T.font, opacity: disabled && !loading ? 0.6 : 1, transition: 'background .2s', ...style,
    }}
      onMouseEnter={e => { if (!disabled && !loading) e.currentTarget.style.background = T.tealHov }}
      onMouseLeave={e => { if (!disabled && !loading) e.currentTarget.style.background = T.teal }}>
      {loading ? 'Yüklənir...' : children}
    </button>
  )
}

function GhostBtn({ onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: '12px 24px', background: 'white', color: T.navy,
      border: `1.5px solid ${T.border}`, borderRadius: 8, fontSize: 14,
      fontWeight: 600, cursor: 'pointer', fontFamily: T.font, transition: 'border-color .15s',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = T.teal}
      onMouseLeave={e => e.currentTarget.style.borderColor = T.border}>
      ← Geri
    </button>
  )
}

// ── Stepper (renders at top of card, inside card) ─────────────────────────────
function Stepper({ step }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '22px 24px', background: T.bg, borderBottom: `1px solid ${T.border}`,
      borderRadius: '20px 20px 0 0', gap: 0 }}>
      {STEPS.map((label, i) => {
        const num    = i + 1
        const active = step === num
        const done   = step > num
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
                background: active || done ? T.teal : 'white',
                color: active || done ? 'white' : '#94a3b8',
                border: `2px solid ${active || done ? T.teal : T.border}`,
                transition: 'all .2s',
              }}>
                {done
                  ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  : num}
              </div>
              <span style={{ fontSize: 11, fontWeight: active ? 700 : 400,
                color: active ? T.teal : done ? T.teal : T.muted,
                whiteSpace: 'nowrap', fontFamily: T.font }}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ width: 60, height: 2, margin: '0 6px', marginBottom: 20,
                background: step > i + 1 ? T.teal : T.border, transition: 'background .3s' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Patient type selector card ─────────────────────────────────────────────────
function TypeCard({ active, onClick, icon, title, desc }) {
  return (
    <div onClick={onClick} style={{
      flex: 1, padding: '16px 18px', border: `2px solid ${active ? T.teal : T.border}`,
      borderRadius: 12, background: active ? T.tealLight : 'white',
      cursor: 'pointer', transition: 'all .2s', display: 'flex', alignItems: 'flex-start',
      gap: 12,
    }}>
      <div style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0,
        background: active ? T.teal : '#f1f5f9', display: 'flex',
        alignItems: 'center', justifyContent: 'center', transition: 'background .2s' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke={active ? 'white' : T.muted} strokeWidth="2" strokeLinecap="round">
          {icon}
        </svg>
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 700,
          color: active ? T.teal : T.navy, fontFamily: T.font }}>
          {title}
        </p>
        <p style={{ margin: '2px 0 0', fontSize: 12, color: T.muted }}>{desc}</p>
      </div>
    </div>
  )
}

// ── Summary row ───────────────────────────────────────────────────────────────
function SRow({ label, value, last }) {
  if (!value || value === '—') return null
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      padding: '11px 0', borderBottom: last ? 'none' : `1px solid ${T.border}`, gap: 16 }}>
      <span style={{ fontSize: 13, color: T.muted, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: T.navy, textAlign: 'right' }}>{value}</span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function RandevuPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const [step,        setStep]        = useState(1)
  const [patientType, setPatientType] = useState('existing') // 'existing' | 'new'
  const [error,       setError]       = useState('')
  const [loading,     setLoading]     = useState(false)
  const [result,      setResult]      = useState(null)

  // ── Step 1 — common ────────────────────────────────────────────────────────
  const [country,    setCountry]    = useState('Azərbaycan')
  const [agreed,     setAgreed]     = useState(false)
  const [birthDay,   setBirthDay]   = useState('')
  const [birthMonth, setBirthMonth] = useState('')
  const [birthYear,  setBirthYear]  = useState('')

  // existing patient
  const [patientStr, setPatientStr] = useState('')
  const [patient,    setPatient]    = useState(null) // resolved from API

  // new patient
  const [firstName,  setFirstName]  = useState('')
  const [lastName,   setLastName]   = useState('')
  const [fatherName, setFatherName] = useState('')
  const [phone,      setPhone]      = useState('')
  const [email,      setEmail]      = useState('')
  const [fin,        setFin]        = useState('')

  // ── Step 2 ────────────────────────────────────────────────────────────────
  const [departments, setDepartments] = useState([])
  const [doctors,     setDoctors]     = useState([])
  const [slots,       setSlots]       = useState([])
  const [selDept,     setSelDept]     = useState('')
  const [selDoctor,   setSelDoctor]   = useState(params.get('doctorId') || '')
  const [selDate,     setSelDate]     = useState('')
  const [selSlot,     setSelSlot]     = useState('')
  const [note,        setNote]        = useState('')
  const [loadDept,    setLoadDept]    = useState(false)
  const [loadDoc,     setLoadDoc]     = useState(false)
  const [loadSlot,    setLoadSlot]    = useState(false)
  // Increment to force a slot re-fetch (used after 409 double-booking race condition)
  const [slotTick,    setSlotTick]    = useState(0)

  // ── Load departments when Step 2 mounts ──────────────────────────────────
  useEffect(() => {
    if (step !== 2) return
    setLoadDept(true)
    axios.get('/departments')
      .then(r => setDepartments(r.data.data || []))
      .catch(() => setError('Şöbələr yüklənmədi. Yenidən cəhd edin.'))
      .finally(() => setLoadDept(false))
  }, [step])

  // ── Doctors by department ─────────────────────────────────────────────────
  useEffect(() => {
    if (!selDept) { setDoctors([]); setSelDoctor(''); setSelDate(''); setSlots([]); setSelSlot(''); return }
    setLoadDoc(true)
    axios.get(`/doctors/by-department/${selDept}`)
      .then(r => setDoctors(r.data.data || []))
      .catch(() => setError('Həkimlər yüklənmədi. Yenidən cəhd edin.'))
      .finally(() => setLoadDoc(false))
  }, [selDept])

  // ── Available slots ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!selDoctor || !selDate) { setSlots([]); setSelSlot(''); return }
    setLoadSlot(true)
    setSlots([])
    setSelSlot('')
    // date input[type=date] always yields YYYY-MM-DD — safe to send directly
    axios.get('/appointments/slots', { params: { doctorId: selDoctor, date: selDate } })
      .then(r => {
        const data = r.data?.data
        if (!data || data.available === false) { setSlots([]); return }
        setSlots(Array.isArray(data.slots) ? data.slots : [])
      })
      .catch(() => {
        setSlots([])
        setError('Boş saatlar yüklənmədi. Yenidən cəhd edin.')
      })
      .finally(() => setLoadSlot(false))
  }, [selDoctor, selDate, slotTick])

  // ── Birth date string ─────────────────────────────────────────────────────
  const birthDateStr = birthYear && birthMonth && birthDay
    ? `${birthYear}-${String(MONTHS.indexOf(birthMonth) + 1).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`
    : ''

  // ── Validate email format ─────────────────────────────────────────────────
  const emailValid = (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

  // ── STEP 1 handler ────────────────────────────────────────────────────────
  const handleStep1 = async () => {
    setError('')

    if (!country) return setError('Ölkə seçilməlidir')
    if (!birthDateStr) return setError('Doğum tarixi seçilməlidir')
    if (!agreed)  return setError('Şəxsi məlumatların emalına razılıq verilməlidir')

    if (patientType === 'existing') {
      if (!patientStr.trim()) return setError('Pasiyent ID daxil edilməlidir')
      setLoading(true)
      try {
        const r = await axios.get('/patients/search-public', {
          params: { patientId: patientStr.trim().toUpperCase(), birthDate: birthDateStr },
        })
        setPatient(r.data.data)
        setStep(2)
      } catch (e) {
        const s = e.response?.status
        if (s === 404) {
          setError("Pasiyent məlumatı tapılmadı. Məlumatları yoxlayın və ya 'Yeni pasiyentəm' seçimi ilə davam edin.")
        } else if (s === 401) {
          setError('Doğum tarixi uyğun gəlmir. Məlumatları yoxlayın.')
        } else {
          setError(e.response?.data?.message || 'Pasiyent məlumatı yoxlanılarkən xəta baş verdi.')
        }
      } finally {
        setLoading(false)
      }
    } else {
      // New patient — validate locally, don't create yet
      if (!firstName.trim()) return setError('Ad daxil edilməlidir')
      if (!lastName.trim())  return setError('Soyad daxil edilməlidir')
      if (!phone.trim())     return setError('Telefon nömrəsi daxil edilməlidir')
      if (!emailValid(email)) return setError('E-poçt formatı düzgün deyil')
      setStep(2)
    }
  }

  // ── STEP 2 handler ────────────────────────────────────────────────────────
  const handleStep2 = () => {
    setError('')
    if (!selDept)   return setError('Şöbə seçilməlidir')
    if (!selDoctor) return setError('Həkim seçilməlidir')
    if (!selDate)   return setError('Tarix seçilməlidir')
    if (!selSlot)   return setError('Saat seçilməlidir')
    setStep(3)
  }

  // ── STEP 3 — create appointment ───────────────────────────────────────────
  const handleConfirm = async () => {
    setError('')
    setLoading(true)
    try {
      const payload = {
        patientType,
        doctorId:  selDoctor,
        date:      selDate,
        startTime: selSlot,
        reason:    note?.trim() || 'Onlayn randevu',
        notes:     note?.trim(),
      }

      if (patientType === 'existing') {
        payload.patientStrId = patientStr.trim().toUpperCase()
      } else {
        payload.patient = {
          firstName, lastName, fatherName, phone, email, fin,
          birthDate: birthDateStr, country,
        }
      }

      const r = await axios.post('/appointments/public', payload)
      setResult(r.data.data)
    } catch (e) {
      const s = e.response?.status
      const m = e.response?.data?.message
      if (s === 409) {
        // Race condition: slot was booked after user selected it → go back to Step 2
        setSelSlot('')
        setSlotTick(prev => prev + 1)   // forces slot useEffect to re-run
        setStep(2)
        setError('Bu saat artıq tutulub. Zəhmət olmasa başqa saat seçin.')
      } else if (s >= 500) {
        setError('Server xətası baş verdi. Yenidən cəhd edin.')
      } else {
        setError(m || 'Randevu yaradılarkən xəta baş verdi.')
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Derived labels ────────────────────────────────────────────────────────
  const deptLabel   = departments.find(d => d._id === selDept)?.name || '—'
  const doctorObj   = doctors.find(d => d._id === selDoctor)
  const doctorLabel = doctorObj?.userId?.fullName || doctorObj?.fullName
    ? `Dr. ${doctorObj?.userId?.fullName || doctorObj?.fullName}` : '—'

  const resetAll = () => {
    setStep(1); setPatientType('existing'); setError('')
    setCountry('Azərbaycan'); setAgreed(false)
    setBirthDay(''); setBirthMonth(''); setBirthYear('')
    setPatientStr(''); setPatient(null)
    setFirstName(''); setLastName(''); setFatherName('')
    setPhone(''); setEmail(''); setFin('')
    setSelDept(''); setSelDoctor(''); setSelDate(''); setSelSlot(''); setNote('')
    setSlotTick(0); setResult(null)
  }

  // ── SUCCESS SCREEN ────────────────────────────────────────────────────────
  if (result) return (
    <>
      <Navbar />
      <div style={{ minHeight: '100vh', background: T.bg, fontFamily: T.font,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
        <div style={{ maxWidth: 500, width: '100%', background: T.card, borderRadius: 20,
          border: `1px solid ${T.border}`, boxShadow: '0 8px 32px rgba(15,23,42,0.08)',
          padding: '48px 40px', textAlign: 'center' }}>

          <div style={{ width: 68, height: 68, borderRadius: '50%', background: T.okBg,
            border: `2px solid ${T.okBdr}`, display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={T.okTxt}
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: T.navy, margin: '0 0 6px' }}>
            Randevunuz uğurla yaradıldı!
          </h2>
          <p style={{ color: T.muted, fontSize: 13, margin: '0 0 28px' }}>
            Aşağıdakı məlumatları yadda saxlayın.
          </p>

          <div style={{ background: T.bg, borderRadius: 12, padding: '4px 20px',
            border: `1px solid ${T.border}`, textAlign: 'left', marginBottom: 28 }}>
            <SRow label="Randevu №"   value={result.appointmentNumber} />
            <SRow label="Tarix"       value={result.date ? new Date(result.date).toLocaleDateString('az-AZ') : '—'} />
            <SRow label="Saat"        value={result.time} />
            <SRow label="Həkim"       value={result.doctorName} />
            <SRow label="Şöbə"        value={result.departmentName} last />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <PrimaryBtn onClick={resetAll} style={{ width: '100%' }}>
              Yeni randevu yarat
            </PrimaryBtn>
            <button onClick={() => navigate('/')} style={{
              padding: '12px 0', background: 'white', color: T.navy,
              border: `1.5px solid ${T.border}`, borderRadius: 8, fontSize: 14,
              fontWeight: 600, cursor: 'pointer', fontFamily: T.font, width: '100%',
            }}>
              Ana səhifəyə qayıt
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )

  // ── MAIN LAYOUT ───────────────────────────────────────────────────────────
  return (
    <>
      <Navbar />
      <div style={{ minHeight: '100vh', background: T.bg, fontFamily: T.font,
        padding: '32px 16px 60px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ background: T.card, borderRadius: 20, border: `1px solid ${T.border}`,
            boxShadow: '0 8px 24px rgba(15,23,42,0.06)' }}>

            {/* Stepper lives at top of card */}
            <Stepper step={step} />

            {/* Form body */}
            <div style={{ padding: '36px 44px' }}>
              <Err msg={error} />

              {/* ══════════════════════ STEP 1 ══════════════════════ */}
              {step === 1 && (
                <>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: T.navy,
                    margin: '0 0 4px', fontFamily: T.font }}>
                    Pasiyent məlumatları
                  </h2>
                  <p style={{ color: T.muted, fontSize: 13, margin: '0 0 24px' }}>
                    Randevuya davam etmək üçün məlumatlarınızı daxil edin.
                  </p>

                  {/* Patient type selector */}
                  <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
                    <TypeCard
                      active={patientType === 'existing'}
                      onClick={() => { setPatientType('existing'); setError('') }}
                      icon={<><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></>}
                      title="Mövcud pasiyentəm"
                      desc="Pasiyent ID ilə davam edin"
                    />
                    <TypeCard
                      active={patientType === 'new'}
                      onClick={() => { setPatientType('new'); setError('') }}
                      icon={<><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/><line x1="18" y1="3" x2="18" y2="9"/><line x1="15" y1="6" x2="21" y2="6"/></>}
                      title="Yeni pasiyentəm"
                      desc="İlk dəfə müraciət edirəm"
                    />
                  </div>

                  {/* ─── EXISTING PATIENT FORM ─── */}
                  {patientType === 'existing' && (
                    <>
                      <Field label="Ölkə" required>
                        <select value={country} onChange={e => setCountry(e.target.value)} style={inp}>
                          {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </Field>

                      <Field label="Pasiyent ID / Qəbul kartı nömrəsi" required
                        helper="Qəbul kartında göstərilən nömrə (məs: P-XXXXXX)">
                        <input value={patientStr}
                          onChange={e => setPatientStr(e.target.value.toUpperCase())}
                          placeholder="P-XXXXXX" maxLength={10} style={inp} />
                      </Field>

                      <Field label="Doğum tarixi" required>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr', gap: 10 }}>
                          <select value={birthDay} onChange={e => setBirthDay(e.target.value)} style={inp}>
                            <option value="">Gün</option>
                            {DAYS.map(d => <option key={d}>{d}</option>)}
                          </select>
                          <select value={birthMonth} onChange={e => setBirthMonth(e.target.value)} style={inp}>
                            <option value="">Ay</option>
                            {MONTHS.map(m => <option key={m}>{m}</option>)}
                          </select>
                          <select value={birthYear} onChange={e => setBirthYear(e.target.value)} style={inp}>
                            <option value="">İl</option>
                            {YEARS.map(y => <option key={y}>{y}</option>)}
                          </select>
                        </div>
                      </Field>
                    </>
                  )}

                  {/* ─── NEW PATIENT FORM ─── */}
                  {patientType === 'new' && (
                    <>
                      <Field label="Ölkə" required>
                        <select value={country} onChange={e => setCountry(e.target.value)} style={inp}>
                          {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </Field>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <Field label="Ad" required>
                          <input value={firstName} onChange={e => setFirstName(e.target.value)}
                            placeholder="Adınız" style={inp} />
                        </Field>
                        <Field label="Soyad" required>
                          <input value={lastName} onChange={e => setLastName(e.target.value)}
                            placeholder="Soyadınız" style={inp} />
                        </Field>
                      </div>

                      <Field label="Ata adı">
                        <input value={fatherName} onChange={e => setFatherName(e.target.value)}
                          placeholder="Ata adı" style={inp} />
                      </Field>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <Field label="Telefon" required>
                          <input value={phone} onChange={e => setPhone(e.target.value)}
                            placeholder="+994 XX XXX XX XX" style={inp} />
                        </Field>
                        <Field label="E-poçt">
                          <input value={email} onChange={e => setEmail(e.target.value)}
                            placeholder="email@nümunə.az" type="email" style={inp} />
                        </Field>
                      </div>

                      <Field label="FİN kod" helper="İxtiyaridir">
                        <input value={fin} onChange={e => setFin(e.target.value.toUpperCase())}
                          placeholder="XXXXXXX" maxLength={7} style={inp} />
                      </Field>

                      <Field label="Doğum tarixi" required>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr', gap: 10 }}>
                          <select value={birthDay} onChange={e => setBirthDay(e.target.value)} style={inp}>
                            <option value="">Gün</option>
                            {DAYS.map(d => <option key={d}>{d}</option>)}
                          </select>
                          <select value={birthMonth} onChange={e => setBirthMonth(e.target.value)} style={inp}>
                            <option value="">Ay</option>
                            {MONTHS.map(m => <option key={m}>{m}</option>)}
                          </select>
                          <select value={birthYear} onChange={e => setBirthYear(e.target.value)} style={inp}>
                            <option value="">İl</option>
                            {YEARS.map(y => <option key={y}>{y}</option>)}
                          </select>
                        </div>
                      </Field>
                    </>
                  )}

                  {/* Consent */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, margin: '20px 0 24px' }}>
                    <input type="checkbox" checked={agreed}
                      onChange={e => setAgreed(e.target.checked)}
                      style={{ width: 15, height: 15, accentColor: T.teal,
                        cursor: 'pointer', flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.7 }}>
                      Şəxsi məlumatlarımın emal edilməsinə razılıq verirəm.{' '}
                      <a href="#" style={{ color: T.teal, textDecoration: 'underline' }}>
                        Fərdi Məlumatların Mühafizəsi Qanunu
                      </a>
                    </span>
                  </div>

                  <PrimaryBtn onClick={handleStep1} disabled={!agreed} loading={loading}
                    style={{ width: '100%', height: 48 }}>
                    Davam et →
                  </PrimaryBtn>
                </>
              )}

              {/* ══════════════════════ STEP 2 ══════════════════════ */}
              {step === 2 && (
                <>
                  {/* Patient found banner (existing only) */}
                  {patientType === 'existing' && patient && (
                    <Ok msg={`Pasiyent tapıldı: ${patient.fullName}`} />
                  )}
                  {patientType === 'new' && (
                    <Ok msg={`Yeni pasiyent: ${firstName} ${lastName}`} />
                  )}

                  <h2 style={{ fontSize: 22, fontWeight: 800, color: T.navy,
                    margin: '0 0 4px', fontFamily: T.font }}>
                    Randevu detalları
                  </h2>
                  <p style={{ color: T.muted, fontSize: 13, margin: '0 0 24px' }}>
                    Şöbə, həkim, tarix və uyğun saatı seçin.
                  </p>

                  <Field label="Şöbə / İxtisas" required>
                    {loadDept
                      ? <p style={{ fontSize: 13, color: T.muted, margin: 0 }}>Şöbələr yüklənir...</p>
                      : (
                        <select value={selDept}
                          onChange={e => { setSelDept(e.target.value); setSelDoctor(''); setSelDate(''); setSlots([]); setSelSlot('') }}
                          style={inp}>
                          <option value="">Şöbə seçin...</option>
                          {departments.length === 0
                            ? <option disabled>Aktiv şöbə tapılmadı</option>
                            : departments.map(d => (
                                <option key={d._id} value={d._id}>{d.name}</option>
                              ))
                          }
                        </select>
                      )
                    }
                  </Field>

                  <Field label="Həkim" required>
                    {loadDoc
                      ? <p style={{ fontSize: 13, color: T.muted, margin: 0 }}>Həkimlər yüklənir...</p>
                      : (
                        <select value={selDoctor}
                          onChange={e => { setSelDoctor(e.target.value); setSelDate(''); setSlots([]); setSelSlot('') }}
                          disabled={!selDept} style={inp}>
                          <option value="">Həkim seçin...</option>
                          {doctors.map(d => (
                            <option key={d._id} value={d._id}>
                              {d.userId?.fullName || d.fullName}
                              {d.specialization ? ` — ${d.specialization}` : ''}
                            </option>
                          ))}
                        </select>
                      )
                    }
                  </Field>

                  <Field label="Tarix" required>
                    <input type="date" value={selDate}
                      onChange={e => { setSelDate(e.target.value); setSelSlot('') }}
                      min={new Date().toISOString().split('T')[0]}
                      disabled={!selDoctor} style={{ ...inp, colorScheme: 'light' }} />
                  </Field>

                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                      Mövcud saatlar <span style={{ color: '#ef4444' }}>*</span>
                    </div>

                    {!selDoctor || !selDate ? (
                      <p style={{ fontSize: 13, color: T.muted, margin: 0 }}>
                        Həkim və tarixi seçdikdən sonra saatlar görünəcək.
                      </p>
                    ) : loadSlot ? (
                      <p style={{ fontSize: 13, color: T.muted, margin: 0 }}>
                        Boş saatlar yüklənir...
                      </p>
                    ) : slots.length === 0 ? (
                      <p style={{ fontSize: 13, color: T.muted, margin: 0 }}>
                        Bu tarix üçün boş saat yoxdur.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {slots.map(s => {
                          const selected = selSlot === s.time
                          return (
                            <button
                              key={s.time}
                              onClick={() => s.available && setSelSlot(s.time)}
                              disabled={!s.available}
                              title={!s.available ? 'Bu saat artıq tutulub' : ''}
                              style={{
                                padding: '9px 16px', borderRadius: 8, fontSize: 13,
                                fontWeight: 600, fontFamily: T.font,
                                cursor: s.available ? 'pointer' : 'not-allowed',
                                border: selected
                                  ? `2px solid ${T.teal}`
                                  : s.available
                                    ? `1.5px solid #1e3a5f`
                                    : `1.5px solid ${T.border}`,
                                background: selected
                                  ? T.teal
                                  : s.available
                                    ? '#1e3a5f'
                                    : '#f8fafc',
                                color: selected || s.available ? 'white' : '#cbd5e1',
                                opacity: s.available ? 1 : 0.55,
                                transition: 'all .15s',
                              }}>
                              {s.time}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  <Field label="Qeyd / Şikayət (ixtiyari)">
                    <textarea value={note} onChange={e => setNote(e.target.value)}
                      rows={3} placeholder="Əlavə məlumat..."
                      style={{ ...inp, resize: 'vertical' }} />
                  </Field>

                  <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                    <GhostBtn onClick={() => { setStep(1); setError('') }} />
                    <PrimaryBtn
                      onClick={handleStep2}
                      disabled={!selDept || !selDoctor || !selDate || !selSlot}
                      style={{ flex: 1 }}>
                      Davam et →
                    </PrimaryBtn>
                  </div>
                </>
              )}

              {/* ══════════════════════ STEP 3 ══════════════════════ */}
              {step === 3 && (
                <>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: T.navy,
                    margin: '0 0 4px', fontFamily: T.font }}>
                    Məlumatları təsdiqləyin
                  </h2>
                  <p style={{ color: T.muted, fontSize: 13, margin: '0 0 24px' }}>
                    Randevunuzu yaratmazdan əvvəl məlumatları yoxlayın.
                  </p>

                  <div style={{ background: T.bg, borderRadius: 12,
                    border: `1px solid ${T.border}`, padding: '4px 20px', marginBottom: 28 }}>

                    {/* Existing patient summary */}
                    {patientType === 'existing' && (
                      <>
                        <SRow label="Pasiyent adı"  value={patient?.fullName} />
                        <SRow label="Pasiyent ID"   value={patientStr.toUpperCase()} />
                        <SRow label="Doğum tarixi"  value={birthDateStr ? new Date(birthDateStr).toLocaleDateString('az-AZ') : '—'} />
                      </>
                    )}

                    {/* New patient summary */}
                    {patientType === 'new' && (
                      <>
                        <SRow label="Ad Soyad"      value={`${firstName} ${lastName}`} />
                        {fatherName && <SRow label="Ata adı"   value={fatherName} />}
                        <SRow label="Telefon"       value={phone} />
                        {email && <SRow label="E-poçt"         value={email} />}
                        <SRow label="Doğum tarixi"  value={birthDateStr ? new Date(birthDateStr).toLocaleDateString('az-AZ') : '—'} />
                      </>
                    )}

                    <div style={{ borderTop: `1px solid ${T.border}`, margin: '4px 0' }} />

                    <SRow label="Şöbə"    value={deptLabel} />
                    <SRow label="Həkim"   value={doctorLabel} />
                    <SRow label="Tarix"   value={selDate ? new Date(selDate).toLocaleDateString('az-AZ') : '—'} />
                    <SRow label="Saat"    value={selSlot} />
                    {note && <SRow label="Qeyd"  value={note} last />}
                  </div>

                  <div style={{ display: 'flex', gap: 12 }}>
                    <GhostBtn onClick={() => { setStep(2); setError('') }} />
                    <PrimaryBtn onClick={handleConfirm} loading={loading} style={{ flex: 1 }}>
                      Randevunu təsdiqlə ✓
                    </PrimaryBtn>
                  </div>
                </>
              )}

            </div>{/* /form body */}
          </div>
        </div>
      </div>
      <Footer />

      <style>{`
        select:focus, input:focus, textarea:focus {
          border-color: ${T.teal} !important;
          box-shadow: 0 0 0 3px rgba(29,139,149,0.14) !important;
          outline: none;
        }
        select:disabled, input:disabled { opacity: 0.5; cursor: not-allowed; }
        @media (max-width: 600px) {
          .randevu-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  )
}
