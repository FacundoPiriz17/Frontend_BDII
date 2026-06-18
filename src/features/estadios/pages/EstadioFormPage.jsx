import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { LuArrowLeft } from "react-icons/lu";
import PageHeader from "../../../components/layout/PageHeader";
import Card, { CardBody, CardHeader } from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Button from "../../../components/ui/Button";
import { LoadingBlock } from "../../../components/ui/Spinner";
import ErrorMessage from "../../../components/feedback/ErrorMessage";
import EstadioImagen from "../components/EstadioImagen";
import { estadioService } from "../services/estadioService";
import { useFetch } from "../../../hooks/useFetch";
import { PAISES_SEDE, SECTORES } from "../../../lib/constants";
import { routePaths } from "../../../routes/routePaths";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";

/**
 * Alta / edición de estadio con sus 4 sectores (A–D).
 */

export default function EstadioFormPage() {
  const { idEstadio } = useParams();
  const esEdicion = !!idEstadio;
  useDocumentTitle(esEdicion ? "Editar estadio" : "Nuevo estadio");
  const navigate = useNavigate();

  const { data: original, loading, error, refetch } = useFetch(
    useCallback(() => (esEdicion ? estadioService.obtener(idEstadio) : Promise.resolve(null)), [idEstadio, esEdicion])
  );

  const [form, setForm] = useState({
    nombre: "", capacidad: "", ubicacion: "", ciudad: "", pais: PAISES_SEDE[0],
    sectores: SECTORES.map((s) => ({ nombreSector: s, capacidad: "", costo: "", incluido: false })),
  });
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!original) return;
    setForm({
      nombre: original.nombre ?? "",
      capacidad: String(original.capacidad ?? ""),
      ubicacion: original.ubicacion ?? "",
      ciudad: original.ciudad ?? "",
      pais: original.pais ?? PAISES_SEDE[0],
      sectores: SECTORES.map((s) => {
        const existente = (original.sectores ?? []).find((x) => x.nombreSector === s);
        return {
          nombreSector: s,
          capacidad: existente ? String(existente.capacidad ?? "") : "",
          costo: existente ? String(existente.costo ?? "") : "",
          incluido: !!existente,
        };
      }),
    });
  }, [original]);

  // Resumen de cupos: suma de capacidades de sectores incluidos vs capacidad total.
  const capacidadTotal = Number(form.capacidad) || 0;
  const sumaSectores = form.sectores
    .filter((s) => s.incluido)
    .reduce((acc, s) => acc + (Number(s.capacidad) || 0), 0);
  const diferencia = capacidadTotal - sumaSectores; // >0 faltan, <0 se pasa

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setSector = (idx, campo, valor) =>
    setForm((f) => ({
      ...f,
      sectores: f.sectores.map((s, i) => (i === idx ? { ...s, [campo]: valor } : s)),
    }));

  const validar = () => {
    const e = {};
    if (form.nombre.trim().length < 3) e.nombre = "Mínimo 3 caracteres.";
    if (!form.ciudad.trim()) e.ciudad = "Indicá la ciudad.";
    const incluidos = form.sectores.filter((s) => s.incluido);
    if (incluidos.length === 0) e.sectores = "Incluí al menos un sector.";
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (!validar()) return;
    setGuardando(true);
    const incluidos = form.sectores.filter((s) => s.incluido);
    try {
      if (esEdicion) {
        await estadioService.actualizar(idEstadio, {
          nombre: form.nombre.trim(),
          capacidad: form.capacidad ? Number(form.capacidad) : null,
          ubicacion: form.ubicacion.trim() || null,
          ciudad: form.ciudad.trim(),
          pais: form.pais,
        });
        await Promise.all(
          incluidos.map((s) =>
            estadioService.actualizarSector(idEstadio, s.nombreSector, {
              capacidad: s.capacidad ? Number(s.capacidad) : null,
              costo: s.costo ? Number(s.costo) : null,
            })
          )
        );
        toast.success("Estadio actualizado");
      } else {
        await estadioService.crear({
          nombre: form.nombre.trim(),
          capacidad: form.capacidad ? Number(form.capacidad) : null,
          ubicacion: form.ubicacion.trim() || null,
          ciudad: form.ciudad.trim(),
          pais: form.pais,
          sectores: incluidos.map((s) => ({
            nombreSector: s.nombreSector,
            capacidad: s.capacidad ? Number(s.capacidad) : null,
            costo: s.costo ? Number(s.costo) : null,
          })),
        });
        toast.success("Estadio creado");
      }
      navigate(routePaths.adminEstadios);
    } catch (err) {
      toast.error(err.detail || "No se pudo guardar el estadio.");
    } finally {
      setGuardando(false);
    }
  };

  if (esEdicion && loading) return <LoadingBlock label="Cargando estadio…" />;
  if (esEdicion && error) return <ErrorMessage error={error} onRetry={refetch} />;

  return (
    <>
      <Link to={routePaths.adminEstadios} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900 hover:underline">
        <LuArrowLeft className="size-4" /> Volver a estadios
      </Link>
      <PageHeader title={esEdicion ? "Editar estadio" : "Nuevo estadio"} />

      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-2" noValidate>
        <Card>
          <CardHeader title="Datos del estadio" />
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <div className="overflow-hidden rounded-xl border border-container-high sm:col-span-2">
              <EstadioImagen nombre={form.nombre} className="h-40 w-full" />
            </div>
            <Input className="sm:col-span-2" label="Nombre" value={form.nombre} onChange={set("nombre")} error={errores.nombre} placeholder="MetLife Stadium" />
            <Input label="Ciudad" value={form.ciudad} onChange={set("ciudad")} error={errores.ciudad} placeholder="East Rutherford" />
            <Select label="País sede" options={PAISES_SEDE} value={form.pais} onChange={set("pais")} />
            <Input label="Ubicación / dirección" value={form.ubicacion} onChange={set("ubicacion")} placeholder="1 MetLife Stadium Dr" />
            <Input label="Capacidad total" type="number" min="1" value={form.capacidad} onChange={set("capacidad")} placeholder="82500" />
          </CardBody>
        </Card>

        <Card>
            <CardHeader title="Sectores" subtitle={esEdicion ? "En edición se modifican capacidad y costo de los sectores existentes." : "Definí capacidad y costo base de cada sector habilitado."} />          <CardBody>
            <div className="space-y-3">
              {form.sectores.map((s, i) => (
                <div key={s.nombreSector} className={`rounded-xl border p-3 transition-colors ${s.incluido ? "border-navy-700 bg-container-low/60" : "border-container-high"}`}>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={s.incluido}
                           disabled={esEdicion}
                           title={esEdicion ? "Para evitar inconsistencias, en edición solo se modifican capacidad y costo de sectores existentes." : undefined}
                           onChange={(e) => setSector(i, "incluido", e.target.checked)}
                           className="size-4 rounded border-line text-navy-900 focus:ring-navy-700 disabled:cursor-not-allowed disabled:opacity-60" />                    <span className="font-bold text-ink">Sector {s.nombreSector}</span>
                  </label>
                  {s.incluido && (
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <Input label="Capacidad" type="number" min="1" value={s.capacidad} onChange={(e) => setSector(i, "capacidad", e.target.value)} placeholder="20000" />
                      <Input label="Costo (USD)" type="number" min="0" value={s.costo} onChange={(e) => setSector(i, "costo", e.target.value)} placeholder="120" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            {errores.sectores && <p className="mt-2 text-xs font-medium text-danger-600">{errores.sectores}</p>}

            {capacidadTotal > 0 && (
              <div className={cn(
                "mt-4 rounded-xl border px-3 py-2.5 text-sm",
                diferencia < 0
                  ? "border-danger-500/40 bg-danger-100/50 text-danger-700"
                  : diferencia === 0
                    ? "border-ok-500/40 bg-ok-100/60 text-ok-600"
                    : "border-container-high bg-container-low text-ink-soft"
              )}>
                <div className="flex items-center justify-between font-semibold">
                  <span>Sectores: {sumaSectores.toLocaleString("es-UY")}</span>
                  <span>Capacidad: {capacidadTotal.toLocaleString("es-UY")}</span>
                </div>
                <p className="mt-1 text-xs font-bold">
                  {diferencia < 0
                    ? `Te pasás por ${Math.abs(diferencia).toLocaleString("es-UY")} lugares.`
                    : diferencia === 0
                      ? "Los sectores cubren exactamente la capacidad."
                      : `Faltan ${diferencia.toLocaleString("es-UY")} lugares para cubrir la capacidad.`}
                </p>
              </div>
            )}

            <Button type="submit" size="lg" loading={guardando} className="mt-5 w-full">
              {esEdicion ? "Guardar cambios" : "Crear estadio"}
            </Button>
          </CardBody>
        </Card>
      </form>
    </>
  );
}
