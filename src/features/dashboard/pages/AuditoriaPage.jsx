import { useCallback, useState } from "react";
import { LuShieldCheck, LuShoppingBag, LuArrowLeftRight, LuScanLine } from "react-icons/lu";
import PageHeader from "../../../components/layout/PageHeader";
import Table from "../../../components/ui/Table";
import Badge from "../../../components/ui/Badge";
import ErrorMessage from "../../../components/feedback/ErrorMessage";
import { dashboardService } from "../services/dashboardService";
import { useFetch } from "../../../hooks/useFetch";
import { formatFechaHora, formatMoney } from "../../../lib/formatters";
import { cn } from "../../../lib/cn";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";

const TIPOS = [
  { value: "", label: "Todo", icon: LuShieldCheck },
  { value: "compra", label: "Compras", icon: LuShoppingBag },
  { value: "transferencia", label: "Transferencias", icon: LuArrowLeftRight },
  { value: "validacion", label: "Validaciones", icon: LuScanLine },
];

const ICONO_TIPO = {
  compra: { icon: LuShoppingBag, clase: "bg-info-100 text-info-600" },
  transferencia: { icon: LuArrowLeftRight, clase: "bg-navy-100 text-navy-900" },
  validacion: { icon: LuScanLine, clase: "bg-ok-100 text-ok-600" },
};

/** Registro total de auditoría: compras, transferencias y validaciones. */
export default function AuditoriaPage() {
  useDocumentTitle("Auditoría");
  const [tipo, setTipo] = useState("");

  const { data, loading, error, refetch } = useFetch(
    useCallback(() => dashboardService.auditoria(tipo || undefined), [tipo])
  );

  const columnas = [
    { key: "tipo", header: "Tipo", render: (r) => {
      const meta = ICONO_TIPO[r.tipo] ?? ICONO_TIPO.compra;
      const Icon = meta.icon;
      return (
        <span className="flex items-center gap-2">
          <span className={cn("flex size-7 items-center justify-center rounded-full", meta.clase)}>
            <Icon className="size-4" aria-hidden />
          </span>
          <span className="font-bold capitalize text-ink">{r.tipo}</span>
          <span className="text-xs text-ink-faint">#{r.idReferencia}</span>
        </span>
      );
    }},
    { key: "fecha", header: "Fecha", render: (r) => (
      <span className="text-sm tabular-nums text-ink-soft">{formatFechaHora(r.fecha)}</span>
    )},
    { key: "usuario", header: "Usuario / detalle", render: (r) => (
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-ink">{r.usuario}</p>
        {r.detalle && <p className="truncate text-xs text-ink-faint">{r.detalle}</p>}
      </div>
    )},
    { key: "estado", header: "Estado", align: "center", render: (r) => r.estado ? <Badge estado={r.estado} /> : <span className="text-ink-faint">—</span> },
    { key: "monto", header: "Monto", align: "right", render: (r) => (
      <span className="font-semibold">{r.monto != null ? formatMoney(r.monto) : "—"}</span>
    )},
  ];

  return (
    <>
      <PageHeader
        title="Auditoría"
        subtitle="Registro unificado de compras, transferencias y validaciones del sistema."
      />

      <div className="mb-6 flex flex-wrap gap-1.5" role="tablist" aria-label="Filtrar por tipo">
        {TIPOS.map((t) => (
          <button
            key={t.value || "todo"}
            role="tab"
            aria-selected={tipo === t.value}
            onClick={() => setTipo(t.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-bold transition-colors",
              tipo === t.value ? "bg-navy-900 text-white" : "bg-container text-ink-soft hover:bg-container-high"
            )}
          >
            <t.icon className="size-4" aria-hidden /> {t.label}
          </button>
        ))}
      </div>

      {error ? (
        <ErrorMessage error={error} onRetry={refetch} />
      ) : (
        <Table columns={columnas} rows={data ?? []} rowKey={(r) => `${r.tipo}-${r.idReferencia}`} loading={loading} />
      )}
    </>
  );
}
