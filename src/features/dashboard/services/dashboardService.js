import { apiClient } from "../../../services/apiClient";
import { endpoints } from "../../../services/endpoints";

export const dashboardService = {
  homeGeneral: () => apiClient.get(endpoints.home.general),
  homeAdmin: () => apiClient.get(endpoints.home.admin),
  homeFuncionario: () => apiClient.get(endpoints.home.funcionario),

  eventosMasVendidos: (limit = 10) =>
    apiClient.get(endpoints.reportes.eventosMasVendidos, { params: { limit } }),
  mayoresCompradores: (limit = 10) =>
    apiClient.get(endpoints.reportes.mayoresCompradores, { params: { limit } }),
  ocupacionEventos: (limit = 10) =>
    apiClient.get(endpoints.reportes.ocupacionEventos, { params: { limit } }),
  resumenValidaciones: () => apiClient.get(endpoints.reportes.resumenValidaciones),
  auditoria: (tipo, limit = 150) =>
    apiClient.get(endpoints.reportes.auditoria, { params: { tipo: tipo || undefined, limit } }),
};
