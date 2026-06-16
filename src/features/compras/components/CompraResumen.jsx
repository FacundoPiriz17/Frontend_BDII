import { formatMoney } from "../../../lib/formatters";
import { COMISION_ESTIMADA, MAX_ENTRADAS_POR_COMPRA } from "../../../lib/constants";

/**
 * Resumen de compra con desglose
 * Antes de crear la compra la comisión es estimada.
 */
export default function CompraResumen({ items, total }) {
  const subtotal = items.reduce((acc, i) => acc + i.cantidad * i.precioUnitario, 0);
  const comision = Math.round((subtotal * COMISION_ESTIMADA) / 100);

  return (
    <div className="space-y-3">
      <ul className="space-y-2 text-sm">
        {items.map((i) => (
          <li key={i.nombreSector} className="flex items-center justify-between gap-3">
            <span className="text-ink-soft">
              Sector <strong className="text-ink">{i.nombreSector}</strong> × {i.cantidad}
            </span>
            <span className="font-semibold">{formatMoney(i.cantidad * i.precioUnitario)}</span>
          </li>
        ))}
      </ul>
      <div className="space-y-1.5 border-t border-container-high pt-3 text-sm">
        <p className="flex justify-between text-ink-soft">
          <span>Subtotal ({total}/{MAX_ENTRADAS_POR_COMPRA} entradas)</span>
          <span>{formatMoney(subtotal)}</span>
        </p>
        <p className="flex justify-between text-ink-soft">
          <span>Comisión de servicio ({COMISION_ESTIMADA}%)</span>
          <span>{formatMoney(comision)}</span>
        </p>
        <p className="flex justify-between pt-1 text-base font-extrabold text-navy-900">
          <span>Total estimado</span>
          <span className="display-tight">{formatMoney(subtotal + comision)}</span>
        </p>
        <p className="text-[11px] text-ink-faint">
          El total definitivo lo calcula el sistema al crear la compra.
        </p>
      </div>
    </div>
  );
}
