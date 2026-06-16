import { useState } from "react";
import { cn } from "../../lib/cn";
import { flagUrl } from "../../lib/flags";

/**
 * Bandera de un equipo/país a partir del código FIFA.
 * Si no hay SVG para el código, cae a un disco navy con el código FIFA, de modo que la UI nunca queda "rota".
 */
const sizes = {
  xs: "size-5 text-[8px]",
  sm: "size-6 text-[9px]",
  md: "size-8 text-[10px]",
  lg: "size-12 text-xs",
  xl: "size-16 text-sm",
};

export default function Flag({ codigo, nombre, size = "md", shape = "circle", className }) {
  const [error, setError] = useState(false);
  const url = flagUrl(codigo);
  const code = (codigo || (nombre || "?").slice(0, 3)).toUpperCase();
  const radius = shape === "circle" ? "rounded-full" : "rounded-md";

  if (url && !error) {
    return (
      <img
        src={url}
        alt={nombre ? `Bandera de ${nombre}` : `Bandera ${code}`}
        onError={() => setError(true)}
        className={cn(
          "shrink-0 object-cover ring-1 ring-container-high bg-white",
          radius,
          sizes[size],
          className
        )}
      />
    );
  }

  return (
    <span
      aria-label={nombre ? `Equipo ${nombre}` : code}
      className={cn(
        "flex shrink-0 items-center justify-center bg-navy-900 font-extrabold text-white ring-1 ring-navy-800",
        radius,
        sizes[size],
        className
      )}
    >
      {code}
    </span>
  );
}
