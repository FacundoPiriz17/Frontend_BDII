import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LuQrCode, LuArrowLeftRight, LuMapPin } from "react-icons/lu";
import Badge from "../../../components/ui/Badge";
import Flag from "../../../components/ui/Flag";
import { formatFecha, formatHora } from "../../../lib/formatters";
import { MAX_TRANSFERENCIAS } from "../../../lib/constants";
import { routePaths } from "../../../routes/routePaths";

/** Ticket */
export default function EntradaCard({ entrada }) {
  const p = entrada.partido;
  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="relative overflow-hidden rounded-2xl border border-container-high/60 bg-white shadow-(--shadow-card)"
    >
      <div className="flex items-stretch">
        <div className="flex w-16 shrink-0 flex-col items-center justify-center gap-1 border-r border-dashed border-line bg-navy-950 text-white">
          <span className="text-[9px] font-bold uppercase tracking-widest text-navy-300">Sector</span>
          <span className="text-2xl font-extrabold display-tight">{entrada.nombreSector}</span>
        </div>

        <div className="min-w-0 flex-1 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 truncate font-extrabold text-ink">
                <Flag codigo={p?.equipoLocal} nombre={p?.equipoLocal} size="xs" />
                {p?.equipoLocal ?? "?"}
                <span className="text-ink-faint">vs</span>
                <Flag codigo={p?.equipoVisitante} nombre={p?.equipoVisitante} size="xs" />
                {p?.equipoVisitante ?? "?"}
              </p>
              <p className="text-xs text-ink-soft">
                {formatFecha(p?.fecha)} · {formatHora(p?.hora)} h
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-faint">
                <LuMapPin className="size-3" aria-hidden />
                <span className="truncate">{p?.estadio?.nombre} · {p?.estadio?.ciudad}</span>
              </p>
            </div>
            <Badge estado={entrada.estado} />
          </div>

          <div className="mt-3 flex items-center justify-between gap-2 border-t border-container-low pt-3">
            <span className="text-xs font-semibold text-ink-soft">
              Entrada <span className="text-ink">#{entrada.idEntrada}</span> ·{" "}
              <span title="Transferencias restantes">
                {entrada.transferenciasRestantes}/{MAX_TRANSFERENCIAS} transf.
              </span>
            </span>
            <span className="flex items-center gap-3">
              {entrada.estado === "activa" && entrada.transferenciasRestantes > 0 && (
                <Link
                  to={`${routePaths.transferenciaNueva}?entrada=${entrada.idEntrada}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-ink-soft hover:text-navy-900"
                >
                  <LuArrowLeftRight className="size-3.5" /> Transferir
                </Link>
              )}
              <Link
                to={routePaths.entradaDetalle(entrada.idEntrada)}
                className="inline-flex items-center gap-1 text-xs font-bold text-navy-900 hover:underline"
              >
                <LuQrCode className="size-3.5" /> {entrada.estado === "activa" ? "Ver QR" : "Detalle"}
              </Link>
            </span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
