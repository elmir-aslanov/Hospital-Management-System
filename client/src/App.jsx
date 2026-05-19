import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import Navbar           from './components/Navbar';
import PageLoader       from './components/ui/PageLoader';
import WhatsAppButton  from './components/ui/WhatsAppButton';
import ProtectedRoute   from './components/ui/ProtectedRoute';

/* Public */
import HomePage         from './pages/public/HomePage';
import RandevuPage      from './pages/public/RandevuPage';
import ComingSoon            from './pages/public/ComingSoon';
import PatientStoriesPage   from './pages/public/PatientStoriesPage';
import HekimlerPage          from './pages/public/HekimlerPage';

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

function RouteLoader() {
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [key, setKey] = useState(0)

  useEffect(() => {
    setLoading(true)
    setKey(prev => prev + 1)
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [location.pathname])

  return loading ? <PageLoader key={key} /> : null
}

/* Pages that hide the public navbar */
const HIDE_NAV_EXACT  = new Set(['/login', '/staff-login', '/register', '/forgot-password', '/randevu']);
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
        <Route path="/pasiyent-hekayeleri" element={<PatientStoriesPage />} />
        <Route path="/hekimler"            element={<HekimlerPage />} />
        <Route path="/randevu"             element={<RandevuPage />} />

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

// Sync HTML lang attribute whenever language changes
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
});
// Set on initial load
document.documentElement.lang = i18n.language || 'az';

export default function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <BrowserRouter>
        <RouteLoader />
        <Layout />
        <WhatsAppButton />
      </BrowserRouter>
    </I18nextProvider>
  );
}
