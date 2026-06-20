import { useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { LuArrowLeft, LuMapPin, LuCalendarDays, LuClock, LuShieldCheck } from "react-icons/lu";
import PageHeader from "../../../components/layout/PageHeader";
import Card, { CardBody, CardHeader } from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import { LoadingBlock } from "../../../components/ui/Spinner";
import ErrorMessage from "../../../components/feedback/ErrorMessage";
import TeamBadge from "../components/TeamBadge";
import SectoresDisponibles from "../components/SectoresDisponibles";
import EstadioImagen from "../../estadios/components/EstadioImagen";
import { partidoService } from "../services/partidoService";
import { useEquipos } from "../hooks/useEquipos";
import { useFetch } from "../../../hooks/useFetch";
import { useAuth } from "../../auth/hooks/useAuth";
import { formatFechaLarga, formatHora, formatFecha } from "../../../lib/formatters";
import { routePaths } from "../../../routes/routePaths";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";

export default function PartidoDetallePage() {
  const { idPartido } = useParams();
  const { isGeneral } = useAuth();
  const { buscarEquipo } = useEquipos();
  const { data: partido, loading, error, refetch } = useFetch(
    useCallback(() => partidoService.obtener(idPartido), [idPartido])
  );
  useDocumentTitle(partido ? `${partido.equipoLocal} vs ${partido.equipoVisitante}` : "Partido");

  if (loading) return <LoadingBlock label="Cargando partido…" />;
  if (error) return <ErrorMessage error={error} onRetry={refetch} />;
  if (!partido) return null;

  const enJuegoOTerminado = partido.estado !== "no empezado";
  const sectores = partido.sectores ?? [];
  const hayStock = sectores.some((s) => (s.entradasDisponibles ?? 0) > 0);
  const puedeComprar = isGeneral && !enJuegoOTerminado && hayStock;

  return (
    <>
      <Link to={routePaths.partidos} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900 hover:underline">
        <LuArrowLeft className="size-4" aria-hidden /> Volver a partidos
      </Link>

      <section className="relative mb-8 overflow-hidden rounded-3xl bg-navy-950 p-6 text-white sm:p-10">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-0 size-72 rounded-full bg-navy-800/60 blur-3xl" />
          <div className="absolute -bottom-24 right-0 size-72 rounded-full bg-energy-700/30 blur-3xl" />
        </div>
        <div className="relative">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <Badge variant="navy" className="bg-white/10 text-energy-400">{partido.fase}</Badge>
            <Badge estado={partido.estado} />
          </div>
          <div className="grid items-center gap-6 sm:grid-cols-[1fr_auto_1fr]">
            <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-sm">
              <TeamBadge nombre={partido.equipoLocal} equipo={buscarEquipo(partido.equipoLocal)} size="lg" className="text-white [&_span]:text-white" />
              <p className="mt-1 text-xs uppercase tracking-widest text-navy-300">Local</p>
            </div>
            <div className="text-center">
              {enJuegoOTerminado ? (
                <p className="text-5xl font-extrabold display-tight">
                  {partido.marcadorLocal} <span className="text-navy-300">—</span> {partido.marcadorVisitante}
                </p>
              ) : (
                <p className="text-3xl font-extrabold text-navy-300 display-tight">VS</p>
              )}
            </div>
            <div className="rounded-2xl bg-white/5 p-4 text-right backdrop-blur-sm">
              <TeamBadge nombre={partido.equipoVisitante} equipo={buscarEquipo(partido.equipoVisitante)} size="lg" reverse className="w-full text-white [&_span]:text-white" />
              <p className="mt-1 text-xs uppercase tracking-widest text-navy-300">Visitante</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-navy-100">
            <span className="flex items-center gap-2"><LuCalendarDays className="size-4 text-energy-400" /> {formatFechaLarga(partido.fecha)}</span>
            <span className="flex items-center gap-2"><LuClock className="size-4 text-energy-400" /> {formatHora(partido.hora)} h (local)</span>
            <span className="flex items-center gap-2">
              <LuMapPin className="size-4 text-energy-400" />
              {partido.estadio?.nombre} · {partido.estadio?.ciudad}, {partido.estadio?.pais}
            </span>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[7fr_5fr]">
        <Card className="overflow-hidden">
          <div className="relative">
            <EstadioImagen nombre={partido.estadio?.nombre} src={partido.estadio?.imagenUrl} className="h-48 w-full sm:h-56" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/80 to-transparent p-4">
              <p className="flex items-center gap-1.5 text-sm font-bold text-white">
                <LuMapPin className="size-4 text-energy-400" aria-hidden />
                {partido.estadio?.nombre}
              </p>
              <p className="text-xs text-navy-100">{partido.estadio?.ciudad}, {partido.estadio?.pais}</p>
            </div>
          </div>
          <CardHeader
            title="Sectores y disponibilidad"
            subtitle="El precio incluye el costo base del evento más el costo del sector."
          />
          <CardBody>
            {sectores.length ? (
              <SectoresDisponibles sectores={sectores} />
            ) : (
              <p className="text-sm text-ink-soft">Este partido aún no tiene sectores habilitados a la venta.</p>
            )}
          </CardBody>
        </Card>

        <div className="space-y-6">
          <Card className="lg:sticky lg:top-24">
            <CardBody className="space-y-4">
              <h3 className="text-lg font-bold display-tight">¿Listo para ir?</h3>
              <ul className="space-y-2 text-sm text-ink-soft">
                <li className="flex gap-2"><LuShieldCheck className="mt-0.5 size-4 shrink-0 text-ok-500" /> QR dinámico anti-reventa: se regenera cada 30 segundos.</li>
                <li className="flex gap-2"><LuShieldCheck className="mt-0.5 size-4 shrink-0 text-ok-500" /> Hasta 5 entradas por compra, transferibles hasta 3 veces.</li>
                <li className="flex gap-2"><LuShieldCheck className="mt-0.5 size-4 shrink-0 text-ok-500" /> Venta habilitada desde el {formatFecha(partido.fechaHabilitacion)}.</li>
              </ul>
              {puedeComprar ? (
                <Link to={routePaths.comprar(partido.idPartido)} className="block">
                  <Button variant="energy" size="lg" className="w-full">Comprar entradas</Button>
                </Link>
              ) : (
                <Button size="lg" className="w-full" disabled>
                  {enJuegoOTerminado ? "Venta cerrada" : !hayStock ? "Agotado" : "Disponible para usuarios generales"}
                </Button>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
