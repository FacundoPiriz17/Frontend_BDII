import { formatMoney } from "../../../lib/formatters";

/**
 * Ranking de mayores compradores
 */
export default function RankingTable({ data = [] }) {
  if (!data.length) {
    return <p className="py-8 text-center text-sm text-navy-300">Sin compras registradas.</p>;
  }
  return (
    <ol className="space-y-1">
      {data.map((c, i) => (
        <li key={c.emailUsuario} className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/5">
          <span className="w-6 text-center text-sm font-extrabold tabular-nums text-energy-400">
            {String(i + 1).padStart(2, "0")}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold text-white">{c.nombreUsuario || c.emailUsuario}</p>
            <p className="truncate text-xs text-navy-300">
              {c.entradasCompradas} entradas · {c.comprasPagas} compras
            </p>
          </div>
          <span className="shrink-0 text-sm font-bold text-white tabular-nums">{formatMoney(c.montoTotalPagado)}</span>
        </li>
      ))}
    </ol>
  );
}
