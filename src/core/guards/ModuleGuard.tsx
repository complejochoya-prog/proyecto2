import { Navigate, useParams } from 'react-router-dom';
import { useConfig } from '../services/ConfigContext';
import type { ModuleId } from '../../types';
import type { ReactNode } from 'react';

interface Props {
  moduleId: ModuleId;
  children: ReactNode;
}

export default function ModuleGuard({ moduleId, children }: Props) {
  const { config, loading, isModuleActive } = useConfig();
  const { negocioId } = useParams();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!config || !isModuleActive(moduleId)) {
    return <Navigate to={`/${negocioId}/marketplace/module/${moduleId}`} replace />;
  }

  return <>{children}</>;
}
