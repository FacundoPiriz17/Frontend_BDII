import { apiClient } from "../../../services/apiClient";
import { endpoints } from "../../../services/endpoints";

export const entradaService = {

  misEntradas: (filtros) =>
    apiClient.get(endpoints.compras.misEntradas, { params: filtros }),

  obtener: (id) => apiClient.get(endpoints.entradas.porId(id)),

  vista: (id) => apiClient.get(endpoints.entradas.vista(id)),

  custodia: (id) => apiClient.get(endpoints.entradas.custodia(id)),

  generarQr: (id) => apiClient.post(endpoints.compras.generarQr(id)),
};
