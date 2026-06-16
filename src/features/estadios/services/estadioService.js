import { apiClient } from "../../../services/apiClient";
import { endpoints } from "../../../services/endpoints";

export const estadioService = {
  listar: (pais) => apiClient.get(endpoints.infraestructura.estadios, { params: { pais } }),
  obtener: (id) => apiClient.get(endpoints.infraestructura.estadioPorId(id)),
  crear: (datos) => apiClient.post(endpoints.infraestructura.estadios, datos),
  actualizar: (id, datos) => apiClient.put(endpoints.infraestructura.estadioPorId(id), datos),
  actualizarSector: (idEstadio, nombreSector, datos) =>
    apiClient.put(endpoints.infraestructura.sector(idEstadio, nombreSector), datos),
};
