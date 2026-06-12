/* eslint-disable */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../../api/axios';

const FONT = "'Source Sans 3', 'Raleway', sans-serif";
const TEAL = '#00848e';

const inputBase = {
  width:'100%', padding:'13px 16px',
  border:'1.5px solid #e2e8f0', borderRadius:'10px',
  fontSize:'15px', fontFamily:FONT, color:'#1a2b4a',
  background:'#fff', outline:'none', boxSizing:'border-box',
  transition:'border-color 0.18s, box-shadow 0.18s',
};

function focusIn(e) { e.target.style.borderColor=TEAL; e.target.style.boxShadow='0 0 0 3px rgba(0,132,142,0.1)'; }
function focusOut(e) { e.target.style.borderColor='#e2e8f0'; e.target.style.boxShadow='none'; }

export default function ForgotPassword() {
  const navigate  = useNavigate();
  const [step, setStep]         = useState(1); // 1 = email, 2 = otp+newpass
  const [email, setEmail]       = useState('');
  const [otp, setOtp]           = useState('');
  const [newPass, setNewPass]   = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);

  const sendOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) { toast.warning('E-poçt ünvanını daxil edin.'); return; }
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
      toast.success('OTP kodu e-poçtunuza göndərildi.');
      setStep(2);
    } catch {
      toast.error('Bu e-poçtla hesab tapılmadı.');
    } finally { setLoading(false); }
  };

  const resetPass = async (e) => {
    e.preventDefault();
    if (!otp.trim() || !newPass.trim()) { toast.warning('Bütün sahələri doldurun.'); return; }
    if (newPass.length < 6) { toast.warning('Şifrə ən az 6 simvol olmalıdır.'); return; }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email: email.trim(), otp: otp.trim(), newPassword: newPass });
      toast.success('Şifrə uğurla yeniləndi!');
      navigate('/login');
    } catch (err) {
      const msg = err?.response?.data?.message || '';
      if (msg.toLowerCase().includes('otp')) toast.error('OTP kodu yanlışdır və ya müddəti bitib.');
      else toast.error('Xəta baş verdi. Yenidən cəhd edin.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', background:'#f0f4f8', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 16px', fontFamily:FONT }}>
      <div style={{ width:'100%', maxWidth:'420px' }}>

        <div style={{ textAlign:'center', marginBottom:'32px' }}>
          <img src="/logonew.jpg" alt="Aslan Medical" style={{ height: '72px', maxWidth: '260px', width: 'auto', objectFit: 'contain' }} onError={e => e.currentTarget.style.display='none'} />
        </div>

        <div style={{ background:'#fff', borderRadius:'20px', padding:'40px 36px', boxShadow:'0 4px 32px rgba(0,0,0,0.08)' }}>

          <button onClick={() => step === 2 ? setStep(1) : navigate('/login')}
            style={{ display:'flex', alignItems:'center', gap:'6px', background:'none', border:'none', cursor:'pointer', color:'#718096', fontSize:'13px', fontFamily:FONT, marginBottom:'24px', padding:0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            {step === 2 ? 'Geri qayıt' : 'Girişə qayıt'}
          </button>

          {step === 1 ? (
            <>
              <h2 style={{ fontSize:'24px', fontWeight:700, color:'#1a2b4a', margin:'0 0 6px', fontFamily:FONT }}>Şifrəni Bərpa Et</h2>
              <p style={{ fontSize:'14px', color:'#718096', margin:'0 0 28px', fontFamily:FONT }}>
                Qeydiyyatda olan e-poçtunuzu daxil edin, OTP kodu göndərək.
              </p>
              <form onSubmit={sendOtp}>
                <div style={{ marginBottom:'20px' }}>
                  <label style={{ display:'block', fontSize:'13px', fontWeight:600, color:'#4a5568', marginBottom:'6px', fontFamily:FONT }}>E-poçt ünvanı</label>
                  <input type="email" placeholder="siz@example.com" value={email} onChange={e => setEmail(e.target.value)} style={inputBase} onFocus={focusIn} onBlur={focusOut} autoComplete="email" />
                </div>
                <button type="submit" disabled={loading} style={{ width:'100%', padding:'14px', background: loading ? '#7ec8cc' : TEAL, color:'#fff', border:'none', borderRadius:'10px', fontSize:'16px', fontWeight:700, fontFamily:FONT, cursor: loading ? 'not-allowed' : 'pointer' }}>
                  {loading ? 'Göndərilir…' : 'OTP Göndər'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 style={{ fontSize:'24px', fontWeight:700, color:'#1a2b4a', margin:'0 0 6px', fontFamily:FONT }}>Yeni Şifrə</h2>
              <p style={{ fontSize:'14px', color:'#718096', margin:'0 0 28px', fontFamily:FONT }}>
                <strong>{email}</strong> ünvanına göndərilən OTP kodu ilə yeni şifrənizi təyin edin.
              </p>
              <form onSubmit={resetPass}>
                <div style={{ marginBottom:'14px' }}>
                  <label style={{ display:'block', fontSize:'13px', fontWeight:600, color:'#4a5568', marginBottom:'6px', fontFamily:FONT }}>OTP Kodu (6 rəqəm)</label>
                  <input type="text" placeholder="123456" maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g,''))} style={{ ...inputBase, textAlign:'center', letterSpacing:'6px', fontSize:'20px', fontWeight:700 }} onFocus={focusIn} onBlur={focusOut} />
                </div>
                <div style={{ marginBottom:'24px' }}>
                  <label style={{ display:'block', fontSize:'13px', fontWeight:600, color:'#4a5568', marginBottom:'6px', fontFamily:FONT }}>Yeni Şifrə</label>
                  <div style={{ position:'relative' }}>
                    <input type={showPass ? 'text' : 'password'} placeholder="Ən az 6 simvol" value={newPass} onChange={e => setNewPass(e.target.value)} style={{ ...inputBase, paddingRight:'46px' }} onFocus={focusIn} onBlur={focusOut} />
                    <button type="button" onClick={() => setShowPass(v => !v)} style={{ position:'absolute', right:'13px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#a0aec0', lineHeight:0, padding:0 }}>
                      {showPass
                        ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading} style={{ width:'100%', padding:'14px', background: loading ? '#7ec8cc' : TEAL, color:'#fff', border:'none', borderRadius:'10px', fontSize:'16px', fontWeight:700, fontFamily:FONT, cursor: loading ? 'not-allowed' : 'pointer' }}>
                  {loading ? 'Yüklənir…' : 'Şifrəni Yenilə'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
