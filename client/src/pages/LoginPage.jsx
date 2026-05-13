import { useState } from 'react';
import api from '../api/axios';
import Icons from '../components/Icons';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      const { accessToken, user } = res.data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.response?.data?.message || 'Giriş uğursuz oldu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{minHeight:'100vh',background:'var(--bg-sunken)',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{width:400,background:'var(--bg-surface)',borderRadius:16,padding:40,boxShadow:'0 8px 32px rgba(0,0,0,0.08)',border:'1px solid var(--border)'}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:32}}>
          <svg width="40" height="40" viewBox="0 0 56 56" fill="none">
            <rect x="2" y="2" width="52" height="52" rx="14" fill="#F8FAFC"/>
            <rect x="24" y="12" width="8" height="32" rx="2" fill="#0A1628"/>
            <rect x="12" y="24" width="32" height="8" rx="2" fill="#0A1628"/>
            <path d="M6 40 L16 40 L20 28 L26 48 L33 18 L37 40 L50 40" stroke="#00BCD4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          <div style={{fontFamily:'var(--font-display)',fontSize:24,fontWeight:800,color:'var(--em-navy-900)'}}>
            Elmir<span style={{color:'var(--em-teal-500)'}}>Med</span>
          </div>
        </div>

        <h2 style={{fontSize:20,fontWeight:700,color:'var(--em-navy-900)',marginBottom:6}}>Xoş gəldiniz</h2>
        <p style={{fontSize:13,color:'var(--fg-muted)',marginBottom:28}}>Davam etmək üçün daxil olun</p>

        <form onSubmit={handle}>
          <div style={{marginBottom:16}}>
            <label style={{fontSize:12,fontWeight:600,color:'var(--em-navy-800)',display:'block',marginBottom:6}}>E-poçt</label>
            <input
              type="email" required
              value={form.email}
              onChange={e => setForm(f => ({...f, email: e.target.value}))}
              placeholder="admin@hms.com"
              style={{width:'100%',height:44,border:'1px solid var(--border)',borderRadius:8,padding:'0 12px',fontSize:14,fontFamily:'inherit',outline:'none',boxSizing:'border-box'}}
            />
          </div>
          <div style={{marginBottom:24}}>
            <label style={{fontSize:12,fontWeight:600,color:'var(--em-navy-800)',display:'block',marginBottom:6}}>Şifrə</label>
            <input
              type="password" required
              value={form.password}
              onChange={e => setForm(f => ({...f, password: e.target.value}))}
              placeholder="••••••••"
              style={{width:'100%',height:44,border:'1px solid var(--border)',borderRadius:8,padding:'0 12px',fontSize:14,fontFamily:'inherit',outline:'none',boxSizing:'border-box'}}
            />
          </div>
          {error && (
            <div style={{background:'#FEF2F2',border:'1px solid #FECACA',borderRadius:8,padding:'10px 14px',fontSize:13,color:'#991B1B',marginBottom:16,display:'flex',gap:8,alignItems:'center'}}>
              <Icons.AlertCircle size={16}/>{error}
            </div>
          )}
          <button type="submit" disabled={loading} className="btn-primary" style={{width:'100%',height:44,fontSize:15,justifyContent:'center'}}>
            {loading ? 'Gözləyin…' : 'Daxil ol'}
          </button>
        </form>
      </div>
    </div>
  );
}
