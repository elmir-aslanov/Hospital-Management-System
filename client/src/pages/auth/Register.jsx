/* eslint-disable */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../../api/axios';

const FONT = "'Source Sans 3', 'Raleway', sans-serif";
const TEAL = '#00848e';

const inputBase = {
  width: '100%', padding: '13px 16px',
  border: '1.5px solid #e2e8f0', borderRadius: '10px',
  fontSize: '15px', fontFamily: FONT, color: '#1a2b4a',
  background: '#fff', outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.18s, box-shadow 0.18s',
};

function focusIn(e) { e.target.style.borderColor = TEAL; e.target.style.boxShadow = '0 0 0 3px rgba(0,132,142,0.1)'; }
function focusOut(e) { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { fullName, email, password } = form;
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      toast.warning('Zəhmət olmasa bütün sahələri doldurun.');
      return;
    }
    if (password.length < 6) {
      toast.warning('Şifrə ən az 6 simvol olmalıdır.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/register', { fullName, email: email.trim(), password, role: 'PATIENT' });
      toast.success('Hesab uğurla yaradıldı! Daxil olun.');
      navigate('/login');
    } catch (err) {
      const status = err?.response?.status;
      if (status === 409) toast.error('Bu e-poçt artıq qeydiyyatdan keçib.');
      else if (status === 400) toast.error(err?.response?.data?.message || 'Məlumatlar yanlışdır.');
      else toast.error('Serverlə əlaqə xətası. Bir az sonra yenidən cəhd edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr',
      overflow: 'hidden', fontFamily: FONT,
    }}>
      {/* LEFT */}
      <div style={{
        background: 'linear-gradient(145deg, #0a1628 0%, #00848e 100%)',
        padding: '48px 52px', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', position: 'relative', overflow: 'hidden',
        height: '100vh', boxSizing: 'border-box',
      }}>
        <div style={{ position:'absolute', top:'-80px', right:'-80px', width:'320px', height:'320px', borderRadius:'50%', background:'rgba(255,255,255,0.04)', pointerEvents:'none' }} />
        <div onClick={() => navigate('/')} style={{ display:'inline-flex', alignItems:'center', gap:'6px', color:'rgba(255,255,255,0.6)', fontSize:'13px', cursor:'pointer', marginBottom:'24px' }}
          onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,0.95)'}
          onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.6)'}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Ana səhifəyə qayıt
        </div>
        <img src="/logo.png" alt="Aslan Medical" style={{ height:'56px', width:'auto', filter:'brightness(10)', marginBottom:'36px', alignSelf:'flex-start' }} onError={e => e.currentTarget.style.display='none'} />
        <h1 style={{ fontSize:'38px', fontWeight:800, lineHeight:1.2, margin:'0 0 16px', fontFamily:FONT }}>
          <span style={{ color:'#fff', display:'block' }}>Bizimlə</span>
          <span style={{ color:'#4DD0E1', display:'block' }}>Qoşulun.</span>
        </h1>
        <p style={{ fontSize:'15px', color:'rgba(255,255,255,0.65)', lineHeight:1.7, maxWidth:'340px', fontFamily:FONT }}>
          Pasiyent portalına qeydiyyatdan keçərək randevu alın, tibbi qeydlərinizi izləyin.
        </p>
        <div style={{ marginTop:'auto', paddingTop:'28px' }}>
          <a href="tel:+994508363694" style={{ display:'flex', alignItems:'center', gap:'7px', color:'rgba(255,255,255,0.5)', fontSize:'13px', textDecoration:'none', fontFamily:FONT, marginBottom:'6px' }}>📞 +994 50 836 36 94</a>
          <a href="mailto:info@aslanmedical.az" style={{ display:'flex', alignItems:'center', gap:'7px', color:'rgba(255,255,255,0.5)', fontSize:'13px', textDecoration:'none', fontFamily:FONT }}>✉ info@aslanmedical.az</a>
        </div>
      </div>

      {/* RIGHT */}
      <div style={{ background:'#fff', padding:'48px 52px', display:'flex', flexDirection:'column', justifyContent:'center', overflow:'hidden', height:'100vh', boxSizing:'border-box' }}>
        <div style={{ maxWidth:'400px', width:'100%' }}>
          <img src="/logo.png" alt="" style={{ height:'44px', width:'auto', marginBottom:'20px', display:'block' }} onError={e => e.currentTarget.style.display='none'} />
          <h2 style={{ fontSize:'28px', fontWeight:800, color:'#0a1628', margin:'0 0 4px', fontFamily:FONT }}>Hesab Yaradın</h2>
          <p style={{ fontSize:'15px', color:'#718096', margin:'0 0 24px', fontFamily:FONT }}>Pasiyent portalına qeydiyyatdan keçin</p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom:'12px' }}>
              <label style={{ display:'block', fontSize:'13px', fontWeight:600, color:'#4a5568', marginBottom:'6px', fontFamily:FONT }}>Ad Soyad</label>
              <input type="text" placeholder="Adınız Soyadınız" value={form.fullName} onChange={set('fullName')} style={inputBase} onFocus={focusIn} onBlur={focusOut} autoComplete="name" />
            </div>
            <div style={{ marginBottom:'12px' }}>
              <label style={{ display:'block', fontSize:'13px', fontWeight:600, color:'#4a5568', marginBottom:'6px', fontFamily:FONT }}>E-poçt ünvanı</label>
              <input type="email" placeholder="siz@example.com" value={form.email} onChange={set('email')} style={inputBase} onFocus={focusIn} onBlur={focusOut} autoComplete="email" />
            </div>
            <div style={{ marginBottom:'20px' }}>
              <label style={{ display:'block', fontSize:'13px', fontWeight:600, color:'#4a5568', marginBottom:'6px', fontFamily:FONT }}>Şifrə</label>
              <div style={{ position:'relative' }}>
                <input type={showPass ? 'text' : 'password'} placeholder="Ən az 6 simvol" value={form.password} onChange={set('password')} style={{ ...inputBase, paddingRight:'46px' }} onFocus={focusIn} onBlur={focusOut} autoComplete="new-password" />
                <button type="button" onClick={() => setShowPass(v => !v)} style={{ position:'absolute', right:'13px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#a0aec0', lineHeight:0, padding:0 }}>
                  {showPass
                    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} style={{ width:'100%', padding:'14px', background: loading ? '#7ec8cc' : TEAL, color:'#fff', border:'none', borderRadius:'10px', fontSize:'16px', fontWeight:700, fontFamily:FONT, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 4px 14px rgba(0,132,142,0.35)' }}>
              {loading ? 'Yüklənir…' : 'Qeydiyyatdan Keç'}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:'20px', fontSize:'14px', color:'#718096', fontFamily:FONT }}>
            Artıq hesabınız var?{' '}
            <span onClick={() => navigate('/login')} style={{ color:TEAL, fontWeight:600, cursor:'pointer' }}>Daxil olun</span>
          </p>
        </div>
      </div>

      <style>{`@media(max-width:768px){div[style*="gridTemplateColumns"]{grid-template-columns:1fr!important}.login-left{display:none!important}}`}</style>
    </div>
  );
}
