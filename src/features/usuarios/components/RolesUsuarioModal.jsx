import { useState } from "react";
import { toast } from "react-toastify";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import { usuarioService } from "../services/usuarioService";
import { ROLES, PAISES_SEDE, normalizarRol } from "../../../lib/constants";
import { cn } from "../../../lib/cn";

const TODOS = [ROLES.ADMIN, ROLES.FUNCIONARIO, ROLES.GENERAL];

/**
 * Editor de roles. Según los roles elegidos pide los datos extra del
 * subtipo: país (admin), legajo (funcionario), verificación (general).
 */
export default function RolesUsuarioModal({ usuario, onClose, onSaved }) {
  const [roles, setRoles] = useState((usuario.roles ?? []).map(normalizarRol));
  const [paisAdmin, setPaisAdmin] = useState(usuario.paisAdmin ?? PAISES_SEDE[0]);
  const [numeroLegajo, setNumeroLegajo] = useState(usuario.numeroLegajo ?? "");
  const [estadoVerificacion, setEstadoVerificacion] = useState(usuario.estadoVerificacionGeneral ?? false);
  const [guardando, setGuardando] = useState(false);

  const toggle = (r) =>
    setRoles((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));

  const guardar = async () => {
    setGuardando(true);
    try {
      await usuarioService.actualizarRoles(usuario.email, {
        roles,
        paisAdmin: roles.includes(ROLES.ADMIN) ? paisAdmin : null,
        numeroLegajo: roles.includes(ROLES.FUNCIONARIO) && numeroLegajo ? Number(numeroLegajo) : null,
        estadoVerificacion: roles.includes(ROLES.GENERAL) ? estadoVerificacion : null,
      });
      toast.success("Roles actualizados");
      onSaved();
    } catch (err) {
      toast.error(err.detail || "No se pudieron actualizar los roles.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal
      open
      onClose={guardando ? undefined : onClose}
      title={`Roles de ${usuario.nombre}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={guardando}>Cancelar</Button>
          <Button onClick={guardar} loading={guardando}>Guardar roles</Button>
        </>
      }
    >
      <p className="mb-3 text-sm text-ink-soft">{usuario.email}</p>

      <div className="space-y-2">
        {TODOS.map((r) => {
          const activo = roles.includes(r);
          return (
            <button key={r} type="button" onClick={() => toggle(r)} aria-pressed={activo}
              className={cn(
                "flex w-full items-center justify-between rounded-xl border-2 px-4 py-3 text-left font-bold transition-colors",
                activo ? "border-navy-900 bg-navy-900 text-white" : "border-line bg-white text-ink-soft hover:border-navy-700"
              )}>
              {r}
              <span className={cn("text-xs font-bold uppercase", activo ? "text-energy-400" : "text-ink-faint")}>
                {activo ? "Asignado" : "Sin asignar"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Datos por subtipo */}
      <div className="mt-5 space-y-4">
        {roles.includes(ROLES.ADMIN) && (
          <Select label="País sede del administrador" options={PAISES_SEDE} value={paisAdmin} onChange={(e) => setPaisAdmin(e.target.value)} />
        )}
        {roles.includes(ROLES.FUNCIONARIO) && (
          <Input label="Número de legajo" type="number" min="1" value={numeroLegajo} onChange={(e) => setNumeroLegajo(e.target.value)} placeholder="1001" />
        )}
        {roles.includes(ROLES.GENERAL) && (
          <label className="flex items-center gap-2.5 rounded-xl bg-container-low p-3">
            <input type="checkbox" checked={estadoVerificacion} onChange={(e) => setEstadoVerificacion(e.target.checked)}
              className="size-4 rounded border-line text-navy-900 focus:ring-navy-700" />
            <span className="text-sm font-semibold text-ink">Cuenta general verificada</span>
          </label>
        )}
      </div>
    </Modal>
  );
}
