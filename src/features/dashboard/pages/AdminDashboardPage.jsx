import { useCallback } from "react";
import { Link } from "react-router-dom";
import {
  LuCalendarDays, LuTicket, LuDollarSign, LuShieldCheck, LuTriangleAlert, LuArrowRight,
} from "react-icons/lu";
import PageHeader from "../../../components/layout/PageHeader";
import Card, { CardBody, CardHeader } from "../../../components/ui/Card";
import StatCard from "../components/StatCard";
import EntradasVendidasChart from "../components/EntradasVendidasChart";
import RankingTable from "../components/RankingTable";
import OcupacionList from "../components/OcupacionList";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import { LoadingBlock } from "../../../components/ui/Spinner";
import ErrorMessage from "../../../components/feedback/ErrorMessage";
import { dashboardService } from "../services/dashboardService";
import { useFetch } from "../../../hooks/useFetch";
import { formatMoney, formatFecha, formatHora } from "../../../lib/formatters";
import { routePaths } from "../../../routes/routePaths";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";

/** Panel regional del admin */
export default function AdminDashboardPage() {
  useDocumentTitle("Dashboard");
  const { data: home, loading, error, refetch } = useFetch(
    useCallback(() => dashboardService.homeAdmin(), [])
  );
  const { data: masVendidos } = useFetch(useCallback(() => dashboardService.eventosMasVendidos(6), []));
  const { data: compradores } = useFetch(useCallback(() => dashboardService.mayoresCompradores(5), []));
  const { data: ocupacion } = useFetch(useCallback(() => dashboardService.ocupacionEventos(6), []));

  if (loading) return <LoadingBlock label="Cargando panel…" />;
  if (error) return <ErrorMessage error={error} onRetry={refetch} />;

  return (
    <>
      <PageHeader
        title="Panel de control"
        subtitle="Visión general de eventos, ventas y validaciones de tu país sede."
        actions={
          <Link to={routePaths.adminEventoNuevo}>
            <Button>Nuevo evento <LuArrowRight className="size-4" /></Button>
          </Link>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={LuCalendarDays} label="Eventos totales" value={home?.eventosTotales ?? 0} hint={`${home?.eventosFuturos ?? 0} próximos`} />
        <StatCard icon={LuTicket} label="Entradas vendidas" value={(home?.entradasVendidas ?? 0).toLocaleString("es-UY")} tone="energy" />
        <StatCard icon={LuDollarSign} label="Recaudación" value={formatMoney(home?.montoVendido ?? 0)} tone="ok" />
        <StatCard icon={LuShieldCheck} label="Validaciones hoy" value={home?.validacionesHoy ?? 0}
          hint={home?.validacionesInvalidasHoy ? `${home.validacionesInvalidasHoy} inválidas` : "sin rechazos"}
          tone={home?.validacionesInvalidasHoy ? "warn" : "navy"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[7fr_5fr]">
        
        {/* Eventos más vendidos */}
        <Card>
          <CardHeader title="Eventos con más entradas vendidas" subtitle="Top de recaudación por partido." />
          <CardBody><EntradasVendidasChart data={masVendidos ?? []} /></CardBody>
        </Card>

        {/* Top compradores */}
        <Card className="overflow-hidden bg-navy-950 text-white border-navy-900">
          <CardHeader title={<span className="text-white">Mayores compradores</span>} subtitle={<span className="text-navy-300">Ranking por monto pagado.</span>} />
          <CardBody><RankingTable data={compradores ?? []} /></CardBody>
        </Card>

        {/* Ocupación */}
        <Card>
          <CardHeader title="Ocupación de eventos" subtitle="Las barras pasan a rojo al acercarse al aforo máximo." />
          <CardBody><OcupacionList data={ocupacion ?? []} /></CardBody>
        </Card>

        {/* Próximos eventos */}
        <Card>
          <CardHeader title="Próximos eventos" actions={
            <Link to={routePaths.adminEventos} className="text-sm font-bold text-navy-900 hover:underline">Ver todos</Link>
          } />
          <CardBody>
            {!home?.proximosEventos?.length ? (
              <p className="py-8 text-center text-sm text-ink-soft">No hay eventos próximos.</p>
            ) : (
              <ul className="divide-y divide-container-low">
                {home.proximosEventos.map((e) => (
                  <li key={e.idPartido} className="flex items-center gap-3 py-3">
                    <div className="flex size-10 flex-col items-center justify-center rounded-lg bg-container text-navy-900">
                      <span className="text-[10px] font-bold uppercase">{formatFecha(e.fecha).split(" ")[1]}</span>
                      <span className="-mt-1 text-sm font-extrabold">{formatFecha(e.fecha).split(" ")[0] ? new Date(e.fecha).getDate() : ""}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-ink">{e.equipoLocal} vs {e.equipoVisitante}</p>
                      <p className="text-xs text-ink-faint">{formatFecha(e.fecha)} · {formatHora(e.hora)} h · {e.estadio}</p>
                    </div>
                    <Badge variant="navy">{e.entradasVendidas} vend.</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
