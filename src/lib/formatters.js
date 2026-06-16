import { format, parseISO, isValid } from "date-fns";
import { es } from "date-fns/locale";

/** Monto entero en USD EJ: "US$ 185" */
export const formatMoney = (value) => {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
};

const toDate = (value) => {
  if (!value) return null;
  const d = typeof value === "string" ? parseISO(value) : value;
  return isValid(d) ? d : null;
};

/** "2026-06-14" -> "dom 14 jun 2026" */
export const formatFecha = (value) => {
  const d = toDate(value);
  return d ? format(d, "EEE d MMM yyyy", { locale: es }) : "—";
};

/** "2026-06-14" -> "domingo 14 de junio" (titulares) */
export const formatFechaLarga = (value) => {
  const d = toDate(value);
  return d ? format(d, "EEEE d 'de' MMMM", { locale: es }) : "—";
};

/** "18:00:00" -> "18:00" */
export const formatHora = (value) => {
  if (!value) return "—";
  return String(value).slice(0, 5);
};

/** Timestamp ISO -> "14/06/2026 18:00" */
export const formatFechaHora = (value) => {
  const d = toDate(value);
  return d ? format(d, "dd/MM/yyyy HH:mm", { locale: es }) : "—";
};

/** Timestamp ISO -> "18:02:45" (validaciones, QR) */
export const formatHoraExacta = (value) => {
  const d = toDate(value);
  return d ? format(d, "HH:mm:ss") : "—";
};

/** "Uruguay vs USA" */
export const formatPartido = (p) =>
  p ? `${p.equipoLocal ?? "?"} vs ${p.equipoVisitante ?? "?"}` : "—";

/** Para inputs type=date */
export const toInputDate = (value) => {
  const d = toDate(value);
  return d ? format(d, "yyyy-MM-dd") : "";
};
