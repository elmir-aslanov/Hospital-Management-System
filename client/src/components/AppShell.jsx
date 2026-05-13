import { useState } from 'react';
import { Sidebar, Topbar } from './Shell';
import AdminDashboard  from './AdminDashboard';
import PatientsPage    from '../pages/dashboard/PatientsPage';
import DoctorsPage     from '../pages/dashboard/DoctorsPage';
import AppointmentsPage from '../pages/dashboard/AppointmentsPage';
import WardsPage       from '../pages/dashboard/WardsPage';

const PAGE_LABELS = {
  dashboard:    'Dashboard',
  appointments: 'Randevular',
  patients:     'Pasiyentlər',
  doctors:      'Həkimlər',
  wards:        'Palatalar',
  pharmacy:     'Aptek',
};

const PAGES = {
  dashboard:    <AdminDashboard/>,
  patients:     <PatientsPage/>,
  doctors:      <DoctorsPage/>,
  appointments: <AppointmentsPage/>,
  wards:        <WardsPage/>,
};

export default function AppShell() {
  const [page, setPage]           = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);

  const user = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();
  const role = user?.role || 'ADMIN';

  return (
    <div className={`app-shell${collapsed ? ' collapsed' : ''}`}>
      <Sidebar role={role} currentPage={page} setCurrentPage={setPage} collapsed={collapsed} user={user}/>
      <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh', overflow:'auto' }}>
        <Topbar crumb={PAGE_LABELS[page] || page} role={role} onToggle={() => setCollapsed(c => !c)} user={user}/>
        <main className="main-content">
          {PAGES[page] || <AdminDashboard/>}
        </main>
      </div>
    </div>
  );
}
