const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001/api' : '/api');

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  return res.json();
}

export const api = {
  loginOwner: (data: { email?: string; password?: string; pin?: string; scope: 'tenant' | 'superadmin' }) =>
    request<any>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  health: () => request<{ ok: boolean }>('/health'),
  sync: () => request<SyncPayload>('/sync'),

  getProductos: () => request<any[]>('/productos'),
  createProducto: (data: any) => request('/productos', { method: 'POST', body: JSON.stringify(data) }),
  updateProducto: (id: string, data: any) =>
    request(`/productos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProducto: (id: string) => request(`/productos/${id}`, { method: 'DELETE' }),

  getMesas: () => request<any[]>('/mesas'),
  createMesa: (data: any) => request('/mesas', { method: 'POST', body: JSON.stringify(data) }),
  updateMesa: (id: string, data: any) =>
    request(`/mesas/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMesa: (id: string) => request(`/mesas/${id}`, { method: 'DELETE' }),

  getEspacios: () => request<any[]>('/espacios'),
  createEspacio: (data: any) => request('/espacios', { method: 'POST', body: JSON.stringify(data) }),
  updateEspacio: (id: string, data: any) =>
    request(`/espacios/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteEspacio: (id: string) => request(`/espacios/${id}`, { method: 'DELETE' }),

  getReservas: () => request<any[]>('/reservas'),
  createReserva: (data: any) => request('/reservas', { method: 'POST', body: JSON.stringify(data) }),
  updateReserva: (id: string, data: any) =>
    request(`/reservas/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteReserva: (id: string) => request(`/reservas/${id}`, { method: 'DELETE' }),

  getPedidos: () => request<any[]>('/pedidos'),
  createPedido: (data: any) => request('/pedidos', { method: 'POST', body: JSON.stringify(data) }),
  updatePedido: (id: string, data: any) =>
    request(`/pedidos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePedido: (id: string) => request(`/pedidos/${id}`, { method: 'DELETE' }),

  getClientes: () => request<any[]>('/clientes'),
  createCliente: (data: any) => request('/clientes', { method: 'POST', body: JSON.stringify(data) }),
  updateCliente: (id: string, data: any) =>
    request(`/clientes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCliente: (id: string) => request(`/clientes/${id}`, { method: 'DELETE' }),

  getOfertas: () => request<any[]>('/ofertas'),
  createOferta: (data: any) => request('/ofertas', { method: 'POST', body: JSON.stringify(data) }),
  updateOferta: (id: string, data: any) =>
    request(`/ofertas/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteOferta: (id: string) => request(`/ofertas/${id}`, { method: 'DELETE' }),

  getCajaSesion: () => request<any>('/caja/sesion'),
  updateCajaSesion: (data: any) =>
    request('/caja/sesion', { method: 'PUT', body: JSON.stringify(data) }),
  getCajaMovimientos: () => request<any[]>('/caja/movimientos'),
  createCajaMovimiento: (data: any) =>
    request('/caja/movimientos', { method: 'POST', body: JSON.stringify(data) }),
};

export interface SyncPayload {
  productos: any[];
  mesas: any[];
  espacios: any[];
  reservas: any[];
  clientes: any[];
  pedidos: any[];
  ofertas: any[];
  cajaSesion: any;
  cajaMovimientos: any[];
}
