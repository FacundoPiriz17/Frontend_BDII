/* Si hay cambios en los endpoints cambiar acá */

export const endpoints = {
  auth: {
    login: "/api/auth/login",
    register: "/api/auth/register",
    me: "/api/auth/me",
    refresh: "/api/auth/refresh",
    cambiarContrasena: "/api/auth/cambiar-contrasena",
  },
  home: {
    general: "/api/home/general",
    admin: "/api/home/admin",
    funcionario: "/api/home/funcionario",
  },
  compras: {
    base: "/api/compras",
    porId: (id) => `/api/compras/${id}`,
    confirmar: (id) => `/api/compras/${id}/confirmar`,
    pagar: (id) => `/api/compras/${id}/pagar`,
    cancelar: (id) => `/api/compras/${id}/cancelar`,
    misEntradas: "/api/compras/mis-entradas",
    partidosDisponibles: "/api/compras/partidos-disponibles",
    generarQr: (idEntrada) => `/api/compras/entradas/${idEntrada}/qr`,
  },
  entradas: {
    porId: (id) => `/api/entradas/${id}`,
    custodia: (id) => `/api/entradas/${id}/custodia`,
    vista: (id) => `/api/entradas/${id}/vista`,
  },
  eventos: {
    base: "/api/eventos",
    porId: (id) => `/api/eventos/${id}`,
    estado: (id) => `/api/eventos/${id}/estado`,
  },
  transferencias: {
    base: "/api/transferencias",
    porId: (id) => `/api/transferencias/${id}`,
    aceptar: (id) => `/api/transferencias/${id}/aceptar`,
    rechazar: (id) => `/api/transferencias/${id}/rechazar`,
    cancelar: (id) => `/api/transferencias/${id}/cancelar`,
  },
  validaciones: {
    base: "/api/validaciones",
    porId: (id) => `/api/validaciones/${id}`,
    escanear: "/api/validaciones/escanear",
    invalidar: "/api/validaciones/invalidar",
    manualVerificar: "/api/validaciones/manual/verificar",
  },
  infraestructura: {
    estadios: "/api/infraestructura/estadios",
    estadioPorId: (id) => `/api/infraestructura/estadios/${id}`,
    sector: (idEstadio, nombre) =>
      `/api/infraestructura/estadios/${idEstadio}/sectores/${encodeURIComponent(nombre)}`,
    equipos: "/api/infraestructura/equipos",
    dispositivos: "/api/infraestructura/dispositivos",
    dispositivoPorId: (id) => `/api/infraestructura/dispositivos/${id}`,
    dispositivosMios: "/api/infraestructura/dispositivos/mios",
  },
  usuarios: {
    base: "/api/usuarios",
    miPerfil: "/api/usuarios/me",
    porEmail: (email) => `/api/usuarios/${encodeURIComponent(email)}`,
    habilitacion: (email) => `/api/usuarios/${encodeURIComponent(email)}/habilitacion`,
    roles: (email) => `/api/usuarios/${encodeURIComponent(email)}/roles`,
  },
  reportes: {
    eventosMasVendidos: "/api/reportes/eventos-mas-vendidos",
    mayoresCompradores: "/api/reportes/mayores-compradores",
    ocupacionEventos: "/api/reportes/ocupacion-eventos",
    resumenValidaciones: "/api/reportes/validaciones/resumen",
    auditoria: "/api/reportes/auditoria",
  },
};
