import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { routePaths } from "../routes/routePaths";
import ProtectedRoute from "../routes/ProtectedRoute";
import RoleRoute from "../routes/RoleRoute";
import AppLayout from "../components/layout/AppLayout";
import DashboardLayout from "../components/layout/DashboardLayout";
import PerfilLayout from "../components/layout/PerfilLayout";
import { LoadingBlock } from "../components/ui/Spinner";
import { ROLES } from "../lib/constants";

// Auth
const LoginPage = lazy(() => import("../features/auth/pages/LoginPage"));
const RegisterPage = lazy(() => import("../features/auth/pages/RegisterPage"));
const UnauthorizedPage = lazy(() => import("../features/auth/pages/UnauthorizedPage"));
const SessionExpiredPage = lazy(() => import("../features/auth/pages/SessionExpiredPage"));
const NotFoundPage = lazy(() => import("../features/auth/pages/NotFoundPage"));

// General
const HomePage = lazy(() => import("../features/home/pages/HomePage"));
const PartidosPage = lazy(() => import("../features/partidos/pages/PartidosPage"));
const PartidoDetallePage = lazy(() => import("../features/partidos/pages/PartidoDetallePage"));
const EquiposPage = lazy(() => import("../features/equipos/pages/EquiposPage"));
const EquipoDetallePage = lazy(() => import("../features/equipos/pages/EquipoDetallePage"));
const ComprarEntradasPage = lazy(() => import("../features/compras/pages/ComprarEntradasPage"));
const MisComprasPage = lazy(() => import("../features/compras/pages/MisComprasPage"));
const MisEntradasPage = lazy(() => import("../features/entradas/pages/MisEntradasPage"));
const EntradaDetallePage = lazy(() => import("../features/entradas/pages/EntradaDetallePage"));
const MisTransferenciasPage = lazy(() => import("../features/transferencias/pages/MisTransferenciasPage"));
const CrearTransferenciaPage = lazy(() => import("../features/transferencias/pages/CrearTransferenciaPage"));
const PerfilPage = lazy(() => import("../features/usuarios/pages/PerfilPage"));

// Funcionario
const ScannerPage = lazy(() => import("../features/validaciones/pages/ScannerPage"));
const ValidacionesPage = lazy(() => import("../features/validaciones/pages/ValidacionesPage"));

// Admin
const AdminDashboardPage = lazy(() => import("../features/dashboard/pages/AdminDashboardPage"));
const AuditoriaPage = lazy(() => import("../features/dashboard/pages/AuditoriaPage"));
const PartidoFormPage = lazy(() => import("../features/partidos/pages/PartidoFormPage"));
const AdminEventosPage = lazy(() => import("../features/partidos/pages/AdminEventosPage"));
const EstadiosPage = lazy(() => import("../features/estadios/pages/EstadiosPage"));
const EstadioFormPage = lazy(() => import("../features/estadios/pages/EstadioFormPage"));
const UsuariosAdminPage = lazy(() => import("../features/usuarios/pages/UsuariosAdminPage"));
const DispositivosPage = lazy(() => import("../features/dispositivos/pages/DispositivosPage"));

function Cargando() {
  return (
    <div className="flex min-h-[60dvh] items-center justify-center">
      <LoadingBlock />
    </div>
  );
}

export default function AppRouter() {
  return (
    <Suspense fallback={<Cargando />}>
      <Routes>

        <Route path={routePaths.login} element={<LoginPage />} />
        <Route path={routePaths.registro} element={<RegisterPage />} />
        <Route path={routePaths.noAutorizado} element={<UnauthorizedPage />} />
        <Route path={routePaths.sesionExpirada} element={<SessionExpiredPage />} />

        <Route element={<ProtectedRoute />}>
          {/* Navbar + footer. Rutas compartidas (cualquier rol autenticado) */}
          <Route element={<AppLayout />}>
            <Route path={routePaths.home} element={<HomePage />} />
            <Route path={routePaths.partidos} element={<PartidosPage />} />
            <Route path={routePaths.partidoDetalle()} element={<PartidoDetallePage />} />
            <Route path={routePaths.equipos} element={<EquiposPage />} />
            <Route path={routePaths.equipoDetalle()} element={<EquipoDetallePage />} />

            {/* Exclusivo del usuario general*/}
            <Route element={<RoleRoute roles={[ROLES.GENERAL]} />}>
              <Route path={routePaths.comprar()} element={<ComprarEntradasPage />} />
              <Route path={routePaths.misCompras} element={<MisComprasPage />} />
              <Route path={routePaths.misEntradas} element={<MisEntradasPage />} />
              <Route path={routePaths.entradaDetalle()} element={<EntradaDetallePage />} />
              <Route path={routePaths.transferencias} element={<MisTransferenciasPage />} />
              <Route path={routePaths.transferenciaNueva} element={<CrearTransferenciaPage />} />
            </Route>
          </Route>

          {/* Perfil: chrome según rol (navbar general o panel admin/funcionario) */}
          <Route element={<PerfilLayout />}>
            <Route path={routePaths.perfil} element={<PerfilPage />} />
          </Route>

          {/* Panel: sidebar (admin y funcionario) */}
          <Route element={<DashboardLayout />}>
            {/* Funcionario */}
            <Route element={<RoleRoute roles={[ROLES.FUNCIONARIO]} />}>
              <Route path={routePaths.scanner} element={<ScannerPage />} />
            </Route>

            {/* Validaciones: admin o funcionario */}
            <Route element={<RoleRoute roles={[ROLES.FUNCIONARIO, ROLES.ADMIN]} />}>
              <Route path={routePaths.validaciones} element={<ValidacionesPage />} />
              <Route path={routePaths.adminValidaciones} element={<ValidacionesPage />} />
            </Route>

            {/* Admin */}
            <Route element={<RoleRoute roles={[ROLES.ADMIN]} />}>
              <Route path={routePaths.admin} element={<AdminDashboardPage />} />
              <Route path={routePaths.adminEventos} element={<AdminEventosPage />} />
              <Route path={routePaths.adminEventoNuevo} element={<PartidoFormPage />} />
              <Route path={routePaths.adminEventoEditar()} element={<PartidoFormPage />} />
              <Route path={routePaths.adminEstadios} element={<EstadiosPage />} />
              <Route path={routePaths.adminEstadioNuevo} element={<EstadioFormPage />} />
              <Route path={routePaths.adminEstadioEditar()} element={<EstadioFormPage />} />
              <Route path={routePaths.adminUsuarios} element={<UsuariosAdminPage />} />
              <Route path={routePaths.adminDispositivos} element={<DispositivosPage />} />
              <Route path={routePaths.adminAuditoria} element={<AuditoriaPage />} />
            </Route>
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
