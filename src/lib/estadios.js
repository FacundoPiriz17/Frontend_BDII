import estadios from "../assets/data/estadios.json";

/*
  Mapa nombre_estadio -> imageUrl (desde assets/data/estadios.json).
  Normalizamos (minúsculas, sin acentos ni símbolos) para tolerar diferencias
  entre el nombre guardado en la BD y el del JSON (p. ej. "Levis"/"Levi's").
*/
const norm = (s) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");

const mapa = estadios.reduce((acc, e) => {
  if (e?.nombre_estadio && e?.imageUrl) acc[norm(e.nombre_estadio)] = e.imageUrl;
  return acc;
}, {});

const claves = Object.keys(mapa);

/** URL de la imagen del estadio por nombre, o null si no hay coincidencia. */
export function imagenEstadio(nombre) {
  if (!nombre) return null;
  const k = norm(nombre);
  if (!k) return null;
  if (mapa[k]) return mapa[k];
  const aprox = claves.find((m) => m.includes(k) || k.includes(m));
  return aprox ? mapa[aprox] : null;
}
