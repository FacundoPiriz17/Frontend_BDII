import { useState } from "react";
import { toast } from "react-toastify";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import { usuarioService } from "../services/usuarioService";
import { ROLES, PAISES_SEDE, TIPOS_DOCUMENTO } from "../../../lib/constants";
import { esEmailUcu, esEnteroPositivo, minLargo } from "../../../lib/validators";
import { cn } from "../../../lib/cn";

const TODOS = [ROLES.ADMIN, ROLES.FUNCIONARIO, ROLES.GENERAL];

/** Alta de usuario por un admin */
export default function CrearUsuarioModal({ onClose, onSaved }) {
  const [form, setForm] = useState({
    email: "", nombre: "", password: "",
    paisDocumento: "", tipoDocumento: "CI", numeroDocumento: "",
    roles: [ROLES.GENERAL], paisAdmin: PAISES_SEDE[0], numeroLegajo: "", estadoVerificacion: true,
  });
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  // Un usuario se crea con un único rol.
  const elegirRol = (r) => setForm((f) => ({ ...f, roles: [r] }));

  const validar = () => {
    const e = {};
    if (!esEmailUcu(form.email)) e.email = "Email UCU inválido.";
    if (!minLargo(form.nombre, 3)) e.nombre = "Mínimo 3 caracteres.";
    if (!minLargo(form.password, 8)) e.password = "Mínimo 8 caracteres.";
    if (!form.paisDocumento.trim()) e.paisDocumento = "Requerido.";
    if (!esEnteroPositivo(form.numeroDocumento)) e.numeroDocumento = "Número inválido.";
    else if (form.numeroDocumento.length > 10 || Number(form.numeroDocumento) > 2147483647)
      e.numeroDocumento = "El documento supera el máximo permitido (10 dígitos).";
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const guardar = async () => {
    if (!validar()) return;
    setGuardando(true);
    try {
      await usuarioService.crear({
        email: form.email.trim(),
        nombre: form.nombre.trim(),
        password: form.password,
        habilitado: true,
        paisDocumento: form.paisDocumento.trim(),
        tipoDocumento: form.tipoDocumento,
        numeroDocumento: Number(form.numeroDocumento),
        telefonos: [],
        roles: form.roles,
        paisAdmin: form.roles.includes(ROLES.ADMIN) ? form.paisAdmin : null,
        numeroLegajo: form.roles.includes(ROLES.FUNCIONARIO) && form.numeroLegajo ? Number(form.numeroLegajo) : null,
        estadoVerificacion: form.roles.includes(ROLES.GENERAL) ? form.estadoVerificacion : null,
      });
      toast.success("Usuario creado");
      onSaved();
    } catch (err) {
      toast.error(err.detail || "No se pudo crear el usuario.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal
      open
      onClose={guardando ? undefined : onClose}
      title="Nuevo usuario"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={guardando}>Cancelar</Button>
          <Button onClick={guardar} loading={guardando}>Crear usuario</Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Email institucional" type="email" value={form.email} onChange={set("email")} error={errores.email} placeholder="nombre@ucu.edu.uy" />
        <Input label="Nombre completo" value={form.nombre} onChange={set("nombre")} error={errores.nombre} />
        <Input label="Contraseña" type="password" value={form.password} onChange={set("password")} error={errores.password} />
        <Input label="País del documento" value={form.paisDocumento} onChange={set("paisDocumento")} error={errores.paisDocumento} placeholder="Uruguay" />
        <Select label="Tipo de documento" options={TIPOS_DOCUMENTO} value={form.tipoDocumento} onChange={set("tipoDocumento")} />
        <Input label="Número de documento" type="number" maxLength={10} value={form.numeroDocumento} onChange={set("numeroDocumento")} error={errores.numeroDocumento} hint="Máximo 10 dígitos." />
      </div>

      <p className="mb-2 mt-5 text-sm font-bold text-ink">Rol <span className="font-normal text-ink-faint">(solo uno)</span></p>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Rol del usuario">
        {TODOS.map((r) => {
          const activo = form.roles[0] === r;
          return (
            <button key={r} type="button" role="radio" aria-checked={activo} onClick={() => elegirRol(r)}
              className={cn(
                "rounded-lg border-2 px-4 py-2 text-sm font-bold transition-colors",
                activo ? "border-navy-900 bg-navy-900 text-white" : "border-line text-ink-soft hover:border-navy-700"
              )}>
              {r}
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {form.roles.includes(ROLES.ADMIN) && (
          <Select label="País sede (admin)" options={PAISES_SEDE} value={form.paisAdmin} onChange={set("paisAdmin")} />
        )}
        {form.roles.includes(ROLES.FUNCIONARIO) && (
          <Input label="Número de legajo" type="number" value={form.numeroLegajo} onChange={set("numeroLegajo")} placeholder="1001" />
        )}
      </div>
    </Modal>
  );
}
