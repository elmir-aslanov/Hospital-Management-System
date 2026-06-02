import { useState, useEffect, useRef, useCallback } from 'react'

const TEAL = '#00848e'
const FONT = "'Source Sans 3', 'Raleway', sans-serif"
const SLIDE_MS = 420
const INTERVAL_MS = 3000

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

// Triple belt: [copy1 | real | copy2]
// pos starts at N (= first real item). Valid home range: [N, 2N).
// After each animation, if pos drifted outside [N, 2N), snap back silently.
const N = PARTNERS.length
const BELT = [...PARTNERS, ...PARTNERS, ...PARTNERS]
const BELT_LEN = BELT.length // 3N

function calcVisible() {
  if (typeof window === 'undefined') return 5
  return window.innerWidth < 640 ? 2 : window.innerWidth < 1024 ? 3 : 5
}

// ─── sub-components ──────────────────────────────────────────────────────────

function NavBtn({ onClick, label, children }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      aria-label={label}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flexShrink: 0,
        width: 34, height: 34, borderRadius: '50%',
        border: `1.5px solid ${hov ? TEAL : '#e2e8f0'}`,
        background: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        color: hov ? TEAL : '#64748b',
        transition: 'border-color 0.2s, color 0.2s',
        padding: 0,
      }}
    >
      {children}
    </button>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

export default function PartnersCarousel() {
  const [visible, setVisible]   = useState(calcVisible)
  const [pos, setPos]           = useState(N)       // index into BELT
  const [animated, setAnimated] = useState(true)
  const [paused, setPaused]     = useState(false)

  // Refs so callbacks always see the latest values without re-creating
  const posRef  = useRef(N)
  const lockRef = useRef(false)  // true while a slide is in flight

  // ── responsive visible count ─────────────────────────────────────────────
  useEffect(() => {
    const update = () => setVisible(calcVisible())
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // ── snap helper ──────────────────────────────────────────────────────────
  // After a slide lands outside the home range, teleport back to the
  // matching position in the real copy (same visual, no visible jump).
  const snapIfNeeded = useCallback((p) => {
    if (p < N)      return p + N
    if (p >= 2 * N) return p - N
    return p
  }, [])

  // ── slide by delta (+1 or -1) ────────────────────────────────────────────
  const move = useCallback((delta) => {
    if (lockRef.current) return
    lockRef.current = true

    const next = posRef.current + delta
    posRef.current = next
    setPos(next)

    setTimeout(() => {
      const snapped = snapIfNeeded(next)
      if (snapped !== next) {
        // Disable transition → teleport → re-enable in next two frames
        setAnimated(false)
        posRef.current = snapped
        setPos(snapped)
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            setAnimated(true)
            lockRef.current = false
          })
        )
      } else {
        lockRef.current = false
      }
    }, SLIDE_MS)
  }, [snapIfNeeded])

  // ── dot click: instant snap (no slide) ───────────────────────────────────
  const goTo = useCallback((i) => {
    if (lockRef.current) return
    const target = N + i
    posRef.current = target
    setAnimated(false)
    setPos(target)
    requestAnimationFrame(() =>
      requestAnimationFrame(() => setAnimated(true))
    )
  }, [])

  // ── auto-advance ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (paused) return
    const id = setInterval(() => move(1), INTERVAL_MS)
    return () => clearInterval(id)
  }, [paused, move])

  // ── derived ──────────────────────────────────────────────────────────────
  // CSS transform values.
  // Track width  = BELT_LEN / visible items wide (in container %)
  // translateX   = -(pos / BELT_LEN) * 100%  (% of track's own width → correct)
  const trackWidthPct = (BELT_LEN / visible) * 100
  const translatePct  = -(pos / BELT_LEN) * 100

  // ── render ───────────────────────────────────────────────────────────────
  return (
    <section
      style={{
        background: 'white',
        borderTop: '1px solid #f1f5f9',
        borderBottom: '1px solid #f1f5f9',
        padding: '28px 0',
        fontFamily: FONT,
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>

        {/* heading */}
        <p style={{
          textAlign: 'center', fontSize: 11, fontWeight: 700,
          color: '#94a3b8', letterSpacing: '0.14em',
          textTransform: 'uppercase', margin: '0 0 20px',
        }}>
          TƏRƏFDAŞLARIMİZ VƏ SIĞORTA ŞİRKƏTLƏRİ
        </p>

        {/* carousel row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

          <NavBtn label="Əvvəlki" onClick={() => move(-1)}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </NavBtn>

          {/* sliding belt */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{
              display: 'flex',
              width: `${trackWidthPct}%`,
              transform: `translateX(${translatePct}%)`,
              transition: animated ? `transform ${SLIDE_MS}ms ease` : 'none',
              willChange: 'transform',
            }}>
              {BELT.map((partner, i) => (
                <div
                  key={i}
                  style={{
                    flex: `0 0 ${100 / BELT_LEN}%`,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    padding: '8px 16px', gap: 8,
                  }}
                >
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    draggable={false}
                    style={{
                      height: 52, maxWidth: '100%',
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

          <NavBtn label="Növbəti" onClick={() => move(1)}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </NavBtn>

        </div>


      </div>
    </section>
  )
}
