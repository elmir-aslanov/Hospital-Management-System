import usePageTitle from '../../../hooks/usePageTitle';
import VisitorInfoDetail from './VisitorInfoDetail';

const FONT = "'Source Sans 3', 'Raleway', sans-serif";
const TEAL = '#148F99';
const NAVY = '#071B3B';
const MUTED = '#62718A';

const WIFI_SSID = 'ASLAN-MEDICAL-GUEST';

export default function WifiPage() {
  usePageTitle('Wi-Fi bağlantısı', 'Aslan Medical Center-də pulsuz Wi-Fi istifadəsi.');
  return (
    <VisitorInfoDetail
      title="Wi-Fi bağlantısı"
      breadcrumb="Wi-Fi bağlantısı"
    >
      <p style={{ fontSize: 16, color: MUTED, lineHeight: 1.75, margin: '0 0 32px', fontFamily: FONT }}>
        Aslan Medical Center-də pasiyentlər və ziyarətçilər üçün binanın bütün mərtəbələrini əhatə edən pulsuz simsiz internet xidməti mövcuddur.
      </p>

      <div style={{ marginBottom: 36 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: NAVY, margin: '0 0 14px', fontFamily: "'Raleway', sans-serif" }}>
          Şəbəkə adı (SSID)
        </h3>
        <div style={{
          display: 'inline-block',
          background: NAVY,
          color: '#ffffff',
          fontFamily: "'Courier New', monospace",
          fontSize: 17,
          fontWeight: 700,
          letterSpacing: '0.06em',
          padding: '10px 22px',
          borderRadius: 6,
        }}>
          {WIFI_SSID}
        </div>
      </div>

      <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: NAVY, margin: '0 0 14px', fontFamily: "'Raleway', sans-serif" }}>
          Necə qoşulmaq olar?
        </h3>
        <ol style={{ margin: 0, padding: '0 0 0 22px', fontSize: 15, color: MUTED, lineHeight: 2.2, fontFamily: FONT }}>
          <li>Telefonunuzun Wi-Fi parametrlərini açın.</li>
          <li>Mövcud şəbəkələr siyahısında <strong style={{ color: NAVY }}>{WIFI_SSID}</strong> şəbəkəsini seçin.</li>
          <li>Şifrə üçün resepsiyaya müraciət edin.</li>
          <li>Qoşulduqdan sonra brauzeri açın — əgər istiqamətləndirmə portalı görünsə, "Davam et" düyməsinə basın.</li>
        </ol>
      </div>

      <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: NAVY, margin: '0 0 14px', fontFamily: "'Raleway', sans-serif" }}>
          Əhatə dairəsi
        </h3>
        <ul style={{ margin: 0, padding: '0 0 0 22px', fontSize: 15, color: MUTED, lineHeight: 2.1, fontFamily: FONT }}>
          <li>Bütün xəstə palatalar (zemin – 5-ci mərtəbə)</li>
          <li>Gözləmə zonaları</li>
          <li>Kafeterya və restoran</li>
          <li>Qəbul hollu</li>
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
          <strong>Qeyd:</strong> Şəbəkə yalnız ziyarətçi istifadəsi üçündür. Şifrə resepsiyon masasından alına bilər.
        </p>
      </div>
    </VisitorInfoDetail>
  );
}
