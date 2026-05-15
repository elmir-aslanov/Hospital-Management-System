import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../../api/axios';

const FONT = "'Source Sans 3', 'Raleway', sans-serif";
const TEAL = '#00848e';

export default function PatientPortal() {
  const navigate = useNavigate();
  let user = {};
  try { user = JSON.parse(localStorage.getItem('user') || '{}'); } catch {}

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('storage'));
    toast.success('Sistemdən uğurla çıxdınız.');
    navigate('/');
  };

  const CARDS = [
    { icon: '📅', title: 'Randevularım',    desc: 'Gəlməkdə olan randevularınıza baxın',   action: 'Bax',       onClick: () => toast.info('Tezliklə...') },
    { icon: '📋', title: 'Tibbi Qeydlər',  desc: 'Müayinə nəticələriniz və diaqnozlar',   action: 'Bax',       onClick: () => toast.info('Tezliklə...') },
    { icon: '💊', title: 'Reseptlər',       desc: 'Aktiv və keçmiş reseptləriniz',          action: 'Bax',       onClick: () => toast.info('Tezliklə...') },
    { icon: '🏥', title: 'Randevu Al',      desc: 'Yeni randevu üçün həkim seçin',         action: 'Al',        onClick: () => toast.info('Tezliklə...') },
  ];

  return (
    <div style={{
      minHeight: '100vh', background: '#f0f4f8',
      fontFamily: FONT, padding: '40px 6vw',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: '40px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img src="/logo.png" alt="Aslan Medical"
            style={{ height: '48px', width: 'auto' }}
            onError={e => e.currentTarget.style.display = 'none'}
          />
          <div>
            <div style={{ fontSize: '12px', color: '#718096', fontFamily: FONT }}>Pasiyent Portalı</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#1a2b4a', fontFamily: FONT }}>
              Xoş gəldiniz, {user.fullName?.split(' ')[0] || 'Pasiyent'} 👋
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button onClick={() => navigate('/')}
            style={{
              padding: '8px 18px', background: 'transparent',
              border: '1.5px solid #e2e8f0', borderRadius: '8px',
              fontSize: '14px', fontWeight: 600, color: '#718096',
              cursor: 'pointer', fontFamily: FONT,
            }}>
            Ana Səhifə
          </button>
          <button onClick={logout}
            style={{
              padding: '8px 18px', background: '#fff1f1',
              border: '1.5px solid #fecaca', borderRadius: '8px',
              fontSize: '14px', fontWeight: 600, color: '#dc2626',
              cursor: 'pointer', fontFamily: FONT,
            }}>
            Çıxış
          </button>
        </div>
      </div>

      {/* Info card */}
      <div style={{
        background: `linear-gradient(135deg, #0a1628, ${TEAL})`,
        borderRadius: '16px', padding: '32px',
        marginBottom: '32px', color: '#fff',
      }}>
        <p style={{ fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: '8px', fontFamily: FONT }}>
          Pasiyent Məlumatı
        </p>
        <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px', fontFamily: FONT }}>
          {user.fullName || 'Ad Soyad'}
        </h2>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', fontFamily: FONT }}>
          {user.email}
        </p>
      </div>

      {/* Quick action cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
        {CARDS.map(card => (
          <div key={card.title} style={{
            background: '#fff', borderRadius: '16px',
            padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            display: 'flex', flexDirection: 'column', gap: '12px',
          }}>
            <span style={{ fontSize: '32px' }}>{card.icon}</span>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1a2b4a', margin: 0, fontFamily: FONT }}>
              {card.title}
            </h3>
            <p style={{ fontSize: '13px', color: '#718096', margin: 0, lineHeight: 1.6, fontFamily: FONT }}>
              {card.desc}
            </p>
            <button onClick={card.onClick}
              style={{
                marginTop: 'auto', padding: '10px',
                background: TEAL, color: '#fff',
                border: 'none', borderRadius: '8px',
                fontSize: '14px', fontWeight: 600,
                cursor: 'pointer', fontFamily: FONT,
              }}>
              {card.action}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
