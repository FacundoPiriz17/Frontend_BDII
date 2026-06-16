import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { LuTimerReset, LuRefreshCw, LuLogOut } from "react-icons/lu";
import Button from "../../../components/ui/Button";
import { useAuth } from "../hooks/useAuth";
import { routePaths } from "../../../routes/routePaths";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";
import { msUntilExpiry } from "../../../lib/jwt";

/**
 * Pantalla de "sesión por expirar / expirada".
 * Se llega acá automáticamente cuando faltan 5 min de sesión (o tras un 401).
 * Ofrece dos caminos claros: renovar la sesión o cerrarla (heurísticas de
 * Nielsen: visibilidad del estado del sistema + control y libertad del usuario).
 */
export default function SessionExpiredPage() {
  useDocumentTitle("Tu sesión está por expirar");
  const { token, renewSession, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [restante, setRestante] = useState(() => msUntilExpiry(token));
  const [renovando, setRenovando] = useState(false);

  const destino = location.state?.from?.pathname || routePaths.home;

  // Cuenta regresiva en vivo
  useEffect(() => {
    if (!token) {
      setRestante(null);
      return;
    }
    const tick = () => setRestante(msUntilExpiry(token));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [token]);

  const vencida = restante == null || restante <= 0;

  const countdown = useMemo(() => {
    if (restante == null || restante <= 0) return null;
    const total = Math.floor(restante / 1000);
    const m = Math.floor(total / 60);
    const s = String(total % 60).padStart(2, "0");
    return `${m}:${s}`;
  }, [restante]);

  const renovar = async () => {
    try {
      setRenovando(true);
      await renewSession();
      toast.success("Sesión renovada");
      navigate(destino, { replace: true });
    } catch (e) {
      toast.error(e?.detail || "No se pudo renovar la sesión. Iniciá sesión de nuevo.");
    } finally {
      setRenovando(false);
    }
  };

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-navy-950 px-4 text-center">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/4 size-96 rounded-full bg-navy-800/50 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 size-[28rem] rounded-full bg-energy-700/30 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/95 p-8 shadow-(--shadow-trust) backdrop-blur">
        <div className={`mx-auto mb-4 flex size-14 items-center justify-center rounded-full ${vencida ? "bg-danger-100 text-danger-600" : "bg-warn-100 text-warn-600"}`}>
          <LuTimerReset className="size-7" aria-hidden />
        </div>

        <h1 className="text-2xl font-extrabold text-ink display-tight">
          {vencida ? "Tu sesión expiró" : "Tu sesión está por expirar"}
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          {vencida
            ? "Por seguridad cerramos la sesión. Iniciá sesión de nuevo para continuar."
            : "Por seguridad la sesión tiene tiempo límite. Podés renovarla y seguir donde estabas, o cerrarla."}
        </p>

        {!vencida && countdown && (
          <p className="mt-4 text-sm font-medium text-ink-soft">
            Se cerrará automáticamente en{" "}
            <span className="tabular-nums font-extrabold text-danger-600">{countdown}</span>
          </p>
        )}

        <div className="mt-6 space-y-3">
          {!vencida && (
            <Button size="lg" className="w-full" onClick={renovar} loading={renovando} disabled={!token}>
              <LuRefreshCw className="size-4" aria-hidden /> Renovar sesión
            </Button>
          )}
          <Button
            size="lg"
            variant={vencida ? "primary" : "outline"}
            className="w-full"
            onClick={() => logout()}
          >
            <LuLogOut className="size-4" aria-hidden /> {vencida ? "Iniciar sesión" : "Cerrar sesión"}
          </Button>
        </div>
      </div>
    </div>
  );
}
