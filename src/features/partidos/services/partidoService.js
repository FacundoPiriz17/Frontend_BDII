import { apiClient } from "../../../services/apiClient";
import { endpoints } from "../../../services/endpoints";

let equiposCache = null;

export const partidoService = {

  listar: (filtros) => apiClient.get(endpoints.eventos.base, { params: filtros }),

  obtener: (idPartido) => apiClient.get(endpoints.eventos.porId(idPartido)),

  crear: (datos) => apiClient.post(endpoints.eventos.base, datos),

  actualizar: (idPartido, datos) => apiClient.put(endpoints.eventos.porId(idPartido), datos),

  cambiarEstado: (idPartido, estado) =>
    apiClient.patch(endpoints.eventos.estado(idPartido), { estado }),

  disponibles: () => apiClient.get(endpoints.compras.partidosDisponibles),

  equipos: async () => {
    if (!equiposCache) {
      equiposCache = await apiClient.get(endpoints.infraestructura.equipos);
    }
    return equiposCache;
  },
};
