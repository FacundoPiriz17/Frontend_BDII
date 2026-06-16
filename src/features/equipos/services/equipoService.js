import { apiClient } from "../../../services/apiClient";
import { endpoints } from "../../../services/endpoints";
import { partidoService } from "../../partidos/services/partidoService";

/**
 * Servicio de la sección "Equipos". Reutiliza el catálogo de equipos
 * y la lista de eventos. Los partidos guardan el código FIFA en
 * equipoLocal/equipoVisitante, así que filtramos por ahí.
 */

export const equipoService = {
  listar: () => partidoService.equipos(),

  obtener: async (codigoFifa) => {
    const equipos = await partidoService.equipos();
    const code = String(codigoFifa).toUpperCase();
    return equipos.find((e) => e.codigoFifa?.toUpperCase() === code) ?? null;
  },

  /** Partidos en los que participa un equipo, ordenados por fecha/hora. */
  partidosDeEquipo: async (codigoFifa) => {
    const code = String(codigoFifa).toUpperCase();
    const eventos = await apiClient.get(endpoints.eventos.base, { params: { equipo: code } });
    return (eventos ?? [])
      .filter(
        (p) =>
          p.equipoLocal?.toUpperCase() === code || p.equipoVisitante?.toUpperCase() === code
      )
      .sort((a, b) => `${a.fecha}T${a.hora}`.localeCompare(`${b.fecha}T${b.hora}`));
  },
};
