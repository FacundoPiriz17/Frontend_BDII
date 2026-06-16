import { DOMINIOS_EMAIL_VALIDOS } from "./constants";

export const esRequerido = (v) =>
  v !== null && v !== undefined && String(v).trim() !== "";

/** Restringimos emails a dominios UCU  */
export const esEmailUcu = (email = "") => {
  const e = email.trim().toLowerCase();
  return DOMINIOS_EMAIL_VALIDOS.some((d) => e.endsWith(d)) && e.includes("@");
};

export const esEmailBasico = (email = "") => /^\S+@\S+\.\S+$/.test(email.trim());

export const esEnteroPositivo = (v) => Number.isInteger(Number(v)) && Number(v) > 0;

export const minLargo = (v, n) => String(v ?? "").trim().length >= n;
