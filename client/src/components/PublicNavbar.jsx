import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'rgba(5,12,23,0.95)' : 'transparent',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(0,188,212,0.15)' : 'none',
      transition: 'all .3s ease',
      padding: '0 48px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      height: 64,
    }}>
      <Link to="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none' }}>
        <svg width="32" height="32" viewBox="0 0 56 56" fill="none">
          <rect x="2" y="2" width="52" height="52" rx="14" fill="rgba(255,255,255,0.08)"/>
          <rect x="24" y="12" width="8" height="32" rx="2" fill="#fff"/>
          <rect x="12" y="24" width="32" height="8" rx="2" fill="#fff"/>
          <path d="M6 40 L16 40 L20 28 L26 48 L33 18 L37 40 L50 40" stroke="#00BCD4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
        <span style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:800, color:'#fff' }}>
          Elmir<span style={{ color:'#00BCD4' }}>Med</span>
        </span>
      </Link>

      <div style={{ display:'flex', alignItems:'center', gap:32 }}>
        {[
          ['/', 'Ana Səhifə'],
          ['/sobeler', 'Şöbələr'],
          ['/hekimler', 'Həkimlər'],
          ['/haqqimizda', 'Haqqımızda'],
          ['/elaqe', 'Əlaqə'],
        ].map(([to, label]) => (
          <Link key={to} to={to} style={{
            color: location.pathname === to ? '#00BCD4' : 'rgba(255,255,255,0.75)',
            textDecoration: 'none', fontSize: 14, fontWeight: 500,
            transition: 'color .2s',
          }}>{label}</Link>
        ))}
      </div>

      <div style={{ display:'flex', gap:10 }}>
        <a href="tel:112" style={{
          display:'flex', alignItems:'center', gap:6, padding:'8px 14px',
          background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.4)',
          borderRadius:8, color:'#FCA5A5', fontSize:13, fontWeight:600, textDecoration:'none',
          transition:'all .2s',
        }}>🚨 112</a>
        <Link to="/randevu" style={{
          padding:'8px 18px', background:'#00BCD4', borderRadius:8,
          color:'#fff', fontSize:13, fontWeight:600, textDecoration:'none',
        }}>Randevu Al</Link>
        <Link to="/login" style={{
          padding:'8px 18px', background:'rgba(255,255,255,0.08)',
          border:'1px solid rgba(255,255,255,0.15)', borderRadius:8,
          color:'#fff', fontSize:13, fontWeight:600, textDecoration:'none',
        }}>Daxil ol</Link>
      </div>
    </nav>
  );
}
