import { cn } from "../../lib/cn";

export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-container-low/50 px-6 py-14 text-center", className)}>
      {Icon && (
        <div className="flex size-12 items-center justify-center rounded-full bg-container text-navy-700">
          <Icon className="size-6" aria-hidden />
        </div>
      )}
      <div>
        <h3 className="font-bold text-ink">{title}</h3>
        {description && <p className="mt-1 max-w-sm text-sm text-ink-soft">{description}</p>}
      </div>
      {action}
    </div>
  );
}
