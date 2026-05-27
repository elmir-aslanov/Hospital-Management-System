import AdminLayout from '../../components/admin/AdminLayout'

const DEPARTMENTS = [
  { name: 'Kardiologiya',    icon: '🫀', count: 0, color: '#ef4444' },
  { name: 'Cərrahiyyə',      icon: '🔬', count: 0, color: '#7c3aed' },
  { name: 'Nevrologiya',     icon: '🧠', count: 0, color: '#2563eb' },
  { name: 'Pediatriya',      icon: '👶', count: 0, color: '#16a34a' },
  { name: 'Ortopediya',      icon: '🦴', count: 0, color: '#d97706' },
  { name: 'Endokrinologiya', icon: '⚗️',  count: 0, color: '#0891b2' },
  { name: 'Oftalmologiya',   icon: '👁️',  count: 0, color: '#db2777' },
  { name: 'Dermatologiya',   icon: '🩺',  count: 0, color: '#059669' },
]

export default function AdminDepartments() {
  return (
    <AdminLayout activePage="departments">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Şöbələr</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#94a3b8' }}>Klinik şöbələrin idarəsi</p>
      </div>

      <div style={{
        background: 'white', borderRadius: 14, border: '1px solid #e2e8f0',
        padding: 32, textAlign: 'center', marginBottom: 28,
      }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🏗️</div>
        <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Tezliklə</h2>
        <p style={{ margin: 0, fontSize: 14, color: '#94a3b8', maxWidth: 400, margin: '0 auto' }}>
          Şöbə idarəetmə modulu hazırlanır. Hazırda mövcud şöbələri aşağıda görə bilərsiniz.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {DEPARTMENTS.map(dep => (
          <div key={dep.name} style={{
            background: 'white', borderRadius: 14, border: '1px solid #e2e8f0',
            padding: 20, display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12, flexShrink: 0,
              background: `${dep.color}15`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22,
            }}>{dep.icon}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{dep.name}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Şöbə</div>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  )
}
