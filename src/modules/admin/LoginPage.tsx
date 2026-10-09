import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Icon } from '../../components/ui/Icon';

export default function LoginPage() {
  const [email, setEmail] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [pin, setPin] = useState('');
  const [mode, setMode] = useState<'email' | 'pin'>('email');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithPin } = useAuth();
  const navigate = useNavigate();
  const { negocioId } = useParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    let ok = false;
    if (mode === 'email') {
      ok = await login(email, password, negocioId ? 'tenant' : 'superadmin');
    } else {
      ok = await loginWithPin(pin, negocioId ? 'tenant' : 'superadmin');
    }

    setLoading(false);
    if (ok) {
      // Redirect based on role
      const stored = localStorage.getItem('giovanni-auth');
      let role = '';
      try { role = stored ? JSON.parse(stored).rol : ''; } catch {}
      if (role === 'superadmin') {
        navigate('/superadmin');
      } else if (role === 'mozo') {
        navigate(negocioId ? `/${negocioId}/app/mozos` : '/giovanni/app/mozos');
      } else if (role === 'delivery') {
        navigate(negocioId ? `/${negocioId}/app/delivery` : '/giovanni/app/delivery');
      } else if (role === 'cocina') {
        navigate(negocioId ? `/${negocioId}/cocina` : '/giovanni/cocina');
      } else {
        navigate(negocioId ? `/${negocioId}/dashboard` : '/giovanni/dashboard');
      }
    } else {
      setError(mode === 'email' ? 'Email o contraseña incorrectos' : 'PIN incorrecto');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4">
            <Icon name="sports_soccer" className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold">Complejo Giovanni</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Ingresá a tu panel de administración
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl">
          {/* Mode toggle */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 mb-6">
            <button
              type="button"
              onClick={() => setMode('email')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === 'email' ? 'bg-white dark:bg-slate-700 shadow' : 'text-slate-500'
              }`}
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => setMode('pin')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === 'pin' ? 'bg-white dark:bg-slate-700 shadow' : 'text-slate-500'
              }`}
            >
              PIN rápido
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'email' ? (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Correo o usuario</label>
                  <input
                    type="text"
                    autoCapitalize="none"
                    autoCorrect="off"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Contraseña</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium mb-1.5">PIN de acceso (4 dígitos)</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  required
                  placeholder="••••"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center text-2xl tracking-[0.5em]"
                />
              </div>
            )}

            {error && (
              <p className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 space-y-1">
            <p className="font-medium">Usuarios (todos con contraseña <strong>admin</strong>):</p>
            <p><strong>admin</strong> → Panel Admin</p>
            <p><strong>mozo</strong> → App Mozos</p>
            <p><strong>cocina</strong> → KDS Cocina</p>
            <p><strong>delivery</strong> → App Delivery</p>
            <p><strong>super</strong> → SuperAdmin SaaS</p>
            <p className="pt-1">PIN de prueba: 0000 (super), 1234 (admin), 5678 (mozo), 9012 (cocina), 7890 (delivery), 3456 (recepción)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
