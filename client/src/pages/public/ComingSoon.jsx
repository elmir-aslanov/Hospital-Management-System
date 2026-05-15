import { useNavigate } from 'react-router-dom';

const FONT = "'Source Sans 3', 'Raleway', sans-serif";
const TEAL = '#00848e';

export default function ComingSoon({ title = 'Səhifə' }) {
  const navigate = useNavigate();
  return (
    <div style={{
      minHeight: 'calc(100vh - 176px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#f8fafc', fontFamily: FONT, padding: '40px 24px',
    }}>
      <div style={{ textAlign: 'center', maxWidth: '480px' }}>
        <div style={{
          width: '72px', height: '72px', borderRadius: '20px',
          background: `linear-gradient(135deg, ${TEAL}, #006b74)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
          boxShadow: '0 8px 24px rgba(0,132,142,0.3)',
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
            stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1a2b4a', marginBottom: '12px', fontFamily: FONT }}>
          {title}
        </h1>
        <p style={{ fontSize: '16px', color: '#718096', lineHeight: 1.7, marginBottom: '32px', fontFamily: FONT }}>
          Bu bölmə hazırlanır. Tezliklə istifadənizə veriləcək.
        </p>
        <button onClick={() => navigate('/')}
          style={{
            padding: '12px 32px', background: TEAL,
            color: '#fff', border: 'none', borderRadius: '10px',
            fontSize: '15px', fontWeight: 700, fontFamily: FONT,
            cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,132,142,0.35)',
          }}>
          Ana Səhifəyə Qayıt
        </button>
      </div>
    </div>
  );
}
