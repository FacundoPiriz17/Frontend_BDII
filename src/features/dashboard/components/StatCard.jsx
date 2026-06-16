import { cn } from "../../../lib/cn";

export default function StatCard({ icon: Icon, label, value, hint, tone = "navy" }) {
  const tones = {
    navy: "bg-navy-100 text-navy-900",
    ok: "bg-ok-100 text-ok-600",
    warn: "bg-warn-100 text-warn-600",
    danger: "bg-danger-100 text-danger-700",
    energy: "bg-energy-500/15 text-energy-700",
  };
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-container-high/60 bg-white p-5 shadow-(--shadow-card)">
      {Icon && (
        <span className={cn("flex size-12 shrink-0 items-center justify-center rounded-xl", tones[tone])}>
          <Icon className="size-6" aria-hidden />
        </span>
      )}
      <div className="min-w-0">
        <p className="text-2xl font-extrabold text-ink display-tight">{value}</p>
        <p className="text-sm font-semibold text-ink-soft">{label}</p>
        {hint && <p className="text-xs text-ink-faint">{hint}</p>}
      </div>
    </div>
  );
}
