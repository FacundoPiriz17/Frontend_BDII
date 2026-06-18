import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  LuBell, LuArrowLeftRight, LuCheck, LuX, LuInbox,
} from "react-icons/lu";
import { useNotificaciones } from "../hooks/useNotificaciones";
import { cn } from "../../../lib/cn";

const ICONO = {
  oferta: { icon: LuArrowLeftRight, clase: "bg-info-100 text-info-600" },
  aceptada: { icon: LuCheck, clase: "bg-ok-100 text-ok-600" },
  rechazada: { icon: LuX, clase: "bg-danger-100 text-danger-700" },
};

/** Campana de notificaciones del usuario general. */
export default function NotificationBell() {
  const navigate = useNavigate();
  const {
    items, todas, hayDescartadas, noLeidas,
    marcarTodasLeidas, descartar, restaurarTodas, habilitado,
  } = useNotificaciones();
  const [open, setOpen] = useState(false);
  const [verTodas, setVerTodas] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onEsc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  if (!habilitado) return null;

  const toggle = () => {
    setOpen((v) => {
      if (!v && noLeidas > 0) marcarTodasLeidas();
      return !v;
    });
  };

  const abrir = (n) => {
    setOpen(false);
    navigate(n.to);
  };

  const lista = verTodas ? todas : items;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggle}
        aria-label={`Notificaciones${noLeidas ? `, ${noLeidas} sin leer` : ""}`}
        aria-expanded={open}
        aria-haspopup="menu"
        className="relative flex size-9 items-center justify-center rounded-full text-navy-100 transition-colors hover:bg-white/10 hover:text-white"
      >
        <LuBell className="size-5" aria-hidden />
        {noLeidas > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex min-w-4.5 items-center justify-center rounded-full bg-energy-500 px-1 text-[10px] font-extrabold text-navy-950 ring-2 ring-navy-950">
            {noLeidas > 9 ? "9+" : noLeidas}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            role="menu"
            className="absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl border border-container-high bg-white text-ink shadow-(--shadow-trust)"
          >
            <div className="flex items-center justify-between border-b border-container-high px-4 py-3">
              <p className="text-sm font-extrabold">Notificaciones</p>
              {lista.length > 0 && (
                <span className="text-xs font-semibold text-ink-faint">{lista.length}</span>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto scroll-slim">
              {lista.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                  <span className="flex size-11 items-center justify-center rounded-full bg-container text-ink-faint">
                    <LuInbox className="size-5" aria-hidden />
                  </span>
                  <p className="text-sm font-semibold text-ink-soft">Sin novedades</p>
                  <p className="text-xs text-ink-faint">Te avisaremos cuando recibas o se resuelva una transferencia.</p>
                </div>
              ) : (
                <ul>
                  {lista.map((n) => {
                    const meta = ICONO[n.tipo] ?? ICONO.oferta;
                    const Icon = meta.icon;
                    return (
                      <li
                        key={n.id}
                        className={cn(
                          "group flex items-start gap-2 px-2 transition-colors hover:bg-container-low",
                          !n.leida && !n.descartada && "bg-energy-500/5",
                          n.descartada && "opacity-60"
                        )}
                      >
                        <button
                          role="menuitem"
                          onClick={() => abrir(n)}
                          className="flex min-w-0 flex-1 items-start gap-3 py-3 pl-2 text-left"
                        >
                          <span className={cn("mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full", meta.clase)}>
                            <Icon className="size-4" aria-hidden />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2">
                              <span className="truncate text-sm font-bold text-ink">{n.titulo}</span>
                              {!n.leida && !n.descartada && <span className="size-1.5 shrink-0 rounded-full bg-energy-500" aria-hidden />}
                            </span>
                            <span className="mt-0.5 block text-xs text-ink-soft">{n.descripcion}</span>
                            <span className="mt-1 block text-[11px] font-medium text-ink-faint">{n.fechaTexto}</span>
                          </span>
                        </button>
                        {!n.descartada && (
                          <button
                            onClick={() => descartar(n.id)}
                            aria-label="Descartar notificación"
                            className="mt-3 shrink-0 rounded-md p-1.5 text-ink-faint opacity-0 transition-opacity hover:bg-container hover:text-danger-600 group-hover:opacity-100"
                          >
                            <LuX className="size-3.5" />
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {(hayDescartadas || verTodas) && (
              <div className="border-t border-container-high px-4 py-2.5">
                <button
                  onClick={() => setVerTodas((v) => !v)}
                  className="text-xs font-bold text-navy-900 hover:underline"
                >
                  {verTodas ? "Ver solo recientes" : "Mostrar todas"}
                </button>
                {verTodas && hayDescartadas && (
                  <button onClick={restaurarTodas} className="ml-3 text-xs font-semibold text-ink-faint hover:text-ink">
                    Restaurar descartadas
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
