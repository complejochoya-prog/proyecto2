import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import { firestore } from './firebase';
import { useStore } from '../store/useStore';
import { useMesasStore } from '../store/useMesasStore';
import { useEspaciosStore } from '../store/useEspaciosStore';
import { useOfertasStore } from '../store/useOfertasStore';
import type { Product, Mesa, Pedido, Reservation, Client, Espacio, CashSession, CashMovement } from '../types';

let isListening = false;
const unsubscribes: Unsubscribe[] = [];

// Limpiar undefined antes de enviar a Firestore
function sanitize<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj, (_key, val) => (val === undefined ? null : val)));
}

/**
 * Escucha en tiempo real todas las colecciones de Firestore
 * y actualiza los stores de Zustand instantáneamente.
 */
export function initFirestoreRealtimeSync() {
  if (isListening) return;
  isListening = true;

  try {
    // 1. PRODUCTOS
    const unsubProductos = onSnapshot(
      collection(firestore, 'productos'),
      (snap) => {
        if (!snap.empty) {
          const products = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
          useStore.setState({ products });
        } else {
          seedInitialCollectionIfEmpty('productos');
        }
      },
      (err) => console.warn('Firestore productos error:', err)
    );
    unsubscribes.push(unsubProductos);

    // 2. MESAS
    const unsubMesas = onSnapshot(
      collection(firestore, 'mesas'),
      (snap) => {
        if (!snap.empty) {
          const mesas = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Mesa));
          useMesasStore.setState({ mesas });
        } else {
          seedInitialCollectionIfEmpty('mesas');
        }
      },
      (err) => console.warn('Firestore mesas error:', err)
    );
    unsubscribes.push(unsubMesas);

    // 3. PEDIDOS
    const unsubPedidos = onSnapshot(
      collection(firestore, 'pedidos'),
      (snap) => {
        if (!snap.empty) {
          const pedidos = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Pedido));
          useMesasStore.setState({ pedidos });
        }
      },
      (err) => console.warn('Firestore pedidos error:', err)
    );
    unsubscribes.push(unsubPedidos);

    // 4. RESERVAS
    const unsubReservas = onSnapshot(
      collection(firestore, 'reservas'),
      (snap) => {
        if (!snap.empty) {
          const reservations = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Reservation));
          useStore.setState({ reservations });
        } else {
          seedInitialCollectionIfEmpty('reservas');
        }
      },
      (err) => console.warn('Firestore reservas error:', err)
    );
    unsubscribes.push(unsubReservas);

    // 5. CLIENTES
    const unsubClientes = onSnapshot(
      collection(firestore, 'clientes'),
      (snap) => {
        if (!snap.empty) {
          const clients = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Client));
          useStore.setState({ clients });
        } else {
          seedInitialCollectionIfEmpty('clientes');
        }
      },
      (err) => console.warn('Firestore clientes error:', err)
    );
    unsubscribes.push(unsubClientes);

    // 6. ESPACIOS
    const unsubEspacios = onSnapshot(
      collection(firestore, 'espacios'),
      (snap) => {
        if (!snap.empty) {
          const espacios = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Espacio));
          useEspaciosStore.setState({ espacios });
        } else {
          seedInitialCollectionIfEmpty('espacios');
        }
      },
      (err) => console.warn('Firestore espacios error:', err)
    );
    unsubscribes.push(unsubEspacios);

    // 7. OFERTAS
    const unsubOfertas = onSnapshot(
      collection(firestore, 'ofertas'),
      (snap) => {
        if (!snap.empty) {
          const ofertas = snap.docs.map((d) => ({ id: d.id, ...d.data() } as any));
          useOfertasStore.setState({ ofertas });
        }
      },
      (err) => console.warn('Firestore ofertas error:', err)
    );
    unsubscribes.push(unsubOfertas);

  } catch (error) {
    console.error('Error al inicializar Firestore Sync:', error);
  }
}

/**
 * Si una colección en Firestore está vacía (por ser proyecto nuevo),
 * migramos los datos locales actuales para poblarla automáticamente.
 */
