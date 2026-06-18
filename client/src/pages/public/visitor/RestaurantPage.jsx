import usePageTitle from '../../../hooks/usePageTitle';
import VisitorInfoDetail from './VisitorInfoDetail';

const FONT = "'Source Sans 3', 'Raleway', sans-serif";
const TEAL = '#148F99';
const NAVY = '#071B3B';
const MUTED = '#62718A';

export default function RestaurantPage() {
  usePageTitle('Restoran və rahatlıq zonası', 'Aslan Medical Center restoran və rahatlıq zonası haqqında məlumat.');
  return (
    <VisitorInfoDetail
      title="Restoran və rahatlıq zonası"
      breadcrumb="Restoran"
      image="/restoran.png"
      imageAlt="Aslan Medical Center restoran"
      imageLayout="top"
      imageFit="contain"
      imageMaxHeight={null}
      contentMaxWidth="none"
    >
      <p style={{ fontSize: 16, color: MUTED, lineHeight: 1.75, margin: '0 0 28px', fontFamily: FONT }}>
        Rəstoranımız həm pasiyentlər, həm də onların ailə üzvləri üçün rahat yemək və istirahət mühiti yaradır. Geniş menyumuz sayəsində günlük qida ehtiyaclarınızı qarşılaya bilərsiniz.
      </p>

      <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: NAVY, margin: '0 0 14px', fontFamily: "'Raleway', sans-serif" }}>
          Xidmətlər
        </h3>
        <ul style={{ margin: 0, padding: '0 0 0 22px', fontSize: 15, color: MUTED, lineHeight: 2.1, fontFamily: FONT }}>
          <li>Gündəlik dəyişən menyular</li>
          <li>Vegetarian seçimlər</li>
          <li>Xüsusi pəhriz menyu (həkimin tövsiyəsi ilə)</li>
          <li>Geniş rahat oturma sahəsi</li>
        </ul>
      </div>

      <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: NAVY, margin: '0 0 14px', fontFamily: "'Raleway', sans-serif" }}>
          İş saatları
        </h3>
        <div style={{ fontSize: 15, color: MUTED, fontFamily: FONT }}>
          <div style={{ display: 'flex', gap: 24, marginBottom: 6 }}>
            <span style={{ minWidth: 180 }}>Bazar ertəsi – Cümə</span>
            <span style={{ fontWeight: 600, color: NAVY }}>07:30 – 21:00</span>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            <span style={{ minWidth: 180 }}>Şənbə – Bazar</span>
            <span style={{ fontWeight: 600, color: NAVY }}>08:00 – 19:00</span>
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
          <strong>Yerləşmə:</strong> Restoran 2-ci mərtəbədə, asansörün yanındakı dəhlizin sonunda yerləşir. Rahatlıq zonasına restoran daxilindən daxil olmaq mümkündür.
        </p>
      </div>
    </VisitorInfoDetail>
  );
}
