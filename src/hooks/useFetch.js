import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Hook mínimo para data-fetching declarativo.
 * - `fetcher` debe estar memorizado (useCallback) o ser estable.
 * - Expone { data, loading, error, refetch }.
 */
export function useFetch(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const aliveRef = useRef(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      if (aliveRef.current) setData(result);
    } catch (err) {
      if (aliveRef.current) setError(err);
    } finally {
      if (aliveRef.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    aliveRef.current = true;
    load();
    return () => {
      aliveRef.current = false;
    };
  }, [load]);

  return { data, loading, error, refetch: load };
}
