import { useEffect, useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useEspaciosStore } from '../../store/useEspaciosStore';
import { useOfertasStore, isOfertaVigente } from '../../store/useOfertasStore';
import { Icon } from '../../components/ui/Icon';

const SPACE_META: Record<string, { tag: string; blurb: string; gradient: string; img: string }> = {
  quincho: {
    tag: 'EVENTOS',
    blurb: 'Disfruta de tu lugar en familia',
    gradient: 'from-amber-900/80 to-black',
    img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
  },
  padel: {
    tag: 'DEPORTES INTENSOS',
    blurb: 'Canchas vitradas',
    gradient: 'from-blue-900/80 to-black',
    img: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80',
  },
  futbol: {
    tag: 'DEPORTES INTENSOS',
    blurb: 'Césped sintético',
    gradient: 'from-emerald-900/80 to-black',
    img: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
  },
  salon: {
    tag: 'EVENTOS',
    blurb: 'El lugar ideal para tu evento',
    gradient: 'from-violet-900/80 to-black',
    img: 'https://images.unsplash.com/photo-1519167758481-83f29da75953?w=800&q=80',
  },
  cancha: {
    tag: 'DEPORTES',
    blurb: 'Listo para jugar',
    gradient: 'from-emerald-900/80 to-black',
    img: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&q=80',
  },
  tenis: {
    tag: 'DEPORTES',
    blurb: 'Cancha profesional',
    gradient: 'from-sky-900/80 to-black',
    img: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&q=80',
  },
};

function metaFor(type: string) {
  return SPACE_META[type] || {
    tag: 'ESPACIO',
    blurb: 'Reservá tu turno',
    gradient: 'from-slate-900/80 to-black',
    img: 'https://images.unsplash.com/photo-1461896836934-ffe607ba3671?w=800&q=80',
  };
}

