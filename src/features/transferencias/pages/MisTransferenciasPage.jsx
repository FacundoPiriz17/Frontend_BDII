import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { LuArrowLeftRight, LuInbox, LuSend, LuSearch } from "react-icons/lu";
import PageHeader from "../../../components/layout/PageHeader";
import Tabs from "../../../components/ui/Tabs";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import EmptyState from "../../../components/ui/EmptyState";
import { LoadingBlock } from "../../../components/ui/Spinner";
import ErrorMessage from "../../../components/feedback/ErrorMessage";
import TransferenciaCard from "../components/TransferenciaCard";
import { transferenciaService } from "../services/transferenciaService";
import { useFetch } from "../../../hooks/useFetch";
import { useDebounce } from "../../../hooks/useDebounce";
import { useAuth } from "../../auth/hooks/useAuth";
import { routePaths } from "../../../routes/routePaths";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";

/**
 * Bandeja de transferencias con pestañas Recibidas / Enviadas.
 * El parámetro `relacion` lo resuelve el backend; igual filtramos del
 * lado cliente por email.
 */
export default function MisTransferenciasPage() {
  useDocumentTitle("Transferencias");
  const { user } = useAuth();
  const [tab, setTab] = useState("recibidas");
  const [busqueda, setBusqueda] = useState("");
  const q = useDebounce(busqueda);
  const [procesandoId, setProcesandoId] = useState(null);

  const { data, loading, error, refetch } = useFetch(
    useCallback(
      () => transferenciaService.listar({ relacion: tab, busqueda: q || undefined }),
      [tab, q]
    )
  );

  const email = user?.email?.toLowerCase();
  const { recibidas, enviadas } = useMemo(() => {
    const list = data ?? [];
    return {
      recibidas: list.filter((t) => t.emailDestino?.toLowerCase() === email),
      enviadas: list.filter((t) => t.emailOrigen?.toLowerCase() === email),
    };
  }, [data, email]);

  const visibles = tab === "recibidas"
    ? (recibidas.length || enviadas.length ? recibidas : data ?? [])
    : (enviadas.length || recibidas.length ? enviadas : data ?? []);

  const pendientesRecibidas = recibidas.filter((t) => t.estado === "pendiente").length;

  const ejecutar = async (accion, t) => {
    setProcesandoId(t.idTransferencia);
    try {
      await transferenciaService[accion](t.idTransferencia);
      toast.success({
        aceptar: "Transferencia aceptada. La entrada ya es tuya.",
        rechazar: "Transferencia rechazada.",
        cancelar: "Envío cancelado.",
      }[accion]);
      refetch();
    } catch (err) {
      toast.error(err.detail || "No se pudo completar la acción.");
    } finally {
      setProcesandoId(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Transferencias"
        subtitle="Pasá una entrada a otra persona de la comunidad UCU. Cada entrada admite hasta 3 transferencias."
        actions={
          <Link to={routePaths.transferenciaNueva}>
            <Button><LuArrowLeftRight className="size-4" /> Nueva transferencia</Button>
          </Link>
        }
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: "recibidas", label: "Recibidas", icon: LuInbox, count: pendientesRecibidas || undefined },
            { value: "enviadas", label: "Enviadas", icon: LuSend },
          ]}
        />
        <Input icon={LuSearch} placeholder="Buscar por email…" value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)} className="sm:w-64" />
      </div>

      {loading ? (
        <LoadingBlock />
      ) : error ? (
        <ErrorMessage error={error} onRetry={refetch} />
      ) : visibles.length === 0 ? (
        <EmptyState
          icon={tab === "recibidas" ? LuInbox : LuSend}
          title={tab === "recibidas" ? "No recibiste transferencias" : "No enviaste transferencias"}
          description={
            tab === "recibidas"
              ? "Cuando alguien te transfiera una entrada, va a aparecer acá para que la aceptes."
              : "Transferí una de tus entradas activas a otra persona de la comunidad."
          }
          action={tab === "enviadas" && (
            <Link to={routePaths.transferenciaNueva}><Button variant="outline">Nueva transferencia</Button></Link>
          )}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {visibles.map((t) => (
            <TransferenciaCard
              key={t.idTransferencia}
              transferencia={t}
              relacion={tab}
              onAccion={ejecutar}
              procesandoId={procesandoId}
            />
          ))}
        </div>
      )}
    </>
  );
}
