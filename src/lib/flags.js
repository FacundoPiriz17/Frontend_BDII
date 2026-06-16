/*
  Resolución de banderas por código FIFA.
  Las SVG viven en src/assets/flags/<CODIGO>.svg. Usamos import.meta.glob de
  Vite para construir un mapa { ARG: "/assets/ARG-xxxx.svg", ... }
  con las URLs ya resueltas por el bundler, sin imports manuales uno por uno.
*/
const modules = import.meta.glob("../assets/flags/*.svg", {
  eager: true,
  query: "?url",
  import: "default",
});

const flagsPorCodigo = Object.entries(modules).reduce((acc, [path, url]) => {
  const code = path.split("/").pop().replace(".svg", "").toUpperCase();
  acc[code] = url;
  return acc;
}, {});

/** Devuelve la URL de la bandera para un código FIFA, o null si no existe. */
export function flagUrl(codigoFifa) {
  if (!codigoFifa) return null;
  return flagsPorCodigo[String(codigoFifa).toUpperCase()] ?? null;
}

export const codigosConBandera = Object.keys(flagsPorCodigo);
