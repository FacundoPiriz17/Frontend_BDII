import { useCallback } from "react";
import { useFetch } from "../../../hooks/useFetch";
import { partidoService } from "../services/partidoService";

/**
 * Equipos del mundial con índice por nombre y código FIFA,
 * para resolver escudos desde los strings que devuelve la API.
 */
export function useEquipos() {
  const { data, loading } = useFetch(useCallback(() => partidoService.equipos(), []));

  const buscar = (clave) => {
    if (!clave || !data) return null;
    const k = String(clave).toLowerCase();
    return (
      data.find((e) => e.codigoFifa?.toLowerCase() === k) ||
      data.find((e) => e.nombre?.toLowerCase() === k) ||
      null
    );
  };

  return { equipos: data ?? [], buscarEquipo: buscar, loading };
}
