import { useParams, Link } from 'react-router-dom';
import { useSuperAdminStore } from '../../store/useSuperAdminStore';
import { Icon } from '../../components/ui/Icon';
import type { ModuleId } from '../../types';

export default function TenantDetail() {
  const { tenantId } = useParams();
  const tenants = useSuperAdminStore((s) => s.tenants);
  const modulesCatalog = useSuperAdminStore((s) => s.modulesCatalog);
  const toggleModule = useSuperAdminStore((s) => s.toggleModule);
  const updatePlan = useSuperAdminStore((s) => s.updatePlan);
  const toggleTenantActive = useSuperAdminStore((s) => s.toggleTenantActive);

  const tenant = tenants.find((t) => t.id === tenantId || t.slug === tenantId);

  if (!tenant) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Tenant no encontrado</p>
        <Link to="/superadmin/tenants" className="text-violet-600 font-medium mt-2 inline-block">
          Volver
        </Link>
      </div>
    );
  }

  const activeCount = Object.values(tenant.modulos).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <Link
          to="/superadmin/tenants"
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 mt-1"
        >
          <Icon name="arrow_back" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">{tenant.nombre}</h1>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                tenant.isActive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'
              }`}
            >
              {tenant.isActive ? 'Activo' : 'Suspendido'}
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-0.5">
            /{tenant.slug} · Creado {tenant.createdAt}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => toggleTenantActive(tenant.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium ${
              tenant.isActive
                ? 'bg-red-500/10 text-red-600 hover:bg-red-500/20'
                : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
            }`}
          >
            {tenant.isActive ? 'Suspender' : 'Activar'}
          </button>
          <a
            href={`/${tenant.slug}/dashboard`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-medium flex items-center gap-1"
          >
            <Icon name="open_in_new" size={16} />
            Abrir panel
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Plan', value: tenant.plan },
          { label: 'Usuarios', value: tenant.usuariosCount },
          { label: 'Mesas', value: tenant.mesasCount },
          { label: 'Espacios', value: tenant.espaciosCount },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4"
          >
            <p className="text-xs text-slate-500 uppercase">{s.label}</p>
            <p className="text-lg font-bold capitalize mt-0.5">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Plan selector */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
        <h3 className="font-semibold mb-3">Plan de suscripción</h3>
        <div className="flex flex-wrap gap-2">
          {(['trial', 'basic', 'pro', 'enterprise'] as const).map((p) => (
            <button
              key={p}
              onClick={() => updatePlan(tenant.id, p)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${
                tenant.plan === p
                  ? 'bg-violet-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Modules */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Módulos habilitados</h3>
          <span className="text-sm text-slate-500">{activeCount} activos</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {modulesCatalog.map((mod) => {
            const enabled = tenant.modulos[mod.id as ModuleId];
            return (
              <button
                key={mod.id}
                onClick={() => toggleModule(tenant.id, mod.id as ModuleId)}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  enabled
                    ? 'border-violet-500/40 bg-violet-500/5'
                    : 'border-slate-200 dark:border-slate-700 opacity-60'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    enabled ? 'bg-violet-600 text-white' : 'bg-slate-100 dark:bg-slate-800'
                  }`}
                >
                  <Icon name={enabled ? 'check' : 'close'} size={20} />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm">{mod.label}</p>
                  <p className="text-xs text-slate-500 truncate">{mod.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
