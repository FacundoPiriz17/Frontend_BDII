import { useState } from "react";
import { cn } from "../../lib/cn";
import { flagUrl } from "../../lib/flags";

/**
 * Bandera de un equipo/país a partir del código FIFA.
 * Si no hay SVG para el código, cae a un rectángulo con el código FIFA,
 * de modo que la UI nunca queda "rota".
 */
const sizes = {
    xs: "h-5 w-7 text-[8px]",
    sm: "h-6 w-9 text-[9px]",
    md: "h-8 w-11 text-[10px]",
    lg: "h-12 w-16 text-xs",
    xl: "h-16 w-24 text-sm",
};

const FLAG_SHAPE =
    "[border-radius:10%_46%_8%_42%/10%_34%_8%_46%]";

export default function Flag({ codigo, nombre, size = "md", className }) {
    const [error, setError] = useState(false);
    const url = flagUrl(codigo);
    const code = (codigo || (nombre || "?").slice(0, 3)).toUpperCase();

    if (url && !error) {
        return (
            <span
                className={cn(
                    "inline-flex shrink-0 overflow-hidden bg-white p-[2px] shadow-sm",
                    FLAG_SHAPE,
                    sizes[size],
                    className
                )}
            >
        <img
            src={url}
            alt={nombre ? `Bandera de ${nombre}` : `Bandera ${code}`}
            onError={() => setError(true)}
            className={cn(
                "h-full w-full object-cover",
                FLAG_SHAPE
            )}
        />
      </span>
        );
    }

    return (
        <span
            aria-label={nombre ? `Equipo ${nombre}` : code}
            className={cn(
                "inline-flex shrink-0 items-center justify-center overflow-hidden bg-white p-[2px] shadow-sm",
                FLAG_SHAPE,
                sizes[size],
                className
            )}
        >
      <span
          className={cn(
              "flex h-full w-full items-center justify-center bg-navy-900 font-extrabold text-white",
              FLAG_SHAPE
          )}
      >
        {code}
      </span>
    </span>
    );
}