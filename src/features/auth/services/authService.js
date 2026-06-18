import { apiClient } from "../../../services/apiClient";
import { endpoints } from "../../../services/endpoints";

export const authService = {

  login: (email, password) =>
    apiClient.post(endpoints.auth.login, { email, password }, { auth: false }),


  register: (datos) => apiClient.post(endpoints.auth.register, datos, { auth: false }),


  me: () => apiClient.get(endpoints.auth.me),


  refresh: () => apiClient.post(endpoints.auth.refresh),

  cambiarContrasena: (contrasenaActual, contrasenaNueva) =>
    apiClient.post(endpoints.auth.cambiarContrasena, { contrasenaActual, contrasenaNueva }),
};