const hasSeeded: Record<string, boolean> = {};
async function seedInitialCollectionIfEmpty(colName: string) {
  if (hasSeeded[colName]) return;
  hasSeeded[colName] = true;

  try {
    const snap = await getDocs(collection(firestore, colName));
    if (!snap.empty) return;

    const batch = writeBatch(firestore);

    if (colName === 'productos') {
      const current = useStore.getState().products;
      if (current.length > 0) {
        current.forEach((p) => {
          const ref = doc(firestore, 'productos', p.id);
          batch.set(ref, sanitize(p));
        });
        await batch.commit();
        console.log(`Firestore: Migrados ${current.length} productos iniciales.`);
      }
    } else if (colName === 'mesas') {
      const current = useMesasStore.getState().mesas;
      if (current.length > 0) {
        current.forEach((m) => {
          const ref = doc(firestore, 'mesas', m.id);
          batch.set(ref, sanitize(m));
        });
        await batch.commit();
        console.log(`Firestore: Migradas ${current.length} mesas iniciales.`);
      }
    } else if (colName === 'espacios') {
      const current = useEspaciosStore.getState().espacios;
      if (current.length > 0) {
        current.forEach((e) => {
          const ref = doc(firestore, 'espacios', e.id);
          batch.set(ref, sanitize(e));
        });
        await batch.commit();
        console.log(`Firestore: Migrados ${current.length} espacios iniciales.`);
      }
    } else if (colName === 'clientes') {
      const current = useStore.getState().clients;
      if (current.length > 0) {
        current.forEach((c) => {
          const ref = doc(firestore, 'clientes', c.id);
          batch.set(ref, sanitize(c));
        });
        await batch.commit();
        console.log(`Firestore: Migrados ${current.length} clientes iniciales.`);
      }
    } else if (colName === 'reservas') {
      const current = useStore.getState().reservations;
      if (current.length > 0) {
        current.forEach((r) => {
          const ref = doc(firestore, 'reservas', r.id);
          batch.set(ref, sanitize(r));
        });
        await batch.commit();
        console.log(`Firestore: Migradas ${current.length} reservas iniciales.`);
      }
    }
  } catch (e) {
    console.warn(`No se pudo sembrar la colección ${colName}:`, e);
  }
}

// ==========================================
// HELPERS DE ESCRITURA EN FIRESTORE
// ==========================================

export async function firebaseSaveProducto(producto: Product) {
  try {
    await setDoc(doc(firestore, 'productos', producto.id), sanitize(producto), { merge: true });
  } catch (err) {
    console.error('Error al guardar producto en Firestore:', err);
  }
}

export async function firebaseDeleteProducto(id: string) {
  try {
    await deleteDoc(doc(firestore, 'productos', id));
  } catch (err) {
    console.error('Error al eliminar producto en Firestore:', err);
  }
}

export async function firebaseSaveMesa(mesa: Mesa) {
  try {
    await setDoc(doc(firestore, 'mesas', mesa.id), sanitize(mesa), { merge: true });
  } catch (err) {
    console.error('Error al guardar mesa en Firestore:', err);
  }
}

export async function firebaseSavePedido(pedido: Pedido) {
  try {
    await setDoc(doc(firestore, 'pedidos', pedido.id), sanitize(pedido), { merge: true });
  } catch (err) {
    console.error('Error al guardar pedido en Firestore:', err);
  }
}

export async function firebaseDeletePedido(id: string) {
  try {
    await deleteDoc(doc(firestore, 'pedidos', id));
  } catch (err) {
    console.error('Error al eliminar pedido en Firestore:', err);
  }
}

export async function firebaseSaveReserva(reserva: Reservation) {
  try {
    await setDoc(doc(firestore, 'reservas', reserva.id), sanitize(reserva), { merge: true });
  } catch (err) {
    console.error('Error al guardar reserva en Firestore:', err);
  }
}

export async function firebaseDeleteReserva(id: string) {
  try {
    await deleteDoc(doc(firestore, 'reservas', id));
  } catch (err) {
    console.error('Error al eliminar reserva en Firestore:', err);
  }
}

export async function firebaseSaveCliente(cliente: Client) {
  try {
    await setDoc(doc(firestore, 'clientes', cliente.id), sanitize(cliente), { merge: true });
  } catch (err) {
    console.error('Error al guardar cliente en Firestore:', err);
  }
}

export async function firebaseDeleteCliente(id: string) {
  try {
    await deleteDoc(doc(firestore, 'clientes', id));
  } catch (err) {
    console.error('Error al eliminar cliente en Firestore:', err);
  }
}

export async function firebaseSaveEspacio(espacio: Espacio) {
  try {
    await setDoc(doc(firestore, 'espacios', espacio.id), sanitize(espacio), { merge: true });
  } catch (err) {
    console.error('Error al guardar espacio en Firestore:', err);
  }
}

export async function firebaseDeleteEspacio(id: string) {
  try {
    await deleteDoc(doc(firestore, 'espacios', id));
  } catch (err) {
    console.error('Error al eliminar espacio en Firestore:', err);
  }
}

export async function firebaseSaveCajaSesion(sesion: CashSession) {
  try {
    await setDoc(doc(firestore, 'caja_sesiones', sesion.id), sanitize(sesion), { merge: true });
  } catch (err) {
    console.error('Error al guardar sesion de caja en Firestore:', err);
  }
}

export async function firebaseSaveCajaMovimiento(movimiento: CashMovement) {
  try {
    await setDoc(doc(firestore, 'caja_movimientos', movimiento.id), sanitize(movimiento), { merge: true });
  } catch (err) {
    console.error('Error al guardar movimiento de caja en Firestore:', err);
  }
}
