import { forwardRef, useId } from "react";
import { cn } from "../../lib/cn";

/**
 * Input con label, hint y error integrados
 */
const Input = forwardRef(function Input(
  { label, hint, error, icon: Icon, className, inputClassName, id, ...props },
  ref
) {
  const autoId = useId();
  const inputId = id || autoId;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-ink flex items-center gap-1.5">
          {Icon && <Icon className="size-4 text-ink-faint" aria-hidden />}
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={!!error}
        className={cn(
          "h-10 w-full rounded-lg border bg-white px-3 text-sm text-ink placeholder:text-ink-faint",
          "transition-colors focus:outline-none focus:ring-2",
          error
            ? "border-danger-500 focus:ring-danger-500/30 focus:border-danger-500"
            : "border-line focus:border-navy-700 focus:ring-navy-700/20",
          inputClassName
        )}
        {...props}
      />
      {error ? (
        <p className="text-xs font-medium text-danger-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-faint">{hint}</p>
      ) : null}
    </div>
  );
});

export default Input;
