import { cn } from "../../../lib/cn";
import Flag from "../../../components/ui/Flag";

/**
 * Bandera + nombre del equipo. Usa el código FIFA del equipo para resolver la
 * bandera. Si no hay bandera disponible, Flag cae al código FIFA.
 */

export default function TeamBadge({ nombre, equipo, size = "md", reverse = false, className }) {
  const codigo = equipo?.codigoFifa || nombre;
  const etiqueta = equipo?.nombre || nombre;

  return (
    <span className={cn("flex items-center gap-2.5 min-w-0", reverse && "flex-row-reverse text-right", className)}>
      <Flag codigo={codigo} nombre={etiqueta} size={size} />
      <span className={cn("truncate font-bold text-ink", size === "lg" && "text-lg")}>{etiqueta}</span>
    </span>
  );
}
