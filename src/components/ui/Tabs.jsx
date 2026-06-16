import { cn } from "../../lib/cn";

/** Tabs segmentadas. */
export default function Tabs({ tabs, value, onChange, className }) {
  return (
    <div className={cn("inline-flex rounded-xl bg-container p-1", className)} role="tablist">
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.value)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-semibold transition-all",
              active ? "bg-white text-navy-900 shadow-sm" : "text-ink-soft hover:text-ink"
            )}
          >
            {t.icon && <t.icon className="size-4" aria-hidden />}
            {t.label}
            {t.count !== undefined && (
              <span className={cn(
                "rounded-full px-1.5 text-xs font-bold",
                active ? "bg-navy-100 text-navy-900" : "bg-container-high text-ink-soft"
              )}>
                {t.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
