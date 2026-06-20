import { forwardRef, useId, useState } from "react";
import { LuEye, LuEyeOff } from "react-icons/lu";
import { cn } from "../../lib/cn";

/**
 * Input con label, hint y error integrados.
 * Si `type="password"`, agrega un botón "ojito" para previsualizar el valor.
 */
const Input = forwardRef(function Input(
  { label, hint, error, icon: Icon, className, inputClassName, id, type = "text", ...props },
  ref
) {
  const autoId = useId();
  const inputId = id || autoId;
  const esPassword = type === "password";
  const [verPassword, setVerPassword] = useState(false);
  const tipoEfectivo = esPassword && verPassword ? "text" : type;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-ink flex items-center gap-1.5">
          {Icon && <Icon className="size-4 text-ink-faint" aria-hidden />}
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          type={tipoEfectivo}
          aria-invalid={!!error}
          className={cn(
            "h-10 w-full rounded-lg border bg-white px-3 text-sm text-ink placeholder:text-ink-faint",
            "transition-colors focus:outline-none focus:ring-2",
            esPassword && "pr-10",
            error
              ? "border-danger-500 focus:ring-danger-500/30 focus:border-danger-500"
              : "border-line focus:border-navy-700 focus:ring-navy-700/20",
            inputClassName
          )}
          {...props}
        />
        {esPassword && (
          <button
            type="button"
            onClick={() => setVerPassword((v) => !v)}
            aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            aria-pressed={verPassword}
            tabIndex={-1}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-ink-faint transition-colors hover:bg-container hover:text-ink"
          >
            {verPassword ? <LuEyeOff className="size-4" /> : <LuEye className="size-4" />}
          </button>
        )}
      </div>
      {error ? (
        <p className="text-xs font-medium text-danger-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-faint">{hint}</p>
      ) : null}
    </div>
  );
});

export default Input;
