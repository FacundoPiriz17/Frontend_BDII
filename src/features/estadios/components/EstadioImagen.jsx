import { useState } from "react";
import { LuLandPlot } from "react-icons/lu";
import { imagenEstadio } from "../../../lib/estadios";
import { cn } from "../../../lib/cn";

/**
 * Imagen del estadio (resuelta por nombre desde estadios.json).
 * Si no hay imagen o falla la carga, muestra un placeholder.
 */
export default function EstadioImagen({ nombre, src, className, alt }) {
  const [error, setError] = useState(false);
  const url = src || imagenEstadio(nombre);

  if (!url || error) {
    return (
      <div className={cn("flex items-center justify-center bg-navy-950 text-navy-300", className)}>
        <LuLandPlot className="size-8" aria-hidden />
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={alt || (nombre ? `Estadio ${nombre}` : "Estadio")}
      loading="lazy"
      onError={() => setError(true)}
      className={cn("object-cover", className)}
    />
  );
}
