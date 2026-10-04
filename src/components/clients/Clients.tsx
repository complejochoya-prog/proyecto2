import { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { Icon } from '../ui/Icon';

export function Clients() {
  const clients = useStore((s) => s.clients);
  const reservations = useStore((s) => s.reservations);
  const updateClient = useStore((s) => s.updateClient);
  const addClient = useStore((s) => s.addClient);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return clients.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q)
    );
  }, [clients, search]);

  const selected = clients.find((c) => c.id === selectedId);
  const clientReservations = selected
    ? reservations.filter((r) => r.clientId === selected.id || r.clientPhone === selected.phone)
    : [];

  const handleAdd = () => {
    if (!newName.trim() || !newPhone.trim()) return;
    addClient({ name: newName, phone: newPhone, isFrequent: false, isSanctioned: false });
    setNewName('');
    setNewPhone('');
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Clientes</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{clients.length} clientes registrados</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
        >
          <Icon name="person_add" />
          Nuevo Cliente
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-wrap gap-3">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nombre"
            className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex-1 min-w-[150px]"
          />
          <input
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            placeholder="Teléfono"
            className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex-1 min-w-[150px]"
          />
          <button onClick={handleAdd} className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-medium">
            Guardar
          </button>
        </div>
      )}

      <div className="relative">
        <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o teléfono..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-xs text-slate-500 uppercase">
                  <th className="p-4 font-medium">Cliente</th>
                  <th className="p-4 font-medium">Teléfono</th>
                  <th className="p-4 font-medium">Reservas</th>
                  <th className="p-4 font-medium">Estado</th>
                  <th className="p-4 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className={`cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                      selectedId === c.id ? 'bg-emerald-500/5' : ''
                    }`}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold">
                          {c.name.charAt(0)}
                        </div>
                        <span className="font-medium">{c.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-500">{c.phone}</td>
                    <td className="p-4">{c.totalReservations}</td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        {c.isFrequent && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-600">
                            Frecuente
                          </span>
                        )}
                        {c.isSanctioned && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-500/10 text-red-600">
                            Sancionado
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateClient(c.id, { isFrequent: !c.isFrequent });
                          }}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Marcar frecuente"
                        >
                          <Icon name="star" size={18} className={c.isFrequent ? 'text-amber-500' : ''} filled={c.isFrequent} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateClient(c.id, { isSanctioned: !c.isSanctioned });
                          }}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Sancionar"
                        >
                          <Icon name="gavel" size={18} className={c.isSanctioned ? 'text-red-500' : ''} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          {selected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-lg font-bold">
                  {selected.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold">{selected.name}</h3>
                  <p className="text-sm text-slate-500">{selected.phone}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <p className="text-xs text-slate-500">Reservas</p>
                  <p className="font-bold text-lg">{selected.totalReservations}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <p className="text-xs text-slate-500">Inasistencias</p>
                  <p className="font-bold text-lg">{selected.noShows}</p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2">Historial de reservas</h4>
                {clientReservations.length === 0 ? (
                  <p className="text-sm text-slate-500">Sin reservas recientes</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {clientReservations.map((r) => (
                      <div key={r.id} className="text-sm p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                        <p className="font-medium">{r.date} · {r.startTime}-{r.endTime}</p>
                        <p className="text-xs text-slate-500 capitalize">{r.paymentStatus}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-500 py-12">
              <Icon name="person" size={40} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">Seleccione un cliente</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
