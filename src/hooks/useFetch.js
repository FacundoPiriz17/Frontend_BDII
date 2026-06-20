import { useCallback, useEffect, useState } from "react";

/**
 * Hook mínimo para data-fetching declarativo.
 * - `fetcher` DEBE estar memorizado con useCallback; sus dependencias (p. ej.
 *   filtros) definen cuándo se vuelve a pedir.
 */
export function useFetch(fetcher) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);

  const refetch = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    fetcher()
      .then((result) => {
        if (active) setData(result);
      })
      .catch((err) => {
        if (active) setError(err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [fetcher, version]);

  return { data, loading, error, refetch };
}
