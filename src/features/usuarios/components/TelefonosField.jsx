import { useEffect, useRef, useState } from "react";
import { LuPlus, LuX, LuChevronDown } from "react-icons/lu";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import Flag from "../../../components/ui/Flag";
import { PREFIJOS_TELEFONICOS } from "../../../lib/prefijosTelefonicos";
import { cn } from "../../../lib/cn";

/**
 * Campo para agregar/quitar teléfonos con prefijo de país.
 * El selector de prefijo es un dropdown custom (no <select> nativo) para poder
 * mostrar la bandera del país junto al código. Valor guardado: "+<dial> <numero>".
 */
export default function TelefonosField({ telefonos = [], onChange, label = "Teléfonos" }) {
  const [sel, setSel] = useState(PREFIJOS_TELEFONICOS[0]);
  const [numero, setNumero] = useState("");
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onEsc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const agregar = () => {
    const limpio = numero.replace(/[\s()-]/g, "");
    if (!/^\d{6,12}$/.test(limpio)) {
      setError("Número inválido: solo dígitos (6 a 12).");
      return;
    }
    const completo = `+${sel.dial} ${limpio}`;
    setError(null);
    if (!telefonos.includes(completo)) onChange([...telefonos, completo]);
    setNumero("");
  };

  const quitar = (t) => onChange(telefonos.filter((x) => x !== t));

  return (
    <div>
      {label && <p className="mb-1.5 text-sm font-semibold text-ink">{label}</p>}
      <div className="flex flex-col gap-2 sm:flex-row">
        {/* Selector de prefijo con bandera */}
        <div className="relative sm:w-52" ref={ref}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={open}
            className="flex h-10 w-full items-center gap-2 rounded-lg border border-line bg-white px-3 text-sm text-ink transition-colors hover:border-navy-300 focus:outline-none focus:ring-2 focus:ring-navy-700/20"
          >
            <Flag codigo={sel.fifa} nombre={sel.pais} size="xs" />
            <span className="truncate">+{sel.dial}</span>
            <LuChevronDown className={cn("ml-auto size-4 text-ink-faint transition-transform", open && "rotate-180")} />
          </button>
          {open && (
            <ul
              role="listbox"
              className="absolute z-30 mt-1 max-h-64 w-64 overflow-y-auto scroll-slim rounded-xl border border-container-high bg-white py-1 shadow-(--shadow-trust)"
            >
              {PREFIJOS_TELEFONICOS.map((p) => (
                <li key={`${p.fifa}-${p.dial}`}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={sel.fifa === p.fifa}
                    onClick={() => { setSel(p); setOpen(false); }}
                    className={cn(
                      "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-container-low",
                      sel.fifa === p.fifa && "bg-container-low font-semibold"
                    )}
                  >
                    <Flag codigo={p.fifa} nombre={p.pais} size="xs" />
                    <span className="min-w-0 flex-1 truncate">{p.pais}</span>
                    <span className="text-ink-faint">+{p.dial}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Input
          className="flex-1"
          placeholder="99 123 456"
          inputMode="tel"
          maxLength={12}
          value={numero}
          error={error}
          onChange={(e) => setNumero(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); agregar(); } }}
        />
        <Button type="button" variant="secondary" onClick={agregar} aria-label="Agregar teléfono">
          <LuPlus className="size-4" />
        </Button>
      </div>

      {telefonos.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {telefonos.map((t) => (
            <li key={t} className="flex items-center gap-1.5 rounded-full bg-container px-3 py-1 text-sm font-semibold text-navy-900">
              {t}
              <button type="button" onClick={() => quitar(t)} aria-label={`Quitar ${t}`} className="text-ink-faint hover:text-danger-600">
                <LuX className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
