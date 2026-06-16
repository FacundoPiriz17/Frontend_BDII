import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/hooks/useAuth";
import { LoadingBlock } from "../components/ui/Spinner";
import { routePaths } from "./routePaths";

/** Exige sesión activa. Mientras rehidrata el perfil muestra loading. */
export default function ProtectedRoute() {
  const { isAuthenticated, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <LoadingBlock label="Recuperando tu sesión…" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={routePaths.login} replace state={{ from: location }} />;
  }
  return <Outlet />;
}
