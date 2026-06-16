import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LuTicket, LuShieldCheck } from "react-icons/lu";
import { routePaths } from "../../../routes/routePaths";
import { cn } from "../../../lib/cn";

/**
 * Split-screen de autenticación.
 * Al alternar login/registro cada panel entra deslizándose desde su lado
 */

export default function AuthShell({ title, subtitle, children, variant = "login" }) {
  const esRegistro = variant === "register";

  const Brand = (
    <motion.aside
      key={`brand-${variant}`}
      initial={{ opacity: 0, x: esRegistro ? 60 : -60 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", duration: 0.55, bounce: 0.18 }}
      className={cn(
        "relative hidden flex-col justify-between overflow-hidden bg-navy-950 p-10 text-white lg:flex",
        esRegistro ? "lg:order-2" : "lg:order-1"
      )}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 size-96 rounded-full bg-navy-800/60 blur-3xl" />
        <div className="absolute bottom-0 right-0 size-[28rem] rounded-full bg-energy-700/40 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#06321e]/70 to-transparent" />
      </div>

      <Link to={routePaths.login} className="relative flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-xl bg-white text-navy-950">
          <LuTicket className="size-6" aria-hidden />
        </span>
        <span>
          <span className="block text-xl font-extrabold display-tight">UCU Mundial</span>
          <span className="block text-xs font-semibold uppercase tracking-widest text-navy-300">
            Ticketing oficial · 2026
          </span>
        </span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="relative"
      >
        <h2 className="max-w-md text-4xl font-extrabold leading-tight display-tight">
          {esRegistro ? (
            <>Sumate al <span className="text-energy-500">Mundial 2026.</span></>
          ) : (
            <>La cancha del mundo, <span className="text-energy-500">en tu bolsillo.</span></>
          )}
        </h2>
        <div className="mt-8 flex items-start gap-3 rounded-2xl bg-white/5 p-4 backdrop-blur-sm border border-white/10">
          <LuShieldCheck className="mt-0.5 size-5 shrink-0 text-ok-500" aria-hidden />
          <p className="text-sm text-navy-100">
            {esRegistro
              ? "Creá tu cuenta con tu email institucional UCU para comprar, recibir y transferir entradas de forma segura."
              : "Tus entradas son tokens dinámicos: el QR se regenera cada 30 segundos y cada transferencia queda registrada en su cadena de custodia."}
          </p>
        </div>
        <p className="mt-6 text-xs text-navy-300">© 2026 Universidad Católica del Uruguay</p>
      </motion.div>
    </motion.aside>
  );

  const Form = (
    <main
      className={cn(
        "flex items-center justify-center px-4 py-10 sm:px-8",
        esRegistro ? "lg:order-1" : "lg:order-2"
      )}
    >
      <motion.div
        key={`form-${variant}`}
        initial={{ opacity: 0, x: esRegistro ? -40 : 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "spring", duration: 0.5, bounce: 0.15, delay: 0.05 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 lg:hidden">
          <span className="inline-flex items-center gap-2 rounded-xl bg-navy-950 px-3 py-2 text-white">
            <LuTicket className="size-4 text-energy-500" />
            <span className="text-sm font-extrabold display-tight">UCU Mundial</span>
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-ink display-tight">{title}</h1>
        {subtitle && <p className="mt-2 text-ink-soft">{subtitle}</p>}
        <div className="mt-8">{children}</div>
      </motion.div>
    </main>
  );

  return (
    <div className={cn("grid min-h-dvh", esRegistro ? "lg:grid-cols-[7fr_5fr]" : "lg:grid-cols-[5fr_7fr]")}>
      {Brand}
      {Form}
    </div>
  );
}
