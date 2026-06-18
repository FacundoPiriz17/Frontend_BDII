import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";
import { LuPlus, LuX, LuArrowLeft, LuArrowRight } from "react-icons/lu";
import AuthShell from "../components/AuthShell";
import TelefonosField from "../../usuarios/components/TelefonosField";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Button from "../../../components/ui/Button";
import { useAuth } from "../hooks/useAuth";
import { routePaths } from "../../../routes/routePaths";
import { TIPOS_DOCUMENTO } from "../../../lib/constants";
import { esEmailUcu, esEnteroPositivo, esRequerido, minLargo } from "../../../lib/validators";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";

const PASOS = [
  { n: 1, label: "Cuenta y documento" },
  { n: 2, label: "Dirección y contacto" },
];

/**
 * Registro en 2 pasos
 */
export default function RegisterPage() {
  useDocumentTitle("Crear cuenta");
  const { register } = useAuth();
  const navigate = useNavigate();

  const [paso, setPaso] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errores, setErrores] = useState({});
  const [form, setForm] = useState({
    email: "",
    nombre: "",
    password: "",
    password2: "",
    paisDocumento: "",
    tipoDocumento: "CI",
    numeroDocumento: "",
    paisDireccion: "",
    localidadDireccion: "",
    calleDireccion: "",
    numeroDireccion: "",
    codigoPostalDireccion: "",
    telefonos: [],
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validarPaso1 = () => {
    const e = {};
    if (!esEmailUcu(form.email))
      e.email = "Usá tu email institucional (@ucu.edu.uy o @correo.ucu.edu.uy).";
    if (!minLargo(form.nombre, 3)) e.nombre = "El nombre debe tener al menos 3 caracteres.";
    if (!minLargo(form.password, 8)) e.password = "Mínimo 8 caracteres.";
    if (form.password !== form.password2) e.password2 = "Las contraseñas no coinciden.";
    if (!esRequerido(form.paisDocumento)) e.paisDocumento = "Indicá el país emisor.";
    if (!esEnteroPositivo(form.numeroDocumento)) e.numeroDocumento = "Número de documento inválido.";
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const validarPaso2 = () => {
    const e = {};
    if (!esRequerido(form.paisDireccion)) e.paisDireccion = "Indicá el país.";
    if (!esRequerido(form.localidadDireccion)) e.localidadDireccion = "Indicá la localidad.";
    if (!esRequerido(form.calleDireccion)) e.calleDireccion = "Indicá la calle.";
    if (!esEnteroPositivo(form.numeroDireccion)) e.numeroDireccion = "Número de puerta inválido.";
    if (!esEnteroPositivo(form.codigoPostalDireccion)) e.codigoPostalDireccion = "Código postal inválido.";
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const setTelefonos = (telefonos) => setForm((f) => ({ ...f, telefonos }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (paso === 1) {
      if (validarPaso1()) setPaso(2);
      return;
    }
    if (!validarPaso2()) return;
    setLoading(true);
    try {
      await register({
        email: form.email.trim(),
        nombre: form.nombre.trim(),
        password: form.password,
        paisDocumento: form.paisDocumento.trim(),
        tipoDocumento: form.tipoDocumento,
        numeroDocumento: Number(form.numeroDocumento),
        paisDireccion: form.paisDireccion.trim(),
        localidadDireccion: form.localidadDireccion.trim(),
        calleDireccion: form.calleDireccion.trim(),
        numeroDireccion: Number(form.numeroDireccion),
        codigoPostalDireccion: Number(form.codigoPostalDireccion),
        telefonos: form.telefonos,
      });
      toast.success("Cuenta creada. Ya podés iniciar sesión.");
      navigate(routePaths.login);
    } catch (err) {
      toast.error(err.detail || "No se pudo crear la cuenta.");
      if (err.status === 409 || err.status === 400) setPaso(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      variant="register"
      title="Creá tu cuenta"
      subtitle="Tu cuenta es el repositorio de tus entradas digitales."
    >
      {/* Indicador de pasos */}
      <ol className="mb-6 flex items-center gap-2" aria-label="Progreso de registro">
        {PASOS.map((p) => (
          <li key={p.n} className="flex flex-1 flex-col gap-1.5">
            <span
              className={`h-1.5 rounded-full transition-colors ${paso >= p.n ? "bg-navy-900" : "bg-container-high"}`}
              aria-hidden
            />
            <span className={`text-xs font-semibold ${paso >= p.n ? "text-navy-900" : "text-ink-faint"}`}>
              {p.n}. {p.label}
            </span>
          </li>
        ))}
      </ol>

      <form onSubmit={onSubmit} noValidate>
        <AnimatePresence mode="wait">
          {paso === 1 ? (
            <motion.div
              key="p1"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <Input label="Email institucional" type="email" placeholder="nombre@correo.ucu.edu.uy"
                value={form.email} onChange={set("email")} error={errores.email} required />
              <Input label="Nombre completo" placeholder="Nombre y apellido"
                value={form.nombre} onChange={set("nombre")} error={errores.nombre} required />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Contraseña" type="password" autoComplete="new-password"
                  value={form.password} onChange={set("password")} error={errores.password} required />
                <Input label="Repetir contraseña" type="password" autoComplete="new-password"
                  value={form.password2} onChange={set("password2")} error={errores.password2} required />
              </div>
              <fieldset className="rounded-xl border border-container-high p-4">
                <legend className="px-1 text-sm font-bold text-ink">Documento de identidad</legend>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Input label="País emisor" placeholder="Uruguay"
                    value={form.paisDocumento} onChange={set("paisDocumento")} error={errores.paisDocumento} required />
                  <Select label="Tipo" options={TIPOS_DOCUMENTO}
                    value={form.tipoDocumento} onChange={set("tipoDocumento")} />
                  <Input label="Número" type="number" inputMode="numeric" placeholder="12345678"
                    value={form.numeroDocumento} onChange={set("numeroDocumento")} error={errores.numeroDocumento} required />
                </div>
              </fieldset>
              <Button type="submit" size="lg" className="w-full">
                Continuar <LuArrowRight className="size-4" aria-hidden />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="p2"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <fieldset className="rounded-xl border border-container-high p-4">
                <legend className="px-1 text-sm font-bold text-ink">Dirección</legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="País" value={form.paisDireccion} onChange={set("paisDireccion")} placeholder="Uruguay" error={errores.paisDireccion} required />
                  <Input label="Localidad" value={form.localidadDireccion} onChange={set("localidadDireccion")} placeholder="Montevideo" error={errores.localidadDireccion} required />
                  <Input label="Calle" value={form.calleDireccion} onChange={set("calleDireccion")} placeholder="Av. 8 de Octubre" error={errores.calleDireccion} required />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Número" type="number" value={form.numeroDireccion} onChange={set("numeroDireccion")} placeholder="2738" error={errores.numeroDireccion} required />
                    <Input label="C. Postal" type="number" value={form.codigoPostalDireccion} onChange={set("codigoPostalDireccion")} placeholder="11600" error={errores.codigoPostalDireccion} required />
                  </div>
                </div>
              </fieldset>

              <fieldset className="rounded-xl border border-container-high p-4">
                <legend className="px-1 text-sm font-bold text-ink">Teléfonos de contacto</legend>
                <TelefonosField telefonos={form.telefonos} onChange={setTelefonos} label={null} />
              </fieldset>

              <div className="flex gap-3">
                <Button type="button" variant="outline" size="lg" onClick={() => setPaso(1)}>
                  <LuArrowLeft className="size-4" aria-hidden /> Atrás
                </Button>
                <Button type="submit" size="lg" loading={loading} className="flex-1">
                  Crear cuenta
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        ¿Ya tenés cuenta?{" "}
        <Link to={routePaths.login} className="font-bold text-navy-900 hover:underline">
          Iniciá sesión
        </Link>
      </p>
    </AuthShell>
  );
}
