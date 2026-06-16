import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { LuLandPlot, LuPlus, LuMapPin, LuPencil } from "react-icons/lu";
import PageHeader from "../../../components/layout/PageHeader";
import Card, { CardBody } from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Select from "../../../components/ui/Select";
import Badge from "../../../components/ui/Badge";
import EmptyState from "../../../components/ui/EmptyState";
import { LoadingBlock } from "../../../components/ui/Spinner";
import ErrorMessage from "../../../components/feedback/ErrorMessage";
import { estadioService } from "../services/estadioService";
import { useFetch } from "../../../hooks/useFetch";
import { PAISES_SEDE } from "../../../lib/constants";
import { formatMoney } from "../../../lib/formatters";
import { routePaths } from "../../../routes/routePaths";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";

export default function EstadiosPage() {
  useDocumentTitle("Estadios");
  const [pais, setPais] = useState("");
  const { data, loading, error, refetch } = useFetch(
    useCallback(() => estadioService.listar(pais || undefined), [pais])
  );

  return (
    <>
      <PageHeader
        title="Estadios"
        subtitle="Sedes del Mundial y la configuración de sus sectores (A–D)."
        actions={
          <Link to={routePaths.adminEstadioNuevo}>
            <Button><LuPlus className="size-4" /> Nuevo estadio</Button>
          </Link>
        }
      />

      <div className="mb-6">
        <Select aria-label="Filtrar por país" placeholder="Todos los países" options={PAISES_SEDE}
          value={pais} onChange={(e) => setPais(e.target.value)} className="w-56" />
      </div>

      {loading ? (
        <LoadingBlock />
      ) : error ? (
        <ErrorMessage error={error} onRetry={refetch} />
      ) : !data?.length ? (
        <EmptyState icon={LuLandPlot} title="No hay estadios" description="Creá el primer estadio para poder programar eventos."
          action={<Link to={routePaths.adminEstadioNuevo}><Button>Nuevo estadio</Button></Link>} />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {data.map((e) => (
            <Card key={e.idEstadio}>
              <CardBody>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-bold text-ink display-tight">{e.nombre}</h3>
                    <p className="flex items-center gap-1 text-sm text-ink-soft">
                      <LuMapPin className="size-3.5 text-ink-faint" /> {e.ciudad}, {e.pais}
                    </p>
                  </div>
                  <Badge variant="navy">{e.capacidad?.toLocaleString("es-UY") ?? "—"}</Badge>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  {(e.sectores ?? []).map((s) => (
                    <div key={s.nombreSector} className="rounded-lg border border-container-high bg-container-low/50 px-3 py-2">
                      <p className="flex items-center justify-between text-sm font-bold text-ink">
                        Sector {s.nombreSector}
                        <span className="text-navy-900">{formatMoney(s.costo)}</span>
                      </p>
                      <p className="text-xs text-ink-faint">{s.capacidad?.toLocaleString("es-UY") ?? "—"} lugares</p>
                    </div>
                  ))}
                  {!e.sectores?.length && <p className="col-span-2 text-sm text-ink-faint">Sin sectores cargados.</p>}
                </div>

                <Link to={routePaths.adminEstadioEditar(e.idEstadio)} className="mt-4 block">
                  <Button variant="outline" className="w-full"><LuPencil className="size-4" /> Editar</Button>
                </Link>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
