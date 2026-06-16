/*
  Utilidades mínimas para leer el JWT en el cliente.
  Solo lectura del payload para conocer el vencimiento; la verificación real
  de la firma la hace el backend.
*/

/** Decodifica el payload del JWT, o null si está mal formado. */
export function decodeToken(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

/** Timestamp de expiración del token, o null. */
export function getTokenExp(token) {
  const payload = decodeToken(token);
  return payload?.exp ?? null;
}

/** Milisegundos restantes hasta la expiración (puede ser negativo o null). */
export function msUntilExpiry(token) {
  const exp = getTokenExp(token);
  if (!exp) return null;
  return exp * 1000 - Date.now();
}
