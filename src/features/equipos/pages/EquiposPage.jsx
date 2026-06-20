import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuSearch, LuChevronRight, LuUsers } from "react-icons/lu";
import PageHeader from "../../../components/layout/PageHeader";
import { LoadingBlock } from "../../../components/ui/Spinner";
import ErrorMessage from "../../../components/feedback/ErrorMessage";
import EmptyState from "../../../components/ui/EmptyState";
import Select from "../../../components/ui/Select";
import Flag from "../../../components/ui/Flag";
import AnimatedList from "../components/AnimatedList";
import { equipoService } from "../services/equipoService";
import { useFetch } from "../../../hooks/useFetch";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";
import { routePaths } from "../../../routes/routePaths";
import { cn } from "../../../lib/cn";

/** Listado de selecciones del Mundial, agrupadas por grupo, con lista animada. */
export default function EquiposPage() {
  useDocumentTitle("Equipos");
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useFetch(useCallback(() => equipoService.listar(), []));
  const [query, setQuery] = useState("");
  const [grupo, setGrupo] = useState("todos");

  const grupos = useMemo(() => {
    const set = new Set((data ?? []).map((e) => e.grupo).filter(Boolean));
    return ["todos", ...Array.from(set).sort()];
  }, [data]);

  const equipos = useMemo(() => {
    let list = data ?? [];
    if (grupo !== "todos") list = list.filter((e) => e.grupo === grupo);
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((e) => e.nombre?.toLowerCase().includes(q) || e.codigoFifa?.toLowerCase().includes(q));
    return [...list].sort((a, b) =>
      a.grupo === b.grupo ? a.nombre.localeCompare(b.nombre) : a.grupo.localeCompare(b.grupo)
    );
  }, [data, grupo, query]);

  if (loading) return <LoadingBlock label="Cargando equipos…" />;
  if (error) return <ErrorMessage error={error} onRetry={refetch} />;

  const irADetalle = (equipo) => navigate(routePaths.equipoDetalle(equipo.codigoFifa));

  return (
    <>
      <PageHeader
        title="Equipos"
        subtitle={`${data?.length ?? 0} selecciones clasificadas al Mundial 2026. Tocá una para ver su grupo y calendario.`}
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <LuSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" aria-hidden />
          <input
            type="search"
            placeholder="Buscar país o código FIFA…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar equipo"
            className="h-11 w-full rounded-xl border border-line bg-white pl-9 pr-3 text-sm text-ink placeholder:text-ink-faint transition-colors focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-700/20"
          />
        </div>
        <Select
          aria-label="Filtrar por grupo"
          placeholder="Todos los grupos"
          className="sm:w-52"
          value={grupo === "todos" ? "" : grupo}
          onChange={(e) => setGrupo(e.target.value || "todos")}
          options={grupos
            .filter((g) => g !== "todos")
            .map((g) => ({ value: g, label: `Grupo ${g}` }))}
        />
      </div>

      {equipos.length === 0 ? (
        <EmptyState
          icon={LuUsers}
          title="Sin equipos"
          description="No encontramos selecciones con ese filtro."
        />
      ) : (
        <AnimatedList
          items={equipos}
          onItemSelect={irADetalle}
          showGradients={false}
          className="mx-auto max-w-2xl"
          renderItem={(equipo, { selected }) => (
            <div
              className={cn(
                "group flex items-center gap-4 rounded-2xl border bg-white p-3.5 transition-all",
                selected
                  ? "border-navy-700 shadow-(--shadow-trust) ring-1 ring-navy-700/20"
                  : "border-container-high shadow-(--shadow-card) hover:border-navy-300"
              )}
            >
              <Flag codigo={equipo.codigoFifa} nombre={equipo.nombre} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-extrabold text-ink">{equipo.nombre}</p>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                  {equipo.codigoFifa} · Grupo {equipo.grupo}
                </p>
              </div>
              <span className="flex size-8 items-center justify-center rounded-full bg-container text-ink-soft transition-colors group-hover:bg-navy-900 group-hover:text-white">
                <LuChevronRight className="size-4" aria-hidden />
              </span>
            </div>
          )}
        />
      )}
    </>
  );
}
