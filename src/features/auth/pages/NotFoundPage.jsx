import { Link } from "react-router-dom";
import { routePaths } from "../../../routes/routePaths";
import Button from "../../../components/ui/Button";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";

export default function NotFoundPage() {
  useDocumentTitle("Página no encontrada");
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-7xl font-extrabold text-navy-100 display-tight">404</p>
      <h1 className="text-2xl font-extrabold display-tight">Esta página no existe</h1>
      <p className="max-w-md text-ink-soft">El enlace puede estar vencido o mal escrito.</p>
      <Link to={routePaths.home}>
        <Button>Ir al inicio</Button>
      </Link>
    </div>
  );
}
