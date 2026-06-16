import { forwardRef } from "react";
import { cn } from "../../lib/cn";
import Spinner from "./Spinner";

const variants = {
  primary:
    "bg-navy-900 text-white hover:bg-navy-800 active:bg-navy-950 shadow-sm disabled:bg-navy-900/50",
  energy:
    "bg-energy-500 text-navy-950 hover:bg-energy-400 active:bg-energy-500 font-bold shadow-sm disabled:opacity-50",
  secondary:
    "bg-container text-navy-900 hover:bg-container-high active:bg-surface-dim disabled:opacity-50",
  outline:
    "border border-line bg-white text-ink hover:border-navy-700 hover:text-navy-900 disabled:opacity-50",
  ghost: "text-ink-soft hover:bg-container hover:text-ink disabled:opacity-50",
  danger:
    "bg-danger-600 text-white hover:bg-danger-500 active:bg-danger-700 disabled:opacity-50",
};

const sizes = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

const Button = forwardRef(function Button(
  { variant = "primary", size = "md", loading = false, className, children, disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-semibold transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-700",
        "disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && <Spinner size="sm" className={variant === "energy" ? "text-navy-950" : ""} />}
      {children}
    </button>
  );
});

export default Button;
