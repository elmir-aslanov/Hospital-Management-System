import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import PublicNavbar from './components/PublicNavbar';
import HomePage    from './pages/public/HomePage';
import DoctorsPage from './pages/public/DoctorsPage';
import BookingPage from './pages/public/BookingPage';
import AboutPage   from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import LoginPage   from './pages/LoginPage';
import AppShell    from './components/AppShell';

function PublicLayout({ children }) {
  return (
    <>
      <PublicNavbar/>
      {children}
    </>
  );
}

function PrivateRoute({ children }) {
  const token = localStorage.getItem('accessToken');
  return token ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"           element={<PublicLayout><HomePage/></PublicLayout>} />
      <Route path="/hekimler"   element={<PublicLayout><DoctorsPage/></PublicLayout>} />
      <Route path="/sobeler"    element={<PublicLayout><HomePage/></PublicLayout>} />
      <Route path="/haqqimizda" element={<PublicLayout><AboutPage/></PublicLayout>} />
      <Route path="/elaqe"      element={<PublicLayout><ContactPage/></PublicLayout>} />
      <Route path="/randevu"    element={<PublicLayout><BookingPage/></PublicLayout>} />

      {/* Auth */}
      <Route path="/login"    element={<LoginPage/>} />

      {/* Protected dashboard */}
      <Route path="/dashboard/*" element={<PrivateRoute><AppShell/></PrivateRoute>} />

      {/* Redirect /admin → /dashboard */}
      <Route path="/admin/*" element={<Navigate to="/dashboard" replace/>} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes/>
    </BrowserRouter>
  );
}
