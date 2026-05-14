import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_LINKS = [
  { label: 'Ana Səhifə', href: '/', dropdown: ['Əsas Səhifə', 'Xəbərlər'] },
  { label: 'Haqqımızda', href: '/about' },
  { label: 'Səhifələr', href: '#', dropdown: ['Komanda', 'Tərəfdaşlar', 'FAQ'] },
  { label: 'Xidmətlər', href: '/services', dropdown: ['Cərrahiyyə', 'Diaqnostika', 'Laboratoriya'] },
  { label: 'Həkimlər', href: '/doctors', dropdown: ['Bütün Həkimlər', 'Mütəxəssislər'] },
  { label: 'Bloq', href: '/blog', dropdown: ['Məqalələr', 'Yeniliklər'] },
  { label: 'Əlaqə', href: '/contact' },
];

function Dropdown({ items, open }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ duration: 0.15 }}
          style={{
            position: 'absolute',
            top: 'calc(100% + 12px)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#fff',
            borderRadius: '10px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.13)',
            minWidth: '190px',
            padding: '6px 0',
            zIndex: 999,
          }}
        >
          <div style={{
            position: 'absolute', top: '-6px', left: '50%',
            transform: 'translateX(-50%)',
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderBottom: '6px solid #fff',
          }} />
          {items.map((item) => (
            <a key={item} href="#"
              style={{
                display: 'block', padding: '10px 20px',
                fontSize: '14px', fontWeight: 500,
                fontFamily: "'Raleway', sans-serif",
                color: '#2d3748', textDecoration: 'none',
                letterSpacing: '0.3px',
                transition: 'color 0.2s, background 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#00BCD4'; e.currentTarget.style.background = '#f5fdfe'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#2d3748'; e.currentTarget.style.background = 'transparent'; }}
            >{item}</a>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Navbar() {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef(null);
  const location = useLocation();

  useEffect(() => { setMobileOpen(false); }, [location]);

  const onEnter = (label) => { clearTimeout(closeTimer.current); setActiveDropdown(label); };
  const onLeave = () => { closeTimer.current = setTimeout(() => setActiveDropdown(null), 130); };

  return (
    <>
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: '#ffffff',
        boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
        height: '80px',
        padding: '0 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontFamily: "'Raleway', sans-serif",
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0 }}>
          <img
            src="/logo.png"
            alt="ElmirMed"
            style={{
              height: '68px',
              width: 'auto',
              filter: 'drop-shadow(0 2px 8px rgba(0,150,199,0.2))',
            }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextSibling.style.display = 'flex';
            }}
          />
          <span style={{
            display: 'none',
            alignItems: 'center',
            gap: '8px',
            fontSize: '21px',
            fontWeight: 800,
            color: '#0a1628',
            fontFamily: "'Raleway', sans-serif",
          }}>
            <span style={{
              width: '34px', height: '34px',
              background: '#00BCD4', borderRadius: '8px',
              display: 'inline-flex', alignItems: 'center',
              justifyContent: 'center', color: '#fff',
              fontSize: '18px', fontWeight: 900,
            }}>+</span>
            ElmirMed
          </span>
        </Link>

        {/* Desktop nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }} className="nav-desktop">
          {NAV_LINKS.map((link) => {
            const isOpen = activeDropdown === link.label;
            return (
              <div key={link.label} style={{ position: 'relative' }}
                onMouseEnter={() => link.dropdown && onEnter(link.label)}
                onMouseLeave={onLeave}
              >
                <Link
                  to={link.href}
                  style={{
                    display: 'inline-flex', alignItems: 'center',
                    padding: '8px 13px',
                    fontSize: '15px', fontWeight: 600,
                    fontFamily: "'Raleway', sans-serif",
                    color: isOpen ? '#00BCD4' : '#2d3748',
                    letterSpacing: '0.5px',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#00BCD4'}
                  onMouseLeave={(e) => { if (!isOpen) e.currentTarget.style.color = '#2d3748'; }}
                >
                  {link.label}
                  {link.dropdown && (
                    <span style={{
                      marginLeft: '5px', fontSize: '13px',
                      fontWeight: 700, lineHeight: 1,
                      color: 'inherit',
                    }}>+</span>
                  )}
                </Link>
                {link.dropdown && <Dropdown items={link.dropdown} open={isOpen} />}
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <Link
          to="/appointments/new"
          style={{
            padding: '12px 28px',
            background: '#00BCD4',
            color: '#ffffff',
            textDecoration: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 700,
            fontFamily: "'Raleway', sans-serif",
            letterSpacing: '0.5px',
            flexShrink: 0,
            transition: 'background 0.2s, transform 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#0096C7'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#00BCD4'; e.currentTarget.style.transform = 'none'; }}
        >
          Randevu Al
        </Link>

        {/* Hamburger */}
        <button onClick={() => setMobileOpen(!mobileOpen)}
          className="nav-hamburger"
          style={{ display: 'none', flexDirection: 'column', gap: '5px', background: 'none', border: 'none', cursor: 'pointer', padding: '6px' }}
          aria-label="Menu"
        >
          <motion.span animate={mobileOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
            style={{ display: 'block', width: '22px', height: '2px', background: '#2d3748', borderRadius: '2px' }} />
          <motion.span animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
            style={{ display: 'block', width: '22px', height: '2px', background: '#2d3748', borderRadius: '2px' }} />
          <motion.span animate={mobileOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
            style={{ display: 'block', width: '22px', height: '2px', background: '#2d3748', borderRadius: '2px' }} />
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.28 }}
            style={{
              position: 'fixed', inset: 0, background: '#fff',
              zIndex: 999, display: 'flex', flexDirection: 'column',
              paddingTop: '90px', paddingLeft: '32px',
              fontFamily: "'Raleway', sans-serif",
            }}
          >
            {NAV_LINKS.map((link, i) => (
              <motion.div key={link.label}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.055 }}
              >
                <Link to={link.href} style={{
                  display: 'block', padding: '16px 0',
                  fontSize: '19px', fontWeight: 600,
                  color: '#2d3748', textDecoration: 'none',
                  borderBottom: '1px solid #f0f0f0',
                  letterSpacing: '0.3px',
                }}>{link.label}</Link>
              </motion.div>
            ))}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.42 }} style={{ marginTop: '32px' }}>
              <Link to="/appointments/new" style={{
                display: 'inline-block', padding: '14px 36px',
                background: '#00BCD4', color: '#fff',
                textDecoration: 'none', borderRadius: '6px',
                fontSize: '16px', fontWeight: 700,
              }}>Randevu Al</Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 900px) {
          .nav-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
      `}</style>
    </>
  );
}
