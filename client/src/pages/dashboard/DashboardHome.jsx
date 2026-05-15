/* eslint-disable */
import { useFetch } from '../../hooks/useFetch';
import Icons from '../../components/Icons';

const TEAL = '#00848e';

const KPI_ITEMS = [
  { label: 'Pasiyentlər', endpoint: '/patients?limit=1', field: 'total',   ico: Icons.Users,       bg: '#e6f4f5', color: TEAL       },
  { label: 'Həkimlər',    endpoint: '/doctors?limit=1',  field: 'total',   ico: Icons.Stethoscope, bg: '#ede9fe', color: '#7c3aed'  },
  { label: 'Randevular',  endpoint: '/appointments?limit=1', field: 'total', ico: Icons.Calendar,  bg: '#fef3c7', color: '#d97706'  },
  { label: 'Palatalar',   endpoint: '/wards',            field: 'length',  ico: Icons.Bed,         bg: '#dbeafe', color: '#2563eb'  },
];

function KpiCard({ label, endpoint, field, ico: Ico, bg, color }) {
  const { data, loading } = useFetch(endpoint.split('?')[0], Object.fromEntries(new URLSearchParams(endpoint.split('?')[1] || '')));
  const value = field === 'length'
    ? (data?.wards?.length ?? '—')
    : (data?.total ?? data?.[field] ?? '—');

  return (
    <div className="kpi">
      <div className="kpi-head">
        <span className="kpi-lbl">{label}</span>
        <div className="kpi-ico" style={{ background: bg, color }}>
          <Ico size={20} />
        </div>
      </div>
      {loading
        ? <div style={{ height: 30, borderRadius: 6, background: 'var(--em-slate-100)', animation: 'pulse 1.5s ease-in-out infinite', width: 60 }} />
        : <div className="kpi-num">{value}</div>
      }
    </div>
  );
}

export default function DashboardHome() {
  let user = {};
  try { user = JSON.parse(localStorage.getItem('user') || '{}'); } catch {}

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Xoş gəldiniz, {user.fullName?.split(' ')[0] || 'İstifadəçi'} 👋</h1>
          <p>Aslan Medical Center — İdarəetmə Paneli</p>
        </div>
      </div>

      <div className="kpi-grid">
        {KPI_ITEMS.map(item => <KpiCard key={item.label} {...item} />)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="panel" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg)', marginBottom: 16 }}>
            Sürətli Keçid
          </h3>
          {[
            { label: 'Pasiyent siyahısı', href: '/dashboard/patients' },
            { label: 'Həkim siyahısı',   href: '/dashboard/doctors' },
            { label: 'Randevular',        href: '/dashboard/appointments' },
            { label: 'Palatalar',         href: '/dashboard/wards' },
          ].map(({ label, href }) => (
            <a key={href} href={href} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 0', borderBottom: '1px solid var(--border)',
              textDecoration: 'none', color: 'var(--fg)',
              fontSize: 14, fontWeight: 500,
            }}>
              {label}
              <Icons.ChevronRight size={16} style={{ color: 'var(--fg-muted)' }} />
            </a>
          ))}
        </div>

        <div className="panel" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg)', marginBottom: 16 }}>
            Hesab Məlumatı
          </h3>
          {[
            { k: 'Ad Soyad', v: user.fullName || '—' },
            { k: 'E-poçt',   v: user.email || '—'    },
            { k: 'Rol',      v: user.role || '—'      },
          ].map(({ k, v }) => (
            <div key={k} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0', borderBottom: '1px solid var(--border)',
              fontSize: 14,
            }}>
              <span style={{ color: 'var(--fg-muted)', fontWeight: 500 }}>{k}</span>
              <span style={{ color: 'var(--fg)', fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
