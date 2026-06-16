import { storage, TOKEN_KEY } from "../lib/storage";

const BASE_URL = import.meta.env.VITE_API_URL || "";

/** Error de API con la forma de ProblemDetails (RFC 7807) que emite .NET */
export class ApiError extends Error {
  constructor({ status, title, detail, problem }) {
    super(detail || title || `Error ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.title = title;
    this.detail = detail;
    this.problem = problem;
  }
}

/** Suscriptor para expulsar al usuario cuando el token expira (401). */
let onUnauthorized = null;
export const setOnUnauthorized = (fn) => {
  onUnauthorized = fn;
};

const buildQuery = (params) => {
  if (!params) return "";
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.append(k, v);
  });
  const s = qs.toString();
  return s ? `?${s}` : "";
};

async function request(path, { method = "GET", body, params, auth = true } = {}) {
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const token = storage.get(TOKEN_KEY);
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}${buildQuery(params)}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError({
      status: 0,
      title: "Sin conexión",
      detail: "No se pudo contactar al servidor. Verificá que el backend esté levantado.",
    });
  }

  if (res.status === 401 && auth && token) {
    onUnauthorized?.();
  }

  if (!res.ok) {
    let problem = null;
    try {
      problem = await res.json();
    } catch {
      /* respuesta sin cuerpo */
    }
    throw new ApiError({
      status: res.status,
      title: problem?.title || res.statusText,
      detail: problem?.detail || problem?.title,
      problem,
    });
  }

  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export const apiClient = {
  get: (path, opts) => request(path, { ...opts, method: "GET" }),
  post: (path, body, opts) => request(path, { ...opts, method: "POST", body }),
  put: (path, body, opts) => request(path, { ...opts, method: "PUT", body }),
  patch: (path, body, opts) => request(path, { ...opts, method: "PATCH", body }),
  delete: (path, opts) => request(path, { ...opts, method: "DELETE" }),
};
