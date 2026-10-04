import { useMemo, useState } from 'react';
import { useStore } from '../../store/useStore';
import { useMesasStore } from '../../store/useMesasStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { Icon } from '../../components/ui/Icon';
import { ensureProductMedia } from '../../lib/productImages';

function formatMoney(n: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(n);
}

export default function ClientMenu() {
  const rawProducts = useStore((s) => s.products);
  const products = useMemo(
    () => rawProducts.filter((p) => p.disponible !== false).map(ensureProductMedia),
    [rawProducts]
  );
  const createPedido = useMesasStore((s) => s.createPedido);
  const mesas = useMesasStore((s) => s.mesas);
  const addItemToPedido = useMesasStore((s) => s.addItemToPedido);
  const updatePedidoEstado = useMesasStore((s) => s.updatePedidoEstado);
  const addNotification = useNotificationStore((s) => s.addNotification);

  const [cart, setCart] = useState<
    { id: string; name: string; price: number; qty: number; notes?: string }[]
  >([]);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [done, setDone] = useState(false);
  const [orderType, setOrderType] = useState<'llevar' | 'local' | 'delivery'>('llevar');
  const [address, setAddress] = useState('');
  const [mesaId, setMesaId] = useState('');
  const [noteProduct, setNoteProduct] = useState<(typeof products)[0] | null>(null);
  const [noteText, setNoteText] = useState('');

  const categories = useMemo(
    () => ['all', ...Array.from(new Set(products.map((p) => p.category)))],
    [products]
  );

  const filtered = products.filter((p) => {
    const catOk = category === 'all' || p.category === category;
    const q = search.toLowerCase().trim();
    const searchOk =
      !q ||
      p.name.toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q);
    return catOk && searchOk;
  });

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const addToCart = (p: (typeof products)[0], notes?: string) => {
    setCart((prev) => {
      const key = notes || '';
      const existing = prev.find((i) => i.id === p.id && (i.notes || '') === key);
      if (existing) {
        return prev.map((i) =>
          i.id === p.id && (i.notes || '') === key ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { id: p.id, name: p.name, price: p.price, qty: 1, notes: notes || undefined }];
    });
  };

  const handleOrder = () => {
    if (cart.length === 0) return;
    if (orderType !== 'local' && !name.trim()) return;
    if (orderType === 'local' && !mesaId) return;
    if (orderType === 'delivery' && !address.trim()) return;

    const tipoPedido =
      orderType === 'delivery' ? 'delivery' : orderType === 'local' ? 'salon' : 'mostrador';
    let pedidoId: string;
    if (orderType === 'local' && mesaId) {
      const existing = useMesasStore.getState().getPedidoByMesa(mesaId);
      if (existing && !['entregado', 'cancelado'].includes(existing.estado)) {
        pedidoId = existing.id;
      } else {
        pedidoId = createPedido({
          tipoPedido: 'salon',
          mesaId,
          clienteNombre: `Mesa ${mesas.find((m) => m.id === mesaId)?.numero}`,
        });
      }
    } else {
      pedidoId = createPedido({
        tipoPedido,
        mesaId: undefined,
        clienteNombre: name,
        clienteTelefono: phone,
        direccionDelivery: orderType === 'delivery' ? address : undefined,
      });
    }
    cart.forEach((item) => {
      const product = products.find((p) => p.id === item.id);
      if (product) addItemToPedido(pedidoId, product, item.qty, item.notes);
    });
    updatePedidoEstado(pedidoId, orderType === 'delivery' ? 'listo' : 'confirmado');
    const tipoLabel =
      orderType === 'llevar' ? 'Para llevar' : orderType === 'local' ? 'Comer aquí' : 'Delivery';
    addNotification({
      title: `Nuevo pedido · ${tipoLabel}`,
      message: `${orderType === 'local' ? 'Mesa' : name}: ${cart.map((i) => `${i.qty}x ${i.name}`).join(', ')}`,
      type: 'info',
    });
    setDone(true);
    setCart([]);
  };

  if (done) {
    return (
      <div className="p-6 text-center space-y-4 min-h-[50vh] flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-amber-400/20 flex items-center justify-center">
          <Icon name="check_circle" size={48} className="text-amber-400" />
        </div>
        <h2 className="text-xl font-black">¡Pedido recibido!</h2>
        <p className="text-slate-400 text-sm">
          {orderType === 'delivery'
            ? 'Tu pedido sale en camino pronto.'
            : orderType === 'local'
            ? 'Ya está cargado en tu mesa.'
            : 'Pasá por el mostrador cuando te avisemos.'}
        </p>
        <button
          onClick={() => setDone(false)}
          className="w-full max-w-xs py-3 rounded-2xl bg-amber-400 text-black font-bold"
        >
          Seguir mirando el menú
        </button>
      </div>
    );
  }

  return (
    <div className="pb-28">
      {/* Top title info (scrolls away) */}
      <div className="px-4 pt-3 pb-1 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
            EL BAR
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">
              Menú Digital
            </span>
          </h1>
          <p className="text-xs text-slate-400">Pedí a tu mesa, mostrador o delivery</p>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
          <Icon name="location_on" className="text-amber-400" size={16} />
          <span>Giovanni</span>
        </div>
      </div>

      {/* Barra de búsqueda y categorías fija (sticky top-14) */}
      <div className="sticky top-14 z-20 bg-[#0a0a0f]/95 backdrop-blur-md border-b border-white/10 px-4 py-2.5 space-y-2 shadow-lg">
        <div className="relative">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar en el menú..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-white/5 border border-white/10 text-sm placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <Icon name="close" size={16} />
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                category === c
                  ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                  : 'bg-white/5 text-slate-400 border border-white/10 hover:border-white/20'
              }`}
            >
              {c === 'all' ? 'Todos' : c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Product cards compact */}
      <div className="px-4 space-y-3 pt-3">
        {filtered.length === 0 ? (
          <p className="text-center text-slate-500 py-16 text-sm">No encontramos productos</p>
        ) : (
          filtered.map((p) => (
            <article
              key={p.id}
              className="rounded-2xl bg-[#14141c] border border-white/5 p-3 flex gap-3.5 items-center hover:border-amber-400/25 transition-all shadow-md group"
            >
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-white/5 flex items-center justify-center">
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-amber-400/80">
                    <Icon name={p.icon || 'restaurant'} size={28} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-tight line-clamp-1">{p.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {p.description}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-2 pt-1">
                  <span className="text-base sm:text-lg font-black text-amber-400">{formatMoney(p.price)}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setNoteProduct(p);
                        setNoteText('');
                      }}
                      className="px-2 py-1.5 rounded-lg border border-white/10 text-[11px] text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                      title="Agregar observación para cocina"
                    >
                      Obs.
                    </button>
                    <button
                      onClick={() => addToCart(p)}
                      className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold active:scale-95 transition-all flex items-center gap-1 shadow-sm"
                    >
                      <Icon name="add" size={14} />
                      <span>Agregar</span>
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Cart bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 max-w-lg mx-auto p-3 z-20">
          <button
            onClick={() => setShowCheckout(true)}
            className="w-full py-3.5 rounded-2xl bg-amber-400 text-black font-bold flex items-center justify-between px-5 shadow-xl"
          >
            <span>{cart.reduce((s, i) => s + i.qty, 0)} ítems</span>
            <span>Ver pedido · {formatMoney(total)}</span>
          </button>
        </div>
      )}

      {/* Checkout */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowCheckout(false)} />
          <div className="relative bg-[#14141c] border-t border-white/10 rounded-t-3xl w-full max-w-lg p-5 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-lg">Tu pedido</h3>
              <button onClick={() => setShowCheckout(false)}>
                <Icon name="close" />
              </button>
            </div>
            {cart.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="flex justify-between text-sm gap-2">
                <div className="flex-1">
                  <span className="font-medium">
                    {item.qty}x {item.name}
                  </span>
                  {item.notes ? (
                    <span className="block text-[10px] text-amber-400 italic">→ {item.notes}</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        const n = prompt('Observación para cocina:', '');
                        if (n !== null) {
                          setCart((prev) =>
                            prev.map((c, i) => (i === idx ? { ...c, notes: n.trim() || undefined } : c))
                          );
                        }
                      }}
                      className="block text-[10px] text-slate-500 mt-0.5"
                    >
                      + Observación
                    </button>
                  )}
                </div>
                <span className="font-bold text-amber-400">{formatMoney(item.price * item.qty)}</span>
              </div>
            ))}
            <div className="border-t border-white/10 pt-3 flex justify-between font-black">
              <span>Total</span>
              <span className="text-amber-400">{formatMoney(total)}</span>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">¿Cómo lo querés?</p>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'llevar', label: 'Para llevar', icon: 'shopping_bag' },
                    { id: 'local', label: 'Comer aquí', icon: 'restaurant' },
                    { id: 'delivery', label: 'Delivery', icon: 'delivery_dining' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setOrderType(opt.id)}
                    className={`py-3 rounded-xl text-xs font-medium flex flex-col items-center gap-1 ${
                      orderType === opt.id ? 'bg-amber-400 text-black' : 'bg-white/5 border border-white/10'
                    }`}
                  >
                    <Icon name={opt.icon} size={20} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {orderType !== 'local' && (
              <>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10"
                />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Teléfono"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10"
                />
              </>
            )}

            {orderType === 'delivery' && (
              <div className="space-y-2">
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Dirección de entrega"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition((pos) => {
                        const { latitude, longitude } = pos.coords;
                        const maps = `https://www.google.com/maps?q=${latitude},${longitude}`;
                        setAddress((prev) => (prev ? `${prev} | ${maps}` : maps));
                      });
                    }
                  }}
                  className="w-full py-2.5 rounded-xl border border-amber-400/40 text-amber-400 text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Icon name="my_location" size={18} />
                  Usar mi ubicación
                </button>
              </div>
            )}

            {orderType === 'local' && (
              <div>
                <p className="text-sm font-medium mb-2">¿En qué mesa estás?</p>
                <p className="text-[10px] text-slate-500 mb-2">Verde = libre · Ámbar = ocupada (se agrega al pedido)</p>
                <div className="grid grid-cols-5 gap-2">
                  {mesas
                    .filter((m) => m.estado !== 'cuenta_pedida')
                    .map((m) => {
                      const ocupada = m.estado === 'ocupada' || m.estado === 'reservada';
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setMesaId(m.id)}
                          className={`py-2 rounded-xl text-sm font-bold relative ${
                            mesaId === m.id
                              ? 'bg-amber-400 text-black ring-2 ring-amber-300'
                              : ocupada
                              ? 'bg-amber-500/20 border border-amber-500/40 text-amber-200'
                              : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                          }`}
                        >
                          {m.numero}
                          <span className="block text-[8px] font-medium opacity-80">
                            {ocupada ? 'Ocupada' : 'Libre'}
                          </span>
                        </button>
                      );
                    })}
                </div>
                {mesaId && mesas.find((m) => m.id === mesaId)?.estado === 'ocupada' && (
                  <p className="text-xs text-amber-400 mt-2 font-medium">
                    Esta mesa ya tiene pedido → se agregarán los productos al mismo
                  </p>
                )}
              </div>
            )}

            <button
              onClick={handleOrder}
              disabled={
                (orderType !== 'local' && !name.trim()) ||
                (orderType === 'local' && !mesaId) ||
                (orderType === 'delivery' && !address.trim())
              }
              className="w-full py-3.5 rounded-2xl bg-amber-400 text-black font-bold disabled:opacity-40"
            >
              Confirmar pedido
            </button>
          </div>
        </div>
      )}

      {noteProduct && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setNoteProduct(null)} />
          <div className="relative bg-[#14141c] rounded-t-3xl w-full max-w-lg p-5 space-y-3 border-t border-white/10">
            <h3 className="font-bold">Observación · {noteProduct.name}</h3>
            <input
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Ej: sin sal, punto medio, extra cheddar..."
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10"
              autoFocus
            />
            <button
              onClick={() => {
                addToCart(noteProduct, noteText.trim() || undefined);
                setNoteProduct(null);
                setNoteText('');
              }}
              className="w-full py-3 rounded-xl bg-amber-400 text-black font-bold"
            >
              Agregar al pedido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
