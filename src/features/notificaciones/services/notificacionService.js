import { formatFechaHora } from "../../../lib/formatters";

/*
  No existe un módulo de notificaciones en el backend
   Las construimos a partir de las transferencias del usuario:
    - oferta recibida pendiente  -> debe aceptar/rechazar
    - transferencia que envió fue aceptada / rechazada
  Cada notificación lleva una ruta para "continuar el trámite".
*/

const partidoLabel = (p) =>
  p ? `${p.equipoLocal ?? "?"} vs ${p.equipoVisitante ?? "?"}` : "una entrada";

/**
 * @param {Array} transferencias  lista de TransferenciaResponse del usuario
 * @param {string} email          email del usuario actual
 * @param {string} rutaTransferencias  ruta destino para el trámite
 */
export function derivarNotificaciones(transferencias, email, rutaTransferencias) {
  if (!Array.isArray(transferencias) || !email) return [];
  const yo = email.toLowerCase();

  const notifs = [];
  for (const t of transferencias) {
    const origen = t.emailOrigen?.toLowerCase();
    const destino = t.emailDestino?.toLowerCase();
    const partido = t.entrada?.partido;
    const fecha = t.fechaHora;

    if (destino === yo && t.estado === "pendiente") {
      notifs.push({
        id: `${t.idTransferencia}:pendiente`,
        tipo: "oferta",
        titulo: "Nueva oferta de transferencia",
        descripcion: `${t.emailOrigen} te ofrece una entrada para ${partidoLabel(partido)}.`,
        fecha,
        to: rutaTransferencias,
      });
    } else if (origen === yo && t.estado === "aceptada") {
      notifs.push({
        id: `${t.idTransferencia}:aceptada`,
        tipo: "aceptada",
        titulo: "Transferencia aceptada",
        descripcion: `${t.emailDestino} aceptó la entrada para ${partidoLabel(partido)}.`,
        fecha,
        to: rutaTransferencias,
      });
    } else if (origen === yo && t.estado === "rechazada") {
      notifs.push({
        id: `${t.idTransferencia}:rechazada`,
        tipo: "rechazada",
        titulo: "Transferencia rechazada",
        descripcion: `${t.emailDestino} rechazó la entrada para ${partidoLabel(partido)}.`,
        fecha,
        to: rutaTransferencias,
      });
    }
  }

  return notifs
    .map((n) => ({ ...n, fechaTexto: formatFechaHora(n.fecha) }))
    .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
}
