import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const FONT = "'Source Sans 3', 'Raleway', sans-serif";
const TEAL = '#00848e';

const NAV_LINKS = [
  { label: 'Ana Səhifə',             href: '/',            dropdown: ['Əsas Səhifə', 'Xəbərlər'] },
  { label: 'Həkimlər',               href: '/doctors' },
  { label: 'Şöbələr',                href: '/departments', dropdown: ['Kardiologiya', 'Nevrologiya', 'Cərrahiyyə', 'Pediatriya'] },
  { label: 'Xidmətlər & Müalicələr', href: '/services',    dropdown: ['Cərrahiyyə', 'Diaqnostika', 'Laboratoriya'] },
  { label: 'Pasiyent Mərkəzi',        href: '/patients',    dropdown: ['Pasiyent Portalı', 'Tibbi Qeydlər', 'Reseptlər'] },
  { label: 'Haqqımızda & Təlim',      href: '/about',       dropdown: ['Komanda', 'Tərəfdaşlar', 'FAQ'] },
  { label: 'Bloq',                    href: '/blog',        dropdown: ['Məqalələr', 'Yeniliklər'] },
  { label: 'Əlaqə',                   href: '/contact' },
];

const TOP_LINKS    = ['Həkimlər üçün', 'Xidmətlər'];
const ACTION_PILLS = ['Həkim Tap', 'Randevu Al', 'Pasiyent Portalı'];

/* ── Inline SVG icons ─────────────────────────────────── */
const IconX = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const IconIG = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);
const IconLI = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);
const IconFB = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const IconSearch = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const SOCIALS = [
  { Icon: IconX,  label: 'Twitter',   href: 'https://twitter.com' },
  { Icon: IconIG, label: 'Instagram', href: 'https://instagram.com' },
  { Icon: IconLI, label: 'LinkedIn',  href: 'https://linkedin.com' },
  { Icon: IconFB, label: 'Facebook',  href: 'https://facebook.com' },
];

