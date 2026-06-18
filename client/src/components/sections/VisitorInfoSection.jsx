import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { fadeUp } from '../../utils/animations';

const FONT = "'Source Sans 3', 'Raleway', sans-serif";
const TEAL = '#148F99';
const NAVY = '#071B3B';
const MUTED = '#62718A';

function AtmIcon({ size = 26, color = TEAL }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <line x1="2" y1="10" x2="22" y2="10"/>
      <line x1="6" y1="15" x2="9" y2="15"/>
      <line x1="11" y1="15" x2="14" y2="15"/>
    </svg>
  );
}

function CafeIcon({ size = 26, color = TEAL }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 8h1a4 4 0 0 1 0 8h-1"/>
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z"/>
      <line x1="6" y1="2" x2="6" y2="4"/>
      <line x1="10" y1="2" x2="10" y2="4"/>
      <line x1="14" y1="2" x2="14" y2="4"/>
    </svg>
  );
}

function RestIcon({ size = 26, color = TEAL }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2v7c0 1.1.9 2 2 2 1.1 0 2-.9 2-2V2"/>
      <line x1="5" y1="12" x2="5" y2="22"/>
      <line x1="3" y1="7" x2="7" y2="7"/>
      <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h1v7"/>
    </svg>
  );
}

function WifiIcon({ size = 26, color = TEAL }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
      <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
      <line x1="12" y1="20" x2="12.01" y2="20"/>
    </svg>
  );
}

export default function VisitorInfoSection() {
  const { t } = useTranslation();
  const [hovered, setHovered] = useState(null);

  const CARDS = [
    { id: 'atms',       href: '/visitor-info/atms',       icon: <AtmIcon />,  title: t('visitorInfo.atms.title'),       desc: t('visitorInfo.atms.desc')       },
    { id: 'cafeteria',  href: '/visitor-info/cafeteria',  icon: <CafeIcon />, title: t('visitorInfo.cafeteria.title'),  desc: t('visitorInfo.cafeteria.desc')  },
    { id: 'restaurant', href: '/visitor-info/restaurant', icon: <RestIcon />, title: t('visitorInfo.restaurant.title'), desc: t('visitorInfo.restaurant.desc') },
    { id: 'wifi',       href: '/visitor-info/wifi',       icon: <WifiIcon />, title: t('visitorInfo.wifi.title'),       desc: t('visitorInfo.wifi.desc')       },
  ];

  return (
    <section style={{ background: '#F7FAFC', padding: '72px 0 80px' }}>
      <style>{`
        .vi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        @media (max-width: 1024px) {
          .vi-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 540px) {
          .vi-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 28px', boxSizing: 'border-box' }}>

        {/* Section heading */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 52 }}
        >
          <p style={{
            fontSize: 12, fontWeight: 700, color: TEAL,
            letterSpacing: '3px', textTransform: 'uppercase',
            marginBottom: 16, fontFamily: FONT,
          }}>
            {t('visitorInfo.eyebrow')}
          </p>
          <h2 style={{
            fontSize: 38, fontWeight: 700, color: NAVY,
            margin: '0 0 16px', fontFamily: "'Raleway', sans-serif", lineHeight: 1.2,
          }}>
            {t('visitorInfo.title')}
          </h2>
          <p style={{
            fontSize: 16, color: MUTED, margin: '0 auto',
            fontFamily: FONT, lineHeight: 1.6, maxWidth: 540,
          }}>
            {t('visitorInfo.subtitle')}
          </p>
        </motion.div>

        {/* Cards */}
        <div className="vi-grid">
          {CARDS.map((card, idx) => {
            const isHov = hovered === card.id;
            return (
              <motion.div
                key={card.id}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.28, delay: idx * 0.07 }}
              >
                <Link to={card.href} style={{ textDecoration: 'none', display: 'block' }}>
                  <div
                    onMouseEnter={() => setHovered(card.id)}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      background: '#ffffff',
                      border: `1px solid ${isHov ? TEAL : '#DDE5EC'}`,
                      borderRadius: 10,
                      padding: '20px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      minHeight: 120,
                      boxShadow: isHov ? '0 4px 18px rgba(20,143,153,0.10)' : 'none',
                      transition: 'border-color 0.16s, box-shadow 0.16s',
                      cursor: 'pointer',
                    }}
                  >
                    {/* Icon box */}
                    <div style={{
                      width: 52, height: 52, flexShrink: 0,
                      background: 'rgba(20,143,153,0.08)',
                      borderRadius: 10,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {card.icon}
                    </div>

                    {/* Text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{
                        fontSize: 15, fontWeight: 700, color: NAVY,
                        margin: 0, fontFamily: FONT, lineHeight: 1.3,
                      }}>
                        {card.title}
                      </h3>
                      <p style={{
                        fontSize: 13, color: MUTED,
                        margin: '5px 0 0', lineHeight: 1.5, fontFamily: FONT,
                      }}>
                        {card.desc}
                      </p>
                    </div>

                    {/* Chevron */}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke={TEAL} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                      style={{ flexShrink: 0 }}
                    >
                      <path d="m9 18 6-6-6-6"/>
                    </svg>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
