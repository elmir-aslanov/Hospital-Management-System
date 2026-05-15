import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import Navbar           from './components/Navbar';
import ProtectedRoute   from './components/ui/ProtectedRoute';

/* Public */
import HomePage         from './pages/public/HomePage';
import ComingSoon       from './pages/public/ComingSoon';

/* Auth */
import Login            from './pages/auth/Login';
import StaffLogin       from './pages/auth/StaffLogin';
import Register         from './pages/auth/Register';
import ForgotPassword   from './pages/auth/ForgotPassword';

/* Patient */
import PatientPortal    from './pages/patient/PatientPortal';

/* Dashboard */
import DashboardLayout  from './pages/dashboard/DashboardLayout';
import DashboardHome    from './pages/dashboard/DashboardHome';
import PatientsPage     from './pages/dashboard/PatientsPage';
import DoctorsPage      from './pages/dashboard/DoctorsPage';
import AppointmentsPage from './pages/dashboard/AppointmentsPage';
import WardsPage        from './pages/dashboard/WardsPage';

/* Pages that hide the public navbar */
const HIDE_NAV_EXACT  = new Set(['/login', '/staff-login', '/register', '/forgot-password']);
const HIDE_NAV_PREFIX = ['/dashboard', '/patient'];

function Layout() {
  const { pathname } = useLocation();
  const hideNav = HIDE_NAV_EXACT.has(pathname) ||
    HIDE_NAV_PREFIX.some(p => pathname.startsWith(p));

  return (
    <>
      {!hideNav && <Navbar />}
      <Routes>
        {/* ── Public ── */}
        <Route path="/"            element={<HomePage />} />
        <Route path="/about"       element={<ComingSoon title="Haqqımızda" />} />
        <Route path="/doctors"     element={<ComingSoon title="Həkimlər" />} />
        <Route path="/departments" element={<ComingSoon title="Şöbələr" />} />
        <Route path="/services"    element={<ComingSoon title="Xidmətlər & Müalicələr" />} />
        <Route path="/patients"    element={<ComingSoon title="Pasiyent Mərkəzi" />} />
        <Route path="/blog"        element={<ComingSoon title="Bloq" />} />
        <Route path="/contact"     element={<ComingSoon title="Əlaqə" />} />

        {/* ── Auth ── */}
        <Route path="/login"           element={<Login />} />
        <Route path="/staff-login"     element={<StaffLogin />} />
        <Route path="/register"        element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* ── Patient portal ── */}
        <Route path="/patient" element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <PatientPortal />
          </ProtectedRoute>
        } />

        {/* ── Staff dashboard ── */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['ADMIN','SUPER_ADMIN','DOCTOR','NURSE','RECEPTIONIST','LAB_TECHNICIAN']}>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index               element={<DashboardHome />} />
          <Route path="patients"     element={<PatientsPage />} />
          <Route path="doctors"      element={<DoctorsPage />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="wards"        element={<WardsPage />} />
        </Route>
      </Routes>

      <Toaster
        position="top-right"
        richColors
        closeButton
        duration={3500}
        toastOptions={{
          style: {
            borderRadius: '14px',
            fontFamily: 'inherit',
            fontSize: '14px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          },
        }}
      />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
