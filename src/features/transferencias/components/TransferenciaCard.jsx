import { Link } from "react-router-dom";
import { LuArrowRight, LuArrowLeftRight, LuQrCode } from "react-icons/lu";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import { formatFechaHora, formatPartido } from "../../../lib/formatters";
import { routePaths } from "../../../routes/routePaths";
import { cn } from "../../../lib/cn";

/**
 * Tarjeta de transferencia. `relacion` indica si el usuario es origen
 * (envió) o destino (recibió) para decidir qué acciones mostrar.
 */
export default function TransferenciaCard({ transferencia: t, relacion, onAccion, procesandoId }) {
  const esDestino = relacion === "recibidas";
  const p = t.entrada?.partido;
  const procesando = procesandoId === t.idTransferencia;

  return (
    <article className="rounded-2xl border border-container-high/60 bg-white p-4 shadow-(--shadow-card)">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-container text-navy-900">
            <LuArrowLeftRight className="size-4" aria-hidden />
          </span>
          <div>
            <p className="font-bold text-ink">Transferencia #{t.idTransferencia}</p>
            <p className="text-xs text-ink-faint">{formatFechaHora(t.fechaHora)}</p>
          </div>
        </div>
        <Badge estado={t.estado} />
      </div>

      {/* Flujo origen -> destino */}
      <div className="mt-3 flex items-center gap-2 rounded-xl bg-container-low p-3 text-sm">
        <span className={cn("min-w-0 flex-1 truncate", !esDestino && "font-bold text-ink")}>
          {t.emailOrigen}
        </span>
        <LuArrowRight className="size-4 shrink-0 text-ink-faint" aria-hidden />
        <span className={cn("min-w-0 flex-1 truncate text-right", esDestino && "font-bold text-ink")}>
          {t.emailDestino}
        </span>
      </div>

      {t.entrada && (
        <p className="mt-2 text-sm text-ink-soft">
          Entrada <strong className="text-ink">#{t.entrada.idEntrada}</strong> · {formatPartido(p)} · Sector {t.entrada.nombreSector}
        </p>
      )}

      {/* Acciones según estado y relación */}
      {t.estado === "pendiente" && (
        <div className="mt-3 flex gap-2 border-t border-container-low pt-3">
          {esDestino ? (
            <>
              <Button size="sm" variant="energy" loading={procesando} onClick={() => onAccion("aceptar", t)}>Aceptar</Button>
              <Button size="sm" variant="ghost" className="text-danger-600" loading={procesando} onClick={() => onAccion("rechazar", t)}>Rechazar</Button>
            </>
          ) : (
            <Button size="sm" variant="outline" loading={procesando} onClick={() => onAccion("cancelar", t)}>Cancelar envío</Button>
          )}
        </div>
      )}

      {/* Tras aceptar una transferencia recibida, acceso directo a la entrada/QR */}
      {esDestino && t.estado === "aceptada" && t.entrada && (
        <div className="mt-3 border-t border-container-low pt-3">
          <Link to={routePaths.entradaDetalle(t.entrada.idEntrada)}>
            <Button size="sm" variant="energy" className="w-full">
              <LuQrCode className="size-4" aria-hidden /> Ver entrada / QR
            </Button>
          </Link>
        </div>
      )}
    </article>
  );
}
