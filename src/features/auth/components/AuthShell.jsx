import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LuShieldCheck } from "react-icons/lu";
import mundialLoginBg from "../../../assets/images/mundial-login-bg.jpg";
import UcuLogoIcon from "../../../components/ui/UcuLogoIcon";
import { routePaths } from "../../../routes/routePaths";
import { cn } from "../../../lib/cn";

/**
 * Split-screen de autenticación.
 * Al alternar login/registro cada panel entra deslizándose desde su lado.
 */

const textShadow = { textShadow: "0 2px 12px rgba(0, 0, 0, 0.75)" };

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
        <img
          src={mundialLoginBg}
          alt=""
          className="absolute inset-0 size-full object-cover object-[38%_center]"
          draggable="false"
        />
        <div className="absolute inset-0 bg-navy-950/22" />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950/45 via-navy-950/10 to-navy-950/55" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950/35 via-transparent to-navy-950/5" />
      </div>

      <Link to={routePaths.login} className="relative z-10 flex items-center gap-3">
        <UcuLogoIcon
          className="size-12 rounded-2xl bg-navy-950/75 p-2.5 ring-1 ring-white/15 backdrop-blur-sm"
          aria-hidden
        />
        <span>
          <span className="block text-xl font-extrabold display-tight" style={textShadow}>UCU Mundial</span>
          <span
            className="block text-xs font-extrabold uppercase tracking-widest text-white/95"
            style={textShadow}
          >
            Ticketing oficial · 2026
          </span>
        </span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="relative z-10"
      >
        <h2 className="max-w-md text-4xl font-extrabold leading-tight display-tight" style={textShadow}>
          {esRegistro ? (
            <>Sumate al <span className="text-energy-500">Mundial 2026.</span></>
          ) : (
            <>La cancha del mundo, <span className="text-energy-500">en tu bolsillo.</span></>
          )}
        </h2>
        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-white/15 bg-navy-950/35 p-4 shadow-lg backdrop-blur-md">
          <LuShieldCheck className="mt-0.5 size-5 shrink-0 text-ok-500" aria-hidden />
          <p className="text-sm font-semibold text-white/90" style={textShadow}>
            {esRegistro
              ? "Creá tu cuenta con tu email institucional UCU para comprar, recibir y transferir entradas de forma segura."
              : "Tus entradas son tokens dinámicos: el QR se regenera cada 30 segundos y cada transferencia queda registrada en su cadena de custodia."}
          </p>
        </div>
        <p className="mt-6 text-xs font-semibold text-white/90" style={textShadow}>
          © 2026 Universidad Católica del Uruguay
        </p>
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
            <UcuLogoIcon className="size-6 rounded-lg bg-white/10 p-1 ring-1 ring-white/10" aria-hidden />
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
