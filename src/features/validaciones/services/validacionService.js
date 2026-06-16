import { apiClient } from "../../../services/apiClient";
import { endpoints } from "../../../services/endpoints";

export const validacionService = {
  listar: (filtros) => apiClient.get(endpoints.validaciones.base, { params: filtros }),
  obtener: (id) => apiClient.get(endpoints.validaciones.porId(id)),

  escanear: (idDispositivo, codigoEscaneado) =>
    apiClient.post(endpoints.validaciones.escanear, { idDispositivo, codigoEscaneado }),

  verificarManual: (idEntrada, numeroDocumento) =>
    apiClient.post(endpoints.validaciones.manualVerificar, {
      idEntrada: Number(idEntrada),
      numeroDocumento: Number(numeroDocumento),
    }),

  invalidar: (idDispositivo, idEntrada, codigoEscaneado) =>
    apiClient.post(endpoints.validaciones.invalidar, {
      idDispositivo,
      idEntrada: Number(idEntrada),
      codigoEscaneado,
    }),
};
