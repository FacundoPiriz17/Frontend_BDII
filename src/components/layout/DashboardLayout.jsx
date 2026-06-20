import { useEffect, useRef, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  LuLayoutDashboard, LuCalendarDays, LuLandPlot, LuUsers,
  LuScanLine, LuHistory, LuLogOut, LuMenu, LuX, LuSmartphone, LuUser,
  LuShieldCheck, LuChevronDown,
} from "react-icons/lu";
import Sidebar from "./Sidebar";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { routePaths } from "../../routes/routePaths";
import Badge from "../ui/Badge";
import { cn } from "../../lib/cn";
import UcuLogoIcon from "../ui/UcuLogoIcon";

/* Layout de panel para Admin y Funcionario.*/
export default function DashboardLayout() {
  const { user, isAdmin, isFuncionario, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [perfilOpen, setPerfilOpen] = useState(false);
  const perfilRef = useRef(null);

  useEffect(() => {
    if (!perfilOpen) return;
    const onClick = (e) => perfilRef.current && !perfilRef.current.contains(e.target) && setPerfilOpen(false);
    const onEsc = (e) => e.key === "Escape" && setPerfilOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [perfilOpen]);

  const sections = [];
  if (isAdmin) {
    sections.push({
      title: "Administración",
      items: [
        { to: routePaths.admin, label: "Dashboard", icon: LuLayoutDashboard, end: true },
        { to: routePaths.adminEventos, label: "Eventos", icon: LuCalendarDays },
        { to: routePaths.adminEstadios, label: "Estadios", icon: LuLandPlot },
        { to: routePaths.adminUsuarios, label: "Usuarios", icon: LuUsers },
        { to: routePaths.adminDispositivos, label: "Dispositivos", icon: LuSmartphone },
        { to: routePaths.adminAuditoria, label: "Auditoría", icon: LuShieldCheck },
      ],
    });
  }
  if (isFuncionario) {
    sections.push({
      title: "Validación",
      items: [
        { to: routePaths.scanner, label: "Scanner", icon: LuScanLine },
        { to: routePaths.validaciones, label: "Historial", icon: LuHistory },
      ],
    });
  }

  const accent = isAdmin ? "text-energy-500" : "text-warn-500";

  const logo = (collapsible) => (
    <Link to={routePaths.home} className="flex h-16 items-center gap-3 px-5">
      <UcuLogoIcon
        className="size-9 rounded-lg bg-white/10 p-1.5 ring-1 ring-white/15"
        aria-hidden
      />
      <span
        className={cn(
          "leading-tight transition-opacity duration-200",
          collapsible ? "opacity-0 group-hover:opacity-100" : "opacity-100"
        )}
      >
        <span className="block whitespace-nowrap text-sm font-extrabold text-white display-tight">UCU Mundial</span>
        <span className="block whitespace-nowrap text-[10px] font-semibold uppercase tracking-widest text-navy-300">
          Centro de operaciones
        </span>
      </span>
    </Link>
  );

  return (
    <div className="flex min-h-dvh bg-surface">
      <aside className="group sticky top-0 z-30 hidden h-dvh w-20 shrink-0 flex-col border-r border-navy-900 bg-navy-950 shadow-xl transition-[width] duration-300 ease-in-out hover:w-64 lg:flex">
        {logo(true)}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-slim">
          <Sidebar sections={sections} accent={accent} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-container-high bg-white/85 px-4 backdrop-blur sm:px-6">
          <button className="rounded-lg p-2 hover:bg-container lg:hidden" onClick={() => setOpen(true)} aria-label="Abrir menú">
            <LuMenu className="size-5" />
          </button>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden items-center gap-1.5 sm:flex">
              {user?.roles?.map((r) => <Badge key={r} variant="navy">{r}</Badge>)}
            </div>

            {/* Menú de perfil */}
            <div className="relative" ref={perfilRef}>
              <button
                onClick={() => setPerfilOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-container-high bg-white py-1.5 pl-2 pr-3 text-sm font-semibold text-ink hover:border-navy-300 transition-colors"
                aria-expanded={perfilOpen}
                aria-haspopup="menu"
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-navy-950 text-xs font-extrabold text-energy-500">
                  {(user?.nombre || user?.email || "?").slice(0, 1).toUpperCase()}
                </span>
                <span className="hidden max-w-32 truncate sm:block">{user?.nombre || user?.email}</span>
                <LuChevronDown className={cn("size-4 text-ink-faint transition-transform", perfilOpen && "rotate-180")} />
              </button>
              <AnimatePresence>
                {perfilOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                    role="menu"
                    className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-container-high bg-white text-ink shadow-(--shadow-trust)"
                  >
                    <div className="border-b border-container-high px-4 py-3">
                      <p className="truncate text-sm font-bold">{user?.nombre}</p>
                      <p className="truncate text-xs text-ink-faint">{user?.email}</p>
                    </div>
                    <button
                      role="menuitem"
                      onClick={() => { setPerfilOpen(false); navigate(routePaths.perfil); }}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm hover:bg-container-low"
                    >
                      <LuUser className="size-4 text-ink-faint" /> Editar mis datos
                    </button>
                    <button
                      role="menuitem"
                      onClick={() => logout()}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-danger-600 hover:bg-danger-100/50"
                    >
                      <LuLogOut className="size-4" /> Cerrar sesión
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
          <Outlet />
        </main>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-navy-950/50" onClick={() => setOpen(false)} aria-hidden />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", duration: 0.35, bounce: 0 }}
              className="absolute inset-y-0 left-0 flex w-72 flex-col bg-navy-950 shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-navy-900 pr-3">
                {logo(false)}
                <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-navy-100 hover:bg-white/10" aria-label="Cerrar menú">
                  <LuX className="size-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto" onClick={() => setOpen(false)}>
                <Sidebar sections={sections} accent={accent} expanded />
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
