import { cn } from "../../lib/cn";

const sizes = { sm: "size-4 border-2", md: "size-6 border-2", lg: "size-10 border-4" };

export default function Spinner({ size = "md", className, label }) {
  return (
    <span role="status" className={cn("inline-flex items-center gap-2", label && "text-sm text-ink-soft")}>
      <span
        className={cn(
          "animate-spin rounded-full border-current border-t-transparent text-navy-700",
          sizes[size],
          className
        )}
        aria-hidden
      />
      {label && <span>{label}</span>}
      <span className="sr-only">Cargando…</span>
    </span>
  );
}

/** Estado de carga centrado para páginas/paneles completos. */
export function LoadingBlock({ label = "Cargando…" }) {
  return (
    <div className="flex min-h-48 items-center justify-center">
      <Spinner size="lg" label={label} />
    </div>
  );
}
