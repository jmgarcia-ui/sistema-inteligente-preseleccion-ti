export type Credenciales = {
  correo: string;
  contrasena: string;
};

export type UsuarioAutenticado = {
  id: number;
  nombres: string;
  apellidos: string;
  correo: string;
  activo: boolean;
  rol: Rol;
};

export type Rol = "administrador" | "reclutador";

export type RespuestaToken = {
  token_acceso: string;
  tipo_token: string;
};
