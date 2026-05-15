const FONT = "'Source Sans 3', 'Raleway', sans-serif";

export default function ExternalLinkModal({ url, siteName, isOpen, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div onClick={onCancel} style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 9998,
        backdropFilter: 'blur(4px)',
      }} />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'white',
        borderRadius: '16px',
        padding: '32px',
        width: '420px',
        maxWidth: '90vw',
        zIndex: 9999,
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        fontFamily: FONT,
      }}>
        {/* Warning icon */}
        <div style={{
          width: '48px', height: '48px', borderRadius: '50%',
          background: 'rgba(245,158,11,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '16px',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24"
            fill="none" stroke="#F59E0B" strokeWidth="2.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>

        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0a1628', marginBottom: '8px' }}>
          Xəbərdarlıq
        </h3>
        <p style={{ fontSize: '15px', color: '#4a5568', lineHeight: 1.6, marginBottom: '8px' }}>
          <strong style={{ color: '#0a1628' }}>{siteName}</strong> saytından ayrılırsınız.
        </p>
        <p style={{ fontSize: '13px', color: '#718096', marginBottom: '24px', lineHeight: 1.5 }}>
          Sizi xarici bir sayta yönləndiririk. Aslan Medical Clinic bu saytın məzmununa görə məsuliyyət daşımır.
        </p>

        <div style={{
          background: '#f8fafc', border: '1px solid #e2e8f0',
          borderRadius: '8px', padding: '10px 14px',
          fontSize: '12px', color: '#718096',
          marginBottom: '24px', wordBreak: 'break-all',
        }}>
          🔗 {url}
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{
            padding: '10px 24px', borderRadius: '8px',
            border: '1.5px solid #e2e8f0', background: 'white',
            color: '#4a5568', fontSize: '14px', fontWeight: 600,
            cursor: 'pointer', fontFamily: FONT, transition: 'background 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
            onMouseLeave={e => e.currentTarget.style.background = 'white'}
          >Bağla</button>

          <button onClick={onConfirm} style={{
            padding: '10px 24px', borderRadius: '8px',
            border: 'none', background: '#00848e',
            color: 'white', fontSize: '14px', fontWeight: 600,
            cursor: 'pointer', fontFamily: FONT, transition: 'background 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#006b74'}
            onMouseLeave={e => e.currentTarget.style.background = '#00848e'}
          >Tamam, Davam Et</button>
        </div>
      </div>
    </>
  );
}
