import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { LuTicket, LuSearch } from "react-icons/lu";
import PageHeader from "../../../components/layout/PageHeader";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Button from "../../../components/ui/Button";
import EmptyState from "../../../components/ui/EmptyState";
import { LoadingBlock } from "../../../components/ui/Spinner";
import ErrorMessage from "../../../components/feedback/ErrorMessage";
import EntradaCard from "../components/EntradaCard";
import { entradaService } from "../services/entradaService";
import { useFetch } from "../../../hooks/useFetch";
import { useDebounce } from "../../../hooks/useDebounce";
import { ESTADOS_ENTRADA } from "../../../lib/constants";
import { routePaths } from "../../../routes/routePaths";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";

/** Entradas del usuario (de las que es propietario actual). */
export default function MisEntradasPage() {
  useDocumentTitle("Mis entradas");
  const [estado, setEstado] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const q = useDebounce(busqueda);

  const { data, loading, error, refetch } = useFetch(
    useCallback(
      () => entradaService.misEntradas({ estado: estado || undefined, busqueda: q || undefined }),
      [estado, q]
    )
  );

  const entradas = [...(data ?? [])].sort((a, b) =>
    `${a.partido?.fecha ?? ""}${a.partido?.hora ?? ""}`.localeCompare(`${b.partido?.fecha ?? ""}${b.partido?.hora ?? ""}`)
  );

  return (
    <>
      <PageHeader
        title="Mis entradas"
        subtitle="Tu billetera digital. Cada entrada activa tiene un QR dinámico que se renueva cada 30 segundos."
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-[2fr_1fr]">
        <Input icon={LuSearch} label="Buscar" placeholder="Equipo o estadio…"
          value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        <Select label="Estado" placeholder="Todas" options={[
          { value: "activa", label: "Activas" },
          { value: "consumida", label: "Consumidas" },
        ]}
          value={estado} onChange={(e) => setEstado(e.target.value)} />
      </div>

      {loading ? (
        <LoadingBlock label="Abriendo tu billetera…" />
      ) : error ? (
        <ErrorMessage error={error} onRetry={refetch} />
      ) : entradas.length === 0 ? (
        <EmptyState
          icon={LuTicket}
          title="Tu billetera está vacía"
          description="Cuando una compra quede paga, tus entradas van a aparecer acá, listas para escanear o transferir."
          action={<Link to={routePaths.partidos}><Button variant="energy">Comprar entradas</Button></Link>}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {entradas.map((e) => <EntradaCard key={e.idEntrada} entrada={e} />)}
        </div>
      )}
    </>
  );
}
