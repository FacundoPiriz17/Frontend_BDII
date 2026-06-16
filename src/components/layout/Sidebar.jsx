import { NavLink } from "react-router-dom";
import { cn } from "../../lib/cn";

/* Lista de navegación del panel operativo (admin / funcionario). */
export default function Sidebar({ sections, expanded = false, accent = "text-energy-500" }) {
  return (
    <nav className="flex h-full flex-col gap-5 px-3 py-4" aria-label="Panel">
      {sections.map((section) => (
        <div key={section.title ?? "main"}>
          {section.title && (
            <p
              className={cn(
                "mb-2 px-3 text-[11px] font-bold uppercase tracking-widest text-navy-300 transition-opacity duration-200",
                expanded ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}
            >
              {section.title}
            </p>
          )}
          <ul className="space-y-1.5">
            {section.items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  title={item.label}
                  className={({ isActive }) =>
                    cn(
                      "flex h-12 items-center rounded-xl font-semibold transition-colors",
                      isActive ? cn("bg-white/10", accent) : "text-navy-100 hover:bg-white/10 hover:text-white"
                    )
                  }
                >
                  <span className="flex w-14 shrink-0 items-center justify-center">
                    <item.icon className="size-5" aria-hidden />
                  </span>
                  <span
                    className={cn(
                      "truncate whitespace-nowrap pr-4 text-sm transition-opacity duration-200",
                      expanded ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    )}
                  >
                    {item.label}
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
