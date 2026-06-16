import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { LuShoppingBag, LuChevronDown, LuTicket } from "react-icons/lu";
import { AnimatePresence, motion } from "framer-motion";
import PageHeader from "../../../components/layout/PageHeader";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Select from "../../../components/ui/Select";
import EmptyState from "../../../components/ui/EmptyState";
import { LoadingBlock } from "../../../components/ui/Spinner";
import ErrorMessage from "../../../components/feedback/ErrorMessage";
import ConfirmDialog from "../../../components/feedback/ConfirmDialog";
import { compraService } from "../services/compraService";
import { useFetch } from "../../../hooks/useFetch";
import { ESTADOS_COMPRA } from "../../../lib/constants";
import { formatFechaHora, formatMoney, formatPartido } from "../../../lib/formatters";
import { routePaths } from "../../../routes/routePaths";
import { cn } from "../../../lib/cn";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";

/**
 * Historial de compras con la máquina de estados visible
 * Cada fila expande sus entradas.
 */
export default function MisComprasPage() {
  useDocumentTitle("Mis compras");
  const [estado, setEstado] = useState("");
  const { data, loading, error, refetch } = useFetch(
    useCallback(() => compraService.listar({ estado: estado || undefined }), [estado])
  );

  const [abierta, setAbierta] = useState(null);
  const [accion, setAccion] = useState(null);
  const [procesando, setProcesando] = useState(false);

  const ejecutarAccion = async () => {
    if (!accion) return;
    setProcesando(true);
    try {
      const fn = { confirmar: compraService.confirmar, pagar: compraService.pagar, cancelar: compraService.cancelar }[accion.tipo];
      await fn(accion.compra.idCompra);
      toast.success(
        accion.tipo === "pagar"
          ? "¡Pago registrado! Tus entradas ya están activas en “Mis entradas”."
          : accion.tipo === "confirmar"
            ? "Compra confirmada. Falta el pago para emitir las entradas."
            : "Compra cancelada."
      );
      setAccion(null);
      refetch();
    } catch (err) {
      toast.error(err.detail || "La acción no se pudo completar.");
    } finally {
      setProcesando(false);
    }
  };

  const compras = [...(data ?? [])].sort((a, b) => (b.fechaHora ?? "").localeCompare(a.fechaHora ?? ""));

  return (
    <>
      <PageHeader
        title="Mis compras"
        subtitle="Una compra emite sus entradas recién cuando está paga."
        actions={
          <Select aria-label="Filtrar por estado" placeholder="Todos los estados" options={ESTADOS_COMPRA}
            value={estado} onChange={(e) => setEstado(e.target.value)} className="w-44" />
        }
      />

      {loading ? (
        <LoadingBlock />
      ) : error ? (
        <ErrorMessage error={error} onRetry={refetch} />
      ) : compras.length === 0 ? (
        <EmptyState
          icon={LuShoppingBag}
          title="Todavía no hiciste compras"
          description="Explorá la cartelera y asegurá tu lugar en el Mundial."
          action={<Link to={routePaths.partidos}><Button>Ver partidos</Button></Link>}
        />
      ) : (
        <ul className="space-y-4">
          {compras.map((c) => {
            const expandida = abierta === c.idCompra;
            return (
              <li key={c.idCompra} className="overflow-hidden rounded-2xl border border-container-high/60 bg-white shadow-(--shadow-card)">
                <div className="flex flex-wrap items-center gap-3 p-4 sm:px-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-extrabold text-ink">Compra #{c.idCompra}</p>
                      <Badge estado={c.estado} />
                    </div>
                    <p className="text-xs text-ink-faint">
                      {formatFechaHora(c.fechaHora)} · {c.entradas?.length ?? 0} entrada{(c.entradas?.length ?? 0) === 1 ? "" : "s"} · comisión {c.porcentajeComision}%
                    </p>
                  </div>
                  <p className="text-lg font-extrabold text-navy-900 display-tight">{formatMoney(c.montoTotal)}</p>

                  <div className="flex items-center gap-2">
                    {c.estado === "pendiente" && (
                      <>
                        <Button size="sm" onClick={() => setAccion({ tipo: "confirmar", compra: c })}>Confirmar</Button>
                        <Button size="sm" variant="ghost" className="text-danger-600" onClick={() => setAccion({ tipo: "cancelar", compra: c })}>Cancelar</Button>
                      </>
                    )}
                    {c.estado === "confirmada" && (
                      <>
                        <Button size="sm" variant="energy" onClick={() => setAccion({ tipo: "pagar", compra: c })}>Pagar</Button>
                        <Button size="sm" variant="ghost" className="text-danger-600" onClick={() => setAccion({ tipo: "cancelar", compra: c })}>Cancelar</Button>
                      </>
                    )}
                    <button
                      onClick={() => setAbierta(expandida ? null : c.idCompra)}
                      aria-expanded={expandida}
                      aria-label="Ver entradas de la compra"
                      className="rounded-lg p-2 text-ink-faint hover:bg-container"
                    >
                      <LuChevronDown className={cn("size-5 transition-transform", expandida && "rotate-180")} />
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {expandida && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-container-low bg-container-low/40"
                    >
                      <ul className="divide-y divide-container-low">
                        {(c.entradas ?? []).map((e) => (
                          <li key={e.idEntrada} className="flex flex-wrap items-center gap-3 px-5 py-3 text-sm">
                            <LuTicket className="size-4 text-navy-700" aria-hidden />
                            <span className="font-bold">#{e.idEntrada}</span>
                            <span className="text-ink-soft">{formatPartido(e.partido)} · Sector {e.nombreSector}</span>
                            <Badge estado={e.estado} className="ml-auto" />
                            <span className="font-semibold">{formatMoney(e.costoTotal)}</span>
                            {c.estado === "paga" && e.estado === "activa" && (
                              <Link to={routePaths.entradaDetalle(e.idEntrada)} className="text-xs font-bold text-navy-900 hover:underline">
                                Ver QR
                              </Link>
                            )}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        open={!!accion}
        onClose={() => setAccion(null)}
        onConfirm={ejecutarAccion}
        loading={procesando}
        variant={accion?.tipo === "cancelar" ? "danger" : accion?.tipo === "pagar" ? "energy" : "primary"}
        title={
          accion?.tipo === "confirmar" ? `Confirmar compra #${accion?.compra.idCompra}`
          : accion?.tipo === "pagar" ? `Pagar ${formatMoney(accion?.compra.montoTotal)}`
          : `Cancelar compra #${accion?.compra?.idCompra}`
        }
        confirmLabel={
          accion?.tipo === "confirmar" ? "Confirmar compra"
          : accion?.tipo === "pagar" ? "Pagar ahora"
          : "Cancelar compra"
        }
        description={
          accion?.tipo === "confirmar"
            ? "Al confirmar, la compra queda lista para el pago."
            : accion?.tipo === "pagar"
              ? "Simularemos el pago y tus entradas quedarán activas con su QR dinámico."
              : "Esta acción libera las entradas reservadas y no se puede deshacer."
        }
      />
    </>
  );
}
