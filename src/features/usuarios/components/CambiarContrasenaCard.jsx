import { useState } from "react";
import { toast } from "react-toastify";
import { LuLockKeyhole } from "react-icons/lu";
import Card, { CardBody, CardHeader } from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import { authService } from "../../auth/services/authService";

/** Cambio de contraseña del usuario autenticado. */
export default function CambiarContrasenaCard() {
  const [form, setForm] = useState({ actual: "", nueva: "", confirmar: "" });
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const guardar = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.actual) errs.actual = "Ingresá tu contraseña actual.";
    if (form.nueva.length < 6) errs.nueva = "Mínimo 6 caracteres.";
    if (form.nueva !== form.confirmar) errs.confirmar = "Las contraseñas no coinciden.";
    if (form.actual && form.nueva && form.actual === form.nueva)
      errs.nueva = "Debe ser distinta a la actual.";
    setErrores(errs);
    if (Object.keys(errs).length) return;

    setGuardando(true);
    try {
      await authService.cambiarContrasena(form.actual, form.nueva);
      toast.success("Contraseña actualizada");
      setForm({ actual: "", nueva: "", confirmar: "" });
    } catch (err) {
      toast.error(err.detail || "No se pudo cambiar la contraseña.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Card>
      <CardHeader title="Cambiar contraseña" icon={LuLockKeyhole} />
      <CardBody>
        <form onSubmit={guardar} className="space-y-4" noValidate>
          <Input label="Contraseña actual" type="password" autoComplete="current-password"
            value={form.actual} onChange={set("actual")} error={errores.actual} />
          <Input label="Nueva contraseña" type="password" autoComplete="new-password"
            value={form.nueva} onChange={set("nueva")} error={errores.nueva} />
          <Input label="Repetir nueva contraseña" type="password" autoComplete="new-password"
            value={form.confirmar} onChange={set("confirmar")} error={errores.confirmar} />
          <Button type="submit" loading={guardando}>Actualizar contraseña</Button>
        </form>
      </CardBody>
    </Card>
  );
}