export default function ClientHome() {
  const { negocioId } = useParams();
  const allEspacios = useEspaciosStore((s) => s.espacios);
  const espacios = useMemo(() => allEspacios.filter((e) => e.isActive), [allEspacios]);
  const allOfertas = useOfertasStore((s) => s.ofertas);
  const ofertas = useMemo(() => allOfertas.filter((o) => isOfertaVigente(o)), [allOfertas]);
  const [weather, setWeather] = useState({ temp: 20, desc: 'Parcialmente nublado', hum: 0 });

  useEffect(() => {
    // Widget clima (Open-Meteo, sin API key) — fallback fijo si falla
    fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=-34.6&longitude=-58.4&current=temperature_2m,relative_humidity_2m,weather_code'
    )
      .then((r) => r.json())
      .then((d) => {
        const code = d.current?.weather_code ?? 2;
        const descs: Record<number, string> = {
          0: 'Despejado',
          1: 'Mayormente despejado',
          2: 'Parcialmente nublado',
          3: 'Nublado',
          61: 'Lluvia',
          63: 'Lluvia',
          80: 'Chaparrones',
        };
        setWeather({
          temp: Math.round(d.current?.temperature_2m ?? 20),
          desc: descs[code] || 'Parcialmente nublado',
          hum: d.current?.relative_humidity_2m ?? 0,
        });
      })
      .catch(() => {});
  }, []);

  return (
    <div className="pb-6">
      {/* HERO */}
      <section className="relative px-5 pt-8 pb-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -right-20 top-0 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <p className="text-amber-400 text-[10px] font-bold uppercase tracking-[0.25em] mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          Complejo deportivo premium
        </p>
        <h1 className="text-4xl font-black leading-[1.05] tracking-tight mb-3">
          COMPLEJO
          <br />
          GIOVANNI
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-500">
            TU LUGAR
          </span>
        </h1>
        <p className="text-slate-400 text-sm max-w-xs mb-6 leading-relaxed">
          Instalaciones de primer nivel. Reservas instantáneas. Gastronomía excepcional.
          Elevamos tu juego dentro y fuera de la cancha.
        </p>

        {/* Weather widget */}
        <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur p-4 mb-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-500/20 flex items-center justify-center">
            <Icon name="partly_cloudy_day" size={28} className="text-sky-300" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Estado del tiempo</p>
            <p className="text-xs text-sky-300 font-semibold uppercase">{weather.desc}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black tabular-nums">
              {weather.temp}
              <span className="text-base text-slate-500">°C</span>
            </p>
            <p className="text-[10px] text-slate-500">{weather.hum}% humedad</p>
          </div>
        </div>

        <Link
          to={`/${negocioId}/reservar`}
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-white text-black font-bold text-sm active:scale-[0.98] transition-transform"
        >
          RESERVAR <Icon name="arrow_forward" size={18} />
        </Link>
      </section>

      {/* ESPACIOS */}
      <section className="px-5 mb-8">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="text-xl font-black tracking-tight">
              NUESTROS <span className="text-amber-400">ESPACIOS</span>
            </h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">
              Campos homologados para alta competición
            </p>
          </div>
          <Link to={`/${negocioId}/reservar`} className="text-[10px] text-amber-400 font-bold uppercase">
            Ver disponibilidad →
          </Link>
        </div>

        <div className="space-y-4">
          {espacios.map((e, i) => {
            const m = metaFor(e.type);
            return (
              <Link
                key={e.id}
                to={`/${negocioId}/reservar?espacio=${e.id}`}
                className="group relative block rounded-3xl overflow-hidden h-52 border border-white/5"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <img
                  src={e.imageUrl || m.img}
                  alt={e.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(ev) => {
                    if (m.img && (ev.target as HTMLImageElement).src !== m.img) {
                      (ev.target as HTMLImageElement).src = m.img;
                    }
                  }}
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${m.gradient}`} />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-black/50 backdrop-blur text-[9px] font-bold uppercase tracking-wider border border-white/10">
                    {m.tag}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="w-8 h-0.5 bg-amber-400 mb-2" />
                  <h3 className="text-xl font-black uppercase tracking-tight">{e.name}</h3>
                  <p className="text-xs text-slate-300">{m.blurb}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* PROMO */}
      {ofertas.length > 0 && (
        <section className="px-5 mb-6">
          <div className="rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-700 to-purple-900 p-5 border border-white/10 relative overflow-hidden">
            <span className="text-[9px] font-bold uppercase tracking-wider text-violet-200 flex items-center gap-1 mb-2">
              <Icon name="local_offer" size={12} /> Destacado
            </span>
            <h3 className="text-2xl font-black mb-1">PROMOCIÓN SEMANAL</h3>
            <p className="text-sm text-violet-100 mb-4">
              {ofertas[0].titulo} — {ofertas[0].descripcion}
            </p>
            <Link
              to={`/${negocioId}/reservar`}
              className="inline-flex px-5 py-2.5 rounded-xl bg-white text-violet-900 font-bold text-sm"
            >
              VER OFERTAS
            </Link>
          </div>
        </section>
      )}

      {/* Cards extras */}
      <section className="px-5 space-y-4 mb-6">
        <div className="rounded-3xl bg-[#14141c] border border-white/5 p-5">
          <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center mb-3">
            <Icon name="star" className="text-black" />
          </div>
          <h3 className="text-lg font-black mb-1">
            EVENTOS <span className="text-slate-500">ÚNICOS</span>
          </h3>
          <p className="text-sm text-slate-400 mb-3">
            Celebrá cumpleaños, eventos corporativos o torneos privados con nosotros.
          </p>
          <a
            href="https://wa.me/5491100000000?text=Hola!%20Quiero%20info%20de%20eventos%20en%20Complejo%20Giovanni"
            target="_blank"
            rel="noreferrer"
            className="text-amber-400 text-xs font-bold uppercase tracking-wider"
          >
            Contactar por WhatsApp →
          </a>
        </div>

        <div className="rounded-3xl bg-[#14141c] border border-white/5 p-5">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center mb-3">
            <Icon name="swords" className="text-red-400" />
          </div>
          <h3 className="text-lg font-black mb-1">ZONA DE DESAFÍO</h3>
          <p className="text-sm text-slate-400 mb-3">
            ¿Te falta uno para el partido? Entrá a la bolsa de jugadores y encontrá tu próximo reto.
          </p>
          <button className="w-full py-3 rounded-xl bg-red-600 font-bold text-sm">
            INGRESAR AL DESAFÍO
          </button>
        </div>

        <div className="rounded-3xl bg-[#14141c] border border-white/5 p-5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mb-3">
            <Icon name="emoji_events" className="text-blue-400" />
          </div>
          <h3 className="text-lg font-black mb-1">ESCUELA DE FÚTBOL</h3>
          <p className="text-sm text-slate-400 mb-3">
            Formación integral para los futuros cracks. Entrenamientos dinámicos y valores deportivos.
          </p>
          <button className="w-full py-3 rounded-xl bg-blue-600 font-bold text-sm">
            INFORMACIÓN E INSCRIPCIONES
          </button>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-amber-600/20 to-[#14141c] border border-amber-500/20 p-5">
          <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center mb-3">
            <Icon name="restaurant" className="text-black" />
          </div>
          <h3 className="text-lg font-black mb-1">
            EL TERCER <span className="text-amber-400">TIEMPO</span>
          </h3>
          <p className="text-sm text-slate-400 mb-3">
            La experiencia no termina en la cancha. Disfrutá de nuestra gastronomía premium.
          </p>
          <Link
            to={`/${negocioId}/menu`}
            className="flex items-center justify-center w-full py-3 rounded-xl bg-amber-400 text-black font-bold text-sm"
          >
            VER MENÚ DEL BAR →
          </Link>
        </div>
      </section>
    </div>
  );
}
