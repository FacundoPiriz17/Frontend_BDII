import { apiClient } from "../../../services/apiClient";
import { endpoints } from "../../../services/endpoints";

export const transferenciaService = {
  listar: (filtros) => apiClient.get(endpoints.transferencias.base, { params: filtros }),
  obtener: (id) => apiClient.get(endpoints.transferencias.porId(id)),
  crear: (idEntrada, emailDestino) =>
    apiClient.post(endpoints.transferencias.base, { idEntrada, emailDestino }),
  aceptar: (id) => apiClient.post(endpoints.transferencias.aceptar(id)),
  rechazar: (id) => apiClient.post(endpoints.transferencias.rechazar(id)),
  cancelar: (id) => apiClient.post(endpoints.transferencias.cancelar(id)),
};
