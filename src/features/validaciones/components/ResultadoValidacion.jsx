import { motion } from "framer-motion";
import { LuCircleCheck, LuCircleX, LuTicket, LuMapPin, LuIdCard } from "react-icons/lu";
import { formatPartido } from "../../../lib/formatters";

/**
 * Card de resultado que "inunda" la pantalla con el color del estado
 * verde VALIDADO / rojo INVÁLIDO.
 * Pensado para legibilidad
 */

export default function ResultadoValidacion({ validacion, verificacion }) {
  // `validacion` viene de escanear/invalidar; `verificacion` de manual/verificar
  const entrada = validacion?.entrada ?? verificacion?.entrada;
  const valida = validacion
    ? (validacion.estado || "").toLowerCase() === "válida"
    : verificacion?.documentoCoincide;

  const titulo = validacion
    ? (valida ? "VALIDADO" : "INVÁLIDO")
    : (valida ? "DOCUMENTO OK" : "NO COINCIDE");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`overflow-hidden rounded-3xl text-white shadow-lg ${valida ? "bg-ok-600" : "bg-danger-600"}`}
      role="status"
      aria-live="assertive"
    >
      <div className="flex flex-col items-center gap-2 px-6 py-8 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-white/15">
          {valida ? <LuCircleCheck className="size-10" /> : <LuCircleX className="size-10" />}
        </span>
        <p className="text-4xl font-extrabold tracking-tight display-tight">{titulo}</p>
        {entrada?.nombrePropietarioActual && (
          <p className="text-lg font-bold uppercase">{entrada.nombrePropietarioActual}</p>
        )}
        {entrada && (
          <div className="mt-1 space-y-1 text-sm font-semibold text-white/90">
            <p className="flex items-center justify-center gap-1.5">
              <LuTicket className="size-4" /> Entrada #{entrada.idEntrada} · Sector {entrada.nombreSector}
            </p>
            {entrada.partido && (
              <p className="flex items-center justify-center gap-1.5">
                <LuMapPin className="size-4" /> {formatPartido(entrada.partido)}
              </p>
            )}
            {entrada.numeroDocumento != null && (
              <p className="flex items-center justify-center gap-1.5 text-white/80">
                <LuIdCard className="size-4" /> {entrada.tipoDocumento} {entrada.numeroDocumento}
              </p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
