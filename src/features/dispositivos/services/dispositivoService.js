import { apiClient } from "../../../services/apiClient";
import { endpoints } from "../../../services/endpoints";

export const dispositivoService = {
  listar: (emailFuncionario) =>
    apiClient.get(endpoints.infraestructura.dispositivos, { params: { emailFuncionario } }),
  mios: () => apiClient.get(endpoints.infraestructura.dispositivosMios),
  obtener: (id) => apiClient.get(endpoints.infraestructura.dispositivoPorId(id)),
  crear: (datos) => apiClient.post(endpoints.infraestructura.dispositivos, datos),
  actualizar: (id, datos) => apiClient.put(endpoints.infraestructura.dispositivoPorId(id), datos),
};
