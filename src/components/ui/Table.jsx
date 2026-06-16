import { cn } from "../../lib/cn";
import { LoadingBlock } from "./Spinner";
import EmptyState from "./EmptyState";
import { LuInbox } from "react-icons/lu";

/**
 * Tabla declarativa para vistas densas (admin / historiales).
 */
export default function Table({ columns, rows, rowKey, loading, empty, onRowClick, className }) {
  if (loading) return <LoadingBlock />;
  if (!rows?.length) {
    return empty ?? <EmptyState icon={LuInbox} title="Sin resultados" description="No hay registros para mostrar con los filtros actuales." />;
  }

  return (
    <div className={cn("overflow-x-auto scroll-slim rounded-2xl border border-container-high bg-white shadow-(--shadow-card)", className)}>
      <table className="w-full min-w-max text-sm">
        <thead>
          <tr className="border-b border-container-high bg-container-low/60 text-left">
            {columns.map((c) => (
              <th
                key={c.key}
                className={cn(
                  "px-4 py-3 text-xs font-bold uppercase tracking-wider text-ink-soft",
                  c.align === "right" && "text-right",
                  c.align === "center" && "text-center"
                )}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={rowKey ? rowKey(row) : i}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                "border-b border-container-low last:border-0 transition-colors",
                onRowClick && "cursor-pointer hover:bg-container-low/60"
              )}
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={cn(
                    "px-4 py-3 text-ink",
                    c.align === "right" && "text-right",
                    c.align === "center" && "text-center",
                    c.className
                  )}
                >
                  {c.render ? c.render(row) : row[c.key] ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
