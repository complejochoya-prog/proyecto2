import { useMesasStore } from '../../store/useMesasStore';
import { Icon } from '../../components/ui/Icon';

function formatMoney(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
}

export default function DeliveryHistorial() {
  const pedidos = useMesasStore((s) => s.pedidos);
  const historial = pedidos
    .filter((p) => p.tipoPedido === 'delivery' && p.estado === 'entregado')
    .slice()
    .reverse();

  return (
    <div className="p-4 space-y-3">
      <h1 className="text-lg font-bold">Historial de entregas</h1>

      {historial.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <Icon name="history" size={48} className="mx-auto mb-3 opacity-40" />
          <p>Todavía no hay entregas</p>
        </div>
      ) : (
        historial.map((p) => (
          <div
            key={p.id}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Icon name="check" className="text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{p.clienteNombre || 'Cliente'}</p>
              <p className="text-xs text-slate-500">
                {p.items.length} ítems · {new Date(p.createdAt).toLocaleString('es-AR', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <span className="font-bold text-emerald-600">{formatMoney(p.total)}</span>
          </div>
        ))
      )}
    </div>
  );
}
