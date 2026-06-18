import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import { LuUserPlus, LuSearch, LuPencil, LuShieldCheck } from "react-icons/lu";
import PageHeader from "../../../components/layout/PageHeader";
import Table from "../../../components/ui/Table";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import ErrorMessage from "../../../components/feedback/ErrorMessage";
import { usuarioService } from "../services/usuarioService";
import { useAuth } from "../../auth/hooks/useAuth";
import { useFetch } from "../../../hooks/useFetch";
import { useDebounce } from "../../../hooks/useDebounce";
import { ROLES } from "../../../lib/constants";
import { cn } from "../../../lib/cn";
import RolesUsuarioModal from "../components/RolesUsuarioModal";
import CrearUsuarioModal from "../components/CrearUsuarioModal";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";

export default function UsuariosAdminPage() {
  useDocumentTitle("Usuarios");
  const { user } = useAuth();
  const [rol, setRol] = useState("");
  const [habilitado, setHabilitado] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const q = useDebounce(busqueda);

  const { data, loading, error, refetch } = useFetch(
    useCallback(
      () => usuarioService.listar({
        rol: rol || undefined,
        habilitado: habilitado === "" ? undefined : habilitado,
        busqueda: q || undefined,
      }),
      [rol, habilitado, q]
    )
  );

  const [editando, setEditando] = useState(null);
  const [creando, setCreando] = useState(false);
  const [toggling, setToggling] = useState(null);

  const toggleHabilitacion = async (u) => {
    setToggling(u.email);
    try {
      await usuarioService.cambiarHabilitacion(u.email, !u.habilitado);
      toast.success(u.habilitado ? "Usuario deshabilitado" : "Usuario habilitado");
      refetch();
    } catch (err) {
      toast.error(err.detail || "No se pudo cambiar la habilitación.");
    } finally {
      setToggling(null);
    }
  };

  const columnas = [
    { key: "nombre", header: "Usuario", render: (u) => (
      <div className="min-w-0">
        <p className="font-bold text-ink">{u.nombre}</p>
        <p className="truncate text-xs text-ink-faint">{u.email}</p>
      </div>
    )},
    { key: "roles", header: "Roles", render: (u) => (
      <div className="flex flex-wrap gap-1">
        {(u.roles ?? []).length ? u.roles.map((r) => <Badge key={r} variant="navy">{r}</Badge>) : <span className="text-xs text-ink-faint">—</span>}
      </div>
    )},
    { key: "documento", header: "Documento", render: (u) => (
      <span className="text-sm text-ink-soft">{u.tipoDocumento} {u.numeroDocumento}</span>
    )},
    { key: "habilitado", header: "Estado", align: "center", render: (u) => (
      <Badge variant={u.habilitado ? "ok" : "danger"}>{u.habilitado ? "Habilitado" : "Deshabilitado"}</Badge>
    )},
    { key: "acciones", header: "", align: "right", render: (u) => {
      const esMiCuenta = u.email?.toLowerCase() === user?.email?.toLowerCase();
      if (esMiCuenta) {
        return <span className="text-xs font-semibold text-ink-faint">Tu cuenta</span>;
      }
      return (
        <div className="flex justify-end gap-1.5">
          <Button size="sm" variant="ghost" onClick={() => setEditando(u)} aria-label={`Editar roles de ${u.nombre}`}>
            <LuShieldCheck className="size-4" /> Roles
          </Button>
          <Button size="sm" variant={u.habilitado ? "ghost" : "outline"}
            className={cn(u.habilitado && "text-danger-600")}
            loading={toggling === u.email}
            onClick={() => toggleHabilitacion(u)}>
            {u.habilitado ? "Deshabilitar" : "Habilitar"}
          </Button>
        </div>
      );
    }},
  ];

  return (
    <>
      <PageHeader
        title="Usuarios"
        subtitle="Gestión de cuentas, roles y habilitaciones."
        actions={<Button onClick={() => setCreando(true)}><LuUserPlus className="size-4" /> Nuevo usuario</Button>}
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <Input icon={LuSearch} label="Buscar" placeholder="Nombre o email…" className="sm:w-64"
          value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        <Select label="Rol" placeholder="Todos" className="sm:w-44"
          options={[ROLES.ADMIN, ROLES.FUNCIONARIO, ROLES.GENERAL]}
          value={rol} onChange={(e) => setRol(e.target.value)} />
        <Select label="Estado" placeholder="Todos" className="sm:w-44"
          options={[{ value: "true", label: "Habilitados" }, { value: "false", label: "Deshabilitados" }]}
          value={habilitado} onChange={(e) => setHabilitado(e.target.value)} />
      </div>

      {error ? (
        <ErrorMessage error={error} onRetry={refetch} />
      ) : (
        <Table columns={columnas} rows={data ?? []} rowKey={(u) => u.email} loading={loading} />
      )}

      {editando && (
        <RolesUsuarioModal
          usuario={editando}
          onClose={() => setEditando(null)}
          onSaved={() => { setEditando(null); refetch(); }}
        />
      )}
      {creando && (
        <CrearUsuarioModal
          onClose={() => setCreando(false)}
          onSaved={() => { setCreando(false); refetch(); }}
        />
      )}
    </>
  );
}
