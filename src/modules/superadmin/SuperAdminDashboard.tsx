import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSuperAdminStore } from '../../store/useSuperAdminStore';
import { Icon } from '../../components/ui/Icon';

export default function SuperAdminDashboard() {
  const getStats = useSuperAdminStore((s) => s.getStats);
  const tenants = useSuperAdminStore((s) => s.tenants);
  const stats = useMemo(() => getStats(), [getStats, tenants]);

  const cards = [
    { label: 'Total Negocios', value: stats.totalTenants, icon: 'store', color: 'from-violet-500 to-purple-600' },
    { label: 'Activos', value: stats.activeTenants, icon: 'check_circle', color: 'from-emerald-500 to-teal-600' },
    { label: 'En Trial', value: stats.trialTenants, icon: 'hourglass_top', color: 'from-amber-500 to-orange-600' },
    { label: 'Usuarios totales', value: stats.totalUsers, icon: 'group', color: 'from-blue-500 to-indigo-600' },
  ];

  const recent = [...tenants]
    .sort((a, b) => (b.lastActive || '').localeCompare(a.lastActive || ''))
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">SuperAdmin Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Vista global de la plataforma SaaS
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex items-start gap-4"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center shrink-0`}>
              <Icon name={c.icon} className="text-white" size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase">{c.label}</p>
              <p className="text-2xl font-bold mt-1">{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="font-semibold">Negocios recientes</h2>
          <Link to="/superadmin/tenants" className="text-sm text-violet-600 font-medium">
            Ver todos
          </Link>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {recent.map((t) => (
            <Link
              key={t.id}
              to={`/superadmin/tenants/${t.id}`}
              className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-sm">
                {t.nombre.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{t.nombre}</p>
                <p className="text-xs text-slate-500">/{t.slug} · Plan {t.plan}</p>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  t.isActive
                    ? 'bg-emerald-500/10 text-emerald-600'
                    : 'bg-red-500/10 text-red-600'
                }`}
              >
                {t.isActive ? 'Activo' : 'Suspendido'}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
