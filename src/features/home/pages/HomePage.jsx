import { useCallback } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  LuTicket, LuShoppingBag, LuArrowLeftRight, LuArrowRight, LuInbox, LuMapPin, LuCalendarDays,
} from "react-icons/lu";
import { motion } from "framer-motion";
import PageHeader from "../../../components/layout/PageHeader";
import Card, { CardBody, CardHeader } from "../../../components/ui/Card";
import StatCard from "../../dashboard/components/StatCard";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import EmptyState from "../../../components/ui/EmptyState";
import { LoadingBlock } from "../../../components/ui/Spinner";
import ErrorMessage from "../../../components/feedback/ErrorMessage";
import { dashboardService } from "../../dashboard/services/dashboardService";
import { useFetch } from "../../../hooks/useFetch";
import { useAuth } from "../../auth/hooks/useAuth";
import { formatFecha, formatHora, formatFechaHora } from "../../../lib/formatters";
import { routePaths } from "../../../routes/routePaths";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";
import heroMundial from "../../../assets/brand/hero-mundial.svg";

/**
 * Inicio del usuario general. Admin y funcionario
 * son redirigidos a su panel correspondiente.
 */
export default function HomePage() {
  useDocumentTitle("Inicio");
  const { user, isAdmin, isFuncionario, isGeneral } = useAuth();

  const debeRedirigir = isAdmin || (isFuncionario && !isGeneral);
  const { data: home, loading, error, refetch } = useFetch(
    useCallback(
      () => (debeRedirigir ? Promise.resolve(null) : dashboardService.homeGeneral()),
      [debeRedirigir]
    )
  );

  if (isAdmin) return <Navigate to={routePaths.admin} replace />;
  if (isFuncionario && !isGeneral) return <Navigate to={routePaths.scanner} replace />;

  if (loading) return <LoadingBlock label="Preparando tu inicio…" />;
  if (error) return <ErrorMessage error={error} onRetry={refetch} />;

  const nombre = (user?.nombre || "").split(" ")[0];

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-8 overflow-hidden rounded-3xl bg-navy-950 px-6 py-8 text-white sm:px-10 sm:py-10"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <img
            src={heroMundial}
            alt=""
            className="absolute inset-y-0 right-0 h-full w-2/3 object-cover object-right opacity-30 [mask-image:linear-gradient(to_right,transparent,black_55%)]"
          />
          <div className="absolute -right-16 -top-20 size-72 rounded-full bg-navy-800/40 blur-3xl" />
          <div className="absolute -bottom-24 left-1/4 size-72 rounded-full bg-energy-700/30 blur-3xl" />
        </div>
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-energy-400">Bienvenido{nombre ? `, ${nombre}` : ""}</p>
            <h1 className="mt-1 text-3xl font-extrabold display-tight sm:text-4xl">Tu Mundial 2026 empieza acá</h1>
            <p className="mt-2 max-w-lg text-sm text-navy-100">Gestioná tus entradas, compras y transferencias desde un solo lugar.</p>
          </div>
          <Link to={routePaths.partidos}>
            <Button variant="energy" size="lg">Ver partidos <LuArrowRight className="size-4" /></Button>
          </Link>
        </div>
      </motion.section>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={LuTicket} label="Entradas activas" value={home?.entradasActivas ?? 0} tone="energy" />
        <StatCard icon={LuShoppingBag} label="Compras pagas" value={home?.comprasPagas ?? 0} tone="ok" />
        <StatCard icon={LuInbox} label="Transferencias recibidas" value={home?.transferenciasPendientesRecibidas ?? 0}
          hint="pendientes de aceptar" tone={home?.transferenciasPendientesRecibidas ? "warn" : "navy"} />
        <StatCard icon={LuArrowLeftRight} label="Transferencias enviadas" value={home?.transferenciasPendientesEnviadas ?? 0}
          hint="pendientes" tone="navy" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[7fr_5fr]">
        <Card>
          <CardHeader title="Tus próximas entradas" actions={
            <Link to={routePaths.misEntradas} className="text-sm font-bold text-navy-900 hover:underline">Ver todas</Link>
          } />
          <CardBody>
            {!home?.proximasEntradas?.length ? (
              <EmptyState icon={LuTicket} title="No tenés entradas próximas"
                description="Conseguí las tuyas antes de que se agoten."
                action={<Link to={routePaths.partidos}><Button variant="energy">Comprar entradas</Button></Link>} />
            ) : (
              <ul className="divide-y divide-container-low">
                {home.proximasEntradas.map((e) => (
                  <li key={e.idEntrada} className="flex items-center gap-3 py-3">
                    <span className="flex size-11 shrink-0 flex-col items-center justify-center rounded-lg bg-navy-950 text-white">
                      <span className="text-[9px] font-bold uppercase text-navy-300">Sec</span>
                      <span className="text-sm font-extrabold">{e.nombreSector}</span>
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-ink">{e.equipoLocal} vs {e.equipoVisitante}</p>
                      <p className="flex items-center gap-1 text-xs text-ink-faint">
                        <LuCalendarDays className="size-3" /> {formatFecha(e.fechaPartido)} · {formatHora(e.horaPartido)} h
                        <LuMapPin className="ml-1 size-3" /> {e.estadio}{e.ciudad ? `, ${e.ciudad}` : ""}
                      </p>
                    </div>
                    <span className="flex items-center gap-2">
                      <Badge estado={e.estado} />
                      <Link to={routePaths.entradaDetalle(e.idEntrada)} className="text-xs font-bold text-navy-900 hover:underline">QR</Link>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Transferencias pendientes" actions={
            <Link to={routePaths.transferencias} className="text-sm font-bold text-navy-900 hover:underline">Ver bandeja</Link>
          } />
          <CardBody>
            {!home?.transferenciasPendientes?.length ? (
              <p className="py-8 text-center text-sm text-ink-soft">No tenés transferencias pendientes.</p>
            ) : (
              <ul className="space-y-3">
                {home.transferenciasPendientes.map((t) => (
                  <li key={t.idTransferencia} className="rounded-xl border border-container-high bg-container-low/50 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-ink">Transferencia #{t.idTransferencia}</p>
                      <span className="text-xs tabular-nums text-ink-faint">{formatFechaHora(t.fechaHora)}</span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-ink-soft">
                      {t.emailOrigen} → {t.emailDestino}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <Link to={routePaths.transferenciaNueva} className="mt-4 block">
              <Button variant="outline" className="w-full"><LuArrowLeftRight className="size-4" /> Nueva transferencia</Button>
            </Link>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
