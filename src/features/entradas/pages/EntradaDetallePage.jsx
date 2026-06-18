import { useCallback } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  LuArrowLeft, LuArrowLeftRight, LuCircleCheck, LuCircleX,
  LuTicketCheck, LuUserRound, LuHistory,
} from "react-icons/lu";
import PageHeader from "../../../components/layout/PageHeader";
import Card, { CardBody, CardHeader } from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import { LoadingBlock } from "../../../components/ui/Spinner";
import ErrorMessage from "../../../components/feedback/ErrorMessage";
import EntradaQR from "../components/EntradaQR";
import { entradaService } from "../services/entradaService";
import { useFetch } from "../../../hooks/useFetch";
import { useAuth } from "../../auth/hooks/useAuth";
import {
  formatFechaHora, formatFecha, formatHora, formatMoney, formatPartido,
} from "../../../lib/formatters";
import { MAX_TRANSFERENCIAS } from "../../../lib/constants";
import { routePaths } from "../../../routes/routePaths";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";
import { cn } from "../../../lib/cn";

const ICONO_EVENTO = {
  compra: LuTicketCheck,
  emision: LuTicketCheck,
  transferencia: LuArrowLeftRight,
  validacion: LuCircleCheck,
};

/** Detalle de entrada: QR a la izquierda, datos + cadena de custodia a la derecha. */
export default function EntradaDetallePage() {
  const { idEntrada } = useParams();
  useDocumentTitle(`Entrada #${idEntrada}`);
  const { user } = useAuth();

  const { data: entrada, loading, error, refetch } = useFetch(
    useCallback(() => entradaService.obtener(idEntrada), [idEntrada])
  );
  const { data: custodia } = useFetch(
    useCallback(() => entradaService.custodia(idEntrada).catch(() => null), [idEntrada])
  );

  if (loading) return <LoadingBlock label="Cargando entrada…" />;
  // Seguridad: si la entrada no existe o no es del usuario (404/403), no
  // mostramos nada de ella; lo devolvemos a su listado de entradas.
  if (error) {
    if (error.status === 404 || error.status === 403) {
      return <Navigate to={routePaths.misEntradas} replace />;
    }
    return <ErrorMessage error={error} onRetry={refetch} />;
  }
  if (!entrada) return <Navigate to={routePaths.misEntradas} replace />;

  const esPropietario = entrada.emailPropietarioActual?.toLowerCase() === user?.email?.toLowerCase();
  const puedeTransferir = esPropietario && entrada.estado === "activa" && entrada.transferenciasRestantes > 0;
  const p = entrada.partido;

  return (
    <>
      <Link to={routePaths.misEntradas} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900 hover:underline">
        <LuArrowLeft className="size-4" /> Volver a mis entradas
      </Link>
      <PageHeader
        title={`Entrada #${entrada.idEntrada}`}
        subtitle={`${formatPartido(p)} · ${formatFecha(p?.fecha)} ${formatHora(p?.hora)} h · ${p?.estadio?.nombre}`}
        actions={
          puedeTransferir && (
            <Link to={`${routePaths.transferenciaNueva}?entrada=${entrada.idEntrada}`}>
              <Button variant="outline">
                <LuArrowLeftRight className="size-4" /> Transferir ({entrada.transferenciasRestantes} restantes)
              </Button>
            </Link>
          )
        }
      />

      <div className="grid items-start gap-6 lg:grid-cols-[5fr_7fr]">

        <div className="lg:sticky lg:top-24">
          <EntradaQR idEntrada={entrada.idEntrada} activo={entrada.estado === "activa" && esPropietario} />
          {!esPropietario && (
            <p className="mt-3 rounded-xl bg-warn-100 p-3 text-xs font-semibold text-warn-600">
              Esta entrada ya no está a tu nombre: el QR solo lo ve el propietario actual.
            </p>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Detalle" actions={<Badge estado={entrada.estado} />} />
            <CardBody>
              <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-ink-faint">Propietario actual</dt>
                  <dd className="mt-0.5 flex items-center gap-1.5 font-semibold text-ink">
                    <LuUserRound className="size-4 text-navy-700" aria-hidden />
                    <span className="truncate">{entrada.nombrePropietarioActual || entrada.emailPropietarioActual}</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-ink-faint">Sector</dt>
                  <dd className="mt-0.5 font-semibold">Sector {entrada.nombreSector}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-ink-faint">Costo total</dt>
                  <dd className="mt-0.5 font-semibold">{formatMoney(entrada.costoTotal)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-ink-faint">Compra de origen</dt>
                  <dd className="mt-0.5 font-semibold">
                    #{entrada.idCompra} {entrada.estadoCompra && <Badge estado={entrada.estadoCompra} className="ml-1" />}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-ink-faint">Emitida</dt>
                  <dd className="mt-0.5 font-semibold">{formatFechaHora(entrada.fechaHora)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-ink-faint">Transferencias restantes</dt>
                  <dd className="mt-1 flex items-center gap-1.5" aria-label={`${entrada.transferenciasRestantes} de ${MAX_TRANSFERENCIAS}`}>
                    {Array.from({ length: MAX_TRANSFERENCIAS }).map((_, i) => (
                      <span key={i} className={cn(
                        "h-2 w-8 rounded-full",
                        i < entrada.transferenciasRestantes ? "bg-ok-500" : "bg-container-high"
                      )} />
                    ))}
                    <span className="ml-1 text-sm font-bold text-ink">{entrada.transferenciasRestantes}/{MAX_TRANSFERENCIAS}</span>
                  </dd>
                </div>
              </dl>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Cadena de custodia"
              subtitle="Historial auditable de la entrada: emisión, transferencias y validación."
            />
            <CardBody>
              {!custodia?.eventos?.length ? (
                <p className="flex items-center gap-2 text-sm text-ink-soft">
                  <LuHistory className="size-4 text-ink-faint" /> Sin movimientos registrados todavía.
                </p>
              ) : (
                <ol className="relative space-y-6 border-l-2 border-container-high pl-6">
                  {custodia.eventos.map((ev, i) => {
                    const Icono = ICONO_EVENTO[(ev.tipo || "").toLowerCase()] ?? LuHistory;
                    const esInvalida = (ev.estado || "").toLowerCase() === "inválida" || (ev.estado || "").toLowerCase() === "rechazada";
                    return (
                      <li key={`${ev.tipo}-${ev.idReferencia}-${i}`} className="relative">
                        <span className={cn(
                          "absolute -left-[37px] flex size-7 items-center justify-center rounded-full ring-4 ring-surface",
                          esInvalida ? "bg-danger-100 text-danger-600" : "bg-navy-100 text-navy-900"
                        )}>
                          {esInvalida ? <LuCircleX className="size-4" /> : <Icono className="size-4" />}
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-bold capitalize text-ink">{ev.tipo}</p>
                          {ev.estado && <Badge estado={ev.estado} />}
                          <span className="ml-auto text-xs tabular-nums text-ink-faint">{formatFechaHora(ev.fechaHora)}</span>
                        </div>
                        {(ev.emailOrigen || ev.emailDestino) && (
                          <p className="mt-0.5 text-sm text-ink-soft">
                            {ev.emailOrigen} {ev.emailDestino && <>→ <strong className="text-ink">{ev.emailDestino}</strong></>}
                          </p>
                        )}
                        {ev.detalle && <p className="mt-0.5 text-sm text-ink-soft">{ev.detalle}</p>}
                      </li>
                    );
                  })}
                </ol>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
