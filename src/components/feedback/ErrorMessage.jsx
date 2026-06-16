import { LuTriangleAlert, LuRefreshCw } from "react-icons/lu";
import Button from "../ui/Button";

/** Error de carga con causa y reintento */
export default function ErrorMessage({ error, onRetry, title = "No se pudo cargar la información" }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-danger-100 bg-danger-100/40 px-6 py-10 text-center">
      <LuTriangleAlert className="size-8 text-danger-600" aria-hidden />
      <div>
        <h3 className="font-bold text-danger-700">{title}</h3>
        <p className="mt-1 text-sm text-ink-soft">
          {error?.detail || error?.message || "Error inesperado del servidor."}
        </p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <LuRefreshCw className="size-4" /> Reintentar
        </Button>
      )}
    </div>
  );
}
