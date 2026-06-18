import usePageTitle from '../../../hooks/usePageTitle';
import VisitorInfoDetail from './VisitorInfoDetail';

const FONT = "'Source Sans 3', 'Raleway', sans-serif";
const TEAL = '#148F99';
const NAVY = '#071B3B';
const MUTED = '#62718A';

export default function AtmsPage() {
  usePageTitle('Bankomatlar', 'Aslan Medical Center-də bankomat xidmətinin yerləşməsi.');
  return (
    <VisitorInfoDetail
      title="Bankomatlar"
      breadcrumb="Bankomatlar"
      image="/atm.png"
      imageAlt="Aslan Medical Center bankomat xidməti"
      imageLayout="side"
    >
      <p style={{ fontSize: 16, color: MUTED, lineHeight: 1.75, margin: '0 0 28px', fontFamily: FONT }}>
        Aslan Medical Center-in əsas binasında pasiyentlər və ziyarətçilər üçün əlçatan bankomat xidməti mövcuddur. Nağd pul ehtiyaclarınızı tez həll etmək üçün aşağıdakı yerlərdən istifadə edə bilərsiniz.
      </p>

      <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: NAVY, margin: '0 0 14px', fontFamily: "'Raleway', sans-serif" }}>
          Yerləşmə
        </h3>
        <ul style={{ margin: 0, padding: '0 0 0 22px', fontSize: 15, color: MUTED, lineHeight: 2.1, fontFamily: FONT }}>
          <li>Giriş hollu — Blok A, zemin mərtəbə</li>
          <li>Pasiyent qəbul zonası — Blok B, 1-ci mərtəbə</li>
        </ul>
      </div>

      <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: NAVY, margin: '0 0 14px', fontFamily: "'Raleway', sans-serif" }}>
          Dəstəklənən kartlar
        </h3>
        <ul style={{ margin: 0, padding: '0 0 0 22px', fontSize: 15, color: MUTED, lineHeight: 2.1, fontFamily: FONT }}>
          <li>Visa, Mastercard, Maestro</li>
          <li>Azərbaycan yerli bank kartları (Kapital Bank, ABB, PASHA Bank və s.)</li>
          <li>Contactless (toxunuşsuz ödəniş)</li>
        </ul>
      </div>

      <div style={{
        background: 'rgba(20,143,153,0.06)',
        border: '1px solid rgba(20,143,153,0.2)',
        borderRadius: 8,
        padding: '16px 20px',
        fontFamily: FONT,
      }}>
        <p style={{ fontSize: 14, color: NAVY, margin: 0, lineHeight: 1.6 }}>
          <strong>İş saatları:</strong> Bankomatlar həftənin 7 günü, 24 saat istifadəyə açıqdır.
        </p>
      </div>
    </VisitorInfoDetail>
  );
}
