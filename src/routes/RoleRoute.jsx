import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../features/auth/hooks/useAuth";
import { routePaths } from "./routePaths";

/** Exige que el usuario tenga AL MENOS uno de los roles indicados. */
export default function RoleRoute({ roles = [] }) {
  const { roles: userRoles } = useAuth();
  const permitido = roles.some((r) => userRoles.includes(r));
  return permitido ? <Outlet /> : <Navigate to={routePaths.noAutorizado} replace />;
}
