import { Icon } from '../../components/ui/Icon';

const planes = [
  {
    id: 'trial',
    nombre: 'Trial',
    precio: 0,
    descripcion: '15 días de prueba',
    features: ['Hasta 2 canchas', 'Hasta 5 mesas', 'Módulos básicos', 'Soporte por email'],
    color: 'from-slate-500 to-slate-600',
  },
  {
    id: 'basic',
    nombre: 'Basic',
    precio: 29900,
    descripcion: 'Para complejos chicos',
    features: ['Hasta 4 canchas', 'Hasta 15 mesas', 'Reservas + Caja + Bar', 'App Mozos', 'Soporte prioritario'],
    color: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'pro',
    nombre: 'Pro',
    precio: 59900,
    descripcion: 'El más popular',
    features: ['Canchas ilimitadas', 'Mesas ilimitadas', 'Todos los módulos operativos', 'Delivery + KDS', 'Analytics básico', 'Soporte 24/7'],
    color: 'from-violet-500 to-purple-600',
    popular: true,
  },
  {
    id: 'enterprise',
    nombre: 'Enterprise',
    precio: 129900,
    descripcion: 'Para cadenas y clubs grandes',
    features: ['Todo Pro', 'Multi-sucursal', 'IoT Smart Center', 'Analytics AI', 'API access', 'Account manager'],
    color: 'from-amber-500 to-orange-600',
  },
];

function formatMoney(n: number) {
  if (n === 0) return 'Gratis';
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
}

export default function PlanesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Planes y Suscripciones</h1>
        <p className="text-slate-500 text-sm">Catálogo de planes disponibles en la plataforma</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {planes.map((p) => (
          <div
            key={p.id}
            className={`relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col ${
              p.popular ? 'ring-2 ring-violet-500' : ''
            }`}
          >
            {p.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-violet-600 text-white text-[10px] font-bold uppercase">
                Popular
              </span>
            )}
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center mb-4`}>
              <Icon name="payments" className="text-white" size={24} />
            </div>
            <h3 className="text-lg font-bold">{p.nombre}</h3>
            <p className="text-sm text-slate-500 mb-3">{p.descripcion}</p>
            <p className="text-3xl font-black mb-1">
              {formatMoney(p.precio)}
              {p.precio > 0 && <span className="text-sm font-normal text-slate-500">/mes</span>}
            </p>
            <ul className="mt-4 space-y-2 flex-1">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Icon name="check" size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