/* ── Dropdown ─────────────────────────────────────────── */
function Dropdown({ items, open }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: 0.14 }}
          style={{
            position: 'absolute',
            top: 'calc(100% + 2px)',
            left: 0,
            background: '#fff',
            borderRadius: '6px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            minWidth: '210px',
            padding: '6px 0',
            zIndex: 2000,
            borderTop: `3px solid ${TEAL}`,
          }}
        >
          {items.map((item) => (
            <a key={item} href="#"
              style={{
                display: 'block', padding: '10px 20px',
                fontSize: '14px', fontWeight: 500,
                fontFamily: FONT,
                color: '#1a2b4a', textDecoration: 'none',
                transition: 'color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = TEAL; e.currentTarget.style.background = '#f2fafb'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#1a2b4a'; e.currentTarget.style.background = 'transparent'; }}
            >{item}</a>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Main Navbar ──────────────────────────────────────── */
export default function Navbar() {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [hoveredNav, setHoveredNav]         = useState(null);
  const [mobileOpen, setMobileOpen]         = useState(false);
  const [scrolled, setScrolled]             = useState(false);
  const closeTimer = useRef(null);
  const location   = useLocation();
  const navigate   = useNavigate();

  useEffect(() => { setMobileOpen(false); }, [location]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const user = (() => { try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; } })();

  useEffect(() => {
    const sync = () => setIsAuthenticated(!!localStorage.getItem('token'));
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const onEnter = (label) => { clearTimeout(closeTimer.current); setActiveDropdown(label); };
  const onLeave = () => { closeTimer.current = setTimeout(() => setActiveDropdown(null), 120); };
  const isActive = (href) => location.pathname === href;

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 1000,
        fontFamily: FONT,
        boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.1)' : 'none',
        transition: 'box-shadow 0.3s ease',
      }}>

        {/* ══ LAYER 1 — Top Bar ══════════════════════════ */}
        <div style={{
          height: scrolled ? 0 : '40px',
          overflow: 'hidden',
          background: '#1a2b4a',
          padding: '0 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'height 0.3s ease',
        }}>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', fontFamily: FONT }}>
            Bakı, Azərbaycan — Aslan Medical Clinic
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
            {TOP_LINKS.map(lbl => (
              <a key={lbl} href="#" style={{
                fontSize: '13px', color: 'rgba(255,255,255,0.85)',
                textDecoration: 'none', fontFamily: FONT,
                transition: 'color 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.textDecoration = 'underline'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; e.currentTarget.style.textDecoration = 'none'; }}
              >{lbl}</a>
            ))}
            <a href="#" style={{
              fontSize: '12px', fontWeight: 700,
              fontFamily: FONT,
              color: '#ffffff',
              textDecoration: 'none',
              background: 'linear-gradient(135deg, #e8622a 0%, #d44e1a 100%)',
              padding: '4px 14px',
              borderRadius: '20px',
              letterSpacing: '0.3px',
              transition: 'opacity 0.2s, transform 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none'; }}
            >E-Nəticə</a>
          </div>
        </div>

        {/* ══ LAYER 2 — Middle Bar ═══════════════════════ */}
        <div style={{
          height: '88px',
          background: '#ffffff',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          padding: '0 48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
        }}>

          {/* Logo — with teal right divider */}
          <div style={{
            display: 'flex', alignItems: 'center', flexShrink: 0,
            marginRight: '32px', paddingRight: '32px',
            borderRight: '1.5px solid rgba(0,132,142,0.15)',
          }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
              <img src="/logo.png" alt="Aslan Medical"
                style={{ height: '72px', width: 'auto', filter: 'drop-shadow(0 2px 8px rgba(0,132,142,0.18))' }}
                onError={e => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextSibling.style.display = 'flex';
                }}
              />
              <span style={{
                display: 'none', alignItems: 'center', gap: '8px',
                fontSize: '20px', fontWeight: 800, color: '#1a2b4a', fontFamily: FONT,
              }}>
                <span style={{
                  width: '34px', height: '34px', background: TEAL,
                  borderRadius: '8px', display: 'inline-flex',
                  alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: '18px', fontWeight: 900,
                }}>+</span>
                ElmirMed
              </span>
            </Link>
          </div>

          {/* Center — single row: phone | divider | email | divider | socials */}
          <div className="mid-social" style={{
            flex: 1, display: 'flex', alignItems: 'center',
            gap: '20px', flexWrap: 'nowrap',
          }}>
            <a href="tel:+994508363694" style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              color: '#1a2b4a', fontWeight: 600, fontSize: '14px',
              fontFamily: FONT, textDecoration: 'none',
              transition: 'color 0.2s', whiteSpace: 'nowrap',
            }}
              onMouseEnter={e => e.currentTarget.style.color = TEAL}
              onMouseLeave={e => e.currentTarget.style.color = '#1a2b4a'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 5.5 5.5l.76-.76a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 16.92z"/>
              </svg>
              +994 50 836 36 94
            </a>

            <span style={{ width: '1px', height: '18px', background: 'rgba(0,0,0,0.12)', flexShrink: 0 }} />

            <a href="mailto:info@aslanmedical.az" style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              color: '#1a2b4a', fontWeight: 500, fontSize: '14px',
              fontFamily: FONT, textDecoration: 'none',
              transition: 'color 0.2s', whiteSpace: 'nowrap',
            }}
              onMouseEnter={e => e.currentTarget.style.color = TEAL}
              onMouseLeave={e => e.currentTarget.style.color = '#1a2b4a'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              info@aslanmedical.az
            </a>

            <span style={{ width: '1px', height: '18px', background: 'rgba(0,0,0,0.12)', flexShrink: 0 }} />

            {SOCIALS.map(({ Icon, label, href }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                style={{ color: '#1a2b4a', lineHeight: 0, transition: 'color 0.2s, transform 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.color = TEAL; e.currentTarget.style.transform = 'scale(1.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#1a2b4a'; e.currentTarget.style.transform = 'scale(1)'; }}
              ><Icon /></a>
            ))}

            <span style={{ width: '1px', height: '20px', background: 'rgba(0,0,0,0.1)', flexShrink: 0 }} />

            {isAuthenticated ? (
              <div onClick={() => navigate('/dashboard')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'linear-gradient(135deg, #00848e, #006b74)',
                  borderRadius: '24px', padding: '8px 16px',
                  cursor: 'pointer', flexShrink: 0,
                  boxShadow: '0 3px 12px rgba(0,132,142,0.25)',
                  transition: 'box-shadow 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,132,142,0.4)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 3px 12px rgba(0,132,142,0.25)'}
              >
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.75)', lineHeight: 1, fontFamily: FONT }}>Xoş gəldiniz</div>
                  <div style={{ fontSize: '13px', color: 'white', fontWeight: 600, lineHeight: 1.3, fontFamily: FONT }}>
                    {user?.name || user?.fullName || 'İstifadəçi'}
                  </div>
                </div>
              </div>
            ) : (
              <div onClick={() => navigate('/login')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'linear-gradient(135deg, #00848e, #006b74)',
                  borderRadius: '24px', padding: '8px 18px 8px 12px',
                  cursor: 'pointer', flexShrink: 0,
                  boxShadow: '0 3px 12px rgba(0,132,142,0.25)',
                  transition: 'box-shadow 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,132,142,0.4)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 3px 12px rgba(0,132,142,0.25)'}
              >
                <div style={{
                  width: '30px', height: '30px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.18)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'white', lineHeight: 1.2, fontFamily: FONT }}>Daxil olun və ya</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.2, fontFamily: FONT }}>Qeydiyyatdan Keçin</div>
                </div>
              </div>
            )}
          </div>

          {/* Action pill — right-aligned */}
          <div className="mid-actions" style={{ display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
            <div style={{
              background: 'linear-gradient(135deg, #00848e 0%, #006b74 100%)',
              borderRadius: '32px',
              padding: '8px 8px',
              boxShadow: '0 4px 16px rgba(0,132,142,0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px',
            }}>
              {ACTION_PILLS.map((btn, i) => (
                <button key={btn}
                  onClick={() => {
                    if (btn === 'Pasiyent Portalı') {
                      toast.info('Pasiyent portalına daxil olmaq üçün əvvəlcə giriş edin.');
                      navigate('/login');
                    }
                  }}
                  style={{
                    fontSize: '13.5px', color: 'white',
                    fontWeight: 600, fontFamily: FONT,
                    padding: '9px 18px', borderRadius: '26px',
                    border: 'none', cursor: 'pointer',
                    background: 'transparent',
                    letterSpacing: '0.3px',
                    transition: 'background 0.2s',
                    whiteSpace: 'nowrap',
                    borderRight: i < ACTION_PILLS.length - 1 ? '1px solid rgba(255,255,255,0.15)' : 'none',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >{btn}</button>
              ))}
              <button
                onClick={() => toast.info('Axtarış funksiyası tezliklə əlavə olunacaq.')}
                style={{
                  padding: '9px 14px', borderRadius: '26px',
                  border: 'none', cursor: 'pointer',
                  background: 'transparent', color: 'white',
                  lineHeight: 0, transition: 'background 0.2s',
                  fontSize: '16px',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                aria-label="Axtar"
              ><IconSearch /></button>
            </div>
          </div>

          {/* Hamburger — mobile only */}
          <button onClick={() => setMobileOpen(o => !o)} className="nav-hamburger"
            style={{ display: 'none', flexDirection: 'column', gap: '5px', background: 'none', border: 'none', cursor: 'pointer', padding: '6px', flexShrink: 0 }}
            aria-label="Menyu"
          >
            <motion.span animate={mobileOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
              style={{ display: 'block', width: '22px', height: '2px', background: '#1a2b4a', borderRadius: '2px' }} />
            <motion.span animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
              style={{ display: 'block', width: '22px', height: '2px', background: '#1a2b4a', borderRadius: '2px' }} />
            <motion.span animate={mobileOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
              style={{ display: 'block', width: '22px', height: '2px', background: '#1a2b4a', borderRadius: '2px' }} />
          </button>
        </div>

        {/* ══ LAYER 3 — Main Nav ════════════════════════ */}
        <nav className="nav-layer3" style={{
          height: '48px',
          background: '#ffffff',
          borderTop: '1px solid rgba(0,0,0,0.06)',
          borderBottom: `3px solid ${TEAL}`,
          padding: '0 48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'stretch', height: '100%' }}>
            {NAV_LINKS.map((link) => {
              const open      = activeDropdown === link.label;
              const active    = isActive(link.href);
              const hovered   = hoveredNav === link.label;
              const highlight = active || open || hovered;
              return (
                <div key={link.label}
                  style={{
                    position: 'relative', display: 'flex', alignItems: 'stretch',
                    background: hovered ? 'rgba(0,132,142,0.04)' : 'transparent',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={() => { setHoveredNav(link.label); link.dropdown && onEnter(link.label); }}
                  onMouseLeave={() => { setHoveredNav(null); onLeave(); }}
                >
                  <Link to={link.href} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    padding: '0 18px',
                    fontSize: '14.5px',
                    fontWeight: active ? 700 : 500,
                    fontFamily: FONT,
                    color: highlight ? TEAL : '#1a2b4a',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    transition: 'color 0.2s, font-weight 0.1s',
                    borderBottom: highlight ? `3px solid ${TEAL}` : '3px solid transparent',
                    marginBottom: '-3px',
                  }}>
                    {link.label}
                    {link.dropdown && (
                      <span style={{ fontSize: '11px', lineHeight: 1, opacity: 0.7 }}>∨</span>
                    )}
                  </Link>
                  {link.dropdown && <Dropdown items={link.dropdown} open={open} />}
                </div>
              );
            })}
          </div>
        </nav>
      </header>

      {/* ══ Mobile Menu ═══════════════════════════════════ */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
            style={{
              position: 'fixed',
              top: scrolled ? '136px' : '176px',
              left: 0, right: 0, bottom: 0,
              background: '#fff',
              zIndex: 999,
              display: 'flex',
              flexDirection: 'column',
              padding: '20px 28px',
              fontFamily: FONT,
              overflowY: 'auto',
            }}
          >
            {NAV_LINKS.map((link, i) => (
              <motion.div key={link.label}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.045 }}
              >
                <Link to={link.href} style={{
                  display: 'block', padding: '14px 0',
                  fontSize: '17px', fontWeight: 600,
                  color: isActive(link.href) ? TEAL : '#1a2b4a',
                  textDecoration: 'none',
                  borderBottom: '1px solid #f0f0f0',
                }}>{link.label}</Link>
              </motion.div>
            ))}

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.38 }}
              style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}
            >
              {ACTION_PILLS.map(btn => (
                <button key={btn} style={{
                  padding: '12px 20px', background: TEAL,
                  color: '#fff', border: 'none', borderRadius: '8px',
                  fontSize: '15px', fontWeight: 600,
                  fontFamily: FONT, cursor: 'pointer', textAlign: 'left',
                }}>{btn}</button>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .mid-social  { display: none !important; }
          .mid-actions { display: none !important; }
          .nav-hamburger { display: flex !important; }
          .nav-layer3  { display: none !important; }
        }
      `}</style>
    </>
  );
}
