import { useNavigate, useParams } from 'react-router-dom';
import { useMesasStore } from '../../store/useMesasStore';
import { useStore } from '../../store/useStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { Icon } from '../../components/ui/Icon';

function formatMoney(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
}

export default function DeliveryActivo() {
  const pedidos = useMesasStore((s) => s.pedidos);
  const updatePedidoEstado = useMesasStore((s) => s.updatePedidoEstado);
  const addCashMovement = useStore((s) => s.addCashMovement);
  const cashSession = useStore((s) => s.cashSession);
  const addNotification = useNotificationStore((s) => s.addNotification);
  const navigate = useNavigate();
  const { negocioId } = useParams();

  const activos = pedidos.filter(
    (p) => p.tipoPedido === 'delivery' && p.estado === 'en_camino'
  );

  const handleEntregado = (pedidoId: string, total: number, cliente?: string) => {
    updatePedidoEstado(pedidoId, 'entregado');

    if (cashSession?.status === 'abierta' && total > 0) {
      addCashMovement({
        type: 'ingreso',
        amount: total,
        method: 'efectivo',
        description: `Delivery entregado - ${cliente || 'Cliente'}`,
        relatedPedidoId: pedidoId,
      });
    }

    addNotification({
      title: 'Entrega completada',
      message: `Pedido de ${cliente || 'cliente'} marcado como entregado`,
      type: 'success',
    });
  };

  if (activos.length === 0) {
    return (
      <div className="p-8 text-center">
        <Icon name="two_wheeler" size={56} className="mx-auto mb-4 text-slate-300" />
        <p className="text-slate-500 font-medium">No tenés pedidos en camino</p>
        <button
          onClick={() => navigate(`/${negocioId}/app/delivery`)}
          className="mt-4 text-blue-600 font-medium text-sm"
        >
          Ver pedidos disponibles
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-lg font-bold">En camino</h1>

      {activos.map((p) => (
        <div
          key={p.id}
          className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          <div className="bg-blue-600 text-white px-4 py-3 flex items-center gap-2">
            <Icon name="two_wheeler" />
            <span className="font-bold">En camino</span>
          </div>

          <div className="p-4 space-y-3">
            <div>
              <p className="font-bold text-lg">{p.clienteNombre || 'Cliente'}</p>
              <p className="text-sm text-slate-500 flex items-center gap-1">
                <Icon name="call" size={14} />
                {p.clienteTelefono || 'Sin teléfono'}
              </p>
              {p.direccionDelivery && (
                <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                  <Icon name="location_on" size={14} />
                  {p.direccionDelivery}
                </p>
              )}
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 space-y-1">
              {p.items.map((i) => (
                <div key={i.id} className="flex justify-between text-sm">
                  <span>
                    {i.cantidad}x {i.nombre}
                  </span>
                  <span className="font-medium">{formatMoney(i.subtotal)}</span>
                </div>
              ))}
              <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-blue-600">{formatMoney(p.total)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <a
                href={`tel:${p.clienteTelefono || ''}`}
                className="py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-center text-sm font-medium flex items-center justify-center gap-1"
              >
                <Icon name="call" size={18} />
                Llamar
              </a>
              <button
                onClick={() => handleEntregado(p.id, p.total, p.clienteNombre)}
                className="py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold flex items-center justify-center gap-1"
              >
                <Icon name="check_circle" size={18} />
                Entregado
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
