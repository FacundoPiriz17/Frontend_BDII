import { useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LuArrowLeft, LuCalendarDays, LuClock, LuMapPin, LuTrophy, LuUsers, LuChevronRight,
} from "react-icons/lu";
import { LoadingBlock } from "../../../components/ui/Spinner";
import ErrorMessage from "../../../components/feedback/ErrorMessage";
import EmptyState from "../../../components/ui/EmptyState";
import Badge from "../../../components/ui/Badge";
import Flag from "../../../components/ui/Flag";
import { equipoService } from "../services/equipoService";
import { partidoService } from "../../partidos/services/partidoService";
import { useFetch } from "../../../hooks/useFetch";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";
import { routePaths } from "../../../routes/routePaths";
import { formatFecha, formatHora } from "../../../lib/formatters";
import { cn } from "../../../lib/cn";

export default function EquipoDetallePage() {
  const { codigoFifa } = useParams();
  const navigate = useNavigate();

  const cargar = useCallback(async () => {
    const [equipo, equipos, partidos] = await Promise.all([
      equipoService.obtener(codigoFifa),
      partidoService.equipos(),
      equipoService.partidosDeEquipo(codigoFifa),
    ]);
    return { equipo, equipos, partidos };
  }, [codigoFifa]);

  const { data, loading, error, refetch } = useFetch(cargar, [codigoFifa]);
  useDocumentTitle(data?.equipo ? `${data.equipo.nombre} · Equipo` : "Equipo");

  if (loading) return <LoadingBlock label="Cargando equipo…" />;
  if (error) return <ErrorMessage error={error} onRetry={refetch} />;

  const { equipo, equipos, partidos } = data;
  if (!equipo) {
    return (
      <EmptyState
        icon={LuUsers}
        title="Equipo no encontrado"
        description="El código no corresponde a ninguna selección."
        action={
          <Link to={routePaths.equipos} className="text-sm font-bold text-navy-900 hover:underline">
            Volver a equipos
          </Link>
        }
      />
    );
  }

  const idx = (code) => equipos.find((e) => e.codigoFifa?.toUpperCase() === code?.toUpperCase());
  const compañeros = equipos
    .filter((e) => e.grupo === equipo.grupo && e.codigoFifa !== equipo.codigoFifa)
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(routePaths.equipos)}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-navy-900"
      >
        <LuArrowLeft className="size-4" aria-hidden /> Equipos
      </button>

      {/* Cabecera país */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden rounded-3xl bg-navy-950 text-white shadow-(--shadow-trust)"
      >
        <div className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:gap-6 sm:p-8">
          <Flag codigo={equipo.codigoFifa} nombre={equipo.nombre} size="xl" className="ring-2 ring-white/20" />
          <div className="text-center sm:text-left">
            <p className="text-xs font-bold uppercase tracking-widest text-energy-500">Selección nacional</p>
            <h1 className="mt-1 text-3xl font-extrabold display-tight sm:text-4xl">{equipo.nombre}</h1>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">{equipo.codigoFifa}</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-energy-500 px-3 py-1 text-xs font-extrabold text-navy-950">
                <LuTrophy className="size-3.5" aria-hidden /> Grupo {equipo.grupo}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Rivales del grupo */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold text-ink display-tight">
          <LuUsers className="size-5 text-navy-700" aria-hidden /> Grupo {equipo.grupo}
        </h2>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {compañeros.map((e) => (
            <Link
              key={e.codigoFifa}
              to={routePaths.equipoDetalle(e.codigoFifa)}
              className="flex items-center gap-3 rounded-xl border border-container-high bg-white p-3 shadow-(--shadow-card) transition-colors hover:border-navy-300"
            >
              <Flag codigo={e.codigoFifa} nombre={e.nombre} size="md" />
              <span className="min-w-0 truncate text-sm font-bold text-ink">{e.nombre}</span>
            </Link>
          ))}
          {compañeros.length === 0 && (
            <p className="text-sm text-ink-faint">Aún no hay otros equipos cargados en este grupo.</p>
          )}
        </div>
      </section>

      {/* Partidos */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold text-ink display-tight">
          <LuCalendarDays className="size-5 text-navy-700" aria-hidden /> Partidos
          <span className="text-sm font-semibold text-ink-faint">({partidos.length})</span>
        </h2>

        {partidos.length === 0 ? (
          <EmptyState
            icon={LuCalendarDays}
            title="Sin partidos programados"
            description={`Todavía no hay encuentros agendados para ${equipo.nombre}.`}
          />
        ) : (
          <ul className="space-y-2.5">
            {partidos.map((p) => {
              const esLocal = p.equipoLocal?.toUpperCase() === equipo.codigoFifa.toUpperCase();
              const rivalCode = esLocal ? p.equipoVisitante : p.equipoLocal;
              const rival = idx(rivalCode);
              return (
                <li key={p.idPartido}>
                  <Link
                    to={routePaths.partidoDetalle(p.idPartido)}
                    className="group flex items-center gap-4 rounded-2xl border border-container-high bg-white p-4 shadow-(--shadow-card) transition-all hover:border-navy-300 hover:shadow-(--shadow-trust)"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <Flag codigo={equipo.codigoFifa} nombre={equipo.nombre} size="md" />
                      <span className="text-xs font-bold text-ink-faint">{esLocal ? "vs" : "@"}</span>
                      <Flag codigo={rivalCode} nombre={rival?.nombre || rivalCode} size="md" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-extrabold text-ink">{rival?.nombre || rivalCode}</p>
                        <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-ink-soft">
                          <span className="inline-flex items-center gap-1">
                            <LuCalendarDays className="size-3.5" aria-hidden /> {formatFecha(p.fecha)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <LuClock className="size-3.5" aria-hidden /> {formatHora(p.hora)}
                          </span>
                          {p.estadio?.nombre && (
                            <span className="inline-flex items-center gap-1">
                              <LuMapPin className="size-3.5" aria-hidden /> {p.estadio.nombre}
                              {p.estadio.ciudad ? `, ${p.estadio.ciudad}` : ""}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {p.fase && <Badge variant="navy" className="hidden sm:inline-flex">{p.fase}</Badge>}
                      <span className={cn(
                        "flex size-8 items-center justify-center rounded-full bg-container text-ink-soft",
                        "transition-colors group-hover:bg-navy-900 group-hover:text-white"
                      )}>
                        <LuChevronRight className="size-4" aria-hidden />
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
