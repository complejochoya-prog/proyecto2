import { Outlet, NavLink, useParams } from 'react-router-dom';
import { Icon } from '../../components/ui/Icon';

export default function ClientLayout() {
  const { negocioId } = useParams();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex-1 flex flex-col items-center py-2 text-[10px] font-medium gap-0.5 ${
      isActive ? 'text-amber-400' : 'text-slate-500'
    }`;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col max-w-lg mx-auto">
      <header className="sticky top-0 z-30 bg-[#0a0a0f]/95 backdrop-blur border-b border-white/5 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <Icon name="bolt" className="text-black" size={18} />
          </div>
          <div>
            <p className="font-black text-sm tracking-tight leading-none">
              COMPLEJO <span className="text-amber-400">GIOVANNI</span>
            </p>
            <p className="text-[9px] text-slate-500 uppercase tracking-wider">Centro deportivo</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-full hover:bg-white/5">
            <Icon name="notifications" size={20} className="text-slate-400" />
          </button>
          <button className="p-2 rounded-full hover:bg-white/5">
            <Icon name="menu" size={20} className="text-slate-400" />
          </button>
        </div>
      </header>

      <main className="flex-1 pb-20">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-[#12121a]/95 backdrop-blur border-t border-white/5 flex z-30 px-1">
        <NavLink to={`/${negocioId}`} end className={linkClass}>
          {({ isActive }) => (
            <>
              <span className={`p-1.5 rounded-xl ${isActive ? 'bg-amber-400 text-black' : ''}`}>
                <Icon name="home" size={20} />
              </span>
              Inicio
            </>
          )}
        </NavLink>
        <NavLink to={`/${negocioId}/reservar`} className={linkClass}>
          {({ isActive }) => (
            <>
              <span className={`p-1.5 rounded-xl ${isActive ? 'bg-amber-400 text-black' : ''}`}>
                <Icon name="calendar_month" size={20} />
              </span>
              Reservar
            </>
          )}
        </NavLink>
        <NavLink to={`/${negocioId}/menu`} className={linkClass}>
          {({ isActive }) => (
            <>
              <span className={`p-1.5 rounded-xl ${isActive ? 'bg-amber-400 text-black' : ''}`}>
                <Icon name="restaurant" size={20} />
              </span>
              Bar
            </>
          )}
        </NavLink>
        <NavLink to={`/${negocioId}/mis-reservas`} className={linkClass}>
          {({ isActive }) => (
            <>
              <span className={`p-1.5 rounded-xl ${isActive ? 'bg-amber-400 text-black' : ''}`}>
                <Icon name="person" size={20} />
              </span>
              Cuenta
            </>
          )}
        </NavLink>
      </nav>
    </div>
  );
}
