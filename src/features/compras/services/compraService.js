import { apiClient } from "../../../services/apiClient";
import { endpoints } from "../../../services/endpoints";

export const compraService = {

  crear: (entradas) => apiClient.post(endpoints.compras.base, { entradas }),

  listar: (filtros) => apiClient.get(endpoints.compras.base, { params: filtros }),
  obtener: (id) => apiClient.get(endpoints.compras.porId(id)),

  confirmar: (id) => apiClient.post(endpoints.compras.confirmar(id)),
  pagar: (id) => apiClient.post(endpoints.compras.pagar(id)),
  cancelar: (id) => apiClient.post(endpoints.compras.cancelar(id)),
};
