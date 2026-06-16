import { useCallback, useState } from "react";
import { LuShieldCheck, LuSearch } from "react-icons/lu";
import PageHeader from "../../../components/layout/PageHeader";
import Table from "../../../components/ui/Table";
import Badge from "../../../components/ui/Badge";
import Select from "../../../components/ui/Select";
import Input from "../../../components/ui/Input";
import ErrorMessage from "../../../components/feedback/ErrorMessage";
import { validacionService } from "../services/validacionService";
import { useFetch } from "../../../hooks/useFetch";
import { useDebounce } from "../../../hooks/useDebounce";
import { ESTADOS_VALIDACION } from "../../../lib/constants";
import { formatFechaHora, formatPartido } from "../../../lib/formatters";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";

/**
 * Historial de validaciones (auditoría). Compartido por admin y funcionario;
 * el backend acota el alcance según el rol del token.
 */
export default function ValidacionesPage() {
  useDocumentTitle("Historial de validaciones");
  const [estado, setEstado] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const q = useDebounce(busqueda);

  const { data, loading, error, refetch } = useFetch(
    useCallback(() => validacionService.listar({ estado: estado || undefined, limit: 100 }), [estado])
  );

  const filtradas = (data ?? []).filter((v) => {
    if (!q) return true;
    const k = q.toLowerCase();
    return (
      String(v.idEntrada).includes(k) ||
      v.entrada?.nombrePropietarioActual?.toLowerCase().includes(k) ||
      v.funcionario?.nombre?.toLowerCase().includes(k) ||
      formatPartido(v.entrada?.partido).toLowerCase().includes(k)
    );
  });

  const columnas = [
    { key: "idValidacion", header: "ID", render: (v) => <span className="font-bold">#{v.idValidacion}</span> },
    { key: "fechaHora", header: "Fecha y hora", render: (v) => <span className="tabular-nums">{formatFechaHora(v.fechaHora)}</span> },
    { key: "entrada", header: "Entrada", render: (v) => (
      <div>
        <p className="font-semibold">#{v.idEntrada} · {v.entrada?.nombrePropietarioActual ?? "—"}</p>
        <p className="text-xs text-ink-faint">{formatPartido(v.entrada?.partido)} · Sector {v.entrada?.nombreSector}</p>
      </div>
    )},
    { key: "funcionario", header: "Funcionario", render: (v) => (
      <div>
        <p className="font-semibold">{v.funcionario?.nombre ?? "—"}</p>
        <p className="text-xs text-ink-faint">Legajo {v.funcionario?.numeroLegajo ?? "—"} · Disp. #{v.idDispositivo}</p>
      </div>
    )},
    { key: "estado", header: "Resultado", align: "center", render: (v) => <Badge estado={v.estado} /> },
  ];

  return (
    <>
      <PageHeader title="Historial de validaciones" subtitle="Registro auditable de todos los escaneos e invalidaciones." />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <Input icon={LuSearch} label="Buscar" placeholder="Entrada, persona, partido…"
          value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="sm:w-72" />
        <Select label="Resultado" placeholder="Todos" options={ESTADOS_VALIDACION}
          value={estado} onChange={(e) => setEstado(e.target.value)} className="sm:w-44" />
      </div>

      {error ? (
        <ErrorMessage error={error} onRetry={refetch} />
      ) : (
        <Table
          columns={columnas}
          rows={filtradas}
          rowKey={(v) => v.idValidacion}
          loading={loading}
          empty={<div className="py-10 text-center text-ink-soft">No hay validaciones registradas.</div>}
        />
      )}
    </>
  );
}
