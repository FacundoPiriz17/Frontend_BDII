import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LuMapPin, LuCalendarDays, LuClock } from "react-icons/lu";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import TeamBadge from "./TeamBadge";
import { formatFecha, formatHora, formatMoney } from "../../../lib/formatters";
import { routePaths } from "../../../routes/routePaths";

/**
 * Card de partido para el listado público.
 * Acepta EventoResponse o PartidoDisponibleResponse:
 * - chip de disponibilidad si vienen sectores con stock
 */

export default function PartidoCard({ partido, buscarEquipo, comprable = true }) {
  const jugado = partido.estado && partido.estado !== "no empezado";
  const sectores = partido.sectores ?? [];
  const conStock = sectores.filter((s) => (s.entradasDisponibles ?? 1) > 0);
  const desde = sectores.length
    ? Math.min(...sectores.map((s) => s.costoTotalEntrada ?? s.costoSector ?? 0))
    : partido.costoBase;

  const disponibilidad = !sectores.length
    ? null
    : conStock.length === 0
      ? { variant: "danger", label: "Agotado" }
      : conStock.some((s) => s.entradasDisponibles / Math.max(s.capacidad, 1) > 0.15)
        ? { variant: "ok", label: "Disponible" }
        : { variant: "warn", label: "Últimas entradas" };

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col overflow-hidden rounded-2xl border border-container-high/60 bg-white shadow-(--shadow-card)"
    >
      <div className="flex items-center justify-between gap-2 bg-navy-950 px-4 py-2.5">
        <span className="text-[11px] font-bold uppercase tracking-widest text-navy-200">
          {partido.fase || "Mundial 2026"}
        </span>
        <span className="flex items-center gap-2">
          {disponibilidad && <Badge variant={disponibilidad.variant}>{disponibilidad.label}</Badge>}
          {partido.estado && partido.estado !== "no empezado" && <Badge estado={partido.estado} />}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <TeamBadge nombre={partido.equipoLocal} equipo={buscarEquipo?.(partido.equipoLocal)} />
            <TeamBadge nombre={partido.equipoVisitante} equipo={buscarEquipo?.(partido.equipoVisitante)} />
          </div>
          {jugado ? (
            <div className="shrink-0 text-right">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Resultado</p>
              <p className="text-2xl font-extrabold tabular-nums text-navy-900 display-tight">
                {partido.marcadorLocal ?? 0}<span className="mx-1 text-ink-faint">-</span>{partido.marcadorVisitante ?? 0}
              </p>
            </div>
          ) : desde !== undefined && desde !== null ? (
            <div className="shrink-0 text-right">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Desde</p>
              <p className="text-xl font-extrabold text-navy-900 display-tight">{formatMoney(desde)}</p>
            </div>
          ) : null}
        </div>

        <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1.5 border-t border-container-low pt-3 text-xs font-medium text-ink-soft">
          <span className="flex items-center gap-1.5">
            <LuCalendarDays className="size-3.5 text-ink-faint" aria-hidden /> {formatFecha(partido.fecha)}
          </span>
          <span className="flex items-center gap-1.5">
            <LuClock className="size-3.5 text-ink-faint" aria-hidden /> {formatHora(partido.hora)} h
          </span>
          <span className="flex items-center gap-1.5 min-w-0">
            <LuMapPin className="size-3.5 shrink-0 text-ink-faint" aria-hidden />
            <span className="truncate">
              {partido.estadio?.nombre}
              {partido.estadio?.ciudad ? ` · ${partido.estadio.ciudad}` : ""}
            </span>
          </span>
        </div>

        <Link to={routePaths.partidoDetalle(partido.idPartido)} className="block">
          <Button
            variant={comprable && disponibilidad?.variant !== "danger" ? "primary" : "outline"}
            className="w-full"
          >
            {comprable && disponibilidad?.variant !== "danger" ? "Ver sectores y comprar" : "Ver detalle"}
          </Button>
        </Link>
      </div>
    </motion.article>
  );
}
