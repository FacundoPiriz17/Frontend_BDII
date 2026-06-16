/* Constantes de dominio alineadas al script SQL y al swagger */

export const ROLES = {
  ADMIN: "Admin",
  FUNCIONARIO: "Funcionario",
  GENERAL: "General",
};

/**
 * El backend puede devolver los roles con distintas convenciones
 * ("Admin", "admin", "ROLE_ADMIN", "Administrador"...). Normalizamos acá
 * para que el front no dependa del string exacto.
 */
export const normalizarRol = (rol = "") => {
  const r = rol.toLowerCase();
  if (r.includes("admin")) return ROLES.ADMIN;
  if (r.includes("func")) return ROLES.FUNCIONARIO;
  if (r.includes("gener")) return ROLES.GENERAL;
  return rol;
};

export const ESTADOS_COMPRA = ["pendiente", "confirmada", "paga", "cancelada"];
export const ESTADOS_ENTRADA = ["activa", "consumida", "cancelada"];
export const ESTADOS_TRANSFERENCIA = ["pendiente", "aceptada", "rechazada", "cancelada"];
export const ESTADOS_PARTIDO = ["no empezado", "empezado", "terminado"];
export const ESTADOS_VALIDACION = ["válida", "inválida"];

export const SECTORES = ["A", "B", "C", "D"];

export const FASES = [
  "Fase de grupos",
  "Dieciseisavos de final",
  "Octavos de final",
  "Cuartos de final",
  "Semifinal",
  "Final",
];

export const PAISES_SEDE = ["México", "EEUU", "Canadá"];

export const MAX_ENTRADAS_POR_COMPRA = 5;
export const MAX_TRANSFERENCIAS = 3;
export const COMISION_ESTIMADA = 5; // % vigente; el valor real lo devuelve el backend
export const QR_REFRESH_SEGUNDOS = 30;

export const DOMINIOS_EMAIL_VALIDOS = ["@correo.ucu.edu.uy", "@ucu.edu.uy"];

export const TIPOS_DOCUMENTO = ["CI", "Pasaporte", "DNI", "Otro"];
