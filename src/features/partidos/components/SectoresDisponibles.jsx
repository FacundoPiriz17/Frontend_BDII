import { LuMinus, LuPlus } from "react-icons/lu";
import Badge from "../../../components/ui/Badge";
import { formatMoney } from "../../../lib/formatters";
import { cn } from "../../../lib/cn";

/**
 * Lista de sectores con barra de aforo:
 * - barra de ocupación que pasa a rojo cerca del límite (>=95%)
 * - stepper de cantidad cuando es modo selección (compra)
 */

export default function SectoresDisponibles({ sectores = [], seleccion, onCambiar, maxTotal }) {
  const totalSeleccionado = seleccion
    ? Object.values(seleccion).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <ul className="space-y-3">
      {sectores.map((s) => {
        const vendidas = s.entradasVendidas ?? 0;
        const capacidad = s.capacidad ?? 0;
        const disponibles = s.entradasDisponibles ?? Math.max(capacidad - vendidas, 0);
        const ocupacion = capacidad ? Math.round((vendidas / capacidad) * 100) : 0;
        const agotado = disponibles <= 0;
        const cantidad = seleccion?.[s.nombreSector] ?? 0;
        const puedeSumar =
          !agotado && cantidad < disponibles && (maxTotal === undefined || totalSeleccionado < maxTotal);

        return (
          <li
            key={s.nombreSector}
            className={cn(
              "rounded-xl border bg-white p-4 transition-colors",
              cantidad > 0 ? "border-navy-700 ring-1 ring-navy-700/30" : "border-container-high",
              agotado && "opacity-60"
            )}
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-md bg-navy-950 text-lg font-extrabold text-white">
                {s.nombreSector}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-ink">Sector {s.nombreSector}</p>
                  {agotado ? (
                    <Badge variant="danger">Agotado</Badge>
                  ) : ocupacion >= 85 ? (
                    <Badge variant="warn">Quedan {disponibles}</Badge>
                  ) : (
                    <Badge variant="ok">{disponibles} disponibles</Badge>
                  )}
                </div>
                <p className="text-xs text-ink-faint">
                  Capacidad {capacidad.toLocaleString("es-UY")} · {vendidas.toLocaleString("es-UY")} vendidas
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-extrabold text-navy-900 display-tight">
                  {formatMoney(s.costoTotalEntrada ?? s.costoSector ?? s.costo)}
                </p>
                <p className="text-[11px] text-ink-faint">por entrada</p>
              </div>

              {seleccion && (
                <div className="flex items-center gap-1 rounded-lg border border-line bg-container-low p-1">
                  <button
                    type="button"
                    onClick={() => onCambiar(s.nombreSector, cantidad - 1)}
                    disabled={cantidad === 0}
                    aria-label={`Quitar entrada del sector ${s.nombreSector}`}
                    className="flex size-8 items-center justify-center rounded-md text-navy-900 hover:bg-white disabled:opacity-30"
                  >
                    <LuMinus className="size-4" />
                  </button>
                  <span className="w-8 text-center font-extrabold text-ink" aria-live="polite">{cantidad}</span>
                  <button
                    type="button"
                    onClick={() => onCambiar(s.nombreSector, cantidad + 1)}
                    disabled={!puedeSumar}
                    aria-label={`Agregar entrada del sector ${s.nombreSector}`}
                    className="flex size-8 items-center justify-center rounded-md text-navy-900 hover:bg-white disabled:opacity-30"
                  >
                    <LuPlus className="size-4" />
                  </button>
                </div>
              )}
            </div>

            {capacidad > 0 && (
              <div className="mt-3">
                <div className="h-1.5 overflow-hidden rounded-full bg-container-high" role="presentation">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      ocupacion >= 95 ? "bg-danger-500" : ocupacion >= 85 ? "bg-warn-500" : "bg-ok-500"
                    )}
                    style={{ width: `${Math.min(ocupacion, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
