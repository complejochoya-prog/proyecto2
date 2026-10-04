import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';
import type { ReactNode } from 'react';

interface Props {
  allowedRoles: UserRole[];
  children: ReactNode;
}

export default function RoleGuard({ allowedRoles, children }: Props) {
  const { user, loading } = useAuth();
  const { negocioId } = useParams();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={negocioId ? `/${negocioId}/login` : '/login'} replace />;
  }

  if (!allowedRoles.includes(user.rol) && user.rol !== 'superadmin') {
    const redirectMap: Partial<Record<UserRole, string>> = {
      mozo: `/${negocioId}/app/mozos`,
      cocina: `/${negocioId}/cocina`,
      delivery: `/${negocioId}/app/delivery`,
      recepcion: `/${negocioId}/staff/recepcion`,
      cliente: `/${negocioId}`,
    };
    const fallback = redirectMap[user.rol] || (negocioId ? `/${negocioId}` : '/');
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}
