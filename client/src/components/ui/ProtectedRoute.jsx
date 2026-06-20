import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const SAFE_ROUTE_BY_ROLE = {
  ADMIN: '/admin/dashboard',
  SUPER_ADMIN: '/admin/dashboard',
  DOCTOR: '/doctor/dashboard',
  NURSE: '/nurse',
  RECEPTIONIST: '/receptionist',
  LAB_TECHNICIAN: '/lab',
  PATIENT: '/patient',
  BAS_HEKIM: '/bas-hekim/dashboard',
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
  const { t } = useTranslation();
  const location = useLocation();
  const { token, user } = getStoredAuth();
  const role = user?.role?.toUpperCase();
  const normalizedAllowedRoles = allowedRoles?.length ? allowedRoles.map(item => item.toUpperCase()) : null;
  const isRoleMismatch = Boolean(token && normalizedAllowedRoles && role && !normalizedAllowedRoles.includes(role));

  useEffect(() => {
    if (isRoleMismatch) toast.error(t('permissions.sectionNotAvailable'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRoleMismatch, location.pathname]);

  if (!token) {
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (normalizedAllowedRoles) {
    if (!role) {
      return <Navigate to={loginPath} state={{ from: location }} replace />;
    }

    if (isRoleMismatch) {
      return <Navigate to={unauthorizedPath || SAFE_ROUTE_BY_ROLE[role] || '/'} replace />;
    }
  }

  return children || <Outlet />;
}
