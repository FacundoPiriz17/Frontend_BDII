import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from "recharts";
import { formatMoney } from "../../../lib/formatters";

/** Barras de eventos más vendidos*/
export default function EntradasVendidasChart({ data = [] }) {
  const chartData = data.map((e) => ({
    nombre: `${(e.equipoLocal || "?").slice(0, 3).toUpperCase()}–${(e.equipoVisitante || "?").slice(0, 3).toUpperCase()}`,
    entradas: e.entradasVendidas,
    monto: e.montoVendido,
  }));

  if (!chartData.length) {
    return <p className="py-10 text-center text-sm text-ink-soft">Sin datos de ventas todavía.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#dbe3f4" vertical={false} />
        <XAxis dataKey="nombre" tick={{ fontSize: 12, fill: "#434750" }} tickLine={false} axisLine={{ stroke: "#c4c6d1" }} />
        <YAxis tick={{ fontSize: 12, fill: "#747781" }} tickLine={false} axisLine={false} />
        <Tooltip
          cursor={{ fill: "rgba(0,23,58,0.04)" }}
          contentStyle={{ borderRadius: 12, border: "1px solid #dbe3f4", fontSize: 13 }}
          formatter={(value, name) => name === "monto" ? [formatMoney(value), "Recaudado"] : [value, "Entradas"]}
        />
        <Bar dataKey="entradas" radius={[6, 6, 0, 0]} maxBarSize={48}>
          {chartData.map((_, i) => <Cell key={i} fill={i === 0 ? "#00173a" : "#25467d"} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
