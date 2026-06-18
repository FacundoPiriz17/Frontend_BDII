export const routePaths = {
  // públicas
  login: "/login",
  registro: "/registro",
  noAutorizado: "/no-autorizado",
  sesionExpirada: "/sesion-expirada",

  // usuario general
  home: "/",
  partidos: "/partidos",
  partidoDetalle: (id = ":idPartido") => `/partidos/${id}`,
  equipos: "/equipos",
  equipoDetalle: (codigo = ":codigoFifa") => `/equipos/${codigo}`,
  comprar: (id = ":idPartido") => `/comprar/${id}`,
  misCompras: "/mis-compras",
  misEntradas: "/mis-entradas",
  entradaDetalle: (id = ":idEntrada") => `/entradas/${id}`,
  transferencias: "/transferencias",
  transferenciaNueva: "/transferencias/nueva",
  perfil: "/perfil",

  // funcionario
  scanner: "/scanner",
  validaciones: "/validaciones",

  // administrador
  admin: "/admin",
  adminEventos: "/admin/eventos",
  adminEventoNuevo: "/admin/eventos/nuevo",
  adminEventoEditar: (id = ":idPartido") => `/admin/eventos/${id}/editar`,
  adminEstadios: "/admin/estadios",
  adminEstadioNuevo: "/admin/estadios/nuevo",
  adminEstadioEditar: (id = ":idEstadio") => `/admin/estadios/${id}/editar`,
  adminUsuarios: "/admin/usuarios",
  adminDispositivos: "/admin/dispositivos",
  adminValidaciones: "/admin/validaciones",
  adminAuditoria: "/admin/auditoria",
};
