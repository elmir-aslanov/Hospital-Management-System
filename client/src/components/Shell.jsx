/* eslint-disable */
import Icons from './Icons';

const NAV_BY_ROLE = {
  ADMIN: {
    name: 'Admin User', initials: 'AU', title: 'Admin',
    sections: [
      { label: 'Əsas', items: [
        { id: 'dashboard',    ico: 'TrendingUp', label: 'Dashboard' },
        { id: 'appointments', ico: 'Calendar',   label: 'Randevular' },
        { id: 'patients',     ico: 'User',       label: 'Pasiyentlər' },
        { id: 'doctors',      ico: 'Stethoscope',label: 'Həkimlər' },
      ]},
      { label: 'Klinika', items: [
        { id: 'wards',    ico: 'Bed',        label: 'Palatalar' },
        { id: 'pharmacy', ico: 'Pill',       label: 'Aptek' },
      ]},
    ]
  },
  DOCTOR: {
    initials: 'DR', title: 'Həkim',
    sections: [
      { label: 'İşim', items: [
        { id: 'dashboard', ico: 'TrendingUp', label: 'Dashboard' },
        { id: 'appointments', ico: 'Calendar', label: 'Randevularım' },
        { id: 'patients',  ico: 'User',       label: 'Pasiyentlərim' },
      ]},
    ]
  },
  NURSE: {
    initials: 'NR', title: 'Tibb bacısı',
    sections: [
      { label: 'Növbə', items: [
        { id: 'dashboard', ico: 'TrendingUp', label: 'Dashboard' },
        { id: 'wards',    ico: 'Bed',        label: 'Palatalar' },
      ]},
    ]
  },
  PATIENT: {
    initials: 'PT', title: 'Pasiyent',
    sections: [
      { label: 'Səhifələrim', items: [
        { id: 'dashboard',    ico: 'TrendingUp', label: 'Ana səhifə' },
        { id: 'appointments', ico: 'Calendar',   label: 'Randevularım' },
      ]},
    ]
  },
};

export function Sidebar({ role, currentPage, setCurrentPage, collapsed, user }) {
  const cfg = NAV_BY_ROLE[role] || NAV_BY_ROLE.ADMIN;
  const name = user?.fullName || cfg.name || role;
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="sidebar-head">
        <svg className="mark" viewBox="0 0 56 56" fill="none">
          <rect x="2" y="2" width="52" height="52" rx="14" fill="#F8FAFC"/>
          <rect x="24" y="12" width="8" height="32" rx="2" fill="#0A1628"/>
          <rect x="12" y="24" width="32" height="8" rx="2" fill="#0A1628"/>
          <path d="M6 40 L16 40 L20 28 L26 48 L33 18 L37 40 L50 40" stroke="#00BCD4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
        <div className="wordmark">Elmir<span>Med</span></div>
      </div>

      <div className="sidebar-role">
        <div className="avatar">{initials}</div>
        <div className="info">
          <p className="name">{name}</p>
          <p className="role">{cfg.title}</p>
        </div>
      </div>

      <nav>
        {cfg.sections.map((sec, si) => (
          <div className="nav-section" key={si}>
            <div className="nav-section-label">{sec.label}</div>
            {sec.items.map(item => {
              const Icon = Icons[item.ico] || Icons.User;
              return (
                <button key={item.id}
                  className={'nav-item' + (currentPage === item.id ? ' active' : '')}
                  onClick={() => setCurrentPage(item.id)}>
                  <Icon size={18}/>
                  <span className="label">{item.label}</span>
                  {item.badge && <span className="badge">{item.badge}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-foot">
        <button className="nav-item" onClick={() => {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }}>
          <Icons.LogOut size={18}/><span className="label">Çıxış</span>
        </button>
      </div>
    </aside>
  );
}

export function Topbar({ crumb, role, onToggle, user }) {
  const cfg = NAV_BY_ROLE[role] || NAV_BY_ROLE.ADMIN;
  const name = user?.fullName || cfg.name || role;
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <header className="topbar">
      <button className="toggle" onClick={onToggle} aria-label="Toggle sidebar">
        <Icons.PanelLeft size={18}/>
      </button>
      <div className="crumbs">
        <span>HMS</span><span>·</span><strong>{crumb}</strong>
      </div>
      <div className="search">
        <Icons.Search size={16} style={{color:'var(--fg-muted)'}}/>
        <input placeholder="Pasiyent, həkim, ID axtar…"/>
        <span className="kbd">⌘K</span>
      </div>
      <div className="actions">
        <button className="icon-btn" aria-label="Notifications"><Icons.Bell size={18}/><span className="dot"></span></button>
        <div className="me">
          <div className="avatar">{initials}</div>
          <div className="info">
            <div className="name">{name}</div>
            <div className="role">{cfg.title}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
