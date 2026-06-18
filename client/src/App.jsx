import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import useLegacyI18nDom from './hooks/useLegacyI18nDom';
import { AuthProvider } from './context/AuthContext';
import Navbar           from './components/Navbar';
import Footer           from './components/Footer';
import PageLoader       from './components/ui/PageLoader';
import WhatsAppButton  from './components/ui/WhatsAppButton';
import ProtectedRoute   from './components/ui/ProtectedRoute';

/* Public */
import HomePage         from './pages/public/HomePage';
import UserProfilePage  from './pages/public/UserProfilePage';
import NotFoundPage     from './pages/public/NotFoundPage';
import RandevuPage      from './pages/public/RandevuPage';
import ComingSoon            from './pages/public/ComingSoon';
import PatientStoriesPage   from './pages/public/PatientStoriesPage';
import HekimlerPage          from './pages/public/HekimlerPage';
import HekimProfilPage       from './pages/public/HekimProfilPage';
import DepartmentsPage       from './pages/public/DepartmentsPage';
import DepartmentDetailPage  from './pages/public/DepartmentDetailPage';
import ServicesPage          from './pages/public/ServicesPage';
import BlogPage              from './pages/public/BlogPage';
import BlogDetailPage        from './pages/public/BlogDetailPage';
import ContactPage           from './pages/public/ContactPage';
import ENeticePage           from './pages/public/ENeticePage';
import ElektronMuraciet     from './pages/public/ElektronMuraciet';
import AdminLoginPage       from './pages/AdminLoginPage';
import AdminDashboard       from './pages/admin/AdminDashboard';
import AdminDoctors         from './pages/admin/AdminDoctors';
import AdminPatients        from './pages/admin/AdminPatients';
import AdminAppointments    from './pages/admin/AdminAppointments';
import AdminMuraciet        from './pages/admin/AdminMuraciet'
import AdminUsers           from './pages/admin/AdminUsers'
import AdminDepartments     from './pages/admin/AdminDepartments';
import AdminBlog            from './pages/admin/AdminBlog';
import AdminBilling         from './pages/admin/AdminBilling';
import AdminAnalitika       from './pages/admin/AdminAnalitika';
import AdminAuditLog        from './pages/admin/AdminAuditLog';
import AdminAnbar           from './pages/admin/AdminAnbar';
import AdminPriceList       from './pages/admin/AdminPriceList';
import AdminSettings        from './pages/admin/AdminSettings';
import AdminDischarge       from './pages/admin/AdminDischarge';
import AdminEHR             from './pages/admin/AdminEHR';
import AdminServices        from './pages/admin/AdminServices';
import NurseDashboard       from './pages/nurse/NurseDashboard';
import ReceptionistDashboard from './pages/receptionist/ReceptionistDashboard';
import AdminLab             from './pages/admin/AdminLab';
import LabTechDashboard     from './pages/lab/LabTechDashboard';
import DoctorDashboard      from './pages/doctor/DoctorDashboard'
import DoctorPatients       from './pages/doctor/DoctorPatients'
import DoctorPrescriptions  from './pages/doctor/DoctorPrescriptions'
import DoctorAnalyses       from './pages/doctor/DoctorAnalyses'
import DoctorProfile        from './pages/doctor/DoctorProfile';

/* Auth */
import Login            from './pages/auth/Login';
import StaffLogin       from './pages/auth/StaffLogin';
import Register         from './pages/auth/Register';
import ForgotPassword   from './pages/auth/ForgotPassword';

/* Patient */
import PatientPortal    from './pages/patient/PatientPortal';
import PatientMessages  from './pages/patient/PatientMessages';

/* Dashboard */
import DashboardLayout  from './pages/dashboard/DashboardLayout';
import DashboardHome    from './pages/dashboard/DashboardHome';
import PatientsPage     from './pages/dashboard/PatientsPage';
import DoctorsPage      from './pages/dashboard/DoctorsPage';
import AppointmentsPage from './pages/dashboard/AppointmentsPage';
import WardsPage        from './pages/dashboard/WardsPage';
import SiteDoctorsPage  from './pages/dashboard/SiteDoctorsPage';

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

/* Pages that hide the public navbar/footer */
const HIDE_CHROME_EXACT  = new Set(['/login', '/staff-login', '/register', '/forgot-password', '/randevu', '/e-netice', '/admin']);
const HIDE_CHROME_PREFIX = ['/dashboard', '/patient', '/admin', '/doctor'];

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'];
const DOCTOR_ROLES = ['DOCTOR'];
const NURSE_ROLES = ['NURSE'];
const RECEPTIONIST_ROLES = ['RECEPTIONIST'];
const LAB_ROLES = ['LAB_TECHNICIAN'];
const PATIENT_ROLES = ['PATIENT'];
const DASHBOARD_ROLES = ['ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'LAB_TECHNICIAN'];

function getStoredUserRole() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null')?.role?.toUpperCase();
  } catch {
    return null;
  }
}

function AdminEntryRoute() {
  const token = localStorage.getItem('token');
  const role = getStoredUserRole();

  if (!token || !role) return <AdminLoginPage />;
  if (ADMIN_ROLES.includes(role)) return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/" replace />;
}

