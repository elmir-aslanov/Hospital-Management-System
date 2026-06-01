const FONT = "'Source Sans 3', 'Raleway', sans-serif";

export default function ExternalLinkModal({ url, siteName, isOpen, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onCancel}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.35)',
          zIndex: 9998,
        }}
      />

      {/* Modal card */}
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'white',
        borderRadius: '12px',
        width: '360px',
        maxWidth: '92vw',
        zIndex: 9999,
        boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
        fontFamily: FONT,
        overflow: 'hidden',
      }}>

        {/* Body */}
        <div style={{ padding: '28px 28px 20px' }}>
          <p style={{
            fontSize: '16px', fontWeight: 700,
            color: '#0f1b2d', margin: '0 0 14px',
          }}>
            Xəbərdarlıq
          </p>
          <p style={{
            fontSize: '14px', color: '#4a5568',
            lineHeight: 1.6, margin: 0,
          }}>
            <strong style={{ color: '#0f1b2d' }}>{siteName}</strong>{' '}
            xarici saytına keçid edirsiniz.
          </p>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: '#e2e8f0' }} />

        {/* Buttons */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end',
          gap: '10px', padding: '16px 20px',
        }}>
          <button
            onClick={onCancel}
            style={{
              padding: '8px 20px', borderRadius: '7px',
              border: '1.5px solid #e2e8f0', background: 'white',
              color: '#4a5568', fontSize: '14px', fontWeight: 500,
              cursor: 'pointer', fontFamily: FONT,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
            onMouseLeave={e => e.currentTarget.style.background = 'white'}
          >
            Bağla
          </button>

          <button
            onClick={onConfirm}
            style={{
              padding: '8px 20px', borderRadius: '7px',
              border: 'none', background: '#0f1b2d',
              color: 'white', fontSize: '14px', fontWeight: 600,
              cursor: 'pointer', fontFamily: FONT,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#1a2d4a'}
            onMouseLeave={e => e.currentTarget.style.background = '#0f1b2d'}
          >
            Davam et
          </button>
        </div>
      </div>
    </>
  );
}
