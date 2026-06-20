import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { LuUserRound, LuPlus, LuX, LuShieldCheck } from "react-icons/lu";
import PageHeader from "../../../components/layout/PageHeader";
import Card, { CardBody, CardHeader } from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import { LoadingBlock } from "../../../components/ui/Spinner";
import ErrorMessage from "../../../components/feedback/ErrorMessage";
import { authService } from "../../auth/services/authService";
import SesionCard from "../../auth/components/SesionCard";
import CambiarContrasenaCard from "../components/CambiarContrasenaCard";
import TelefonosField from "../components/TelefonosField";
import { usuarioService } from "../services/usuarioService";
import { useFetch } from "../../../hooks/useFetch";
import { useAuth } from "../../auth/hooks/useAuth";
import { minLargo } from "../../../lib/validators";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";

/** Perfil del usuario logueado: ve sus datos y edita lo permitido. */
export default function PerfilPage() {
  useDocumentTitle("Mi perfil");
  const { refreshUser } = useAuth();
  const { data: perfil, loading, error, refetch } = useFetch(useCallback(() => authService.me(), []));

  const [form, setForm] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState({});

  useEffect(() => {
    if (!perfil) return;
    setForm({
      nombre: perfil.nombre ?? "",
      localidadDireccion: perfil.localidadDireccion ?? "",
      calleDireccion: perfil.calleDireccion ?? "",
      paisDireccion: perfil.paisDireccion ?? "",
      numeroDireccion: perfil.numeroDireccion ?? "",
      codigoPostalDireccion: perfil.codigoPostalDireccion ?? "",
      telefonos: perfil.telefonos ?? [],
    });
  }, [perfil]);

  if (loading) return <LoadingBlock label="Cargando tu perfil…" />;
  if (error) return <ErrorMessage error={error} onRetry={refetch} />;
  if (!form) return null;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setTelefonos = (telefonos) => setForm((f) => ({ ...f, telefonos }));

  const guardar = async (e) => {
    e.preventDefault();
    if (!minLargo(form.nombre, 3)) {
      setErrores({ nombre: "Mínimo 3 caracteres." });
      return;
    }
    setErrores({});
    setGuardando(true);
    try {
      await usuarioService.actualizarMiPerfil({
        nombre: form.nombre.trim(),
        localidadDireccion: form.localidadDireccion.trim() || null,
        calleDireccion: form.calleDireccion.trim() || null,
        paisDireccion: form.paisDireccion.trim() || null,
        numeroDireccion: form.numeroDireccion ? Number(form.numeroDireccion) : null,
        codigoPostalDireccion: form.codigoPostalDireccion ? Number(form.codigoPostalDireccion) : null,
        telefonos: form.telefonos,
      });
      toast.success("Perfil actualizado");
      await refreshUser();
      refetch();
    } catch (err) {
      toast.error(err.detail || "No se pudo guardar el perfil.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <PageHeader title="Mi perfil" subtitle="Tus datos personales y de contacto." />

      <div className="grid items-start gap-6 lg:grid-cols-[5fr_7fr]">

        <div className="space-y-6">
        <Card>
          <CardBody className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-navy-950 text-xl font-extrabold text-energy-500">
                {(perfil.nombre || "?").slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate text-lg font-bold text-ink">{perfil.nombre}</p>
                <p className="truncate text-sm text-ink-faint">{perfil.email}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {perfil.roles?.map((r) => <Badge key={r} variant="navy">{r}</Badge>)}
            </div>
            <dl className="space-y-2 border-t border-container-low pt-4 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-ink-faint">Documento</dt>
                <dd className="font-semibold text-ink">{perfil.tipoDocumento} {perfil.numeroDocumento}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-ink-faint">País emisor</dt>
                <dd className="font-semibold text-ink">{perfil.paisDocumento}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-ink-faint">Teléfonos</dt>
                <dd className="text-right font-semibold text-ink">
                  {perfil.telefonos?.length
                    ? perfil.telefonos.join(" · ")
                    : <span className="font-normal text-ink-faint">Sin teléfonos</span>}
                </dd>
              </div>
            </dl>
            <p className="flex items-center gap-1.5 rounded-xl bg-container-low p-3 text-xs text-ink-soft">
              <LuShieldCheck className="size-4 text-navy-700" /> El documento no se puede modificar desde el perfil.
            </p>
          </CardBody>
        </Card>
        <SesionCard />
        </div>

        <div className="space-y-6">
        <Card>
          <CardHeader title="Editar datos" icon={LuUserRound} />
          <CardBody>
            <form onSubmit={guardar} className="space-y-5" noValidate>
              <Input label="Nombre completo" value={form.nombre} onChange={set("nombre")} error={errores.nombre} />

              <fieldset className="rounded-xl border border-container-high p-4">
                <legend className="px-1 text-sm font-bold text-ink">Dirección</legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="País" value={form.paisDireccion} onChange={set("paisDireccion")} />
                  <Input label="Localidad" value={form.localidadDireccion} onChange={set("localidadDireccion")} />
                  <Input label="Calle" value={form.calleDireccion} onChange={set("calleDireccion")} />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Número" type="number" value={form.numeroDireccion} onChange={set("numeroDireccion")} />
                    <Input label="C. Postal" type="number" value={form.codigoPostalDireccion} onChange={set("codigoPostalDireccion")} />
                  </div>
                </div>
              </fieldset>

              <fieldset className="rounded-xl border border-container-high p-4">
                <legend className="px-1 text-sm font-bold text-ink">Teléfonos</legend>
                <TelefonosField telefonos={form.telefonos} onChange={setTelefonos} label={null} />
              </fieldset>

              <Button type="submit" loading={guardando}>Guardar cambios</Button>
            </form>
          </CardBody>
        </Card>

        <CambiarContrasenaCard />
        </div>
      </div>
    </>
  );
}
