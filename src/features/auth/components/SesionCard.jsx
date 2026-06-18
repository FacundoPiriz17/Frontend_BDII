import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { LuTimer, LuRefreshCw } from "react-icons/lu";
import Card, { CardBody } from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import { useAuth } from "../hooks/useAuth";
import { msUntilExpiry } from "../../../lib/jwt";
import { cn } from "../../../lib/cn";

/** Tarjeta de sesión: muestra el tiempo restante del token y permite renovarlo. */
export default function SesionCard() {
  const { token, renewSession } = useAuth();
  const [restante, setRestante] = useState(() => msUntilExpiry(token));
  const [renovando, setRenovando] = useState(false);

  useEffect(() => {
    if (!token) return;
    const tick = () => setRestante(msUntilExpiry(token));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [token]);

  const texto = (() => {
    if (restante == null) return "—";
    if (restante <= 0) return "Expirada";
    const total = Math.floor(restante / 1000);
    const m = Math.floor(total / 60);
    const s = String(total % 60).padStart(2, "0");
    return `${m}:${s}`;
  })();

  const porExpirar = restante != null && restante > 0 && restante <= 5 * 60 * 1000;

  const renovar = async () => {
    try {
      setRenovando(true);
      await renewSession();
      toast.success("Sesión renovada");
    } catch (e) {
      toast.error(e?.detail || "No se pudo renovar la sesión.");
    } finally {
      setRenovando(false);
    }
  };

  return (
    <Card>
      <CardBody className="flex items-center gap-4">
        <span className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-xl",
          porExpirar ? "bg-warn-100 text-warn-600" : "bg-container text-navy-700"
        )}>
          <LuTimer className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-faint">Sesión activa</p>
          <p className={cn("text-lg font-extrabold tabular-nums", porExpirar ? "text-warn-600" : "text-ink")}>
            {texto}
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={renovar} loading={renovando}>
          <LuRefreshCw className="size-4" aria-hidden /> Renovar
        </Button>
      </CardBody>
    </Card>
  );
}
