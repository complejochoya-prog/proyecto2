import { useNavigate, useParams } from 'react-router-dom';
import { useMesasStore } from '../../store/useMesasStore';
import { useStore } from '../../store/useStore';
import { Icon } from '../../components/ui/Icon';
import type { Pedido } from '../../types';

function formatMoney(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
}

export default function DeliveryPedidos() {
  const pedidos = useMesasStore((s) => s.pedidos);
  const updatePedidoEstado = useMesasStore((s) => s.updatePedidoEstado);
  const createPedido = useMesasStore((s) => s.createPedido);
  const addItemToPedido = useMesasStore((s) => s.addItemToPedido);
  const products = useStore((s) => s.products);
  const navigate = useNavigate();
  const { negocioId } = useParams();

  // Delivery orders ready to pick up or in progress
  const disponibles = pedidos.filter(
    (p) => p.tipoPedido === 'delivery' && ['confirmado', 'listo', 'en_preparacion'].includes(p.estado)
  );
  const enCamino = pedidos.filter(
    (p) => p.tipoPedido === 'delivery' && p.estado === 'en_camino'
  );

  const handleTomar = (pedido: Pedido) => {
    updatePedidoEstado(pedido.id, 'en_camino');
    navigate(`/${negocioId}/app/delivery/activo`);
  };

  // Demo: create a sample delivery order
  const crearDemo = () => {
    const id = createPedido({
      tipoPedido: 'delivery',
      clienteNombre: 'Cliente Demo',
      clienteTelefono: '11-5555-9999',
      direccionDelivery: 'Av. San Martín 1450, Depto 3B',
    });
    const burger = products.find((p) => p.name.includes('Hamburguesa'));
    const gaseosa = products.find((p) => p.name.includes('Gaseosa'));
    if (burger) addItemToPedido(id, burger, 2);
    if (gaseosa) addItemToPedido(id, gaseosa, 1);
    updatePedidoEstado(id, 'listo');
  };

  return (
    <div className="p-4 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">Pedidos Delivery</h1>
        <button
          onClick={crearDemo}
          className="text-xs px-3 py-1.5 rounded-full bg-blue-600 text-white font-medium"
        >
          + Demo
        </button>
      </div>

      {/* Ready to pick */}
      <section>
        <h2 className="text-sm font-semibold text-slate-500 mb-2 flex items-center gap-1">
          <Icon name="shopping_bag" size={16} />
          Listos para retirar ({disponibles.length})
        </h2>
        {disponibles.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">No hay pedidos listos</p>
        ) : (
          <div className="space-y-2">
            {disponibles.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold">{p.clienteNombre || 'Cliente'}</p>
                    <p className="text-xs text-slate-500">{p.clienteTelefono}</p>
                    {p.direccionDelivery && (
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <Icon name="location_on" size={12} />
                        {p.direccionDelivery}
                      </p>
                    )}
                  </div>
                  <span className="font-bold text-blue-600">{formatMoney(p.total)}</span>
                </div>
                <div className="text-xs text-slate-500 mb-3">
                  {p.items.map((i) => `${i.cantidad}x ${i.nombre}`).join(' · ')}
                </div>
                <button
                  onClick={() => handleTomar(p)}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm"
                >
                  Tomar pedido
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Currently delivering */}
      {enCamino.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-slate-500 mb-2">En camino ({enCamino.length})</h2>
          {enCamino.map((p) => (
            <button
              key={p.id}
              onClick={() => navigate(`/${negocioId}/app/delivery/activo`)}
              className="w-full p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-left flex items-center gap-3"
            >
              <Icon name="two_wheeler" className="text-blue-600" />
              <div className="flex-1">
                <p className="font-medium text-sm">{p.clienteNombre}</p>
                <p className="text-xs text-slate-500">{formatMoney(p.total)}</p>
              </div>
              <Icon name="chevron_right" className="text-slate-400" />
            </button>
          ))}
        </section>
      )}
    </div>
  );
}
