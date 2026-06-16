import { apiClient } from "../../../services/apiClient";
import { endpoints } from "../../../services/endpoints";

export const usuarioService = {
  listar: (filtros) => apiClient.get(endpoints.usuarios.base, { params: filtros }),
  obtener: (email) => apiClient.get(endpoints.usuarios.porEmail(email)),
  crear: (datos) => apiClient.post(endpoints.usuarios.base, datos),
  /** Edición del propio perfil (cualquier rol). No toca documento ni habilitación. */
  actualizarMiPerfil: (datos) => apiClient.put(endpoints.usuarios.miPerfil, datos),
  actualizar: (email, datos) => apiClient.put(endpoints.usuarios.porEmail(email), datos),
  cambiarHabilitacion: (email, habilitado) =>
    apiClient.patch(endpoints.usuarios.habilitacion(email), { habilitado }),
  actualizarRoles: (email, datos) => apiClient.put(endpoints.usuarios.roles(email), datos),
};
