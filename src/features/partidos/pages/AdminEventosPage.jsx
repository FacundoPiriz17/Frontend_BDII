import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { LuPlus, LuPencil, LuSearch, LuCirclePlay, LuCircleStop } from "react-icons/lu";
import PageHeader from "../../../components/layout/PageHeader";
import Table from "../../../components/ui/Table";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import ErrorMessage from "../../../components/feedback/ErrorMessage";
import { partidoService } from "../services/partidoService";
import { useFetch } from "../../../hooks/useFetch";
import { useDebounce } from "../../../hooks/useDebounce";
import { ESTADOS_PARTIDO, FASES } from "../../../lib/constants";
import { formatFecha, formatHora, formatMoney } from "../../../lib/formatters";
import { routePaths } from "../../../routes/routePaths";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";

/** Listado administrativo de eventos con cambio rápido de estado. */
export default function AdminEventosPage() {
  useDocumentTitle("Eventos");
  const [estado, setEstado] = useState("");
  const [fase, setFase] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const q = useDebounce(busqueda);

  const { data, loading, error, refetch } = useFetch(
    useCallback(
      () => partidoService.listar({ estado: estado || undefined, fase: fase || undefined, busqueda: q || undefined }),
      [estado, fase, q]
    )
  );

  const [cambiando, setCambiando] = useState(null);

  const cambiarEstado = async (p, nuevo) => {
    setCambiando(p.idPartido);
    try {
      await partidoService.cambiarEstado(p.idPartido, nuevo);
      toast.success(`Evento marcado como "${nuevo}"`);
      refetch();
    } catch (err) {
      toast.error(err.detail || "No se pudo cambiar el estado.");
    } finally {
      setCambiando(null);
    }
  };

  const columnas = [
    { key: "cruce", header: "Partido", render: (p) => (
      <div>
        <p className="font-bold text-ink">{p.equipoLocal} vs {p.equipoVisitante}</p>
        <p className="text-xs text-ink-faint">{p.fase} · {p.estadio?.nombre}, {p.estadio?.ciudad}</p>
      </div>
    )},
    { key: "fecha", header: "Fecha", render: (p) => (
      <span className="text-sm">{formatFecha(p.fecha)} · {formatHora(p.hora)} h</span>
    )},
    { key: "costo", header: "Costo base", align: "right", render: (p) => (
      <span className="font-semibold">{formatMoney(p.costoBase)}</span>
    )},
    { key: "marcador", header: "Marcador", align: "center", render: (p) => (
      p.estado === "no empezado" ? <span className="text-ink-faint">—</span>
        : <span className="font-extrabold tabular-nums">{p.marcadorLocal} - {p.marcadorVisitante}</span>
    )},
    { key: "estado", header: "Estado", align: "center", render: (p) => <Badge estado={p.estado} /> },
    { key: "acciones", header: "", align: "right", render: (p) => (
      <div className="flex justify-end gap-1.5">
        {p.estado === "no empezado" && (
          <Button size="sm" variant="ghost" loading={cambiando === p.idPartido} onClick={() => cambiarEstado(p, "empezado")}>
            <LuCirclePlay className="size-4" /> Iniciar
          </Button>
        )}
        {p.estado === "empezado" && (
          <Button size="sm" variant="ghost" loading={cambiando === p.idPartido} onClick={() => cambiarEstado(p, "terminado")}>
            <LuCircleStop className="size-4" /> Finalizar
          </Button>
        )}
        {p.estado === "terminado" ? (
          <Button size="sm" variant="outline" disabled title="Un partido terminado no se puede editar">
            <LuPencil className="size-4" /> Editar
          </Button>
        ) : (
          <Link to={routePaths.adminEventoEditar(p.idPartido)}>
            <Button size="sm" variant="outline"><LuPencil className="size-4" /> Editar</Button>
          </Link>
        )}
      </div>
    )},
  ];

  return (
    <>
      <PageHeader title="Eventos" subtitle="Partidos del Mundial y su ciclo de vida."
        actions={<Link to={routePaths.adminEventoNuevo}><Button><LuPlus className="size-4" /> Nuevo evento</Button></Link>} />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <Input icon={LuSearch} label="Buscar" placeholder="Equipo o estadio…" className="sm:w-64"
          value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        <Select label="Fase" placeholder="Todas" options={FASES} value={fase} onChange={(e) => setFase(e.target.value)} className="sm:w-52" />
        <Select label="Estado" placeholder="Todos" options={ESTADOS_PARTIDO} value={estado} onChange={(e) => setEstado(e.target.value)} className="sm:w-44" />
      </div>

      {error ? (
        <ErrorMessage error={error} onRetry={refetch} />
      ) : (
        <Table columns={columnas} rows={data ?? []} rowKey={(p) => p.idPartido} loading={loading} />
      )}
    </>
  );
}
