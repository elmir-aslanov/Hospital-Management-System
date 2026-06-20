import { useTranslation } from 'react-i18next'

const FONT = "'Source Sans 3', 'Raleway', sans-serif"

const PARTNERS = [
  { name: 'AzerGold',               logo: '/AzerGold.jpeg'                              },
  { name: 'ABB',                    logo: '/Abb.jpeg'                                   },
  { name: 'ADY',                    logo: '/ADY.jpeg'                                   },
  { name: 'AGF',                    logo: '/AGF.jpeg'                                   },
  { name: 'AzParking',              logo: '/azparking.jpeg'                             },
  { name: 'Baku Electronic',        logo: '/bakuelectronic.jpeg'                        },
  { name: 'İqtisadiyyat Nazirliyi', logo: '/Azerbaycan Iqdisadiyyat nazirliyi.jpeg'     },
  { name: 'Metak',                  logo: '/metak.jpeg'                                 },
  { name: 'PASHA Development',      logo: '/pashadevelopment.jpeg'                      },
  { name: 'Pasha Sığorta',          logo: '/pasasigorta.jpeg'                           },
  { name: 'Qarabağ FK',             logo: '/qarabag.png'                                },
  { name: 'SOCAR',                  logo: '/socar.jpeg'                                 },
  { name: 'TEBIB',                  logo: '/tebib.jpeg'                                 },
  { name: 'YASAT',                  logo: '/yasat.jpg'                                  },
]

// One full cycle of the marquee — tuned slow/steady relative to item count.
const MARQUEE_DURATION_S = Math.round(PARTNERS.length * 2.5)

// ─── main component ───────────────────────────────────────────────────────────

export default function PartnersCarousel() {
  const { t } = useTranslation()

  return (
    <section
      style={{
        background: 'white',
        borderTop: '1px solid #f1f5f9',
        borderBottom: '1px solid #f1f5f9',
        padding: '28px 0',
        fontFamily: FONT,
      }}
    >
      <div style={{ maxWidth: 1100, minWidth: 0, margin: '0 auto', padding: '0 24px' }}>

        {/* heading */}
        <p style={{
          textAlign: 'center', fontSize: 11, fontWeight: 700,
          color: '#94a3b8', letterSpacing: '0.14em',
          textTransform: 'uppercase', margin: '0 0 20px',
          overflowWrap: 'break-word', wordBreak: 'normal', hyphens: 'auto',
        }}>
          {t('partners.title')}
        </p>

        {/* marquee */}
        <div className="partners-marquee-wrapper" style={{ overflowX: 'hidden' }}>
          <div
            className="partners-marquee-track"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 48,
              width: 'max-content',
              '--partners-marquee-duration': `${MARQUEE_DURATION_S}s`,
            }}
          >
            {[...PARTNERS, ...PARTNERS].map((partner, i) => (
              <div
                key={i}
                style={{
                  flex: '0 0 auto',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  gap: 8,
                }}
              >
                <img
                  src={partner.logo}
                  alt={partner.name}
                  draggable={false}
                  className="partners-marquee-logo"
                  style={{
                    height: 64,
                    width: 'auto',
                    maxWidth: 160,
                    objectFit: 'contain',
                    filter: 'grayscale(25%)',
                    transition: 'filter 0.2s',
                    userSelect: 'none',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.filter = 'grayscale(0%)')}
                  onMouseLeave={e => (e.currentTarget.style.filter = 'grayscale(25%)')}
                  onError={e => { e.currentTarget.style.display = 'none' }}
                />
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  color: '#94a3b8', textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}>
                  {partner.name}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        .partners-marquee-track {
          animation: partners-marquee var(--partners-marquee-duration) linear infinite;
        }
        .partners-marquee-wrapper:hover .partners-marquee-track {
          animation-play-state: paused;
        }
        @keyframes partners-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (min-width: 768px) {
          .partners-marquee-logo { height: 80px; }
        }
      `}</style>
    </section>
  )
}
