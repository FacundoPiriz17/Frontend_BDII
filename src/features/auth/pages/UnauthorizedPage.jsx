import { LuShieldX, LuLogOut } from "react-icons/lu";
import Button from "../../../components/ui/Button";
import { useAuth } from "../hooks/useAuth";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";

/**
 * Pantalla de acceso restringido. Un único camino de salida: cerrar sesión
 * para volver a ingresar con una cuenta que sí tenga el rol requerido
 */
export default function UnauthorizedPage() {
  useDocumentTitle("Acceso restringido");
  const { logout } = useAuth();

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-surface px-4 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-danger-100 text-danger-600">
        <LuShieldX className="size-8" aria-hidden />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold display-tight">Acceso restringido</h1>
        <p className="max-w-md text-ink-soft">
          Tu cuenta no tiene el rol necesario para entrar a esta sección.
          Cerrá sesión e ingresá con una cuenta autorizada.
        </p>
      </div>
      <Button size="lg" variant="primary" onClick={() => logout()}>
        <LuLogOut className="size-4" aria-hidden /> Cerrar sesión
      </Button>
    </div>
  );
}
