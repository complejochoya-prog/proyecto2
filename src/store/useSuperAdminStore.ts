import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ModuleId, Negocio } from '../types';

export interface TenantFull extends Negocio {
  plan: 'trial' | 'basic' | 'pro' | 'enterprise';
  modulos: Record<ModuleId, boolean>;
  usuariosCount: number;
  mesasCount: number;
  espaciosCount: number;
  lastActive?: string;
}

const ALL_MODULES: { id: ModuleId; label: string; description: string }[] = [
  { id: 'bar', label: 'Bar / Mesas', description: 'Gestión de mesas, pedidos y salón' },
  { id: 'reservas', label: 'Reservas', description: 'Canchas, turnos y reservas online' },
  { id: 'cocina', label: 'Cocina KDS', description: 'Pantalla de comandas para cocina' },
  { id: 'caja', label: 'Caja', description: 'Apertura, cierre y movimientos de caja' },
  { id: 'inventario', label: 'Inventario', description: 'Stock por sector' },
  { id: 'mozos', label: 'App Mozos', description: 'Comandera móvil para mozos' },
  { id: 'delivery', label: 'Delivery', description: 'Gestión de repartos' },
  { id: 'torneos', label: 'Torneos', description: 'Organización de torneos y fixtures' },
  { id: 'escuela', label: 'Escuela', description: 'Clases y alumnos' },
  { id: 'access_control', label: 'Control de Accesos', description: 'Check-in QR' },
  { id: 'smart_center', label: 'Smart Center IoT', description: 'Luces, barreras y dispositivos' },
  { id: 'finanzas', label: 'Finanzas', description: 'Reportes y P&L' },
  { id: 'empleados', label: 'Empleados', description: 'RRHH y turnos' },
  { id: 'analytics_ai', label: 'Analytics AI', description: 'Predicciones de ocupación' },
];

const initialTenants: TenantFull[] = [
  {
    id: 'giovanni',
    slug: 'giovanni',
    nombre: 'Complejo Giovanni',
    isActive: true,
    createdAt: '2024-01-15',
    plan: 'pro',
    usuariosCount: 12,
    mesasCount: 10,
    espaciosCount: 5,
    lastActive: new Date().toISOString(),
    modulos: {
      bar: true, reservas: true, cocina: true, caja: true, inventario: true,
      iot: true, analytics_ai: false, delivery: true, mozos: true, escuela: false,
      torneos: true, access_control: true, smart_center: true, finanzas: true, empleados: true,
    },
  },
  {
    id: 'demo',
    slug: 'demo',
    nombre: 'Complejo Demo',
    isActive: true,
    createdAt: '2025-06-01',
    plan: 'basic',
    usuariosCount: 3,
    mesasCount: 6,
    espaciosCount: 2,
    lastActive: '2026-09-20T10:00:00Z',
    modulos: {
      bar: true, reservas: true, cocina: false, caja: true, inventario: false,
      iot: false, analytics_ai: false, delivery: false, mozos: false, escuela: false,
      torneos: false, access_control: false, smart_center: false, finanzas: true, empleados: false,
    },
  },
  {
    id: 'padelpro',
    slug: 'padelpro',
    nombre: 'Padel Pro Center',
    isActive: true,
    createdAt: '2025-03-10',
    plan: 'enterprise',
    usuariosCount: 28,
    mesasCount: 0,
    espaciosCount: 12,
    lastActive: new Date().toISOString(),
    modulos: {
      bar: true, reservas: true, cocina: true, caja: true, inventario: true,
      iot: true, analytics_ai: true, delivery: false, mozos: true, escuela: true,
      torneos: true, access_control: true, smart_center: true, finanzas: true, empleados: true,
    },
  },
  {
    id: 'clubnorte',
    slug: 'clubnorte',
    nombre: 'Club Norte',
    isActive: false,
    createdAt: '2024-11-01',
    plan: 'trial',
    usuariosCount: 2,
    mesasCount: 4,
    espaciosCount: 3,
    lastActive: '2026-01-15T08:00:00Z',
    modulos: {
      bar: true, reservas: true, cocina: false, caja: true, inventario: false,
      iot: false, analytics_ai: false, delivery: false, mozos: false, escuela: false,
      torneos: false, access_control: false, smart_center: false, finanzas: false, empleados: false,
    },
  },
];

interface SuperAdminState {
  tenants: TenantFull[];
  modulesCatalog: typeof ALL_MODULES;
  toggleTenantActive: (id: string) => void;
  toggleModule: (tenantId: string, moduleId: ModuleId) => void;
  updatePlan: (tenantId: string, plan: TenantFull['plan']) => void;
  createTenant: (data: { nombre: string; slug: string; plan: TenantFull['plan'] }) => void;
  getStats: () => {
    totalTenants: number;
    activeTenants: number;
    trialTenants: number;
    totalUsers: number;
  };
}

export const useSuperAdminStore = create<SuperAdminState>()(
  persist(
    (set, get) => ({
      tenants: initialTenants,
      modulesCatalog: ALL_MODULES,

      toggleTenantActive: (id) =>
        set((s) => ({
          tenants: s.tenants.map((t) =>
            t.id === id ? { ...t, isActive: !t.isActive } : t
          ),
        })),

      toggleModule: (tenantId, moduleId) =>
        set((s) => ({
          tenants: s.tenants.map((t) =>
            t.id === tenantId
              ? { ...t, modulos: { ...t.modulos, [moduleId]: !t.modulos[moduleId] } }
              : t
          ),
        })),

      updatePlan: (tenantId, plan) =>
        set((s) => ({
          tenants: s.tenants.map((t) =>
            t.id === tenantId ? { ...t, plan } : t
          ),
        })),

      createTenant: (data) => {
        const id = data.slug.toLowerCase().replace(/\s+/g, '-');
        const exists = get().tenants.some((t) => t.slug === id);
        if (exists) return;

        const defaultMods = ALL_MODULES.reduce((acc, m) => {
          acc[m.id] = ['bar', 'reservas', 'caja'].includes(m.id);
          return acc;
        }, {} as Record<ModuleId, boolean>);

        set((s) => ({
          tenants: [
            ...s.tenants,
            {
              id,
              slug: id,
              nombre: data.nombre,
              isActive: true,
              createdAt: new Date().toISOString().split('T')[0],
              plan: data.plan,
              usuariosCount: 1,
              mesasCount: 0,
              espaciosCount: 0,
              modulos: defaultMods,
              lastActive: new Date().toISOString(),
            },
          ],
        }));
      },

      getStats: () => {
        const { tenants } = get();
        return {
          totalTenants: tenants.length,
          activeTenants: tenants.filter((t) => t.isActive).length,
          trialTenants: tenants.filter((t) => t.plan === 'trial').length,
          totalUsers: tenants.reduce((sum, t) => sum + t.usuariosCount, 0),
        };
      },
    }),
    { name: 'giovanni-superadmin-storage' }
  )
);
