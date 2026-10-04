import { useSuperAdminStore } from '../../store/useSuperAdminStore';
import { Icon } from '../../components/ui/Icon';

export default function ModulosPage() {
  const modulesCatalog = useSuperAdminStore((s) => s.modulesCatalog);
  const tenants = useSuperAdminStore((s) => s.tenants);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Catálogo de Módulos</h1>
        <p className="text-slate-500 text-sm">
          Módulos disponibles para activar en cada tenant
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {modulesCatalog.map((mod) => {
          const enabledCount = tenants.filter((t) => t.modulos[mod.id]).length;
          return (
            <div
              key={mod.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5"
            >
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
                  <Icon name="extension" className="text-violet-600" size={22} />
                </div>
                <div>
                  <h3 className="font-bold">{mod.label}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{mod.description}</p>
                  <p className="text-xs font-medium text-violet-600 mt-2">
                    Activo en {enabledCount} de {tenants.length} negocios
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
