import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import { LuSmartphone, LuPlus } from "react-icons/lu";
import PageHeader from "../../../components/layout/PageHeader";
import Table from "../../../components/ui/Table";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import Input from "../../../components/ui/Input";
import ErrorMessage from "../../../components/feedback/ErrorMessage";
import { dispositivoService } from "../services/dispositivoService";
import { useFetch } from "../../../hooks/useFetch";
import { esEmailUcu } from "../../../lib/validators";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";

/** Gestión de dispositivos de escaneo */
export default function DispositivosPage() {
  useDocumentTitle("Dispositivos");
  const { data, loading, error, refetch } = useFetch(useCallback(() => dispositivoService.listar(), []));

  const [creando, setCreando] = useState(false);
  const [form, setForm] = useState({ modelo: "", emailFuncionario: "", activo: true });
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [toggling, setToggling] = useState(null);

  const crear = async () => {
    const e = {};
    if (!form.modelo.trim()) e.modelo = "Indicá el modelo.";
    if (!esEmailUcu(form.emailFuncionario)) e.emailFuncionario = "Email UCU del funcionario.";
    setErrores(e);
    if (Object.keys(e).length) return;
    setGuardando(true);
    try {
      await dispositivoService.crear({
        modelo: form.modelo.trim(),
        emailFuncionario: form.emailFuncionario.trim(),
        activo: form.activo,
      });
      toast.success("Dispositivo creado");
      setCreando(false);
      setForm({ modelo: "", emailFuncionario: "", activo: true });
      refetch();
    } catch (err) {
      toast.error(err.detail || "No se pudo crear el dispositivo.");
    } finally {
      setGuardando(false);
    }
  };

  const toggleActivo = async (d) => {
    setToggling(d.idDispositivoEscaneo);
    try {
      await dispositivoService.actualizar(d.idDispositivoEscaneo, {
        modelo: d.modelo,
        emailFuncionario: d.emailFuncionario,
        activo: !d.activo,
      });
      toast.success(d.activo ? "Dispositivo desactivado" : "Dispositivo activado");
      refetch();
    } catch (err) {
      toast.error(err.detail || "No se pudo actualizar.");
    } finally {
      setToggling(null);
    }
  };

  const columnas = [
    { key: "id", header: "ID", render: (d) => <span className="font-bold">#{d.idDispositivoEscaneo}</span> },
    { key: "modelo", header: "Modelo", render: (d) => (
      <span className="flex items-center gap-2 font-semibold text-ink"><LuSmartphone className="size-4 text-navy-700" /> {d.modelo || "—"}</span>
    )},
    { key: "funcionario", header: "Funcionario", render: (d) => (
      <div>
        <p className="font-semibold text-ink">{d.nombreFuncionario ?? "—"}</p>
        <p className="text-xs text-ink-faint">{d.emailFuncionario} · Legajo {d.numeroLegajo}</p>
      </div>
    )},
    { key: "activo", header: "Estado", align: "center", render: (d) => (
      <Badge variant={d.activo ? "ok" : "neutral"}>{d.activo ? "Activo" : "Inactivo"}</Badge>
    )},
    { key: "acciones", header: "", align: "right", render: (d) => (
      <Button size="sm" variant="outline" loading={toggling === d.idDispositivoEscaneo} onClick={() => toggleActivo(d)}>
        {d.activo ? "Desactivar" : "Activar"}
      </Button>
    )},
  ];

  return (
    <>
      <PageHeader title="Dispositivos de escaneo" subtitle="Hardware asignado a funcionarios para validar entradas."
        actions={<Button onClick={() => setCreando(true)}><LuPlus className="size-4" /> Nuevo dispositivo</Button>} />

      {error ? (
        <ErrorMessage error={error} onRetry={refetch} />
      ) : (
        <Table columns={columnas} rows={data ?? []} rowKey={(d) => d.idDispositivoEscaneo} loading={loading} />
      )}

      <Modal
        open={creando}
        onClose={guardando ? undefined : () => setCreando(false)}
        title="Nuevo dispositivo"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreando(false)} disabled={guardando}>Cancelar</Button>
            <Button onClick={crear} loading={guardando}>Crear dispositivo</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Modelo" placeholder="Honeywell CT45" value={form.modelo}
            onChange={(e) => setForm((f) => ({ ...f, modelo: e.target.value }))} error={errores.modelo} />
          <Input label="Email del funcionario" type="email" placeholder="funcionario@ucu.edu.uy" value={form.emailFuncionario}
            onChange={(e) => setForm((f) => ({ ...f, emailFuncionario: e.target.value }))} error={errores.emailFuncionario} />
          <label className="flex items-center gap-2.5 rounded-xl bg-container-low p-3">
            <input type="checkbox" checked={form.activo}
              onChange={(e) => setForm((f) => ({ ...f, activo: e.target.checked }))}
              className="size-4 rounded border-line text-navy-900 focus:ring-navy-700" />
            <span className="text-sm font-semibold text-ink">Activar el dispositivo al crearlo</span>
          </label>
        </div>
      </Modal>
    </>
  );
}
