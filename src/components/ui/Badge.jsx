import { cn } from "../../lib/cn";

/**
 * Chip de estado. El mapa cubre todos los enums del modelo:
 * compra, entrada, transferencia, partido y validación.
 */

const ESTILOS = {

  // compra
  pendiente: "bg-warn-100 text-warn-600",
  confirmada: "bg-info-100 text-info-600",
  paga: "bg-ok-100 text-ok-600",
  cancelada: "bg-container-high text-ink-faint",

  // entrada
  activa: "bg-ok-100 text-ok-600",
  consumida: "bg-container-high text-ink-faint",

  // transferencia
  aceptada: "bg-ok-100 text-ok-600",
  rechazada: "bg-danger-100 text-danger-700",

  // partido
  "no empezado": "bg-info-100 text-info-600",
  empezado: "bg-ok-100 text-ok-600",
  terminado: "bg-container-high text-ink-faint",

  // validación
  "válida": "bg-ok-100 text-ok-600",
  "inválida": "bg-danger-100 text-danger-700",
  
  // genéricos
  ok: "bg-ok-100 text-ok-600",
  warn: "bg-warn-100 text-warn-600",
  danger: "bg-danger-100 text-danger-700",
  info: "bg-info-100 text-info-600",
  neutral: "bg-container-high text-ink-soft",
  navy: "bg-navy-100 text-navy-900",
};

export default function Badge({ estado, variant, children, className, dot = false }) {
  const key = (variant ?? estado ?? "neutral").toLowerCase();
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide",
        ESTILOS[key] || ESTILOS.neutral,
        className
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" aria-hidden />}
      {children ?? estado}
    </span>
  );
}
