import { useCallback, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { LuArrowLeft, LuShoppingCart, LuInfo } from "react-icons/lu";
import PageHeader from "../../../components/layout/PageHeader";
import Card, { CardBody, CardHeader } from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import { LoadingBlock } from "../../../components/ui/Spinner";
import ErrorMessage from "../../../components/feedback/ErrorMessage";
import EmptyState from "../../../components/ui/EmptyState";
import SectoresDisponibles from "../../partidos/components/SectoresDisponibles";
import CompraResumen from "../components/CompraResumen";
import { partidoService } from "../../partidos/services/partidoService";
import { compraService } from "../services/compraService";
import { useFetch } from "../../../hooks/useFetch";
import { MAX_ENTRADAS_POR_COMPRA } from "../../../lib/constants";
import { formatFecha, formatHora, formatPartido } from "../../../lib/formatters";
import { routePaths } from "../../../routes/routePaths";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";

/**
 * Flujo de compra de UN partido:
 * Regla: máximo 5 entradas por compra
 */
export default function ComprarEntradasPage() {
  useDocumentTitle("Comprar entradas");
  const { idPartido } = useParams();
  const navigate = useNavigate();

  const { data, loading, error, refetch } = useFetch(
    useCallback(() => partidoService.disponibles(), [])
  );
  const partido = useMemo(
    () => (data ?? []).find((p) => String(p.idPartido) === String(idPartido)),
    [data, idPartido]
  );

  const [seleccion, setSeleccion] = useState({}); // { nombreSector: cantidad }
  const [creando, setCreando] = useState(false);

  const total = Object.values(seleccion).reduce((a, b) => a + b, 0);

  const cambiarCantidad = (sector, cantidad) => {
    setSeleccion((prev) => {
      const next = { ...prev };
      if (cantidad <= 0) delete next[sector];
      else next[sector] = cantidad;
      return next;
    });
  };

  const items = useMemo(() => {
    if (!partido) return [];
    return Object.entries(seleccion).map(([nombreSector, cantidad]) => {
      const s = partido.sectores.find((x) => x.nombreSector === nombreSector);
      return { nombreSector, cantidad, precioUnitario: s?.costoTotalEntrada ?? 0 };
    });
  }, [seleccion, partido]);

  const crearCompra = async () => {
    setCreando(true);
    try {
      const compra = await compraService.crear(
        items.map((i) => ({
          idPartido: Number(idPartido),
          nombreSector: i.nombreSector,
          cantidad: i.cantidad,
        }))
      );
      toast.success(`Compra #${compra.idCompra} creada. Confirmala y pagala para emitir tus entradas.`);
      navigate(routePaths.misCompras);
    } catch (err) {
      toast.error(err.detail || "No se pudo crear la compra.");
      refetch(); // la disponibilidad pudo cambiar (alta concurrencia)
    } finally {
      setCreando(false);
    }
  };

  if (loading) return <LoadingBlock label="Cargando disponibilidad…" />;
  if (error) return <ErrorMessage error={error} onRetry={refetch} />;
  if (!partido) {
    return (
      <EmptyState
        title="Este partido no está a la venta"
        description="Puede haber cerrado la venta o no estar habilitado todavía."
        action={<Link to={routePaths.partidos}><Button variant="outline">Ver partidos</Button></Link>}
      />
    );
  }

  return (
    <>
      <Link to={routePaths.partidoDetalle(idPartido)} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900 hover:underline">
        <LuArrowLeft className="size-4" /> Volver al partido
      </Link>
      <PageHeader
        title={formatPartido(partido)}
        subtitle={`${formatFecha(partido.fecha)} · ${formatHora(partido.hora)} h · ${partido.estadio?.nombre}, ${partido.estadio?.ciudad}`}
      />

      <div className="grid items-start gap-6 lg:grid-cols-[7fr_5fr]">
        <Card>
          <CardHeader title="Elegí tus sectores" subtitle={`Podés llevar hasta ${MAX_ENTRADAS_POR_COMPRA} entradas en esta compra.`} />
          <CardBody>
            <SectoresDisponibles
              sectores={partido.sectores}
              seleccion={seleccion}
              onCambiar={cambiarCantidad}
              maxTotal={MAX_ENTRADAS_POR_COMPRA}
            />
          </CardBody>
        </Card>

        <Card className="lg:sticky lg:top-24">
          <CardHeader title="Tu compra" actions={
            <span className="flex items-center gap-1.5 rounded-full bg-container px-3 py-1 text-xs font-bold text-navy-900">
              <LuShoppingCart className="size-3.5" /> {total}/{MAX_ENTRADAS_POR_COMPRA}
            </span>
          } />
          <CardBody className="space-y-4">
            {total === 0 ? (
              <p className="text-sm text-ink-soft">Todavía no agregaste entradas. Usá el selector de cada sector.</p>
            ) : (
              <CompraResumen items={items} total={total} />
            )}
            <div className="flex items-start gap-2 rounded-xl bg-container-low p-3 text-xs text-ink-soft">
              <LuInfo className="mt-0.5 size-4 shrink-0 text-navy-700" />
              <p>La compra se crea <strong>pendiente</strong>: después tenés que confirmarla y pagarla desde “Mis compras” para que tus entradas queden emitidas.</p>
            </div>
            <Button variant="energy" size="lg" className="w-full" disabled={total === 0} loading={creando} onClick={crearCompra}>
              Crear compra {total > 0 && `(${total} ${total === 1 ? "entrada" : "entradas"})`}
            </Button>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
