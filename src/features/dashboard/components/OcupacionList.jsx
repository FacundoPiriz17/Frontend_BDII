import { formatPartido } from "../../../lib/formatters";
import { cn } from "../../../lib/cn";

/** Ocupación por evento con barra que pasa a rojo cuando llega al límite. */
export default function OcupacionList({ data = [] }) {
  if (!data.length) {
    return <p className="py-8 text-center text-sm text-ink-soft">Sin datos de ocupación.</p>;
  }
  return (
    <ul className="space-y-4">
      {data.map((o) => {
        const pct = Math.round(o.porcentajeOcupacion ?? 0);
        return (
          <li key={o.idPartido}>
            <div className="mb-1 flex items-center justify-between gap-2 text-sm">
              <span className="min-w-0 truncate font-semibold text-ink">{formatPartido(o)}</span>
              <span className={cn(
                "shrink-0 font-bold tabular-nums",
                pct >= 95 ? "text-danger-600" : pct >= 85 ? "text-warn-600" : "text-ok-600"
              )}>
                {pct}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-container-high">
              <div
                className={cn("h-full rounded-full transition-all", pct >= 95 ? "bg-danger-500" : pct >= 85 ? "bg-warn-500" : "bg-ok-500")}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
            <p className="mt-0.5 text-xs text-ink-faint">
              {o.entradasVendidas?.toLocaleString("es-UY")} / {o.capacidadHabilitada?.toLocaleString("es-UY")} · {o.estadio}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
