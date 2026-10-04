import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { useEspaciosStore } from '../../store/useEspaciosStore';
import { Icon } from '../../components/ui/Icon';

function formatMoney(n: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(n);
}

export default function ClientMisReservas() {
  const reservations = useStore((s) => s.reservations);
  const espacios = useEspaciosStore((s) => s.espacios);
  const [phone, setPhone] = useState('');
  const [searched, setSearched] = useState(false);

  const mine = searched
    ? reservations.filter(
        (r) => r.clientPhone.replace(/\D/g, '').includes(phone.replace(/\D/g, '')) ||
               r.clientPhone === phone
      )
    : [];

  const getEspacioName = (id: string) =>
    espacios.find((e) => e.id === id)?.name || id;

  return (
    <div className="p-4 space-y-5">
      <h1 className="text-lg font-bold">Mis turnos</h1>
      <p className="text-sm text-slate-500">
        Ingresá el teléfono con el que reservaste para ver tus turnos
      </p>

      <div className="flex gap-2">
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Ej: 11-2345-6789"
          type="tel"
          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
        />
        <button
          onClick={() => setSearched(true)}
          disabled={phone.length < 4}
          className="px-5 py-3 rounded-xl bg-emerald-600 text-white font-bold disabled:opacity-50"
        >
          Buscar
        </button>
      </div>

      {searched && (
        <div className="space-y-3">
          {mine.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Icon name="event_busy" size={48} className="mx-auto mb-3 opacity-40" />
              <p>No encontramos reservas con ese teléfono</p>
            </div>
          ) : (
            mine
              .slice()
              .reverse()
              .map((r) => (
                <div
                  key={r.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-bold">{getEspacioName(r.courtId)}</p>
                      <p className="text-sm text-slate-500">
                        {r.date} · {r.startTime} – {r.endTime}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        r.paymentStatus === 'pagado'
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : r.paymentStatus === 'senado'
                          ? 'bg-amber-500/10 text-amber-600'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {r.paymentStatus}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-emerald-600">
                    {formatMoney(r.amount)}
                  </p>
                </div>
              ))
          )}
        </div>
      )}
    </div>
  );
}
