import { Link } from 'react-router-dom';

const FONT = "'Source Sans 3', 'Raleway', sans-serif";
const TEAL = '#148F99';
const NAVY = '#071B3B';
const MUTED = '#62718A';

export default function VisitorInfoDetail({
  title,
  breadcrumb,
  image,
  imageAlt,
  imageLayout = null,
  imageWidth = '42%',
  imageFit = 'cover',
  imageMaxHeight = 420,
  contentMaxWidth = 800,
  children,
}) {
  return (
    <main style={{ fontFamily: FONT, background: '#ffffff', minHeight: '80vh', paddingBottom: 80 }}>
      <style>{`
        .vi-detail-side {
          display: flex;
          gap: 56px;
          align-items: flex-start;
        }
        .vi-detail-side-content { flex: 1; min-width: 0; }
        .vi-detail-side-img { flex-shrink: 0; }
        @media (max-width: 860px) {
          .vi-detail-side { flex-direction: column; gap: 32px; }
          .vi-detail-side-img { width: 100% !important; }
        }
      `}</style>

      {/* Header band */}
      <div style={{ background: NAVY, padding: '44px 28px 40px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', boxSizing: 'border-box' }}>

          {/* Breadcrumb */}
          <nav style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link
              to="/"
              style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontFamily: FONT }}
              onMouseEnter={e => { e.currentTarget.style.color = '#ffffff'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
            >
              Ana səhifə
            </Link>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6"/>
            </svg>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontFamily: FONT }}>
              {breadcrumb}
            </span>
          </nav>

          <h1 style={{
            fontSize: 'clamp(26px, 3vw, 42px)',
            fontWeight: 700,
            color: '#ffffff',
            margin: 0,
            fontFamily: "'Raleway', sans-serif",
            lineHeight: 1.15,
          }}>
            {title}
          </h1>
          <div style={{ width: 56, height: 3, background: TEAL, borderRadius: 2, marginTop: 16 }} />
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '52px 28px 0', boxSizing: 'border-box' }}>

        {imageLayout === 'side' && image && (
          <div className="vi-detail-side">
            <div className="vi-detail-side-content">{children}</div>
            <div className="vi-detail-side-img" style={{ width: imageWidth }}>
              <img
                src={image}
                alt={imageAlt || title}
                style={{
                  width: '100%',
                  borderRadius: 12,
                  display: 'block',
                  objectFit: imageFit,
                  objectPosition: 'top center',
                }}
              />
            </div>
          </div>
        )}

        {imageLayout === 'top' && image && (
          <>
            <img
              src={image}
              alt={imageAlt || title}
              style={{
                width: '100%',
                height: 'auto',
                ...(imageMaxHeight != null && { maxHeight: imageMaxHeight }),
                objectFit: imageFit,
                borderRadius: 12,
                display: 'block',
                marginBottom: 44,
              }}
            />
            <div style={{ maxWidth: contentMaxWidth }}>{children}</div>
          </>
        )}

        {!imageLayout && (
          <div style={{ maxWidth: 720 }}>{children}</div>
        )}
      </div>
    </main>
  );
}
