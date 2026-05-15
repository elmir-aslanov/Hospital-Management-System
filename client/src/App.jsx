import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import Navbar from './components/Navbar';
import HomePage from './pages/public/HomePage';
import Login from './pages/auth/Login';
import StaffLogin from './pages/auth/StaffLogin';

const HIDE_NAV = ['/login', '/staff-login', '/register'];

function Layout() {
  const location = useLocation();
  const hideNav = HIDE_NAV.includes(location.pathname);
  return (
    <>
      {!hideNav && <Navbar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/staff-login" element={<StaffLogin />} />
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
