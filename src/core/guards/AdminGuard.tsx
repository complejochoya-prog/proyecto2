import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { ReactNode } from 'react';

export default function AdminGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const { negocioId } = useParams();

  if (loading) return null;

  if (!user) {
    return <Navigate to={negocioId ? `/${negocioId}/login` : '/login'} replace />;
  }

  const adminRoles = ['superadmin', 'admin', 'encargado'];
  if (!adminRoles.includes(user.rol)) {
    return <Navigate to={negocioId ? `/${negocioId}` : '/'} replace />;
  }

  return <>{children}</>;
}
