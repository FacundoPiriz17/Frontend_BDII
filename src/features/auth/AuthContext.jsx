import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authService } from "./services/authService";
import { setOnUnauthorized } from "../../services/apiClient";
import { storage, TOKEN_KEY } from "../../lib/storage";
import { normalizarRol, ROLES } from "../../lib/constants";
import { routePaths } from "../../routes/routePaths";
import { msUntilExpiry } from "../../lib/jwt";

export const AuthContext = createContext(null);

/* Aviso de sesión: redirigimos a la pantalla de renovación cuando faltan 5 minutos para que el JWT expire. */
const WARNING_OFFSET_MS = 5 * 60 * 1000;

/**
 * Estado global de sesión.
 * - A 5 min del vencimiento redirige a /sesion-expirada (renovar o salir).
 * - Si la API responde 401, limpia el token y muestra esa misma pantalla.
 */

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(() => storage.get(TOKEN_KEY));
  const [initializing, setInitializing] = useState(!!storage.get(TOKEN_KEY));
  const locationRef = useRef(location);
  locationRef.current = location;

  const aplicarPerfil = (perfil) => {
    const roles = (perfil?.roles ?? []).map(normalizarRol);
    setUser({ ...perfil, roles });
    return roles;
  };

  const setToken = useCallback((nuevo) => {
    if (nuevo) storage.set(TOKEN_KEY, nuevo);
    else storage.remove(TOKEN_KEY);
    setTokenState(nuevo ?? null);
  }, []);

  const logout = useCallback(
    (destino = routePaths.login) => {
      setToken(null);
      setUser(null);
      navigate(destino, { replace: true });
    },
    [navigate, setToken]
  );

  // Sesión expirada -> sacar token y mostrar pantalla dedicada
  useEffect(() => {
    setOnUnauthorized(() => {
      setToken(null);
      setUser(null);
      navigate(routePaths.sesionExpirada, { replace: true });
    });
    return () => setOnUnauthorized(null);
  }, [navigate, setToken]);

  useEffect(() => {
    const actual = storage.get(TOKEN_KEY);
    if (!actual) return;
    authService
      .me()
      .then(aplicarPerfil)
      .catch(() => setToken(null))
      .finally(() => setInitializing(false));
  }, [setToken]);

  // Aviso de expiración: a 5 min del vencimiento llevamos al usuario a la pantalla de renovación
  useEffect(() => {
    if (!token) return;
    const restante = msUntilExpiry(token);
    if (restante == null) return;

    const irAPantallaSesion = () => {
      if (locationRef.current?.pathname !== routePaths.sesionExpirada) {
        navigate(routePaths.sesionExpirada, {
          replace: true,
          state: { from: locationRef.current },
        });
      }
    };

    // Ya dentro de la ventana de aviso (o vencido): redirigir enseguida.
    if (restante <= WARNING_OFFSET_MS) {
      irAPantallaSesion();
      return;
    }

    const id = setTimeout(irAPantallaSesion, restante - WARNING_OFFSET_MS);
    return () => clearTimeout(id);
  }, [token, navigate]);

  const login = useCallback(
    async (email, password) => {
      const res = await authService.login(email, password);
      setToken(res.token);
      let perfil;
      try {
        perfil = await authService.me();
      } catch {
        perfil = { email: res.email, nombre: res.nombre, roles: res.roles };
      }
      return aplicarPerfil({ ...perfil, roles: perfil.roles ?? res.roles });
    },
    [setToken]
  );

  const register = useCallback(async (datos) => authService.register(datos), []);

  const refreshUser = useCallback(async () => {
    const perfil = await authService.me();
    aplicarPerfil(perfil);
  }, []);

  /** Renueva el JWT (pantalla de sesión por expirar). */
  const renewSession = useCallback(async () => {
    const res = await authService.refresh();
    setToken(res.token);
    return true;
  }, [setToken]);

  const value = useMemo(() => {
    const roles = user?.roles ?? [];
    return {
      user,
      token,
      initializing,
      isAuthenticated: !!user,
      roles,
      hasRole: (rol) => roles.includes(rol),
      isAdmin: roles.includes(ROLES.ADMIN),
      isFuncionario: roles.includes(ROLES.FUNCIONARIO),
      isGeneral: roles.includes(ROLES.GENERAL),
      login,
      register,
      logout,
      refreshUser,
      renewSession,
    };
  }, [user, token, initializing, login, register, logout, refreshUser, renewSession]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
