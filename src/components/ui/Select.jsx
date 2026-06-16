import { forwardRef, useId } from "react";
import { cn } from "../../lib/cn";

/**
 * Select nativo estilizado.
 */
const Select = forwardRef(function Select(
  { label, hint, error, options = [], placeholder, className, id, ...props },
  ref
) {
  const autoId = useId();
  const selectId = id || autoId;
  const opts = options.map((o) =>
    typeof o === "object" ? o : { value: o, label: o }
  );

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={selectId} className="text-sm font-semibold text-ink">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        aria-invalid={!!error}
        className={cn(
          "h-10 w-full rounded-lg border bg-white px-3 text-sm text-ink",
          "transition-colors focus:outline-none focus:ring-2",
          error
            ? "border-danger-500 focus:ring-danger-500/30"
            : "border-line focus:border-navy-700 focus:ring-navy-700/20"
        )}
        {...props}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {opts.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error ? (
        <p className="text-xs font-medium text-danger-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-faint">{hint}</p>
      ) : null}
    </div>
  );
});

export default Select;
