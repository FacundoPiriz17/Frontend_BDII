import { cn } from "../../lib/cn";

/** Superficie blanca elevada */
export default function Card({ className, children, as: Tag = "div", ...props }) {
  return (
    <Tag
      className={cn("rounded-2xl bg-white shadow-(--shadow-card) border border-container-high/60", className)}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({ title, subtitle, actions, className }) {
  return (
    <div className={cn("flex items-start justify-between gap-3 p-5 pb-0", className)}>
      <div>
        <h3 className="text-lg font-bold text-ink display-tight">{title}</h3>
        {subtitle && <p className="mt-0.5 text-sm text-ink-soft">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}

export function CardBody({ className, children }) {
  return <div className={cn("p-5", className)}>{children}</div>;
}
