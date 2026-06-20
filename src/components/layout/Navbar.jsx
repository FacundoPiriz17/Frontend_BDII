import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  LuMenu, LuX, LuLogOut, LuUser, LuChevronDown,
  LuCalendarDays, LuArrowLeftRight, LuShoppingBag, LuHouse, LuUsers,
} from "react-icons/lu";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { routePaths } from "../../routes/routePaths";
import { cn } from "../../lib/cn";
import Badge from "../ui/Badge";
import NotificationBell from "../../features/notificaciones/components/NotificationBell";
import UcuLogoIcon from "../ui/UcuLogoIcon";

const linksComunes = [
  { to: routePaths.home, label: "Inicio", icon: LuHouse, end: true },
  { to: routePaths.partidos, label: "Partidos", icon: LuCalendarDays },
  { to: routePaths.equipos, label: "Equipos", icon: LuUsers },
];

const linksGenerales = [
  { to: routePaths.misEntradas, label: "Mis entradas", icon: UcuLogoIcon },
  { to: routePaths.misCompras, label: "Mis compras", icon: LuShoppingBag },
  { to: routePaths.transferencias, label: "Transferencias", icon: LuArrowLeftRight },
];

export default function Navbar() {
  const { user, logout, isGeneral } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const links = isGeneral ? [...linksComunes, ...linksGenerales] : linksComunes;

  const linkClass = ({ isActive }) =>
    cn(
      "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
      isActive ? "bg-white/10 text-energy-500" : "text-navy-100 hover:bg-white/5 hover:text-white"
    );

  return (
    <header className="sticky top-0 z-40 bg-navy-950 text-white shadow-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link to={routePaths.home} className="flex items-center gap-2.5">
          <UcuLogoIcon
            className="size-9 rounded-lg bg-white/10 p-1.5 ring-1 ring-white/15"
            aria-hidden
          />
          <span className="leading-tight">
            <span className="block text-base font-extrabold display-tight">UCU Mundial</span>
            <span className="block text-[10px] font-semibold uppercase tracking-widest text-navy-300">
              Ticketing 2026
            </span>
          </span>
        </Link>

        <nav className="ml-6 hidden items-center gap-1 lg:flex" aria-label="Principal">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <NotificationBell />

          <div className="relative hidden sm:block">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full bg-white/10 py-1.5 pl-2 pr-3 text-sm font-semibold hover:bg-white/15 transition-colors"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
            >
              <span className="flex size-7 items-center justify-center rounded-full bg-energy-500 text-xs font-extrabold text-navy-950">
                {(user?.nombre || user?.email || "?").slice(0, 1).toUpperCase()}
              </span>
              <span className="max-w-32 truncate">{user?.nombre || user?.email}</span>
              <LuChevronDown className={cn("size-4 transition-transform", menuOpen && "rotate-180")} />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl bg-white text-ink shadow-(--shadow-trust) border border-container-high"
                  role="menu"
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  <div className="border-b border-container-high px-4 py-3">
                    <p className="truncate text-sm font-bold">{user?.nombre}</p>
                    <p className="truncate text-xs text-ink-faint">{user?.email}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {user?.roles?.map((r) => <Badge key={r} variant="navy">{r}</Badge>)}
                    </div>
                  </div>
                  <button
                    role="menuitem"
                    onClick={() => { setMenuOpen(false); navigate(routePaths.perfil); }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm hover:bg-container-low"
                  >
                    <LuUser className="size-4 text-ink-faint" /> Mi perfil
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

          <button
            className="rounded-lg p-2 hover:bg-white/10 lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {mobileOpen ? <LuX className="size-6" /> : <LuMenu className="size-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/10 lg:hidden"
            aria-label="Principal móvil"
          >
            <div className="space-y-1 px-4 py-3">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold",
                      isActive ? "bg-white/10 text-energy-500" : "text-navy-100"
                    )
                  }
                >
                  <l.icon className="size-4" /> {l.label}
                </NavLink>
              ))}
              <div className="my-2 border-t border-white/10" />
              <NavLink to={routePaths.perfil} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-navy-100">
                <LuUser className="size-4" /> Mi perfil
              </NavLink>
              <button onClick={() => logout()} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-danger-500">
                <LuLogOut className="size-4" /> Cerrar sesión
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
