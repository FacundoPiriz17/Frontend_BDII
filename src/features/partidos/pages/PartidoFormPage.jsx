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
import { partidoService } from "../services/partidoService";
import { estadioService } from "../../estadios/services/estadioService";
import { useFetch } from "../../../hooks/useFetch";
import { FASES, SECTORES, ESTADOS_PARTIDO } from "../../../lib/constants";
import { toInputDate } from "../../../lib/formatters";
import { routePaths } from "../../../routes/routePaths";
import { cn } from "../../../lib/cn";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";

/**
 * Alta / edición de evento (admin). Reglas del modelo reflejadas en el form:
 * - fecha_habilitacion <= fecha - 1 día 
 * - local != visitante
 */
export default function PartidoFormPage() {
  const { idPartido } = useParams();
  const esEdicion = !!idPartido;
  useDocumentTitle(esEdicion ? "Editar evento" : "Nuevo evento");
  const navigate = useNavigate();

  const { data: equipos } = useFetch(useCallback(() => partidoService.equipos(), []));
  const { data: estadios } = useFetch(useCallback(() => estadioService.listar(), []));
  const { data: original, loading: cargandoEvento, error: errorEvento, refetch } = useFetch(
    useCallback(() => (esEdicion ? partidoService.obtener(idPartido) : Promise.resolve(null)), [idPartido, esEdicion])
  );

  const [form, setForm] = useState({
    equipoLocal: "", equipoVisitante: "", idEstadio: "", fecha: "", hora: "",
    costo: "", fase: FASES[0], fechaHabilitacion: "", sectoresHabilitados: [],
    estado: "no empezado", marcadorLocal: 0, marcadorVisitante: 0,
  });
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!original) return;
    setForm({
      equipoLocal: original.equipoLocal ?? "",
      equipoVisitante: original.equipoVisitante ?? "",
      idEstadio: String(original.estadio?.idEstadio ?? ""),
      fecha: toInputDate(original.fecha),
      hora: String(original.hora ?? "").slice(0, 5),
      costo: String(original.costoBase ?? 0),
      fase: original.fase ?? FASES[0],
      fechaHabilitacion: toInputDate(original.fechaHabilitacion),
      sectoresHabilitados: (original.sectores ?? []).map((s) => s.nombreSector),
      estado: original.estado ?? "no empezado",
      marcadorLocal: original.marcadorLocal ?? 0,
      marcadorVisitante: original.marcadorVisitante ?? 0,
    });
  }, [original]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const estadioElegido = (estadios ?? []).find((e) => String(e.idEstadio) === String(form.idEstadio));
  const sectoresDelEstadio = estadioElegido?.sectores?.map((s) => s.nombreSector) ?? SECTORES;

  const toggleSector = (nombre) =>
    setForm((f) => ({
      ...f,
      sectoresHabilitados: f.sectoresHabilitados.includes(nombre)
        ? f.sectoresHabilitados.filter((s) => s !== nombre)
        : [...f.sectoresHabilitados, nombre],
    }));

  const validar = () => {
    const e = {};
    if (!form.equipoLocal) e.equipoLocal = "Elegí el equipo local.";
    if (!form.equipoVisitante) e.equipoVisitante = "Elegí el visitante.";
    if (form.equipoLocal && form.equipoLocal === form.equipoVisitante)
      e.equipoVisitante = "Local y visitante no pueden ser el mismo equipo.";
    if (!form.idEstadio) e.idEstadio = "Elegí un estadio.";
    if (!form.fecha) e.fecha = "Indicá la fecha.";
    if (!form.hora) e.hora = "Indicá la hora.";
    if (form.costo === "" || Number(form.costo) < 0) e.costo = "Costo base inválido.";
    if (!form.fechaHabilitacion) e.fechaHabilitacion = "Indicá la fecha de habilitación.";
    if (form.fechaHabilitacion && form.fecha) {
      const hab = new Date(form.fechaHabilitacion);
      const fec = new Date(form.fecha);
      if ((fec - hab) / 86400000 < 1)
        e.fechaHabilitacion = "Debe ser al menos un día antes del partido.";
    }
    if (form.sectoresHabilitados.length === 0)
      e.sectores = "Habilitá al menos un sector a la venta.";
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (!validar()) return;
    setGuardando(true);
    const base = {
      fecha: form.fecha,
      hora: form.hora.length === 5 ? `${form.hora}:00` : form.hora,
      idEstadio: Number(form.idEstadio),
      equipoLocal: form.equipoLocal,
      equipoVisitante: form.equipoVisitante,
      costo: Number(form.costo),
      fase: form.fase,
      fechaHabilitacion: form.fechaHabilitacion,
      sectoresHabilitados: form.sectoresHabilitados,
    };
    try {
      if (esEdicion) {
        await partidoService.actualizar(idPartido, {
          ...base,
          estado: form.estado,
          marcadorLocal: Number(form.marcadorLocal),
          marcadorVisitante: Number(form.marcadorVisitante),
        });
        toast.success("Evento actualizado");
      } else {
        await partidoService.crear(base);
        toast.success("Evento creado");
      }
      navigate(routePaths.adminEventos);
    } catch (err) {
      toast.error(err.detail || "No se pudo guardar el evento.");
    } finally {
      setGuardando(false);
    }
  };

  if (esEdicion && cargandoEvento) return <LoadingBlock label="Cargando evento…" />;
  if (esEdicion && errorEvento) return <ErrorMessage error={errorEvento} onRetry={refetch} />;

  const opcionesEquipos = (equipos ?? []).map((e) => ({ value: e.codigoFifa, label: `${e.nombre} (${e.codigoFifa})` }));

  return (
    <>
      <Link to={routePaths.adminEventos} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900 hover:underline">
        <LuArrowLeft className="size-4" /> Volver a eventos
      </Link>
      <PageHeader
        title={esEdicion ? "Editar evento" : "Nuevo evento"}
        subtitle={esEdicion ? `Evento #${idPartido}` : "Como admin, solo podés crear eventos en estadios de tu país sede."}
      />

      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[7fr_5fr]" noValidate>
        <div className="space-y-6">
          <Card>
            <CardHeader title="Cruce" />
            <CardBody className="grid gap-4 sm:grid-cols-2">
              <Select label="Equipo local" placeholder="Elegir equipo…" options={opcionesEquipos}
                value={form.equipoLocal} onChange={set("equipoLocal")} error={errores.equipoLocal} />
              <Select label="Equipo visitante" placeholder="Elegir equipo…" options={opcionesEquipos}
                value={form.equipoVisitante} onChange={set("equipoVisitante")} error={errores.equipoVisitante} />
              <Select label="Fase" options={FASES} value={form.fase} onChange={set("fase")} />
              <Input label="Costo base del evento (USD)" type="number" min="0"
                value={form.costo} onChange={set("costo")} error={errores.costo}
                hint="Se suma al costo del sector para formar el precio final." />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Sede y calendario" />
            <CardBody className="grid gap-4 sm:grid-cols-2">
              <Select className="sm:col-span-2" label="Estadio" placeholder="Elegir estadio…"
                options={(estadios ?? []).map((e) => ({ value: e.idEstadio, label: `${e.nombre} · ${e.ciudad}, ${e.pais}` }))}
                value={form.idEstadio} onChange={set("idEstadio")} error={errores.idEstadio} />
              <Input label="Fecha del partido" type="date" value={form.fecha} onChange={set("fecha")} error={errores.fecha} />
              <Input label="Hora" type="time" value={form.hora} onChange={set("hora")} error={errores.hora} />
              <Input className="sm:col-span-2" label="Fecha de habilitación de venta" type="date"
                value={form.fechaHabilitacion} onChange={set("fechaHabilitacion")} error={errores.fechaHabilitacion}
                hint="La venta abre en esta fecha y debe cerrar al menos 1 día antes del partido." />
            </CardBody>
          </Card>

          {esEdicion && (
            <Card>
              <CardHeader title="Estado del partido" subtitle="Resultado y ciclo de vida del evento." />
              <CardBody className="grid gap-4 sm:grid-cols-3">
                <Select label="Estado" options={ESTADOS_PARTIDO} value={form.estado} onChange={set("estado")} />
                <Input label={`Goles ${form.equipoLocal || "local"}`} type="number" min="0"
                  value={form.marcadorLocal} onChange={set("marcadorLocal")} />
                <Input label={`Goles ${form.equipoVisitante || "visitante"}`} type="number" min="0"
                  value={form.marcadorVisitante} onChange={set("marcadorVisitante")} />
              </CardBody>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="lg:sticky lg:top-24">
            <CardHeader title="Sectores a la venta" subtitle={estadioElegido ? `Sectores de ${estadioElegido.nombre}` : "Elegí primero un estadio."} />
            <CardBody>
              <div className="grid grid-cols-2 gap-3">
                {sectoresDelEstadio.map((s) => {
                  const activo = form.sectoresHabilitados.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSector(s)}
                      aria-pressed={activo}
                      className={cn(
                        "flex items-center justify-between rounded-xl border-2 px-4 py-3 font-extrabold transition-colors",
                        activo
                          ? "border-navy-900 bg-navy-900 text-white"
                          : "border-line bg-white text-ink-soft hover:border-navy-700"
                      )}
                    >
                      Sector {s}
                      <span className={cn("text-xs font-bold uppercase", activo ? "text-energy-400" : "text-ink-faint")}>
                        {activo ? "En venta" : "Cerrado"}
                      </span>
                    </button>
                  );
                })}
              </div>
              {errores.sectores && <p className="mt-2 text-xs font-medium text-danger-600">{errores.sectores}</p>}
              <Button type="submit" size="lg" loading={guardando} className="mt-6 w-full">
                {esEdicion ? "Guardar cambios" : "Crear evento"}
              </Button>
            </CardBody>
          </Card>
        </div>
      </form>
    </>
  );
}
