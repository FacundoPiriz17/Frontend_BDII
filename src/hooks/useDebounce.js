import { useEffect, useState } from "react";

/** Devuelve el valor luego de `delay` ms sin cambios (búsquedas). */
export function useDebounce(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
