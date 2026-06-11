import { Navigate, Outlet, useLocation } from 'react-router-dom';

const SAFE_ROUTE_BY_ROLE = {
  ADMIN: '/admin/dashboard',
  SUPER_ADMIN: '/admin/dashboard',
  DOCTOR: '/doctor/dashboard',
  NURSE: '/nurse',
  RECEPTIONIST: '/receptionist',
  LAB_TECHNICIAN: '/lab',
  PATIENT: '/patient',
};

function getStoredJson(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null');
  } catch {
    return null;
  }
}

function getStoredAuth() {
  return {
    token: localStorage.getItem('token'),
    user: getStoredJson('user'),
  };
}

export default function ProtectedRoute({
  children,
  allowedRoles,
  loginPath = '/login',
  unauthorizedPath,
}) {
  const location = useLocation();
  const { token, user } = getStoredAuth();

  if (!token) {
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  const role = user?.role?.toUpperCase();

  if (allowedRoles?.length) {
    const normalizedAllowedRoles = allowedRoles.map(item => item.toUpperCase());

    if (!role) {
      return <Navigate to={loginPath} state={{ from: location }} replace />;
    }

    if (!normalizedAllowedRoles.includes(role)) {
      return <Navigate to={unauthorizedPath || SAFE_ROUTE_BY_ROLE[role] || '/'} replace />;
    }
  }

  return children || <Outlet />;
}
