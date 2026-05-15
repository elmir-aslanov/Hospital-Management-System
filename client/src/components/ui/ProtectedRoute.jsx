import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('token');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles) {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!allowedRoles.includes(user.role?.toUpperCase())) {
        return <Navigate to="/" replace />;
      }
    } catch {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
}
