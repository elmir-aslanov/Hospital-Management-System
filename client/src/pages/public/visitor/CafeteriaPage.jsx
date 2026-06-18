import usePageTitle from '../../../hooks/usePageTitle';
import VisitorInfoDetail from './VisitorInfoDetail';

const FONT = "'Source Sans 3', 'Raleway', sans-serif";
const TEAL = '#148F99';
const NAVY = '#071B3B';
const MUTED = '#62718A';

export default function CafeteriaPage() {
  usePageTitle('Kafeterya', 'Aslan Medical Center kafeterya xidməti.');
  return (
    <VisitorInfoDetail
      title="Kafeterya"
      breadcrumb="Kafeterya"
      image="/cafeterya.png"
      imageAlt="Aslan Medical Center kafeterya"
      imageLayout="top"
    >
      <p style={{ fontSize: 16, color: MUTED, lineHeight: 1.75, margin: '0 0 28px', fontFamily: FONT }}>
        Kafeteryamız pasiyentlər, onların ailə üzvləri və ziyarətçilər üçün açıqdır. Gün ərzində isti içkilər, sendviçlər, xəfif yeməklər və şirniyyatlar təqdim edilir.
      </p>

      <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: NAVY, margin: '0 0 14px', fontFamily: "'Raleway', sans-serif" }}>
          Menyumuzda nə var?
        </h3>
        <ul style={{ margin: 0, padding: '0 0 0 22px', fontSize: 15, color: MUTED, lineHeight: 2.1, fontFamily: FONT }}>
          <li>İsti içkilər — çay, qəhvə, kakao</li>
          <li>Soyuq içkilər — şirə, su, kompot</li>
          <li>Xəfif yeməklər — sendviç, qaymaqlı bulka, salat</li>
          <li>Şirniyyat — desert, baklava, keks</li>
        </ul>
      </div>

      <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: NAVY, margin: '0 0 14px', fontFamily: "'Raleway', sans-serif" }}>
          İş saatları
        </h3>
        <div style={{ fontSize: 15, color: MUTED, fontFamily: FONT }}>
          <div style={{ display: 'flex', gap: 24, marginBottom: 6 }}>
            <span style={{ minWidth: 180 }}>Bazar ertəsi – Cümə</span>
            <span style={{ fontWeight: 600, color: NAVY }}>07:00 – 20:00</span>
          </div>
          <div style={{ display: 'flex', gap: 24, marginBottom: 6 }}>
            <span style={{ minWidth: 180 }}>Şənbə</span>
            <span style={{ fontWeight: 600, color: NAVY }}>08:00 – 18:00</span>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            <span style={{ minWidth: 180 }}>Bazar</span>
            <span style={{ fontWeight: 600, color: NAVY }}>09:00 – 15:00</span>
          </div>
        </div>
      </div>

      <div style={{
        background: 'rgba(20,143,153,0.06)',
        border: '1px solid rgba(20,143,153,0.2)',
        borderRadius: 8,
        padding: '16px 20px',
        fontFamily: FONT,
      }}>
        <p style={{ fontSize: 14, color: NAVY, margin: 0, lineHeight: 1.6 }}>
          <strong>Yerləşmə:</strong> Kafeterya əsas binanın zemin mərtəbəsindədir — giriş holunun sağ tərəfindən daxil ola bilərsiniz.
        </p>
      </div>
    </VisitorInfoDetail>
  );
}
