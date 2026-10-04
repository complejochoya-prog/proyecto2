import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSuperAdminStore } from '../../store/useSuperAdminStore';
import { Icon } from '../../components/ui/Icon';

const planColors: Record<string, string> = {
  trial: 'bg-slate-500/10 text-slate-600',
  basic: 'bg-blue-500/10 text-blue-600',
  pro: 'bg-violet-500/10 text-violet-600',
  enterprise: 'bg-amber-500/10 text-amber-600',
};

export default function TenantsPage() {
  const tenants = useSuperAdminStore((s) => s.tenants);
  const createTenant = useSuperAdminStore((s) => s.createTenant);
  const toggleTenantActive = useSuperAdminStore((s) => s.toggleTenantActive);
  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState('');
  const [slug, setSlug] = useState('');
  const [plan, setPlan] = useState<'trial' | 'basic' | 'pro' | 'enterprise'>('trial');
  const [search, setSearch] = useState('');

  const filtered = tenants.filter(
    (t) =>
      t.nombre.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.includes(search.toLowerCase())
  );

  const handleCreate = () => {
    if (!nombre.trim() || !slug.trim()) return;
    createTenant({ nombre, slug, plan });
    setNombre('');
    setSlug('');
    setPlan('trial');
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Negocios (Tenants)</h1>
          <p className="text-slate-500 text-sm">{tenants.length} complejos registrados</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium"
        >
          <Icon name="add" />
          Nuevo negocio
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <h3 className="font-semibold">Crear nuevo tenant</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value);
                if (!slug) setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
              }}
              placeholder="Nombre del complejo"
              className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
              placeholder="slug (url)"
              className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value as any)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            >
              <option value="trial">Trial</option>
              <option value="basic">Basic</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} className="px-4 py-2 rounded-xl bg-violet-600 text-white font-medium">
              Crear
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-slate-500">
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="relative">
        <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o slug..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
        />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800">
                <th className="p-4 font-medium">Negocio</th>
                <th className="p-4 font-medium">Plan</th>
                <th className="p-4 font-medium">Usuarios</th>
                <th className="p-4 font-medium">Módulos</th>
                <th className="p-4 font-medium">Estado</th>
                <th className="p-4 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((t) => {
                const activeMods = Object.values(t.modulos).filter(Boolean).length;
                return (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-4">
                      <Link to={`/superadmin/tenants/${t.id}`} className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-sm">
                          {t.nombre.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{t.nombre}</p>
                          <p className="text-xs text-slate-500">/{t.slug}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${planColors[t.plan]}`}>
                        {t.plan}
                      </span>
                    </td>
                    <td className="p-4">{t.usuariosCount}</td>
                    <td className="p-4">{activeMods}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          t.isActive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'
                        }`}
                      >
                        {t.isActive ? 'Activo' : 'Suspendido'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <Link
                          to={`/superadmin/tenants/${t.id}`}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Ver detalle"
                        >
                          <Icon name="visibility" size={18} />
                        </Link>
                        <button
                          onClick={() => toggleTenantActive(t.id)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                          title={t.isActive ? 'Suspender' : 'Activar'}
                        >
                          <Icon name={t.isActive ? 'block' : 'check_circle'} size={18} />
                        </button>
                        <a
                          href={`/${t.slug}/dashboard`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Abrir panel"
                        >
                          <Icon name="open_in_new" size={18} />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