function Layout() {
  useLegacyI18nDom();
  const { pathname } = useLocation();
  const hideChrome = HIDE_CHROME_EXACT.has(pathname) ||
    HIDE_CHROME_PREFIX.some(p => pathname.startsWith(p));

  return (
    <>
      {!hideChrome && <Navbar />}
      <Routes>
        {/* ── Public ── */}
        <Route path="/"            element={<HomePage />} />
        <Route path="/about"       element={<ComingSoon title="Haqqımızda" />} />
        <Route path="/doctors"     element={<ComingSoon title="Həkimlər" />} />
        <Route path="/departments" element={<DepartmentsPage />} />
        <Route path="/departments/:slug" element={<DepartmentDetailPage />} />
        <Route path="/services"    element={<ServicesPage />} />
        <Route path="/patients"    element={<ComingSoon title="Pasiyent Mərkəzi" />} />
        <Route path="/blog"        element={<BlogPage />} />
        <Route path="/blog/:slug"  element={<BlogDetailPage />} />
        <Route path="/contact"     element={<ContactPage />} />
        <Route path="/pasiyent-hekayeleri" element={<PatientStoriesPage />} />
        <Route path="/hekimler"            element={<HekimlerPage />} />
        <Route path="/hekimler/:id"        element={<HekimProfilPage />} />
        <Route path="/randevu"             element={<RandevuPage />} />
        <Route path="/e-netice"            element={<ENeticePage />} />
        <Route path="/elektron-muraciet"   element={<ElektronMuraciet />} />
        <Route path="/profile"             element={<UserProfilePage />} />

        {/* ── Admin ── */}
        <Route path="/admin"              element={<AdminEntryRoute />} />
        <Route element={<ProtectedRoute allowedRoles={ADMIN_ROLES} loginPath="/admin" />}>
          <Route path="/admin/dashboard"    element={<AdminDashboard />} />
          <Route path="/admin/doctors"      element={<AdminDoctors />} />
          <Route path="/admin/patients"     element={<AdminPatients />} />
          <Route path="/admin/appointments" element={<AdminAppointments />} />
          <Route path="/admin/muraciet"     element={<AdminMuraciet />} />
          <Route path="/admin/users"        element={<AdminUsers />} />
          <Route path="/admin/departments"  element={<AdminDepartments />} />
          <Route path="/admin/blog"         element={<AdminBlog />} />
          <Route path="/admin/billing"      element={<AdminBilling />} />
          <Route path="/admin/lab"          element={<AdminLab />} />
          <Route path="/admin/inventory"    element={<AdminAnbar />} />
          <Route path="/admin/pricelist"    element={<AdminPriceList />} />
          <Route path="/admin/analytics"    element={<AdminAnalitika />} />
          <Route path="/admin/audit-log"    element={<AdminAuditLog />} />
          <Route path="/admin/settings"     element={<AdminSettings />} />
          <Route path="/admin/discharge"    element={<AdminDischarge />} />
          <Route path="/admin/ehr/:patientId" element={<AdminEHR />} />
          <Route path="/admin/services"     element={<AdminServices />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={NURSE_ROLES} loginPath="/admin" />}>
          <Route path="/nurse"              element={<NurseDashboard />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={RECEPTIONIST_ROLES} loginPath="/admin" />}>
          <Route path="/receptionist"       element={<ReceptionistDashboard />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={LAB_ROLES} loginPath="/admin" />}>
          <Route path="/lab"                element={<LabTechDashboard />} />
        </Route>

        {/* ── Doctor ── */}
        <Route element={<ProtectedRoute allowedRoles={DOCTOR_ROLES} loginPath="/admin" />}>
          <Route path="/doctor"               element={<Navigate to="/doctor/dashboard" replace />} />
          <Route path="/doctor/dashboard"     element={<DoctorDashboard />} />
          <Route path="/doctor/patients"      element={<DoctorPatients />} />
          <Route path="/doctor/prescriptions" element={<DoctorPrescriptions />} />
          <Route path="/doctor/analyses"      element={<DoctorAnalyses />} />
          <Route path="/doctor/profile"       element={<DoctorProfile />} />
        </Route>

        {/* ── Auth ── */}
        <Route path="/login"           element={<Login />} />
        <Route path="/staff-login"     element={<StaffLogin />} />
        <Route path="/register"        element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* ── Patient portal ── */}
        <Route element={<ProtectedRoute allowedRoles={PATIENT_ROLES} />}>
          <Route path="/patient"          element={<PatientPortal />} />
          <Route path="/patient/messages" element={<PatientMessages />} />
        </Route>

        {/* ── Staff dashboard ── */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={DASHBOARD_ROLES}>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index               element={<DashboardHome />} />
          <Route path="patients"     element={<PatientsPage />} />
          <Route path="doctors"      element={<DoctorsPage />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="wards"        element={<WardsPage />} />
          <Route path="site-doctors" element={<SiteDoctorsPage />} />
        </Route>

        {/* ── Catch-all ── */}
        <Route path="*" element={<NotFoundPage />} />
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
      {!hideChrome && <Footer />}
    </>
  );
}

// Sync HTML lang attribute whenever language changes
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
});
// Set on initial load
document.documentElement.lang = i18n.language || 'az';

function PublicWhatsApp() {
  const { pathname } = useLocation();
  const isPanel =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/crm') ||
    pathname.startsWith('/patient') ||
    pathname.startsWith('/doctor') ||
    pathname.startsWith('/nurse') ||
    pathname.startsWith('/receptionist') ||
    pathname.startsWith('/lab');
  return isPanel ? null : <WhatsAppButton />;
}

export default function App() {
  return (
    <AuthProvider>
      <I18nextProvider i18n={i18n}>
        <BrowserRouter>
          <RouteLoader />
          <Layout />
          <PublicWhatsApp />
        </BrowserRouter>
      </I18nextProvider>
    </AuthProvider>
  );
}
