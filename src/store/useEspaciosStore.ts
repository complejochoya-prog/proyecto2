import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { idbStorage } from './idbStorage';
import type { Espacio, CourtStatus } from '../types';

const initialEspacios: Espacio[] = [
  { id: 'c1', negocioId: 'giovanni', name: 'Cancha 1', type: 'futbol', status: 'libre', precioHora: 15000, isActive: true },
  { id: 'c2', negocioId: 'giovanni', name: 'Cancha 2', type: 'futbol', status: 'reservada', precioHora: 15000, isActive: true, currentReservationId: 'r1' },
  { id: 'c3', negocioId: 'giovanni', name: 'Cancha 3', type: 'futbol', status: 'en_juego', precioHora: 18000, isActive: true, currentReservationId: 'r2' },
  { id: 'c4', negocioId: 'giovanni', name: 'Cancha 4', type: 'padel', status: 'libre', precioHora: 12000, isActive: true },
  { id: 's1', negocioId: 'giovanni', name: 'Salón de Eventos', type: 'quincho', status: 'mantenimiento', precioHora: 50000, isActive: true },
];

interface EspaciosState {
  espacios: Espacio[];
  addEspacio: (data: Omit<Espacio, 'id' | 'negocioId' | 'status' | 'isActive'>) => void;
  updateEspacio: (id: string, data: Partial<Espacio>) => void;
  deleteEspacio: (id: string) => void;
  updateStatus: (id: string, status: CourtStatus, reservationId?: string) => void;
  toggleActive: (id: string) => void;
}

import { persistEspacio, deleteEspacioDb } from '../components/DbSync';

export const useEspaciosStore = create<EspaciosState>()(
  persist(
    (set, get) => ({
      espacios: initialEspacios,

      addEspacio: (data) => {
        const full = {
          ...data,
          id: `esp-${Date.now()}`,
          negocioId: 'giovanni',
          status: 'libre' as CourtStatus,
          isActive: true,
        };
        set((s) => ({
          espacios: [...s.espacios, full],
        }));
        persistEspacio(full, true);
      },

      updateEspacio: (id, data) => {
        let updated: Espacio | undefined;
        set((s) => {
          const espacios = s.espacios.map((e) => {
            if (e.id === id) {
              updated = { ...e, ...data };
              return updated;
            }
            return e;
          });
          return { espacios };
        });
        if (updated) persistEspacio(updated, false);
      },

      deleteEspacio: (id) => {
        set((s) => ({
          espacios: s.espacios.filter((e) => e.id !== id),
        }));
        deleteEspacioDb(id);
      },

      updateStatus: (id, status, reservationId) => {
        set((s) => ({
          espacios: s.espacios.map((e) =>
            e.id === id
              ? { ...e, status, currentReservationId: reservationId }
              : e
          ),
        }));
        persistEspacio({ id, status, currentReservationId: reservationId }, false);
      },

      toggleActive: (id) => {
        const esp = get().espacios.find((e) => e.id === id);
        if (!esp) return;
        const nuevoActive = !esp.isActive;
        set((s) => ({
          espacios: s.espacios.map((e) =>
            e.id === id ? { ...e, isActive: nuevoActive } : e
          ),
        }));
        persistEspacio({ id, isActive: nuevoActive }, false);
      },
    }),
    { name: 'giovanni-espacios-storage', storage: idbStorage as any }
  )
);
