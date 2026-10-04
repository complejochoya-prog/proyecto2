import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ConfigProvider } from './core/services/ConfigContext';
import AdminLayout from './layouts/AdminLayout';
import RoleGuard from './core/guards/RoleGuard';
import ModuleGuard from './core/guards/ModuleGuard';
import AdminGuard from './core/guards/AdminGuard';
import LoginPage from './modules/admin/LoginPage';

// Existing modules (will be adapted)
import { Dashboard } from './components/dashboard/Dashboard';
import { Reservations } from './components/reservations/Reservations';
import { POS } from './components/pos/POS';
import { CashControl } from './components/cash/CashControl';
import { Clients } from './components/clients/Clients';
import { Settings } from './components/settings/Settings';
import MesasPage from './modules/bar/MesasPage';
import CocinaKDS from './modules/bar/CocinaKDS';
import MozoLayout from './apps/mozos/MozoLayout';
import MozoMesas from './apps/mozos/MozoMesas';
import MozoPedido from './apps/mozos/MozoPedido';
import MozoPedidosList from './apps/mozos/MozoPedidosList';
import MozoNuevo from './apps/mozos/MozoNuevo';
import ToastContainer from './components/notifications/ToastContainer';
import LiveSync from './components/LiveSync';
import DbSync from './components/DbSync';
import DeliveryLayout from './apps/delivery/DeliveryLayout';
import DeliveryPedidos from './apps/delivery/DeliveryPedidos';
import DeliveryActivo from './apps/delivery/DeliveryActivo';
import DeliveryHistorial from './apps/delivery/DeliveryHistorial';
import SuperAdminLayout from './modules/superadmin/SuperAdminLayout';
import SuperAdminDashboard from './modules/superadmin/SuperAdminDashboard';
import TenantsPage from './modules/superadmin/TenantsPage';
import TenantDetail from './modules/superadmin/TenantDetail';
import PlanesPage from './modules/superadmin/PlanesPage';
import ModulosPage from './modules/superadmin/ModulosPage';
import EspaciosPage from './modules/reservas/EspaciosPage';
import TVTurnos from './apps/tv/TVTurnos';
import ClientLayout from './apps/cliente/ClientLayout';
import ClientHome from './apps/cliente/ClientHome';
import ClientReservar from './apps/cliente/ClientReservar';
import ClientMenu from './apps/cliente/ClientMenu';
import ClientMisReservas from './apps/cliente/ClientMisReservas';
import OfertasPage from './modules/ofertas/OfertasPage';
import InventarioPage from './modules/inventario/InventarioPage';

// Placeholder pages for future modules
function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4">
        <span className="text-3xl">🚧</span>
      </div>
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md">
        Este módulo está definido en la arquitectura y se implementará en las próximas fases.
      </p>
    </div>
  );
}

function TenantRoutes() {
  return (
    <ConfigProvider>
      <Routes>
        <Route path="login" element={<LoginPage />} />

        {/* Portal del Cliente (público) */}
        <Route element={<ClientLayout />}>
          <Route index element={<ClientHome />} />
          <Route path="reservar" element={<ClientReservar />} />
          <Route path="menu" element={<ClientMenu />} />
          <Route path="mis-reservas" element={<ClientMisReservas />} />
        </Route>

        {/* Admin Suite - protected */}
        <Route
          element={
            <AdminGuard>
              <AdminLayout />
            </AdminGuard>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />

          <Route
            path="reservas"
            element={
              <ModuleGuard moduleId="reservas">
                <Reservations />
              </ModuleGuard>
            }
          />
          <Route
            path="pos"
            element={
              <ModuleGuard moduleId="bar">
                <POS />
              </ModuleGuard>
            }
          />
          <Route
            path="caja"
            element={
              <ModuleGuard moduleId="caja">
                <CashControl />
              </ModuleGuard>
            }
          />
          <Route path="clientes" element={<Clients />} />
          <Route
            path="mesas"
            element={
              <ModuleGuard moduleId="bar">
                <MesasPage />
              </ModuleGuard>
            }
          />
          <Route
            path="cocina"
            element={
              <ModuleGuard moduleId="cocina">
                <CocinaKDS />
              </ModuleGuard>
            }
          />
          <Route path="espacios" element={
              <ModuleGuard moduleId="reservas">
                <EspaciosPage />
              </ModuleGuard>
            } />
          <Route path="configuracion" element={<Settings />} />

          {/* Future modules */}
          <Route path="inventario" element={
              <ModuleGuard moduleId="inventario">
                <InventarioPage />
              </ModuleGuard>
            } />
          <Route path="ofertas" element={<OfertasPage />} />
          <Route path="empleados" element={<ModuleGuard moduleId="empleados"><Placeholder title="Empleados / RRHH" /></ModuleGuard>} />
          <Route path="torneos" element={<ModuleGuard moduleId="torneos"><Placeholder title="Torneos" /></ModuleGuard>} />
          <Route path="smart-center" element={<ModuleGuard moduleId="smart_center"><Placeholder title="Smart Center IoT" /></ModuleGuard>} />
        </Route>

        {/* Specialized apps (future) */}
        <Route
          path="app/mozos"
          element={
            <RoleGuard allowedRoles={['mozo', 'admin', 'encargado']}>
              <MozoLayout />
            </RoleGuard>
          }
        >
          <Route index element={<MozoMesas />} />
          <Route path="pedidos" element={<MozoPedidosList />} />
          <Route path="nuevo" element={<MozoNuevo />} />
          <Route path="pedido/:pedidoId" element={<MozoPedido />} />
        </Route>
        <Route path="cocina" element={<RoleGuard allowedRoles={['cocina', 'admin', 'encargado']}><CocinaKDS /></RoleGuard>} />
        <Route
          path="app/delivery"
          element={
            <RoleGuard allowedRoles={['delivery', 'admin', 'encargado']}>
              <DeliveryLayout />
            </RoleGuard>
          }
        >
          <Route index element={<DeliveryPedidos />} />
          <Route path="activo" element={<DeliveryActivo />} />
          <Route path="historial" element={<DeliveryHistorial />} />
        </Route>
        <Route path="pantalla/turnos" element={<TVTurnos />} />
        <Route path="pantalla/*" element={<TVTurnos />} />
        <Route path="marketplace/*" element={<Placeholder title="Marketplace de Módulos" />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="." replace />} />
      </Routes>
    </ConfigProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastContainer />
        <LiveSync />
        <DbSync />
        <Routes>
          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/giovanni" replace />} />
          <Route path="/login" element={<LoginPage />} />

          {/* SuperAdmin SaaS Console */}
          <Route
            path="/superadmin"
            element={
              <RoleGuard allowedRoles={['superadmin']}>
                <SuperAdminLayout />
              </RoleGuard>
            }
          >
            <Route index element={<SuperAdminDashboard />} />
            <Route path="tenants" element={<TenantsPage />} />
            <Route path="tenants/:tenantId" element={<TenantDetail />} />
            <Route path="planes" element={<PlanesPage />} />
            <Route path="modulos" element={<ModulosPage />} />
          </Route>

          {/* Tenant sandbox */}
          <Route path="/:negocioId/*" element={<TenantRoutes />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
