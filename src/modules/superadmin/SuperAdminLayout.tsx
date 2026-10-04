import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Icon } from '../../components/ui/Icon';

const nav = [
  { to: '/superadmin', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/superadmin/tenants', label: 'Negocios', icon: 'store' },
  { to: '/superadmin/planes', label: 'Planes', icon: 'payments' },
  { to: '/superadmin/modulos', label: 'Módulos', icon: 'extension' },
];

export default function SuperAdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-black">
      <aside className="fixed left-0 top-0 z-40 h-screen w-60 bg-slate-900 text-white flex flex-col">
        <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-700">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Icon name="admin_panel_settings" className="text-white" size={22} />
          </div>
          <div>
            <p className="font-bold text-sm">SuperAdmin</p>
            <p className="text-[10px] text-slate-400">SaaS Console</p>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-violet-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon name={item.icon} size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center text-sm font-bold">
              {user?.nombre?.charAt(0) || 'S'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.nombre}</p>
              <p className="text-[10px] text-slate-400">superadmin</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <Icon name="logout" size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="pl-60 min-h-screen">
        <div className="p-6 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
